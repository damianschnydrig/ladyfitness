"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { sendContactEmails } from "@/lib/mail";
import { checkRateLimit, consumeOneTimeFormToken, containsBlockedTerms, extractClientIp } from "@/lib/form-security";
import { getSupabaseServer } from "@/lib/supabase/server";
import { contactCreateSchema } from "@/lib/validations";

export type ContactActionResult =
  | { ok: true; id: string }
  | { ok: true; emailSent: true }
  | { ok: false; message: string; fields?: Record<string, string> };

function formToObject(formData: FormData) {
  return {
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    website: formData.get("website") || undefined,
    challenge: formData.get("_jsChallengeAnswer") || undefined,
  };
}

const SUBJECT_LABELS: Record<string, string> = {
  PROBETRAINING: "Probetraining",
  PERSONAL_TRAINING: "Personal Training",
  GENERAL: "Allgemeine Anfrage",
  CANCELLATION: "Kündigung",
};

export async function createContactInquiry(
  _prev: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  // Honeypot: Bot hat das versteckte Website-Feld ausgefüllt
  if (formData.get("website")) {
    return { ok: true, emailSent: true }; // stille Ablehnung
  }

  // Timing-Check: Formular muss mind. 5 Sekunden ausgefüllt worden sein
  const ts = formData.get("_ts");
  if (ts) {
    const loadedAt = parseInt(ts as string, 10);
    const elapsed = Date.now() - loadedAt;
    if (!Number.isFinite(loadedAt) || elapsed < 5000) {
      return {
        ok: false,
        message:
          "Ihre Anfrage konnte nicht gesendet werden. Bitte nehmen Sie sich kurz Zeit zum Ausfüllen des Formulars und versuchen Sie es erneut.",
      };
    }
  }

  // Einmaliges Form-Token (CSRF + Replay-Schutz)
  const formToken = formData.get("_formToken");
  if (!consumeOneTimeFormToken("contact", typeof formToken === "string" ? formToken : null)) {
    return { ok: true, emailSent: true }; // absichtlich still
  }

  // IP-basiertes Rate Limiting
  const h = await headers();
  const ip = extractClientIp(h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? h.get("cf-connecting-ip"));
  const rl = checkRateLimit(ip, "contact-form", 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      message: "Bitte versuchen Sie es später erneut.",
    };
  }

  // Unsichtbare JS-Challenge: nur prüfen, wenn JS den Modus aktiviert hat.
  if (formData.get("_jsChallengeEnabled") === "1") {
    const a = Number(formData.get("_jsChallengeA"));
    const b = Number(formData.get("_jsChallengeB"));
    const answer = Number(formData.get("_jsChallengeAnswer"));
    if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(answer) || answer !== a + b) {
      return {
        ok: false,
        message: "Bitte lösen Sie die Sicherheitsfrage korrekt.",
        fields: { challenge: "Antwort ist nicht korrekt." },
      };
    }
  }

  const parsed = contactCreateSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0] as string;
      if (key && !fields[key]) {
        fields[key] = issue.message;
      }
    }
    return {
      ok: false,
      message: "Bitte überprüfen Sie die markierten Felder.",
      fields,
    };
  }

  const d = parsed.data;
  if (containsBlockedTerms(d.message)) {
    return {
      ok: false,
      message: "Ihre Anfrage konnte nicht verarbeitet werden. Bitte formulieren Sie die Nachricht ohne Links oder Werbeinhalte.",
      fields: { message: "Bitte entfernen Sie werbliche oder verdächtige Begriffe." },
    };
  }

  // E-Mail ZUERST senden — das ist das Wichtigste
  let emailOk = false;
  try {
    await sendContactEmails({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email.trim(),
      phone: d.phone.trim(),
      subject: SUBJECT_LABELS[d.subject] ?? "Allgemeine Anfrage",
      message: d.message.trim(),
    });
    emailOk = true;
  } catch (mailErr) {
    console.error("[mail] Kontakt-E-Mails fehlgeschlagen:", mailErr);
  }

  // Dann in der Datenbank speichern (optional — kein Showstopper)
  const supabase = getSupabaseServer();
  try {
    const { data: row, error } = await supabase
      .from("contact_inquiries")
      .insert({
        first_name: d.firstName,
        last_name: d.lastName,
        email: d.email.trim().toLowerCase(),
        phone: d.phone.trim(),
        subject: SUBJECT_LABELS[d.subject] ?? "Allgemeine Anfrage",
        message: d.message.trim(),
        category: "GENERAL",
        status: "NEW",
      })
      .select("id")
      .single();

    if (!error && row) {
      revalidatePath("/admin");
      revalidatePath("/admin/contacts");
      return { ok: true, id: row.id };
    }

    console.warn("[contact] DB-Speichern nicht möglich:", error?.message);
  } catch (e) {
    console.warn("[contact] DB nicht verfügbar:", e);
  }

  // DB nicht verfügbar — aber E-Mail gesendet? Trotzdem Erfolg zeigen.
  if (emailOk) {
    return { ok: true, emailSent: true };
  }

  return {
    ok: false,
    message: "Ihre Anfrage konnte nicht gesendet werden. Bitte rufen Sie uns direkt an: 056 631 68 09.",
  };
}

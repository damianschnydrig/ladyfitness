"use server";

import { revalidatePath } from "next/cache";
import { sendContactEmails } from "@/lib/mail";
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
  };
}

export async function createContactInquiry(
  _prev: ContactActionResult | null,
  formData: FormData
): Promise<ContactActionResult> {
  // Honeypot: Bot hat das versteckte Website-Feld ausgefüllt
  if (formData.get("website")) {
    await new Promise((r) => setTimeout(r, 1200));
    return { ok: true, emailSent: true }; // Bot täuschen: scheinbarer Erfolg
  }

  // Timing-Check: Formular muss mind. 3 Sekunden ausgefüllt worden sein
  const ts = formData.get("_ts");
  if (ts) {
    const loadedAt = parseInt(ts as string, 10);
    const elapsed = Date.now() - loadedAt;
    if (elapsed < 3000) {
      await new Promise((r) => setTimeout(r, 1000));
      return { ok: true, emailSent: true }; // Bot täuschen
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

  // E-Mail ZUERST senden — das ist das Wichtigste
  let emailOk = false;
  try {
    await sendContactEmails({
      firstName: d.firstName,
      lastName: d.lastName,
      email: d.email.trim(),
      phone: d.phone.trim(),
      subject: d.subject.trim(),
      message: d.message.trim(),
    });
    emailOk = true;
  } catch (mailErr) {
    console.error("[mail] Kontakt-E-Mails fehlgeschlagen:", mailErr);
  }

  // Dann in der Datenbank speichern (optional — kein Showstopper)
  const supabase = getSupabaseServer();
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data: row, error } = await (supabase as any)
      .from("contact_inquiries")
      .insert({
        first_name: d.firstName,
        last_name: d.lastName,
        email: d.email.trim().toLowerCase(),
        phone: d.phone.trim(),
        subject: d.subject.trim(),
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

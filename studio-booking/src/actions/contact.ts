"use server";

import { revalidatePath } from "next/cache";
import { sendContactEmails } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { contactCreateSchema } from "@/lib/validations";

export type ContactActionResult =
  | { ok: true; id: string }
  | { ok: false; message: string };

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
  if (formData.get("website")) {
    return { ok: false, message: "Ihre Anfrage konnte nicht verarbeitet werden." };
  }

  const parsed = contactCreateSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Ungültige Eingaben." };
  }

  const d = parsed.data;

  try {
    const row = await prisma.contactInquiry.create({
      data: {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email.trim().toLowerCase(),
        phone: d.phone.trim(),
        subject: d.subject.trim(),
        message: d.message.trim(),
        category: "GENERAL",
        status: "NEW",
      },
    });

    try {
      await sendContactEmails({
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email.trim(),
        phone: d.phone.trim(),
        subject: d.subject.trim(),
        message: d.message.trim(),
      });
    } catch (mailErr) {
      console.error("[mail] Kontakt-E-Mails fehlgeschlagen:", mailErr);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/contacts");

    return { ok: true, id: row.id };
  } catch (e) {
    console.error(e);
    return { ok: false, message: "Speichern fehlgeschlagen. Bitte später erneut versuchen." };
  }
}

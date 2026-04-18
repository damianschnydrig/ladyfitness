import { render } from "@react-email/render";
import { Resend } from "resend";
import { CustomerBookingEmail } from "@/emails/CustomerBookingEmail";
import { CustomerContactEmail } from "@/emails/CustomerContactEmail";
import { generateOperatorBookingHtml, generateOperatorContactHtml } from "@/lib/operator-email-html";
import { BRAND } from "@/lib/constants";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

function mailFrom() {
  return (
    process.env.MAIL_FROM ??
    `"${BRAND.shortName}" <onboarding@resend.dev>`
  );
}

function operatorInbox() {
  const to = process.env.OPERATOR_EMAIL ?? BRAND.email;
  return to;
}

type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";

export async function sendBookingEmails(payload: {
  type: BookingType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whenLabel: string;
  notes?: string | null;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[mail] RESEND_API_KEY fehlt — Buchung gespeichert, aber kein E-Mail-Versand."
    );
    return;
  }

  const from = mailFrom();
  const operator = operatorInbox();

  const customerHtml = await render(
    CustomerBookingEmail({
      type: payload.type,
      firstName: payload.firstName,
      whenLabel: payload.whenLabel,
      notes: payload.notes,
    })
  );

  const operatorHtml = generateOperatorBookingHtml({
    type: payload.type,
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    whenLabel: payload.whenLabel,
    notes: payload.notes,
  });

  const subjectCustomer =
    payload.type === "PROBETRAINING"
      ? "Bestätigung: Ihr Probetraining bei Lady Fitness Bremgarten"
      : "Bestätigung: Ihr Personal Training bei Lady Fitness Bremgarten";

  const subjectOperator =
    payload.type === "PROBETRAINING"
      ? "[Lady Fitness] Neue Probetraining-Buchung"
      : "[Lady Fitness] Neue Personal-Training-Buchung";

  await resend.emails.send({
    from,
    to: payload.email,
    subject: subjectCustomer,
    html: customerHtml,
  });

  await resend.emails.send({
    from,
    to: operator,
    subject: subjectOperator,
    html: operatorHtml,
  });
}

export async function sendContactEmails(payload: {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
}) {
  const resend = getResend();
  if (!resend) {
    console.warn(
      "[mail] RESEND_API_KEY fehlt — Anfrage gespeichert, aber kein E-Mail-Versand."
    );
    return;
  }

  const from = mailFrom();
  const operator = operatorInbox();

  const customerHtml = await render(
    CustomerContactEmail({
      firstName: payload.firstName,
      subject: payload.subject,
    })
  );

  const operatorHtml = generateOperatorContactHtml({
    firstName: payload.firstName,
    lastName: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject,
    message: payload.message,
  });

  await resend.emails.send({
    from,
    to: payload.email,
    subject: "Wir haben Ihre Nachricht erhalten — Lady Fitness Bremgarten",
    html: customerHtml,
  });

  await resend.emails.send({
    from,
    to: operator,
    subject: `[Lady Fitness] Kontakt: ${payload.subject}`,
    html: operatorHtml,
  });
}

import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "@/emails/EmailLayout";
import { COLORS } from "@/lib/constants";

type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";

type Props = {
  type: BookingType;
  firstName: string;
  whenLabel: string;
  notes?: string | null;
};

const titles: Record<BookingType, string> = {
  PROBETRAINING: "Ihr Probetraining ist reserviert",
  PERSONAL_TRAINING: "Ihr Personal Training ist reserviert",
};

export function CustomerBookingEmail({
  type,
  firstName,
  whenLabel,
  notes,
}: Props) {
  const label =
    type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  return (
    <EmailLayout preview={titles[type]}>
      <Text style={heading}>{titles[type]}</Text>
      <Text style={body}>Guten Tag {firstName},</Text>
      <Text style={body}>
        vielen Dank für Ihre Anfrage bei Lady Fitness Bremgarten. Wir haben Ihr{" "}
        <strong>{label}</strong> wie folgt für Sie festgehalten:
      </Text>
      <Section
        style={{
          backgroundColor: COLORS.pinkLight,
          padding: "16px 18px",
          margin: "16px 0",
        }}
      >
        <Text style={{ ...body, margin: 0, fontWeight: 600, color: COLORS.dark }}>
          {whenLabel}
        </Text>
      </Section>
      {notes ? (
        <Text style={body}>
          <strong>Ihre Mitteilung:</strong>
          <br />
          {notes}
        </Text>
      ) : null}
      <Text style={body}>
        Wir freuen uns auf Sie. Bei Fragen erreichen Sie uns telefonisch unter{" "}
        <strong>056 631 68 09</strong> oder per E-Mail unter{" "}
        <strong>info@ladyfitness-bremgarten.ch</strong>.
      </Text>
      <Hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />
      <Text style={{ ...body, fontSize: "13px", color: COLORS.muted }}>
        Diese E-Mail wurde automatisch erstellt. Bitte antworten Sie nicht direkt
        auf diese Nachricht, falls der Absender eine No-Reply-Adresse ist —
        kontaktieren Sie uns über die oben genannten Kanäle.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "22px",
  fontWeight: 700 as const,
  color: COLORS.dark,
  margin: "0 0 16px",
  lineHeight: 1.3,
};

const body = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: COLORS.text,
  margin: "0 0 14px",
};

import { Hr, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "@/emails/EmailLayout";
import { COLORS } from "@/lib/constants";

type Props = {
  firstName: string;
  subject: string;
};

export function CustomerContactEmail({ firstName, subject }: Props) {
  return (
    <EmailLayout preview="Wir haben Ihre Nachricht erhalten">
      <Text style={heading}>Vielen Dank für Ihre Nachricht</Text>
      <Text style={body}>Guten Tag {firstName},</Text>
      <Text style={body}>
        wir haben Ihre Kontaktanfrage mit dem Betreff{" "}
        <strong>«{subject}»</strong> erhalten und werden uns so bald wie
        möglich bei Ihnen melden.
      </Text>
      <Text style={body}>
        Telefon: <strong>056 631 68 09</strong>
        <br />
        E-Mail: <strong>info@ladyfitness-bremgarten.ch</strong>
      </Text>
      <Hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />
      <Text style={{ ...body, fontSize: "13px", color: COLORS.muted }}>
        Herzliche Grüsse
        <br />
        Ihr Team von Lady Fitness Bremgarten
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "22px",
  fontWeight: 700 as const,
  color: COLORS.dark,
  margin: "0 0 16px",
};

const body = {
  fontSize: "15px",
  lineHeight: 1.6,
  color: COLORS.text,
  margin: "0 0 14px",
};

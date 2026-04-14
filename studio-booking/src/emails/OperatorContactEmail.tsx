import { Hr, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "@/emails/EmailLayout";
import { COLORS } from "@/lib/constants";

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export function OperatorContactEmail({
  firstName,
  lastName,
  email,
  phone,
  subject,
  message,
}: Props) {
  return (
    <EmailLayout preview={`Kontaktanfrage: ${subject}`}>
      <Text style={heading}>Neue Kontaktanfrage</Text>
      <Text style={badge}>KONTAKT</Text>
      <Text style={label}>Betreff</Text>
      <Text style={value}>{subject}</Text>
      <Text style={label}>Name</Text>
      <Text style={value}>
        {firstName} {lastName}
      </Text>
      <Text style={label}>E-Mail</Text>
      <Text style={value}>{email}</Text>
      <Text style={label}>Telefon</Text>
      <Text style={value}>{phone}</Text>
      <Text style={label}>Nachricht</Text>
      <Text style={{ ...value, whiteSpace: "pre-wrap" as const }}>{message}</Text>
      <Hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />
      <Text style={{ ...value, fontSize: "13px", color: COLORS.muted }}>
        Bitte im Admin unter «Kontakte» bearbeiten.
      </Text>
    </EmailLayout>
  );
}

const heading = {
  fontSize: "20px",
  fontWeight: 700 as const,
  color: COLORS.dark,
  margin: "0 0 12px",
};

const badge = {
  display: "inline-block",
  backgroundColor: COLORS.dark,
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700 as const,
  letterSpacing: "0.06em",
  padding: "6px 10px",
  margin: "0 0 16px",
};

const label = {
  fontSize: "11px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.08em",
  color: COLORS.muted,
  margin: "12px 0 4px",
};

const value = {
  fontSize: "15px",
  color: COLORS.text,
  margin: "0 0 4px",
  lineHeight: 1.55,
};

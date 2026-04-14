import { Hr, Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "@/emails/EmailLayout";
import { COLORS } from "@/lib/constants";

type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";

type Props = {
  type: BookingType;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whenLabel: string;
  notes?: string | null;
};

export function OperatorBookingEmail({
  type,
  firstName,
  lastName,
  email,
  phone,
  whenLabel,
  notes,
}: Props) {
  const kind =
    type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  return (
    <EmailLayout preview={`Neue Buchung: ${kind}`}>
      <Text style={heading}>Neue Buchung — {kind}</Text>
      <Text style={badge}>
        {type === "PROBETRAINING" ? "PROBETRAINING" : "PERSONAL TRAINING"}
      </Text>
      <Section style={{ marginTop: "16px" }}>
        <Text style={label}>Termin</Text>
        <Text style={value}>{whenLabel}</Text>
        <Text style={label}>Name</Text>
        <Text style={value}>
          {firstName} {lastName}
        </Text>
        <Text style={label}>E-Mail</Text>
        <Text style={value}>{email}</Text>
        <Text style={label}>Telefon</Text>
        <Text style={value}>{phone}</Text>
        {notes ? (
          <>
            <Text style={label}>Mitteilung</Text>
            <Text style={value}>{notes}</Text>
          </>
        ) : null}
      </Section>
      <Hr style={{ borderColor: COLORS.border, margin: "24px 0" }} />
      <Text style={{ ...value, fontSize: "13px", color: COLORS.muted }}>
        Sie können die Buchung im Admin-Bereich einsehen und verwalten.
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
  backgroundColor: COLORS.pink,
  color: "#ffffff",
  fontSize: "11px",
  fontWeight: 700 as const,
  letterSpacing: "0.06em",
  padding: "6px 10px",
  margin: "0 0 8px",
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
  lineHeight: 1.5,
};

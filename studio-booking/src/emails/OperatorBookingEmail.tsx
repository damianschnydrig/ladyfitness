import { Section, Text } from "@react-email/components";
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
  const kind = type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  const badgeText = type === "PROBETRAINING" ? "PROBETRAINING" : "PERSONAL TRAINING";

  return (
    <EmailLayout preview={`Neue Buchung — ${kind}: ${firstName} ${lastName}`}>

      {/* Eyebrow */}
      <Text style={eyebrow}>{badgeText}</Text>

      {/* Titel */}
      <Text style={heading}>Neue Buchung eingegangen</Text>

      <Text style={subText}>
        Ein Termin für <strong style={{ color: COLORS.dark }}>{kind}</strong> wurde
        über das Online-Buchungsformular reserviert.
      </Text>

      {/* Termin-Box */}
      <Section style={appointmentBox}>
        <Text style={appointmentLabel}>GEBUCHTER TERMIN</Text>
        <Text style={appointmentDate}>{whenLabel}</Text>
        <Text style={appointmentKind}>{kind}</Text>
      </Section>

      {/* Kundendaten-Box */}
      <Section style={darkCard}>
        <Text style={darkCardTitle}>Kundendaten</Text>

        <Text style={fieldLabel}>Name</Text>
        <Text style={fieldValue}>{firstName} {lastName}</Text>

        <Text style={fieldLabel}>E-Mail</Text>
        <Text style={{ ...fieldValue, color: COLORS.pink }}>{email}</Text>

        <Text style={fieldLabel}>Telefon</Text>
        <Text style={fieldValue}>{phone}</Text>
      </Section>

      {/* Mitteilung */}
      {notes ? (
        <Section style={notesBox}>
          <Text style={notesLabel}>Mitteilung des Kunden</Text>
          <Text style={notesText}>{notes}</Text>
        </Section>
      ) : null}

      {/* CTA-Hinweis */}
      <Section style={ctaBox}>
        <Text style={ctaText}>
          Buchung im Admin-Bereich unter <strong style={{ color: "#ffffff" }}>«Buchungen»</strong> einsehen und
          verwalten. Dem Kunden wurde automatisch eine Bestätigungsmail zugestellt.
        </Text>
      </Section>

    </EmailLayout>
  );
}

/* ── Styles ── */
const eyebrow: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  color: COLORS.pink,
  margin: "0 0 10px",
  textTransform: "uppercase",
};

const heading: React.CSSProperties = {
  fontSize: "26px",
  fontWeight: 700,
  color: COLORS.dark,
  margin: "0 0 8px",
  lineHeight: 1.25,
};

const subText: React.CSSProperties = {
  fontSize: "14px",
  color: COLORS.muted,
  margin: "0 0 20px",
  lineHeight: 1.5,
};

const appointmentBox: React.CSSProperties = {
  backgroundColor: COLORS.dark,
  padding: "22px 24px",
  margin: "0 0 4px",
};

const appointmentLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLORS.pink,
  margin: "0 0 8px",
};

const appointmentDate: React.CSSProperties = {
  fontSize: "20px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 4px",
  lineHeight: 1.3,
};

const appointmentKind: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.50)",
  margin: 0,
  letterSpacing: "0.04em",
};

const darkCard: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  padding: "22px 24px",
  margin: "0 0 20px",
};

const darkCardTitle: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: COLORS.pink,
  margin: "0 0 14px",
};

const fieldLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: "rgba(255,255,255,0.45)",
  margin: "10px 0 2px",
};

const fieldValue: React.CSSProperties = {
  fontSize: "15px",
  color: "#ffffff",
  margin: 0,
  lineHeight: 1.4,
};

const notesBox: React.CSSProperties = {
  backgroundColor: "#f8f4f6",
  borderLeft: `4px solid ${COLORS.pink}`,
  padding: "18px 20px",
  margin: "0 0 20px",
};

const notesLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: COLORS.pink,
  margin: "0 0 10px",
};

const notesText: React.CSSProperties = {
  fontSize: "15px",
  color: "#333333",
  lineHeight: 1.7,
  margin: 0,
  whiteSpace: "pre-wrap",
};

const ctaBox: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  padding: "16px 20px",
};

const ctaText: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.65)",
  margin: 0,
  lineHeight: 1.6,
};

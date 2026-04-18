import { Section, Text } from "@react-email/components";
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

const config: Record<BookingType, { title: string; label: string; badge: string }> = {
  PROBETRAINING: {
    title: "Ihr Probetraining ist reserviert",
    label: "Probetraining",
    badge: "PROBETRAINING",
  },
  PERSONAL_TRAINING: {
    title: "Ihr Personal Training ist reserviert",
    label: "Personal Training",
    badge: "PERSONAL TRAINING",
  },
};

export function CustomerBookingEmail({ type, firstName, whenLabel, notes }: Props) {
  const { title, label, badge } = config[type];

  return (
    <EmailLayout preview={`${title} — wir freuen uns auf Sie!`}>

      {/* Eyebrow */}
      <Text style={eyebrow}>{badge}</Text>

      {/* Titel */}
      <Text style={heading}>{title}</Text>

      {/* Anrede */}
      <Text style={body}>
        Guten Tag <strong>{firstName}</strong>,
      </Text>
      <Text style={body}>
        vielen Dank für Ihre Buchung bei Lady Fitness Bremgarten. Wir haben
        Ihr <strong>{label}</strong> erfolgreich für Sie reserviert — wir
        freuen uns auf Sie!
      </Text>

      {/* Termin-Box */}
      <Section style={appointmentBox}>
        <Text style={appointmentLabel}>IHR TERMIN</Text>
        <Text style={appointmentDate}>{whenLabel}</Text>
        <Text style={appointmentWhere}>
          Lady Fitness Bremgarten · Zürcherstrasse 7 · 5620 Bremgarten
        </Text>
      </Section>

      {/* Mitteilung */}
      {notes ? (
        <Section style={notesBox}>
          <Text style={notesLabel}>Ihre Mitteilung</Text>
          <Text style={notesText}>{notes}</Text>
        </Section>
      ) : null}

      {/* Hinweise */}
      <Text style={body}>
        Bitte bringen Sie bequeme Sportkleidung und Hallenschuhe mit.
        Bei Fragen oder falls Sie den Termin nicht wahrnehmen können,
        melden Sie sich bitte rechtzeitig bei uns.
      </Text>

      {/* Kontakt-Karte */}
      <Section style={contactCard}>
        <Text style={contactTitle}>Kontakt &amp; Anfahrt</Text>
        <Text style={contactLine}>
          <span style={{ color: COLORS.pink, fontWeight: 700 }}>Tel.</span>{" "}
          056 631 68 09
        </Text>
        <Text style={contactLine}>
          <span style={{ color: COLORS.pink, fontWeight: 700 }}>E-Mail</span>{" "}
          buchung@ladyfitness-bremgarten.ch
        </Text>
        <Text style={contactLine}>
          <span style={{ color: COLORS.pink, fontWeight: 700 }}>Adresse</span>{" "}
          Zürcherstrasse 7, 5620 Bremgarten
        </Text>
      </Section>

      {/* Gruss */}
      <Text style={{ ...body, marginTop: "28px" }}>
        Wir sehen uns beim Training!
      </Text>
      <Text style={{ ...body, marginBottom: 0 }}>
        Herzliche Grüsse
        <br />
        <strong style={{ color: COLORS.dark }}>Ihr Team von Lady Fitness Bremgarten</strong>
      </Text>

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
  margin: "0 0 20px",
  lineHeight: 1.25,
};

const body: React.CSSProperties = {
  fontSize: "15px",
  lineHeight: 1.7,
  color: "#333333",
  margin: "0 0 14px",
};

const appointmentBox: React.CSSProperties = {
  backgroundColor: COLORS.dark,
  padding: "22px 24px",
  margin: "20px 0",
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
  margin: "0 0 6px",
  lineHeight: 1.3,
};

const appointmentWhere: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.60)",
  margin: 0,
  lineHeight: 1.5,
};

const notesBox: React.CSSProperties = {
  backgroundColor: "#f8f4f6",
  borderLeft: `4px solid ${COLORS.pink}`,
  padding: "14px 18px",
  margin: "0 0 20px",
};

const notesLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  color: COLORS.muted,
  margin: "0 0 6px",
};

const notesText: React.CSSProperties = {
  fontSize: "14px",
  color: COLORS.dark,
  margin: 0,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const contactCard: React.CSSProperties = {
  backgroundColor: "#f8f4f6",
  padding: "18px 20px",
  margin: "16px 0",
  borderTop: `3px solid ${COLORS.pink}`,
};

const contactTitle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  letterSpacing: "0.10em",
  textTransform: "uppercase",
  color: COLORS.dark,
  margin: "0 0 10px",
};

const contactLine: React.CSSProperties = {
  fontSize: "14px",
  color: "#333333",
  margin: "0 0 6px",
  lineHeight: 1.5,
};

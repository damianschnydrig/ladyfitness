import { Section, Text } from "@react-email/components";
import * as React from "react";
import { EmailLayout } from "@/emails/EmailLayout";
import { COLORS } from "@/lib/constants";

type Props = {
  firstName: string;
  subject: string;
};

export function CustomerContactEmail({ firstName, subject }: Props) {
  return (
    <EmailLayout preview={`Ihre Nachricht ist angekommen, ${firstName}`}>

      {/* Eyebrow */}
      <Text style={eyebrow}>KONTAKTANFRAGE</Text>

      {/* Titel */}
      <Text style={heading}>Vielen Dank für Ihre Nachricht</Text>

      {/* Persönliche Anrede */}
      <Text style={body}>
        Guten Tag <strong>{firstName}</strong>,
      </Text>
      <Text style={body}>
        wir haben Ihre Anfrage mit dem Betreff{" "}
        <strong style={{ color: COLORS.dark }}>«{subject}»</strong> erhalten
        und werden uns so bald wie möglich persönlich bei Ihnen melden.
      </Text>

      {/* Info-Box */}
      <Section style={infoBox}>
        <Text style={infoBoxLabel}>Ihre Anfrage</Text>
        <Text style={infoBoxValue}>«{subject}»</Text>
        <Text style={infoBoxMeta}>
          Wir melden uns in der Regel innerhalb von 1–2 Werktagen.
        </Text>
      </Section>

      {/* Kontaktzeile */}
      <Text style={body}>
        Falls Sie dringende Fragen haben, erreichen Sie uns jederzeit:
      </Text>

      {/* Kontakt-Karte */}
      <Section style={contactCard}>
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
        Wir freuen uns darauf, Ihnen weiterzuhelfen.
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

const infoBox: React.CSSProperties = {
  backgroundColor: "#f8f4f6",
  borderLeft: `4px solid ${COLORS.pink}`,
  padding: "18px 20px",
  margin: "20px 0",
};

const infoBoxLabel: React.CSSProperties = {
  fontSize: "10px",
  fontWeight: 700,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color: COLORS.pink,
  margin: "0 0 6px",
};

const infoBoxValue: React.CSSProperties = {
  fontSize: "17px",
  fontWeight: 700,
  color: COLORS.dark,
  margin: "0 0 6px",
  lineHeight: 1.3,
};

const infoBoxMeta: React.CSSProperties = {
  fontSize: "13px",
  color: COLORS.muted,
  margin: 0,
  lineHeight: 1.5,
};

const contactCard: React.CSSProperties = {
  backgroundColor: COLORS.dark,
  padding: "18px 20px",
  margin: "16px 0",
};

const contactLine: React.CSSProperties = {
  fontSize: "14px",
  color: "rgba(255,255,255,0.85)",
  margin: "0 0 6px",
  lineHeight: 1.5,
};

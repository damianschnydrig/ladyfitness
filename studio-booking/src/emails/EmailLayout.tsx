import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";
import { BRAND, COLORS, brandLogoUrl } from "@/lib/constants";

type Props = {
  preview: string;
  children: React.ReactNode;
};

export function EmailLayout({ preview, children }: Props) {
  const logo = brandLogoUrl();

  return (
    <Html lang="de">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={body}>
        <Container style={wrapper}>

          {/* ── Header: dunkel mit Logo ── */}
          <Section style={header}>
            <Img
              src={logo}
              alt={BRAND.name}
              width={160}
              style={{ display: "block", margin: "0 auto" }}
            />
          </Section>

          {/* ── Pink-Akzentlinie ── */}
          <Section style={{ backgroundColor: COLORS.pink, height: "4px", padding: 0 }}>
            <Text style={{ fontSize: "0px", lineHeight: "4px", margin: 0 }}>&nbsp;</Text>
          </Section>

          {/* ── Content ── */}
          <Section style={content}>
            {children}
          </Section>

          {/* ── Footer ── */}
          <Section style={footer}>
            <Row>
              <Column style={{ textAlign: "center" as const }}>
                <Text style={footerBrand}>{BRAND.name}</Text>
                <Text style={footerAddress}>
                  {BRAND.address}
                </Text>
                <Text style={footerContact}>
                  Tel. {BRAND.phoneDisplay}&nbsp;&nbsp;·&nbsp;&nbsp;{BRAND.email}
                </Text>
                <Hr style={{ borderColor: "rgba(255,255,255,0.12)", margin: "16px 0 12px" }} />
                <Text style={footerLegal}>
                  Diese E-Mail wurde automatisch erstellt. Bei Fragen antworten Sie direkt
                  auf diese Nachricht oder kontaktieren Sie uns über die oben genannten Kanäle.
                </Text>
              </Column>
            </Row>
          </Section>

          {/* ── Bottom-Farbleiste ── */}
          <Section style={{ backgroundColor: COLORS.pink, height: "4px", padding: 0 }}>
            <Text style={{ fontSize: "0px", lineHeight: "4px", margin: 0 }}>&nbsp;</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

/* ── Basis-Styles ── */
const body: React.CSSProperties = {
  margin: 0,
  padding: "32px 0",
  backgroundColor: "#ede8eb",
  fontFamily:
    '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif',
};

const wrapper: React.CSSProperties = {
  maxWidth: "580px",
  margin: "0 auto",
  boxShadow: "0 2px 24px rgba(0,0,0,0.12)",
};

const header: React.CSSProperties = {
  backgroundColor: COLORS.dark,
  padding: "32px 40px",
  textAlign: "center",
};

const content: React.CSSProperties = {
  backgroundColor: "#ffffff",
  padding: "40px 40px 32px",
};

const footer: React.CSSProperties = {
  backgroundColor: "#1a1a1a",
  padding: "28px 40px",
};

const footerBrand: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 700,
  color: "#ffffff",
  margin: "0 0 4px",
  textAlign: "center",
};

const footerAddress: React.CSSProperties = {
  fontSize: "13px",
  color: "rgba(255,255,255,0.55)",
  margin: "0 0 4px",
  lineHeight: 1.5,
  textAlign: "center",
};

const footerContact: React.CSSProperties = {
  fontSize: "13px",
  color: COLORS.pink,
  margin: "0 0 4px",
  textAlign: "center",
};

const footerLegal: React.CSSProperties = {
  fontSize: "11px",
  color: "rgba(255,255,255,0.30)",
  margin: 0,
  lineHeight: 1.6,
  textAlign: "center",
};

import {
  Body,
  Container,
  Head,
  Html,
  Img,
  Preview,
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
      <Body
        style={{
          margin: 0,
          backgroundColor: COLORS.bgAlt,
          fontFamily:
            '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        }}
      >
        <Container
          style={{
            maxWidth: "560px",
            margin: "0 auto",
            padding: "32px 16px",
          }}
        >
          <Section
            style={{
              backgroundColor: "#ffffff",
              border: `1px solid ${COLORS.border}`,
              padding: "28px 24px",
            }}
          >
            <Img
              src={logo}
              alt={BRAND.name}
              width={180}
              height="auto"
              style={{ marginBottom: "20px" }}
            />
            {children}
            <Text
              style={{
                marginTop: "28px",
                fontSize: "12px",
                color: COLORS.muted,
                lineHeight: 1.5,
              }}
            >
              {BRAND.name}
              <br />
              {BRAND.address}
              <br />
              Tel. {BRAND.phoneDisplay} · {BRAND.email}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

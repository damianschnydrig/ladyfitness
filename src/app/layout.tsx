import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
import "./marketing.css";
import { BRAND, publicSiteUrl } from "@/lib/constants";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  variable: "--font-instrument",
  weight: ["400"],
});

export const metadata: Metadata = {
  title: {
    default: `${BRAND.name} — Frauenfitness mit persönlicher Betreuung`,
    template: `%s · ${BRAND.shortName}`,
  },
  description:
    "Lady Fitness Bremgarten — Frauenfitness in Bremgarten AG: Milon-Zirkel, Power Plate, Personal Training. QUALITOP, krankenkassenanerkannt. 365 Tage offen.",
  metadataBase: new URL(publicSiteUrl()),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH" className={`${dmSans.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

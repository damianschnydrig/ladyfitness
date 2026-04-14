import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";
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
    default: `${BRAND.name} — Buchen & Kontakt`,
    template: `%s · ${BRAND.shortName}`,
  },
  description:
    "Probetraining und Personal Training online buchen oder Kontakt aufnehmen — Lady Fitness Bremgarten.",
  metadataBase: new URL(publicSiteUrl()),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de-CH">
      <body
        className={`${dmSans.variable} ${instrumentSerif.variable} min-h-screen font-sans antialiased text-brand-dark bg-white`}
      >
        {children}
      </body>
    </html>
  );
}

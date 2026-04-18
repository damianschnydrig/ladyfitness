import type { NextConfig } from "next";

/** Alte statische URLs → aktuelle Next.js-Routen (301). */
const HTML_REDIRECTS = [
  "index",
  "angebot",
  "preise",
  "probetraining",
  "team",
  "betreuungszeiten",
  "bilder",
  "impressum",
  "datenschutz",
  "kontakt",
] as const;

const LEGACY_PATH_REDIRECTS: { source: string; destination: string }[] = [
  { source: "/book-appointment", destination: "/buchen" },
  { source: "/book-appointment/", destination: "/buchen" },
  { source: "/my-bookings", destination: "/buchen" },
  { source: "/my-bookings/", destination: "/buchen" },
  { source: "/community-class", destination: "/angebot" },
  { source: "/community-class/", destination: "/angebot" },
  { source: "/appointment-cancellation", destination: "/kontakt" },
  { source: "/appointment-cancellation/", destination: "/kontakt" },
  { source: "/danke", destination: "/kontakt/bestaetigung" },
  { source: "/danke/", destination: "/kontakt/bestaetigung" },
  { source: "/home-page-1", destination: "/" },
  { source: "/home-page-1/", destination: "/" },
  { source: "/beginer", destination: "/probetraining" },
  { source: "/beginer/", destination: "/probetraining" },
  { source: "/class-category/hatha", destination: "/angebot" },
  { source: "/class-category/hatha/", destination: "/angebot" },
  { source: "/class-category/flow", destination: "/angebot" },
  { source: "/class-category/flow/", destination: "/angebot" },
  { source: "/class-category/vinyasa", destination: "/angebot" },
  { source: "/class-category/vinyasa/", destination: "/angebot" },
];

const nextConfig: NextConfig = {
  output: "standalone",
  images: { unoptimized: true },
  // Kein basePath — Domain-Root = App-Root (Plesk).

  async redirects() {
    const fromHtml = HTML_REDIRECTS.map((slug) => ({
      source: `/${slug}.html`,
      destination: slug === "index" ? "/" : `/${slug}`,
      permanent: true as const,
    }));

    const fromLegacy = LEGACY_PATH_REDIRECTS.map((r) => ({
      ...r,
      permanent: true as const,
    }));

    return [...fromHtml, ...fromLegacy].filter(
      (r) => r.source.replace(/\/$/, "") !== r.destination.replace(/\/$/, ""),
    );
  },
};

export default nextConfig;

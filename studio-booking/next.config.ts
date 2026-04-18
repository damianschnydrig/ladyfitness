import type { NextConfig } from "next";

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
];

const nextConfig: NextConfig = {
  images: { unoptimized: true },

  async redirects() {
    return [
      // .html → saubere URLs (SEO 301)
      ...HTML_REDIRECTS.map((slug) => ({
        source: `/${slug}.html`,
        destination: slug === "index" ? "/" : `/${slug}`,
        permanent: true,
      })),
      // Alte Subdomain-Buchungs-Links (falls direkt aufgerufen)
      {
        source: "/buchen",
        destination: "/buchen",
        permanent: false,
        has: [],
      },
    ].filter((r) => r.source !== r.destination);
  },
};

export default nextConfig;

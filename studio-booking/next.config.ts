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
  output: "standalone",
  images: { unoptimized: true },

  async redirects() {
    return [
      ...HTML_REDIRECTS.map((slug) => ({
        source: `/${slug}.html`,
        destination: slug === "index" ? "/" : `/${slug}`,
        permanent: true,
      })),
    ].filter((r) => r.source !== r.destination);
  },
};

export default nextConfig;

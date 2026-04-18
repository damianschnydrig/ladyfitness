import type { MetadataRoute } from "next";

const BASE = "https://ladyfitness-bremgarten.ch";

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const paths = [
    "",
    "/angebot",
    "/preise",
    "/probetraining",
    "/team",
    "/betreuungszeiten",
    "/bilder",
    "/impressum",
    "/datenschutz",
    "/kontakt",
    "/buchen",
  ];

  return paths.map((path) => ({
    url: `${BASE}${path || "/"}`,
    lastModified,
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
  }));
}

export const BRAND = {
  name: "Lady Fitness Bremgarten",
  shortName: "Lady Fitness",
  address: "Zürcherstrasse 7, 5620 Bremgarten",
  phone: "+41 56 631 68 09",
  phoneDisplay: "056 631 68 09",
  email: "buchung@ladyfitness-bremgarten.ch",
  instagram: "https://www.instagram.com/ladyfitnessbremgarten",
  staticSiteUrl: "https://ladyfitness-bremgarten.ch",
} as const;

export const COLORS = {
  pink: "#e6007e",
  pinkDark: "#c4006a",
  pinkLight: "#fce4f1",
  dark: "#111111",
  text: "#1a1a1a",
  muted: "#6b6b6b",
  border: "#e0d6da",
  bgAlt: "#f5f0f2",
} as const;

export function publicSiteUrl() {
  let url = (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3001")
    .trim()
    .replace(/\/$/, "");
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }
  try {
    void new URL(url);
    return url;
  } catch {
    return "http://localhost:3001";
  }
}

export function brandLogoUrl() {
  return (
    process.env.NEXT_PUBLIC_BRAND_LOGO_URL ??
    `${BRAND.staticSiteUrl}/images/logo.png`
  );
}

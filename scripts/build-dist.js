/**
 * Baut den Ordner `dist/` für Repo2web und ähnliche Tools, die nach
 * `npm run build` einen `dist`-Ordner erwarten.
 * Enthält nur die statische Website (ohne studio-booking, node_modules).
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

const files = [
  "index.html",
  "angebot.html",
  "betreuungszeiten.html",
  "bilder.html",
  "datenschutz.html",
  "impressum.html",
  "kontakt.html",
  "preise.html",
  "probetraining.html",
  "team.html",
  "components.js",
  "script.js",
  "styles.css",
  "robots.txt",
  "sitemap.xml",
];

const dirs = [
  "images",
  "appointment-cancellation",
  "beginer",
  "book-appointment",
  "class-category",
  "community-class",
  "danke",
  "home-page-1",
  "my-bookings",
];

function main() {
  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  for (const name of files) {
    const src = path.join(root, name);
    if (!fs.existsSync(src)) {
      console.warn("Hinweis: fehlt (übersprungen):", name);
      continue;
    }
    fs.copyFileSync(src, path.join(dist, name));
  }

  for (const name of dirs) {
    const src = path.join(root, name);
    if (!fs.existsSync(src)) {
      console.warn("Hinweis: Ordner fehlt (übersprungen):", name);
      continue;
    }
    fs.cpSync(src, path.join(dist, name), { recursive: true });
  }

  console.log("OK: dist/ erstellt unter", dist);
}

main();

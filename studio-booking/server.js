/**
 * Plesk / Node: Anwendungsstartdatei = diese Datei (server.js).
 *
 * Startet die App im normalen Next.js-Produktionsmodus (`next start`).
 * Voraussetzung: `npm run build` (erzeugt `.next/`).
 */
const { spawnSync } = require("child_process");
const path = require("path");

const nextBin = path.join(__dirname, "node_modules", "next", "dist", "bin", "next");

const result = spawnSync(process.execPath, [nextBin, "start", "-p", process.env.PORT || "3000"], {
  stdio: "inherit",
  env: process.env,
});

process.exit(result.status ?? 1);

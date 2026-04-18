/**
 * Spiegelt die statische Website aus dem Repo-Root nach dist/httpdocs-static/
 * (HTML, CSS, JS, Bilder, Unterordner) — vergleichbar mit klassischem /httpdocs-FTP.
 * Liegt NEBEN dem Next-Standalone-Build in dist/, damit ein Build beides liefert.
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const dest = path.join(root, "dist", "httpdocs-static");

const EXCLUDE_NAMES = new Set([
  ".git",
  ".cursor",
  "node_modules",
  "studio-booking",
  "dist",
]);

const EXCLUDE_FILE_PREFIX = [".env"];

function shouldCopyBaseName(name) {
  if (EXCLUDE_NAMES.has(name)) return false;
  if (name.endsWith(".zip")) return false;
  if (name === "ZUGANGSDATEN.md") return false;
  if (EXCLUDE_FILE_PREFIX.some((p) => name.startsWith(p))) return false;
  return true;
}

function copyRecursive(src, dst) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const ent of fs.readdirSync(src, { withFileTypes: true })) {
      if (!shouldCopyBaseName(ent.name)) continue;
      copyRecursive(path.join(src, ent.name), path.join(dst, ent.name));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

function main() {
  if (!fs.existsSync(path.join(root, "dist", "server.js"))) {
    console.error(
      "Fehler: dist/server.js fehlt — zuerst vollständig: npm run build (inkl. build-dist).",
    );
    process.exit(1);
  }

  fs.rmSync(dest, { recursive: true, force: true });
  fs.mkdirSync(dest, { recursive: true });

  for (const ent of fs.readdirSync(root, { withFileTypes: true })) {
    if (!shouldCopyBaseName(ent.name)) continue;
    copyRecursive(path.join(root, ent.name), path.join(dest, ent.name));
  }

  console.log(
    "OK: dist/httpdocs-static/ — FTP-Spiegel der Root-Website (ohne Next.js-Quellordner)",
  );
}

main();

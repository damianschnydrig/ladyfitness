/**
 * Erstellt dist/ als EINEN lauffaehigen Next-Standalone-Ordner.
 * Zielstruktur in dist/: server.js, .next, public, package.json, node_modules.
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.resolve(__dirname, "..");
const app = path.join(root, "studio-booking");
const standaloneRoot = path.join(app, ".next", "standalone");
const appInStandalone = path.join(standaloneRoot, "studio-booking");
const dist = path.join(root, "dist");

function robocopy(src, dest) {
  const r = spawnSync(
    "robocopy",
    [src, dest, "/E", "/NFL", "/NDL", "/NJH", "/NJS", "/NC", "/NS"],
    { stdio: "inherit", shell: false },
  );
  if (r.error) throw r.error;
  if (r.status !== undefined && r.status >= 8) {
    console.error("robocopy fehlgeschlagen, Exit:", r.status);
    process.exit(1);
  }
}

function main() {
  if (!fs.existsSync(path.join(appInStandalone, "server.js"))) {
    console.error(
      "Fehler: .next/standalone/studio-booking/server.js fehlt. Zuerst: npm run build:next",
    );
    process.exit(1);
  }

  const staticSrc = path.join(app, ".next", "static");
  if (!fs.existsSync(staticSrc)) {
    console.error("Fehler: .next/static fehlt.");
    process.exit(1);
  }

  fs.rmSync(dist, { recursive: true, force: true });
  fs.mkdirSync(dist, { recursive: true });

  // 1) App-Dateien (server.js, .next, public, package.json) in dist root
  if (process.platform === "win32") {
    robocopy(appInStandalone, dist);
  } else {
    fs.cpSync(appInStandalone, dist, { recursive: true });
  }

  // 2) Standalone node_modules liegt eine Ebene hoeher -> nach dist/node_modules
  const standaloneNodeModules = path.join(standaloneRoot, "node_modules");
  if (fs.existsSync(standaloneNodeModules)) {
    const distNodeModules = path.join(dist, "node_modules");
    fs.rmSync(distNodeModules, { recursive: true, force: true });
    if (process.platform === "win32") {
      robocopy(standaloneNodeModules, distNodeModules);
    } else {
      fs.cpSync(standaloneNodeModules, distNodeModules, { recursive: true });
    }
  }

  // 3) .next/static aus dem Originalbuild auf den erwarteten Ort kopieren
  const staticDest = path.join(dist, ".next", "static");
  fs.rmSync(staticDest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });

  if (process.platform === "win32") {
    robocopy(staticSrc, staticDest);
  } else {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  }

  // 4) Sicherstellen, dass public aktuell ist
  const publicSrc = path.join(app, "public");
  if (fs.existsSync(publicSrc)) {
    const publicDest = path.join(dist, "public");
    fs.rmSync(publicDest, { recursive: true, force: true });
    if (process.platform === "win32") {
      robocopy(publicSrc, publicDest);
    } else {
      fs.cpSync(publicSrc, publicDest, { recursive: true });
    }
  }

  // 5) Geheimnisse entfernen
  const envInDist = path.join(dist, ".env");
  if (fs.existsSync(envInDist)) {
    fs.rmSync(envInDist, { force: true });
  }
  const envInRoot = path.join(dist, ".env");
  if (fs.existsSync(envInRoot)) {
    fs.rmSync(envInRoot, { force: true });
  }

  // 6) Falls von frueheren Laeufen noch verschachtelt vorhanden, entfernen
  const nestedApp = path.join(dist, "studio-booking");
  if (fs.existsSync(nestedApp)) {
    fs.rmSync(nestedApp, { recursive: true, force: true });
  }

  console.log("OK: dist/ ist jetzt ein kompletter App-Ordner (server.js im Root)");
}

main();

/**
 * Erstellt dist/ aus dem kompletten Next-Standalone-Ordner (Workspaces: node_modules liegt eine Ebene über der App).
 * Eine gebaute App — Marketing, Buchen, Admin, APIs.
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

  if (process.platform === "win32") {
    robocopy(standaloneRoot, dist);
  } else {
    fs.cpSync(standaloneRoot, dist, { recursive: true });
  }

  const staticDest = path.join(dist, "studio-booking", ".next", "static");
  fs.rmSync(staticDest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });

  if (process.platform === "win32") {
    robocopy(staticSrc, staticDest);
  } else {
    fs.cpSync(staticSrc, staticDest, { recursive: true });
  }

  const publicSrc = path.join(app, "public");
  if (fs.existsSync(publicSrc)) {
    const publicDest = path.join(dist, "studio-booking", "public");
    fs.rmSync(publicDest, { recursive: true, force: true });
    if (process.platform === "win32") {
      robocopy(publicSrc, publicDest);
    } else {
      fs.cpSync(publicSrc, publicDest, { recursive: true });
    }
  }

  const envInDist = path.join(dist, "studio-booking", ".env");
  if (fs.existsSync(envInDist)) {
    fs.rmSync(envInDist, { force: true });
  }
  const envInRoot = path.join(dist, ".env");
  if (fs.existsSync(envInRoot)) {
    fs.rmSync(envInRoot, { force: true });
  }

  console.log("OK: dist/ = Next.js standalone (komplett inkl. node_modules):", dist);
  console.log("    Plesk: App-Stamm = Unterordner studio-booking, Startdatei = server.js");
}

main();

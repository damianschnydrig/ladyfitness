/**
 * Next.js standalone enthält server.js + node_modules, aber NICHT automatisch:
 * - .next/static (CSS, Chunks unter /_next/static/…)
 * - public (Bilder, favicon, …)
 *
 * Dieses Skript legt beides unter .next/standalone/<appName>/ ab, damit
 * `node server.js` (Launcher im App-Root) alle Assets ausliefert.
 *
 * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/output
 */
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

const appRoot = path.resolve(__dirname, "..");
const pkg = require(path.join(appRoot, "package.json"));
const appName = pkg.name;

const standaloneAppDir = path.join(
  appRoot,
  ".next",
  "standalone",
  appName,
);

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

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.error("copy-standalone-assets: fehlt:", src);
    process.exit(1);
  }
  fs.mkdirSync(dest, { recursive: true });
  if (process.platform === "win32") {
    robocopy(src, dest);
  } else {
    fs.cpSync(src, dest, { recursive: true });
  }
}

function main() {
  if (!fs.existsSync(path.join(standaloneAppDir, "server.js"))) {
    console.error(
      "copy-standalone-assets: Standalone fehlt. Zuerst: next build (output: standalone)",
    );
    console.error("  Erwartet:", standaloneAppDir);
    process.exit(1);
  }

  const staticSrc = path.join(appRoot, ".next", "static");
  const staticDest = path.join(standaloneAppDir, ".next", "static");
  fs.rmSync(staticDest, { recursive: true, force: true });
  fs.mkdirSync(path.dirname(staticDest), { recursive: true });
  copyDir(staticSrc, staticDest);
  console.log("copy-standalone-assets: .next/static → standalone OK");

  const publicSrc = path.join(appRoot, "public");
  const publicDest = path.join(standaloneAppDir, "public");
  if (fs.existsSync(publicSrc)) {
    fs.rmSync(publicDest, { recursive: true, force: true });
    copyDir(publicSrc, publicDest);
    console.log("copy-standalone-assets: public → standalone OK");
  } else {
    console.warn("copy-standalone-assets: kein public/ — übersprungen");
  }

  console.log("copy-standalone-assets: fertig");
}

main();

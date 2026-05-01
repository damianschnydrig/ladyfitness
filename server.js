const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

/**
 * Prüft ob seit dem letzten Build neue Code per git pull kam.
 * .git/FETCH_HEAD wird bei jedem `git pull` aktualisiert.
 * .next/BUILD_ID wird bei jedem `npm run build` aktualisiert.
 * Falls FETCH_HEAD neuer als BUILD_ID → neuer Build nötig.
 */
function needsBuild() {
  const buildId = path.join(__dirname, ".next/BUILD_ID");
  const fetchHead = path.join(__dirname, ".git/FETCH_HEAD");

  if (!fs.existsSync(buildId)) {
    console.log("> .next/BUILD_ID fehlt – Build erforderlich");
    return true;
  }

  if (!fs.existsSync(fetchHead)) {
    console.log("> .git/FETCH_HEAD fehlt – kein Build-Check möglich");
    return false;
  }

  const buildTime = fs.statSync(buildId).mtimeMs;
  const fetchTime = fs.statSync(fetchHead).mtimeMs;

  if (fetchTime > buildTime) {
    console.log(`> Neuer git pull erkannt (FETCH_HEAD: ${new Date(fetchTime).toISOString()} > BUILD_ID: ${new Date(buildTime).toISOString()})`);
    return true;
  }

  return false;
}

if (needsBuild()) {
  console.log("> Starte npm run build ...");
  try {
    execSync("npm run build", { stdio: "inherit", cwd: __dirname });
    console.log("> Build abgeschlossen.");
  } catch (err) {
    console.error("> Build fehlgeschlagen:", err.message);
    // Weiter starten mit altem Build, falls vorhanden
  }
}

const app = next({ dev: false });
const handle = app.getRequestHandler();
const port = process.env.PORT || 3000;

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, () => {
    console.log(`> Ready on port ${port}`);
  });
});

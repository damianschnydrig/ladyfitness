/**
 * Erstellt ein ZIP im Projektordner zum Hochladen auf Plesk / Webspace.
 * Nach dem Entpacken liegen index.html, images/, styles.css usw. direkt im Webroot.
 * Ausgeschlossen: node_modules, .git, das ZIP selbst.
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");
const zipName = "ladyfitness-bremgarten-fuer-Plesk.zip";
const zipPath = path.join(projectRoot, zipName);

process.chdir(projectRoot);

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const isWin = process.platform === "win32";

try {
  if (isWin) {
    execSync(
      `tar -a -c -f "${zipPath}" --exclude=node_modules --exclude=.git --exclude="${zipName}" .`,
      { stdio: "inherit", shell: true }
    );
  } else {
    execSync(
      `zip -r "${zipPath}" . -x "node_modules/*" -x ".git/*" -x "${zipName}"`,
      { stdio: "inherit" }
    );
  }
  const sizeMb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
  console.log("\n✓ ZIP bereit:", zipPath);
  console.log("  Grösse:", sizeMb, "MB");
  console.log("  Plesk: alte Dateien im httpdocs löschen → ZIP hochladen → Hier entpacken.");
} catch (e) {
  console.error("Packen fehlgeschlagen. Prüfen, ob tar (Windows) verfügbar ist.");
  process.exit(1);
}

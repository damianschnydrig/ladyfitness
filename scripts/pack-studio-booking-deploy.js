/**
 * ZIP nur für studio-booking — zum Hochladen auf die Subdomain (FTP).
 * Enthält: Quellcode, prisma, package-lock — KEIN node_modules, KEIN .next,
 * KEINE lokale .env (Server braucht eigene .env aus .env.example).
 */
const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const projectRoot = path.resolve(__dirname, "..");
const bookingRoot = path.join(projectRoot, "studio-booking");
const zipName = "ladyfitness-buchung-fuer-server.zip";
const zipPath = path.join(projectRoot, zipName);

if (!fs.existsSync(path.join(bookingRoot, "package.json"))) {
  console.error("Nicht gefunden:", bookingRoot);
  process.exit(1);
}

if (fs.existsSync(zipPath)) {
  fs.unlinkSync(zipPath);
}

const isWin = process.platform === "win32";

const excludes = [
  "node_modules",
  ".next",
  ".env",
  ".git",
  "coverage",
  ".turbo",
  ".vercel",
];

let excludeArgs = excludes.map((e) => `--exclude=${e}`).join(" ");

try {
  process.chdir(bookingRoot);
  if (isWin) {
    execSync(`tar -a -c -f "${zipPath}" ${excludeArgs} --exclude="${zipName}" .`, {
      stdio: "inherit",
      shell: true,
    });
  } else {
    execSync(
      `zip -r "${zipPath}" . -x "node_modules/*" -x ".next/*" -x ".env" -x ".git/*"`,
      { stdio: "inherit" }
    );
  }
  const sizeMb = (fs.statSync(zipPath).size / (1024 * 1024)).toFixed(2);
  console.log("\nOK: ZIP bereit:", zipPath);
  console.log("  Groesse:", sizeMb, "MB");
  console.log("  Subdomain httpdocs: ZIP hochladen -> entpacken -> .env anlegen -> npm ci -> npm run build -> ...");
  console.log("  Siehe studio-booking/DEPLOY-LESE-MICH.txt im ZIP.");
} catch (e) {
  console.error("Packen fehlgeschlagen.", e.message);
  process.exit(1);
}

/**
 * Deploy-Script: Lady Fitness Bremgarten
 * Erstellt ein ZIP des Quellcodes für Plesk/Node.js-Hosting.
 *
 * Aufruf:
 *   1) Erst bauen:  cd studio-booking && npm run build
 *   2) Dann packen: cd .. && npm run pack
 *      ODER:        node scripts/pack-studio-booking-full-deploy.js
 */

const path = require('path');
const fs = require('fs');

function requireArchiver() {
  const candidates = [
    path.join(__dirname, '..', 'studio-booking', 'node_modules', 'archiver'),
    path.join(__dirname, '..', 'node_modules', 'archiver'),
  ];
  for (const mod of candidates) {
    try {
      return require(mod);
    } catch {
      /* try next */
    }
  }
  throw new Error(
    'archiver nicht gefunden. Bitte im Projektroot: npm install (Workspaces installieren devDependencies).',
  );
}

const archiver = requireArchiver();

const ROOT = __dirname;
const APP_DIR = path.join(ROOT, '..', 'studio-booking');
const DESKTOP = path.join(require('os').homedir(), 'Desktop');
const DATE_STR = new Date().toISOString().slice(0, 10);
const ZIP_NAME = `ladyfitness-deploy-${DATE_STR}.zip`;
const ZIP_PATH = path.join(DESKTOP, ZIP_NAME);

// .next vorhanden?
const nextDir = path.join(APP_DIR, '.next');
if (!fs.existsSync(nextDir)) {
  console.error('\n❌  .next-Ordner nicht gefunden.');
  console.error('    Bitte zuerst bauen:  cd studio-booking && npm run build\n');
  process.exit(1);
}

console.log(`\n📦  ZIP wird erstellt: ${ZIP_NAME}\n`);

const output = fs.createWriteStream(ZIP_PATH);
const archive = archiver('zip', { zlib: { level: 6 } });

archive.on('warning', (err) => {
  if (err.code !== 'ENOENT') throw err;
});
archive.on('error', (err) => { throw err; });
archive.pipe(output);

// Quellcode + .next (gebaut) verpacken; node_modules und .env ausschliessen
archive.glob('**', {
  cwd: APP_DIR,
  ignore: [
    'node_modules/**',
    '.env',
    '.env.local',
    '.git/**',
    '**/*.zip',
    '**/npm-debug.log*',
    '**/yarn-error.log',
  ],
});

output.on('close', () => {
  const mb = (archive.pointer() / 1024 / 1024).toFixed(1);
  console.log(`\n✅  Fertig! ${ZIP_NAME} (${mb} MB)`);
  console.log(`📁  Gespeichert: ${ZIP_PATH}`);
  console.log('\n─────────────────────────────────────────────────────────────');
  console.log('  Nächste Schritte → DEPLOY-LESE-MICH.txt im ZIP beachten');
  console.log('─────────────────────────────────────────────────────────────\n');
});

archive.finalize();

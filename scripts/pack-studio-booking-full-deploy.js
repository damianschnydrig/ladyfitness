/**
 * ZIP aus dist/ nach npm run build. Voraussetzung: npm run build
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

const PROJECT_ROOT = path.join(__dirname, '..');
const DIST_DIR = path.join(PROJECT_ROOT, 'dist');
const DESKTOP = path.join(require('os').homedir(), 'Desktop');
const DATE_STR = new Date().toISOString().slice(0, 10);
const ZIP_NAME = `ladyfitness-deploy-${DATE_STR}.zip`;
const ZIP_PATH = path.join(DESKTOP, ZIP_NAME);

const serverJs = path.join(DIST_DIR, 'studio-booking', 'server.js');
if (!fs.existsSync(serverJs)) {
  console.error('\n❌  dist/studio-booking/server.js nicht gefunden.');
  console.error('    Bitte zuerst im Projektroot:  npm run build\n');
  process.exit(1);
}

console.log(`\n📦  ZIP aus dist/ (Next standalone): ${ZIP_NAME}\n`);

const output = fs.createWriteStream(ZIP_PATH);
const archive = archiver('zip', { zlib: { level: 6 } });

archive.on('warning', (err) => {
  if (err.code !== 'ENOENT') throw err;
});
archive.on('error', (err) => { throw err; });
archive.pipe(output);

archive.glob('**', {
  cwd: DIST_DIR,
  ignore: [
    '.env',
    '.env.local',
    '.env.*.local',
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
  console.log('');
});

archive.finalize();

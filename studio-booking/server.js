/**
 * Plesk / Node: Anwendungsstartdatei = diese Datei (server.js).
 * Voraussetzung: `npm run build` (kopiert `.next/static` + `public` via scripts/copy-standalone-assets.js).
 */
require("./.next/standalone/studio-booking/server.js");

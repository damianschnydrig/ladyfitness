# Lady Fitness Bremgarten

Eine **Next.js 15**-App (Marketing, Buchen, Kontakt, Admin). **Ein** deploybarer App-Ordner: `studio-booking/` (dort liegt `package.json`).

## Lokal entwickeln

```bash
cd studio-booking
npm install
# .env aus .env.example anlegen
npm run dev
```

Standard: [http://localhost:3000](http://localhost:3000)

## Build (lokal)

```bash
cd studio-booking
npm run build
```

Es gibt **kein** `output: "standalone"`, **kein** `copy-standalone-assets.js`, **kein** `public/studio-booking`-Spiegel im Build-Pfad. `tsconfig.json` schliesst `public/studio-booking/**` aus (falls auf dem Server je wieder ein alter Ordner auftaucht).

## Plesk (Node.js) — feste Einstellungen

| Feld | Wert |
|------|------|
| **Anwendungsstamm** (Application root) | `/var/www/vhosts/<domain>/httpdocs/studio-booking` — Ordner, in dem `package.json` und `server.js` liegen |
| **Dokumentenstamm** (Document root) | typisch `/var/www/vhosts/<domain>/httpdocs` (Webserver-Docroot der Domain); die Next-App wird vom **Node-Prozess** bedient, nicht aus statischen Dateien unter `public/` „kompiliert“ |
| **Anwendungsstartdatei** | `server.js` (im Anwendungsstamm) — startet `next start` inkl. `PORT` aus der Umgebung |
| **Anwendungsmodus** | `production` |

Alternative Startdatei (wenn Plesk `npm` unterstützt): `npm` mit Argument `start` und Arbeitsverzeichnis = Anwendungsstamm — dann ist `package.json` → `"start": "next start"` massgebend.

## Server — genau 4 Deploy-Schritte

Im SSH-Terminal (Pfad anpassen):

```bash
cd /var/www/vhosts/ladyfitness-bremgarten.ch/httpdocs/studio-booking
git pull
npm install
npm run build
```

Danach in Plesk: **Node.js-Anwendung neu starten**.

**Wichtig:** In Plesk darf unter „npm install / Build“ **keine** eigene Zeile wie `next build && node scripts/copy-standalone-assets.js` stehen — das überschreibt `package.json`. Es muss schlicht `npm run build` im App-Root laufen (Script = nur `next build`).

Einmalig bei Altlasten: falls `public/studio-booking` existiert → `rm -rf public/studio-booking` (sonst riskiert TypeScript, doppelte Quellen zu kompilieren).

## Runtime (NextAuth / Middleware)

- **`src/app/api/auth/[...nextauth]/route.ts`:** `export const runtime = "nodejs"` — NextAuth mit bcrypt etc. läuft nur sinnvoll auf Node.
- **`src/middleware.ts`:** Läuft auf Edge (Next.js-Standard), importiert aber **kein** `next-auth`/`jose` mehr — nur Cookie-Präsenz für den Admin-Gate. Session/JWT bleiben in den Server-Routen gültig.

## Struktur

- **`studio-booking/`** — gesamte Next.js-Anwendung (`src/`, `public/`, `next.config.ts`, `server.js`)

# Lady Fitness Bremgarten

Eine **Next.js 15**-App (Marketing, Buchen, Kontakt, Admin). **Variante A:** Das **Git-Repo-Root** ist der **einzige** deploybare App-Root — dort liegen direkt `package.json`, `src/`, `public/`, `next.config.ts`, `server.js`, `supabase/`.

## Lokal entwickeln

```bash
npm install
# .env aus .env.example anlegen
npm run dev
```

Standard: [http://localhost:3000](http://localhost:3000)

## Build (lokal)

```bash
npm run build
```

`package.json` → `"build": "next build"` (ohne Zusatzskripte). Es gibt **kein** `output: "standalone"`, **kein** `copy-standalone-assets.js`, **kein** `public/studio-booking`-Spiegel im Build-Pfad. `tsconfig.json` schliesst `public/studio-booking/**` aus (falls auf dem Server je wieder ein alter Ordner auftaucht).

## Plesk (Node.js) — feste Einstellungen (Variante A)

| Feld | Wert |
|------|------|
| **Git-Deploy-Ziel** (Repository-Pfad) | Ordner, in dem nach Pull `package.json` im **Root** liegt — typisch `/var/www/vhosts/ladyfitness-bremgarten.ch/httpdocs` (wenn das Repo direkt dort geklont wird) **oder** ein Unterordner wie `/var/www/vhosts/.../ladyfitness` — entscheidend: **kein** zusätzlicher `studio-booking/`-Unterordner mehr |
| **Anwendungsstamm** (Node.js Application root) | **derselbe** Ordner wie das Git-Deploy-Ziel (dort `package.json`, `server.js`) |
| **Dokumentenstamm** (Document root) | typisch dieselbe Domain-Docroot (`httpdocs`); die App wird vom **Node-Prozess** bedient |
| **Anwendungsstartdatei** | `server.js` (im Anwendungsstamm) — startet `next start` inkl. `PORT` aus der Umgebung |
| **Anwendungsmodus** | `production` |

Alternative Startdatei (wenn Plesk `npm` unterstützt): `npm` mit Argument `start` und Arbeitsverzeichnis = Anwendungsstamm.

## Server — genau 4 Deploy-Schritte

Im SSH-Terminal (Pfad = **Ihr** Application root, z. B. `httpdocs`):

```bash
cd /var/www/vhosts/ladyfitness-bremgarten.ch/httpdocs
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

## Struktur (Repo-Root)

- `src/` — App-Router, Actions, Komponenten
- `public/` — statische Assets
- `next.config.ts`, `server.js`, `package.json`
- `supabase/` — Migrationen & Konfiguration

---
*Zuletzt aktualisiert: 01.05.2026 — Automatisches Deployment via Plesk Webhook eingerichtet.*

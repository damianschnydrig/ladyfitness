# Lady Fitness Bremgarten

Eine **Next.js 15**-App (Marketing, Buchen, Kontakt, Admin). Keine statischen HTML-Duplikate mehr — alles unter `studio-booking/`.

## Entwicklung

```bash
npm install
# studio-booking/.env aus .env.example anlegen
npm run dev
```

Öffnen: [http://localhost:3001](http://localhost:3001)

## Build & Deploy (Plesk / Node)

```bash
npm run build
```

Erzeugt u. a. `studio-booking/.next/` inkl. **standalone**-Server. Nach jedem Build kopiert `studio-booking/scripts/copy-standalone-assets.js` automatisch **`.next/static`** (CSS/JS unter `/_next/static/`) und **`public`** in den Standalone-Ordner — sonst fehlen Styles im Live-Betrieb.

Auf dem Server nach `git pull`: `npm install`, `npm run build`, Node-Anwendungsstartdatei `server.js` (siehe `studio-booking/server.js`), **kein** `basePath` — die App läuft im **Domain-Root**.

## Struktur

- **`studio-booking/`** — gesamte Next.js-Anwendung (`src/app`, `public`, `next.config.ts`)

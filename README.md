# Lady Fitness Bremgarten

Eine **Next.js 15**-App (Marketing, Buchen, Kontakt, Admin). Keine statischen HTML-Duplikate mehr — alles unter `studio-booking/`.

## Entwicklung

```bash
cd studio-booking
npm install
# studio-booking/.env aus .env.example anlegen
npm run dev
```

Öffnen: [http://localhost:3001](http://localhost:3001)

## Build & Deploy (Plesk / Node)

```bash
cd studio-booking
npm run build
```

Auf dem Server in `/httpdocs/studio-booking` nach `git pull`: `npm ci`, `npm run build`, dann Node.js neustarten. Start per `npm start` (`next start`), **kein** `basePath` — die App läuft im **Domain-Root**.

## Struktur

- **`studio-booking/`** — gesamte Next.js-Anwendung (`src/app`, `public`, `next.config.ts`)

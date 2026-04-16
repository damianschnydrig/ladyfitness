# Lady Fitness Bremgarten — Buchung & Kontakt (Next.js)

> **Gesamtüberblick (Repo, Deployment, Datenbank):** siehe [`../README.md`](../README.md) im Projektroot.

Produktionsreifes System für **Probetraining**, **Personal Training** und **Kontaktanfragen** inkl. **Admin-Dashboard**, **MySQL/MariaDB + Prisma**, **Auth.js (Credentials)** und **E-Mail über Resend**.

Die Marketing-Seiten liegen unter `../` (statisch); diese App ist das **Backend inkl. Admin-Oberfläche** und läuft unter einer **eigenen URL** (Subdomain, z. B. `buchung.…`).

### Wichtig: Zwei Server, zwei Ports

| Was | Ordner | Port | Beispiel-URL |
|-----|--------|------|----------------|
| Statische Website | `ladyfitness-bremgarten.ch/` (Parent) | **3000** | http://localhost:3000/ |
| **Diese** Buchungs- & Admin-App | `studio-booking/` | **3001** | http://localhost:3001/admin/login |

`/admin/login`, `/buchen` und `/kontakt` gibt es **nur** auf Port **3001**, wenn hier `npm run dev` läuft. Nur `npm run dev` im Parent startet **http-server** auf 3000 — dann ist **3001 leer** (Browser: „Verbindung abgelehnt“ oder ähnlich).

**Schnellstart Buchungs-App:** im Parent-Ordner `npm run dev:booking` **oder** in `studio-booking/` → `npm run dev`.

**Prüfen, ob die richtige App läuft:** http://localhost:3001/api/health — Antwort `{"ok":true,...}`.

Falls Turbopack bei Ihnen Probleme macht: `npm run dev:classic` (Webpack-Dev-Server).

## Architektur (Kurz)

| Bereich | Technik |
|--------|---------|
| Frontend (öffentlich) | Next.js App Router, React 19, Tailwind, Server Actions |
| Admin | Geschützt per Middleware + JWT-Session (Auth.js) |
| Datenbank | PostgreSQL, Prisma ORM |
| Validierung | Zod (Client über Server Actions + Server) |
| E-Mail | Resend + React Email (HTML, markenfarben) |
| Zeitzonen | Slots & Anzeige in **Europe/Zurich** (Luxon) |

**Buchungslogik:** Ein `TimeSlot` hat höchstens eine `Booking` (`slotId` unique). Buchung nur, wenn Slot frei, Typ passt und Start in der Zukunft liegt — in einer **Transaktion**.

**Spam:** Honeypot-Feld `website` (versteckt) in öffentlichen Formularen.

## Projektstruktur (Auszug)

```
studio-booking/
├── prisma/
│   ├── schema.prisma
│   ├── seed.ts
│   └── migrations/
├── src/
│   ├── actions/           # Server Actions (Buchung, Kontakt, Admin)
│   ├── app/
│   │   ├── buchen/        # Buchungsflow + Bestätigung
│   │   ├── kontakt/       # Kontaktformular + Bestätigung
│   │   ├── admin/         # Login + Dashboard (Route-Gruppe (secure))
│   │   └── api/           # Auth + öffentliche Slot-API
│   ├── components/
│   ├── emails/            # React-Email-Templates
│   ├── lib/               # Prisma, Mail, Validierung, Datum
│   ├── auth.ts            # Auth.js-Konfiguration
│   └── middleware.ts
├── .env.example
└── README.md
```

## Setup

### 1. Abhängigkeiten

```bash
cd studio-booking
npm install
```

### 2. Umgebungsvariablen

```bash
cp .env.example .env
```

Pflicht mindestens: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`. Für E-Mails: `RESEND_API_KEY`, `MAIL_FROM`, `OPERATOR_EMAIL`.

### 3. Datenbank

```bash
npx prisma migrate deploy
# oder lokal während der Entwicklung:
npx prisma migrate dev
```

### 4. Admin-Benutzer anlegen

```bash
set ADMIN_SEED_EMAIL=ihre@mail.ch
set ADMIN_SEED_PASSWORD=starkes-passwort
npm run db:seed
```

(Unter Linux/macOS: `export ADMIN_SEED_EMAIL=...`)

### 5. Entwicklung

```bash
npm run dev
```

Standard-Port **3001** (damit parallel `http-server` der statischen Site auf 3000 laufen kann).

- Öffentlich: [http://localhost:3001/buchen](http://localhost:3001/buchen), [http://localhost:3001/kontakt](http://localhost:3001/kontakt)
- Admin: [http://localhost:3001/admin/login](http://localhost:3001/admin/login)

### 6. Produktion

```bash
npm run build
npm run start
```

Setzen Sie dieselben Umgebungsvariablen auf dem Server (z. B. Vercel, Railway, eigener Node-Host).

## Resend & Domain

1. Domain bei [Resend](https://resend.com) verifizieren.  
2. `MAIL_FROM` mit dieser Domain verwenden (z. B. `buchung@ladyfitness-bremgarten.ch`).  
3. Ohne API-Key werden Buchung/Kontakt **trotzdem gespeichert**; es erscheint nur eine Warnung in den Server-Logs.

## Einbindung in die bestehende Website

- Die statische Site verweist auf diese App: Basis-URL in `../components.js` (`getBookingAppBase()` → unter `localhost`/`127.0.0.1` automatisch `http://localhost:3001`, sonst Produktion). Hart kodierte Buchungs-Links in HTML werden beim Laden ebenfalls umgeschrieben.
- Pfade: `/buchen` (Probetraining & Personal Training), `/kontakt` (Kontaktanfragen).
- Logo in E-Mails: Standard ist `https://ladyfitness-bremgarten.ch/images/logo.png`, überschreibbar mit `NEXT_PUBLIC_BRAND_LOGO_URL`.

### Preflight vor Build/Deploy

```bash
npm run preflight
```

Prüft, ob `DATABASE_URL`, `AUTH_SECRET` und `NEXT_PUBLIC_APP_URL` in `.env` gesetzt sind (PowerShell unter Windows).

## Sicherheit & Betrieb

- Admin nur über starkes Passwort; optional später 2FA/Passkey nachrüstbar.
- `AUTH_SECRET` sicher erzeugen und **nie** committen.
- Regelmässige Backups der PostgreSQL-Datenbank.
- Next.js-Version bei Sicherheitsupdates des Frameworks anheben (siehe `npm audit`).

## Erweiterungen (optional)

- Rate-Limiting (z. B. Upstash) für öffentliche APIs
- Turnstile/reCAPTCHA bei starkem Spam
- Serien-Slots (Bulk) im Admin
- iCal-Export für gebuchte Termine

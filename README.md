# Lady Fitness Bremgarten

**Ein** Repository: Next.js (Startseite, Angebot, Buchung, Kontakt, Admin). **Datenbank:** Supabase (Cloud).

## Lokal

```bash
git clone <repo-url>
cd ladyfitness-bremgarten.ch
npm install
```

`studio-booking/.env` anlegen — Vorlage: `studio-booking/.env.example` ausfüllen.

```bash
npm run dev
```

→ **http://localhost:3001**

## GitHub

```bash
git add -A
git commit -m "…"
git push origin main
```

Fertig. Der Code liegt auf GitHub; mehr brauchst du für die Versionsführung nicht.

## Live (kurz)

Host mit **Node.js 18+**, dieselben Variablen wie in `.env.example`. Build: `npm run build` (erzeugt u. a. `dist/`). Optional ZIP: `npm run pack`.

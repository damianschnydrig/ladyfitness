# Deployment-Checkliste

Die **Einordnung** (ein Produkt, Repo2web vs. Buchungs-App, Datenbank): siehe **`README.md`** im Projektroot.

---

## A — Öffentliche Website (Hauptdomain)

| Schritt | Aktion |
|--------|--------|
| 1 | `npm run build` → Ordner `dist/` |
| 2 | Inhalt von `dist/` auf den Webspace (z. B. Repo2web, oder `npm run pack` → ZIP in Plesk `httpdocs` entpacken) |

Keine Datenbank.

---

## B — Buchungs-App (Subdomain, z. B. `buchung.…`)

| Schritt | Aktion |
|--------|--------|
| 1 | Beim Hoster **MariaDB/MySQL** anlegen, Zugangsdaten notieren |
| 2 | Subdomain mit **Node.js**-Hosting (oder externer Node-Server + DNS) |
| 3 | Code: `studio-booking/` aus Git auf den Server |
| 4 | `studio-booking/.env` mit `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, Resend-Variablen |
| 5 | `npm ci` → `npm run build` → `npx prisma migrate deploy` → `npm run db:seed` (Seed nur beim ersten Mal) |
| 6 | App dauerhaft starten (`npm start` / Plesk Node / PM2) |
| 7 | Test: `https://…/api/health` und `/buchen` |

**Datenbank:** nur hier; `DATABASE_URL` zeigt auf die DB aus Schritt 1.

---

## Vollständiger Build lokal prüfen

```powershell
npm run build:all
```

Erzeugt `dist/` und den Next.js-Production-Build unter `studio-booking/.next`.

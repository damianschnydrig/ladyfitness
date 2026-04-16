# Die eine Anleitung — Lady Fitness live schalten

Du machst **zwei Dinge nacheinander** (ca. 20–30 Minuten, wenn die Zugänge da sind):

1. **Website** auf die Hauptdomain legen (ohne Datenbank).
2. **Buchungs-App** auf die Subdomain `buchung` legen — **dort** kommt die **Datenbank** ins Spiel.

Code liegt immer auf **GitHub**; du musst nichts Doppeltes pflegen.

---

## Vorher: Einmal auf dem PC

```powershell
cd Pfad\zu\ladyfitness-bremgarten.ch
git pull
npm run pack
```

Du bekommst die Datei **`ladyfitness-bremgarten-fuer-Plesk.zip`** im Projektordner. Die brauchst du für Schritt A.

*(Alternative: `npm run build` → Ordner `dist/` — gleicher Inhalt wie die Website, z. B. für Repo2web.)*

---

## A — Website (Hauptdomain)

| # | Was du tust |
|---|-------------|
| 1 | Plesk öffnen → Domain **ladyfitness-bremgarten.ch** → Ordner **`httpdocs`** (oder Document Root). |
| 2 | **Alte Dateien** im `httpdocs` löschen (oder Ordner leeren). |
| 3 | **`ladyfitness-bremgarten-fuer-Plesk.zip`** hochladen. |
| 4 | **Rechtsklick → Archiv extrahieren** — direkt **in** `httpdocs`, nicht in einen neuen Unterordner. |

**Fertig:** `https://ladyfitness-bremgarten.ch` zeigt die Website. **Keine Datenbank nötig.**

---

## B — Buchungs-App + Datenbank (Subdomain `buchung.…`)

Hier brauchst du auf dem **gleichen Hoster** (oder einem Server mit **Node.js**):

- eine **MySQL-/MariaDB-Datenbank**
- die **Subdomain** z. B. `buchung.ladyfitness-bremgarten.ch`
- **Node.js** (Version 18 oder neuer)

### B1 — Datenbank anlegen (Plesk)

| # | Was du tust |
|---|-------------|
| 1 | Plesk → **Datenbanken** → neue Datenbank + Benutzer anlegen. |
| 2 | Den **Verbindungs-String** notieren. Sieht oft so aus: `mysql://BENUTZER:PASSWORT@localhost:3306/DATENBANKNAME` (Host kann bei deinem Hoster anders heissen — steht in Plesk dabei). |

### B2 — Code auf den Server bringen

Am einfachsten: **Git** in Plesk („Git“) auf dieses Repo zeigen lassen, **oder** per FTP/SFTP den Ordner **`studio-booking`** vom Repo auf den Server kopieren (inkl. `prisma/`, `package.json` — **ohne** `node_modules`).

Wichtig: Auf dem Server liegt die App in einem Ordner, z. B.  
`…/httpdocs/buchung/` **oder** ein eigener Pfad, den Plesk für die Node-App vorsieht.

### B3 — `.env` auf dem Server (nur in `studio-booking/`)

Eine Datei **`studio-booking/.env`** anlegen (Inhalt anpassen):

```env
DATABASE_URL="mysql://BENUTZER:PASSWORT@HOST:3306/DATENBANK"
AUTH_SECRET="mindestens-32-zeichen-zufaellig-generieren"
NEXT_PUBLIC_APP_URL="https://buchung.ladyfitness-bremgarten.ch"
RESEND_API_KEY="re_…"
MAIL_FROM="Lady Fitness Bremgarten <buchung@ladyfitness-bremgarten.ch>"
OPERATOR_EMAIL="info@ladyfitness-bremgarten.ch"
ADMIN_SEED_EMAIL="deine@admin-mail.ch"
ADMIN_SEED_PASSWORD="starkes-passwort-nur-beim-ersten-mal"
```

`AUTH_SECRET`: z. B. in PowerShell `openssl rand -base64 32` (oder Online-Generator, lang und zufällig).

### B4 — Einmal per SSH oder „Node.js“-Konsole (im Ordner `studio-booking`)

Der Hoster muss **SSH** erlauben oder eine **npm-Install-Oberfläche** haben. Dann nacheinander:

```bash
cd /pfad/zu/studio-booking
npm ci
npm run build
npx prisma migrate deploy
npm run db:seed
```

`db:seed` legt den **Admin-Login** an — **nur einmal** ausführen.

### B5 — App starten (dauerhaft)

- **Plesk „Node.js“:** Startbefehl oft: **`npm start`** oder **`npx next start -p 3001`** — Port wie in der Plesk-Maske vorgegeben.
- Oder **PM2** / Dienst, falls dein Hoster das so will.

Subdomain **SSL** (Let’s Encrypt) in Plesk aktivieren.

### B6 — Kurz testen

| URL | Erwartung |
|-----|-----------|
| `https://buchung.ladyfitness-bremgarten.ch/api/health` | JSON mit `"ok": true` |
| `https://buchung.ladyfitness-bremgarten.ch/buchen` | Buchungsseite |
| `https://buchung.ladyfitness-bremgarten.ch/admin/login` | Admin-Login |

---

## Wenn dein Plesk **kein Node.js** hat

Dann ist der **einfachste** Weg: Buchungs-App auf einem **Node-Angebot** (z. B. Railway, Render, kleiner VPS) deployen — **eine** `.env` mit **`DATABASE_URL`**, die auf die **MySQL bei deinem Hoster** zeigt, **wenn** der Hoster **Remote-Zugriff** auf die DB erlaubt (Firewall / „Remote MySQL“). Sonst die DB beim Node-Anbieter mit anlegen.

Das ist der einzige „Extra-Weg“ — frag deinen Hoster kurz: **„Node.js für Subdomain?“** Wenn ja, bleibst du bei **B** alles in Plesk.

---

## Kurz: Datenbank — woran du dich erinnern musst

| Frage | Antwort |
|-------|---------|
| Wo liegt die DB? | Beim Hoster (Plesk), nicht in Git. |
| Wer spricht sie an? | Nur die Buchungs-App (`studio-booking`), über `DATABASE_URL` in `.env`. |
| Wann Tabellen da sind? | Nach `npx prisma migrate deploy` auf dem Server. |
| Admin-Login? | Nach `npm run db:seed` (einmalig). |

---

## Checkliste zum Abhaken

- [ ] A: ZIP entpackt, Website sichtbar
- [ ] B1: Datenbank existiert
- [ ] B3: `.env` liegt auf dem Server in `studio-booking/`
- [ ] B4: `migrate deploy` + `db:seed` gelaufen
- [ ] B5: App läuft, SSL auf Subdomain
- [ ] B6: Health + Buchung + Admin getestet

Wenn du magst, sag beim nächsten Mal nur: **„Plesk hat Node ja/nein“** — dann können wir Schritt B auf genau deine Maske zuschneiden.

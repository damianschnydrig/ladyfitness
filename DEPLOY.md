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

---

## Fortsetzung — Website ist schon online (FTP / Repo2web erledigt)

Schritt **A** ist erledigt, wenn `https://ladyfitness-bremgarten.ch` die Seite zeigt. **Repo2web** brauchst du **nicht noch einmal** für die Buchung — die Subdomain `buchung` geht **ohne** Repo2web (siehe oben).

### Wo du jetzt stehst

| Erledigt | Offen |
|----------|--------|
| Hauptdomain mit HTML/CSS/Bildern | Subdomain **buchung** + Ordner **studio-booking** + **.env** + Node-Befehle |

### Schritt 1 — Subdomain in Plesk

1. Plesk → **Domains** → **Subdomains** (oder „Hosting-Einstellungen“) → **Hinzufügen**.
2. Name z. B. **`buchung`** → volle Adresse: `buchung.ladyfitness-bremgarten.ch`.
3. **SSL** für diese Subdomain aktivieren (Let’s Encrypt).
4. Notieren, welches **Document Root** Plesk anlegt (z. B. `…/buchung.ladyfitness-bremgarten.ch/httpdocs`).

### Schritt 2 — Ordner `studio-booking` auf den Server (ohne Repo2web)

**Variante A — Git (empfohlen, wenn Plesk Git hat)**  
1. Im Subdomain-Ordner (oder einem festen Pfad) **Repository klonen**:  
   `https://github.com/damianschnydrig/ladyfitness.git`  
2. Auf dem Server liegt dann u. a. der Ordner **`studio-booking/`** — **nur dieser Ordner** ist die App (der Rest des Repos ist die Website, die du schon woanders hast).

**Variante B — ZIP/FTP**  
1. Lokal aus dem geklonten Projekt nur den Ordner **`studio-booking`** packen oder per FTP hochladen.  
2. Inhalt nach **httpdocs der Subdomain** legen, sodass dort direkt **`package.json`** und **`prisma/`** liegen (nicht `studio-booking/studio-booking/…` doppelt).

**Richtig:** Im Ordner, in dem Node startet, siehst du `package.json` mit `"name": "studio-booking"`.

### Schritt 3 — `.env` anlegen

Im **gleichen Ordner** wie `package.json` der Buchungs-App eine Datei **`.env`** (Plesk: „Neu“ → Dateiname genau `.env`).

Minimalinhalt (Werte anpassen):

```env
DATABASE_URL="mysql://BENUTZER:PASSWORT@localhost:3306/DATENBANK"
AUTH_SECRET="hier-langes-zufaelliges-geheimnis"
NEXT_PUBLIC_APP_URL="https://buchung.ladyfitness-bremgarten.ch"
RESEND_API_KEY="re_…"
MAIL_FROM="Lady Fitness Bremgarten <buchung@ladyfitness-bremgarten.ch>"
OPERATOR_EMAIL="info@ladyfitness-bremgarten.ch"
ADMIN_SEED_EMAIL="admin@ladyfitness-bremgarten.ch"
ADMIN_SEED_PASSWORD="starkes-passwort-einmalig"
```

- Passwort in `DATABASE_URL` mit Sonderzeichen (z. B. `&`) **URL-kodieren** (`&` → `%26`).
- Host `localhost` nur, wenn Plesk die DB auf dem **gleichen Server** anbindet — sonst Host aus der Plesk-DB-Übersicht eintragen.

### Schritt 4 — Node.js an die Subdomain hängen (Plesk)

1. Subdomain **buchung** öffnen → **Node.js** (falls vorhanden).
2. **Anwendungsroot** = Ordner mit `package.json` der Buchungs-App.
3. **Node-Version** z. B. 18 oder 20.
4. **Installationsbefehl:** `npm ci`  
5. **Startbefehl:** `npm start` (oder `npx next start -p 3001` — Port wie in der Maske vorgegeben).
6. Speichern — Plesk führt Install/Start aus oder du machst es per SSH einmal manuell (siehe Schritt 5).

### Schritt 5 — Einmalig per SSH (falls nötig oder vor erstem Start)

Im Ordner der Buchungs-App:

```bash
npm ci
npm run build
npx prisma migrate deploy
npm run db:seed
```

Danach App starten (Plesk „Neu starten“ oder `npm start`).

`db:seed` **nur einmal** — legt den Admin an.

### Schritt 6 — Test

- `https://buchung.ladyfitness-bremgarten.ch/api/health`  
- `https://buchung.ladyfitness-bremgarten.ch/buchen`  
- Admin-URL inkl. Login aus **Schritt 3** (`ADMIN_SEED_*`)

### Später: Updates nur aus GitHub (ohne Repo2web für die Buchung)

1. Auf dem Server im Repo-Ordner: `git pull` (oder nur `studio-booking` neu ausliefern).  
2. Im Ordner `studio-booking/`: `npm ci` → `npm run build` → `npx prisma migrate deploy` (wenn es neue Migrationen gibt).  
3. Node-App neu starten.

**Repo2web** weiterhin nur für **Änderungen an der statischen Website** — wenn du das beibehalten willst: `npm run build` lokal → `dist/` wie gewohnt; für **buchung** gilt die Tabelle oben.

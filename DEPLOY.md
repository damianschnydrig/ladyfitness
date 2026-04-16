# Deployment — Lady Fitness Bremgarten (beide Teile)

Es gibt **zwei getrennte Systeme**, die beide live gehen müssen:

| Teil | Was | Typische URL |
|------|-----|----------------|
| **A. Marketing-Website** | Statische HTML/CSS/JS, Bilder | `https://ladyfitness-bremgarten.ch/` |
| **B. Buchungs- & Admin-App** | Next.js (`studio-booking/`), MariaDB/MySQL | `https://buchung.ladyfitness-bremgarten.ch/` |

Die Website verlinkt auf die Buchung unter `buchung.ladyfitness-bremgarten.ch` — diese Subdomain muss **genau** auf die laufende Next.js-App zeigen.

---

## Teil A — Statische Website (Hauptdomain)

### Variante 1: ZIP (Plesk)

Im Projektroot:

```powershell
npm run pack
```

Datei: `ladyfitness-bremgarten-fuer-Plesk.zip`

**Auf dem Server:** Plesk → Domain → `httpdocs` → alte Dateien löschen → ZIP hochladen → **im httpdocs entpacken** (nicht in einen Extra-Unterordner).

### Variante 2: Repo2web / `dist`

```powershell
npm run build
```

Ordner `dist/` enthält die gleiche statische Site — Inhalt nach `httpdocs` kopieren oder mit Repo2web deployen.

---

## Teil B — Buchungs-App (Next.js)

Voraussetzungen beim Hoster:

- **Node.js** (mind. 18.x, für Next.js 15)
- **MariaDB oder MySQL** (eine leere Datenbank + Benutzer mit Rechten)
- **Subdomain** z. B. `buchung.ladyfitness-bremgarten.ch` mit Document Root auf die gebaute App oder Reverse-Proxy auf den Node-Prozess

### 1. Datenbank in Plesk anlegen

- Datenbank + DB-Benutzer erstellen
- **Connection String** notieren, z. B.  
  `mysql://USER:PASS@localhost:3306/DATENBANKNAME`  
  (Host kann je nach Hoster `localhost` oder ein interner Name sein.)

### 2. Subdomain

- Subdomain `buchung` (oder wie vereinbart) anlegen
- Später: SSL (Let’s Encrypt) aktivieren

### 3. Code auf den Server bringen

- per **Git** (Plesk „Git“), **SFTP**, oder **ZIP** des Ordners `studio-booking/` inkl. `prisma/`, **ohne** lokales `node_modules` (wird auf dem Server neu installiert)

Arbeitsverzeichnis auf dem Server sollte der Ordner sein, in dem `package.json` der Buchungs-App liegt (`studio-booking/`).

### 4. Umgebungsvariablen (`.env` auf dem Server)

Vorlage: `studio-booking/.env.example` — mindestens:

| Variable | Beispiel |
|----------|----------|
| `DATABASE_URL` | MySQL-String von Plesk |
| `AUTH_SECRET` | Einmal mit `openssl rand -base64 32` erzeugen, sicher aufbewahren |
| `NEXT_PUBLIC_APP_URL` | `https://buchung.ladyfitness-bremgarten.ch` (ohne Slash am Ende) |
| `RESEND_API_KEY` | Von Resend |
| `MAIL_FROM` | z. B. `Lady Fitness Bremgarten <buchung@ladyfitness-bremgarten.ch>` |
| `OPERATOR_EMAIL` | z. B. `info@ladyfitness-bremgarten.ch` |

Optional für Admin-Seed (nur beim ersten Setup):

| Variable | Bedeutung |
|----------|-----------|
| `ADMIN_SEED_EMAIL` | Login-E-Mail für Admin |
| `ADMIN_SEED_PASSWORD` | Starkes Passwort |

### 5. Auf dem Server ausführen (SSH oder Plesk „Scheduled task“ / „Node.js“-Konsole)

```bash
cd /pfad/zu/studio-booking
npm ci
npm run build
npx prisma migrate deploy
npm run db:seed
```

`db:seed` nur **einmal** (oder wenn Admin neu angelegt werden soll). Danach Admin unter  
`https://buchung.ladyfitness-bremgarten.ch/admin/login` testen.

### 6. App dauerhaft starten

- **Plesk Node.js:** Startbefehl meist `npm start` oder `node_modules/.bin/next start -p 3001` — Port wie in der Plesk-Konfiguration
- oder **PM2** / **systemd** auf einem VPS

Wichtig: Prozess muss nach Server-Neustart wieder starten (Plesk „Application startup“ oder PM2 `startup`).

### 7. Prüfen

- `https://buchung.ladyfitness-bremgarten.ch/api/health` → sollte JSON mit `"ok":true` liefern
- `/buchen` und `/kontakt` im Browser testen
- Testbuchung → E-Mail bei Kundin und Studio (Resend)

---

## Reihenfolge empfohlen

1. **Teil B** zuerst lauffähig machen (DB, Migration, Seed, Subdomain, SSL).
2. **Teil A** deployen (ZIP oder `dist`), damit die Links auf `buchung.…` nicht ins Leere zeigen.
3. Auf der **Hauptdomain** kurz prüfen: „Zur Online-Buchung“ / Probetraining-Links öffnen die Buchungs-URL mit `?type=…` wie vorgesehen.

---

## Wenn der Hoster kein Node.js anbietet

Dann die Buchungs-App auf einem **Node-fähigen** Dienst betreiben (z. B. Railway, Render, eigener kleiner VPS) und die Subdomain per **DNS (CNAME)** dorthin zeigen. Die Datenbank kann weiterhin bei Plesk liegen, wenn der externe Server **Zugriff auf Port 3306** hat (Firewall / „Remote MySQL“ — beim Hoster erfragen).

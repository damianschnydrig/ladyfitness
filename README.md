# Lady Fitness Bremgarten — ein Projekt, ein Repository

Das ist **ein Auftrag**: Marketing-Website plus Buchungs- und Verwaltungs-Backend. Alles liegt **in diesem einen Git-Repo** — ein `git push` lädt **den gesamten Code** nach GitHub hoch. Es gibt keine zweite Codebasis.

Warum wir trotzdem von „zwei Schichten“ sprechen: **Technisch** sind das zwei *Artefakte* (was der Server ausliefert), keine zwei Projekte:

| Schicht | Inhalt | Rolle |
|--------|--------|--------|
| **Öffentliche Website** | HTML, CSS, Bilder im Projektroot | Informiert, verlinkt zur Buchung |
| **Buchungs-App** | Ordner `studio-booking/` (Next.js) | Termine, Kontakt, Admin, **Datenbank** |

Die Datenbank gehört **nur** zur Buchungs-App. Die statischen Seiten haben **keine** Datenbank — sie sind wie ein Prospekt, der auf die Buchung verweist. So ist das bei fast allen Webseiten mit Login/Buchung aufgebaut.

---

## Ordner — was gehört wohin

```
ladyfitness-bremgarten.ch/
├── index.html, *.html          ← öffentliche Seiten
├── styles.css, components.js   ← Layout & Navigation
├── images/                     ← Medien
├── book-appointment/ …         ← kleine Hilfs-/Redirects
├── studio-booking/             ← gesamte Buchungs- & Admin-Software (Next.js, Prisma)
│   ├── prisma/                 ← Datenbank-Schema & Migrationen
│   ├── src/                    ← App-Code
│   └── .env                    ← nur lokal / auf dem Server (nicht in Git)
├── scripts/                    ← build-dist.js, pack-upload.js
├── package.json                ← Root: statische Site + Hilfsskripte
└── README.md                   ← diese Datei
```

**Ein Push** (`git push`) enthält immer **Website + Buchungs-App** zusammen.

---

## GitHub: alles in einem Zug

```powershell
git add .
git commit -m "Beschreibung"
git push origin main
```

Damit liegt der **komplette** Stand auf GitHub — inklusive `studio-booking/`. Es ist kein zweites Repo nötig.

---

## Repo2web (nur die öffentliche Website)

Repo2web macht nach `npm run build` einen Ordner **`dist/`** mit der statischen Website. Das ist **richtig so**, wenn du die Hauptdomain mit dem Marketing-Inhalt füllen willst.

- Repo2web **ersetzt nicht** die Buchungs-App — die läuft auf **Node.js** und braucht einen **eigenen Deploy-Schritt** (siehe unten).
- Mental: **Repo2web = Webseite packen.** **Server mit Node = Buchung live schalten.**

---

## npm: Befehle im Überblick

| Befehl | Wo | Zweck |
|--------|-----|--------|
| `npm run build` | Projektroot | Erzeugt `dist/` (für Repo2web / ZIP-Logik) |
| `npm run pack` | Projektroot | ZIP für manuellen Upload (Plesk) |
| `npm run dev` | Projektroot | Lokale Vorschau Website (Port 3000) |
| `npm run dev:booking` | Projektroot | startet Buchungs-App (Port 3001) |
| `npm run build:all` | Projektroot | `dist/` **und** Production-Build der Buchungs-App (lokal prüfen) |
| `npm run build` | in `studio-booking/` | Nur Next.js-Build (auf dem Server) |

`build:all` baut beides nacheinander — **ein Befehl**, bevor du auf dem Server oder in der CI etwas testest.

---

## Datenbank — kurz und klar

- **Technologie:** MariaDB oder MySQL (Prisma).
- **Wo:** Auf dem Hoster (z. B. Plesk: Datenbank anlegen). **Nicht** in Git, **nicht** in Repo2web.
- **Verbindung:** In `studio-booking/.env` als `DATABASE_URL=mysql://…` (nur auf dem Server oder lokal).
- **Nach dem ersten Deploy:** auf dem Server `npx prisma migrate deploy` und ggf. `npm run db:seed` für den Admin-Account.

Ohne laufende Datenbank und ohne `.env` auf dem Server startet die Buchungs-App nicht — die **Website** (HTML) funktioniert davon unabhängig.

---

## Deployment in der Praxis (zusammengefasst)

1. **Immer:** Code mit `git push` auf GitHub bringen (ganzes Repo).
2. **Website (Hauptdomain):** Repo2web mit `npm run build` → `dist/` hochladen **oder** `npm run pack` → ZIP in Plesk entpacken.
3. **Buchung (`buchung.ladyfitness-bremgarten.ch`):** Auf einem Server mit **Node.js** den Ordner `studio-booking/` auschecken, `.env` setzen, `npm ci`, `npm run build`, `npx prisma migrate deploy`, App starten (Details: `DEPLOY.md`).

Wenn der Hoster **kein Node** hat: Buchungs-App auf einem Node-fähigen Dienst betreiben, Subdomain per DNS dorthin — **ein** Produkt, **zwei Hosting-Schichten** (Webspace + Node).

---

## Weitere Doku

- **`DEPLOY.md`** — Checkliste Server (Schrittfolge).
- **`studio-booking/README.md`** — technische Details zur Next.js-App.

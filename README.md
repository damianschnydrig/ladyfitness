# Lady Fitness Bremgarten

**Ein Repo:** Next.js-App in `studio-booking/` + **statische Root-Website** (`index.html`, `styles.css`, `images/`, …). **Datenbank:** Supabase.

## Lokal entwickeln

```bash
git clone <repo-url>
cd ladyfitness-bremgarten.ch
npm install
```

`studio-booking/.env` aus `studio-booking/.env.example` — ausfüllen.

```bash
npm run dev
```

→ **http://localhost:3001**

## Was `npm run build` erzeugt (wichtig)

Nach `npm run build` liegt unter **`dist/`** zweierlei:

| Ordner | Inhalt |
|--------|--------|
| **`dist/`** (Root) | Next.js **Standalone** — `server.js`, `.next/`, `node_modules/`, `public/` → für **Node.js** |
| **`dist/httpdocs-static/`** | Spiegel der **klassischen Website** aus dem Repo-Root (HTML, CSS, Bilder, …) → für **reinen FTP** wie früher unter `/httpdocs` |

**Das ist kein Fehler:** Der Server-Screenshot mit vielen `.html`-Dateien gehört zur **statischen** Ebene. Der Ordner mit `server.js` und `.next` ist die **Node-App**. Beides kommt aus **einem** Build; es sind nur **zwei Auslieferungsformen**.

- **Nur FTP / statischer Webspace:** Inhalt von **`dist/httpdocs-static/`** nach `/httpdocs` laden (nicht `server.js` aus dem `dist/`-Root).
- **Node.js-Hosting:** **`dist/`**-Root starten mit `node server.js` (wie bisher).

## GitHub

```bash
git add -A
git commit -m "…"
git push origin main
```

# ZIP für Plesk / Webserver

## Deine Datei (immer aktuell bauen)

Im Projektordner `ladyfitness-bremgarten.ch`:

```powershell
npm run pack
```

**Ergebnis:** eine ZIP-Datei **im gleichen Ordner** wie das Projekt:

```
ladyfitness-bremgarten.ch\ladyfitness-bremgarten-fuer-Plesk.zip
```

Diese Datei kannst du **herunterladen, per Mail schicken oder auf den Server laden**.

## Auf dem Plesk-Server

1. **Dateien** → Domain → `httpdocs` (oder dein Document Root).
2. **Alle alten Website-Dateien löschen** (oder Ordner leeren).
3. **`ladyfitness-bremgarten-fuer-Plesk.zip` hochladen.**
4. **Rechtsklick → „Archiv extrahieren“** (Entpacken **in diesem Ordner**, nicht in einen Unterordner).

Danach liegen `index.html`, `images/`, `styles.css`, `components.js` usw. **direkt** im Webroot — die Seite sollte unter deiner Domain laufen.

## Was ist drin?

Alles für die statische Website, **ohne** `node_modules` (nur lokal für `npm run dev` nötig).

## Kurz prüfen

- Startseite lädt  
- `/kontakt.html` inkl. Karte  
- Formular absenden testen  

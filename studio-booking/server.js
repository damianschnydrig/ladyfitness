/**
 * Startdatei für Plesk „Anwendungsstartdatei“ (statt app.js).
 * Liest PORT aus der Umgebung (setzt Plesk automatisch).
 */
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");

const port = parseInt(process.env.PORT || "3001", 10);
const hostname = "0.0.0.0";

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(port, hostname, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
  });
});

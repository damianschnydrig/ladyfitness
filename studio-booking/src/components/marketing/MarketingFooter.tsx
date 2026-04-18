import Link from "next/link";

export default function MarketingFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer" id="kontakt-footer">
      <div className="container split">
        <div>
          <h2>Lady Fitness Bremgarten</h2>
          <p>
            Fitness Gallery Bremgarten GmbH
            <br />
            Zürcherstrasse 7
            <br />
            5620 Bremgarten
          </p>
          <p>
            Tel:{" "}
            <a href="tel:+41566316809">056 631 68 09</a>
            <br />
            <a href="mailto:info@ladyfitness-bremgarten.ch">
              info@ladyfitness-bremgarten.ch
            </a>
          </p>
          <p>
            <a
              href="https://www.instagram.com/ladyfitnessbremgarten"
              target="_blank"
              rel="noopener"
            >
              Instagram @ladyfitnessbremgarten
            </a>
          </p>
        </div>
        <div className="footer__cta">
          <h3>Bereit für den ersten Schritt?</h3>
          <p>Vereinbaren Sie jetzt Ihr kostenloses Probetraining.</p>
          <Link className="btn" href="/buchen">
            Probetraining anfragen
          </Link>
        </div>
      </div>
      <div className="container footer__bottom">
        <p>
          &copy; {year} Lady Fitness Bremgarten — Umsetzung &amp; technische
          Umgebung{" "}
          <a href="https://webtotal.info" target="_blank" rel="noopener">
            WEBtotal.info
          </a>
          <span className="footer__legal">
            <Link href="/impressum">Impressum</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/datenschutz">Datenschutz</Link>
            <span aria-hidden="true"> · </span>
            <Link href="/admin/login" rel="nofollow">
              Admin
            </Link>
          </span>
        </p>
      </div>
    </footer>
  );
}

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Preise & Abos | Lady Fitness Bremgarten",
  description:
    "Transparente Preise bei Lady Fitness Bremgarten: Kraft/Ausdauer ab CHF 349, Personal Training ab CHF 80/Std. Power Plate in allen Abos inklusive.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/preise" },
};

export default function PreisePage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Preise</span>
          <h1 className="reveal">Klare Preise. Faire Konditionen.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="pricing">
            <article className="pricing__card reveal">
              <h3>Kraft/Ausdauer</h3>
              <ul>
                <li>
                  3 Monate <span>CHF 349.–</span>
                </li>
                <li>
                  6 Monate <span>CHF 499.–</span>
                </li>
                <li className="pricing__highlight">
                  12 Monate <span>CHF 699.–</span>
                </li>
              </ul>
              <Link
                className="btn btn--full"
                href="/buchen?type=PROBETRAINING"
              >
                Jetzt starten
              </Link>
            </article>
            <article className="pricing__card reveal">
              <h3>Personal Training</h3>
              <ul>
                <li>
                  1 Stunde <span>CHF 80.–</span>
                </li>
                <li>
                  5er Karte <span>CHF 350.–</span>
                </li>
                <li>
                  10er Karte <span>CHF 600.–</span>
                </li>
              </ul>
              <Link
                className="btn btn--full"
                href="/buchen?type=PERSONAL_TRAINING"
              >
                Jetzt starten
              </Link>
            </article>
          </div>
          <p className="price-note reveal">
            10% Rabatt für Lehrlinge und Studentinnen. Start-Paket CHF 50.–.
            Alle Preise inkl. MwSt.
          </p>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <span className="eyebrow reveal">Krankenkassenbeitrag</span>
          <h2 className="reveal">
            QUALITOP zertifiziert — Beitrag von der Krankenkasse
          </h2>
          <p className="reveal">
            Lady Fitness Bremgarten ist QUALITOP zertifiziert und von der
            Krankenkasse anerkannt. Bei einem 6- oder 12-Monats-Abo erhalten Sie
            CHF 200.– bis CHF 500.– von Ihrer Krankenkasse zurück.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Probetraining vereinbaren
          </Link>
        </div>
      </section>

      <section className="section section--dark">
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "700px" }}
        >
          <span className="eyebrow reveal">Probetraining</span>
          <h2 className="reveal">
            Starten Sie mit einem kostenlosen Probetraining
          </h2>
          <p className="reveal">
            Lernen Sie unser Studio und unser Angebot unverbindlich kennen.
            Vereinbaren Sie jetzt Ihren Termin.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>
    </main>
  );
}

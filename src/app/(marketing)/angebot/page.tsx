import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Angebot — Milon-Zirkel, Kraft & Ausdauer, Power Plate & Personal Training",
  description:
    "Trainingsangebot Lady Fitness Bremgarten: Milon-Zirkel, Kraftlinie mit Ausdauergeräten, Power Plate und Personal Training — auf Top-Niveau.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/angebot" },
};

export default function AngebotPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Unser Angebot</span>
          <h1 className="reveal">
            Vier Trainingskonzepte — ein Ziel: Ihre Gesundheit
          </h1>
        </div>
      </section>

      <section className="section" id="milon">
        <div className="container split">
          <img
            src="/images/studio-1.png"
            alt="Milon-Zirkel im Lady Fitness Studio Bremgarten"
            className="section-img reveal"
          />
          <div className="reveal">
            <h2>Milon-Zirkel</h2>
            <p>
              Der Milon-Zirkel bietet computergesteuertes Kraft- und
              Ausdauertraining in einem durchdachten System. Jede Station arbeitet
              im Rhythmus von 60 Sekunden Belastung und 30 Sekunden Pause — in nur
              30 Minuten absolvieren Sie ein vollständiges Ganzkörpertraining.
            </p>
            <p>
              Die Geräte passen sich automatisch an Ihr Leistungsniveau an und
              ermöglichen so ein gesundheitsorientiertes Training für alle
              Leistungsstufen. Ob Einsteigerin oder erfahrene Sportlerin: Der
              Milon-Zirkel begleitet Sie individuell zu Ihren Zielen.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="krafttraining">
        <div className="container split split--reverse">
          <div className="reveal">
            <h2>Kraft- und Ausdauertraining</h2>
            <p>
              Ergänzend zum Milon-Zirkel steht Ihnen eine{" "}
              <strong>voll ausgestattete Kraftlinie</strong> zur Verfügung — für
              freies Krafttraining mit Hanteln, Kurzhanteln und Maschinen nach
              Ihrem Rhythmus.
            </p>
            <p>
              Darüber hinaus finden Sie bei uns ein kompaktes, aber
              leistungsstarkes <strong>Cardio-Zentrum</strong> mit vielen
              Ausdauergeräten auf <strong>Top-Niveau</strong> (u. a. Matrix,
              Technogym). So kombinieren Sie Zirkel, freie Kraft und klassisches
              Ausdauertraining flexibel — alles in Ihrem Abo inbegriffen.
            </p>
            <p style={{ marginTop: "1rem", fontWeight: 600 }}>
              Ihre Ausdauergeräte im Überblick:
            </p>
            <ul className="check-list">
              <li>Laufbänder</li>
              <li>Crosstrainer</li>
              <li>Bikes</li>
              <li>Rudergeräte</li>
            </ul>
          </div>
          <img
            src="/images/kraft-ausdauer-zone.png"
            alt="Kraftlinie und Ausdauergeräte bei Lady Fitness Bremgarten"
            className="section-img reveal"
          />
        </div>
      </section>

      <section className="section" id="power-plate">
        <div className="container split">
          <img
            src="/images/powerplate-studio.png"
            alt="Power Plate im Lady Fitness Studio Bremgarten"
            className="section-img reveal"
          />
          <div className="reveal">
            <h2>Power Plate</h2>
            <p>
              Die Power Plate nutzt Vibrationstechnologie für ein effizientes
              Ganzkörperworkout. Die Schwingungen aktivieren die Muskulatur intensiv
              und unterstützen den Muskelkraftaufbau sowie einen erhöhten
              Grundumsatz.
            </p>
            <p>
              Zusätzlich fördert das Training die Durchblutung und kann das
              Hautbild verbessern. Die Power Plate ist in allen Abos inbegriffen —
              nutzen Sie sie als Ergänzung zu Ihrem Zirkeltraining oder für
              gezielte Einheiten.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="personal-training">
        <div className="container">
          <div className="reveal">
            <h2>Personal Training</h2>
            <p>
              Mit unserem Personal Training erhalten Sie individuelle Betreuung und
              eine auf Ihre Ziele abgestimmte Trainingsplanung. Ob Kraftaufbau,
              Gewichtsreduktion oder allgemeine Fitness — wir setzen gemeinsam mit
              Ihnen realistische Ziele und begleiten Sie auf dem Weg dorthin.
            </p>
            <div
              className="pricing"
              style={{ maxWidth: "720px", marginTop: "1.5rem" }}
            >
              <div className="pricing__card reveal">
                <h3>Einzelstunde</h3>
                <ul>
                  <li>
                    1 Stunde Personal Training <span>CHF 80</span>
                  </li>
                </ul>
              </div>
              <div className="pricing__card reveal">
                <h3>5er Karte</h3>
                <ul>
                  <li>
                    5 Stunden Personal Training <span>CHF 350</span>
                  </li>
                </ul>
              </div>
              <div className="pricing__card reveal">
                <h3>10er Karte</h3>
                <ul>
                  <li>
                    10 Stunden Personal Training <span>CHF 600</span>
                  </li>
                </ul>
              </div>
            </div>
            <Link
              className="btn reveal"
              style={{ marginTop: "1.5rem" }}
              href="/buchen?type=PERSONAL_TRAINING"
            >
              Personal Training buchen
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--dark">
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "700px" }}
        >
          <span className="eyebrow reveal">Probetraining</span>
          <h2 className="reveal">Lernen Sie unser Angebot kennen</h2>
          <p className="reveal">
            Vereinbaren Sie Ihr kostenloses Probetraining und erleben Sie
            Milon-Zirkel, Kraft- und Ausdauerbereich, Power Plate und unsere
            Betreuung hautnah.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>
    </main>
  );
}

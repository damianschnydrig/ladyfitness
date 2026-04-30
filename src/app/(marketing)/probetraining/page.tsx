import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Kostenloses Probetraining | Lady Fitness Bremgarten",
  description:
    "Vereinbaren Sie jetzt Ihr kostenloses Probetraining bei Lady Fitness Bremgarten. Persönliche Beratung, Geräteeinführung und Trainingsempfehlung inklusive.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/probetraining" },
};

export default function ProbetrainingPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container reveal">
          <span className="eyebrow">Probetraining</span>
          <h1>Ihr kostenloser Einstieg bei Lady Fitness Bremgarten</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <h2>Warum ein Probetraining?</h2>
            <p>
              Ein Probetraining bei Lady Fitness Bremgarten ist der ideale
              Einstieg. Wir nehmen uns Zeit für Sie: persönliches Kennenlernen,
              Zielbesprechung, Einführung in Geräte und Trainingssystem sowie Ihr
              erster Trainingsdurchlauf mit Betreuung. Am Ende erhalten Sie eine
              Empfehlung für das passende Abo.
            </p>
            <p>
              Termine vereinbaren Sie am einfachsten{" "}
              <strong>online</strong> mit freier Slot-Auswahl — oder weiterhin per
              Telefon{" "}
              <a href="tel:+41566316809">056 631 68 09</a>.
            </p>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split">
          <div className="reveal">
            <h2>Was Sie erwartet</h2>
            <ul className="check-list">
              <li>Persönliches Kennenlernen und Zielbesprechung</li>
              <li>Einführung in Geräte und Trainingssystem</li>
              <li>Erster Trainingsdurchlauf mit Betreuung</li>
              <li>Empfehlung für das passende Abo</li>
            </ul>
            <p>
              Vereinbaren Sie Ihren Termin direkt online (freie Slots) oder
              telefonisch unter{" "}
              <a href="tel:+41566316809">056 631 68 09</a>.
            </p>
          </div>
          <div className="form-card light-box reveal">
            <h3>Online buchen</h3>
            <p>
              Wählen Sie Probetraining oder Personal Training, einen freien Termin
              und Ihre Kontaktdaten — Sie erhalten eine Bestätigung per E-Mail.
            </p>
            <p
              style={{
                fontSize: ".82rem",
                color: "var(--muted)",
                marginTop: ".4rem",
              }}
            >
              Hinweis: Für allgemeine Fragen ohne Termin nutzen Sie bitte das{" "}
              <Link href="/kontakt">Kontaktformular</Link> oder rufen Sie uns an.
            </p>
            <Link
              className="btn btn--full"
              style={{ marginTop: "1rem" }}
              href="/buchen?type=PROBETRAINING"
            >
              Zur Online-Buchung
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="reveal">Häufige Fragen zum Probetraining</h2>
          <dl className="faq">
            <dt className="faq__q reveal">Was kostet das Probetraining?</dt>
            <dd className="faq__a reveal">
              Das Probetraining ist kostenlos und unverbindlich.
            </dd>

            <dt className="faq__q reveal">Was muss ich mitbringen?</dt>
            <dd className="faq__a reveal">
              Sportkleidung, Handtuch und Turnschuhe.
            </dd>

            <dt className="faq__q reveal">Wie lange dauert das Probetraining?</dt>
            <dd className="faq__a reveal">
              Ca. 60 Minuten inklusive Einführung und erstem Training.
            </dd>

            <dt className="faq__q reveal">Ist Lady Fitness krankenkassenanerkannt?</dt>
            <dd className="faq__a reveal">
              Ja, wir sind QUALITOP zertifiziert. Bei 6- oder 12-Monats-Abos
              erhalten Sie CHF 200 bis CHF 500 von Ihrer Krankenkasse zurück.
            </dd>
          </dl>
        </div>
      </section>
    </main>
  );
}

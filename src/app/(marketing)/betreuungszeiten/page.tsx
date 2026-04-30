import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Betreuungszeiten | Lady Fitness Bremgarten",
  description:
    "Feste Betreuungszeiten bei Lady Fitness Bremgarten. Montag bis Samstag professionelle Unterstützung. Studio täglich 06:00–22:00 Uhr geöffnet.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/betreuungszeiten" },
};

export default function BetreuungszeitenPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container reveal">
          <span className="eyebrow">Betreuungszeiten</span>
          <h1>Feste Zeiten. Persönliche Betreuung.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal">
            <h2>Was sind Betreuungszeiten?</h2>
            <p>
              Während unserer Betreuungszeiten sind professionelle Trainerinnen vor
              Ort. Sie unterstützen Sie bei der Geräteeinstellung, der richtigen
              Technik und motivieren Sie beim Training. So trainieren Sie sicher
              und effektiv.
            </p>
            <p>
              Andere Zeiten sind auf telefonische Vereinbarung möglich.
              Probetraining, Verlängerung, Einführung oder Kontrolltraining
              vereinbaren wir gerne individuell mit Ihnen.
            </p>
          </div>

          <div className="reveal">
            <h2>Unsere Betreuungszeiten</h2>
            <div className="schedule">
              <div className="schedule__row">
                <span>Montag – Freitag</span>
                <span>08:30 – 11:30 Uhr</span>
              </div>
              <div className="schedule__row">
                <span>Montag, Dienstag, Donnerstag</span>
                <span>15:00 – 19:30 Uhr</span>
              </div>
              <div className="schedule__row">
                <span>Mittwoch</span>
                <span>17:00 – 19:30 Uhr</span>
              </div>
              <div className="schedule__row">
                <span>Samstag</span>
                <span>09:30 – 12:00 Uhr</span>
              </div>
              <div className="schedule__row schedule__row--accent">
                <strong>Studio geöffnet</strong>
                <strong>täglich 06:00 – 22:00 Uhr</strong>
              </div>
            </div>
          </div>

          <div className="reveal" style={{ marginTop: "2rem" }}>
            <Link className="btn" href="/probetraining">
              Jetzt Probetraining vereinbaren
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

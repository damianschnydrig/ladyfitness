import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Unser Team | Lady Fitness Bremgarten",
  description:
    "Das Team von Lady Fitness Bremgarten: kompetente Trainerinnen mit persönlicher Betreuung für Ihr effektives Fitnesstraining.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/team" },
};

export default function TeamPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Team</span>
          <h1 className="reveal">Persönlich. Kompetent. Motivierend.</h1>
        </div>
      </section>

      <section className="section">
        <div className="container split">
          <img
            src="/images/team.png"
            alt="Das Team von Lady Fitness Bremgarten"
            className="section-img section-img--portrait reveal"
          />
          <div className="reveal">
            <h2>Unser Team — Ihre Ansprechpartnerinnen</h2>
            <p>
              Bei Lady Fitness Bremgarten trainieren Sie in einem geschützten
              Umfeld — Frauen unter sich. Unser Team aus kompetenten Trainerinnen
              steht Ihnen mit persönlicher Betreuung zur Seite.
            </p>
            <p>
              Wir legen Wert auf eine familiäre Atmosphäre, in der Sie sich
              wohlfühlen. Jede neue Mitgliederin erhält ein individuelles
              Einführungstraining und regelmässige Kontrolltrainings. Bei Fragen
              sind wir für Sie da — persönlich, per Telefon oder E-Mail.
            </p>
            <ul className="check-list">
              <li>Individuelle Betreuung für jede Leistungsstufe</li>
              <li>Persönliches Einführungstraining</li>
              <li>Regelmässige Kontrolltrainings</li>
              <li>Frauen unter sich — familiäre Atmosphäre</li>
              <li>Bei Fragen immer erreichbar</li>
            </ul>
            <Link className="btn" href="/probetraining">
              Probetraining vereinbaren
            </Link>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <span className="eyebrow reveal">Trainingsphilosophie</span>
          <h2 className="reveal">
            Gesundheit im Fokus — nachhaltig und wirksam
          </h2>
          <p className="reveal">
            Unser Training orientiert sich an Ihrer Gesundheit. Wir setzen auf
            nachhaltigen Muskelaufbau und effektive Trainingsmethoden. Als
            QUALITOP-zertifiziertes Studio ist Lady Fitness Bremgarten von der
            Krankenkasse anerkannt — bei einem 6- oder 12-Monats-Abo erhalten Sie
            einen Beitrag zurück.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>

      <section className="section section--dark">
        <div
          className="container"
          style={{ textAlign: "center", maxWidth: "700px" }}
        >
          <span className="eyebrow reveal">Probetraining</span>
          <h2 className="reveal">Lernen Sie uns kennen</h2>
          <p className="reveal">
            Vereinbaren Sie Ihr kostenloses Probetraining und erleben Sie unser
            Team und unsere Betreuung hautnah.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>
    </main>
  );
}

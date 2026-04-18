import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Lady Fitness Bremgarten — Frauenfitness mit persönlicher Betreuung",
  description:
    "Lady Fitness Bremgarten — Frauenfitness in Bremgarten AG: Milon-Zirkel, Kraftlinie & Ausdauergeräte, Power Plate, Personal Training. QUALITOP, krankenkassenanerkannt. 365 Tage offen.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/" },
};

export default function HomePage() {
  return (
    <main>
      <section className="hero">
        <div className="hero__slider" aria-hidden="true">
          <img className="hero__slide" src="/images/hero-new-3.png" alt="" />
          <img className="hero__slide" src="/images/hero-new-1.png" alt="" />
          <img className="hero__slide" src="/images/hero-new-2.png" alt="" />
          <img className="hero__slide" src="/images/hero-new-4.png" alt="" />
        </div>
        <div className="hero__slider-overlay" aria-hidden="true"></div>
        <div className="hero__gradient" aria-hidden="true"></div>
        <div className="hero__grid" aria-hidden="true"></div>
        <div className="hero__orbs" aria-hidden="true">
          <div className="hero__orb hero__orb--1"></div>
          <div className="hero__orb hero__orb--2"></div>
          <div className="hero__orb hero__orb--3"></div>
        </div>
        <div className="hero__sweep" aria-hidden="true"></div>
        <div className="hero__noise" aria-hidden="true"></div>
        <div className="hero__ring" aria-hidden="true"></div>
        <div className="hero__frame" aria-hidden="true"></div>

        <div className="hero__content container">
          <span className="hero__eyebrow hero-anim hero-anim--1">
            Lady Fitness Bremgarten
          </span>
          <h1 className="hero__title hero-anim hero-anim--2">
            <span className="hero__title-outline">Deine</span>
            <span className="hero__title-solid">Stärke.</span>
          </h1>
          <p className="hero__sub hero-anim hero-anim--3">
            Dein exklusives Fitnessstudio nur für Frauen im Herzen von Bremgarten
            — Milon-Zirkel, persönliche Betreuung, 365 Tage geöffnet.
          </p>
          <div className="hero__trust hero-anim hero-anim--4">
            <div className="hero__trust-item">
              <span className="hero__trust-icon">✓</span>
              <span>Krankenkasse anerkannt</span>
            </div>
            <div className="hero__trust-item">
              <span className="hero__trust-icon">✓</span>
              <span>QUALITOP zertifiziert</span>
            </div>
            <div className="hero__trust-item">
              <span className="hero__trust-icon">✓</span>
              <span>365 Tage geöffnet</span>
            </div>
          </div>
          <div className="hero__actions hero-anim hero-anim--5">
            <Link className="btn btn--hero" href="/probetraining">
              <span className="btn__text">Kostenloses Probetraining</span>
              <span className="btn__shimmer" aria-hidden="true"></span>
            </Link>
            <a className="btn btn--hero-outline" href="tel:+41566316809">
              056 631 68 09
            </a>
          </div>
        </div>

        <div className="hero__scroll" aria-hidden="true">
          <span className="hero__scroll-text">Scroll</span>
          <span className="hero__scroll-line"></span>
        </div>

        <div className="hero__particles" aria-hidden="true"></div>
      </section>

      <section className="strip">
        <div className="strip__flash" aria-hidden="true"></div>
        <div className="container strip__grid">
          <div className="strip__item reveal">
            <strong>365</strong>
            <span>Tage offen</span>
          </div>
          <div className="strip__item reveal">
            <strong>16 h</strong>
            <span>täglich geöffnet</span>
          </div>
          <div className="strip__item reveal">
            <strong>30 Min</strong>
            <span>Zirkeltraining</span>
          </div>
          <div className="strip__item reveal">
            <strong>2</strong>
            <span>Personal Trainer</span>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <span className="eyebrow reveal">Unser Angebot</span>
          <h2 className="reveal">
            Vier Trainingskonzepte — ein Ziel: Ihre Gesundheit
          </h2>
          <div className="offer-grid">
            <article className="offer-card reveal">
              <div className="offer-card__img-wrap">
                <img
                  src="/images/card-milon.png"
                  alt="Milon-Zirkel Training Lady Fitness Bremgarten"
                />
              </div>
              <div className="offer-card__body">
                <span className="offer-card__tag">Milon · 30 Min</span>
                <h3>Milon-Zirkel</h3>
                <p>
                  Kraft- und Ausdauertraining in nur 30 Minuten. Computergesteuerte
                  Geräte passen sich automatisch an Ihr Leistungsniveau an.
                </p>
                <Link className="offer-card__link" href="/angebot#milon">
                  Mehr erfahren
                </Link>
              </div>
            </article>
            <article className="offer-card reveal">
              <div className="offer-card__img-wrap">
                <img
                  src="/images/kraft-ausdauer-zone.png"
                  alt="Kraftlinie und Ausdauergeräte im Lady Fitness Studio Bremgarten"
                />
              </div>
              <div className="offer-card__body">
                <span className="offer-card__tag">Kraftlinie · Cardio</span>
                <h3>Kraft- und Ausdauertraining</h3>
                <p>
                  Eine voll ausgestattete <strong>Kraftlinie</strong> und viele{" "}
                  <strong>Ausdauergeräte</strong> auf Top-Niveau — Laufbänder,
                  Crosstrainer, Bikes und Rudergeräte für Ihr Training neben dem
                  Milon-Zirkel.
                </p>
                <Link className="offer-card__link" href="/angebot#krafttraining">
                  Mehr erfahren
                </Link>
              </div>
            </article>
            <article className="offer-card reveal">
              <div className="offer-card__img-wrap">
                <img
                  src="/images/powerplate-studio.png"
                  alt="Power Plate Training Lady Fitness Bremgarten"
                />
              </div>
              <div className="offer-card__body">
                <span className="offer-card__tag">Vibrationstraining</span>
                <h3>Power Plate</h3>
                <p>
                  Ganzkörper-Vibrationstraining für Muskelkraft, Durchblutung und
                  einen höheren Grundumsatz. In allen Abos inklusive.
                </p>
                <Link className="offer-card__link" href="/angebot#power-plate">
                  Mehr erfahren
                </Link>
              </div>
            </article>
            <article className="offer-card reveal">
              <div className="offer-card__img-wrap">
                <img
                  src="/images/hero-new-4.png"
                  alt="Personal Training Lady Fitness Bremgarten"
                />
              </div>
              <div className="offer-card__body">
                <span className="offer-card__tag">1:1 Betreuung</span>
                <h3>Personal Training</h3>
                <p>
                  Individuelle Betreuung mit persönlichem Trainingsplan,
                  Fortschrittskontrolle und Motivation — für maximale Ergebnisse.
                </p>
                <Link className="offer-card__link" href="/angebot#personal-training">
                  Mehr erfahren
                </Link>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container split">
          <img
            src="/images/studio-2.png"
            alt="Trainingsbereich im Lady Fitness Studio Bremgarten"
            className="section-img reveal"
          />
          <div className="reveal">
            <span className="eyebrow">Warum Lady Fitness?</span>
            <h2>
              Frauen unter sich — familiär, professionell, krankenkassenanerkannt
            </h2>
            <p>
              Als QUALITOP-zertifiziertes Studio erhalten Sie bei einem 6- oder
              12-Monats-Abo einen Krankenkassenbeitrag von CHF 200.– bis CHF 500.–
              zurück. Wir bieten Ihnen ein geschütztes Trainingsumfeld mit
              kompetenter Betreuung.
            </p>
            <Link className="btn" href="/probetraining">
              Jetzt Probetraining vereinbaren
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container split split--reverse">
          <div className="reveal">
            <span className="eyebrow">Studio</span>
            <h2>Moderne Geräte in heller, einladender Atmosphäre</h2>
            <p>
              Unser Studio in der Zürcherstrasse 7 bietet auf großzügiger Fläche
              modernste Trainingsgeräte von Milon, Matrix und Technogym. Helle
              Räume, Tageslicht und eine ruhige Atmosphäre machen jedes Training
              zum Wohlfühlerlebnis.
            </p>
            <Link className="text-link" href="/bilder">
              Bilder ansehen
            </Link>
          </div>
          <img
            src="/images/studio-1.png"
            alt="Gerätepark im Lady Fitness Bremgarten"
            className="section-img reveal"
          />
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <div className="reviews__header reveal">
            <span className="eyebrow">Google Bewertungen</span>
            <h2>Das sagen unsere Mitglieder</h2>
            <div className="reviews__badge">
              <span className="reviews__stars">★★★★★</span>
              <span className="reviews__count">
                Über 30 zufriedene Mitglieder auf Google bewertet
              </span>
            </div>
          </div>
          <div className="reviews__grid">
            {[
              {
                stars: "★★★★★",
                text: "«Ich bin 76 Jahre alt und fühle mich im Ladyfitness Bremgarten bestens aufgehoben, zusammen mit Frauen jeder Altersgruppe. Die Leiterin Hane ist aufmerksam, kompetent und innovativ, das Studio ist gut geführt.»",
                name: "Josefina B.",
              },
              {
                stars: "★★★★★",
                text: "«Ich besuche Lady Fitness seit mehreren Jahren. Sehr zufrieden. Alles funktioniert immer. Die Fitnessverwaltung ist immer erreichbar und hilfsbereit. Alle Fragen werden schnell gelöst. Ich empfehle Lady Fitness Frauen jeden Alters.»",
                name: "Nataliya S.",
              },
              {
                stars: "★★★★★",
                text: "«Sehr freundlich, zuvorkommend und angenehmes Ambiente zum Trainieren. Ladies unter sich entspricht mir sehr. Absolut empfehlenswertes Studio. Klein aber fein.»",
                name: "Fabienne F.",
              },
              {
                stars: "★★★★★",
                text: "«Das Ladyfitness ist sehr gut ausgestattet mit Geräten. Es ist alles schön und sauber. Man fühlt sich wohl beim Trainieren. Sehr zu empfehlen.»",
                name: "Zylejha S.",
              },
              {
                stars: "★★★★☆",
                text: "«Ich trainiere seit gut einem Jahr im Ladyfitness. Das Fitness ist klein aber fein — alles was Frau braucht. Die Öffnungszeiten 24/7 an 365 Tagen finde ich super! Die Betreuung ist immer da, falls gewünscht.»",
                name: "Chantal S.",
              },
              {
                stars: "★★★★★",
                text: "«Ich trainiere fast jeden Tag. Team sehr hilfsbereit, familiäre Atmosphäre und ich bin sehr zufrieden.»",
                name: "Evelina K.",
              },
            ].map((r) => (
              <blockquote className="review-card reveal" key={r.name}>
                <div className="review-card__stars">{r.stars}</div>
                <p className="review-card__text">{r.text}</p>
                <footer className="review-card__author">
                  <strong>{r.name}</strong>
                  <span>Google Bewertung</span>
                </footer>
              </blockquote>
            ))}
          </div>
          <p
            className="reviews__cta reveal"
            style={{ textAlign: "center", marginTop: "2rem" }}
          >
            <Link className="btn" href="/probetraining">
              Jetzt selbst überzeugen — Probetraining anfragen
            </Link>
          </p>
        </div>
      </section>

      <section className="section section--dark">
        <div className="container" style={{ textAlign: "center", maxWidth: "700px" }}>
          <span className="eyebrow reveal">Probetraining</span>
          <h2 className="reveal">
            Lernen Sie uns kennen — kostenlos und unverbindlich
          </h2>
          <p className="reveal">
            Vereinbaren Sie Ihren persönlichen Termin und erleben Sie unser
            Studio, unser Team und unser Trainingskonzept hautnah.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>
    </main>
  );
}

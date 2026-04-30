import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Impressum | Lady Fitness Bremgarten",
  description:
    "Impressum und rechtliche Angaben zu Lady Fitness Bremgarten — Fitness Gallery Bremgarten GmbH.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/impressum" },
};

export default function ImpressumPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container reveal">
          <span className="eyebrow">Rechtliches</span>
          <h1>Impressum</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal" style={{ maxWidth: "720px" }}>
            <h2>Angaben gemäss Art. 3 URG</h2>
            <p>
              <strong>Lady Fitness Bremgarten</strong>
              <br />
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
              E-Mail:{" "}
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

            <h2 style={{ marginTop: "2rem" }}>Rechtliche Hinweise</h2>
            <p>
              Betreiber dieser Website ist die Fitness Gallery Bremgarten GmbH,
              unter der Marke Lady Fitness Bremgarten. Die Website dient der
              Information über das Frauenfitness-Studio und dessen Angebote.
            </p>
            <p>
              Für den Inhalt externer Links übernehmen wir keine Haftung. Für die
              Inhalte der verlinkten Seiten sind ausschliesslich deren Betreiber
              verantwortlich.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

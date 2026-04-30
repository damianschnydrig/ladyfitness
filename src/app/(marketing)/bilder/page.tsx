import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Studio Impressionen | Lady Fitness Bremgarten",
  description:
    "Bilder und Impressionen aus dem Lady Fitness Studio in Bremgarten. Moderne Geräte, helle Räume und familiäre Atmosphäre.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/bilder" },
};

export default function BilderPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Bilder</span>
          <h1 className="reveal">Impressionen aus unserem Studio</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="gallery">
            <img
              src="/images/studio-1.png"
              alt="Gerätepark im Lady Fitness Studio Bremgarten"
              className="gallery__img reveal"
            />
            <img
              src="/images/studio-2.png"
              alt="Trainingsbereich Lady Fitness Bremgarten"
              className="gallery__img reveal"
            />
            <img
              src="/images/studio-3.png"
              alt="Trainingsraum Lady Fitness Bremgarten"
              className="gallery__img reveal"
            />
            <img
              src="/images/studio-4.png"
              alt="Studioatmosphäre Lady Fitness Bremgarten"
              className="gallery__img reveal"
            />
          </div>
          <div className="reveal" style={{ marginTop: "2rem", maxWidth: "720px" }}>
            <h2>Moderne Ausstattung in heller, einladender Atmosphäre</h2>
            <p>
              Unser Studio in der Zürcherstrasse 7 bietet auf grosszügiger Fläche
              modernste Trainingsgeräte von Milon, Matrix und Technogym. Helle
              Räume mit Tageslicht, eine ruhige Atmosphäre und eine familiäre
              Umgebung machen jedes Training zum Wohlfühlerlebnis. Ob Milon-Zirkel
              oder Power Plate — bei Lady Fitness Bremgarten finden Sie alles für
              ein effektives und angenehmes Training.
            </p>
            <Link className="btn" href="/probetraining">
              Probetraining vereinbaren
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
          <h2 className="reveal">Erleben Sie unser Studio live</h2>
          <p className="reveal">
            Vereinbaren Sie Ihr kostenloses Probetraining und überzeugen Sie sich
            selbst von unserer Ausstattung und Atmosphäre.
          </p>
          <Link className="btn reveal" href="/probetraining">
            Jetzt Probetraining anfragen
          </Link>
        </div>
      </section>
    </main>
  );
}

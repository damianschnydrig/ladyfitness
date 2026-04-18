import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie Lady Fitness Bremgarten — Fragen zu Mitgliedschaft, Angebot oder Ablauf. Wir melden uns persönlich bei Ihnen.",
};

export default function KontaktPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Kontakt</span>
          <h1 className="reveal">Schreiben Sie uns</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
          <ContactForm />
        </div>
      </section>
    </main>
  );
}

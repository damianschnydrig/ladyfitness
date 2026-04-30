import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { createOneTimeFormToken } from "@/lib/form-security";

export const metadata: Metadata = {
  title: "Kontakt",
  description:
    "Kontaktieren Sie Lady Fitness Bremgarten — Fragen zu Mitgliedschaft, Angebot oder Ablauf. Wir melden uns persönlich bei Ihnen.",
};

export default function KontaktPage() {
  const formToken = createOneTimeFormToken("contact");
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
          <ContactForm formToken={formToken} />
          <div className="mt-10 space-y-4 border border-brand-border bg-brand-alt/30 p-5 text-sm leading-relaxed text-brand-dark">
            <div>
              <p className="font-semibold">Lady Fitness Bremgarten</p>
              <p>Zürcherstrasse 7</p>
              <p>5620 Bremgarten</p>
            </div>
            <div className="overflow-hidden border border-brand-border bg-white shadow-sm">
              <div className="relative h-[260px] w-full">
                <iframe
                  title="OpenStreetMap Standort Lady Fitness Bremgarten"
                  src="https://www.openstreetmap.org/export/embed.html?bbox=8.3403183%2C47.3489537%2C8.3509183%2C47.3545537&layer=mapnik&marker=47.3517537%2C8.3456183"
                  className="h-full w-full border-0"
                  loading="lazy"
                />
                <a
                  href="https://www.google.com/maps/place/ladyfitness+bremgarten/data=!4m2!3m1!1s0x47900e2623856383:0x9c4450b8de838c54?sa=X&ved=1t:242&ictx=111"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Standort auf Google Maps öffnen"
                  className="absolute inset-0"
                />
              </div>
              <div className="flex items-center justify-between border-t border-brand-border px-4 py-2">
                <span className="font-semibold text-brand-dark">Standort ansehen</span>
                <a
                  href="https://www.google.com/maps/place/ladyfitness+bremgarten/data=!4m2!3m1!1s0x47900e2623856383:0x9c4450b8de838c54?sa=X&ved=1t:242&ictx=111"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-brand-pink hover:underline"
                >
                  Auf Google Maps öffnen →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

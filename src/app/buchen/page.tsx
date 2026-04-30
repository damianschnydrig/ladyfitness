import type { Metadata } from "next";
import { Suspense } from "react";
import { BookingWizard } from "@/components/BookingWizard";

export const metadata: Metadata = {
  title: "Termin buchen",
  description:
    "Kostenloser Termin für Probetraining oder Personal Training bei Lady Fitness Bremgarten — einfach online buchen.",
};

export default function BuchenPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Online buchen</span>
          <h1 className="reveal">Termin vereinbaren</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ paddingTop: "2rem", paddingBottom: "3rem" }}>
          <Suspense fallback={null}>
            <BookingWizard />
          </Suspense>
        </div>
      </section>
    </main>
  );
}

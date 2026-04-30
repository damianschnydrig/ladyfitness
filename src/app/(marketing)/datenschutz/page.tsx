import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Datenschutz | Lady Fitness Bremgarten",
  description:
    "Datenschutzerklärung von Lady Fitness Bremgarten — Informationen zur Erhebung und Verarbeitung Ihrer Daten.",
  alternates: { canonical: "https://ladyfitness-bremgarten.ch/datenschutz" },
};

export default function DatenschutzPage() {
  return (
    <main>
      <section className="page-hero">
        <div className="container reveal">
          <span className="eyebrow">Rechtliches</span>
          <h1>Datenschutzerklärung</h1>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="reveal" style={{ maxWidth: "720px" }}>
            <h2>Verantwortliche Stelle</h2>
            <p>
              Lady Fitness Bremgarten
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

            <h2 style={{ marginTop: "2rem" }}>
              Datenerhebung auf dieser Website
            </h2>
            <h3>Server-Logdateien</h3>
            <p>
              Beim Aufruf dieser Website werden automatisch Informationen wie Ihr
              Browsertyp, Ihr Betriebssystem, Ihre IP-Adresse, die aufgerufene URL
              sowie Datum und Uhrzeit des Zugriffs in Server-Logdateien erfasst.
              Diese Daten dienen der Gewährleistung des Betriebs, der Sicherheit
              und der technischen Analyse. Eine Zuordnung zu einer bestimmten
              Person ist in der Regel nicht möglich.
            </p>

            <h3>Online-Buchung und Kontaktformular</h3>
            <p>
              Wenn Sie über die{" "}
              <Link href="/buchen">Buchungsseite</Link> einen Termin buchen oder
              über das{" "}
              <Link href="/kontakt">Kontaktformular</Link> eine Nachricht senden,
              verarbeiten wir die von Ihnen angegebenen Daten (z. B. Name, E-Mail,
              Telefon, Nachricht, Buchungsdaten) ausschliesslich zur Bearbeitung
              Ihrer Anfrage bzw. Buchung. Für den Versand von
              E-Mail-Benachrichtigungen kann der Dienst Resend eingesetzt werden (
              <a
                href="https://resend.com/legal/privacy-policy"
                target="_blank"
                rel="noopener"
              >
                Datenschutz Resend
              </a>
              ).
            </p>

            <h3>Cookies</h3>
            <p>
              Diese Website setzt nur technisch notwendige Cookies ein, soweit für
              den Betrieb erforderlich. Es werden keine Tracking- oder
              Werbe-Cookies verwendet.
            </p>

            <h3>Externe Dienste</h3>
            <p>
              Wir verwenden folgende externe Dienste, für die jeweils eigene
              Datenschutzbestimmungen gelten:
            </p>
            <ul
              style={{
                listStyle: "disc",
                marginLeft: "1.5rem",
                marginBottom: "1rem",
              }}
            >
              <li>
                <strong>Google Fonts</strong>: Schriftarten. Beim Laden können
                Verbindungen zu Servern von Google hergestellt werden.{" "}
                <a
                  href="https://policies.google.com/privacy"
                  target="_blank"
                  rel="noopener"
                >
                  Google Datenschutz
                </a>
              </li>
            </ul>

            <h2 style={{ marginTop: "2rem" }}>Ihre Rechte (DSG)</h2>
            <p>
              Gemäss dem schweizerischen Datenschutzgesetz (DSG) haben Sie das
              Recht auf Auskunft, Berichtigung, Löschung sowie Einschränkung der
              Verarbeitung Ihrer personenbezogenen Daten. Kontaktieren Sie uns
              hierzu unter{" "}
              <a href="mailto:info@ladyfitness-bremgarten.ch">
                info@ladyfitness-bremgarten.ch
              </a>
              .
            </p>

            <h2 style={{ marginTop: "2rem" }}>Änderungen</h2>
            <p>
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen. Die
              aktuelle Version ist stets auf dieser Seite abrufbar. Stand: März
              2026.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

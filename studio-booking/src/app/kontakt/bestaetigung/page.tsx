import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Nachricht gesendet",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ContactConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("*")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const row = data as ContactInquiry;

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Kontakt</span>
          <h1 className="reveal">Nachricht erhalten</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 640, textAlign: "center" }}>
          <div className="reveal">
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                border: "2px solid var(--color-dark)",
                fontSize: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              ✉
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.8, marginBottom: "0.5rem" }}>
              Vielen Dank, <strong>{row.first_name}</strong>. Wir haben Ihre
              Nachricht zum Thema <strong>«{row.subject}»</strong> gespeichert
              und melden uns persönlich bei Ihnen.
            </p>
            <p style={{ fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: "2rem" }}>
              Eine Bestätigung wurde an <strong>{row.email}</strong> gesendet.
            </p>
            <Link href="/kontakt" className="btn btn--outline">
              Weitere Nachricht
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getSupabaseServer } from "@/lib/supabase/server";
import { formatZurichTimeRange } from "@/lib/datetime";
import type { BookingWithSlot } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Buchung bestätigt",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function BookingConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("bookings")
    .select("*, slot:time_slots(*)")
    .eq("id", id)
    .single();

  if (!data) notFound();
  const booking = data as BookingWithSlot;

  const typeLabel =
    booking.type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  const when = formatZurichTimeRange(booking.slot.start_at, booking.slot.end_at);

  return (
    <main>
      <section className="page-hero">
        <div className="container">
          <span className="eyebrow reveal">Buchung bestätigt</span>
          <h1 className="reveal">Vielen Dank!</h1>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ maxWidth: 640 }}>
          <div className="reveal" style={{ textAlign: "center" }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 64,
                height: 64,
                border: "2px solid var(--color-pink)",
                color: "var(--color-pink)",
                fontSize: "1.5rem",
                marginBottom: "2rem",
              }}
            >
              ✓
            </div>
            <p style={{ fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.8, marginBottom: "0.75rem" }}>
              Ihre Anfrage für ein <strong>{typeLabel}</strong> ist bei uns
              eingegangen. Sie erhalten in Kürze eine Bestätigung per E-Mail an{" "}
              <strong>{booking.email}</strong>.
            </p>

            <div
              style={{
                border: "1px solid var(--color-border)",
                background: "var(--color-bg-alt)",
                padding: "1.5rem 2rem",
                textAlign: "left",
                margin: "2rem 0",
              }}
            >
              <p
                style={{
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--color-pink)",
                  marginBottom: "0.75rem",
                }}
              >
                Ihr Termin
              </p>
              <p style={{ fontWeight: 600, color: "var(--color-dark)" }}>{when}</p>
              <p style={{ fontSize: "0.875rem", color: "var(--color-muted)", marginTop: "0.25rem" }}>
                {booking.first_name} {booking.last_name}
              </p>
            </div>

            <Link href="/buchen" className="btn btn--outline">
              Weitere Buchung
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

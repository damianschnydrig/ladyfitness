import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingWithSlot, ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const now = DateTime.now().setZone("Europe/Zurich");
  const nowIso = now.toUTC().toISO()!;
  const in48hIso = now.plus({ hours: 48 }).toUTC().toISO()!;
  const supabase = getSupabaseServer();

  const [
    { count: openProbe },
    { count: openPt },
    { count: newContactsCount },
    { data: next48hRaw },
    { data: unreadContactsRaw },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "CONFIRMED")
      .eq("type", "PROBETRAINING"),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("status", "CONFIRMED")
      .eq("type", "PERSONAL_TRAINING"),
    supabase
      .from("contact_inquiries")
      .select("id", { count: "exact", head: true })
      .eq("status", "NEW"),
    supabase
      .from("bookings")
      .select("*, slot:time_slots(*)")
      .eq("status", "CONFIRMED")
      .gte("time_slots.start_at", nowIso)
      .lte("time_slots.start_at", in48hIso)
      .order("time_slots.start_at", { ascending: true }),
    supabase
      .from("contact_inquiries")
      .select("*")
      .eq("status", "NEW")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const next48h = ((next48hRaw ?? []) as BookingWithSlot[]).filter((b) => !!b.slot);
  const unreadContacts = (unreadContactsRaw ?? []) as ContactInquiry[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-brand-dark">Übersicht</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Fokus auf anstehende Aktionen und neue Anfragen.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Offene Probetrainings"
          value={openProbe ?? 0}
          href="/admin/bookings?typ=PROBETRAINING"
          tone="pink"
        />
        <StatCard
          label="Offene Personal Trainings"
          value={openPt ?? 0}
          href="/admin/bookings?typ=PERSONAL_TRAINING"
          tone="dark"
        />
        <StatCard
          label="Neue Kontaktanfragen"
          value={newContactsCount ?? 0}
          href="/admin/contacts"
          tone="muted"
        />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              Anstehende Termine (nächste 48h)
            </h2>
            <Link href="/admin/bookings" className="text-xs font-semibold text-brand-pink hover:underline">
              Alle Buchungen →
            </Link>
          </div>
          {next48h.length === 0 ? (
            <p className="mt-4 text-sm text-brand-muted">Keine anstehenden Termine in den nächsten 48 Stunden.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {next48h.map((b) => (
                <article key={b.id} className="border border-brand-border p-3">
                  <p className="text-xs font-bold uppercase tracking-wide text-brand-pink">
                    {b.type === "PROBETRAINING" ? "Probetraining" : "Personal Training"}
                  </p>
                  <p className="mt-1 text-sm font-medium text-brand-dark">
                    {formatZurichTimeRange(b.slot.start_at, b.slot.end_at)}
                  </p>
                  <p className="text-sm text-brand-muted">
                    {b.first_name} {b.last_name}
                  </p>
                  <Link href={`/admin/bookings#booking-${b.id}`} className="mt-2 inline-block text-xs font-semibold text-brand-pink hover:underline">
                    Zur Buchung →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>

        <div className="border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              Neueste Kontaktanfragen
            </h2>
            <Link href="/admin/contacts" className="text-xs font-semibold text-brand-pink hover:underline">
              Alle →
            </Link>
          </div>
          {unreadContacts.length === 0 ? (
            <p className="mt-4 text-sm text-brand-muted">Keine neuen Anfragen.</p>
          ) : (
            <div className="mt-4 space-y-2">
              {unreadContacts.map((c) => (
                <article key={c.id} className="border border-brand-border p-3">
                  <p className="text-sm font-medium text-brand-dark">{c.subject}</p>
                  <p className="mt-1 text-sm text-brand-muted">
                    {c.first_name} {c.last_name}
                  </p>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  tone,
}: {
  label: string;
  value: number;
  href: string;
  tone: "pink" | "dark" | "muted";
}) {
  const border =
    tone === "pink"
      ? "border-brand-pink/40"
      : tone === "dark"
        ? "border-brand-dark/20"
        : "border-brand-border";
  return (
    <Link href={href} className={`block border-2 bg-white p-5 transition hover:shadow-soft ${border}`}>
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl text-brand-dark">{value}</p>
    </Link>
  );
}

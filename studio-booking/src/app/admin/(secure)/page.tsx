import type { Metadata } from "next";
import Link from "next/link";
import { formatZurichShort, formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingWithSlot, ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false },
};

export default async function AdminDashboardPage() {
  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  const [
    { count: openProbe },
    { count: openPt },
    { count: newContacts },
    { data: nextBookingsRaw },
    { data: recentContactsRaw },
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
      .gte("time_slots.start_at", now)
      .order("created_at", { ascending: true })
      .limit(10),
    supabase
      .from("contact_inquiries")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allNextBookings = (nextBookingsRaw ?? []) as BookingWithSlot[];
  const nextBookings = allNextBookings
    .filter((b) => b.slot && b.slot.start_at >= now)
    .sort((a, b) => new Date(a.slot.start_at).getTime() - new Date(b.slot.start_at).getTime())
    .slice(0, 6);

  const recentContacts = (recentContactsRaw ?? []) as ContactInquiry[];

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl text-brand-dark">Übersicht</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Aktive Anfragen und anstehende Termine auf einen Blick.
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
          value={newContacts ?? 0}
          href="/admin/contacts"
          tone="muted"
        />
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              Nächste Termine
            </h2>
            <Link
              href="/admin/calendar"
              className="text-xs font-semibold text-brand-pink hover:underline"
            >
              Kalender →
            </Link>
          </div>
          {nextBookings.length === 0 ? (
            <p className="mt-4 text-sm text-brand-muted">Keine anstehenden Buchungen.</p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-border text-sm">
              {nextBookings.map((b) => (
                <li key={b.id} className="flex flex-col gap-1 py-3 first:pt-0">
                  <span className="text-xs font-bold uppercase tracking-wide text-brand-pink">
                    {b.type === "PROBETRAINING" ? "Probetraining" : "Personal Training"}
                  </span>
                  <span className="font-medium text-brand-dark">
                    {formatZurichTimeRange(b.slot.start_at, b.slot.end_at)}
                  </span>
                  <span className="text-brand-muted">
                    {b.first_name} {b.last_name} · {b.email}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border border-brand-border bg-white p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
              Letzte Kontaktanfragen
            </h2>
            <Link
              href="/admin/contacts"
              className="text-xs font-semibold text-brand-pink hover:underline"
            >
              Alle →
            </Link>
          </div>
          {recentContacts.length === 0 ? (
            <p className="mt-4 text-sm text-brand-muted">Keine Einträge.</p>
          ) : (
            <ul className="mt-4 divide-y divide-brand-border text-sm">
              {recentContacts.map((c) => (
                <li key={c.id} className="py-3 first:pt-0">
                  <span className="text-xs font-bold uppercase text-brand-dark">Kontakt</span>
                  <p className="mt-1 font-medium">{c.subject}</p>
                  <p className="text-brand-muted">
                    {c.first_name} {c.last_name} · {formatZurichShort(c.created_at)}
                  </p>
                </li>
              ))}
            </ul>
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
    <Link
      href={href}
      className={`block border-2 bg-white p-5 transition hover:shadow-soft ${border}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-brand-muted">{label}</p>
      <p className="mt-2 font-serif text-4xl text-brand-dark">{value}</p>
    </Link>
  );
}

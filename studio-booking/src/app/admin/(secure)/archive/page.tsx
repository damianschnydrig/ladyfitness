import type { Metadata } from "next";
import { formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingWithSlot, ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Archiv",
  robots: { index: false, follow: false },
};

export default async function AdminArchivePage() {
  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  const [
    { data: pastBookingsRaw },
    { data: closedBookingsRaw },
    { data: archivedContactsRaw },
  ] = await Promise.all([
    supabase
      .from("bookings")
      .select("*, slot:time_slots(*)")
      .eq("status", "CONFIRMED")
      .lt("time_slots.end_at", now),
    supabase
      .from("bookings")
      .select("*, slot:time_slots(*)")
      .in("status", ["CANCELLED", "COMPLETED"])
      .order("updated_at", { ascending: false })
      .limit(100),
    supabase
      .from("contact_inquiries")
      .select("*")
      .in("status", ["DONE", "ARCHIVED"])
      .order("updated_at", { ascending: false })
      .limit(100),
  ]);

  const pastBookings = (pastBookingsRaw ?? []) as BookingWithSlot[];
  const closedBookings = (closedBookingsRaw ?? []) as BookingWithSlot[];
  const archivedContacts = (archivedContactsRaw ?? []) as ContactInquiry[];

  // Vergangene bestätigte Buchungen: slot.end_at < now
  const trulyPast = pastBookings.filter(
    (b) => b.slot && new Date(b.slot.end_at).getTime() < new Date(now).getTime()
  );

  const combined = [...trulyPast, ...closedBookings];
  const seen = new Set<string>();
  const uniqueBookings = combined
    .filter((b) => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    })
    .sort((a, b) => {
      if (!a.slot || !b.slot) return 0;
      return new Date(b.slot.start_at).getTime() - new Date(a.slot.start_at).getTime();
    });

  return (
    <div className="space-y-12">
      <div>
        <h1 className="font-serif text-2xl">Archiv</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Vergangene Buchungen und abgeschlossene Kontaktanfragen.
        </p>
      </div>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Buchungen (Historie)
        </h2>
        {uniqueBookings.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">Keine archivierten Buchungen.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {uniqueBookings.map((b) => (
              <li key={b.id} className="border border-brand-border bg-white px-4 py-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${
                      b.type === "PROBETRAINING" ? "text-brand-pink" : "text-brand-dark"
                    }`}
                  >
                    {b.type === "PROBETRAINING" ? "Probetraining" : "Personal Training"}
                  </span>
                  <span className="text-xs text-brand-muted">{b.status}</span>
                </div>
                <p className="mt-1 font-medium">
                  {b.slot ? formatZurichTimeRange(b.slot.start_at, b.slot.end_at) : "–"}
                </p>
                <p className="text-brand-muted">
                  {b.first_name} {b.last_name} · {b.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Kontaktanfragen (erledigt / archiviert)
        </h2>
        {archivedContacts.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">Keine Einträge.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {archivedContacts.map((c) => (
              <li key={c.id} className="border border-brand-border bg-white px-4 py-3 text-sm">
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-brand-dark">Kontakt</span>
                  <span className="text-xs text-brand-muted">{c.status}</span>
                </div>
                <p className="mt-1 font-medium">{c.subject}</p>
                <p className="text-brand-muted">
                  {c.first_name} {c.last_name} · {c.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

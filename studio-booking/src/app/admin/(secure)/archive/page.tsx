import type { Metadata } from "next";
import Link from "next/link";
import { adminDeleteBooking, adminDeleteContactInquiry } from "@/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingWithSlot, ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Archiv",
  robots: { index: false, follow: false },
};

const PAGE_SIZE = 15;
type Props = { searchParams: Promise<{ buchungenSeite?: string; kontakteSeite?: string }> };

export default async function AdminArchivePage({ searchParams }: Props) {
  const sp = await searchParams;
  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  const [{ data: pastBookingsRaw }, { data: closedBookingsRaw }, { data: archivedContactsRaw }] =
    await Promise.all([
      supabase
        .from("bookings")
        .select("*, slot:time_slots(*)")
        .eq("status", "CONFIRMED")
        .lt("time_slots.end_at", now),
      supabase
        .from("bookings")
        .select("*, slot:time_slots(*)")
        .in("status", ["CANCELLED", "COMPLETED"])
        .order("updated_at", { ascending: false }),
      supabase
        .from("contact_inquiries")
        .select("*")
        .in("status", ["DONE", "ARCHIVED"])
        .order("updated_at", { ascending: false }),
    ]);

  const pastBookings = (pastBookingsRaw ?? []) as BookingWithSlot[];
  const closedBookings = (closedBookingsRaw ?? []) as BookingWithSlot[];
  const archivedContacts = (archivedContactsRaw ?? []) as ContactInquiry[];

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

  const bookingsPage = Math.max(1, Number(sp.buchungenSeite ?? "1") || 1);
  const bookingsPages = Math.max(1, Math.ceil(uniqueBookings.length / PAGE_SIZE));
  const bookingsSafePage = Math.min(bookingsPage, bookingsPages);
  const bookingsItems = uniqueBookings.slice(
    (bookingsSafePage - 1) * PAGE_SIZE,
    bookingsSafePage * PAGE_SIZE
  );

  const contactsPage = Math.max(1, Number(sp.kontakteSeite ?? "1") || 1);
  const contactsPages = Math.max(1, Math.ceil(archivedContacts.length / PAGE_SIZE));
  const contactsSafePage = Math.min(contactsPage, contactsPages);
  const contactsItems = archivedContacts.slice(
    (contactsSafePage - 1) * PAGE_SIZE,
    contactsSafePage * PAGE_SIZE
  );

  const archiveHref = (nextBookingsPage: number, nextContactsPage: number) =>
    `/admin/archive?buchungenSeite=${nextBookingsPage}&kontakteSeite=${nextContactsPage}`;

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
          <>
            <ul className="mt-4 space-y-2">
              {bookingsItems.map((b) => (
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
                  <form action={adminDeleteBooking} className="mt-3">
                    <input type="hidden" name="id" value={b.id} />
                    <ConfirmDeleteButton
                      label="Löschen"
                      confirmMessage="Wirklich löschen?"
                      className="inline-flex border border-red-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-50"
                    />
                  </form>
                </li>
              ))}
            </ul>
            <Pagination
              page={bookingsSafePage}
              totalPages={bookingsPages}
              prevHref={archiveHref(Math.max(1, bookingsSafePage - 1), contactsSafePage)}
              nextHref={archiveHref(Math.min(bookingsPages, bookingsSafePage + 1), contactsSafePage)}
            />
          </>
        )}
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Kontaktanfragen (erledigt / archiviert)
        </h2>
        {archivedContacts.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">Keine Einträge.</p>
        ) : (
          <>
            <ul className="mt-4 space-y-2">
              {contactsItems.map((c) => (
                <li key={c.id} className="border border-brand-border bg-white px-4 py-3 text-sm">
                  <div className="flex flex-wrap justify-between gap-2">
                    <span className="text-[10px] font-bold uppercase text-brand-dark">Kontakt</span>
                    <span className="text-xs text-brand-muted">{c.status}</span>
                  </div>
                  <p className="mt-1 font-medium">{c.subject}</p>
                  <p className="text-brand-muted">
                    {c.first_name} {c.last_name} · {c.email}
                  </p>
                  <form action={adminDeleteContactInquiry} className="mt-3">
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmDeleteButton
                      label="Löschen"
                      confirmMessage="Wirklich löschen?"
                      className="inline-flex border border-red-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-50"
                    />
                  </form>
                </li>
              ))}
            </ul>
            <Pagination
              page={contactsSafePage}
              totalPages={contactsPages}
              prevHref={archiveHref(bookingsSafePage, Math.max(1, contactsSafePage - 1))}
              nextHref={archiveHref(bookingsSafePage, Math.min(contactsPages, contactsSafePage + 1))}
            />
          </>
        )}
      </section>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  prevHref,
  nextHref,
}: {
  page: number;
  totalPages: number;
  prevHref: string;
  nextHref: string;
}) {
  return (
    <div className="mt-4 flex items-center justify-between border border-brand-border bg-white px-4 py-3 text-sm">
      <Link
        href={prevHref}
        aria-disabled={page <= 1}
        className={`border px-3 py-1.5 font-semibold ${
          page <= 1
            ? "pointer-events-none border-brand-border/40 text-brand-border"
            : "border-brand-border hover:border-brand-pink"
        }`}
      >
        ← Zurück
      </Link>
      <span className="text-brand-muted">
        Seite {page} von {totalPages}
      </span>
      <Link
        href={nextHref}
        aria-disabled={page >= totalPages}
        className={`border px-3 py-1.5 font-semibold ${
          page >= totalPages
            ? "pointer-events-none border-brand-border/40 text-brand-border"
            : "border-brand-border hover:border-brand-pink"
        }`}
      >
        Weiter →
      </Link>
    </div>
  );
}

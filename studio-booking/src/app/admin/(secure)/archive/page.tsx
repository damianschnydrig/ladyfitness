import type { Metadata } from "next";
import { formatZurichTimeRange } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Archiv",
  robots: { index: false, follow: false },
};

export default async function AdminArchivePage() {
  const now = new Date();

  const [pastBookings, closedBookings, archivedContacts] = await Promise.all([
    prisma.booking.findMany({
      where: {
        status: "CONFIRMED",
        slot: { endAt: { lt: now } },
      },
      include: { slot: true },
      orderBy: { slot: { startAt: "desc" } },
      take: 100,
    }),
    prisma.booking.findMany({
      where: { status: { in: ["CANCELLED", "COMPLETED"] } },
      include: { slot: true },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
    prisma.contactInquiry.findMany({
      where: { status: { in: ["DONE", "ARCHIVED"] } },
      orderBy: { updatedAt: "desc" },
      take: 100,
    }),
  ]);

  const bookingArchive = [...pastBookings, ...closedBookings].sort(
    (a, b) => b.slot.startAt.getTime() - a.slot.startAt.getTime()
  );

  const seen = new Set<string>();
  const uniqueBookings = bookingArchive.filter((b) => {
    if (seen.has(b.id)) return false;
    seen.add(b.id);
    return true;
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
              <li
                key={b.id}
                className="border border-brand-border bg-white px-4 py-3 text-sm"
              >
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
                  {formatZurichTimeRange(b.slot.startAt, b.slot.endAt)}
                </p>
                <p className="text-brand-muted">
                  {b.firstName} {b.lastName} · {b.email}
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
              <li
                key={c.id}
                className="border border-brand-border bg-white px-4 py-3 text-sm"
              >
                <div className="flex flex-wrap justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase text-brand-dark">
                    Kontakt
                  </span>
                  <span className="text-xs text-brand-muted">{c.status}</span>
                </div>
                <p className="mt-1 font-medium">{c.subject}</p>
                <p className="text-brand-muted">
                  {c.firstName} {c.lastName} · {c.email}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

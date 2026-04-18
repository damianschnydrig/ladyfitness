import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { formatZurichShort } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { TimeSlotWithBooking } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Kalender",
  robots: { index: false, follow: false },
};

type Props = { searchParams: Promise<{ monat?: string }> };

export default async function AdminCalendarPage({ searchParams }: Props) {
  const sp = await searchParams;
  const zone = "Europe/Zurich";
  const base = sp.monat
    ? DateTime.fromISO(`${sp.monat}-01`, { zone })
    : DateTime.now().setZone(zone);

  if (!base.isValid) {
    return <p className="text-sm text-red-600">Ungültiger Monat.</p>;
  }

  const start = base.startOf("month").toUTC().toISO()!;
  const end = base.endOf("month").toUTC().toISO()!;

  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("time_slots")
    .select("*, booking:bookings(*)")
    .gte("start_at", start)
    .lte("start_at", end)
    .order("start_at", { ascending: true });

  const slots = (data ?? []) as TimeSlotWithBooking[];

  const byDay = new Map<string, typeof slots>();
  for (const s of slots) {
    const key = DateTime.fromISO(s.start_at, { zone: "utc" })
      .setZone(zone)
      .toFormat("yyyy-MM-dd");
    const list = byDay.get(key) ?? [];
    list.push(s);
    byDay.set(key, list);
  }

  const days = [...byDay.keys()].sort();

  const prev = base.minus({ months: 1 }).toFormat("yyyy-MM");
  const next = base.plus({ months: 1 }).toFormat("yyyy-MM");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Kalender</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Freie und gebuchte Slots im Monat — Wandzeit Zürich.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            className="border border-brand-border px-3 py-2 font-semibold hover:border-brand-pink"
            href={`/admin/calendar?monat=${prev}`}
          >
            ←
          </Link>
          <span className="min-w-[140px] text-center font-serif text-lg">
            {base.setLocale("de-ch").toFormat("LLLL yyyy")}
          </span>
          <Link
            className="border border-brand-border px-3 py-2 font-semibold hover:border-brand-pink"
            href={`/admin/calendar?monat=${next}`}
          >
            →
          </Link>
        </div>
      </div>

      {days.length === 0 ? (
        <p className="text-sm text-brand-muted">Keine Slots in diesem Monat.</p>
      ) : (
        <div className="space-y-6">
          {days.map((day) => {
            const list = byDay.get(day)!;
            const label = DateTime.fromISO(day, { zone }).setLocale("de-ch").toFormat("EEEE, d. MMMM");
            return (
              <section key={day} className="border border-brand-border bg-white">
                <h2 className="border-b border-brand-border bg-brand-alt/50 px-4 py-2 text-sm font-bold uppercase tracking-wider text-brand-dark">
                  {label}
                </h2>
                <ul className="divide-y divide-brand-border">
                  {list.map((s) => {
                    const booked = !!s.booking;
                    return (
                      <li
                        key={s.id}
                        className="flex flex-wrap items-start justify-between gap-4 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-brand-dark">
                            {formatZurichShort(s.start_at)} –{" "}
                            {DateTime.fromISO(s.end_at, { zone: "utc" })
                              .setZone(zone)
                              .toFormat("HH:mm")}
                          </p>
                          <p className="mt-1 text-xs text-brand-muted">
                            Slot-ID: {s.id.slice(0, 8)}…
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <TypeBadge type={s.booking_type} />
                          <span
                            className={`text-xs font-bold uppercase tracking-wider ${
                              booked ? "text-brand-pink-dark" : "text-green-700"
                            }`}
                          >
                            {booked ? "Gebucht" : "Frei"}
                          </span>
                          {booked && s.booking ? (
                            <span className="max-w-xs text-right text-xs text-brand-muted">
                              {s.booking.first_name} {s.booking.last_name} · {s.booking.email}
                            </span>
                          ) : null}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TypeBadge({ type }: { type: string }) {
  const probe = type === "PROBETRAINING";
  return (
    <span
      className={`inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
        probe ? "bg-brand-pink/15 text-brand-pink-dark" : "bg-brand-dark/10 text-brand-dark"
      }`}
    >
      {probe ? "Probetraining" : "Personal Training"}
    </span>
  );
}

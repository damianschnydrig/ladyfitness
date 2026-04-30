import type { Metadata } from "next";
import Link from "next/link";
import { DateTime } from "luxon";
import { AdminBookingMonthCalendar } from "@/components/admin/AdminBookingMonthCalendar";
import { formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingType } from "@/lib/supabase/types";

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
    .from("bookings")
    .select("id, type, first_name, last_name, email, status, slot:time_slots!inner(start_at, end_at)")
    .eq("status", "CONFIRMED")
    .gte("time_slots.start_at", start)
    .lte("time_slots.start_at", end)
    .order("time_slots.start_at", { ascending: true });

  const bookings = ((data ?? []) as Array<{
    id: string;
    type: BookingType;
    first_name: string;
    last_name: string;
    email: string;
    slot: { start_at: string; end_at: string } | null;
  }>)
    .filter((row) => !!row.slot)
    .map((row) => ({
      id: row.id,
      type: row.type,
      firstName: row.first_name,
      lastName: row.last_name,
      email: row.email,
      startAt: row.slot!.start_at,
      endAt: row.slot!.end_at,
      whenLabel: formatZurichTimeRange(row.slot!.start_at, row.slot!.end_at),
    }));

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl">Kalender</h1>
          <p className="mt-1 text-sm text-brand-muted">
            Monatsansicht mit gebuchten Terminen als farbige Blöcke.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Link
            className="border border-brand-border px-3 py-2 font-semibold hover:border-brand-pink"
            href={`/admin/calendar?monat=${base.minus({ months: 1 }).toFormat("yyyy-MM")}`}
          >
            ←
          </Link>
          <span className="min-w-[140px] text-center font-serif text-lg">
            {base.setLocale("de-CH").toFormat("LLLL yyyy")}
          </span>
          <Link
            className="border border-brand-border px-3 py-2 font-semibold hover:border-brand-pink"
            href={`/admin/calendar?monat=${base.plus({ months: 1 }).toFormat("yyyy-MM")}`}
          >
            →
          </Link>
        </div>
      </div>

      <AdminBookingMonthCalendar monthIso={base.toISODate()!} bookings={bookings} />
      {bookings.length === 0 ? (
        <p suppressHydrationWarning className="text-sm text-brand-muted">
          Keine gebuchten Termine in diesem Monat.
        </p>
      ) : null}
    </div>
  );
}

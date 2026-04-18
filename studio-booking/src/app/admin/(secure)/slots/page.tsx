import type { Metadata } from "next";
import { adminDeleteSlot } from "@/actions/admin";
import { AdminSlotWeekGrid, type SerializedSlot } from "@/components/admin/AdminSlotWeekGrid";
import { formatZurichTimeRange, isPastSlot } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { TimeSlotWithBooking } from "@/lib/supabase/types";
import { DateTime } from "luxon";

export const metadata: Metadata = {
  title: "Verfügbarkeiten",
  robots: { index: false, follow: false },
};

const ZONE = "Europe/Zurich";

function mondayOfWeekContaining(isoDay: string): DateTime {
  const d = DateTime.fromISO(isoDay, { zone: ZONE }).startOf("day");
  if (!d.isValid) {
    const now = DateTime.now().setZone(ZONE).startOf("day");
    return now.minus({ days: now.weekday - 1 });
  }
  return d.minus({ days: d.weekday - 1 });
}

type Search = { searchParams: Promise<{ woche?: string }> };

export default async function AdminSlotsPage({ searchParams }: Search) {
  const sp = await searchParams;
  let monday: DateTime;

  if (sp.woche && /^\d{4}-\d{2}-\d{2}$/.test(sp.woche)) {
    monday = mondayOfWeekContaining(sp.woche);
  } else {
    const now = DateTime.now().setZone(ZONE).startOf("day");
    monday = now.minus({ days: now.weekday - 1 });
  }

  const weekStart = monday.toUTC().toISO()!;
  const weekEnd = monday.plus({ days: 7 }).toUTC().toISO()!;
  const now = new Date().toISOString();

  const supabase = getSupabaseServer();

  const [{ data: weekSlotsRaw }, { data: futureSlotsRaw }] = await Promise.all([
    supabase
      .from("time_slots")
      .select("*, booking:bookings(*)")
      .gte("start_at", weekStart)
      .lt("start_at", weekEnd)
      .order("start_at", { ascending: true }),
    supabase
      .from("time_slots")
      .select("*, booking:bookings(*)")
      .gte("start_at", now)
      .order("start_at", { ascending: true }),
  ]);

  const weekSlots = (weekSlotsRaw ?? []) as TimeSlotWithBooking[];
  const futureSlots = (futureSlotsRaw ?? []) as TimeSlotWithBooking[];

  const serializedWeek: SerializedSlot[] = weekSlots.map((s) => ({
    id: s.id,
    startAt: s.start_at,
    endAt: s.end_at,
    bookingType: s.booking_type,
    booked: !!s.booking,
  }));

  const weekMondayISO = monday.toFormat("yyyy-MM-dd");
  const prevWeekISO = monday.minus({ weeks: 1 }).toFormat("yyyy-MM-dd");
  const nextWeekISO = monday.plus({ weeks: 1 }).toFormat("yyyy-MM-dd");

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl">Verfügbarkeiten</h1>
        <p className="mt-1 text-sm text-brand-muted">
          In der Wochenvorschau freie Felder anklicken — Typ und Dauer oben wählen. Ungebuchte
          Slots können Sie im Raster oder in der Liste löschen.
        </p>
      </div>

      <AdminSlotWeekGrid
        weekMondayISO={weekMondayISO}
        prevWeekISO={prevWeekISO}
        nextWeekISO={nextWeekISO}
        slots={serializedWeek}
      />

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Zukünftige Slots
        </h2>
        {futureSlots.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">Keine Slots angelegt.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {futureSlots.map((s) => {
              const booked = !!s.booking;
              const past = isPastSlot(s.end_at);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 border border-brand-border bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatZurichTimeRange(s.start_at, s.end_at)}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {s.booking_type === "PROBETRAINING"
                        ? "Probetraining"
                        : "Personal Training"}{" "}
                      · {booked ? "gebucht" : "frei"}
                      {past ? " · vergangen" : ""}
                    </p>
                  </div>
                  {!booked ? (
                    <form action={adminDeleteSlot}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline"
                      >
                        Löschen
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-brand-muted">Gebucht — nicht löschbar</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

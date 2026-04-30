"use client";

import { DateTime } from "luxon";
import { useMemo, useState } from "react";

type CalendarBooking = {
  id: string;
  type: "PROBETRAINING" | "PERSONAL_TRAINING";
  firstName: string;
  lastName: string;
  email: string;
  startAt: string;
  endAt: string;
  whenLabel: string;
};

type Props = {
  monthIso: string;
  bookings: CalendarBooking[];
};

export function AdminBookingMonthCalendar({ monthIso, bookings }: Props) {
  const zone = "Europe/Zurich";
  const month = DateTime.fromISO(monthIso, { zone }).startOf("month");
  const [selected, setSelected] = useState<CalendarBooking | null>(null);

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarBooking[]>();
    for (const booking of bookings) {
      const key = DateTime.fromISO(booking.startAt, { zone: "utc" })
        .setZone(zone)
        .toFormat("yyyy-MM-dd");
      const list = map.get(key) ?? [];
      list.push(booking);
      map.set(key, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime());
    }
    return map;
  }, [bookings]);

  const firstGridDay = month.startOf("week");
  const cells = Array.from({ length: 42 }, (_, index) => firstGridDay.plus({ days: index }));
  const weekdays = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

  return (
    <>
      <div className="overflow-hidden border border-brand-border bg-white">
        <div className="grid grid-cols-7 border-b border-brand-border bg-brand-alt/40 text-center text-[11px] font-bold uppercase tracking-wider text-brand-muted">
          {weekdays.map((day) => (
            <div key={day} className="px-2 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {cells.map((day) => {
            const dayKey = day.toFormat("yyyy-MM-dd");
            const dayBookings = byDay.get(dayKey) ?? [];
            const inMonth = day.month === month.month;
            return (
              <div
                key={dayKey}
                className={`min-h-32 border-b border-r border-brand-border p-2 ${
                  inMonth ? "bg-white" : "bg-brand-alt/20"
                }`}
              >
                <p className={`text-xs ${inMonth ? "text-brand-dark" : "text-brand-muted"}`}>
                  {day.toFormat("d")}
                </p>
                <div className="mt-2 space-y-1">
                  {dayBookings.map((booking) => (
                    <button
                      key={booking.id}
                      type="button"
                      onClick={() => setSelected(booking)}
                      className={`block w-full truncate px-2 py-1 text-left text-[11px] font-semibold ${
                        booking.type === "PROBETRAINING"
                          ? "bg-brand-pink/20 text-brand-pink-dark"
                          : "bg-brand-dark/15 text-brand-dark"
                      }`}
                    >
                      {DateTime.fromISO(booking.startAt, { zone: "utc" })
                        .setZone(zone)
                        .toFormat("HH:mm")}{" "}
                      {booking.firstName}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md border border-brand-border bg-white p-5">
            <h3 className="font-serif text-xl">Termin-Details</h3>
            <p className="mt-2 text-sm text-brand-muted">
              {selected.type === "PROBETRAINING" ? "Probetraining" : "Personal Training"}
            </p>
            <p className="mt-2 text-sm font-medium text-brand-dark">{selected.whenLabel}</p>
            <p className="mt-1 text-sm text-brand-muted">
              {selected.firstName} {selected.lastName} · {selected.email}
            </p>
            <div className="mt-5 flex gap-2">
              <a
                href={`/admin/bookings#booking-${selected.id}`}
                className="border border-brand-border px-3 py-2 text-xs font-bold uppercase tracking-wider hover:border-brand-pink"
              >
                Zur Buchung springen
              </a>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="border border-brand-border px-3 py-2 text-xs font-bold uppercase tracking-wider"
              >
                Schliessen
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

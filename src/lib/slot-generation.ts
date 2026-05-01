import { DateTime } from "luxon";

export const ZURICH_ZONE = "Europe/Zurich";

/** Luxon weekday 1–7 (Mo–So) → DB `day_of_week` 0–6 (So–Sa, wie JS getDay()) */
export function luxonWeekdayToDbDayOfWeek(weekday: number): number {
  return weekday % 7;
}

/** DB `day_of_week` → Luxon weekday 1–7 */
export function dbDayOfWeekToLuxonWeekday(dow: number): number {
  return dow === 0 ? 7 : dow;
}

/**
 * Startzeitpunkte für Slots im angegebenen Kalendertag (Europe/Zurich).
 * `startHHmm` / `endHHmm` im 24h-Format HH:mm.
 */
export function generateSlotStarts(
  dayStart: DateTime,
  startHHmm: string,
  endHHmm: string,
  slotDurationMinutes: number,
): DateTime[] {
  const [sh, sm] = startHHmm.split(":").map(Number);
  const [eh, em] = endHHmm.split(":").map(Number);
  const start = dayStart.set({ hour: sh, minute: sm, second: 0, millisecond: 0 });
  const end = dayStart.set({ hour: eh, minute: em, second: 0, millisecond: 0 });

  const out: DateTime[] = [];
  let cursor = start;
  while (cursor.plus({ minutes: slotDurationMinutes }) <= end) {
    out.push(cursor);
    cursor = cursor.plus({ minutes: slotDurationMinutes });
  }
  return out;
}

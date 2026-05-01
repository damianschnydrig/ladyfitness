import { DateTime } from "luxon";

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

/** Interpretiert Datum + Uhrzeit als Europe/Zurich (Wandzeit) und liefert UTC-Instant als Date. */
export function parseZurichWallClock(date: string, timeHHmm: string): Date {
  const dt = DateTime.fromISO(`${date}T${timeHHmm}`, {
    zone: "Europe/Zurich",
  });
  if (!dt.isValid) {
    throw new Error(`Ungültiges Datum oder Uhrzeit: ${dt.invalidReason}`);
  }
  return dt.toUTC().toJSDate();
}

export function formatZurichLong(date: Date | string): string {
  return DateTime.fromJSDate(toDate(date), { zone: "utc" })
    .setZone("Europe/Zurich")
    .setLocale("de-CH")
    .toFormat("cccc, d. MMMM yyyy · HH:mm 'Uhr'");
}

export function formatZurichShort(date: Date | string): string {
  return DateTime.fromJSDate(toDate(date), { zone: "utc" })
    .setZone("Europe/Zurich")
    .setLocale("de-CH")
    .toFormat("dd.MM.yyyy HH:mm");
}

export function isPastSlot(endAt: Date | string): boolean {
  return toDate(endAt).getTime() < Date.now();
}

export function formatZurichTimeRange(start: Date | string, end: Date | string): string {
  const a = DateTime.fromJSDate(toDate(start), { zone: "utc" }).setZone("Europe/Zurich");
  const b = DateTime.fromJSDate(toDate(end), { zone: "utc" }).setZone("Europe/Zurich");
  return `${a.setLocale("de-CH").toFormat("cccc, d. MMMM yyyy")}, ${a.toFormat("HH:mm")}–${b.toFormat("HH:mm")} Uhr`;
}

import { DateTime } from "luxon";

function toDate(value: Date | string): Date {
  if (value instanceof Date) return value;
  return new Date(value);
}

function toIso(value: Date | string): string {
  if (typeof value === "string") return value;
  return value.toISOString();
}

/** Gibt die ersten 5 Zeichen der Zeitkomponente eines ISO-Strings zurück (HH:MM). */
function sliceTime(iso: string): string {
  return iso.slice(11, 16);
}

/** Gibt den Datumsteil eines ISO-Strings zurück (yyyy-MM-dd). */
function sliceDate(iso: string): string {
  return iso.slice(0, 10);
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
  const iso = toIso(date);
  const time = sliceTime(iso);
  const dt = DateTime.fromISO(sliceDate(iso)).setLocale("de-CH");
  return `${dt.toFormat("cccc, d. MMMM yyyy")} · ${time} Uhr`;
}

export function formatZurichShort(date: Date | string): string {
  const iso = toIso(date);
  const [year, month, day] = sliceDate(iso).split("-");
  const time = sliceTime(iso);
  return `${day}.${month}.${year} ${time}`;
}

export function isPastSlot(endAt: Date | string): boolean {
  return toDate(endAt).getTime() < Date.now();
}

export function formatZurichTimeRange(start: Date | string, end: Date | string): string {
  const startIso = toIso(start);
  const endIso = toIso(end);
  const startTime = sliceTime(startIso);
  const endTime = sliceTime(endIso);
  const dt = DateTime.fromISO(sliceDate(startIso)).setLocale("de-CH");
  return `${dt.toFormat("cccc, d. MMMM yyyy")}, ${startTime}–${endTime} Uhr`;
}

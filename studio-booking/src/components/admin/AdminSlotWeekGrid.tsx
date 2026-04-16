"use client";

import { adminCreateSlot, adminDeleteSlot } from "@/actions/admin";
import { DateTime } from "luxon";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useCallback, useMemo, useState, useTransition } from "react";

const ZONE = "Europe/Zurich";

/** 7:00 … 20:30 in 30-Minuten-Schritten */
const TIME_ROWS: string[] = (() => {
  const r: string[] = [];
  for (let h = 7; h <= 20; h++) {
    const hh = String(h).padStart(2, "0");
    r.push(`${hh}:00`, `${hh}:30`);
  }
  return r;
})();

const ROW_PX = 26;
const DURATION_OPTIONS = [
  { value: 30, label: "30 Min." },
  { value: 45, label: "45 Min." },
  { value: 60, label: "60 Min." },
  { value: 90, label: "90 Min." },
] as const;

export type SerializedSlot = {
  id: string;
  startAt: string;
  endAt: string;
  bookingType: "PROBETRAINING" | "PERSONAL_TRAINING";
  booked: boolean;
};

type Props = {
  weekMondayISO: string;
  prevWeekISO: string;
  nextWeekISO: string;
  slots: SerializedSlot[];
};

function dayISOsFromMonday(mondayISO: string): string[] {
  const mon = DateTime.fromISO(mondayISO, { zone: ZONE }).startOf("day");
  return Array.from({ length: 7 }, (_, i) => mon.plus({ days: i }).toFormat("yyyy-MM-dd"));
}

function parseWallFromISO(iso: string): DateTime {
  return DateTime.fromISO(iso, { zone: "utc" }).setZone(ZONE);
}

/** Minuten ab 7:00 am gleichen Kalendertag (Zürich); außerhalb 7–21 Uhr → clamp */
function minutesFromDay7am(dayISO: string, dt: DateTime): number {
  const day7 = DateTime.fromISO(dayISO, { zone: ZONE }).set({ hour: 7, minute: 0, second: 0, millisecond: 0 });
  return Math.round(dt.diff(day7, "minutes").minutes);
}

function overlaps(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function AdminSlotWeekGrid({ weekMondayISO, prevWeekISO, nextWeekISO, slots }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [bookingType, setBookingType] = useState<"PROBETRAINING" | "PERSONAL_TRAINING">("PROBETRAINING");
  const [durationMin, setDurationMin] = useState<number>(60);
  const [message, setMessage] = useState<string | null>(null);

  const days = useMemo(() => dayISOsFromMonday(weekMondayISO), [weekMondayISO]);

  const weekLabel = useMemo(() => {
    const start = DateTime.fromISO(weekMondayISO, { zone: ZONE }).setLocale("de-CH");
    const end = start.plus({ days: 6 });
    return `${start.toFormat("d. MMM")} – ${end.toFormat("d. MMM yyyy")}`;
  }, [weekMondayISO]);

  const slotsByDay = useMemo(() => {
    const map = new Map<string, SerializedSlot[]>();
    for (const d of days) {
      map.set(d, []);
    }
    for (const s of slots) {
      const sd = parseWallFromISO(s.startAt).toFormat("yyyy-MM-dd");
      const list = map.get(sd);
      if (list) list.push(s);
    }
    for (const list of map.values()) {
      list.sort((a, b) => parseWallFromISO(a.startAt).toMillis() - parseWallFromISO(b.startAt).toMillis());
    }
    return map;
  }, [slots, days]);

  const tryCreate = useCallback(
    (dateISO: string, startHHmm: string) => {
      setMessage(null);
      const start = DateTime.fromISO(`${dateISO}T${startHHmm}`, { zone: ZONE });
      if (!start.isValid) return;
      const end = start.plus({ minutes: durationMin });
      const startM = minutesFromDay7am(dateISO, start);
      const endM = minutesFromDay7am(dateISO, end);
      if (startM < 0 || endM > 14 * 60) {
        setMessage("Zeit liegt außerhalb des sichtbaren Bereichs (7:00–21:00).");
        return;
      }

      if (start.toMillis() <= Date.now()) {
        setMessage("Nur zukünftige Zeiten sind möglich.");
        return;
      }

      const newStart = start.toMillis();
      const newEnd = end.toMillis();

      for (const s of slots) {
        const os = parseWallFromISO(s.startAt).toMillis();
        const oe = parseWallFromISO(s.endAt).toMillis();
        if (overlaps(newStart, newEnd, os, oe)) {
          setMessage("Hier kollidiert ein Slot mit einer bestehenden Zeit.");
          return;
        }
      }

      const fd = new FormData();
      fd.set("date", dateISO);
      fd.set("startTime", start.toFormat("HH:mm"));
      fd.set("endTime", end.toFormat("HH:mm"));
      fd.set("bookingType", bookingType);

      startTransition(async () => {
        await adminCreateSlot(fd);
        router.refresh();
      });
    },
    [bookingType, durationMin, router, slots],
  );

  return (
    <section className="border border-brand-border bg-white p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
            Woche auswählen & Slots setzen
          </h2>
          <p className="mt-1 max-w-xl text-xs text-brand-muted">
            Klicken Sie auf ein freies Feld für den Beginn. Dauer und Typ gelten für den nächsten Klick. Bereits
            gebuchte Slots können nicht gelöscht werden.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            className="border border-brand-border px-3 py-2 text-sm font-semibold hover:border-brand-pink"
            href={`/admin/slots?woche=${prevWeekISO}`}
          >
            ← Vorherige Woche
          </Link>
          <span className="min-w-[160px] text-center font-serif text-base">{weekLabel}</span>
          <Link
            className="border border-brand-border px-3 py-2 text-sm font-semibold hover:border-brand-pink"
            href={`/admin/slots?woche=${nextWeekISO}`}
          >
            Nächste Woche →
          </Link>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-end gap-4 border-b border-brand-border pb-4">
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Typ für neue Slots</span>
          <select
            className="field max-w-xs"
            value={bookingType}
            onChange={(e) => setBookingType(e.target.value as "PROBETRAINING" | "PERSONAL_TRAINING")}
          >
            <option value="PROBETRAINING">Probetraining</option>
            <option value="PERSONAL_TRAINING">Personal Training</option>
          </select>
        </label>
        <label className="text-sm">
          <span className="mb-1 block font-semibold">Dauer</span>
          <select
            className="field max-w-xs"
            value={durationMin}
            onChange={(e) => setDurationMin(Number(e.target.value))}
          >
            {DURATION_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        {pending ? <span className="text-xs text-brand-muted">Speichern …</span> : null}
      </div>

      {message ? (
        <p className="mt-3 text-sm text-red-600" role="status">
          {message}
        </p>
      ) : null}

      <div className="mt-4 overflow-x-auto">
        <div
          className="inline-flex min-w-[720px] gap-0 border border-brand-border"
          style={{ minHeight: TIME_ROWS.length * ROW_PX + 40 }}
        >
          <div
            className="flex w-12 shrink-0 flex-col border-r border-brand-border bg-brand-alt/40 pt-8 text-[10px] text-brand-muted"
            style={{ height: TIME_ROWS.length * ROW_PX + 32 }}
          >
            {TIME_ROWS.map((t) => (
              <div
                key={t}
                className="flex shrink-0 items-start justify-end pr-1"
                style={{ height: ROW_PX }}
              >
                {t.endsWith(":00") ? <span className="pt-0.5 font-medium text-brand-dark">{t}</span> : null}
              </div>
            ))}
          </div>

          {days.map((dayISO) => (
            <DayColumn
              key={dayISO}
              dayISO={dayISO}
              slots={slotsByDay.get(dayISO) ?? []}
              durationMin={durationMin}
              onCreate={tryCreate}
              pending={pending}
            />
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-brand-muted">
        Hinweis: Slots außerhalb des Rasters (z. B. :15) erscheinen weiterhin in der Liste «Zukünftige Slots»
        unten.
      </p>
    </section>
  );
}

function DayColumn({
  dayISO,
  slots: daySlots,
  durationMin,
  onCreate,
  pending,
}: {
  dayISO: string;
  slots: SerializedSlot[];
  durationMin: number;
  onCreate: (dateISO: string, startHHmm: string) => void;
  pending: boolean;
}) {
  const label = DateTime.fromISO(dayISO, { zone: ZONE }).setLocale("de-CH");
  const weekday = label.toFormat("ccc");
  const dayNum = label.toFormat("d.");

  const { rowBlocks, orphanSlots } = useMemo(
    () => buildRowLayout(dayISO, daySlots, TIME_ROWS),
    [dayISO, daySlots],
  );

  return (
    <div className="relative w-[92px] shrink-0 border-r border-brand-border last:border-r-0 sm:w-[100px]">
      <div className="sticky top-0 z-20 border-b border-brand-border bg-white px-1 py-2 text-center">
        <p className="text-[10px] font-bold uppercase tracking-wider text-brand-muted">{weekday}</p>
        <p className="font-serif text-sm text-brand-dark">{dayNum}</p>
      </div>

      <div className="relative" style={{ height: TIME_ROWS.length * ROW_PX }}>
        {rowBlocks.map((block, idx) => {
          if (block.kind === "empty") {
            const t = TIME_ROWS[idx];
            const canTry = !pending && canPlaceAt(dayISO, t, durationMin, daySlots);
            return (
              <button
                key={`${dayISO}-${t}-empty`}
                type="button"
                disabled={pending || !canTry}
                title={canTry ? `Slot ab ${t}` : "Belegt oder außerhalb"}
                className={`absolute left-0 right-0 border-b border-brand-border/60 text-left transition ${
                  canTry
                    ? "cursor-pointer hover:bg-brand-pink/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-pink"
                    : "cursor-not-allowed bg-brand-alt/20"
                }`}
                style={{ top: idx * ROW_PX, height: ROW_PX }}
                onClick={() => canTry && onCreate(dayISO, t)}
              />
            );
          }

          if (block.kind === "skip") {
            return <Fragment key={`${dayISO}-skip-${idx}`} />;
          }

          const s = block.slot;
          const hPx = block.span * ROW_PX;
          const probe = s.bookingType === "PROBETRAINING";
          return (
            <div
              key={s.id}
              className={`absolute left-0.5 right-0.5 flex flex-col rounded border px-0.5 py-0.5 text-[9px] leading-tight ${
                s.booked
                  ? "border-brand-pink/40 bg-brand-pink/15 text-brand-dark"
                  : "border-green-700/30 bg-green-50 text-green-900"
              }`}
              style={{ top: block.topIdx * ROW_PX, height: hPx, zIndex: 5 }}
            >
              <span className={`font-bold uppercase ${probe ? "text-brand-pink-dark" : "text-brand-dark"}`}>
                {probe ? "Probe" : "PT"}
              </span>
              <span className="text-brand-muted">
                {parseWallFromISO(s.startAt).toFormat("HH:mm")}–{parseWallFromISO(s.endAt).toFormat("HH:mm")}
              </span>
              {s.booked ? (
                <span className="mt-auto text-[8px] font-bold text-brand-pink-dark">Gebucht</span>
              ) : (
                <form action={adminDeleteSlot} className="mt-auto">
                  <input type="hidden" name="id" value={s.id} />
                  <button
                    type="submit"
                    className="text-[8px] font-bold uppercase text-red-600 hover:underline"
                    disabled={pending}
                  >
                    Löschen
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>

      {orphanSlots.length > 0 ? (
        <ul className="border-t border-brand-border bg-brand-alt/30 p-1 text-[9px] text-brand-muted">
          {orphanSlots.map((s) => (
            <li key={s.id}>
              {parseWallFromISO(s.startAt).toFormat("HH:mm")}–{parseWallFromISO(s.endAt).toFormat("HH:mm")}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type RowBlock =
  | { kind: "empty" }
  | { kind: "skip" }
  | { kind: "slot"; slot: SerializedSlot; span: number; topIdx: number };

function buildRowLayout(
  dayISO: string,
  daySlots: SerializedSlot[],
  timeRows: string[],
): { rowBlocks: RowBlock[]; orphanSlots: SerializedSlot[] } {
  const rowBlocks: RowBlock[] = timeRows.map(() => ({ kind: "empty" as const }));
  const orphans: SerializedSlot[] = [];

  const onGrid = (iso: string) => {
    const m = DateTime.fromISO(`${dayISO}T${iso}`, { zone: ZONE });
    return m.isValid && timeRows.includes(m.toFormat("HH:mm"));
  };

  for (const s of daySlots) {
    const st = parseWallFromISO(s.startAt);
    const en = parseWallFromISO(s.endAt);
    const startHHmm = st.toFormat("HH:mm");
    const idx = timeRows.indexOf(startHHmm);
    if (idx === -1 || !onGrid(startHHmm)) {
      orphans.push(s);
      continue;
    }
    const durMin = Math.max(1, Math.round(en.diff(st, "minutes").minutes));
    let span = Math.max(1, Math.ceil(durMin / 30));
    span = Math.min(span, timeRows.length - idx);
    for (let r = idx; r < idx + span && r < rowBlocks.length; r++) {
      rowBlocks[r] = { kind: "skip" };
    }
    rowBlocks[idx] = { kind: "slot", slot: s, span, topIdx: idx };
  }

  return { rowBlocks, orphanSlots: orphans };
}

function canPlaceAt(
  dayISO: string,
  startHHmm: string,
  durationMin: number,
  daySlots: SerializedSlot[],
): boolean {
  const start = DateTime.fromISO(`${dayISO}T${startHHmm}`, { zone: ZONE });
  if (!start.isValid) return false;
  if (start.toMillis() <= Date.now()) return false;
  const end = start.plus({ minutes: durationMin });
  const startM = minutesFromDay7am(dayISO, start);
  const endM = minutesFromDay7am(dayISO, end);
  if (startM < 0 || endM > 14 * 60) return false;

  const ns = start.toMillis();
  const ne = end.toMillis();
  for (const s of daySlots) {
    const os = parseWallFromISO(s.startAt).toMillis();
    const oe = parseWallFromISO(s.endAt).toMillis();
    if (overlaps(ns, ne, os, oe)) return false;
  }
  return true;
}

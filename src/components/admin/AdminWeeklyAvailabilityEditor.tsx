"use client";

import { adminSaveWeeklyAvailability } from "@/actions/admin";
import type { BookingType } from "@/lib/supabase/types";
import { intervalsOverlapHalfOpen } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

export type IntervalRowState = {
  clientKey: string;
  start: string;
  end: string;
  slotMinutes: number;
};

type DayMap = Record<number, IntervalRowState[]>;

type Props = {
  initialProbe: DayMap;
  initialPt: DayMap;
};

const WEEKDAYS = [
  { id: 1, label: "Montag" },
  { id: 2, label: "Dienstag" },
  { id: 3, label: "Mittwoch" },
  { id: 4, label: "Donnerstag" },
  { id: 5, label: "Freitag" },
  { id: 6, label: "Samstag" },
  { id: 7, label: "Sonntag" },
] as const;

function cloneDayMap(src: DayMap): DayMap {
  const out: DayMap = {};
  for (let d = 1; d <= 7; d++) {
    out[d] = (src[d] ?? []).map((r) => ({ ...r }));
  }
  return out;
}

function normalizeTime(v: string): string {
  const m = String(v).match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

function buildPayload(map: DayMap): Record<string, { start: string; end: string; slotMinutes: number }[]> {
  const payload: Record<string, { start: string; end: string; slotMinutes: number }[]> = {};
  for (let d = 1; d <= 7; d++) {
    const complete = (map[d] ?? [])
      .map((r) => ({
        start: normalizeTime(r.start),
        end: normalizeTime(r.end),
        slotMinutes: r.slotMinutes,
      }))
      .filter((r) => r.start && r.end);
    payload[String(d)] = complete;
  }
  return payload;
}

function validateClient(map: DayMap): string | null {
  for (const day of WEEKDAYS) {
    const rows = map[day.id] ?? [];
    for (const r of rows) {
      const started = !!r.start;
      const ended = !!r.end;
      if (started !== ended) {
        return `${day.label}: Bitte Start- und Endzeit gemeinsam ausfüllen oder das Intervall entfernen.`;
      }
      if (started && ended) {
        const s = normalizeTime(r.start);
        const e = normalizeTime(r.end);
        if (s >= e) {
          return `${day.label}: Die Endzeit muss nach der Startzeit liegen (24h-Format).`;
        }
      }
    }

    const complete = rows.filter((r) => r.start && r.end);
    const sorted = [...complete].sort((a, b) => normalizeTime(a.start).localeCompare(normalizeTime(b.start)));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        if (
          intervalsOverlapHalfOpen(
            normalizeTime(sorted[i].start),
            normalizeTime(sorted[i].end),
            normalizeTime(sorted[j].start),
            normalizeTime(sorted[j].end),
          )
        ) {
          return `${day.label}: Zeitintervalle dürfen sich nicht überlappen.`;
        }
      }
    }
  }
  return null;
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
      aria-hidden
    >
      <path
        d="M3 6h18M8 6V4h8v2M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M10 11v6M14 11v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AdminWeeklyAvailabilityEditor({ initialProbe, initialPt }: Props) {
  const router = useRouter();
  const [type, setType] = useState<BookingType>("PROBETRAINING");
  const [pending, startTransition] = useTransition();
  const [clientError, setClientError] = useState<string | null>(null);
  const [values, setValues] = useState({
    PROBETRAINING: cloneDayMap(initialProbe),
    PERSONAL_TRAINING: cloneDayMap(initialPt),
  });

  const serializedInitial = useMemo(
    () => JSON.stringify({ initialProbe, initialPt }),
    [initialProbe, initialPt],
  );

  useEffect(() => {
    setValues({
      PROBETRAINING: cloneDayMap(initialProbe),
      PERSONAL_TRAINING: cloneDayMap(initialPt),
    });
  }, [serializedInitial, initialProbe, initialPt]);

  const dayMap = values[type];

  return (
    <section className="border border-brand-border bg-white p-4 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
        Buchbare Zeiten pro Wochentag
      </h2>
      <p className="mt-1 max-w-3xl text-xs text-brand-muted">
        Pro Tag können mehrere Zeitfenster definiert werden (z.&nbsp;B. Vormittag und Abend). Das System erzeugt in
        jedem Fenster automatisch Slots gemäss gewählter Dauer (Standard 60&nbsp;Minuten). Alle Zeiten beziehen sich
        auf{" "}
        <strong>Europe/Zurich</strong> im <strong>24-Stunden-Format</strong>.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setType("PROBETRAINING")}
          className={`border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
            type === "PROBETRAINING" ? "border-brand-pink bg-brand-pink-light text-brand-pink-dark" : "border-brand-border"
          }`}
        >
          Probetraining
        </button>
        <button
          type="button"
          onClick={() => setType("PERSONAL_TRAINING")}
          className={`border px-3 py-2 text-xs font-semibold uppercase tracking-wider ${
            type === "PERSONAL_TRAINING"
              ? "border-brand-pink bg-brand-pink-light text-brand-pink-dark"
              : "border-brand-border"
          }`}
        >
          Personal Training
        </button>
      </div>

      {clientError ? (
        <p className="mt-3 border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800" role="alert">
          {clientError}
        </p>
      ) : null}

      <form
        className="mt-5 space-y-4"
        action={(formData) =>
          startTransition(async () => {
            formData.set("bookingType", type);
            formData.set("intervalsJson", JSON.stringify(buildPayload(values[type])));
            await adminSaveWeeklyAvailability(formData);
            router.refresh();
          })
        }
        onSubmit={(e) => {
          const err = validateClient(values[type]);
          setClientError(err);
          if (err) e.preventDefault();
        }}
      >
        <input type="hidden" name="bookingType" value={type} />

        {WEEKDAYS.map((day) => {
          const intervals = dayMap[day.id] ?? [];
          return (
            <div key={day.id} className="border-b border-brand-border/60 py-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <p className="text-sm font-medium">{day.label}</p>
                <button
                  type="button"
                  onClick={() =>
                    setValues((prev) => ({
                      ...prev,
                      [type]: {
                        ...prev[type],
                        [day.id]: [
                          ...(prev[type][day.id] ?? []),
                          {
                            clientKey: crypto.randomUUID(),
                            start: "",
                            end: "",
                            slotMinutes: 60,
                          },
                        ],
                      },
                    }))
                  }
                  className="border border-brand-border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider hover:bg-brand-pink-light"
                >
                  + Intervall hinzufügen
                </button>
              </div>

              {intervals.length === 0 ? (
                <p className="mt-2 text-xs text-brand-muted">Geschlossen (keine Intervalle).</p>
              ) : (
                <ul className="mt-3 space-y-2">
                  {intervals.map((row, idx) => (
                    <li
                      key={row.clientKey}
                      className="flex flex-wrap items-end gap-2 rounded border border-brand-border/40 bg-brand-pink-light/10 p-2"
                    >
                      <label className="flex flex-col text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                        Start
                        <input
                          type="time"
                          step={60}
                          value={row.start}
                          onChange={(e) =>
                            setValues((p) => {
                              const next = cloneDayMap(p[type]);
                              const list = [...(next[day.id] ?? [])];
                              list[idx] = { ...list[idx], start: e.target.value };
                              next[day.id] = list;
                              return { ...p, [type]: next };
                            })
                          }
                          className="field mt-0.5 min-h-[2.5rem] font-normal"
                        />
                      </label>
                      <label className="flex flex-col text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                        Ende
                        <input
                          type="time"
                          step={60}
                          value={row.end}
                          onChange={(e) =>
                            setValues((p) => {
                              const next = cloneDayMap(p[type]);
                              const list = [...(next[day.id] ?? [])];
                              list[idx] = { ...list[idx], end: e.target.value };
                              next[day.id] = list;
                              return { ...p, [type]: next };
                            })
                          }
                          className="field mt-0.5 min-h-[2.5rem] font-normal"
                        />
                      </label>
                      <label className="flex flex-col text-[10px] font-semibold uppercase tracking-wider text-brand-muted">
                        Slot (Min.)
                        <input
                          type="number"
                          min={15}
                          max={480}
                          step={15}
                          value={row.slotMinutes}
                          onChange={(e) =>
                            setValues((p) => {
                              const next = cloneDayMap(p[type]);
                              const list = [...(next[day.id] ?? [])];
                              const v = Number(e.target.value);
                              list[idx] = { ...list[idx], slotMinutes: Number.isFinite(v) ? v : 60 };
                              next[day.id] = list;
                              return { ...p, [type]: next };
                            })
                          }
                          className="field mt-0.5 w-24 font-normal"
                        />
                      </label>
                      <button
                        type="button"
                        aria-label="Intervall entfernen"
                        className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center border border-brand-border text-brand-muted hover:border-red-300 hover:bg-red-50 hover:text-red-700"
                        onClick={() =>
                          setValues((p) => {
                            const next = cloneDayMap(p[type]);
                            next[day.id] = (next[day.id] ?? []).filter((_, i) => i !== idx);
                            return { ...p, [type]: next };
                          })
                        }
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        <button
          type="submit"
          disabled={pending}
          className="mt-3 bg-brand-pink px-5 py-2 text-xs font-bold uppercase tracking-wider text-white hover:bg-brand-pink-dark disabled:opacity-60"
        >
          {pending ? "Speichert..." : "Wochenplan speichern"}
        </button>
      </form>
    </section>
  );
}

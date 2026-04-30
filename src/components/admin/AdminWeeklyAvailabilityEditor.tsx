"use client";

import { adminSaveWeeklyAvailability } from "@/actions/admin";
import type { BookingType } from "@/lib/supabase/types";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

type Rule = {
  weekday: number;
  startTime: string;
  endTime: string;
};

type Props = {
  initialProbe: Rule[];
  initialPt: Rule[];
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

const TIME_OPTIONS = (() => {
  const out: string[] = [""];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 30]) {
      const hh = String(hour).padStart(2, "0");
      const mm = String(minute).padStart(2, "0");
      out.push(`${hh}:${mm}`);
    }
  }
  return out;
})();

function toMap(rules: Rule[]): Record<number, { startTime: string; endTime: string }> {
  return Object.fromEntries(
    WEEKDAYS.map((d) => {
      const hit = rules.find((r) => r.weekday === d.id);
      return [d.id, { startTime: hit?.startTime ?? "", endTime: hit?.endTime ?? "" }];
    }),
  );
}

export function AdminWeeklyAvailabilityEditor({ initialProbe, initialPt }: Props) {
  const router = useRouter();
  const [type, setType] = useState<BookingType>("PROBETRAINING");
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    PROBETRAINING: toMap(initialProbe),
    PERSONAL_TRAINING: toMap(initialPt),
  });

  const dayValues = useMemo(() => values[type], [values, type]);

  return (
    <section className="border border-brand-border bg-white p-4 sm:p-6">
      <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
        Buchbare Zeiten pro Wochentag
      </h2>
      <p className="mt-1 max-w-3xl text-xs text-brand-muted">
        Pro Wochentag Start und Ende definieren. Das System erzeugt automatisch stündliche Slots (z. B. 09:00,
        10:00, 11:00 …). Der letzte volle Stundenstart bleibt buchbar, auch wenn die Endzeit z. B. auf 19:30 liegt.
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
            type === "PERSONAL_TRAINING" ? "border-brand-pink bg-brand-pink-light text-brand-pink-dark" : "border-brand-border"
          }`}
        >
          Personal Training
        </button>
      </div>

      <form
        className="mt-5 space-y-3"
        action={(formData) =>
          startTransition(async () => {
            formData.set("bookingType", type);
            await adminSaveWeeklyAvailability(formData);
            router.refresh();
          })
        }
      >
        <input type="hidden" name="bookingType" value={type} />
        {WEEKDAYS.map((day) => (
          <div key={day.id} className="grid grid-cols-1 items-center gap-2 border-b border-brand-border/60 py-2 sm:grid-cols-3">
            <p className="text-sm font-medium">{day.label}</p>
            <select
              name={`day_${day.id}_start`}
              value={dayValues[day.id].startTime}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], [day.id]: { ...prev[type][day.id], startTime: e.target.value } },
                }))
              }
              className="field"
            >
              <option value="">Geschlossen</option>
              {TIME_OPTIONS.filter(Boolean).map((time) => (
                <option key={`start-${day.id}-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
            <select
              name={`day_${day.id}_end`}
              value={dayValues[day.id].endTime}
              onChange={(e) =>
                setValues((prev) => ({
                  ...prev,
                  [type]: { ...prev[type], [day.id]: { ...prev[type][day.id], endTime: e.target.value } },
                }))
              }
              className="field"
            >
              <option value="">Geschlossen</option>
              {TIME_OPTIONS.filter(Boolean).map((time) => (
                <option key={`end-${day.id}-${time}`} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        ))}

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

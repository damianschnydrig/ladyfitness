import type { Metadata } from "next";
import {
  AdminWeeklyAvailabilityEditor,
  type IntervalRowState,
} from "@/components/admin/AdminWeeklyAvailabilityEditor";
import { dbDayOfWeekToLuxonWeekday } from "@/lib/slot-generation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { WeeklyAvailabilityInterval } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Verfügbarkeiten",
  robots: { index: false, follow: false },
};

function emptyDayMap(): Record<number, IntervalRowState[]> {
  return { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [], 7: [] };
}

function groupIntervals(rows: WeeklyAvailabilityInterval[]): {
  probe: Record<number, IntervalRowState[]>;
  pt: Record<number, IntervalRowState[]>;
} {
  const probe = emptyDayMap();
  const pt = emptyDayMap();

  for (const r of rows) {
    const lw = dbDayOfWeekToLuxonWeekday(r.day_of_week);
    const target = r.booking_type === "PROBETRAINING" ? probe : pt;
    target[lw].push({
      clientKey: r.id,
      start: r.start_time.slice(0, 5),
      end: r.end_time.slice(0, 5),
      slotMinutes: r.slot_duration_minutes,
    });
  }

  for (let d = 1; d <= 7; d++) {
    probe[d]?.sort((a, b) => a.start.localeCompare(b.start));
    pt[d]?.sort((a, b) => a.start.localeCompare(b.start));
  }

  return { probe, pt };
}

export default async function AdminSlotsPage() {
  const supabase = getSupabaseServer();
  const { data: intervalsRaw } = await supabase
    .from("weekly_availability_intervals")
    .select("*")
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  const { probe: initialProbe, pt: initialPt } = groupIntervals(
    (intervalsRaw ?? []) as WeeklyAvailabilityInterval[],
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Verfügbarkeiten</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Definieren Sie pro Wochentag ein oder mehrere buchbare Zeitfenster. Das System erzeugt daraus automatisch
          Slots für die nächsten 16 Wochen (Zeitzone Europe/Zurich).
        </p>
      </div>

      <AdminWeeklyAvailabilityEditor initialProbe={initialProbe} initialPt={initialPt} />
    </div>
  );
}

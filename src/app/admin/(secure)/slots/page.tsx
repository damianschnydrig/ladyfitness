import type { Metadata } from "next";
import { AdminWeeklyAvailabilityEditor } from "@/components/admin/AdminWeeklyAvailabilityEditor";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { WeeklySlotRule } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Verfügbarkeiten",
  robots: { index: false, follow: false },
};

export default async function AdminSlotsPage() {
  const supabase = getSupabaseServer();
  const { data: weeklyRulesRaw } = await supabase
    .from("weekly_slot_rules")
    .select("*")
    .order("weekday", { ascending: true });
  const weeklyRules = (weeklyRulesRaw ?? []) as WeeklySlotRule[];
  const initialProbe = weeklyRules
    .filter((r) => r.booking_type === "PROBETRAINING")
    .map((r) => ({ weekday: r.weekday, startTime: r.start_time.slice(0, 5), endTime: r.end_time.slice(0, 5) }));
  const initialPt = weeklyRules
    .filter((r) => r.booking_type === "PERSONAL_TRAINING")
    .map((r) => ({ weekday: r.weekday, startTime: r.start_time.slice(0, 5), endTime: r.end_time.slice(0, 5) }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl">Verfügbarkeiten</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Definieren Sie pro Wochentag die buchbaren Zeitfenster. Das System erzeugt daraus
          automatisch stündliche Slots für die nächsten 16 Wochen.
        </p>
      </div>

      <AdminWeeklyAvailabilityEditor initialProbe={initialProbe} initialPt={initialPt} />
    </div>
  );
}

/**
 * SQL-Cleanup und Slot-Regenerierung (Version ohne .env Abhängigkeit)
 * Aufruf in Plesk: NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_KEY=... npx tsx scripts/fix-slots.ts
 */
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";
import { generateSlotStarts, luxonWeekdayToDbDayOfWeek, ZURICH_ZONE } from "../src/lib/slot-generation";
import type { Database } from "../src/types/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Fehlende Env-Variablen: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY");
  console.log("Bitte die Variablen direkt im Befehl oder in Plesk setzen.");
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function normalizeHHmm(value: string): string {
  const m = String(value).match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

async function run() {
  const nowIso = new Date().toISOString();

  console.log("--- 1. SQL-CLEANUP ---");
  const { data: futureSlots } = await supabase.from("time_slots").select("id").gt("start_at", nowIso);

  const ids = ((futureSlots ?? []) as { id: string }[]).map((r) => r.id);
  let deletedCount = 0;

  if (ids.length > 0) {
    const { data: used } = await supabase.from("bookings").select("slot_id").in("slot_id", ids);
    const usedSet = new Set(((used ?? []) as { slot_id: string }[]).map((u) => u.slot_id));
    const deletable = ids.filter((id) => !usedSet.has(id));

    if (deletable.length > 0) {
      const { error: delError, count } = await supabase.from("time_slots").delete({ count: "exact" }).in("id", deletable);

      if (delError) throw delError;
      deletedCount = count ?? 0;
    }
  }
  console.log(`✅ Gelöschte ungebuchte Slots: ${deletedCount}`);

  console.log("\n--- 2. SLOT-GENERIERUNG ---");
  const { data: intervals } = await supabase.from("weekly_availability_intervals").select("*");
  if (!intervals || intervals.length === 0) {
    console.log("Keine Intervalle gefunden.");
    return;
  }

  const today = DateTime.now().setZone(ZURICH_ZONE).startOf("day");
  const horizonEnd = today.plus({ weeks: 16 });

  const byDow = new Map<number, typeof intervals>();
  for (const row of intervals) {
    const dow = row.day_of_week;
    const arr = byDow.get(dow) ?? [];
    arr.push(row);
    byDow.set(dow, arr);
  }

  const insertRows: Database["public"]["Tables"]["time_slots"]["Insert"][] = [];

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    const dow = luxonWeekdayToDbDayOfWeek(day.weekday);
    const dayIntervals = byDow.get(dow);
    if (!dayIntervals?.length) continue;

    for (const rule of dayIntervals) {
      const startHHmm = normalizeHHmm(rule.start_time.slice(0, 8));
      const endHHmm = normalizeHHmm(rule.end_time.slice(0, 8));
      const duration = rule.slot_duration_minutes ?? 60;
      const starts = generateSlotStarts(day, startHHmm, endHHmm, duration);
      for (const slotStart of starts) {
        if (slotStart.toMillis() <= Date.now()) continue;

        insertRows.push({
          start_at: slotStart.toUTC().toISO()!,
          end_at: slotStart.plus({ minutes: duration }).toUTC().toISO()!,
          booking_type: rule.booking_type,
          generated_by_schedule: true,
        });
      }
    }
  }

  if (insertRows.length > 0) {
    const { error: insError } = await supabase.from("time_slots").insert(insertRows);
    if (insError) throw insError;
    console.log(`✅ ${insertRows.length} neue Slots generiert.`);
  }

  console.log("\n--- 3. BEWEIS (SQL-ABFRAGE) ---");
  const { data: proof } = await supabase
    .from("time_slots")
    .select("start_at")
    .gte("start_at", "2026-05-04T00:00:00Z")
    .order("start_at", { ascending: true })
    .limit(10);

  console.log("Ergebnis (start_time >= 2026-05-04):");
  console.table(proof);
}

run().catch((e) => {
  console.error("❌ Fehler:", e.message);
  process.exit(1);
});

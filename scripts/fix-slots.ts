/**
 * SQL-Cleanup und Slot-Regenerierung
 * Aufruf: npm run db:fix-slots
 */
import { createClient } from "@supabase/supabase-js";
import { DateTime } from "luxon";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("❌ Fehlende Env-Variablen: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

function generateHourlyStarts(dayStart: DateTime, startHHmm: string, endHHmm: string): DateTime[] {
  const [startHour, startMinute] = startHHmm.split(":").map(Number);
  const [endHour, endMinute] = endHHmm.split(":").map(Number);
  const start = dayStart.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
  const end = dayStart.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  const out: DateTime[] = [];
  let cursor = start;
  while (cursor.plus({ hours: 1 }) <= end) {
    out.push(cursor);
    cursor = cursor.plus({ hours: 1 });
  }
  return out;
}

async function run() {
  const nowIso = new Date().toISOString();

  // 1. SQL-CLEANUP: Alle ungebuchten zukünftigen Slots löschen
  console.log("--- 1. SQL-CLEANUP ---");
  const { data: futureSlots } = await supabase
    .from("time_slots")
    .select("id")
    .gt("start_at", nowIso);
  
  const ids = ((futureSlots ?? []) as { id: string }[]).map((r) => r.id);
  let deletedCount = 0;

  if (ids.length > 0) {
    const { data: used } = await supabase.from("bookings").select("slot_id").in("slot_id", ids);
    const usedSet = new Set(((used ?? []) as { slot_id: string }[]).map((u) => u.slot_id));
    const deletable = ids.filter((id) => !usedSet.has(id));
    
    if (deletable.length > 0) {
      const { error: delError, count } = await supabase
        .from("time_slots")
        .delete({ count: 'exact' })
        .in("id", deletable);
      
      if (delError) throw delError;
      deletedCount = count ?? 0;
    }
  }
  console.log(`✅ Gelöschte ungebuchte Slots: ${deletedCount}`);

  // 2. SLOT-GENERIERUNG FIXEN
  console.log("\n--- 2. SLOT-GENERIERUNG ---");
  const { data: rules } = await supabase.from("weekly_slot_rules").select("*");
  if (!rules || rules.length === 0) {
    console.log("Keine Regeln gefunden.");
    return;
  }

  const zone = "Europe/Zurich";
  const today = DateTime.now().setZone(zone).startOf("day");
  const horizonEnd = today.plus({ weeks: 16 });

  const insertRows: any[] = [];

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    const weekday = day.weekday;
    const dayRules = rules.filter((r) => r.weekday === weekday);
    
    for (const rule of dayRules) {
      const starts = generateHourlyStarts(day, rule.start_time, rule.end_time);
      for (const slotStart of starts) {
        if (slotStart.toMillis() <= Date.now()) continue;
        
        insertRows.push({
          start_at: slotStart.toUTC().toISO()!,
          end_at: slotStart.plus({ hours: 1 }).toUTC().toISO()!,
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

  // 3. BEWEIS-ANFORDERUNG
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

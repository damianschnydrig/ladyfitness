import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import type { z } from "zod";
import { generateSlotStarts, luxonWeekdayToDbDayOfWeek, ZURICH_ZONE } from "@/lib/slot-generation";
import type { Database } from "@/lib/supabase/types";
import { weeklyAvailabilityPayloadSchema } from "@/lib/validations";
import { DateTime } from "luxon";

export type SaveAvailabilityResult =
  | {
      ok: true;
      deletedCount: number;
      createdCount: number;
      sampleCreated: string[];
    }
  | { ok: false; message: string };

function normalizeHHmm(value: string): string {
  const m = String(value).match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "";
}

export type WeeklyAvailabilityValidated = z.infer<typeof weeklyAvailabilityPayloadSchema>;

export async function persistValidatedWeeklyAvailability(
  bookingType: Database["public"]["Tables"]["weekly_availability_intervals"]["Insert"]["booking_type"],
  validated: WeeklyAvailabilityValidated,
): Promise<SaveAvailabilityResult> {
  console.log("SAVE_PAYLOAD", validated);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );

  type IntervalInsert = Database["public"]["Tables"]["weekly_availability_intervals"]["Insert"];
  const inserts: IntervalInsert[] = [];
  for (let luxonWd = 1; luxonWd <= 7; luxonWd++) {
    const list = validated[String(luxonWd)] ?? [];
    const dow = luxonWeekdayToDbDayOfWeek(luxonWd);
    for (const row of list) {
      inserts.push({
        booking_type: bookingType,
        day_of_week: dow,
        start_time: `${normalizeHHmm(row.start)}:00`,
        end_time: `${normalizeHHmm(row.end)}:00`,
        slot_duration_minutes: row.slotMinutes,
      });
    }
  }

  const { error: delIntervalsErr } = await supabase
    .from("weekly_availability_intervals")
    .delete()
    .eq("booking_type", bookingType);
  if (delIntervalsErr) {
    console.error("DB_RESULT", { step: "delete_intervals", error: delIntervalsErr.message });
    return { ok: false, message: `Speichern fehlgeschlagen: ${delIntervalsErr.message}` };
  }
  if (inserts.length > 0) {
    const { error: insIntervalsErr } = await supabase.from("weekly_availability_intervals").insert(inserts);
    if (insIntervalsErr) {
      console.error("DB_RESULT", { step: "insert_intervals", error: insIntervalsErr.message });
      return { ok: false, message: `Speichern fehlgeschlagen: ${insIntervalsErr.message}` };
    }
  }
  console.log("DB_RESULT", { ok: true, bookingType, intervalsRows: inserts.length });

  const nowIso = new Date().toISOString();
  const { data: candidateSlots } = await supabase
    .from("time_slots")
    .select("id")
    .eq("booking_type", bookingType)
    .gt("start_at", nowIso)
    .or("available.is.null,available.eq.true");

  const candidateIds = ((candidateSlots ?? []) as { id: string }[]).map((r) => r.id);
  let deletedCount = 0;

  if (candidateIds.length > 0) {
    const { data: bookedSlots } = await supabase
      .from("bookings")
      .select("slot_id")
      .in("slot_id", candidateIds)
      .neq("status", "CANCELLED");
    const bookedSet = new Set(((bookedSlots ?? []) as { slot_id: string }[]).map((u) => u.slot_id));
    const deletable = candidateIds.filter((id) => !bookedSet.has(id));
    if (deletable.length > 0) {
      await supabase.from("time_slots").delete().in("id", deletable);
      deletedCount = deletable.length;
    }
  }

  const today = DateTime.now().setZone(ZURICH_ZONE).startOf("day");
  const horizonEnd = today.plus({ weeks: 16 });

  const { data: existingRange } = await supabase
    .from("time_slots")
    .select("start_at")
    .eq("booking_type", bookingType)
    .gte("start_at", today.toUTC().toISO()!)
    .lt("start_at", horizonEnd.toUTC().toISO()!);
  const existingStartSet = new Set(
    ((existingRange ?? []) as { start_at: string }[]).map((r) => r.start_at),
  );

  const insertRows: Array<{
    start_at: string;
    end_at: string;
    booking_type: Database["public"]["Tables"]["time_slots"]["Insert"]["booking_type"];
    generated_by_schedule: boolean;
  }> = [];

  const intervalsByDow = new Map<number, IntervalInsert[]>();
  for (const row of inserts) {
    const dow = row.day_of_week as number;
    const arr = intervalsByDow.get(dow) ?? [];
    arr.push(row);
    intervalsByDow.set(dow, arr);
  }

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    const dow = luxonWeekdayToDbDayOfWeek(day.weekday);
    const dayIntervals = intervalsByDow.get(dow);
    if (!dayIntervals?.length) continue;

    for (const interval of dayIntervals) {
      const startHHmm = normalizeHHmm(String(interval.start_time).slice(0, 8));
      const endHHmm = normalizeHHmm(String(interval.end_time).slice(0, 8));
      const duration = interval.slot_duration_minutes ?? 60;
      const starts = generateSlotStarts(day, startHHmm, endHHmm, duration);
      for (const slotStart of starts) {
        if (slotStart.toMillis() <= Date.now()) continue;
        const startIso = slotStart.toUTC().toISO()!;
        if (existingStartSet.has(startIso)) continue;
        insertRows.push({
          start_at: startIso,
          end_at: slotStart.plus({ minutes: duration }).toUTC().toISO()!,
          booking_type: bookingType,
          generated_by_schedule: true,
        });
      }
    }
  }

  let createdCount = 0;
  const sampleCreated: string[] = [];

  console.log(
    "SLOTS_GENERATED",
    insertRows.slice(0, 24).map((r) => ({ start_at: r.start_at, end_at: r.end_at })),
  );

  if (insertRows.length > 0) {
    const { data: inserted, error: slotInsErr } = await supabase
      .from("time_slots")
      .insert(insertRows)
      .select("start_at");
    if (slotInsErr) {
      console.error("DB_RESULT", { step: "insert_time_slots", error: slotInsErr.message });
      return { ok: false, message: `Slots konnten nicht angelegt werden: ${slotInsErr.message}` };
    }
    createdCount = insertRows.length;
    sampleCreated.push(
      ...((inserted ?? []) as { start_at: string }[])
        .slice(0, 3)
        .map((r) => r.start_at),
    );
  }

  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");

  console.log(
    `[persistWeeklyAvailability] type=${bookingType} deleted=${deletedCount} created=${createdCount} sample=${JSON.stringify(sampleCreated)}`,
  );

  return { ok: true, deletedCount, createdCount, sampleCreated };
}

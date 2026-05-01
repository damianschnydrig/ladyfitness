"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { auth } from "@/auth";
import { formatZurichTimeRange } from "@/lib/datetime";
import { sendBookingCancelledEmail } from "@/lib/mail";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingStatus, ContactStatus, Database, TimeSlot } from "@/lib/supabase/types";
import { weeklySlotRuleSchema } from "@/lib/validations";
import { DateTime } from "luxon";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Nicht angemeldet.");
  }
  return session;
}

type WeeklyRuleInput = {
  weekday: number;
  startTime?: string;
  endTime?: string;
};

export type SaveAvailabilityResult = {
  deletedCount: number;
  createdCount: number;
  sampleCreated: string[];
};

function generateHourlyStarts(dayStart: DateTime, startHHmm: string, endHHmm: string): DateTime[] {
  const [startHour, startMinute] = startHHmm.split(":").map(Number);
  const [endHour, endMinute] = endHHmm.split(":").map(Number);
  const start = dayStart.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
  const end = dayStart.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  const out: DateTime[] = [];
  let cursor = start;
  // Ein Slot = exakt 1 Stunde. Wenn Ende 11:30, letzter Start bei 10:30.
  while (cursor.plus({ hours: 1 }) <= end) {
    out.push(cursor);
    cursor = cursor.plus({ hours: 1 });
  }
  return out;
}

export async function adminSaveWeeklyAvailability(
  formData: FormData
): Promise<SaveAvailabilityResult> {
  await requireAdmin();
  const bookingTypeRaw = formData.get("bookingType");
  if (bookingTypeRaw !== "PROBETRAINING" && bookingTypeRaw !== "PERSONAL_TRAINING") {
    return { deletedCount: 0, createdCount: 0, sampleCreated: [] };
  }
  const bookingType: Database["public"]["Tables"]["weekly_slot_rules"]["Insert"]["booking_type"] =
    bookingTypeRaw;

  const rows: WeeklyRuleInput[] = [];
  for (let weekday = 1; weekday <= 7; weekday++) {
    rows.push({
      weekday,
      startTime: (formData.get(`day_${weekday}_start`) as string) || undefined,
      endTime: (formData.get(`day_${weekday}_end`) as string) || undefined,
    });
  }

  for (const row of rows) {
    const parsed = weeklySlotRuleSchema.safeParse(row);
    if (!parsed.success) {
      console.warn("[adminSaveWeeklyAvailability] Validierungsfehler", parsed.error.flatten());
      return { deletedCount: 0, createdCount: 0, sampleCreated: [] };
    }
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const activeRules = rows.filter((r) => r.startTime && r.endTime);

  // --- Wochenregeln aktualisieren ---
  await supabase.from("weekly_slot_rules").delete().eq("booking_type", bookingType);
  if (activeRules.length > 0) {
    await supabase.from("weekly_slot_rules").insert(
      activeRules.map((r) => ({
        booking_type: bookingType,
        weekday: r.weekday,
        start_time: r.startTime!,
        end_time: r.endTime!,
      }))
    );
  }

  // --- Zukünftige ungebuchte Slots dieses Typs löschen ---
  const nowIso = new Date().toISOString();
  const { data: candidateSlots } = await supabase
    .from("time_slots")
    .select("id")
    .eq("booking_type", bookingType)
    .gt("start_at", nowIso)
    .or("available.is.null,available.eq.true"); // nur nicht-blockierte

  const candidateIds = ((candidateSlots ?? []) as { id: string }[]).map((r) => r.id);
  let deletedCount = 0;

  if (candidateIds.length > 0) {
    // Slots mit aktiver Buchung nicht löschen
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

  // --- Neue Slots generieren (16 Wochen Horizont) ---
  const zone = "Europe/Zurich";
  const today = DateTime.now().setZone(zone).startOf("day");
  const horizonEnd = today.plus({ weeks: 16 });

  // Bestehende Starts im Zeitraum laden (verbleibende gebuchte Slots)
  const { data: existingRange } = await supabase
    .from("time_slots")
    .select("start_at")
    .eq("booking_type", bookingType)
    .gte("start_at", today.toUTC().toISO()!)
    .lt("start_at", horizonEnd.toUTC().toISO()!);
  const existingStartSet = new Set(
    ((existingRange ?? []) as { start_at: string }[]).map((r) => r.start_at)
  );

  const insertRows: Array<{
    start_at: string;
    end_at: string;
    booking_type: Database["public"]["Tables"]["time_slots"]["Insert"]["booking_type"];
    generated_by_schedule: boolean;
  }> = [];

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    const weekday = day.weekday; // 1=Mo…7=So
    const rule = activeRules.find((r) => r.weekday === weekday);
    if (!rule || !rule.startTime || !rule.endTime) continue;
    const starts = generateHourlyStarts(day, rule.startTime, rule.endTime);
    for (const slotStart of starts) {
      if (slotStart.toMillis() <= Date.now()) continue;
      const startIso = slotStart.toUTC().toISO()!;
      if (existingStartSet.has(startIso)) continue;
      insertRows.push({
        start_at: startIso,
        end_at: slotStart.plus({ hours: 1 }).toUTC().toISO()!,
        booking_type: bookingType,
        generated_by_schedule: true,
        // available nicht gesetzt → DB-Default TRUE (nach Migration 004)
      });
    }
  }

  let createdCount = 0;
  const sampleCreated: string[] = [];

  if (insertRows.length > 0) {
    const { data: inserted } = await supabase
      .from("time_slots")
      .insert(insertRows)
      .select("start_at");
    createdCount = insertRows.length;
    sampleCreated.push(
      ...((inserted ?? []) as { start_at: string }[])
        .slice(0, 3)
        .map((r) => r.start_at)
    );
  }

  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");

  console.log(
    `[adminSaveWeeklyAvailability] type=${bookingType} deleted=${deletedCount} created=${createdCount} sample=${JSON.stringify(sampleCreated)}`
  );

  return { deletedCount, createdCount, sampleCreated };
}

const statusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function adminUpdateBookingStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const supabase = getSupabaseServer();
  const { data: bookingBeforeRaw } = await supabase
    .from("bookings")
    .select("id, slot_id, first_name, last_name, email, status")
    .eq("id", parsed.data.id)
    .maybeSingle();
  const bookingBefore = bookingBeforeRaw as {
    id: string;
    slot_id: string;
    first_name: string;
    last_name: string;
    email: string;
    status: BookingStatus;
  } | null;

  if (!bookingBefore) return;

  let slotBefore: Pick<TimeSlot, "start_at" | "end_at"> | null = null;
  if (bookingBefore.slot_id) {
    const { data: slotRaw } = await supabase
      .from("time_slots")
      .select("start_at, end_at")
      .eq("id", bookingBefore.slot_id)
      .maybeSingle();
    slotBefore = (slotRaw as Pick<TimeSlot, "start_at" | "end_at"> | null) ?? null;
  }

  await supabase
    .from("bookings")
    .update({ status: parsed.data.status as BookingStatus })
    .eq("id", parsed.data.id);

  // Bei Stornierung: blockierte Cross-Type-Slots wieder freigeben + E-Mail
  if (parsed.data.status === "CANCELLED" && bookingBefore.status !== "CANCELLED") {
    // Andere Typ-Slots freigeben, die durch diese Buchung blockiert wurden
    await supabase.rpc("unblock_slots_for_booking", { p_booking_id: bookingBefore.id });

    if (slotBefore) {
      await sendBookingCancelledEmail({
        firstName: bookingBefore.first_name,
        lastName: bookingBefore.last_name,
        email: bookingBefore.email,
        whenLabel: formatZurichTimeRange(slotBefore.start_at, slotBefore.end_at),
      });
    }
  }

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/archive");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  revalidatePath("/buchen");
}

const contactStatusSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"]),
});

export async function adminUpdateContactStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = contactStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  const supabase = getSupabaseServer();
  await supabase
    .from("contact_inquiries")
    .update({ status: parsed.data.status as ContactStatus })
    .eq("id", parsed.data.id);

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/archive");
}

const deleteIdSchema = z.object({
  id: z.string().uuid(),
});

export async function adminDeleteBooking(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = deleteIdSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) return;

  const supabase = getSupabaseServer();

  // Geblockte Cross-Type-Slots vor dem Löschen freigeben
  await supabase.rpc("unblock_slots_for_booking", { p_booking_id: parsed.data.id });

  await supabase.from("bookings").delete().eq("id", parsed.data.id);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/archive");
  revalidatePath("/admin/calendar");
  revalidatePath("/admin");
  revalidatePath("/buchen");
}

export async function adminDeleteContactInquiry(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = deleteIdSchema.safeParse({
    id: formData.get("id"),
  });
  if (!parsed.success) return;

  const supabase = getSupabaseServer();
  await supabase.from("contact_inquiries").delete().eq("id", parsed.data.id);

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/archive");
}

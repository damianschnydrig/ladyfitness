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

function generateHourlyStarts(dayStart: DateTime, startHHmm: string, endHHmm: string): DateTime[] {
  const [startHour, startMinute] = startHHmm.split(":").map(Number);
  const [endHour, endMinute] = endHHmm.split(":").map(Number);
  const start = dayStart.set({ hour: startHour, minute: startMinute, second: 0, millisecond: 0 });
  const end = dayStart.set({ hour: endHour, minute: endMinute, second: 0, millisecond: 0 });

  const out: DateTime[] = [];
  let cursor = start;
  // Ein Slot muss EXAKT 1 Stunde lang sein.
  // Wenn Ende 11:30 ist, darf der letzte Slot um 10:30 starten.
  while (cursor.plus({ hours: 1 }) <= end) {
    out.push(cursor);
    cursor = cursor.plus({ hours: 1 });
  }
  return out;
}

export async function adminSaveWeeklyAvailability(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingTypeRaw = formData.get("bookingType");
  if (bookingTypeRaw !== "PROBETRAINING" && bookingTypeRaw !== "PERSONAL_TRAINING") return;
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
      console.warn("[adminSaveWeeklyAvailability]", parsed.error.flatten());
      return;
    }
  }

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
  const activeRules = rows.filter((r) => r.startTime && r.endTime);

  await supabase.from("weekly_slot_rules").delete().eq("booking_type", bookingType);
  if (activeRules.length > 0) {
    const weeklyInserts: Database["public"]["Tables"]["weekly_slot_rules"]["Insert"][] = activeRules.map(
      (r) => ({
        booking_type: bookingType,
        weekday: r.weekday,
        start_time: r.startTime!,
        end_time: r.endTime!,
      }),
    );
    await supabase.from("weekly_slot_rules").insert(weeklyInserts);
  }

  // Zukunfts-Slots dieses Typs vollständig aus Wochenplan neu aufbauen:
  // alle ungebuchten zukünftigen Slots löschen (unabhängig von generated_by_schedule),
  // gebuchte Slots bleiben bestehen.
  const nowIso = new Date().toISOString();
  const { data: generatedSlots } = await supabase
    .from("time_slots")
    .select("id")
    .eq("booking_type", bookingType)
    .gt("start_at", nowIso);
  const ids = ((generatedSlots ?? []) as { id: string }[]).map((r) => r.id);
  if (ids.length > 0) {
    const { data: used } = await supabase.from("bookings").select("slot_id").in("slot_id", ids);
    const usedSet = new Set(((used ?? []) as { slot_id: string }[]).map((u) => u.slot_id));
    const deletable = ids.filter((id) => !usedSet.has(id));
    if (deletable.length > 0) {
      await supabase.from("time_slots").delete().in("id", deletable);
    }
  }

  const zone = "Europe/Zurich";
  const today = DateTime.now().setZone(zone).startOf("day");
  const horizonEnd = today.plus({ weeks: 16 });
  const { data: existingRange } = await supabase
    .from("time_slots")
    .select("start_at")
    .eq("booking_type", bookingType)
    .gte("start_at", today.toUTC().toISO()!)
    .lt("start_at", horizonEnd.toUTC().toISO()!);
  const existingStartSet = new Set(((existingRange ?? []) as { start_at: string }[]).map((r) => r.start_at));
  const insertRows: Array<{
    start_at: string;
    end_at: string;
    booking_type: Database["public"]["Tables"]["time_slots"]["Insert"]["booking_type"];
    generated_by_schedule: boolean;
  }> = [];

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    // Luxon: 1=Montag ... 7=Sonntag, identisch mit DB-Regel (weekly_slot_rules.weekday).
    const weekday = day.weekday;
    const rule = activeRules.find((r) => r.weekday === weekday);
    if (!rule || !rule.startTime || !rule.endTime) continue;
    const starts = generateHourlyStarts(day, rule.startTime, rule.endTime);
    for (const slotStart of starts) {
      if (slotStart.toMillis() <= Date.now()) continue;
      // Wandzeit direkt speichern (kein UTC-Versatz), damit Frontend exakt die
      // eingegebene Uhrzeit anzeigen kann.
      const startIso = slotStart.toFormat("yyyy-MM-dd'T'HH:mm:ss") + "+00:00";
      if (existingStartSet.has(startIso)) continue;
      const endIso = slotStart.plus({ hours: 1 }).toFormat("yyyy-MM-dd'T'HH:mm:ss") + "+00:00";
      insertRows.push({
        start_at: startIso,
        end_at: endIso,
        booking_type: bookingType,
        generated_by_schedule: true,
      });
    }
  }

  if (insertRows.length > 0) {
    await supabase.from("time_slots").insert(insertRows);
  }

  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");
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

  const shouldSendCancelMail =
    parsed.data.status === "CANCELLED" &&
    bookingBefore.status !== "CANCELLED" &&
    !!slotBefore;

  if (shouldSendCancelMail && slotBefore) {
    await sendBookingCancelledEmail({
      firstName: bookingBefore.first_name,
      lastName: bookingBefore.last_name,
      email: bookingBefore.email,
      whenLabel: formatZurichTimeRange(slotBefore.start_at, slotBefore.end_at),
    });
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

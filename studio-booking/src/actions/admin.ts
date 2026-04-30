"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { formatZurichTimeRange } from "@/lib/datetime";
import { sendBookingCancelledEmail } from "@/lib/mail";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingStatus, ContactStatus, TimeSlot } from "@/lib/supabase/types";
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
  while (cursor < end) {
    out.push(cursor);
    cursor = cursor.plus({ hours: 1 });
  }
  return out;
}

export async function adminSaveWeeklyAvailability(formData: FormData): Promise<void> {
  await requireAdmin();
  const bookingType = formData.get("bookingType");
  if (bookingType !== "PROBETRAINING" && bookingType !== "PERSONAL_TRAINING") return;

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

  const supabase = getSupabaseServer();
  const activeRules = rows.filter((r) => r.startTime && r.endTime);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("weekly_slot_rules").delete().eq("booking_type", bookingType);
  if (activeRules.length > 0) {
    // Some production environments use stale generated DB types; cast keeps runtime query valid.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("weekly_slot_rules").insert(
      activeRules.map((r) => ({
        booking_type: bookingType,
        weekday: r.weekday,
        start_time: r.startTime!,
        end_time: r.endTime!,
      })),
    );
  }

  // Nicht gebuchte, automatisch erzeugte Zukunfts-Slots ersetzen.
  const nowIso = new Date().toISOString();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: generatedSlots } = await (supabase as any)
    .from("time_slots")
    .select("id")
    .eq("booking_type", bookingType)
    .eq("generated_by_schedule", true)
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
  const insertRows: Array<{ start_at: string; end_at: string; booking_type: string; generated_by_schedule: boolean }> = [];

  for (let day = today; day < horizonEnd; day = day.plus({ days: 1 })) {
    const weekday = day.weekday;
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
      });
    }
  }

  if (insertRows.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (supabase as any).from("time_slots").insert(insertRows);
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
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

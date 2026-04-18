"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { parseZurichWallClock } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingStatus, ContactStatus } from "@/lib/supabase/types";
import { slotCreateSchema, slotDeleteSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Nicht angemeldet.");
  }
  return session;
}

export async function adminCreateSlot(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = slotCreateSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    bookingType: formData.get("bookingType"),
  });

  if (!parsed.success) {
    console.warn("[adminCreateSlot]", parsed.error.flatten());
    return;
  }

  const { date, startTime, endTime, bookingType } = parsed.data;

  let startAt: Date;
  let endAt: Date;
  try {
    startAt = parseZurichWallClock(date, startTime);
    endAt = parseZurichWallClock(date, endTime);
  } catch {
    console.warn("[adminCreateSlot] parse Zeit");
    return;
  }

  if (endAt <= startAt || startAt.getTime() <= Date.now()) {
    return;
  }

  const supabase = getSupabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).from("time_slots").insert({
    start_at: startAt.toISOString(),
    end_at: endAt.toISOString(),
    booking_type: bookingType,
  });

  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");
}

export async function adminDeleteSlot(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = slotDeleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const supabase = getSupabaseServer();

  // Nur löschen wenn kein Booking vorhanden
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("slot_id", parsed.data.id)
    .maybeSingle();

  if (existing) return;

  await supabase.from("time_slots").delete().eq("id", parsed.data.id);

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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("bookings")
    .update({ status: parsed.data.status as BookingStatus })
    .eq("id", parsed.data.id);

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/archive");
  revalidatePath("/admin/calendar");
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

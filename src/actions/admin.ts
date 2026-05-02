"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { formatZurichTimeRange } from "@/lib/datetime";
import { sendBookingCancelledEmail } from "@/lib/mail";
import {
  persistValidatedWeeklyAvailability,
  type SaveAvailabilityResult,
} from "@/lib/persist-weekly-availability";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingStatus, ContactStatus, Database, TimeSlot } from "@/lib/supabase/types";
import { weeklyAvailabilityPayloadSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Nicht angemeldet.");
  }
  return session;
}

export type { SaveAvailabilityResult };

export async function adminSaveWeeklyAvailability(
  formData: FormData
): Promise<SaveAvailabilityResult> {
  await requireAdmin();
  const bookingTypeRaw = formData.get("bookingType");
  if (bookingTypeRaw !== "PROBETRAINING" && bookingTypeRaw !== "PERSONAL_TRAINING") {
    return { ok: false, message: "Ungültiger Buchungstyp." };
  }
  const bookingType: Database["public"]["Tables"]["weekly_availability_intervals"]["Insert"]["booking_type"] =
    bookingTypeRaw;

  const intervalsRaw = formData.get("intervalsJson");
  let parsedPayload: unknown;
  try {
    parsedPayload = typeof intervalsRaw === "string" ? JSON.parse(intervalsRaw) : null;
  } catch {
    console.warn("[adminSaveWeeklyAvailability] Ungültiges JSON");
    return { ok: false, message: "Ungültiges JSON für Intervalle." };
  }

  console.log("SAVE_PAYLOAD", parsedPayload);

  const validated = weeklyAvailabilityPayloadSchema.safeParse(parsedPayload);
  if (!validated.success) {
    const flat = validated.error.flatten();
    console.warn("[adminSaveWeeklyAvailability] Validierungsfehler", flat);
    const msg =
      validated.error.issues.map((i) => i.message).find(Boolean) ??
      "Eingaben bitte prüfen (Zeiten, Überlappungen).";
    return { ok: false, message: msg };
  }

  return persistValidatedWeeklyAvailability(bookingType, validated.data);
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

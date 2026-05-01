"use server";

import { revalidatePath } from "next/cache";
import { formatZurichTimeRange } from "@/lib/datetime";
import { sendBookingEmails } from "@/lib/mail";
import { getSupabaseServer } from "@/lib/supabase/server";
import { bookingCreateSchema } from "@/lib/validations";

export type BookingActionResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

function formToObject(formData: FormData) {
  return {
    slotId: formData.get("slotId"),
    type: formData.get("type"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes") || undefined,
    website: formData.get("website") || undefined,
  };
}

export async function createBooking(
  _prev: BookingActionResult | null,
  formData: FormData
): Promise<BookingActionResult> {
  if (formData.get("website")) {
    return { ok: false, message: "Ihre Anfrage konnte nicht verarbeitet werden." };
  }

  const parsed = bookingCreateSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Ungültige Eingaben." };
  }

  const data = parsed.data;
  const supabase = getSupabaseServer();

  try {
    // Atomare Buchung via PostgreSQL-Funktion (verhindert Race Conditions)
    const { data: result, error } = await supabase.rpc("create_booking_atomic", {
      p_slot_id: data.slotId,
      p_type: data.type,
      p_first_name: data.firstName,
      p_last_name: data.lastName,
      p_email: data.email.trim().toLowerCase(),
      p_phone: data.phone.trim(),
      p_notes: data.notes?.trim() ?? null,
    });

    if (error) {
      console.error("[booking] RPC Fehler:", error);
      return { ok: false, message: "Buchung fehlgeschlagen. Bitte später erneut versuchen." };
    }

    const row = Array.isArray(result) ? result[0] : result;

    if (!row || row.error_message) {
      return { ok: false, message: row?.error_message ?? "Unbekannter Fehler." };
    }
    if (!row.booking_id) {
      return { ok: false, message: "Unbekannter Fehler." };
    }

    // Slot-Daten für E-Mail laden
    const { data: rawSlot } = await supabase
      .from("time_slots")
      .select("start_at, end_at")
      .eq("id", data.slotId)
      .single();
    const slot = rawSlot as { start_at: string; end_at: string } | null;

    if (slot) {
      const whenLabel = formatZurichTimeRange(slot.start_at, slot.end_at);
      try {
        await sendBookingEmails({
          type: data.type as "PROBETRAINING" | "PERSONAL_TRAINING",
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim(),
          phone: data.phone.trim(),
          whenLabel,
          notes: data.notes?.trim(),
        });
      } catch (mailErr) {
        console.error("[mail] Buchungs-E-Mails fehlgeschlagen:", mailErr);
      }
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/buchen");

    return { ok: true, bookingId: row.booking_id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler.";
    return { ok: false, message: msg };
  }
}

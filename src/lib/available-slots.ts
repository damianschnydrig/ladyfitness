import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingType } from "@/lib/supabase/types";

export type AvailableSlotDto = {
  id: string;
  startAt: string;
  endAt: string;
  bookingType: BookingType;
  available: boolean;
};

export async function getAvailableSlotsForType(type: BookingType): Promise<AvailableSlotDto[]> {
  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  const { data: rawSlots, error } = await supabase
    .from("time_slots")
    .select("id, start_at, end_at, booking_type")
    .eq("booking_type", type)
    .gt("start_at", now)
    .or("available.is.null,available.eq.true")
    .order("start_at", { ascending: true });

  let slots: { id: string; start_at: string; end_at: string; booking_type: BookingType }[];

  if (error) {
    const { data: fallbackSlots, error: fallbackError } = await supabase
      .from("time_slots")
      .select("id, start_at, end_at, booking_type")
      .eq("booking_type", type)
      .gt("start_at", now)
      .order("start_at", { ascending: true });

    if (fallbackError) {
      console.error("[slots] Supabase Fehler:", fallbackError);
      throw new Error("Datenbankfehler");
    }
    slots = (fallbackSlots ?? []) as typeof slots;
  } else {
    slots = (rawSlots ?? []) as typeof slots;
  }

  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("slot_id, slot:time_slots!inner(start_at, end_at)")
    .neq("status", "CANCELLED");

  const bookedSlotIds = new Set<string>();
  const blockedWindows = new Set<string>();

  for (const b of (activeBookings ?? []) as unknown as {
    slot_id: string;
    slot: { start_at: string; end_at: string } | null;
  }[]) {
    bookedSlotIds.add(b.slot_id);
    if (b.slot) {
      blockedWindows.add(`${b.slot.start_at}|${b.slot.end_at}`);
    }
  }

  const seen = new Set<string>();
  const result: AvailableSlotDto[] = [];

  for (const s of slots) {
    if (bookedSlotIds.has(s.id)) continue;

    const windowKey = `${s.start_at}|${s.end_at}`;
    if (blockedWindows.has(windowKey)) continue;

    const dedupeKey = `${s.start_at}|${s.booking_type}`;
    if (seen.has(dedupeKey)) continue;
    seen.add(dedupeKey);

    result.push({
      id: s.id,
      startAt: s.start_at,
      endAt: s.end_at,
      bookingType: s.booking_type,
      available: true,
    });
  }

  return result;
}

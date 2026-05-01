import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingType } from "@/lib/supabase/types";

/** Akzeptiert ?type=PROBETRAINING|PROBE|PERSONAL_TRAINING|PERSONAL */
function parseBookingType(raw: string | null): BookingType | null {
  if (!raw) return null;
  const up = raw.toUpperCase();
  if (up === "PROBETRAINING" || up === "PROBE") return "PROBETRAINING";
  if (up === "PERSONAL_TRAINING" || up === "PERSONAL") return "PERSONAL_TRAINING";
  return null;
}

export async function GET(req: NextRequest) {
  const type = parseBookingType(req.nextUrl.searchParams.get("type"));
  if (!type) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  /**
   * Haupt-Query: alle zukünftigen Slots dieses Typs
   * (available-Filter optional, Fallback ohne)
   */
  const { data: rawSlots, error } = await supabase
    .from("time_slots")
    .select("id, start_at, end_at, booking_type")
    .eq("booking_type", type)
    .gt("start_at", now)
    .or("available.is.null,available.eq.true")
    .order("start_at", { ascending: true });

  let slots: { id: string; start_at: string; end_at: string; booking_type: BookingType }[];

  if (error) {
    // Fallback: available-Spalte existiert noch nicht in DB
    const { data: fallbackSlots, error: fallbackError } = await supabase
      .from("time_slots")
      .select("id, start_at, end_at, booking_type")
      .eq("booking_type", type)
      .gt("start_at", now)
      .order("start_at", { ascending: true });

    if (fallbackError) {
      console.error("[slots] Supabase Fehler:", fallbackError);
      return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
    }
    slots = (fallbackSlots ?? []) as typeof slots;
  } else {
    slots = (rawSlots ?? []) as typeof slots;
  }

  /**
   * Alle aktiven Buchungen laden (inkl. Slot-Zeiten für Cross-Type-Check)
   * Cross-Type-Exklusivität:
   *   Wenn Zeitfenster X für Typ A gebucht → Typ-B-Slots im gleichen Fenster ausblenden.
   */
  const { data: activeBookings } = await supabase
    .from("bookings")
    .select("slot_id, slot:time_slots!inner(start_at, end_at)")
    .neq("status", "CANCELLED");

  const bookedSlotIds = new Set<string>();
  const blockedWindows = new Set<string>(); // "start_at|end_at" → sperrt andere Typen

  for (const b of (activeBookings ?? []) as unknown as {
    slot_id: string;
    slot: { start_at: string; end_at: string } | null;
  }[]) {
    bookedSlotIds.add(b.slot_id);
    if (b.slot) {
      blockedWindows.add(`${b.slot.start_at}|${b.slot.end_at}`);
    }
  }

  // Slots filtern: nicht gebucht, kein Zeitfenster-Konflikt, keine Duplikate
  const seen = new Set<string>();
  const result: {
    id: string;
    startAt: string;
    endAt: string;
    bookingType: BookingType;
    available: boolean;
  }[] = [];

  for (const s of slots) {
    // Direkt gebucht → überspringen
    if (bookedSlotIds.has(s.id)) continue;

    // Cross-Type: anderer Typ wurde im selben Zeitfenster gebucht → überspringen
    const windowKey = `${s.start_at}|${s.end_at}`;
    if (blockedWindows.has(windowKey)) continue;

    // Duplikate innerhalb desselben Typs entfernen
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

  return NextResponse.json(result);
}

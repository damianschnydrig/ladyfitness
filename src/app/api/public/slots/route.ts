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
   * SQL-Equivalent:
   *   SELECT id, start_at, end_at, booking_type
   *   FROM time_slots
   *   WHERE booking_type = $type
   *     AND start_at > NOW()
   *     AND (available IS NULL OR available = TRUE)
   *     AND id NOT IN (SELECT slot_id FROM bookings WHERE status != 'CANCELLED')
   *   ORDER BY start_at;
   */
  const { data: rawSlots, error } = await supabase
    .from("time_slots")
    .select("id, start_at, end_at, booking_type")
    .eq("booking_type", type)
    .gt("start_at", now)
    .or("available.is.null,available.eq.true")
    .order("start_at", { ascending: true });

  if (error) {
    console.error("[slots] Supabase Fehler:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  const allSlots = (rawSlots ?? []) as {
    id: string;
    start_at: string;
    end_at: string;
    booking_type: BookingType;
  }[];

  // Gebuchte Slot-IDs laden (typ-übergreifend)
  const { data: bookedRows } = await supabase
    .from("bookings")
    .select("slot_id")
    .neq("status", "CANCELLED");

  const bookedSet = new Set(
    ((bookedRows ?? []) as { slot_id: string }[]).map((b) => b.slot_id)
  );

  // Nur nicht-gebuchte Slots, ohne Duplikate innerhalb desselben Typs
  const seen = new Set<string>();
  const result: { id: string; startAt: string; endAt: string; bookingType: BookingType; available: boolean }[] = [];

  for (const s of allSlots) {
    if (bookedSet.has(s.id)) continue;
    // Duplikate innerhalb desselben Typs überspringen
    const key = `${s.start_at}|${s.booking_type}`;
    if (seen.has(key)) continue;
    seen.add(key);
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

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
   * SQL-Equivalent (basis):
   *   SELECT id, start_at, end_at, booking_type
   *   FROM time_slots
   *   WHERE booking_type = $type
   *     AND start_at > NOW()
   *   ORDER BY start_at;
   *
   * Cross-type blocking via available-Spalte wird automatisch genutzt
   * sobald Migration 004 in der DB ausgeführt wurde.
   */
  const { data: rawSlots, error } = await supabase
    .from("time_slots")
    .select("id, start_at, end_at, booking_type")
    .eq("booking_type", type)
    .gt("start_at", now)
    .order("start_at", { ascending: true })
    .or("available.is.null,available.eq.true");

  let slots: { id: string; start_at: string; end_at: string; booking_type: BookingType }[];

  if (error) {
    // Fallback: available-Spalte existiert noch nicht → ohne Filter
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

  // Gebuchte Slot-IDs laden (typ-übergreifend)
  const { data: bookedRows } = await supabase
    .from("bookings")
    .select("slot_id")
    .neq("status", "CANCELLED");

  const bookedSet = new Set(
    ((bookedRows ?? []) as { slot_id: string }[]).map((b) => b.slot_id)
  );

  // Bereits gebuchte Slots herausfiltern + Duplikate innerhalb desselben Typs entfernen
  const seen = new Set<string>();
  const result: {
    id: string;
    startAt: string;
    endAt: string;
    bookingType: BookingType;
    available: boolean;
  }[] = [];

  for (const s of slots) {
    if (bookedSet.has(s.id)) continue;
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

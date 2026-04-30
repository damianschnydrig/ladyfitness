import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingType } from "@/lib/supabase/types";

const querySchema = z.object({
  type: z.enum(["PROBETRAINING", "PERSONAL_TRAINING"]),
});

export async function GET(req: NextRequest) {
  const typeParam = req.nextUrl.searchParams.get("type");
  const parsed = querySchema.safeParse({ type: typeParam });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const type = parsed.data.type as BookingType;
  const supabase = getSupabaseServer();

  const { data: rawSlots, error } = await supabase
    .from("time_slots")
    .select("id, start_at, end_at, booking_type")
    .gt("start_at", now)
    .order("start_at", { ascending: true });

  if (error) {
    console.error("[slots] Supabase Fehler:", error);
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }

  const slots = (rawSlots ?? []) as {
    id: string;
    start_at: string;
    end_at: string;
    booking_type: BookingType;
  }[];

  // Gebuchte Slots global laden (buchungstyp-übergreifend).
  const { data: bookedSlotIds } = await supabase
    .from("bookings")
    .select("slot_id,status")
    .neq("status", "CANCELLED");

  const bookedSet = new Set(
    ((bookedSlotIds ?? []) as { slot_id: string; status: string }[]).map((b) => b.slot_id)
  );

  // Gleiche Zeitfenster zusammenfassen, damit pro Zeitraum nur ein Slot sichtbar ist.
  // Dadurch verschwinden parallele Doppel-Slots über beide Typen hinweg.
  const periodMap = new Map<
    string,
    {
      id: string;
      startAt: string;
      endAt: string;
      bookingType: BookingType;
      available: boolean;
    }
  >();

  for (const s of slots) {
    const key = `${s.start_at}|${s.end_at}`;
    const current = periodMap.get(key);
    const available = !bookedSet.has(s.id);
    if (!current) {
      periodMap.set(key, {
        id: s.id,
        startAt: s.start_at,
        endAt: s.end_at,
        bookingType: type,
        available,
      });
      continue;
    }
    // Falls einer der Duplikate bereits gebucht ist, gilt das gesamte Zeitfenster als nicht verfügbar.
    if (!available) current.available = false;
  }

  return NextResponse.json(
    Array.from(periodMap.values()).sort((a, b) => a.startAt.localeCompare(b.startAt))
  );
}

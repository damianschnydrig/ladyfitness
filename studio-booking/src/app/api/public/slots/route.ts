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
    .eq("booking_type", type)
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

  // Gebuchte Slots herausfiltern (Left-join über separaten Query für Zuverlässigkeit)
  const { data: bookedSlotIds } = await supabase
    .from("bookings")
    .select("slot_id")
    .eq("type", type);

  const bookedSet = new Set(
    ((bookedSlotIds ?? []) as { slot_id: string }[]).map((b) => b.slot_id)
  );

  const freeSlots = (slots ?? []).filter((s) => !bookedSet.has(s.id));

  return NextResponse.json(
    freeSlots.map((s) => ({
      id: s.id,
      startAt: s.start_at,
      endAt: s.end_at,
      bookingType: s.booking_type,
    }))
  );
}

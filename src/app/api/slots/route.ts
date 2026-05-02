import { NextRequest, NextResponse } from "next/server";
import { DateTime } from "luxon";
import { getAvailableSlotsForType } from "@/lib/available-slots";
import type { BookingType } from "@/lib/supabase/types";

export const dynamic = "force-dynamic";

const ZONE = "Europe/Zurich";

/** ?type=probetraining|personal_training|… & date=yyyy-MM-dd */
function parseBookingType(raw: string | null): BookingType | null {
  if (!raw) return null;
  const up = raw.toUpperCase().replace(/-/g, "_");
  if (up === "PROBETRAINING" || up === "PROBE") return "PROBETRAINING";
  if (up === "PERSONAL_TRAINING" || up === "PERSONAL") return "PERSONAL_TRAINING";
  return null;
}

export async function GET(req: NextRequest) {
  const type = parseBookingType(req.nextUrl.searchParams.get("type"));
  const dateStr = req.nextUrl.searchParams.get("date");
  if (!type) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }
  if (!dateStr || !/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return NextResponse.json({ error: "Ungültiges Datum (yyyy-MM-dd)" }, { status: 400 });
  }

  try {
    const all = await getAvailableSlotsForType(type);
    const filtered = all.filter((s) => {
      const dayKey = DateTime.fromISO(s.startAt, { zone: "utc" }).setZone(ZONE).toFormat("yyyy-MM-dd");
      return dayKey === dateStr;
    });
    return NextResponse.json(filtered);
  } catch {
    return NextResponse.json({ error: "Datenbankfehler" }, { status: 500 });
  }
}

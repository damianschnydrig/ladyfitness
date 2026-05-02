import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { persistValidatedWeeklyAvailability } from "@/lib/persist-weekly-availability";
import { dbDayOfWeekToLuxonWeekday } from "@/lib/slot-generation";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { WeeklyAvailabilityInterval } from "@/lib/supabase/types";
import { weeklyAvailabilityPayloadSchema } from "@/lib/validations";

export const runtime = "nodejs";

const DAY_KEYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

function parseApiBookingType(raw: string | null): "PROBETRAINING" | "PERSONAL_TRAINING" | null {
  if (!raw) return null;
  const u = raw.toLowerCase().replace(/-/g, "_");
  if (u === "probetraining" || u === "probe") return "PROBETRAINING";
  if (u === "personal_training" || u === "personal") return "PERSONAL_TRAINING";
  return null;
}

function scheduleFromBody(schedule: Record<string, unknown>) {
  const out: Record<string, { start: string; end: string; slotMinutes: number }[]> = {};
  for (let i = 1; i <= 7; i++) out[String(i)] = [];
  for (const key of DAY_KEYS) {
    const raw = schedule[key];
    if (!Array.isArray(raw)) continue;
    const luxonKey = String(DAY_KEYS.indexOf(key) + 1);
    for (const item of raw) {
      const o = item as { start?: unknown; end?: unknown; slotMinutes?: unknown };
      out[luxonKey].push({
        start: String(o.start ?? ""),
        end: String(o.end ?? ""),
        slotMinutes: typeof o.slotMinutes === "number" ? o.slotMinutes : 60,
      });
    }
  }
  return out;
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const type = parseApiBookingType(req.nextUrl.searchParams.get("type"));
  if (!type) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  const supabase = getSupabaseServer();
  const { data: rows, error: rowsErr } = await supabase
    .from("weekly_availability_intervals")
    .select("*")
    .eq("booking_type", type)
    .order("day_of_week", { ascending: true })
    .order("start_time", { ascending: true });

  if (rowsErr) {
    return NextResponse.json({ error: rowsErr.message }, { status: 500 });
  }

  const schedule: Record<(typeof DAY_KEYS)[number], { start: string; end: string; slotMinutes: number }[]> = {
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  };

  for (const r of (rows ?? []) as WeeklyAvailabilityInterval[]) {
    const lw = dbDayOfWeekToLuxonWeekday(r.day_of_week);
    const key = DAY_KEYS[lw - 1];
    schedule[key].push({
      start: r.start_time.slice(0, 5),
      end: r.end_time.slice(0, 5),
      slotMinutes: r.slot_duration_minutes,
    });
  }

  const typeLabel = type === "PROBETRAINING" ? "probetraining" : "personal_training";
  return NextResponse.json({ type: typeLabel, schedule });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = JSON.parse(await req.text());
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const o = body as { type?: string; schedule?: Record<string, unknown> };
  const type = parseApiBookingType(o.type ?? null);
  if (!type || !o.schedule || typeof o.schedule !== "object") {
    return NextResponse.json({ error: "type und schedule erforderlich" }, { status: 400 });
  }

  const payload = scheduleFromBody(o.schedule);
  const validated = weeklyAvailabilityPayloadSchema.safeParse(payload);
  if (!validated.success) {
    const msg =
      validated.error.issues.map((i) => i.message).join("; ") || "Validierung fehlgeschlagen";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const result = await persistValidatedWeeklyAvailability(type, validated.data);
  if (!result.ok) {
    return NextResponse.json({ error: result.message }, { status: 500 });
  }

  return NextResponse.json(result);
}

import { BookingType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const querySchema = z.object({
  type: z.enum(["PROBETRAINING", "PERSONAL_TRAINING"]),
});

export async function GET(req: NextRequest) {
  const typeParam = req.nextUrl.searchParams.get("type");
  const parsed = querySchema.safeParse({ type: typeParam });
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültiger Typ" }, { status: 400 });
  }

  const now = new Date();
  const type = parsed.data.type as BookingType;

  const slots = await prisma.timeSlot.findMany({
    where: {
      bookingType: type,
      startAt: { gt: now },
      booking: null,
    },
    orderBy: { startAt: "asc" },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      bookingType: true,
    },
  });

  return NextResponse.json(
    slots.map((s) => ({
      id: s.id,
      startAt: s.startAt.toISOString(),
      endAt: s.endAt.toISOString(),
      bookingType: s.bookingType,
    }))
  );
}

"use server";

import { BookingStatus, BookingType, ContactStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/auth";
import { parseZurichWallClock } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";
import { slotCreateSchema, slotDeleteSchema } from "@/lib/validations";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Nicht angemeldet.");
  }
  return session;
}

export async function adminCreateSlot(formData: FormData): Promise<void> {
  await requireAdmin();

  const parsed = slotCreateSchema.safeParse({
    date: formData.get("date"),
    startTime: formData.get("startTime"),
    endTime: formData.get("endTime"),
    bookingType: formData.get("bookingType"),
  });

  if (!parsed.success) {
    console.warn("[adminCreateSlot]", parsed.error.flatten());
    return;
  }

  const { date, startTime, endTime, bookingType } = parsed.data;

  let startAt: Date;
  let endAt: Date;
  try {
    startAt = parseZurichWallClock(date, startTime);
    endAt = parseZurichWallClock(date, endTime);
  } catch {
    console.warn("[adminCreateSlot] parse Zeit");
    return;
  }

  if (endAt <= startAt || startAt.getTime() <= Date.now()) {
    return;
  }

  await prisma.timeSlot.create({
    data: {
      startAt,
      endAt,
      bookingType: bookingType as BookingType,
    },
  });

  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");
}

export async function adminDeleteSlot(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = slotDeleteSchema.safeParse({ id: formData.get("id") });
  if (!parsed.success) return;

  const slot = await prisma.timeSlot.findUnique({
    where: { id: parsed.data.id },
    include: { booking: true },
  });
  if (slot?.booking) return;

  await prisma.timeSlot.delete({ where: { id: parsed.data.id } });
  revalidatePath("/admin/slots");
  revalidatePath("/admin/calendar");
  revalidatePath("/buchen");
}

const statusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["CONFIRMED", "CANCELLED", "COMPLETED"]),
});

export async function adminUpdateBookingStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = statusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.booking.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status as BookingStatus },
  });

  revalidatePath("/admin/bookings");
  revalidatePath("/admin/archive");
  revalidatePath("/admin/calendar");
}

const contactStatusSchema = z.object({
  id: z.string().cuid(),
  status: z.enum(["NEW", "IN_PROGRESS", "DONE", "ARCHIVED"]),
});

export async function adminUpdateContactStatus(formData: FormData): Promise<void> {
  await requireAdmin();
  const parsed = contactStatusSchema.safeParse({
    id: formData.get("id"),
    status: formData.get("status"),
  });
  if (!parsed.success) return;

  await prisma.contactInquiry.update({
    where: { id: parsed.data.id },
    data: { status: parsed.data.status as ContactStatus },
  });

  revalidatePath("/admin/contacts");
  revalidatePath("/admin/archive");
}

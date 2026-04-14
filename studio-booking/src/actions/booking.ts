"use server";

import { BookingType } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { formatZurichTimeRange } from "@/lib/datetime";
import { sendBookingEmails } from "@/lib/mail";
import { prisma } from "@/lib/prisma";
import { bookingCreateSchema } from "@/lib/validations";

export type BookingActionResult =
  | { ok: true; bookingId: string }
  | { ok: false; message: string };

function formToObject(formData: FormData) {
  return {
    slotId: formData.get("slotId"),
    type: formData.get("type"),
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    notes: formData.get("notes") || undefined,
    website: formData.get("website") || undefined,
  };
}

export async function createBooking(
  _prev: BookingActionResult | null,
  formData: FormData
): Promise<BookingActionResult> {
  if (formData.get("website")) {
    return { ok: false, message: "Ihre Anfrage konnte nicht verarbeitet werden." };
  }

  const parsed = bookingCreateSchema.safeParse(formToObject(formData));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { ok: false, message: first?.message ?? "Ungültige Eingaben." };
  }

  const data = parsed.data;

  try {
    const result = await prisma.$transaction(async (tx) => {
      const slot = await tx.timeSlot.findUnique({
        where: { id: data.slotId },
        include: { booking: true },
      });

      if (!slot) {
        throw new Error("Dieser Termin ist nicht mehr verfügbar.");
      }
      if (slot.booking) {
        throw new Error("Dieser Termin wurde soeben gebucht. Bitte wählen Sie einen anderen Slot.");
      }
      if (slot.bookingType !== (data.type as BookingType)) {
        throw new Error("Termin passt nicht zur gewählten Buchungsart.");
      }
      if (slot.startAt.getTime() <= Date.now()) {
        throw new Error("Dieser Termin liegt in der Vergangenheit.");
      }

      const booking = await tx.booking.create({
        data: {
          slotId: slot.id,
          type: data.type as BookingType,
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email.trim().toLowerCase(),
          phone: data.phone.trim(),
          notes: data.notes?.trim() || null,
          status: "CONFIRMED",
        },
      });

      return { booking, slot };
    });

    const whenLabel = formatZurichTimeRange(
      result.slot.startAt,
      result.slot.endAt
    );

    try {
      await sendBookingEmails({
        type: data.type as "PROBETRAINING" | "PERSONAL_TRAINING",
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email.trim(),
        phone: data.phone.trim(),
        whenLabel,
        notes: data.notes?.trim(),
      });
    } catch (mailErr) {
      console.error("[mail] Buchungs-E-Mails fehlgeschlagen:", mailErr);
    }

    revalidatePath("/admin");
    revalidatePath("/admin/bookings");
    revalidatePath("/admin/calendar");
    revalidatePath("/buchen");

    return { ok: true, bookingId: result.booking.id };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unbekannter Fehler.";
    return { ok: false, message: msg };
  }
}

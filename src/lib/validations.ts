import { z } from "zod";

export const bookingTypeSchema = z.enum([
  "PROBETRAINING",
  "PERSONAL_TRAINING",
]);

export const bookingCreateSchema = z.object({
  slotId: z.string().uuid(),
  type: bookingTypeSchema,
  firstName: z.string().trim().min(1, "Vorname fehlt").max(80),
  lastName: z.string().trim().min(1, "Nachname fehlt").max(80),
  email: z.string().trim().email("Ungültige E-Mail"),
  phone: z.string().trim().min(6, "Telefonnummer zu kurz").max(40),
  notes: z.string().trim().max(2000).optional(),
  website: z.string().max(0).optional(),
});

export const contactCreateSchema = z.object({
  firstName: z.string().trim().min(1, "Vorname fehlt").max(80),
  lastName: z.string().trim().min(1, "Nachname fehlt").max(80),
  email: z.string().trim().email("Ungültige E-Mail-Adresse"),
  phone: z.string().trim().min(6, "Telefonnummer zu kurz").max(40),
  subject: z.enum(["PROBETRAINING", "PERSONAL_TRAINING", "GENERAL", "CANCELLATION"], {
    message: "Bitte wählen Sie einen Betreff.",
  }),
  message: z.string().trim().min(10, "Nachricht bitte etwas ausführlicher (mind. 10 Zeichen)").max(8000),
  website: z.string().max(0).optional(),
});

const hhmmStrict = z.string().regex(/^\d{2}:\d{2}$/, "Ungültige Uhrzeit");

export const weeklySlotRuleSchema = z
  .object({
    weekday: z.coerce.number().int().min(1).max(7),
    startTime: hhmmStrict.optional(),
    endTime: hhmmStrict.optional(),
  })
  .superRefine((value, ctx) => {
    const hasStart = !!value.startTime;
    const hasEnd = !!value.endTime;
    if (hasStart !== hasEnd) {
      ctx.addIssue({
        code: "custom",
        path: ["startTime"],
        message: "Start- und Endzeit müssen gemeinsam gesetzt werden.",
      });
    }
    if (hasStart && hasEnd && value.startTime! >= value.endTime!) {
      ctx.addIssue({
        code: "custom",
        path: ["endTime"],
        message: "Endzeit muss nach der Startzeit liegen.",
      });
    }
  });

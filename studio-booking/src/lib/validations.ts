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
  subject: z.string().trim().min(2, "Betreff fehlt").max(200),
  message: z.string().trim().min(10, "Nachricht bitte etwas ausführlicher (mind. 10 Zeichen)").max(8000),
  website: z.string().max(0).optional(),
});

const hhmm = z
  .string()
  .transform((s) => (typeof s === "string" && s.length >= 5 ? s.slice(0, 5) : s))
  .pipe(z.string().regex(/^\d{2}:\d{2}$/, "Uhrzeit ungültig"));

export const slotCreateSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: hhmm,
  endTime: hhmm,
  bookingType: bookingTypeSchema,
});

export const slotDeleteSchema = z.object({
  id: z.string().uuid(),
});

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

export const hhmmStrict = z.string().regex(/^\d{2}:\d{2}$/, "Ungültige Uhrzeit");

export const weeklyAvailabilityIntervalRowSchema = z.object({
  start: hhmmStrict,
  end: hhmmStrict,
  slotMinutes: z.coerce.number().int().min(15).max(24 * 60),
});

/** Payload: Schlüssel Luxon-Wochentag "1"…"7", Werte Listen von Intervallen */
export const weeklyAvailabilityPayloadSchema = z
  .record(z.string(), z.array(weeklyAvailabilityIntervalRowSchema))
  .superRefine((record, ctx) => {
    const allowed = new Set(["1", "2", "3", "4", "5", "6", "7"]);
    for (const key of Object.keys(record)) {
      if (!allowed.has(key)) {
        ctx.addIssue({
          code: "custom",
          message: `Ungültiger Wochentag: ${key}`,
        });
      }
    }

    for (const key of allowed) {
      const intervals = record[key] ?? [];
      for (let i = 0; i < intervals.length; i++) {
        const row = intervals[i];
        if (row.start >= row.end) {
          ctx.addIssue({
            code: "custom",
            message: `Wochentag ${key}: Endzeit muss nach der Startzeit liegen.`,
          });
        }
      }

      const sorted = [...intervals].sort((a, b) => a.start.localeCompare(b.start));
      for (let i = 0; i < sorted.length; i++) {
        for (let j = i + 1; j < sorted.length; j++) {
          if (intervalsOverlapHalfOpen(sorted[i].start, sorted[i].end, sorted[j].start, sorted[j].end)) {
            ctx.addIssue({
              code: "custom",
              message: `Wochentag ${key}: Zeitintervalle dürfen sich nicht überlappen.`,
            });
            return;
          }
        }
      }
    }
  });

export function timeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** Überlappung im Sinne von [start, end) — Grenzberührung ist erlaubt */
export function intervalsOverlapHalfOpen(aStart: string, aEnd: string, bStart: string, bEnd: string): boolean {
  const as = timeToMinutes(aStart);
  const ae = timeToMinutes(aEnd);
  const bs = timeToMinutes(bStart);
  const be = timeToMinutes(bEnd);
  return as < be && bs < ae;
}

import type { Metadata } from "next";
import { adminCreateSlot, adminDeleteSlot } from "@/actions/admin";
import { formatZurichTimeRange, isPastSlot } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Verfügbarkeiten",
  robots: { index: false, follow: false },
};

export default async function AdminSlotsPage() {
  const now = new Date();
  const futureSlots = await prisma.timeSlot.findMany({
    where: { startAt: { gte: now } },
    include: { booking: true },
    orderBy: { startAt: "asc" },
  });

  return (
    <div className="space-y-10">
      <div>
        <h1 className="font-serif text-2xl">Verfügbarkeiten</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Neue Zeitslots freischalten oder ungebuchte zukünftige Slots entfernen.
        </p>
      </div>

      <section className="border border-brand-border bg-white p-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Neuen Slot anlegen
        </h2>
        <form action={adminCreateSlot} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Datum</span>
            <input required type="date" name="date" className="field" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Start</span>
            <input required type="time" name="startTime" className="field" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Ende</span>
            <input required type="time" name="endTime" className="field" />
          </label>
          <label className="text-sm">
            <span className="mb-1 block font-semibold">Typ</span>
            <select name="bookingType" className="field" required>
              <option value="PROBETRAINING">Probetraining</option>
              <option value="PERSONAL_TRAINING">Personal Training</option>
            </select>
          </label>
          <div className="sm:col-span-2 lg:col-span-4">
            <button
              type="submit"
              className="bg-brand-pink px-6 py-2.5 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-pink-dark"
            >
              Slot speichern
            </button>
          </div>
        </form>
      </section>

      <section>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-dark">
          Zukünftige Slots
        </h2>
        {futureSlots.length === 0 ? (
          <p className="mt-3 text-sm text-brand-muted">Keine Slots angelegt.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {futureSlots.map((s) => {
              const booked = !!s.booking;
              const past = isPastSlot(s.endAt);
              return (
                <li
                  key={s.id}
                  className="flex flex-wrap items-center justify-between gap-4 border border-brand-border bg-white px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      {formatZurichTimeRange(s.startAt, s.endAt)}
                    </p>
                    <p className="text-xs text-brand-muted">
                      {s.bookingType === "PROBETRAINING"
                        ? "Probetraining"
                        : "Personal Training"}{" "}
                      · {booked ? "gebucht" : "frei"}
                      {past ? " · vergangen" : ""}
                    </p>
                  </div>
                  {!booked ? (
                    <form action={adminDeleteSlot}>
                      <input type="hidden" name="id" value={s.id} />
                      <button
                        type="submit"
                        className="text-xs font-bold uppercase tracking-wider text-red-600 hover:underline"
                      >
                        Löschen
                      </button>
                    </form>
                  ) : (
                    <span className="text-xs text-brand-muted">Gebucht — nicht löschbar</span>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

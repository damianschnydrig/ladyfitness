"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DateTime } from "luxon";
import {
  type BookingActionResult,
  createBooking,
} from "@/actions/booking";

type SlotDto = {
  id: string;
  startAt: string;
  endAt: string;
  bookingType: string;
  available: boolean;
};

type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";

export function BookingWizard() {
  const zone = "Europe/Zurich";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<BookingType | null>(() => {
    const t = searchParams?.get("type");
    if (t === "PROBETRAINING" || t === "PERSONAL_TRAINING") return t as BookingType;
    return null;
  });
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotId, setSlotId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    DateTime.now().setZone(zone).startOf("month").toFormat("yyyy-MM")
  );
  const [state, formAction, pending] = useActionState<
    BookingActionResult | null,
    FormData
  >(createBooking, null);

  useEffect(() => {
    if (!type) {
      setSlots([]);
      setSlotId(null);
      return;
    }
    let cancelled = false;
    setSlotsLoading(true);
    fetch(`/api/public/slots?type=${type}`, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error("Slots");
        return r.json();
      })
      .then((data: SlotDto[]) => {
        console.log("SLOTS_GENERATED", data);
        if (!cancelled) {
          setSlots(data);
          setSlotId(null);
          const firstAvailable = data.find((slot) => slot.available);
          const defaultDate = firstAvailable
            ? DateTime.fromISO(firstAvailable.startAt, { zone: "utc" }).setZone(zone).toFormat("yyyy-MM-dd")
            : null;
          setSelectedDate(defaultDate);
          if (defaultDate) {
            setVisibleMonth(defaultDate.slice(0, 7));
          }
        }
      })
      .catch(() => {
        if (!cancelled) setSlots([]);
      })
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [type]);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/buchen/bestaetigung?id=${state.bookingId}`);
    }
  }, [state, router]);

  const slotsByDay = slots.reduce<Record<string, SlotDto[]>>((acc, slot) => {
    const dayKey = DateTime.fromISO(slot.startAt, { zone: "utc" }).setZone(zone).toFormat("yyyy-MM-dd");
    if (!acc[dayKey]) acc[dayKey] = [];
    acc[dayKey].push(slot);
    return acc;
  }, {});
  const monthDate = DateTime.fromFormat(visibleMonth, "yyyy-MM", { zone }).startOf("month");
  const monthStart = monthDate.startOf("month");
  const calendarStart = monthStart.minus({ days: monthStart.weekday - 1 });
  const calendarDays = Array.from({ length: 42 }, (_, i) => calendarStart.plus({ days: i }));
  const selectedDaySlots = selectedDate ? (slotsByDay[selectedDate] ?? []) : [];

  return (
    <div className="mx-auto max-w-3xl space-y-10">
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
          1. Art des Termins
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setType("PROBETRAINING")}
            className={`group border-2 p-6 text-left transition-all hover:shadow-soft ${
              type === "PROBETRAINING"
                ? "border-brand-pink bg-brand-pink-light/50"
                : "border-brand-border bg-white hover:border-brand-pink/40"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
              Probetraining
            </span>
            <p className="mt-2 font-serif text-xl text-brand-dark">
              Kostenlos &amp; unverbindlich
            </p>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              Lernen Sie Studio, Team und Trainingskonzept persönlich kennen.
            </p>
          </button>
          <button
            type="button"
            onClick={() => setType("PERSONAL_TRAINING")}
            className={`group border-2 p-6 text-left transition-all hover:shadow-soft ${
              type === "PERSONAL_TRAINING"
                ? "border-brand-pink bg-brand-pink-light/50"
                : "border-brand-border bg-white hover:border-brand-pink/40"
            }`}
          >
            <span className="text-xs font-bold uppercase tracking-wider text-brand-pink">
              Personal Training
            </span>
            <p className="mt-2 font-serif text-xl text-brand-dark">
              Individuell &amp; fokussiert
            </p>
            <p className="mt-2 text-sm text-brand-muted leading-relaxed">
              Persönliche Betreuung mit Trainingsplan und Fortschrittskontrolle.
            </p>
          </button>
        </div>
      </section>

      {type ? (
        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
              2. Freier Termin
            </h2>
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-wider text-brand-muted hover:text-brand-pink"
              onClick={() => {
                setType(null);
                setSlotId(null);
              }}
            >
              Zurück
            </button>
          </div>
          {slotsLoading ? (
            <p className="text-sm text-brand-muted">Lade verfügbare Zeiten…</p>
          ) : slots.length === 0 ? (
            <div className="rounded-none border border-dashed border-brand-border bg-brand-alt/30 p-6 text-sm text-brand-muted">
              Für diese Kategorie sind aktuell keine freien Termine freigeschaltet.
              Bitte rufen Sie uns an oder nutzen Sie das{" "}
              <a className="text-brand-pink font-semibold underline" href="/kontakt">
                Kontaktformular
              </a>
              .
            </div>
          ) : (
            <div className="space-y-5">
              <div className="border border-brand-border bg-white p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setVisibleMonth(monthDate.minus({ months: 1 }).toFormat("yyyy-MM"))}
                    className="border border-brand-border px-2 py-1 text-xs font-bold"
                  >
                    ←
                  </button>
                  <p className="font-serif text-base text-brand-dark">
                    {monthDate.setLocale("de-CH").toFormat("LLLL yyyy")}
                  </p>
                  <button
                    type="button"
                    onClick={() => setVisibleMonth(monthDate.plus({ months: 1 }).toFormat("yyyy-MM"))}
                    className="border border-brand-border px-2 py-1 text-xs font-bold"
                  >
                    →
                  </button>
                </div>
                <div className="mb-2 grid grid-cols-7 text-center text-[11px] font-semibold uppercase text-brand-muted">
                  {["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"].map((wd) => (
                    <span key={wd}>{wd}</span>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((day) => {
                    const dayKey = day.toFormat("yyyy-MM-dd");
                    const inMonth = day.month === monthDate.month;
                    const hasAvailable = (slotsByDay[dayKey] ?? []).some((slot) => slot.available);
                    const active = selectedDate === dayKey;
                    return (
                      <button
                        key={dayKey}
                        type="button"
                        disabled={!inMonth || !hasAvailable}
                        onClick={() => {
                          setSelectedDate(dayKey);
                          setSlotId(null);
                        }}
                        className={`h-9 border text-xs transition ${
                          active
                            ? "border-brand-pink bg-brand-pink-light text-brand-pink-dark"
                            : hasAvailable
                              ? "border-brand-pink/40 bg-brand-pink/5 text-brand-dark hover:border-brand-pink"
                              : "cursor-not-allowed border-brand-border/60 bg-brand-alt/50 text-brand-muted/60"
                        } ${!inMonth ? "opacity-40" : ""}`}
                      >
                        {day.day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate ? (
                <div>
                  <p className="mb-2 text-sm font-semibold text-brand-dark">
                    Verfügbare Zeiten am{" "}
                    {DateTime.fromISO(selectedDate, { zone }).setLocale("de-CH").toFormat("cccc, dd.MM.yyyy")}
                  </p>
                  {selectedDaySlots.length === 0 ? (
                    <p className="text-sm text-brand-muted">Für dieses Datum gibt es keine Slots.</p>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-brand-muted">Bitte wählen Sie zuerst ein Datum mit verfügbaren Zeiten.</p>
              )}

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4">
                {selectedDaySlots.map((s) => {
                const selected = slotId === s.id;
                const disabled = !s.available;
                return (
                  <button
                    key={s.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setSlotId(s.id)}
                    className={`border px-3 py-2 text-left text-sm transition-all ${
                      disabled
                        ? "cursor-not-allowed border-brand-border/70 bg-brand-alt/50 text-brand-muted line-through opacity-70"
                        : ""
                    } ${
                      selected
                        ? "border-brand-pink bg-brand-pink-light/60 ring-1 ring-brand-pink"
                        : "border-brand-border hover:border-brand-pink/50"
                    }`}
                  >
                    {new Date(s.startAt).toLocaleTimeString("de-CH", {
                      hour: "2-digit",
                      minute: "2-digit",
                      timeZone: "Europe/Zurich",
                    })} Uhr
                  </button>
                );
              })}
              </div>
            </div>
          )}
        </section>
      ) : null}

      {type && slotId ? (
        <section className="space-y-4 border-t border-brand-border pt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-brand-dark">
            3. Ihre Kontaktdaten
          </h2>
          {state && !state.ok ? (
            <div
              role="alert"
              className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            >
              {state.message}
              {state.message?.includes("soeben gebucht") || state.message?.includes("nicht mehr verfügbar") ? (
                <button
                  type="button"
                  className="ml-2 font-semibold underline"
                  onClick={() => {
                    setSlotId(null);
                    // Slots neu laden
                    if (type) {
                      setSlotsLoading(true);
                      fetch(`/api/public/slots?type=${type}`, { cache: "no-store" })
                        .then((r) => r.json())
                        .then((data) => {
                          console.log("SLOTS_GENERATED", data);
                          setSlots(data);
                          setSlotsLoading(false);
                        })
                        .catch(() => setSlotsLoading(false));
                    }
                  }}
                >
                  Andere Zeit wählen
                </button>
              ) : null}
            </div>
          ) : null}
          <form action={formAction} className="space-y-5">
            <input type="hidden" name="type" value={type} />
            <input type="hidden" name="slotId" value={slotId} />
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="absolute left-[-9999px] h-0 w-0 opacity-0"
              aria-hidden="true"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Vorname *">
                <input
                  required
                  name="firstName"
                  autoComplete="given-name"
                  className="field"
                />
              </Field>
              <Field label="Nachname *">
                <input
                  required
                  name="lastName"
                  autoComplete="family-name"
                  className="field"
                />
              </Field>
            </div>
            <Field label="E-Mail *">
              <input
                required
                type="email"
                name="email"
                autoComplete="email"
                className="field"
              />
            </Field>
            <Field label="Telefon *">
              <input
                required
                type="tel"
                name="phone"
                autoComplete="tel"
                className="field"
              />
            </Field>
            <Field label="Mitteilung (optional)">
              <textarea name="notes" rows={4} className="field resize-y min-h-[100px]" />
            </Field>
            <button
              type="submit"
              disabled={pending}
              className="w-full bg-brand-pink px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-brand-pink-dark disabled:opacity-60"
            >
              {pending ? "Wird gesendet…" : "Jetzt verbindlich anfragen"}
            </button>
            <p className="text-xs text-brand-muted leading-relaxed">
              Mit dem Absenden akzeptieren Sie, dass wir Ihre Angaben zur Bearbeitung
              Ihrer Anfrage gemäss unserer Datenschutzerklärung verwenden.
            </p>
          </form>
        </section>
      ) : null}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2 text-sm">
      <span className="font-semibold text-brand-dark">{label}</span>
      {children}
    </label>
  );
}

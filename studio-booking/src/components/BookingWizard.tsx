"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  type BookingActionResult,
  createBooking,
} from "@/actions/booking";
import { formatZurichTimeRange } from "@/lib/datetime";

type SlotDto = {
  id: string;
  startAt: string;
  endAt: string;
  bookingType: string;
};

type BookingType = "PROBETRAINING" | "PERSONAL_TRAINING";

export function BookingWizard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [type, setType] = useState<BookingType | null>(() => {
    const t = searchParams.get("type");
    if (t === "PROBETRAINING" || t === "PERSONAL_TRAINING") return t as BookingType;
    return null;
  });
  const [slots, setSlots] = useState<SlotDto[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotId, setSlotId] = useState<string | null>(null);
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
    fetch(`/api/public/slots?type=${type}`)
      .then((r) => {
        if (!r.ok) throw new Error("Slots");
        return r.json();
      })
      .then((data: SlotDto[]) => {
        if (!cancelled) {
          setSlots(data);
          setSlotId(null);
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
            <div className="grid gap-2 sm:grid-cols-2">
              {slots.map((s) => {
                const label = formatZurichTimeRange(
                  new Date(s.startAt),
                  new Date(s.endAt)
                );
                const selected = slotId === s.id;
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSlotId(s.id)}
                    className={`border px-4 py-3 text-left text-sm transition-all ${
                      selected
                        ? "border-brand-pink bg-brand-pink-light/60 ring-1 ring-brand-pink"
                        : "border-brand-border hover:border-brand-pink/50"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
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

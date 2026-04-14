"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  type ContactActionResult,
  createContactInquiry,
} from "@/actions/contact";

export function ContactForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<
    ContactActionResult | null,
    FormData
  >(createContactInquiry, null);

  useEffect(() => {
    if (state?.ok) {
      router.push(`/kontakt/bestaetigung?id=${state.id}`);
    }
  }, [state, router]);

  return (
    <div className="mx-auto max-w-2xl space-y-8 px-4 py-12 sm:px-6">
      <header className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          Kontakt
        </p>
        <h1 className="font-serif text-3xl sm:text-4xl text-balance">
          Nachricht an uns
        </h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Haben Sie Fragen zu Mitgliedschaft, Angebot oder Ablauf? Schreiben Sie uns
          — wir melden uns persönlich bei Ihnen.
        </p>
      </header>

      {state && !state.ok ? (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
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
        <Field label="Betreff *">
          <input required name="subject" className="field" />
        </Field>
        <Field label="Ihre Nachricht *">
          <textarea
            required
            name="message"
            rows={6}
            className="field resize-y min-h-[140px]"
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-dark px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-brand-pink disabled:opacity-60"
        >
          {pending ? "Wird gesendet…" : "Nachricht senden"}
        </button>
      </form>
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

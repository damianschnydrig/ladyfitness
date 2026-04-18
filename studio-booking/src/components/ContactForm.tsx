"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  type ContactActionResult,
  createContactInquiry,
} from "@/actions/contact";

export function ContactForm() {
  const router = useRouter();
  const tsRef = useRef<HTMLInputElement>(null);

  const [state, formAction, pending] = useActionState<
    ContactActionResult | null,
    FormData
  >(createContactInquiry, null);

  // Lade-Timestamp setzen (Timing-basierter Spam-Schutz)
  useEffect(() => {
    if (tsRef.current) {
      tsRef.current.value = String(Date.now());
    }
  }, []);

  // Bei Erfolg mit DB-ID → Bestätigungsseite
  useEffect(() => {
    if (state?.ok && "id" in state) {
      router.push(`/kontakt/bestaetigung?id=${state.id}`);
    }
  }, [state, router]);

  const fields = (!state?.ok && state?.fields) ? state.fields : {};
  const emailSent = state?.ok && "emailSent" in state;

  if (emailSent) {
    return (
      <div className="mx-auto max-w-2xl py-8 text-center">
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 64,
            height: 64,
            border: "2px solid var(--color-dark)",
            fontSize: "1.5rem",
            marginBottom: "1.5rem",
          }}
        >
          ✉
        </div>
        <h2
          style={{
            fontFamily: "var(--font-serif, Georgia, serif)",
            fontSize: "1.8rem",
            marginBottom: "1rem",
            color: "var(--color-dark)",
          }}
        >
          Nachricht erhalten
        </h2>
        <p
          style={{
            fontSize: "0.9rem",
            color: "var(--color-muted)",
            lineHeight: 1.8,
            maxWidth: 480,
            margin: "0 auto 1.5rem",
          }}
        >
          Vielen Dank für Ihre Nachricht. Wir melden uns in Kürze persönlich
          bei Ihnen.
        </p>
        <a href="/kontakt" className="btn btn--outline">
          Weitere Nachricht senden
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 py-4">
      <p className="text-sm text-brand-muted leading-relaxed">
        Haben Sie Fragen zu Mitgliedschaft, Angebot oder Ablauf? Wir melden uns
        persönlich bei Ihnen.
      </p>

      {state && !state.ok ? (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {state.message}
        </div>
      ) : null}

      <form action={formAction} className="space-y-5">
        {/* Honeypot: für Menschen unsichtbar, Bots füllen es aus */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          className="absolute left-[-9999px] h-0 w-0 opacity-0"
          aria-hidden="true"
        />
        {/* Timing-Timestamp */}
        <input type="hidden" name="_ts" ref={tsRef} />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Vorname *" error={fields.firstName}>
            <input
              required
              name="firstName"
              autoComplete="given-name"
              className={`field${fields.firstName ? " border-red-400" : ""}`}
            />
          </Field>
          <Field label="Nachname *" error={fields.lastName}>
            <input
              required
              name="lastName"
              autoComplete="family-name"
              className={`field${fields.lastName ? " border-red-400" : ""}`}
            />
          </Field>
        </div>
        <Field label="E-Mail *" error={fields.email}>
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className={`field${fields.email ? " border-red-400" : ""}`}
          />
        </Field>
        <Field label="Telefon *" error={fields.phone}>
          <input
            required
            type="tel"
            name="phone"
            autoComplete="tel"
            className={`field${fields.phone ? " border-red-400" : ""}`}
          />
        </Field>
        <Field label="Betreff *" error={fields.subject}>
          <input
            required
            name="subject"
            className={`field${fields.subject ? " border-red-400" : ""}`}
          />
        </Field>
        <Field label="Ihre Nachricht *" error={fields.message}>
          <textarea
            required
            name="message"
            rows={6}
            className={`field resize-y min-h-[140px]${fields.message ? " border-red-400" : ""}`}
          />
        </Field>
        <button
          type="submit"
          disabled={pending}
          className="w-full bg-brand-dark px-6 py-3 text-sm font-bold uppercase tracking-[0.15em] text-white transition hover:bg-brand-pink disabled:opacity-60"
        >
          {pending ? "Wird gesendet…" : "Nachricht senden"}
        </button>
        <p className="text-xs text-brand-muted leading-relaxed">
          Mit dem Absenden akzeptieren Sie, dass wir Ihre Angaben gemäss unserer{" "}
          <a href="/datenschutz" className="underline hover:text-brand-pink">
            Datenschutzerklärung
          </a>{" "}
          verwenden.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-semibold text-brand-dark">{label}</span>
      {children}
      {error ? (
        <span className="block text-xs text-red-600">{error}</span>
      ) : null}
    </label>
  );
}

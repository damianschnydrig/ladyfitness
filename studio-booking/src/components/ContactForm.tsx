"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  type ContactActionResult,
  createContactInquiry,
} from "@/actions/contact";

type Props = {
  formToken: string;
};

type SubjectValue = "PROBETRAINING" | "PERSONAL_TRAINING" | "GENERAL" | "CANCELLATION";

export function ContactForm({ formToken }: Props) {
  const router = useRouter();
  const tsRef = useRef<HTMLInputElement>(null);
  const [subject, setSubject] = useState<SubjectValue>("GENERAL");
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const [challengeA, setChallengeA] = useState<number | null>(null);
  const [challengeB, setChallengeB] = useState<number | null>(null);

  const [state, formAction, pending] = useActionState<
    ContactActionResult | null,
    FormData
  >(createContactInquiry, null);

  // Lade-Timestamp setzen (Timing-basierter Spam-Schutz)
  useEffect(() => {
    if (tsRef.current) {
      tsRef.current.value = String(Date.now());
    }
    // Dynamische JS-Challenge (optional): ohne JS wird dieses Feld nie gesetzt.
    setChallengeA(Math.floor(Math.random() * 6) + 2);
    setChallengeB(Math.floor(Math.random() * 6) + 2);
  }, []);

  // Bei Erfolg mit DB-ID → Bestätigungsseite
  useEffect(() => {
    if (state?.ok && "id" in state) {
      router.push(`/kontakt/bestaetigung?id=${state.id}`);
    }
  }, [state, router]);

  useEffect(() => {
    if (!showCancellationModal) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setShowCancellationModal(false);
        setSubject("GENERAL");
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showCancellationModal]);

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
        <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden">
          <label htmlFor="website">Website</label>
          <input id="website" type="text" name="website" tabIndex={-1} autoComplete="off" />
        </div>
        {/* Timing-Timestamp */}
        <input type="hidden" name="_ts" ref={tsRef} />
        {/* Einmaliges Form-Token (CSRF/Replay-Schutz) */}
        <input type="hidden" name="_formToken" value={formToken} />
        <input type="hidden" name="_jsChallengeEnabled" value={challengeA && challengeB ? "1" : "0"} />
        <input type="hidden" name="_jsChallengeA" value={challengeA ?? ""} />
        <input type="hidden" name="_jsChallengeB" value={challengeB ?? ""} />

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
          <select
            required
            name="subject"
            value={subject}
            onChange={(e) => {
              const next = e.target.value as SubjectValue;
              if (next === "CANCELLATION") {
                setShowCancellationModal(true);
              }
              setSubject(next);
            }}
            className={`field${fields.subject ? " border-red-400" : ""}`}
          >
            <option value="PROBETRAINING">Probetraining</option>
            <option value="PERSONAL_TRAINING">Personal Training</option>
            <option value="GENERAL">Allgemeine Anfrage</option>
            <option value="CANCELLATION">Kündigung</option>
          </select>
        </Field>
        <Field label="Ihre Nachricht *" error={fields.message}>
          <textarea
            required
            name="message"
            rows={6}
            className={`field resize-y min-h-[140px]${fields.message ? " border-red-400" : ""}`}
          />
        </Field>
        {challengeA && challengeB ? (
          <Field label={`Sicherheitsfrage: Was ist ${challengeA} + ${challengeB}?`} error={fields.challenge}>
            <input
              name="_jsChallengeAnswer"
              inputMode="numeric"
              pattern="[0-9]*"
              className={`field${fields.challenge ? " border-red-400" : ""}`}
            />
          </Field>
        ) : null}
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

      {showCancellationModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div role="dialog" aria-modal="true" aria-labelledby="cancel-title" className="w-full max-w-xl bg-white p-6 shadow-xl">
            <h3 id="cancel-title" className="text-lg font-semibold text-brand-dark">
              ⚠️ Wichtiger Hinweis zur Kündigung
            </h3>
            <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-brand-dark">
              {"Kündigungen sind ausschliesslich schriftlich möglich:\n\n📧 Per E-Mail an: info@ladyfitness-bremgarten.ch\n   → Bitte ein unterschriebenes Kündigungsschreiben\n     als PDF-Anhang beifügen.\n\n📮 Per Brief (Post) an:\n   Lady Fitness Bremgarten\n   Zürcherstrasse 7\n   5620 Bremgarten\n   → Handschriftlich unterschrieben.\n\nBitte beachten Sie die Kündigungsfristen gemäss Ihrem\nVertrag und unseren AGB. Eine Kündigung ist jeweils auf\ndas Ende der vereinbarten Vertragslaufzeit möglich.\n\nDas Kontaktformular gilt nicht als rechtsgültige Kündigung."}
            </p>
            <button
              type="button"
              onClick={() => {
                setShowCancellationModal(false);
                setSubject("GENERAL");
              }}
              className="mt-5 w-full bg-brand-pink px-4 py-2 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-pink-dark"
            >
              Verstanden
            </button>
          </div>
        </div>
      ) : null}
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

"use client";

import { useActionState } from "react";
import { adminLogin, type AdminLoginState } from "@/actions/auth";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState<
    AdminLoginState,
    FormData
  >(adminLogin, null);

  return (
    <form action={formAction} className="mx-auto max-w-sm space-y-5">
      {state?.ok === false ? (
        <div
          role="alert"
          className="border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800"
        >
          {state.message}
        </div>
      ) : null}
      <label className="block space-y-2 text-sm">
        <span className="font-semibold text-brand-dark">E-Mail</span>
        <input
          required
          type="text"
          inputMode="email"
          autoComplete="username"
          name="email"
          className="field"
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="font-semibold text-brand-dark">Passwort</span>
        <input
          required
          type="password"
          name="password"
          autoComplete="current-password"
          className="field"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-full bg-brand-dark py-3 text-sm font-bold uppercase tracking-wider text-white hover:bg-brand-pink disabled:opacity-60"
      >
        {pending ? "Anmeldung…" : "Anmelden"}
      </button>
    </form>
  );
}

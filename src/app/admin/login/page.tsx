import type { Metadata } from "next";
import Link from "next/link";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";
import { BRAND } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-brand-alt/50 px-4">
      <div className="w-full max-w-md border border-brand-border bg-white p-8 shadow-soft">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-brand-pink">
          {BRAND.shortName}
        </p>
        <h1 className="mt-3 text-center font-serif text-2xl">Admin-Bereich</h1>
        <p className="mt-2 text-center text-xs text-brand-muted">
          Interne Verwaltung — Zugang nur für autorisierte Personen.
        </p>
        <div className="mt-8">
          <AdminLoginForm />
        </div>
        <p className="mt-8 text-center text-xs text-brand-muted">
          <Link className="text-brand-pink hover:underline" href="/buchen">
            Zur öffentlichen Buchung
          </Link>
        </p>
      </div>
    </div>
  );
}

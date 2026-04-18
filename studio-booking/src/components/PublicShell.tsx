import Link from "next/link";
import { BRAND } from "@/lib/constants";

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <header className="sticky top-0 z-40 border-b border-brand-border/80 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/" className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.png"
              alt={BRAND.name}
              className="h-7 w-auto"
              width={140}
              height={28}
            />
          </Link>
          <nav className="flex flex-wrap items-center justify-end gap-4 text-xs font-semibold uppercase tracking-[0.12em] text-brand-dark">
            <Link className="hover:text-brand-pink transition-colors" href="/">
              Website
            </Link>
            <Link className="hover:text-brand-pink transition-colors" href="/buchen">
              Buchen
            </Link>
            <Link className="hover:text-brand-pink transition-colors" href="/kontakt">
              Kontakt
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-brand-border bg-brand-alt/40">
        <div className="mx-auto max-w-5xl px-4 py-8 text-sm text-brand-muted sm:px-6">
          <p className="font-semibold text-brand-dark">{BRAND.name}</p>
          <p className="mt-1">{BRAND.address}</p>
          <p className="mt-2">
            Tel.{" "}
            <a className="text-brand-pink hover:underline" href={`tel:${BRAND.phone}`}>
              {BRAND.phoneDisplay}
            </a>
            {" · "}
            <a
              className="text-brand-pink hover:underline"
              href={`mailto:${BRAND.email}`}
            >
              {BRAND.email}
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

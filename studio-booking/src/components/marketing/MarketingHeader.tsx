"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const NAV = [
  ["/", "Home"],
  ["/angebot", "Angebot"],
  ["/probetraining", "Probetraining"],
  ["/betreuungszeiten", "Betreuungszeiten"],
  ["/team", "Team"],
  ["/bilder", "Bilder"],
  ["/preise", "Preise"],
  ["/kontakt", "Kontakt"],
] as const;

export default function MarketingHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="header">
      <div className="container header__inner">
        <Link className="header__brand" href="/">
          <Image
            src="/images/logo.png"
            alt="Lady Fitness Bremgarten"
            className="header__logo"
            width={120}
            height={28}
            priority
          />
        </Link>
        <button
          className="header__toggle"
          aria-label="Menü öffnen"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
        <nav className={`header__nav${open ? " open" : ""}`} aria-label="Hauptnavigation">
          {NAV.map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className={pathname === href ? "active" : undefined}
              onClick={() => setOpen(false)}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

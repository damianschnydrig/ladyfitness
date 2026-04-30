import Link from "next/link";
import { AdminLogoutButton } from "@/components/admin/AdminLogoutButton";
import { BRAND } from "@/lib/constants";

const links = [
  { href: "/admin", label: "Übersicht" },
  { href: "/admin/bookings", label: "Buchungen" },
  { href: "/admin/calendar", label: "Kalender" },
  { href: "/admin/slots", label: "Verfügbarkeiten" },
  { href: "/admin/contacts", label: "Kontakte" },
  { href: "/admin/archive", label: "Archiv" },
];

export function AdminNav({ currentPath }: { currentPath: string }) {
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-brand-border bg-white">
      <div className="border-b border-brand-border px-4 py-5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-brand-pink">
          Admin
        </p>
        <p className="mt-1 font-serif text-lg leading-tight">{BRAND.shortName}</p>
      </div>
      <nav className="flex flex-1 flex-col gap-0.5 p-3">
        {links.map((l) => {
          const active =
            l.href === "/admin"
              ? currentPath === "/admin"
              : currentPath.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-pink-light text-brand-pink-dark"
                  : "text-brand-dark hover:bg-brand-alt/80"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-brand-border p-4">
        <AdminLogoutButton />
        <Link
          href="/buchen"
          className="mt-3 block text-xs text-brand-muted hover:text-brand-pink"
        >
          Öffentliche Seite →
        </Link>
      </div>
    </aside>
  );
}

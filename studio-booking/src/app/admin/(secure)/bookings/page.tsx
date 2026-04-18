import type { Metadata } from "next";
import Link from "next/link";
import { adminUpdateBookingStatus } from "@/actions/admin";
import { formatZurichTimeRange } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { BookingWithSlot } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Buchungen",
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ typ?: string }>;
};

export default async function AdminBookingsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const typ =
    sp.typ === "PERSONAL_TRAINING"
      ? "PERSONAL_TRAINING"
      : sp.typ === "PROBETRAINING"
        ? "PROBETRAINING"
        : undefined;

  const now = new Date().toISOString();
  const supabase = getSupabaseServer();

  let query = supabase
    .from("bookings")
    .select("*, slot:time_slots(*)")
    .eq("status", "CONFIRMED");

  if (typ) query = query.eq("type", typ);

  const { data: rawBookings } = await query;

  const bookings = ((rawBookings ?? []) as BookingWithSlot[])
    .filter((b) => b.slot && b.slot.end_at >= now)
    .sort(
      (a, b) =>
        new Date(a.slot.start_at).getTime() - new Date(b.slot.start_at).getTime()
    );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Buchungen</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Aktive, zukünftige Termine — nach Typ filterbar.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wider">
        <FilterChip href="/admin/bookings" active={!typ} label="Alle" />
        <FilterChip
          href="/admin/bookings?typ=PROBETRAINING"
          active={typ === "PROBETRAINING"}
          label="Probetraining"
        />
        <FilterChip
          href="/admin/bookings?typ=PERSONAL_TRAINING"
          active={typ === "PERSONAL_TRAINING"}
          label="Personal Training"
        />
      </div>

      {bookings.length === 0 ? (
        <p className="text-sm text-brand-muted">Keine passenden Buchungen.</p>
      ) : (
        <div className="overflow-x-auto border border-brand-border bg-white">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-brand-border bg-brand-alt/40 text-xs font-bold uppercase tracking-wider text-brand-muted">
              <tr>
                <th className="px-4 py-3">Typ</th>
                <th className="px-4 py-3">Termin</th>
                <th className="px-4 py-3">Person</th>
                <th className="px-4 py-3">Kontakt</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {bookings.map((b) => (
                <tr key={b.id} className="align-top">
                  <td className="px-4 py-3">
                    <TypeBadge type={b.type} />
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatZurichTimeRange(b.slot.start_at, b.slot.end_at)}
                  </td>
                  <td className="px-4 py-3">
                    {b.first_name} {b.last_name}
                  </td>
                  <td className="px-4 py-3 text-brand-muted">
                    <a className="text-brand-pink hover:underline" href={`mailto:${b.email}`}>
                      {b.email}
                    </a>
                    <br />
                    <a className="hover:underline" href={`tel:${b.phone}`}>
                      {b.phone}
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <form action={adminUpdateBookingStatus} className="flex flex-col gap-2">
                      <input type="hidden" name="id" value={b.id} />
                      <select
                        name="status"
                        defaultValue={b.status}
                        className="field max-w-[200px] text-xs"
                      >
                        <option value="CONFIRMED">Bestätigt</option>
                        <option value="COMPLETED">Abgeschlossen</option>
                        <option value="CANCELLED">Storniert</option>
                      </select>
                      <button
                        type="submit"
                        className="text-left text-xs font-bold uppercase tracking-wider text-brand-pink hover:underline"
                      >
                        Speichern
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`border px-3 py-2 transition ${
        active
          ? "border-brand-pink bg-brand-pink-light text-brand-pink-dark"
          : "border-brand-border text-brand-muted hover:border-brand-pink/40"
      }`}
    >
      {label}
    </Link>
  );
}

function TypeBadge({ type }: { type: string }) {
  const isProbe = type === "PROBETRAINING";
  return (
    <span
      className={`inline-block px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${
        isProbe ? "bg-brand-pink text-white" : "bg-brand-dark text-white"
      }`}
    >
      {isProbe ? "Probetraining" : "Personal Training"}
    </span>
  );
}

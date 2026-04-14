import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { formatZurichTimeRange } from "@/lib/datetime";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Buchung bestätigt",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function BookingConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { slot: true },
  });
  if (!booking) notFound();

  const typeLabel =
    booking.type === "PROBETRAINING" ? "Probetraining" : "Personal Training";
  const when = formatZurichTimeRange(booking.slot.startAt, booking.slot.endAt);

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl space-y-8 px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-brand-pink text-2xl text-brand-pink">
          ✓
        </div>
        <h1 className="font-serif text-3xl text-balance">Vielen Dank!</h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Ihre Anfrage für ein <strong>{typeLabel}</strong> ist bei uns
          eingegangen. Sie erhalten in Kürze eine Bestätigung per E-Mail an{" "}
          <strong>{booking.email}</strong>.
        </p>
        <div className="border border-brand-border bg-brand-alt/40 px-6 py-5 text-left text-sm">
          <p className="text-xs font-bold uppercase tracking-wider text-brand-pink">
            Ihr Termin
          </p>
          <p className="mt-2 font-medium text-brand-dark">{when}</p>
          <p className="mt-1 text-brand-muted">
            {booking.firstName} {booking.lastName}
          </p>
        </div>
        <Link
          href="/buchen"
          className="inline-block text-sm font-semibold uppercase tracking-wider text-brand-pink hover:underline"
        >
          Weitere Buchung
        </Link>
      </div>
    </PublicShell>
  );
}

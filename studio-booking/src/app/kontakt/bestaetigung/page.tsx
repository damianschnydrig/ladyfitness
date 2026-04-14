import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Nachricht gesendet",
};

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<{ id?: string }> };

export default async function ContactConfirmationPage({ searchParams }: Props) {
  const { id } = await searchParams;
  if (!id) notFound();

  const row = await prisma.contactInquiry.findUnique({ where: { id } });
  if (!row) notFound();

  return (
    <PublicShell>
      <div className="mx-auto max-w-xl space-y-8 px-4 py-16 text-center sm:px-6">
        <div className="mx-auto flex h-16 w-16 items-center justify-center border-2 border-brand-dark text-2xl">
          ✉
        </div>
        <h1 className="font-serif text-3xl text-balance">Nachricht erhalten</h1>
        <p className="text-sm text-brand-muted leading-relaxed">
          Vielen Dank, <strong>{row.firstName}</strong>. Wir haben Ihre Nachricht
          zum Thema <strong>«{row.subject}»</strong> gespeichert und melden uns
          bei Ihnen.
        </p>
        <p className="text-xs text-brand-muted">
          Eine Bestätigung wurde an <strong>{row.email}</strong> gesendet (sofern
          der E-Mail-Versand konfiguriert ist).
        </p>
        <Link
          href="/kontakt"
          className="inline-block text-sm font-semibold uppercase tracking-wider text-brand-pink hover:underline"
        >
          Weitere Nachricht
        </Link>
      </div>
    </PublicShell>
  );
}

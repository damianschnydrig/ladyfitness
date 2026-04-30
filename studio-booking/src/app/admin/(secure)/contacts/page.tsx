import type { Metadata } from "next";
import Link from "next/link";
import { adminDeleteContactInquiry, adminUpdateContactStatus } from "@/actions/admin";
import { ConfirmDeleteButton } from "@/components/admin/ConfirmDeleteButton";
import { formatZurichShort } from "@/lib/datetime";
import { getSupabaseServer } from "@/lib/supabase/server";
import type { ContactInquiry } from "@/lib/supabase/types";

export const metadata: Metadata = {
  title: "Kontaktanfragen",
  robots: { index: false, follow: false },
};

const statusLabels: Record<string, string> = {
  NEW: "Neu",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Erledigt",
  ARCHIVED: "Archiviert",
};

const PAGE_SIZE = 10;
type Props = { searchParams: Promise<{ seite?: string }> };

export default async function AdminContactsPage({ searchParams }: Props) {
  const sp = await searchParams;
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("*")
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as ContactInquiry[];
  const page = Math.max(1, Number(sp.seite ?? "1") || 1);
  const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = rows.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const pageHref = (targetPage: number) => `/admin/contacts?seite=${targetPage}`;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl">Kontaktanfragen</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Alle allgemeinen Kontaktanfragen — klar getrennt von Buchungen.
        </p>
      </div>

      {rows.length === 0 ? (
        <p className="text-sm text-brand-muted">Keine offenen Kontaktanfragen.</p>
      ) : (
        <>
          <div className="space-y-6">
            {pageItems.map((c) => (
              <article key={c.id} className="border border-brand-border bg-white p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <span className="inline-block bg-brand-dark px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                      Kontaktanfrage
                    </span>
                    <h2 className="mt-3 font-serif text-xl">{c.subject}</h2>
                    <p className="mt-1 text-sm text-brand-muted">
                      {c.first_name} {c.last_name} · {formatZurichShort(c.created_at)}
                    </p>
                  </div>
                  <form action={adminUpdateContactStatus} className="flex flex-col gap-2 text-sm">
                    <input type="hidden" name="id" value={c.id} />
                    <select name="status" defaultValue={c.status} className="field min-w-[180px]">
                      {Object.entries(statusLabels).map(([k, v]) => (
                        <option key={k} value={k}>
                          {v}
                        </option>
                      ))}
                    </select>
                    <button
                      type="submit"
                      className="text-left text-xs font-bold uppercase tracking-wider text-brand-pink hover:underline"
                    >
                      Status speichern
                    </button>
                  </form>
                </div>
                <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
                  <p>
                    <span className="text-brand-muted">E-Mail: </span>
                    <a className="text-brand-pink hover:underline" href={`mailto:${c.email}`}>
                      {c.email}
                    </a>
                  </p>
                  <p>
                    <span className="text-brand-muted">Telefon: </span>
                    <a className="hover:underline" href={`tel:${c.phone}`}>
                      {c.phone}
                    </a>
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <a
                    href={buildMailto(c)}
                    className="inline-flex border border-brand-border px-3 py-1.5 text-xs font-bold uppercase tracking-wider hover:border-brand-pink"
                  >
                    Per Mail antworten
                  </a>
                  <form action={adminDeleteContactInquiry}>
                    <input type="hidden" name="id" value={c.id} />
                    <ConfirmDeleteButton
                      label="Löschen"
                      confirmMessage="Anfrage wirklich löschen?"
                      className="inline-flex border border-red-300 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-red-700 hover:bg-red-50"
                    />
                  </form>
                </div>

                <p className="mt-4 whitespace-pre-wrap border-t border-brand-border pt-4 text-sm leading-relaxed text-brand-dark">
                  {c.message}
                </p>
              </article>
            ))}
          </div>

          <div className="flex items-center justify-between border border-brand-border bg-white px-4 py-3 text-sm">
            <Link
              href={pageHref(Math.max(1, safePage - 1))}
              aria-disabled={safePage <= 1}
              className={`border px-3 py-1.5 font-semibold ${
                safePage <= 1
                  ? "pointer-events-none border-brand-border/40 text-brand-border"
                  : "border-brand-border hover:border-brand-pink"
              }`}
            >
              ← Zurück
            </Link>
            <span className="text-brand-muted">
              Seite {safePage} von {totalPages}
            </span>
            <Link
              href={pageHref(Math.min(totalPages, safePage + 1))}
              aria-disabled={safePage >= totalPages}
              className={`border px-3 py-1.5 font-semibold ${
                safePage >= totalPages
                  ? "pointer-events-none border-brand-border/40 text-brand-border"
                  : "border-brand-border hover:border-brand-pink"
              }`}
            >
              Weiter →
            </Link>
          </div>
        </>
      )}
    </div>
  );
}

function buildMailto(c: ContactInquiry): string {
  const subject = encodeURIComponent(`Re: ${c.subject}`);
  const body = encodeURIComponent(
    `Guten Tag ${c.first_name} ${c.last_name},\n\nvielen Dank für Ihre Anfrage.\n\n---\nIhre Nachricht:\n${c.message}\n`
  );
  return `mailto:${c.email}?subject=${subject}&body=${body}`;
}

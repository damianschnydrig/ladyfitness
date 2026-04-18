import type { Metadata } from "next";
import { adminUpdateContactStatus } from "@/actions/admin";
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

export default async function AdminContactsPage() {
  const supabase = getSupabaseServer();
  const { data } = await supabase
    .from("contact_inquiries")
    .select("*")
    .neq("status", "ARCHIVED")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as ContactInquiry[];

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
        <div className="space-y-6">
          {rows.map((c) => (
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
              <p className="mt-4 whitespace-pre-wrap border-t border-brand-border pt-4 text-sm leading-relaxed text-brand-dark">
                {c.message}
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

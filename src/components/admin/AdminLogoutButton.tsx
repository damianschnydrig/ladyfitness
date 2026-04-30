import { adminLogout } from "@/actions/auth";

export function AdminLogoutButton() {
  return (
    <form action={adminLogout}>
      <button
        type="submit"
        className="text-xs font-semibold uppercase tracking-wider text-brand-muted hover:text-brand-pink"
      >
        Abmelden
      </button>
    </form>
  );
}

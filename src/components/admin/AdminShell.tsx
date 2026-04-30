"use client";

import { usePathname } from "next/navigation";
import { AdminNav } from "@/components/admin/AdminNav";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/admin";
  return (
    <div className="flex min-h-screen bg-brand-alt/30">
      <AdminNav currentPath={pathname} />
      <div className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8">{children}</div>
      </div>
    </div>
  );
}

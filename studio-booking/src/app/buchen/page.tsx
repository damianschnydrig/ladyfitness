import type { Metadata } from "next";
import { BookingWizard } from "@/components/BookingWizard";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Termin buchen",
};

export default function BuchenPage() {
  return (
    <PublicShell>
      <BookingWizard />
    </PublicShell>
  );
}

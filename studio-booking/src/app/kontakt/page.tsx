import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { PublicShell } from "@/components/PublicShell";

export const metadata: Metadata = {
  title: "Kontakt",
};

export default function KontaktPage() {
  return (
    <PublicShell>
      <ContactForm />
    </PublicShell>
  );
}

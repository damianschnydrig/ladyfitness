import MarketingHeader from "@/components/marketing/MarketingHeader";
import MarketingFooter from "@/components/marketing/MarketingFooter";
import MarketingScripts from "@/components/marketing/MarketingScripts";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <MarketingHeader />
      <MarketingScripts />
      {children}
      <MarketingFooter />
    </>
  );
}

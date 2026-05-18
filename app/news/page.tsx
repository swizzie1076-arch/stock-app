import { Newspaper } from "lucide-react";
import { MarketSectionPage } from "@/components/market-section-page";

export default function NewsPage() {
  return (
    <MarketSectionPage
      title="News"
      description="Track market headlines and company-specific stories without leaving the Atlas Invest workflow."
      icon={Newspaper}
      items={[
        { title: "Company headlines", detail: "Review the latest stories tied to selected tickers from the portfolio dashboard." },
        { title: "Market context", detail: "Separate broad macro moves from company-specific catalysts and sentiment." },
        { title: "Research handoff", detail: "Move important headlines into the research flow when a thesis needs another pass." }
      ]}
    />
  );
}

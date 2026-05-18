import { Search } from "lucide-react";
import { MarketSectionPage } from "@/components/market-section-page";

export default function DiscoverPage() {
  return (
    <MarketSectionPage
      title="Discover"
      description="Find companies, tickers, and watchlist ideas before they graduate into your portfolio."
      icon={Search}
      items={[
        { title: "Ticker search", detail: "Jump from company names to symbols and compare market data in context." },
        { title: "Watchlist ideas", detail: "Use the discover workspace to stage companies before saving them to your Convex portfolio." },
        { title: "Sector scans", detail: "Keep discovery organized around sectors, themes, and market narratives." }
      ]}
    />
  );
}

import { FileText } from "lucide-react";
import { MarketSectionPage } from "@/components/market-section-page";

export default function ResearchPage() {
  return (
    <MarketSectionPage
      title="Research"
      description="Keep investing notes, thesis checkpoints, and premium research workflows close to your holdings."
      icon={FileText}
      items={[
        { title: "Thesis tracking", detail: "Document why a company belongs in the portfolio and what would change your mind." },
        { title: "Analytics workspace", detail: "Use plan-gated analytics and alerts to keep portfolio research focused." },
        { title: "Premium summaries", detail: "Premium features can fold news, earnings notes, and exports into a cleaner workflow." }
      ]}
    />
  );
}

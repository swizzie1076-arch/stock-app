import { BillingPricing } from "@/components/billing-pricing";

export default function PricingPage() {
  return <BillingPricing clerkEnabled={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />;
}

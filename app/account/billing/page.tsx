import { BillingAccount } from "@/components/billing-account";

export default function BillingSettingsPage() {
  return <BillingAccount clerkEnabled={Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY)} />;
}

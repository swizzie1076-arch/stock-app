export type BillingPlanKey = "free" | "starter" | "pro" | "premium";

export type BillingFeature = "saveStocks" | "analytics" | "alerts" | "aiSummaries" | "exports" | "advancedAnalytics";

export type BillingPlan = {
  key: BillingPlanKey;
  clerkPlanSlug?: string;
  name: string;
  price: string;
  description: string;
  saveLimit: number | "unlimited";
  features: string[];
  highlighted?: boolean;
};

export const billingPlans: BillingPlan[] = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    description: "Market dashboard, ticker search, quote charts, and news.",
    saveLimit: 0,
    features: ["Dashboard only", "Ticker search", "Charts and latest news"]
  },
  {
    key: "starter",
    clerkPlanSlug: "starter",
    name: "Starter",
    price: "$1",
    description: "A lightweight saved-stock portfolio for early research.",
    saveLimit: 5,
    features: ["Save up to 5 stocks", "Convex-backed portfolio", "Research notes"]
  },
  {
    key: "pro",
    clerkPlanSlug: "pro",
    name: "Pro",
    price: "$9",
    description: "Unlimited tracking plus the investor workflow tools.",
    saveLimit: "unlimited",
    highlighted: true,
    features: ["Unlimited saved stocks", "Analytics", "Alerts"]
  },
  {
    key: "premium",
    clerkPlanSlug: "premium",
    name: "Premium",
    price: "$19",
    description: "Advanced research and reporting for deeper conviction.",
    saveLimit: "unlimited",
    features: ["AI summaries", "Exports", "Advanced analytics"]
  }
];

export const planRank: Record<BillingPlanKey, number> = {
  free: 0,
  starter: 1,
  pro: 2,
  premium: 3
};

export function getBillingPlan(planKey: BillingPlanKey) {
  return billingPlans.find((plan) => plan.key === planKey) ?? billingPlans[0];
}

export function canUseFeature(planKey: BillingPlanKey, feature: BillingFeature) {
  const rank = planRank[planKey];

  if (feature === "saveStocks") return rank >= planRank.starter;
  if (feature === "analytics" || feature === "alerts") return rank >= planRank.pro;
  return rank >= planRank.premium;
}

export function getSaveLimitLabel(planKey: BillingPlanKey) {
  const limit = getBillingPlan(planKey).saveLimit;
  return limit === "unlimited" ? "Unlimited saved stocks" : `${limit} saved stocks`;
}

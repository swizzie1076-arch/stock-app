"use client";

import Link from "next/link";
import { ClerkLoaded, ClerkLoading, PricingTable, SignInButton, SignUpButton } from "@clerk/nextjs";
import { Check, ChevronRight, Loader2, Sparkles } from "lucide-react";
import { useAuthState } from "@/components/auth-state-provider";
import { billingPlans, getBillingPlan } from "@/lib/billing-plans";

export function BillingPricing({ clerkEnabled }: { clerkEnabled: boolean }) {
  const { isSignedIn, plan } = useAuthState();
  const currentPlan = getBillingPlan(plan);

  return (
    <main className="stock-app dark-mode min-h-screen bg-[#0a1118] px-4 py-6 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 border-b border-[#263645] pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="text-sm font-black uppercase text-[#6ee7d8]">
              Atlas Invest
            </Link>
            <h1 className="mt-3 text-3xl font-semibold tracking-normal sm:text-4xl">Choose your research plan</h1>
            <p className="mt-3 max-w-2xl text-sm font-semibold leading-6 text-[#9fb0c2]">
              Start with the market dashboard, then unlock saved portfolios, analytics, alerts, and premium research tools as your workflow grows.
            </p>
          </div>
          <div className="rounded-lg border border-[#263645] bg-[#101923] px-4 py-3">
            <p className="text-xs font-bold uppercase text-[#9fb0c2]">Current plan</p>
            <p className="mt-1 text-lg font-black text-white">{currentPlan.name}</p>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {billingPlans.map((billingPlan) => {
            const isCurrent = billingPlan.key === plan;
            return (
              <article
                key={billingPlan.key}
                className={`flex min-h-[380px] flex-col rounded-lg border p-5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] ${
                  billingPlan.highlighted
                    ? "border-[#0f8a8a] bg-[#102a2c]"
                    : "border-[#263645] bg-[#101923]"
                }`}
              >
                <div className="mb-5 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-black">{billingPlan.name}</p>
                    <p className="mt-2 text-sm font-semibold leading-6 text-[#9fb0c2]">{billingPlan.description}</p>
                  </div>
                  {billingPlan.highlighted ? <Sparkles className="shrink-0 text-[#6ee7d8]" size={20} /> : null}
                </div>
                <div className="mb-5">
                  <span className="text-4xl font-semibold">{billingPlan.price}</span>
                  <span className="ml-1 text-sm font-bold text-[#9fb0c2]">/mo</span>
                </div>
                <div className="space-y-3">
                  {billingPlan.features.map((feature) => (
                    <div key={feature} className="flex gap-2 text-sm font-bold text-[#d7e1ea]">
                      <Check className="mt-0.5 shrink-0 text-[#6ee7d8]" size={16} />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="mt-auto pt-6">
                  {isCurrent ? (
                    <Link
                      href="/account/billing"
                      className="flex h-11 items-center justify-center rounded-lg border border-[#3b5366] px-4 text-sm font-black text-white transition hover:border-[#6ee7d8]"
                    >
                      Manage plan
                    </Link>
                  ) : clerkEnabled && isSignedIn ? (
                    <a
                      href="#clerk-pricing"
                      className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#6ee7d8] px-4 text-sm font-black text-[#061015] transition hover:bg-[#9af5ea]"
                    >
                      Upgrade
                      <ChevronRight size={16} />
                    </a>
                  ) : clerkEnabled ? (
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#6ee7d8] px-4 text-sm font-black text-[#061015] transition hover:bg-[#9af5ea]"
                      >
                        Start plan
                        <ChevronRight size={16} />
                      </button>
                    </SignUpButton>
                  ) : (
                    <button
                      type="button"
                      disabled
                      className="flex h-11 w-full cursor-not-allowed items-center justify-center rounded-lg border border-amber-300 px-4 text-sm font-black text-amber-200"
                    >
                      Clerk setup needed
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>

        <section id="clerk-pricing" className="rounded-lg border border-[#263645] bg-[#101923] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black">Secure checkout</h2>
              <p className="mt-1 text-sm font-semibold text-[#9fb0c2]">Plans and payments are managed by Clerk Billing.</p>
            </div>
            {!isSignedIn && clerkEnabled ? (
              <SignInButton mode="modal">
                <button type="button" className="h-10 rounded-lg border border-[#3b5366] px-4 text-sm font-black text-white">
                  Sign in
                </button>
              </SignInButton>
            ) : null}
          </div>

          {clerkEnabled ? (
            <>
              <ClerkLoading>
                <div className="flex min-h-48 items-center justify-center rounded-lg border border-[#263645] bg-[#0a1118]">
                  <Loader2 className="animate-spin text-[#6ee7d8]" size={24} />
                </div>
              </ClerkLoading>
              <ClerkLoaded>
                <PricingTable
                  for="user"
                  newSubscriptionRedirectUrl="/portfolio"
                  appearance={{
                    variables: {
                      colorPrimary: "#0f8a8a",
                      colorBackground: "#101923",
                      colorText: "#e6edf3",
                      borderRadius: "0.5rem"
                    }
                  }}
                />
              </ClerkLoaded>
            </>
          ) : (
            <div className="rounded-lg border border-amber-300 bg-amber-950/40 p-4 text-sm font-bold leading-6 text-amber-100">
              Add your Clerk publishable key to render live Clerk Billing checkout.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

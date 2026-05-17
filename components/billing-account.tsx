"use client";

import Link from "next/link";
import { ClerkLoaded, ClerkLoading, UserProfile } from "@clerk/nextjs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { useAuthState } from "@/components/auth-state-provider";
import { getBillingPlan } from "@/lib/billing-plans";

export function BillingAccount({ clerkEnabled }: { clerkEnabled: boolean }) {
  const { plan } = useAuthState();
  const currentPlan = getBillingPlan(plan);

  return (
    <main className="stock-app dark-mode min-h-screen bg-[#0a1118] px-4 py-6 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 flex flex-col gap-4 border-b border-[#263645] pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-black text-[#6ee7d8]">
              <ArrowLeft size={16} />
              Dashboard
            </Link>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal">Billing settings</h1>
            <p className="mt-2 text-sm font-semibold text-[#9fb0c2]">Manage your Atlas Invest subscription and account details.</p>
          </div>
          <Link
            href="/pricing"
            className="inline-flex h-10 items-center justify-center rounded-lg border border-[#3b5366] px-4 text-sm font-black text-white transition hover:border-[#6ee7d8]"
          >
            {currentPlan.name} plan
          </Link>
        </header>

        <section className="rounded-lg border border-[#263645] bg-[#101923] p-4 shadow-[0_18px_50px_rgba(0,0,0,0.24)] sm:p-6">
          {clerkEnabled ? (
            <>
              <ClerkLoading>
                <div className="flex min-h-80 items-center justify-center">
                  <Loader2 className="animate-spin text-[#6ee7d8]" size={24} />
                </div>
              </ClerkLoading>
              <ClerkLoaded>
                <UserProfile
                  routing="path"
                  path="/account/billing"
                  appearance={{
                    variables: {
                      colorPrimary: "#0f8a8a",
                      colorBackground: "#101923",
                      colorText: "#e6edf3",
                      borderRadius: "0.5rem"
                    },
                    elements: {
                      rootBox: "w-full",
                      cardBox: "w-full shadow-none",
                      card: "border border-[#263645]"
                    }
                  }}
                />
              </ClerkLoaded>
            </>
          ) : (
            <div className="rounded-lg border border-amber-300 bg-amber-950/40 p-4 text-sm font-bold leading-6 text-amber-100">
              Clerk is not configured yet. Add your Clerk publishable key to manage billing.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

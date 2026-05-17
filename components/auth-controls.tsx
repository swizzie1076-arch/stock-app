"use client";

import { ClerkLoaded, ClerkLoading, SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";
import { useAuthState } from "@/components/auth-state-provider";
import { getBillingPlan } from "@/lib/billing-plans";

export function AuthControls() {
  const { clerkEnabled } = useAuthState();

  if (!clerkEnabled) {
    return (
      <div className="auth-controls flex h-11 w-full items-center justify-center rounded-lg border border-amber-200 bg-amber-50 px-3 text-xs font-bold text-amber-700 shadow-sm sm:w-auto">
        Auth setup needed
      </div>
    );
  }

  return <ClerkAuthControls />;
}

function ClerkAuthControls() {
  const { user } = useUser();
  const { plan } = useAuthState();
  const currentPlan = getBillingPlan(plan);

  return (
    <div className="auth-controls flex w-full items-center gap-2 sm:w-auto">
      <ClerkLoading>
        <div className="flex h-11 min-w-28 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white text-muted shadow-sm">
          <Loader2 className="animate-spin" size={17} />
        </div>
      </ClerkLoading>

      <ClerkLoaded>
        {user ? (
          <div className="flex h-11 w-full items-center justify-between gap-3 rounded-lg border border-[#d9e2e7] bg-white px-2.5 shadow-sm sm:w-auto">
            <span className="hidden max-w-36 truncate text-xs font-bold text-muted sm:block">
              {user.firstName ?? user.primaryEmailAddress?.emailAddress ?? "Signed in"}
            </span>
            <span className="rounded-md bg-[#e9f8f3] px-2 py-1 text-[11px] font-black uppercase tracking-normal text-[#0f766e]">
              {currentPlan.name}
            </span>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8"
                }
              }}
            />
          </div>
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
            <SignInButton mode="modal">
              <button
                type="button"
                className="flex h-11 items-center justify-center rounded-lg border border-[#d9e2e7] bg-white px-3 text-sm font-bold text-[#102a2c] shadow-sm transition hover:border-[#0f8a8a]"
              >
                Sign In
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button
                type="button"
                className="flex h-11 items-center justify-center rounded-lg bg-[#102a2c] px-3 text-sm font-bold text-white shadow-sm transition hover:bg-[#173b3e]"
              >
                Sign Up
              </button>
            </SignUpButton>
          </div>
        )}
      </ClerkLoaded>
    </div>
  );
}

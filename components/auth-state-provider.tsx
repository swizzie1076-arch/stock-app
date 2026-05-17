"use client";

import { createContext, ReactNode, useContext } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
import type { BillingPlanKey } from "@/lib/billing-plans";

type AuthState = {
  clerkEnabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId?: string;
  displayName?: string;
  plan: BillingPlanKey;
};

const AuthStateContext = createContext<AuthState>({
  clerkEnabled: false,
  isLoaded: true,
  isSignedIn: false,
  plan: "free"
});

export function AuthStateProvider({ children, clerkEnabled }: { children: ReactNode; clerkEnabled: boolean }) {
  if (!clerkEnabled) {
    return (
      <AuthStateContext.Provider value={{ clerkEnabled: false, isLoaded: true, isSignedIn: false, plan: "free" }}>
        {children}
      </AuthStateContext.Provider>
    );
  }

  return <ClerkAuthStateProvider>{children}</ClerkAuthStateProvider>;
}

function ClerkAuthStateProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();
  const auth = useAuth();
  const plan = resolveBillingPlan(auth.has);

  return (
    <AuthStateContext.Provider
      value={{
        clerkEnabled: true,
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        userId: user?.id,
        displayName: user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? undefined,
        plan
      }}
    >
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthStateContext);
}

function resolveBillingPlan(has: ReturnType<typeof useAuth>["has"]): BillingPlanKey {
  if (has({ plan: "premium" })) return "premium";
  if (has({ plan: "pro" })) return "pro";
  if (has({ plan: "starter" })) return "starter";
  return "free";
}

"use client";

import { createContext, ReactNode, useContext } from "react";
import { useUser } from "@clerk/nextjs";

type AuthState = {
  clerkEnabled: boolean;
  isLoaded: boolean;
  isSignedIn: boolean;
  userId?: string;
  displayName?: string;
};

const AuthStateContext = createContext<AuthState>({
  clerkEnabled: false,
  isLoaded: true,
  isSignedIn: false
});

export function AuthStateProvider({ children, clerkEnabled }: { children: ReactNode; clerkEnabled: boolean }) {
  if (!clerkEnabled) {
    return (
      <AuthStateContext.Provider value={{ clerkEnabled: false, isLoaded: true, isSignedIn: false }}>
        {children}
      </AuthStateContext.Provider>
    );
  }

  return <ClerkAuthStateProvider>{children}</ClerkAuthStateProvider>;
}

function ClerkAuthStateProvider({ children }: { children: ReactNode }) {
  const { isLoaded, isSignedIn, user } = useUser();

  return (
    <AuthStateContext.Provider
      value={{
        clerkEnabled: true,
        isLoaded,
        isSignedIn: Boolean(isSignedIn),
        userId: user?.id,
        displayName: user?.firstName ?? user?.primaryEmailAddress?.emailAddress ?? undefined
      }}
    >
      {children}
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthStateContext);
}

"use client";

import { ClerkLoaded, ClerkLoading, SignIn, SignUp } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export function ClerkSignInCard() {
  return (
    <>
      <ClerkLoading>
        <AuthCardLoader />
      </ClerkLoading>
      <ClerkLoaded>
        <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" />
      </ClerkLoaded>
    </>
  );
}

export function ClerkSignUpCard() {
  return (
    <>
      <ClerkLoading>
        <AuthCardLoader />
      </ClerkLoading>
      <ClerkLoaded>
        <SignUp routing="path" path="/sign-up" signInUrl="/sign-in" fallbackRedirectUrl="/" />
      </ClerkLoaded>
    </>
  );
}

function AuthCardLoader() {
  return (
    <div className="flex min-h-[420px] w-full max-w-md items-center justify-center rounded-lg border border-[#dfe7ec] bg-white">
      <Loader2 className="animate-spin text-[#0f8a8a]" size={24} />
    </div>
  );
}

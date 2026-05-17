import { ClerkLoaded, ClerkLoading, SignIn } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

export default function SignInPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] px-4 py-8 text-ink">
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center gap-8 lg:grid lg:grid-cols-[0.9fr_1fr]">
        <div className="max-w-md">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#102a2c] text-white">
            AI
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-[#0f172a]">Welcome back to Atlas Invest</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Sign in to save stocks, manage your Convex-backed portfolio, and keep your research workspace private.
          </p>
        </div>

        <div className="flex w-full justify-center">
          <ClerkLoading>
            <div className="flex min-h-[420px] w-full max-w-md items-center justify-center rounded-lg border border-[#dfe7ec] bg-white">
              <Loader2 className="animate-spin text-[#0f8a8a]" size={24} />
            </div>
          </ClerkLoading>
          <ClerkLoaded>
            <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" fallbackRedirectUrl="/" />
          </ClerkLoaded>
        </div>
      </section>
    </main>
  );
}

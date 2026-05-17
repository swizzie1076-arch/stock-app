import { ClerkSignUpCard } from "@/components/clerk-auth-pages";

export default function SignUpPage() {
  return (
    <main className="min-h-screen bg-[#f7f9fb] px-4 py-8 text-ink">
      <section className="mx-auto flex min-h-[80vh] max-w-6xl flex-col items-center justify-center gap-8 lg:grid lg:grid-cols-[0.9fr_1fr]">
        <div className="max-w-md">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#102a2c] text-white">
            AI
          </div>
          <h1 className="text-3xl font-semibold tracking-normal text-[#0f172a]">Create your Atlas Invest account</h1>
          <p className="mt-3 text-sm font-medium leading-6 text-muted">
            Create a secure profile before saving stocks, portfolio notes, and research conviction data.
          </p>
        </div>

        <div className="flex w-full justify-center">
          {process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY ? <ClerkSignUpCard /> : <MissingClerkConfig />}
        </div>
      </section>
    </main>
  );
}

function MissingClerkConfig() {
  return (
    <div className="w-full max-w-md rounded-lg border border-amber-200 bg-white p-6 shadow-soft">
      <h2 className="text-xl font-semibold tracking-normal">Clerk is not configured</h2>
      <p className="mt-2 text-sm font-medium leading-6 text-muted">
        Add `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` in Vercel, then redeploy.
      </p>
    </div>
  );
}

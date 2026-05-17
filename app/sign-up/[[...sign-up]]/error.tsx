"use client";

export default function SignUpError({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7f9fb] p-6 text-ink">
      <section className="max-w-md rounded-lg border border-red-100 bg-white p-6 shadow-soft">
        <h1 className="text-xl font-semibold">Sign up could not load</h1>
        <p className="mt-2 text-sm leading-6 text-muted">Check your Clerk environment keys, then try again.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-4 rounded-lg bg-[#102a2c] px-4 py-2 text-sm font-bold text-white"
        >
          Retry
        </button>
      </section>
    </main>
  );
}

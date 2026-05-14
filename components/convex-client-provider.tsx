"use client";

import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AlertTriangle } from "lucide-react";
import { ReactNode, useMemo } from "react";

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  const client = useMemo(() => (convexUrl ? new ConvexReactClient(convexUrl) : null), [convexUrl]);

  if (!client) {
    return (
      <main className="min-h-screen bg-slate-50 p-6 text-ink">
        <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
          <div className="rounded-lg border border-amber-200 bg-white p-6 shadow-soft">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-700">
              <AlertTriangle size={22} />
            </div>
            <h1 className="text-2xl font-semibold tracking-normal">Convex is not configured</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Add `NEXT_PUBLIC_CONVEX_URL` to `.env.local`, then run `npm run convex:dev` and `npm run dev`.
              This app saves holdings to Convex and does not connect to any brokerage.
            </p>
          </div>
        </section>
      </main>
    );
  }

  return <ConvexProvider client={client}>{children}</ConvexProvider>;
}

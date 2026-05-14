import React from "react";
import ReactDOM from "react-dom/client";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { AlertTriangle } from "lucide-react";
import { PortfolioDashboard } from "@/components/portfolio-dashboard";
import "../app/globals.css";

const convexUrl = import.meta.env.VITE_CONVEX_URL as string | undefined;
const root = ReactDOM.createRoot(document.getElementById("root")!);

function MissingConvexUrl() {
  return (
    <main className="min-h-screen bg-slate-50 p-6 text-ink">
      <section className="mx-auto flex min-h-[70vh] max-w-2xl items-center">
        <div className="rounded-lg border border-amber-200 bg-white p-6 shadow-soft">
          <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-amber-100 text-amber-700">
            <AlertTriangle size={22} />
          </div>
          <h1 className="text-2xl font-semibold tracking-normal">Convex is not configured for Vite preview</h1>
          <p className="mt-3 text-sm leading-6 text-muted">
            Add `VITE_CONVEX_URL` to `.env.local`, then run `npm run convex:dev` and `npm run dev:vite`.
          </p>
        </div>
      </section>
    </main>
  );
}

if (convexUrl) {
  const convex = new ConvexReactClient(convexUrl);

  root.render(
    <React.StrictMode>
      <ConvexProvider client={convex}>
        <PortfolioDashboard />
      </ConvexProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <MissingConvexUrl />
    </React.StrictMode>
  );
}

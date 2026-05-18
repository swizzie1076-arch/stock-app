"use client";

import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  CheckCircle2,
  Download,
  LineChart,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  WalletCards
} from "lucide-react";
import { AuthControls } from "@/components/auth-controls";

const features = [
  { icon: LineChart, title: "Live market cockpit", detail: "Search tickers, inspect charts, quotes, and company news in one dense research view." },
  { icon: WalletCards, title: "Convex portfolio", detail: "Save holdings, thesis notes, targets, and conviction with a clean authenticated backend." },
  { icon: Bell, title: "Plan-gated workflow", detail: "Starter saves, Pro analytics and alerts, Premium AI summaries and exports." },
  { icon: ShieldCheck, title: "Clerk secured", detail: "Authentication, billing, and account controls are built into the product shell." }
];

const testimonials = [
  "The dashboard feels like a research desk instead of a spreadsheet.",
  "I can move from ticker idea to saved thesis without losing context.",
  "The plan structure makes it simple to grow from watchlist to workflow."
];

const faqs = [
  ["Can I use Atlas Invest for free?", "Yes. Free includes the dashboard, ticker search, charts, and news. Saving stocks starts on Starter."],
  ["Where is billing managed?", "Plans, checkout, and account settings are handled with Clerk Billing."],
  ["Does Atlas place trades?", "No. Atlas is a research and portfolio tracking cockpit, not a brokerage."]
];

export function LandingPage() {
  return (
    <main className="stock-app dark-mode atlas-landing min-h-screen overflow-hidden bg-[#05080d] text-[#e6edf3]">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#6ee7d8] shadow-[0_0_30px_rgba(20,184,166,0.18)]">
            <LineChart size={20} />
          </span>
          <span className="text-base font-black tracking-normal text-white">Atlas Invest</span>
        </Link>
        <nav className="hidden items-center gap-7 text-sm font-bold text-[#9fb0c2] md:flex">
          <a href="#features" className="transition hover:text-white">Features</a>
          <a href="#screenshots" className="transition hover:text-white">Product</a>
          <Link href="/pricing" className="transition hover:text-white">Pricing</Link>
          <a href="#faq" className="transition hover:text-white">FAQ</a>
        </nav>
        <div className="hidden sm:block">
          <AuthControls />
        </div>
      </header>

      <section className="relative mx-auto grid max-w-7xl gap-10 px-4 pb-16 pt-8 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pb-24 lg:pt-16">
        <div className="relative z-10 flex flex-col justify-center">
          <h1 className="max-w-3xl text-5xl font-semibold leading-[0.98] tracking-normal text-white sm:text-6xl lg:text-7xl">
            A sharper market cockpit for modern investors.
          </h1>
          <p className="mt-6 max-w-xl text-base font-semibold leading-7 text-[#9fb0c2] sm:text-lg">
            Atlas Invest combines live ticker research, portfolio saves, Clerk Billing, and Convex persistence in a premium finance workspace.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link href="/portfolio" className="premium-button inline-flex h-12 items-center justify-center gap-2 rounded-lg px-5 text-sm font-black">
              Open dashboard
              <ArrowRight size={17} />
            </Link>
            <Link href="/pricing" className="inline-flex h-12 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] px-5 text-sm font-black text-white transition hover:border-[#6ee7d8]/50 hover:bg-white/[0.1]">
              View plans
            </Link>
          </div>
          <div className="mt-10 grid grid-cols-3 gap-3 text-sm">
            <Stat value="4" label="Plans" />
            <Stat value="5+" label="Data views" />
            <Stat value="24/7" label="Research ready" />
          </div>
        </div>

        <div className="relative">
          <DashboardShowcase />
        </div>
      </section>

      <section id="features" className="mx-auto grid max-w-7xl gap-4 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4 lg:px-8">
        {features.map((feature) => (
          <article key={feature.title} className="premium-card group p-5">
            <feature.icon className="mb-5 text-[#6ee7d8] transition group-hover:scale-110" size={22} />
            <h2 className="text-base font-black text-white">{feature.title}</h2>
            <p className="mt-3 text-sm font-semibold leading-6 text-[#9fb0c2]">{feature.detail}</p>
          </article>
        ))}
      </section>

      <section id="screenshots" className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:px-8">
        <div>
          <h2 className="text-3xl font-semibold tracking-normal text-white sm:text-4xl">Built like a trading desk, tuned for everyday research.</h2>
          <p className="mt-4 text-sm font-semibold leading-7 text-[#9fb0c2]">
            Dense charting, saved thesis notes, plan-aware actions, and billing controls share one polished product language.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <ScreenshotTile icon={BarChart3} title="Selected stock panel" detail="Live quotes, clean charts, and recent company news." />
          <ScreenshotTile icon={Brain} title="Premium research" detail="AI summaries, exports, and advanced analytics for Premium." />
          <ScreenshotTile icon={LockKeyhole} title="Smart gating" detail="Free, Starter, Pro, and Premium states are visible and responsive." />
          <ScreenshotTile icon={Download} title="Export-ready" detail="A roadmap-ready surface for reports and account workflows." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {testimonials.map((quote, index) => (
            <figure key={quote} className="premium-card p-5">
              <div className="mb-4 flex gap-1 text-[#6ee7d8]">
                {[0, 1, 2, 3, 4].map((star) => <Star key={star} size={15} fill="currentColor" />)}
              </div>
              <blockquote className="text-sm font-semibold leading-6 text-[#d7e1ea]">"{quote}"</blockquote>
              <figcaption className="mt-5 text-xs font-black uppercase text-[#6f8091]">Investor placeholder {index + 1}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h2 className="text-center text-3xl font-semibold tracking-normal text-white">Questions before the opening bell?</h2>
        <div className="mt-8 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10 bg-white/[0.04]">
          {faqs.map(([question, answer]) => (
            <div key={question} className="p-5">
              <p className="text-sm font-black text-white">{question}</p>
              <p className="mt-2 text-sm font-semibold leading-6 text-[#9fb0c2]">{answer}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 text-sm font-semibold text-[#6f8091] sm:flex-row sm:items-center sm:justify-between">
          <p>Atlas Invest. Research cockpit for modern markets.</p>
          <div className="flex gap-5">
            <Link href="/portfolio" className="hover:text-white">Dashboard</Link>
            <Link href="/pricing" className="hover:text-white">Pricing</Link>
            <Link href="/account/billing" className="hover:text-white">Billing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs font-black uppercase text-[#6f8091]">{label}</p>
    </div>
  );
}

function DashboardShowcase() {
  return (
    <div className="premium-card relative min-h-[520px] overflow-hidden p-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-black text-white">Market Command</p>
          <p className="text-xs font-bold text-[#6f8091]">MSFT / 6mo / watchlist</p>
        </div>
        <span className="rounded-md bg-[#6ee7d8]/15 px-2 py-1 text-[11px] font-black uppercase text-[#6ee7d8]">Pro</span>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <MiniMetric label="Portfolio" value="$84.2K" tone="+4.8%" />
        <MiniMetric label="Nasdaq" value="16,388" tone="+0.61%" />
        <MiniMetric label="VIX" value="13.72" tone="-1.20%" />
      </div>
      <div className="mt-4 rounded-lg border border-white/10 bg-[#061015]/80 p-4">
        <div className="mb-3 flex items-center justify-between text-xs font-black text-[#6f8091]">
          <span>Performance</span>
          <span className="text-[#6ee7d8]">+12.4%</span>
        </div>
        <svg className="h-48 w-full" viewBox="0 0 520 210" role="img" aria-label="Atlas Invest product chart preview">
          {[42, 84, 126, 168].map((y) => <line key={y} x1="0" x2="520" y1={y} y2={y} stroke="rgba(255,255,255,0.08)" />)}
          <path d="M 0 168 C 54 156 75 121 123 132 C 176 145 203 85 250 92 C 304 100 326 46 375 58 C 421 70 453 31 520 42" fill="none" stroke="#6ee7d8" strokeWidth="4" strokeLinecap="round" />
          <path d="M 0 168 C 54 156 75 121 123 132 C 176 145 203 85 250 92 C 304 100 326 46 375 58 C 421 70 453 31 520 42 L 520 210 L 0 210 Z" fill="rgba(110,231,216,0.10)" />
        </svg>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_0.75fr]">
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-black uppercase text-[#6f8091]">Saved companies</p>
          {["MSFT", "NVDA", "AAPL"].map((ticker) => (
            <div key={ticker} className="flex items-center justify-between border-b border-white/10 py-2 last:border-0">
              <span className="text-sm font-black text-white">{ticker}</span>
              <span className="text-xs font-bold text-[#6ee7d8]">Research</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <p className="mb-3 text-xs font-black uppercase text-[#6f8091]">Signal</p>
          <CheckCircle2 className="mb-3 text-[#6ee7d8]" size={22} />
          <p className="text-sm font-bold leading-6 text-[#d7e1ea]">Alerts, analytics, and summary workflows unlock as plans upgrade.</p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
      <p className="text-xs font-black uppercase text-[#6f8091]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-xs font-black text-[#6ee7d8]"><TrendingUp size={13} />{tone}</p>
    </div>
  );
}

function ScreenshotTile({ icon: Icon, title, detail }: { icon: typeof BarChart3; title: string; detail: string }) {
  return (
    <article className="premium-card p-5">
      <Icon className="mb-5 text-[#6ee7d8]" size={22} />
      <h3 className="text-base font-black text-white">{title}</h3>
      <p className="mt-3 text-sm font-semibold leading-6 text-[#9fb0c2]">{detail}</p>
    </article>
  );
}

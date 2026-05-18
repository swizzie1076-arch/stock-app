import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, LineChart } from "lucide-react";

type MarketSectionPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  items: {
    title: string;
    detail: string;
  }[];
};

export function MarketSectionPage({ title, description, icon: Icon, items }: MarketSectionPageProps) {
  return (
    <main className="stock-app dark-mode atlas-landing min-h-screen bg-[#05080d] px-4 pb-28 pt-6 text-ink sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="flex flex-col gap-4 rounded-xl border border-white/10 bg-white/[0.04] p-4 shadow-[0_24px_80px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-[#6ee7d8]/30 bg-[#6ee7d8]/10 text-[#6ee7d8] shadow-[0_0_32px_rgba(20,184,166,0.18)]">
              <LineChart size={20} />
            </span>
            <span>
              <span className="block text-base font-black tracking-normal text-white">Atlas Invest</span>
              <span className="block text-xs font-semibold text-[#8fa1b3]">Market command</span>
            </span>
          </Link>
          <Link
            href="/portfolio"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-[#6ee7d8] px-4 text-sm font-black text-[#061012] transition hover:bg-[#8df3e8]"
          >
            Open portfolio
            <ArrowRight size={16} />
          </Link>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)] lg:items-start">
          <div className="pt-3">
            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-xl border border-[#6ee7d8]/25 bg-[#6ee7d8]/10 text-[#6ee7d8]">
              <Icon size={25} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#6ee7d8]">Atlas Invest</p>
            <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-normal text-white sm:text-5xl">{title}</h1>
            <p className="mt-4 max-w-xl text-base font-semibold leading-7 text-[#a9b8c8]">{description}</p>
          </div>

          <div className="grid gap-3">
            {items.map((item) => (
              <article
                key={item.title}
                className="rounded-xl border border-white/10 bg-white/[0.045] p-5 shadow-[0_18px_60px_rgba(0,0,0,0.22)] transition hover:-translate-y-0.5 hover:border-[#6ee7d8]/35 hover:bg-white/[0.07]"
              >
                <h2 className="text-lg font-black text-white">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-[#8fa1b3]">{item.detail}</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

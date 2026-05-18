import Link from "next/link";
import { ArrowRight, CheckCircle2, Download, MonitorSmartphone, Share, Smartphone } from "lucide-react";
import { InstallActions } from "@/components/install-actions";

const steps = [
  {
    title: "iPhone and iPad",
    icon: Share,
    items: ["Open Atlas Invest in Safari.", "Tap the Share button.", "Choose Add to Home Screen.", "Launch Atlas from your home screen."]
  },
  {
    title: "Android",
    icon: Smartphone,
    items: ["Open Atlas Invest in Chrome.", "Tap Install app or Add to Home screen.", "Confirm the install.", "Open Atlas from your app drawer or home screen."]
  },
  {
    title: "Desktop",
    icon: MonitorSmartphone,
    items: ["Open Atlas Invest in Chrome or Edge.", "Select the install icon in the address bar.", "Confirm Install.", "Pin Atlas to your dock or taskbar."]
  }
];

export default function InstallPage() {
  return (
    <main className="stock-app dark-mode atlas-landing min-h-screen bg-[#05080d] px-4 pb-28 pt-6 text-[#e6edf3] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 text-sm font-black text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.06] text-[#6ee7d8]">
              <Download size={19} />
            </span>
            Atlas Invest
          </Link>
          <Link href="/portfolio" className="hidden h-10 items-center justify-center rounded-lg border border-white/10 bg-white/[0.05] px-4 text-sm font-black text-white transition hover:border-[#6ee7d8]/50 sm:inline-flex">
            Open dashboard
          </Link>
        </header>

        <section className="grid gap-10 py-16 lg:grid-cols-[0.85fr_1.15fr] lg:py-24">
          <div>
            <h1 className="text-5xl font-semibold leading-[1] tracking-normal text-white sm:text-6xl">
              Install Atlas Invest on every screen.
            </h1>
            <p className="mt-6 max-w-2xl text-base font-semibold leading-7 text-[#9fb0c2]">
              Add Atlas Invest to iPhone, Android, or desktop for a faster app-like market cockpit with home-screen launch and offline shell support.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <InstallActions />
              <Link href="/portfolio" className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-5 text-sm font-black text-white transition hover:border-[#6ee7d8]/50">
                Launch Atlas
                <ArrowRight size={17} />
              </Link>
            </div>
          </div>

          <div className="premium-card p-5 sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-sm font-black text-white">PWA readiness</p>
                <p className="mt-1 text-xs font-bold text-[#8fa1b3]">Installable shell, mobile icons, and platform metadata</p>
              </div>
              <span className="rounded-md bg-[#6ee7d8]/15 px-2 py-1 text-[11px] font-black uppercase text-[#6ee7d8]">
                Ready
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              {["Manifest", "Icons", "Offline shell"].map((item) => (
                <div key={item} className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
                  <CheckCircle2 className="mb-4 text-[#6ee7d8]" size={22} />
                  <p className="text-sm font-black text-white">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {steps.map((step) => (
            <article key={step.title} className="premium-card p-5">
              <step.icon className="mb-5 text-[#6ee7d8]" size={24} />
              <h2 className="text-xl font-black text-white">{step.title}</h2>
              <ol className="mt-5 space-y-3">
                {step.items.map((item, index) => (
                  <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-[#b9c7d6]">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[#6ee7d8]/12 text-xs font-black text-[#6ee7d8]">
                      {index + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}

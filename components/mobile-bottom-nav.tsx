"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, FileText, LayoutDashboard, Newspaper, Search } from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/portfolio", label: "Portfolio", icon: BriefcaseBusiness },
  { href: "/discover", label: "Discover", icon: Search },
  { href: "/news", label: "News", icon: Newspaper },
  { href: "/research", label: "Research", icon: FileText }
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav className="mobile-bottom-nav fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-[#05080d]/88 px-2 pb-[calc(env(safe-area-inset-bottom)+0.45rem)] pt-2 shadow-[0_-18px_60px_rgba(0,0,0,0.34)] backdrop-blur-xl lg:hidden">
      <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
        {navItems.map((item) => {
          const active = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-black transition ${
                active ? "bg-[#6ee7d8]/14 text-[#6ee7d8]" : "text-[#8fa1b3] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={17} />
              <span className="max-w-full truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

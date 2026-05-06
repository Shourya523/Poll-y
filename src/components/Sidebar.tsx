"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Flame, LayoutGrid, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "../lib/utils";
import MakePoll from "./MakePoll";

export const navigation = [
  { name: "Feed",    href: "/",            icon: Home },
  { name: "Popular", href: "/popular",     icon: Flame },
  { name: "Rooms",   href: "/rooms",       icon: LayoutGrid },
  { name: "History", href: "/user-history", icon: Clock },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 flex-col fixed inset-y-0 left-0 z-50 bg-[#070709] border-r border-white/5 py-6 px-4">
        {/* Logo */}
        <div className="flex items-center gap-3 px-2 mb-10">
          <div className="h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_15px_rgba(99,102,241,0.6)] animate-pulse" />
          <span className="text-2xl font-bold tracking-tight text-white">Poll-y</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors group",
                  isActive
                    ? "text-white"
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-white/8 rounded-xl border border-white/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 35 }}
                  />
                )}
                <item.icon
                  size={18}
                  className={cn(
                    "relative z-10 transition-colors",
                    isActive ? "text-indigo-400" : "group-hover:text-slate-300"
                  )}
                />
                <span className="relative z-10">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Create Poll CTA at bottom of sidebar */}
        <div className="mt-auto pt-4 border-t border-white/5">
          <MakePoll />
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#070709]/90 backdrop-blur-xl border-t border-white/5">
        <div className="flex items-center justify-around px-2 py-3">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-colors",
                  isActive ? "text-indigo-400" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}

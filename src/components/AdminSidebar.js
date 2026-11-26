"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Coffee,
  Building2,
  FileDown,
  MailCheck,
  Users,
  BellRing,
  Sparkles,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    async function fetchUnread() {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        if (data.success && data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      } catch (e) {
        // fail silently for offline
      }
    }
    fetchUnread();
  }, [pathname]);

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, badge: "Live" },
    { label: "Checksheets", href: "/admin/checksheets", icon: FileSpreadsheet },
    { label: "Tea Count", href: "/admin/tea-count", icon: Coffee, badge: "Dept-wise", highlight: true },
    { label: "Departments", href: "/admin/departments", icon: Building2 },
    { label: "Reports & Downloads", href: "/admin/reports", icon: FileDown },
    { label: "Report Dispatch", href: "/admin/dispatch", icon: MailCheck, badge: "Mail / WA" },
    { label: "Users Access", href: "/admin/users", icon: Users },
    {
      label: "Notifications",
      href: "/admin/notifications",
      icon: BellRing,
      count: unreadCount > 0 ? unreadCount : null,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30 shadow-sm">
      <div className="p-4 space-y-6 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ CANTEEN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Operations & Tea Management</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Menu (Core Flows)
          </div>
          <nav className="space-y-1">
            {navItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs border-r-2 border-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : item.highlight ? "text-amber-500" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? "bg-indigo-100 text-indigo-700"
                          : item.highlight
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}

                  {item.count && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white animate-pulse">
                      {item.count}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Info Box */}
        <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Factory Canteen Hub</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Aligned with factory operations: Checksheet fill-up charts, department tea counts, and automated report dispatches.
          </p>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Akurdi Facility
        </span>
        <span className="text-slate-400 font-mono">v2.0 Live</span>
      </div>
    </aside>
  );
}

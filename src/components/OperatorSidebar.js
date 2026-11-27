"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  UtensilsCrossed,
  Coffee,
  ClipboardCheck,
  PackageCheck,
  ShieldCheck,
  Building2,
  ChevronRight,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function OperatorSidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState({
    name: "Ramesh Pawar",
    employeeId: "BAJAJ-OP-01",
    role: { name: "Operator", code: "OPERATOR" },
    department: { name: "Canteen Main Kitchen" },
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isAdmin =
    user?.role?.code === "SUPER_ADMIN" ||
    user?.role?.code === "ADMIN";

  const navigationItems = [
    {
      label: "Overview",
      href: "/operator",
      icon: LayoutDashboard,
      badge: "Live",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Counters & Plates",
      href: "/operator/counters",
      icon: UtensilsCrossed,
      badge: "Food Service",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
    },
    {
      label: "Tea Logistics",
      href: "/operator/tea-delivery",
      icon: Coffee,
      badge: "Liters Log",
      badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
    },
    {
      label: "50+ Checksheets",
      href: "/operator/checksheets",
      icon: ClipboardCheck,
      badge: "54 Active",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
    },
    {
      label: "Biscuit Audit",
      href: "/operator/biscuit-audit",
      icon: PackageCheck,
      badge: "Ledger",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30 font-sans">
      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ FLOOR</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                TERMINAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Operations &amp; Canteen Hub</p>
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="p-3 rounded-xl bg-slate-50/80 border border-slate-200/80 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              {user.name ? user.name[0] : "O"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{user.employeeId}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1.5 text-indigo-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift 1 &amp; General</span>
            </span>
            <span className="text-slate-500 font-mono">06:00 – 14:00</span>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations Menu
          </div>
          <nav className="space-y-1">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon;
              const isActive =
                item.href === "/operator"
                  ? pathname === "/operator"
                  : pathname === item.href || pathname?.startsWith(item.href + "/");

              return (
                <Link
                  key={idx}
                  href={item.href}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs border-r-2 border-indigo-600"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isActive
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : `${item.badgeColor}`
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Admin Link if Admin */}
        {isAdmin && (
          <div className="pt-2">
            <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Administrative
            </div>
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Admin Console</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        )}
      </div>

      {/* Facility Footer Card */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/50">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
            <div className="truncate">
              <div className="text-[11px] font-bold text-slate-800 truncate">Akurdi Complex</div>
              <div className="text-[10px] text-slate-500 truncate">Canteen Main Kitchen</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="System Online" />
        </div>
      </div>
    </aside>
  );
}

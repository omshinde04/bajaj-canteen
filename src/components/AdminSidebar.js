"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  LogOut,
  ChevronRight,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState({ name: "Super Administrator", role: { name: "Super Admin", code: "SUPER_ADMIN" }, email: "admin@bajaj.com" });
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const notifRes = await fetch("/api/notifications");
        const notifData = await notifRes.json();
        if (notifData.success && notifData.unreadCount !== undefined) {
          setUnreadCount(notifData.unreadCount);
        }
      } catch (e) {
        // fail silently for offline
      }

      try {
        const userRes = await fetch("/api/auth/me");
        const userData = await userRes.json();
        if (userData.authenticated && userData.user) {
          setUser(userData.user);
        }
      } catch (e) {}
    }
    fetchData();
  }, [pathname]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

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
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30 shadow-xs font-sans">
      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-600 flex items-center justify-center font-bold text-white shadow-xs">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ CANTEEN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                ADMIN
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Operations &amp; Governance</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="space-y-1">
          <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Admin Console Menu
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
                      ? "bg-indigo-50 text-indigo-700 font-semibold shadow-2xs border-r-2 border-indigo-600"
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
                          ? "bg-indigo-600 text-white"
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

        {/* Switch to Operator Floor View */}
        <div className="pt-1">
          <Link
            href="/operator"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
          >
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-slate-500" />
              <span>Switch to Floor View</span>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </Link>
        </div>

        {/* Facility Info Card */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Akurdi Complex Hub</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Standardized factory operations: 54 checksheets, meal counters, kettle logistics, and automatic report dispatch.
          </p>
        </div>
      </div>

      {/* DOCKED BOTTOM USER PROFILE & 1-CLICK LOGOUT */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/90 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-600 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {user.name ? user.name[0] : "A"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                <span className="text-indigo-700 font-semibold">{user.role?.name || "Administrator"}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer shrink-0"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400" />
          <span>{loggingOut ? "Signing out..." : "Logout Session"}</span>
        </button>
      </div>
    </aside>
  );
}

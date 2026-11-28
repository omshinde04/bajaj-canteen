"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  Clock,
  PhoneCall,
  Activity,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function OperatorSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [user, setUser] = useState({
    name: "Ramesh Pawar",
    employeeId: "BAJAJ-OP-01",
    role: { name: "Operator", code: "OPERATOR" },
    department: { name: "Canteen Main Kitchen" },
  });

  const [shiftProgress, setShiftProgress] = useState(65);
  const [currentTime, setCurrentTime] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  const [metrics, setMetrics] = useState({
    readyCounters: 0,
    totalCounters: 6,
    teaDeliveredLiters: 0,
    completedSheets: 1,
    totalSheets: 54,
  });

  useEffect(() => {
    // 1. Fetch current user
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});

    // 2. Calculate live shift progress & time
    const updateShiftTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );

      // Shift 1 runs from 06:00 to 14:00 (8 hours)
      const currentHours = now.getHours() + now.getMinutes() / 60;
      let progress = Math.round(((currentHours - 6) / 8) * 100);
      if (progress < 0) progress = 10;
      if (progress > 100) progress = 100;
      setShiftProgress(progress);
    };

    updateShiftTime();
    const interval = setInterval(updateShiftTime, 30000);

    // 3. Fetch live quick glance metrics
    const today = new Date().toISOString().split("T")[0];
    Promise.all([
      fetch(`/api/counter-logs?date=${today}&shift=SHIFT_1_GEN`).then((r) => r.json()).catch(() => ({})),
      fetch(`/api/tea-delivery?date=${today}`).then((r) => r.json()).catch(() => ({})),
      fetch("/api/checksheets").then((r) => r.json()).catch(() => ({})),
      fetch("/api/submissions").then((r) => r.json()).catch(() => ({})),
    ]).then(([counterRes, teaRes, csRes, subRes]) => {
      const readyC = counterRes?.summary?.readyCounters || 0;
      const totalC = counterRes?.summary?.totalCounters || 6;
      const teaL = teaRes?.summary?.totalDeliveredLiters || 0;
      const totalS = csRes?.checkSheets?.length || 54;
      const doneS = subRes?.submissions?.filter((s) => s.status === "APPROVED" || s.status === "SUBMITTED")?.length || 1;

      setMetrics({
        readyCounters: readyC,
        totalCounters: totalC,
        teaDeliveredLiters: teaL,
        completedSheets: doneS,
        totalSheets: totalS,
      });
    });

    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  const isAdmin =
    user?.role?.code === "SUPER_ADMIN" ||
    user?.role?.code === "ADMIN";

  const roleCode = user?.role?.code;

  let navigationItems = [];
  if (roleCode === "OPERATOR_1") {
    navigationItems = [
      {
        label: "Overview",
        href: "/operator",
        icon: LayoutDashboard,
        badge: "Op 1 Hub",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
      },
      {
        label: "Counters & Plates",
        href: "/operator/counters",
        icon: UtensilsCrossed,
        badge: "Shift 1/Gen/2/3/VIP",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-100",
      },
      {
        label: "Biscuit Audit",
        href: "/operator/biscuit-audit",
        icon: PackageCheck,
        badge: "Shared Sync",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      },
    ];
  } else if (roleCode === "OPERATOR_2") {
    navigationItems = [
      {
        label: "Overview",
        href: "/operator",
        icon: LayoutDashboard,
        badge: "Op 2 Hub",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
      },
      {
        label: "54 Checksheets",
        href: "/operator/checksheets",
        icon: ClipboardCheck,
        badge: "0-25 & 26-50+",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
      },
      {
        label: "Biscuit Audit",
        href: "/operator/biscuit-audit",
        icon: PackageCheck,
        badge: "Shared Sync",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      },
    ];
  } else if (roleCode === "OPERATOR_3") {
    navigationItems = [
      {
        label: "Overview",
        href: "/operator",
        icon: LayoutDashboard,
        badge: "Op 3 Hub",
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
      },
      {
        label: "Tea Logistics",
        href: "/operator/tea-delivery",
        icon: Coffee,
        badge: "Liters Log",
        badgeColor: "bg-amber-50 text-amber-700 border-amber-100",
      },
    ];
  } else if (roleCode === "OT_SUPERVISOR") {
    navigationItems = [
      {
        label: "Overtime (OT) Log",
        href: "/operator/overtime",
        icon: Clock,
        badge: user?.department?.name ? user.department.name.replace("Shop", "").trim() : "2h & 3h OT",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
      },
    ];
  } else {
    // Admin or General Operator: All modules
    navigationItems = [
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
        label: "54 Checksheets",
        href: "/operator/checksheets",
        icon: ClipboardCheck,
        badge: `${metrics.totalSheets} Active`,
        badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-100",
      },
      {
        label: "Biscuit Audit",
        href: "/operator/biscuit-audit",
        icon: PackageCheck,
        badge: "Ledger",
        badgeColor: "bg-purple-50 text-purple-700 border-purple-100",
      },
      {
        label: "Overtime (OT) Log",
        href: "/operator/overtime",
        icon: Clock,
        badge: "6 Depts",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-100",
      },
    ];
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30 font-sans shadow-xs">
      {/* TOP & MIDDLE SCROLLABLE SECTION */}
      <div className="p-4 space-y-4 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1 pb-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center font-bold text-white text-base shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ FLOOR</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-50 text-indigo-700 border border-indigo-100">
                TERMINAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Operations &amp; Canteen Hub</p>
          </div>
        </div>

        {/* Navigation Menu */}
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

        {/* LIVE SHIFT TELEMETRY CARD (ELEGANTLY UTILIZING EMPTY SPACE) */}
        <div className="rounded-xl bg-slate-50 border border-slate-200/90 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Shift Run
            </span>
            <span className="text-[10px] font-mono font-semibold text-slate-700 bg-white px-1.5 py-0.5 rounded border border-slate-200">
              {currentTime || "08:30"} IST
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span>Shift 1 &amp; General</span>
              <span className="text-indigo-600 font-mono text-[11px]">{shiftProgress}%</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${shiftProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-mono">
              <span>06:00 AM</span>
              <span>02:00 PM</span>
            </div>
          </div>
        </div>

        {/* QUICK GLANCE OPERATIONAL METRICS WIDGET */}
        <div className="rounded-xl bg-white border border-slate-200/80 p-3 space-y-2 shadow-2xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Shift Progress Snapshot
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                <UtensilsCrossed className="w-3 h-3 text-emerald-600" />
                Food Counters
              </span>
              <span className="font-bold text-slate-800 text-[11px] font-mono">
                {metrics.readyCounters}/{metrics.totalCounters} Ready
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                <Coffee className="w-3 h-3 text-amber-600" />
                Tea Dispatched
              </span>
              <span className="font-bold text-slate-800 text-[11px] font-mono">
                {metrics.teaDeliveredLiters} L
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-slate-500 flex items-center gap-1.5 text-[11px]">
                <ClipboardCheck className="w-3 h-3 text-indigo-600" />
                Checklists
              </span>
              <span className="font-bold text-slate-800 text-[11px] font-mono">
                {metrics.completedSheets}/{metrics.totalSheets} Done
              </span>
            </div>
          </div>
        </div>

        {/* FACILITY CALLOUT / KITCHEN DESK */}
        <div className="rounded-xl bg-indigo-50/50 border border-indigo-100 p-3 space-y-1">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-900 uppercase tracking-wider">
            <Building2 className="w-3 h-3 text-indigo-600" />
            <span>Akurdi Complex</span>
          </div>
          <p className="text-[11px] text-indigo-950 font-semibold leading-tight">
            Canteen Main Kitchen • Bay 04
          </p>
          <p className="text-[10px] text-indigo-600 pt-0.5">
            Supervisor Hotline: Ext. 4402
          </p>
        </div>

        {/* Admin Link if Admin */}
        {isAdmin && (
          <div className="pt-1">
            <Link
              href="/admin/dashboard"
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition"
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
                <span>Switch to Admin Panel</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
            </Link>
          </div>
        )}
      </div>

      {/* DOCKED BOTTOM USER PROFILE & LOGOUT BAR (EXACTLY AS REQUESTED) */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/90 space-y-2">
        <div className="flex items-center justify-between gap-2">
          {/* User Avatar & Info */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-700 flex items-center justify-center font-bold text-xs text-white shrink-0 shadow-xs">
              {user.name ? user.name[0] : "O"}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-900 truncate leading-tight">
                {user.name}
              </div>
              <div className="text-[10px] text-slate-500 font-mono truncate flex items-center gap-1">
                <span>{user.employeeId}</span>
                <span>•</span>
                <span className="text-emerald-700 font-semibold">Operator</span>
              </div>
            </div>
          </div>

          {/* Quick Sign Out Action Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors border border-transparent hover:border-rose-200 cursor-pointer shrink-0"
            title="Sign Out / Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>

        {/* Full Width Logout CTA */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-white border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-slate-700 hover:text-rose-600 text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-600" />
          <span>{loggingOut ? "Signing out..." : "Logout Session"}</span>
        </button>
      </div>
    </aside>
  );
}

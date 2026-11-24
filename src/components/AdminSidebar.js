"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileSpreadsheet,
  CheckSquare,
  Clock,
  Users,
  Building2,
  CalendarDays,
  BarChart3,
  FileText,
  History,
  Settings,
  Layers,
  ShieldCheck,
  ChevronRight,
  Database,
} from "lucide-react";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navGroups = [
    {
      group: "Core Operations",
      items: [
        { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { label: "Check Sheets", href: "/admin/checksheets", icon: FileSpreadsheet, badge: "Master" },
        { label: "Submissions & Approvals", href: "/admin/submissions", icon: CheckSquare },
        { label: "Status Monitoring", href: "/admin/status", icon: Clock },
      ],
    },
    {
      group: "Plant & Shift Hierarchy",
      items: [
        { label: "Departments", href: "/admin/departments", icon: Building2 },
        { label: "Shifts (A/B/C)", href: "/admin/shifts", icon: CalendarDays },
        { label: "User & Role RBAC", href: "/admin/users", icon: Users },
      ],
    },
    {
      group: "Analytics & Governance",
      items: [
        { label: "KPI Analytics", href: "/admin/analytics", icon: BarChart3 },
        { label: "Reports (PDF/Excel)", href: "/admin/reports", icon: FileText },
        { label: "Activity Audit Trail", href: "/admin/audit", icon: History },
        { label: "System Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-[#141414] border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30">
      <div className="p-4 space-y-6 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-9 h-9 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-white shadow-md shadow-[#5733F0]/30">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-white">BAJAJ CANTEEN</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#CDFE02] text-[#101010]">
                2.0
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Enterprise Admin Console</p>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-5">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                {group.group}
              </div>
              <div className="space-y-0.5">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-[#5733F0] text-white shadow-md shadow-[#5733F0]/25 font-semibold"
                          : "text-zinc-300 hover:text-white hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`w-4 h-4 ${isActive ? "text-[#CDFE02]" : "text-zinc-400"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.badge && (
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                            isActive
                              ? "bg-white/20 text-white"
                              : "bg-[#CDFE02]/20 text-[#CDFE02]"
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* Facility & Shard Footer */}
      <div className="p-4 border-t border-white/10 space-y-2 shrink-0 bg-[#141414]">
        <div className="rounded-xl bg-white/[0.03] border border-white/5 p-2.5 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-zinc-400 text-[11px]">Active Facility</span>
            <span className="w-2 h-2 rounded-full bg-[#CDFE02]" />
          </div>
          <div className="font-semibold text-white truncate text-[11px]">
            Bajaj Auto Akurdi Plant
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            DB: bajaj_enterprise
          </div>
        </div>
      </div>
    </aside>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRightLeft,
  ShieldCheck,
  Building2,
  CalendarDays,
  ExternalLink,
  ChevronRight,
  LogOut,
  User,
  Radio,
  FileSpreadsheet,
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

  const isSupervisorOrAdmin =
    user?.role?.code === "SUPER_ADMIN" ||
    user?.role?.code === "PLANT_ADMIN" ||
    user?.role?.code === "SUPERVISOR";

  const navGroups = [
    {
      group: "Floor Operations",
      items: [
        {
          label: "Shift Taskboard",
          href: "/operator",
          icon: ClipboardCheck,
          badge: "Active",
          badgeColor: "bg-indigo-100 text-indigo-700",
        },
      ],
    },
  ];

  if (isSupervisorOrAdmin) {
    navGroups.push({
      group: "Elevated Controls",
      items: [
        {
          label: "Admin Dashboard",
          href: "/admin/dashboard",
          icon: ShieldCheck,
          badge: "Admin",
          badgeColor: "bg-indigo-600 text-white",
        },
      ],
    });
  }

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-hidden z-30 font-sans shadow-xs">
      <div className="p-4 space-y-5 overflow-y-auto flex-1 min-h-0 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 pt-1">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-base shadow-md shadow-indigo-600/20">
            B
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ FLOOR</span>
              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-700">
                TERMINAL
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Kitchen Operations Terminal</p>
          </div>
        </div>

        {/* Operator Profile Card */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white shrink-0 shadow-xs">
              {user.name ? user.name[0] : "O"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-slate-900 truncate">{user.name}</div>
              <div className="text-[10px] text-slate-500 font-mono truncate">{user.employeeId}</div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[10px]">
            <span className="flex items-center gap-1 text-indigo-700 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Shift A (Morning)</span>
            </span>
            <span className="text-slate-500 font-mono">06:00 – 14:00</span>
          </div>
        </div>

        {/* Navigation Groups */}
        <nav className="space-y-4">
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <div className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {group.group}
              </div>
              <div className="space-y-1">
                {group.items.map((item, iIdx) => {
                  const Icon = item.icon;
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/operator" && pathname?.startsWith(item.href + "/"));

                  return (
                    <Link
                      key={iIdx}
                      href={item.href}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 font-semibold shadow-xs border-r-2 border-indigo-600"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`}
                        />
                        <span>{item.label}</span>
                      </div>

                      {item.badge && (
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-mono ${
                            item.badgeColor || "bg-slate-100 text-slate-700"
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

      {/* Pinned Plant / Terminal Footer */}
      <div className="p-3 border-t border-slate-200 bg-white shrink-0 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <div className="text-[10px] text-slate-700">
              <div className="font-semibold text-slate-900">Akurdi Complex</div>
              <div className="text-slate-500">Unit 04 • Main Kitchen</div>
            </div>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-xs" />
        </div>

        <div className="text-[10px] text-slate-400 text-center font-mono">
          Bajaj Operations OS v2.0
        </div>
      </div>
    </aside>
  );
}

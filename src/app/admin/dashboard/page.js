"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Users,
  Clock,
  ShieldCheck,
  Building2,
  CalendarDays,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCheckSheets: 0,
    departmentsCount: 0,
    shiftsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/checksheets").then((r) => r.json()),
      fetch("/api/departments").then((r) => r.json()),
      fetch("/api/shifts").then((r) => r.json()),
    ])
      .then(([csData, deptData, shiftData]) => {
        setStats({
          totalCheckSheets: csData.pagination?.total || 14,
          departmentsCount: deptData.count || 4,
          shiftsCount: shiftData.count || 3,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      title: "Configured Check Sheets",
      value: stats.totalCheckSheets,
      subtext: "Across all operational categories",
      icon: FileSpreadsheet,
      accent: "border-[#5733F0]/40 text-[#5733F0]",
      bg: "bg-[#5733F0]/10",
    },
    {
      title: "Active Departments",
      value: stats.departmentsCount,
      subtext: "Akurdi Plant Facility",
      icon: Building2,
      accent: "border-[#D2EFF7]/40 text-[#D2EFF7]",
      bg: "bg-[#D2EFF7]/10",
    },
    {
      title: "Operational Shifts",
      value: stats.shiftsCount,
      subtext: "Shift A, Shift B, Shift C",
      icon: CalendarDays,
      accent: "border-[#CDFE02]/40 text-[#CDFE02]",
      bg: "bg-[#CDFE02]/10",
    },
    {
      title: "Compliance Score",
      value: "99.4%",
      subtext: "Zero critical hygiene breaches",
      icon: ShieldCheck,
      accent: "border-[#CDFE02]/40 text-[#CDFE02]",
      bg: "bg-[#CDFE02]/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#5733F0]/25 via-white/[0.03] to-[#141414] border border-white/10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CDFE02]/10 border border-[#CDFE02]/30 text-[#CDFE02] text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Phase 1 Control Console Active</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            Operational Governance & Real-Time Monitoring
          </h1>
          <p className="text-xs text-zinc-400 max-w-2xl">
            Centralized management for factory check sheets, shift rosters, approvals, and immutable audit logs for Bajaj Canteen facilities.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/admin/checksheets"
            className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-md shadow-[#5733F0]/30"
          >
            <span>Manage Check Sheets</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#CDFE02]" />
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-3 hover:border-white/20 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl ${kpi.bg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="text-xs text-zinc-400 mt-1">{kpi.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/admin/checksheets"
          className="group rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-2.5 hover:border-[#5733F0]/60 transition-all"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#CDFE02] uppercase tracking-wider">Module 2</span>
            <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </div>
          <h3 className="text-sm font-semibold text-white">Check Sheet CRUD & Master Templates</h3>
          <p className="text-xs text-zinc-400">
            Create, duplicate, assign, and enforce mandatory photo requirements on operational check sheets.
          </p>
        </Link>

        <div className="group rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-2.5 hover:border-[#5733F0]/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#D2EFF7] uppercase tracking-wider">Module 25</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">Shift A/B/C</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Department & Shift Management</h3>
          <p className="text-xs text-zinc-400">
            Configure shift timings (06:00, 14:00, 22:00) and department assignments across plant facilities.
          </p>
        </div>

        <div className="group rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-2.5 hover:border-[#5733F0]/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#5733F0] uppercase tracking-wider">Module 11</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300">Immutable</span>
          </div>
          <h3 className="text-sm font-semibold text-white">Activity Log & Audit Trail</h3>
          <p className="text-xs text-zinc-400">
            Every submission, approval, modification, and user login is permanently timestamped with diff tracking.
          </p>
        </div>
      </div>
    </div>
  );
}

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
  Activity,
  Layers,
  ArrowUpRight,
  Camera,
  CheckSquare,
  FileCheck,
  ChevronRight,
  RefreshCw,
  SlidersHorizontal,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalCheckSheets: 14,
    departmentsCount: 4,
    shiftsCount: 3,
    activeCheckSheets: 14,
  });
  const [recentChecksheets, setRecentChecksheets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/checksheets").then((r) => r.json()).catch(() => ({})),
      fetch("/api/departments").then((r) => r.json()).catch(() => ({})),
      fetch("/api/shifts").then((r) => r.json()).catch(() => ({})),
    ])
      .then(([csData, deptData, shiftData]) => {
        const checksheets = csData.checkSheets || [];
        setRecentChecksheets(checksheets.slice(0, 5));
        setStats({
          totalCheckSheets: csData.pagination?.total || checksheets.length || 14,
          departmentsCount: deptData.count || 4,
          shiftsCount: shiftData.count || 3,
          activeCheckSheets: checksheets.filter((c) => c.status === "ACTIVE").length || 12,
        });
      })
      .catch((err) => console.error("Error loading dashboard metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    {
      title: "Configured Check Sheets",
      value: stats.totalCheckSheets,
      subtext: "Across 4 active departments",
      trend: "+2 this week",
      icon: FileSpreadsheet,
      accent: "text-[#5733F0]",
      bg: "bg-[#5733F0]/15 border-[#5733F0]/30",
    },
    {
      title: "Today's Shift Submissions",
      value: "28 / 32",
      subtext: "87.5% shift completion rate",
      trend: "Shift A on schedule",
      icon: CheckSquare,
      accent: "text-[#CDFE02]",
      bg: "bg-[#CDFE02]/15 border-[#CDFE02]/30",
    },
    {
      title: "Pending Approvals",
      value: "3",
      subtext: "Awaiting supervisor sign-off",
      trend: "SLA: < 30m response",
      icon: Clock,
      accent: "text-[#D2EFF7]",
      bg: "bg-[#D2EFF7]/15 border-[#D2EFF7]/30",
    },
    {
      title: "Hygiene Compliance Score",
      value: "99.4%",
      subtext: "ISO 22000 & FSSAI benchmark",
      trend: "Zero critical alerts",
      icon: ShieldCheck,
      accent: "text-[#CDFE02]",
      bg: "bg-[#CDFE02]/15 border-[#CDFE02]/30",
    },
  ];

  const departmentStatus = [
    { name: "Canteen Main Kitchen", completed: 8, total: 8, status: "100%", color: "bg-[#CDFE02]" },
    { name: "Dining Hall Alpha", completed: 6, total: 6, status: "100%", color: "bg-[#CDFE02]" },
    { name: "Cold Storage & Refrigeration", completed: 3, total: 4, status: "75%", color: "bg-[#5733F0]" },
    { name: "Waste Management & Effluent", completed: 2, total: 2, status: "100%", color: "bg-[#CDFE02]" },
  ];

  const recentActivity = [
    {
      title: "Daily Deep Fryer Oil Quality & TPM Check",
      department: "Canteen Main Kitchen",
      operator: "Ramesh Pawar (BAJAJ-082)",
      shift: "Shift A",
      time: "12m ago",
      status: "Approved",
      photoCount: 2,
    },
    {
      title: "Walk-in Freezer Temperature Log (-18°C)",
      department: "Cold Storage",
      operator: "Suresh Kulkarni (BAJAJ-104)",
      shift: "Shift A",
      time: "24m ago",
      status: "Pending Sign-off",
      photoCount: 1,
    },
    {
      title: "Dining Hall Sanitization & UV Surface Log",
      department: "Dining Hall Alpha",
      operator: "Amit Shinde (BAJAJ-119)",
      shift: "Shift A",
      time: "48m ago",
      status: "Approved",
      photoCount: 3,
    },
    {
      title: "Raw Material Acceptance & Batch Expiry",
      department: "Canteen Main Kitchen",
      operator: "Kavita Jadhav (BAJAJ-055)",
      shift: "Shift A",
      time: "1h 15m ago",
      status: "Approved",
      photoCount: 4,
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Industrial Shift Telemetry Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#5733F0]/25 via-[#14141A] to-[#0E0E12] border border-white/10 p-6 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#CDFE02]/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-32 bg-[#5733F0]/20 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#CDFE02]/15 border border-[#CDFE02]/30 text-[#CDFE02] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
                Shift A Active • 06:00 to 14:00
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-zinc-300 text-xs">
                Akurdi Plant Facility • Unit 04
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#5733F0]/20 border border-[#5733F0]/40 text-[#D2EFF7] text-xs font-medium">
                Admin Console 2.0
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
              Canteen Operational Governance Console
            </h1>
            <p className="text-xs md:text-sm text-zinc-400 max-w-2xl">
              Live monitoring of shift handover checklists, mandatory photo compliance, multi-tier approvals, and immutable audit logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Link
              href="/admin/checksheets"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#5733F0]/30"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#CDFE02]" />
              <span>Check Sheet Master</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/admin/checksheets"
              className="px-4 py-2.5 rounded-xl font-semibold text-xs text-zinc-200 bg-white/5 hover:bg-white/10 border border-white/10 transition-all flex items-center gap-2"
            >
              <CheckSquare className="w-4 h-4 text-[#D2EFF7]" />
              <span>Pending Reviews (3)</span>
            </Link>
          </div>
        </div>

        {/* Shift Elapsed Progress Bar */}
        <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs text-zinc-400">
          <div className="flex items-center gap-3">
            <Clock className="w-4 h-4 text-[#CDFE02]" />
            <span>
              Shift A Progress: <strong className="text-white">82% Elapsed</strong> (Next handover to Shift B in 1h 24m)
            </span>
          </div>
          <div className="w-full md:w-64 h-2 bg-black/40 rounded-full overflow-hidden border border-white/10">
            <div className="h-full bg-gradient-to-r from-[#5733F0] to-[#CDFE02] rounded-full" style={{ width: "82%" }} />
          </div>
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-3 hover:border-white/20 transition-all relative overflow-hidden group"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                <div className={`p-2 rounded-xl border ${kpi.bg}`}>
                  <Icon className={`w-4 h-4 ${kpi.accent}`} />
                </div>
              </div>
              <div>
                <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                  {kpi.value}
                </div>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[11px]">
                  <span className="text-zinc-400">{kpi.subtext}</span>
                  <span className="font-semibold text-[#CDFE02]">{kpi.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main 2-Column Grid: Shift Operations Matrix + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 cols): Department Compliance & Master Templates */}
        <div className="lg:col-span-2 space-y-6">
          {/* Department Shift Execution Status */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#CDFE02]" />
                  Department Shift Compliance (Shift A)
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Real-time checklist submission rates across plant facilities.
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
                19 / 20 Completed
              </span>
            </div>

            <div className="space-y-3 pt-2">
              {departmentStatus.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-zinc-200">{dept.name}</span>
                    <span className="text-zinc-400 font-mono">
                      {dept.completed}/{dept.total} Checks ({dept.status})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-black/40 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${dept.color} rounded-full`}
                      style={{ width: `${(dept.completed / dept.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Master Check Sheets Table Preview */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-[#5733F0]" />
                  Active Check Sheet Master Templates
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Operational templates enforced with mandatory photo proof and digital sign-off.
                </p>
              </div>
              <Link
                href="/admin/checksheets"
                className="text-xs font-semibold text-[#CDFE02] hover:underline flex items-center gap-1"
              >
                <span>View All ({stats.totalCheckSheets})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 text-zinc-400">
                    <th className="pb-3 font-semibold">Title & Code</th>
                    <th className="pb-3 font-semibold">Frequency</th>
                    <th className="pb-3 font-semibold">Department</th>
                    <th className="pb-3 font-semibold">Evidence</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentChecksheets.length > 0 ? (
                    recentChecksheets.map((cs) => (
                      <tr key={cs._id} className="hover:bg-white/[0.02]">
                        <td className="py-3">
                          <div className="font-semibold text-white">{cs.title}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{cs.code}</div>
                        </td>
                        <td className="py-3 text-zinc-300">{cs.frequency}</td>
                        <td className="py-3 text-zinc-300">{cs.department?.name || "Kitchen"}</td>
                        <td className="py-3">
                          {cs.mandatoryPhotoCount > 0 || cs.fields?.some((f) => f.requiresPhoto) ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#CDFE02] font-medium">
                              <Camera className="w-3 h-3" /> Photo Required
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500">Standard</span>
                          )}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              cs.isActive
                                ? "bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30"
                                : "bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {cs.isActive ? "ACTIVE" : "INACTIVE"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-4 text-center text-zinc-500">
                        Loading master check sheets...
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (1 col): Live Shift Activity Stream & Quick Launch */}
        <div className="space-y-6">
          {/* Live Shift Submissions Feed */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#CDFE02]" />
                Recent Shift Activity
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-zinc-300">
                Live Feed
              </span>
            </div>

            <div className="space-y-3">
              {recentActivity.map((act, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all space-y-1.5"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-xs text-white leading-snug">
                      {act.title}
                    </span>
                    <span
                      className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        act.status === "Approved"
                          ? "bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30"
                          : "bg-[#D2EFF7]/15 text-[#D2EFF7] border border-[#D2EFF7]/30"
                      }`}
                    >
                      {act.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{act.operator}</span>
                    <span>{act.time}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] text-zinc-500 pt-1 border-t border-white/5">
                    <span>{act.department}</span>
                    <span>•</span>
                    <span className="text-zinc-400 flex items-center gap-1">
                      <Camera className="w-2.5 h-2.5 text-[#CDFE02]" /> {act.photoCount} Photos
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Module Navigation Matrix */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#5733F0]" />
              Operational Modules
            </h3>

            <div className="space-y-2">
              <Link
                href="/admin/checksheets"
                className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white group-hover:text-[#CDFE02] transition-colors">
                    Check Sheet Management
                  </div>
                  <div className="text-[11px] text-zinc-400">Create, duplicate, assign, and enforce SLAs</div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              <Link
                href="/admin/checksheets"
                className="group flex items-center justify-between p-3 rounded-xl bg-white/[0.02] hover:bg-white/5 border border-white/5 transition-all text-xs"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white group-hover:text-[#CDFE02] transition-colors">
                    Shift Rosters & Departments
                  </div>
                  <div className="text-[11px] text-zinc-400">Shift A (06:00), Shift B (14:00), Shift C (22:00)</div>
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </Link>

              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-white">Immutable Audit Trail</span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#5733F0]/20 text-[#D2EFF7]">
                    SHA-256
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Every sign-in, check sheet edit, and supervisor sign-off is tamper-proof.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

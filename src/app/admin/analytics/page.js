"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  CalendarDays,
  Building2,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Layers,
  Award,
} from "lucide-react";

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");
  const [loading, setLoading] = useState(false);

  const kpis = [
    {
      title: "Average Compliance Index",
      value: "99.4%",
      change: "+0.8%",
      isPositive: true,
      sub: "ISO 22000 & FSSAI Standard",
      accent: "text-[#CDFE02]",
      bg: "bg-[#CDFE02]/10 border-[#CDFE02]/20",
    },
    {
      title: "First-Time Approval Rate",
      value: "96.2%",
      change: "+2.4%",
      isPositive: true,
      sub: "Zero rework on 142 submissions",
      accent: "text-[#5733F0]",
      bg: "bg-[#5733F0]/10 border-[#5733F0]/20",
    },
    {
      title: "Average Supervisor Review Time",
      value: "14.8m",
      change: "-6.2m",
      isPositive: true,
      sub: "Target SLA: < 30m response",
      accent: "text-[#D2EFF7]",
      bg: "bg-[#D2EFF7]/10 border-[#D2EFF7]/20",
    },
    {
      title: "Critical Food Safety Defects",
      value: "1",
      change: "-3",
      isPositive: true,
      sub: "Immediate rectification enforced",
      accent: "text-amber-400",
      bg: "bg-amber-500/10 border-amber-500/20",
    },
  ];

  const shiftComparison = [
    {
      name: "Shift A (Morning)",
      code: "SHIFT_A",
      hours: "06:00 – 14:00",
      compliance: 99.6,
      completedChecks: 128,
      avgReviewMinutes: 12.4,
      defects: 0,
      badgeColor: "bg-[#CDFE02]",
    },
    {
      name: "Shift B (Evening)",
      code: "SHIFT_B",
      hours: "14:00 – 22:00",
      compliance: 98.4,
      completedChecks: 94,
      avgReviewMinutes: 16.8,
      defects: 1,
      badgeColor: "bg-amber-400",
    },
    {
      name: "Shift C (Night)",
      code: "SHIFT_C",
      hours: "22:00 – 06:00",
      compliance: 99.8,
      completedChecks: 46,
      avgReviewMinutes: 8.5,
      defects: 0,
      badgeColor: "bg-[#5733F0]",
    },
  ];

  const departmentBenchmark = [
    { name: "Canteen Main Kitchen", score: 99.8, checks: 142, status: "Benchmark Achieved", color: "bg-[#CDFE02]" },
    { name: "Bakery & Confectionery", score: 100, checks: 64, status: "Zero Non-Conformances", color: "bg-[#CDFE02]" },
    { name: "Dining Hall & Sanitization", score: 99.2, checks: 88, status: "Satisfactory", color: "bg-[#D2EFF7]" },
    { name: "Cold Storage & Raw Materials", score: 96.5, checks: 54, status: "Tolerance Monitored", color: "bg-amber-400" },
  ];

  const commonDefects = [
    { parameter: "Food Handler Attire / Grooming", occurrences: 2, dept: "Kitchen", risk: "Low" },
    { parameter: "Walk-in Freezer Door Gasket Seal", occurrences: 1, dept: "Cold Storage", risk: "Medium" },
    { parameter: "Dining Floor Scrubber Battery", occurrences: 1, dept: "Dining", risk: "Low" },
    { parameter: "Oil TPM Over Limit (>25%)", occurrences: 0, dept: "Kitchen", risk: "Critical (Zero)" },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Operational Quality & KPI Analytics
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 4
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Plant-wide food safety compliance indexes, cross-shift comparisons, SLA response analytics, and defect root-cause tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["24h", "7d", "30d", "90d"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                timeRange === range
                  ? "bg-[#5733F0] text-white shadow-md shadow-[#5733F0]/30"
                  : "bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 border border-white/5"
              }`}
            >
              {range.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-3 hover:border-white/20 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>{kpi.title}</span>
              <span className="inline-flex items-center gap-0.5 font-bold text-[#CDFE02]">
                <TrendingUp className="w-3 h-3" /> {kpi.change}
              </span>
            </div>
            <div>
              <div className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                {kpi.value}
              </div>
              <div className="text-[11px] text-zinc-400 mt-1.5">{kpi.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Cross-Shift Operational Comparison (Module 29) */}
      <div className="rounded-3xl bg-[#141414] border border-white/10 p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-[#CDFE02]" />
              Cross-Shift Performance Benchmark (Shift A vs. Shift B vs. Shift C)
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">
              Comparative analysis of checklist completion adherence, verification speed, and non-conformances.
            </p>
          </div>
          <span className="text-xs font-mono text-[#D2EFF7]">Akurdi Complex Benchmark</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shiftComparison.map((s, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4 hover:border-white/15 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">{s.name}</h4>
                  <div className="text-[11px] font-mono text-zinc-400 mt-0.5">{s.hours}</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-extrabold text-[#CDFE02] font-mono">{s.compliance}%</div>
                  <div className="text-[10px] text-zinc-500">Compliance</div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                <div className={`h-full ${s.badgeColor} rounded-full`} style={{ width: `${s.compliance}%` }} />
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5 text-center text-xs">
                <div>
                  <div className="text-[10px] text-zinc-500">Checks</div>
                  <div className="font-bold text-white mt-0.5 font-mono">{s.completedChecks}</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Avg Review</div>
                  <div className="font-bold text-white mt-0.5 font-mono">{s.avgReviewMinutes}m</div>
                </div>
                <div>
                  <div className="text-[10px] text-zinc-500">Defects</div>
                  <div className={`font-bold mt-0.5 font-mono ${s.defects > 0 ? "text-amber-400" : "text-[#CDFE02]"}`}>
                    {s.defects}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2-Column Analytics: Department Quality Index & Defect Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Department Compliance Index (7 cols) */}
        <div className="lg:col-span-7 rounded-3xl bg-[#141414] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#5733F0]" />
              Department Hygiene Compliance Matrix
            </h3>
            <span className="text-xs text-zinc-400 font-mono">ISO 22000 Target: 98%</span>
          </div>

          <div className="space-y-3.5">
            {departmentBenchmark.map((dept, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{dept.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400 font-mono text-[11px]">{dept.checks} checks executed</span>
                    <span className="font-mono font-bold text-[#CDFE02] text-sm">{dept.score}%</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden">
                  <div className={`h-full ${dept.color} rounded-full`} style={{ width: `${dept.score}%` }} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-1">
                  <span>{dept.status}</span>
                  <span className="text-[#CDFE02] font-semibold">Audit Ready</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Common Defect Pareto Table (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl bg-[#141414] border border-white/10 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Non-Conformance Triage
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-zinc-400">
              Pareto Watch
            </span>
          </div>

          <div className="space-y-2.5">
            {commonDefects.map((defect, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center justify-between text-xs hover:border-white/10 transition-all"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-white">{defect.parameter}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">
                    Facility: {defect.dept} • {defect.occurrences} flags
                  </div>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    defect.risk.includes("Critical")
                      ? "bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30"
                      : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                  }`}
                >
                  {defect.risk}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-2xl bg-[#5733F0]/10 border border-[#5733F0]/25 text-xs text-zinc-300 space-y-1">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#CDFE02]" />
              FSSAI Hygiene Rating: 5-Star Grade A+
            </div>
            <p className="text-[11px] text-zinc-400">
              Plant 04 canteen maintains top tier sanitation conformity across all industrial shifts.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

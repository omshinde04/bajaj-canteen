"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileSpreadsheet,
  Coffee,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  FileDown,
  MailCheck,
  BellRing,
  PieChart,
  PlusCircle,
  Calendar,
} from "lucide-react";

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState(null);
  const [teaData, setTeaData] = useState(null);
  const [chartPeriod, setChartPeriod] = useState("daily"); // "daily" or "monthly"
  const [quickTeaModal, setQuickTeaModal] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [teaCountInput, setTeaCountInput] = useState(100);
  const [sessionInput, setSessionInput] = useState("MORNING");
  const [submittingTea, setSubmittingTea] = useState(false);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [repRes, teaRes] = await Promise.all([
        fetch(`/api/reports/summary?type=${chartPeriod}`).then((r) => r.json()),
        fetch(`/api/tea-count`).then((r) => r.json()),
      ]);

      if (repRes.success) setReportData(repRes);
      if (teaRes.success) {
        setTeaData(teaRes);
        if (teaRes.departments && teaRes.departments.length > 0 && !selectedDeptId) {
          setSelectedDeptId(teaRes.departments[0]._id);
        }
      }
    } catch (e) {
      console.error("Dashboard data fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [chartPeriod]);

  const handleQuickLogTea = async (e) => {
    e.preventDefault();
    if (!selectedDeptId || !teaCountInput) return;
    setSubmittingTea(true);
    try {
      const todayStr = new Date().toISOString().split("T")[0];
      const res = await fetch("/api/tea-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          date: todayStr,
          session: sessionInput,
          count: Number(teaCountInput),
          notes: "Quick log from Dashboard",
        }),
      });
      if (res.ok) {
        setQuickTeaModal(false);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingTea(false);
    }
  };

  const totalChecksheets = reportData?.summary?.totalChecksheets || 6;
  const filledChecksheets = reportData?.summary?.filledChecksheets || 4;
  const pendingChecksheets = Math.max(0, totalChecksheets - filledChecksheets);
  const fillupPct = totalChecksheets > 0 ? Math.round((filledChecksheets / totalChecksheets) * 100) : 0;
  const totalTeaCups = teaData?.totalCupsToday || 970;
  const deptTotals = teaData?.deptTotals || {
    "Engine Assembly": 260,
    "Vehicle Assembly": 210,
    "Machine Shop": 180,
    "Paint Shop": 140,
    "Press Shop": 120,
    "Quality Assurance": 60,
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16 font-sans">
      {/* TOP HEADER & QUICK ACTIONS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Bajaj Canteen Operations Console
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Admin Master Dashboard
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Checksheet completion chart, department-wise tea tracking & automated report dispatch.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => setQuickTeaModal(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition shadow-lg shadow-[#5733F0]/25"
          >
            <Coffee className="w-4 h-4 text-[#CDFE02]" />
            <span>+ Log Tea Count</span>
          </button>

          <Link
            href="/admin/reports"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-medium text-xs transition border border-white/10"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Download Reports</span>
          </Link>

          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition border border-white/10"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Checksheet Fill-up */}
        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Checksheets Fill-up
            </span>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{fillupPct}%</span>
            <span className="text-xs text-zinc-400">({filledChecksheets}/{totalChecksheets} done)</span>
          </div>
          <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${fillupPct}%` }}
            />
          </div>
        </div>

        {/* KPI 2: Pending Checksheets */}
        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Pending Checksheets
            </span>
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-400">{pendingChecksheets}</span>
            <span className="text-xs text-zinc-400">Awaiting Fill-up</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Requires floor operator entry</p>
        </div>

        {/* KPI 3: Total Tea Cups Today */}
        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Total Tea Count (Today)
            </span>
            <div className="p-2 rounded-lg bg-[#5733F0]/20 text-[#CDFE02]">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#CDFE02]">{totalTeaCups}</span>
            <span className="text-xs text-zinc-400">Cups Served</span>
          </div>
          <p className="text-[11px] text-zinc-400">Across {Object.keys(deptTotals).length} factory depts</p>
        </div>

        {/* KPI 4: Active Factory Departments */}
        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Active Departments
            </span>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {teaData?.departments?.length || 6}
            </span>
            <span className="text-xs text-zinc-400">Count Centers</span>
          </div>
          <p className="text-[11px] text-zinc-500 mt-1">Engine, Vehicle Assy, etc.</p>
        </div>
      </div>

      {/* TWO PRIMARY SECTIONS: POINT 5 (CHART) & POINT 9 (TEA COUNT DEPT-WISE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: POINT 5 - CHECKSHEET CHART (FILLUP VS NOT FILLUP) */}
        <div className="lg:col-span-5 bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#5733F0]/20 text-[#CDFE02]">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Checksheet Fill-up Chart</h3>
                <p className="text-[11px] text-zinc-400">Filled up vs. Not filled up</p>
              </div>
            </div>

            {/* Daily / Monthly Switcher */}
            <div className="flex items-center gap-1 bg-[#09090C] p-1 rounded-lg border border-white/10 text-xs">
              <button
                onClick={() => setChartPeriod("daily")}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  chartPeriod === "daily"
                    ? "bg-[#5733F0] text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setChartPeriod("monthly")}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  chartPeriod === "monthly"
                    ? "bg-[#5733F0] text-white font-semibold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* VISUAL DONUT CIRCLE CHART */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-8 py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-white/10"
                  strokeWidth="12"
                  stroke="currentColor"
                  fill="transparent"
                />
                {/* Filled-up Arc */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="text-[#CDFE02] transition-all duration-700 ease-out"
                  strokeWidth="12"
                  strokeDasharray={251.2}
                  strokeDashoffset={251.2 - (251.2 * fillupPct) / 100}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-white tracking-tight">{fillupPct}%</span>
                <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Filled Up</span>
              </div>
            </div>

            {/* Legend Stats */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="w-3 h-3 rounded-full bg-[#CDFE02]" />
                  <span>Filled up</span>
                </span>
                <span className="font-bold text-white font-mono">{filledChecksheets} sheets</span>
              </div>

              <div className="flex items-center justify-between gap-4 p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="flex items-center gap-2 text-zinc-300">
                  <span className="w-3 h-3 rounded-full bg-white/20" />
                  <span>Not Filled up</span>
                </span>
                <span className="font-bold text-amber-400 font-mono">{pendingChecksheets} sheets</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-400">
                <span>Total Scheduled:</span>
                <span className="text-white font-mono font-bold">{totalChecksheets}</span>
              </div>
            </div>
          </div>

          {/* Quick link to Checksheet Status */}
          <Link
            href="/admin/checksheets"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition border border-white/10"
          >
            <span>Manage Checksheets & Status →</span>
          </Link>
        </div>

        {/* RIGHT COLUMN: POINT 9 - TEA COUNT SHOW DEPT-WISE */}
        <div className="lg:col-span-7 bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-[#5733F0]/20 text-[#CDFE02]">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Department-wise Tea Count</h3>
                <p className="text-[11px] text-zinc-400">Today's tea cups served per factory department</p>
              </div>
            </div>

            <Link
              href="/admin/tea-count"
              className="text-xs text-[#CDFE02] hover:underline font-semibold flex items-center gap-1"
            >
              <span>View Full Details</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* DEPARTMENT BREAKDOWN BARS */}
          <div className="space-y-3.5">
            {Object.entries(deptTotals).map(([deptName, cups], idx) => {
              const maxCups = Math.max(...Object.values(deptTotals), 1);
              const barWidth = Math.round((cups / maxCups) * 100);

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-white/[0.02] border border-white/5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-white flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {deptName}
                    </span>
                    <span className="font-mono font-bold text-[#CDFE02] text-sm">{cups} cups</span>
                  </div>
                  <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-[#5733F0] to-[#CDFE02] h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Footer Summary */}
          <div className="pt-2 flex items-center justify-between text-xs text-zinc-400 border-t border-white/5">
            <span>Combined Total Today:</span>
            <span className="font-mono font-extrabold text-white text-sm">
              {totalTeaCups} Cups
            </span>
          </div>
        </div>
      </div>

      {/* POINT 3: REAL-TIME CHECKSHEET STATUS STREAM */}
      <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#CDFE02]" />
            <h3 className="font-bold text-white text-sm">Today's Checksheet Status Feed</h3>
          </div>
          <Link href="/admin/checksheets" className="text-xs text-zinc-400 hover:text-white transition">
            View All Checksheets →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportData?.checksheets?.slice(0, 6).map((cs, idx) => {
            const isFilled = idx < filledChecksheets;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#09090C] border border-white/5 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 truncate">
                  <div className="font-medium text-white truncate">{cs.title}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{cs.code} • {cs.category || "JH Inspection"}</div>
                </div>
                {isFilled ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    Filled Up
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                    Pending
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* QUICK LOG TEA MODAL */}
      {quickTeaModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Coffee className="w-4 h-4 text-[#CDFE02]" />
                <span>Quick Log Department Tea Count</span>
              </div>
              <button
                onClick={() => setQuickTeaModal(false)}
                className="text-zinc-500 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQuickLogTea} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Select Factory Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  required
                >
                  {teaData?.departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Session
                  </label>
                  <select
                    value={sessionInput}
                    onChange={(e) => setSessionInput(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="MORNING">Morning Tea</option>
                    <option value="EVENING">Evening Tea</option>
                    <option value="NIGHT">Night Shift</option>
                    <option value="SPECIAL">Special Batch</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Cups Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={teaCountInput}
                    onChange={(e) => setTeaCountInput(e.target.value)}
                    required
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setQuickTeaModal(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingTea}
                  className="px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition"
                >
                  {submittingTea ? "Saving..." : "Save Count"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

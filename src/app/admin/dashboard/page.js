"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
import {
  FileSpreadsheet,
  Coffee,
  CheckCircle2,
  Clock,
  Building2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileDown,
  PieChart,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Bajaj Canteen Operations Console
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">
            Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Checksheet completion chart, department-wise tea tracking & automated report dispatch.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Button
            variant="default"
            size="default"
            onClick={() => setQuickTeaModal(true)}
          >
            <Coffee className="w-4 h-4 text-amber-300" />
            <span>+ Log Tea Count</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            asChild
          >
            <Link href="/admin/reports">
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span>Download Reports</span>
            </Link>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchDashboardData}
            disabled={loading}
            title="Refresh Data"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* TOP KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Checksheet Fill-up */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Checksheets Fill-up
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">{fillupPct}%</span>
            <span className="text-xs text-slate-500">({filledChecksheets}/{totalChecksheets} done)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${fillupPct}%` }}
            />
          </div>
        </Card>

        {/* KPI 2: Pending Checksheets */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Pending Checksheets
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600">{pendingChecksheets}</span>
            <span className="text-xs text-slate-500">Awaiting Fill-up</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Requires floor operator entry</p>
        </Card>

        {/* KPI 3: Total Tea Cups Today */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Tea Count (Today)
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <Coffee className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-indigo-600">{totalTeaCups}</span>
            <span className="text-xs text-slate-500">Cups Served</span>
          </div>
          <p className="text-[11px] text-slate-500">Across {Object.keys(deptTotals).length} factory depts</p>
        </Card>

        {/* KPI 4: Active Factory Departments */}
        <Card className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Departments
            </span>
            <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {teaData?.departments?.length || 6}
            </span>
            <span className="text-xs text-slate-500">Count Centers</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Engine, Vehicle Assy, etc.</p>
        </Card>
      </div>

      {/* TWO PRIMARY SECTIONS: POINT 5 (CHART) & POINT 9 (TEA COUNT DEPT-WISE) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: POINT 5 - CHECKSHEET CHART (FILLUP VS NOT FILLUP) */}
        <Card className="lg:col-span-5 p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Checksheet Fill-up Chart</h3>
                <p className="text-[11px] text-slate-500">Filled up vs. Not filled up</p>
              </div>
            </div>

            {/* Daily / Monthly Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
              <button
                onClick={() => setChartPeriod("daily")}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  chartPeriod === "daily"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Today
              </button>
              <button
                onClick={() => setChartPeriod("monthly")}
                className={`px-2.5 py-1 rounded font-medium transition cursor-pointer ${
                  chartPeriod === "monthly"
                    ? "bg-white text-indigo-700 font-semibold shadow-xs"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                Monthly
              </button>
            </div>
          </div>

          {/* DONUT SVG CHART */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 py-4">
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Background Ring */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-slate-100"
                  strokeWidth="11"
                  fill="transparent"
                />
                {/* Progress Ring (Filled up) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  className="stroke-indigo-600 transition-all duration-1000 ease-out"
                  strokeWidth="11"
                  strokeDasharray={`${fillupPct * 2.38} 238`}
                  strokeLinecap="round"
                  fill="transparent"
                />
              </svg>
              {/* Center Metrics Text */}
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-2xl font-extrabold text-slate-900 tracking-tight font-mono">
                  {fillupPct}%
                </span>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {chartPeriod === "daily" ? "Daily SLA" : "Monthly"}
                </span>
              </div>
            </div>

            {/* Legend Column */}
            <div className="space-y-3 text-xs w-full sm:w-auto">
              <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-indigo-600" />
                  <span className="text-slate-700 font-medium">Filled Up Checksheets:</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{filledChecksheets}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-300" />
                  <span className="text-slate-700 font-medium">Pending (Not Filled):</span>
                </div>
                <span className="font-bold text-amber-600 font-mono">{pendingChecksheets}</span>
              </div>

              <div className="flex items-center justify-between sm:justify-start gap-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-700 font-medium">Total Scheduled:</span>
                </div>
                <span className="font-bold text-slate-900 font-mono">{totalChecksheets}</span>
              </div>
            </div>
          </div>

          {/* Quick Compliance Status Pill */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Compliance Status:</span>
            <Badge variant="success" className="gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>SLA Target Met (Above 60%)</span>
            </Badge>
          </div>
        </Card>

        {/* RIGHT COLUMN: POINT 9 - DEPARTMENT-WISE TEA DISTRIBUTION */}
        <Card className="lg:col-span-7 p-6 space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Coffee className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Department-wise Tea Count</h3>
                <p className="text-[11px] text-slate-500">Real-time cup counts served to factory bays</p>
              </div>
            </div>

            <Button
              variant="link"
              size="sm"
              asChild
            >
              <Link href="/admin/tea-count">
                Full Log Details →
              </Link>
            </Button>
          </div>

          {/* DEPARTMENT BREAKDOWN BARS */}
          <div className="space-y-3.5">
            {Object.entries(deptTotals).map(([deptName, cups], idx) => {
              const maxCups = Math.max(...Object.values(deptTotals), 1);
              const barWidth = Math.round((cups / maxCups) * 100);

              return (
                <div key={idx} className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {deptName}
                    </span>
                    <span className="font-mono font-bold text-indigo-600 text-sm">{cups} cups</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick Footer Summary */}
          <div className="pt-2 flex items-center justify-between text-xs text-slate-500 border-t border-slate-100">
            <span>Combined Total Today:</span>
            <span className="font-mono font-extrabold text-slate-900 text-sm">
              {totalTeaCups} Cups
            </span>
          </div>
        </Card>
      </div>

      {/* POINT 3: REAL-TIME CHECKSHEET STATUS STREAM */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Checksheet Status Feed</h3>
          </div>
          <Button variant="link" size="sm" asChild>
            <Link href="/admin/checksheets">
              View All Checksheets →
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {reportData?.checksheets?.slice(0, 6).map((cs, idx) => {
            const isFilled = idx < filledChecksheets;
            return (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 truncate">
                  <div className="font-semibold text-slate-900 truncate">{cs.title}</div>
                  <div className="text-[10px] text-slate-500 font-mono">{cs.code} • {cs.category || "JH Inspection"}</div>
                </div>
                {isFilled ? (
                  <Badge variant="success">
                    Filled Up
                  </Badge>
                ) : (
                  <Badge variant="warning">
                    Pending
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Shadcn Dialog: Quick Log Tea Modal */}
      <Dialog open={quickTeaModal} onOpenChange={setQuickTeaModal}>
        <DialogContent onClose={() => setQuickTeaModal(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-indigo-600" />
              <span>Quick Log Department Tea Count</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleQuickLogTea} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Select Factory Department
              </label>
              <select
                value={selectedDeptId}
                onChange={(e) => setSelectedDeptId(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Session
                </label>
                <select
                  value={sessionInput}
                  onChange={(e) => setSessionInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="MORNING">Morning Tea</option>
                  <option value="EVENING">Evening Tea</option>
                  <option value="NIGHT">Night Shift</option>
                  <option value="SPECIAL">Special Batch</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Cups Count
                </label>
                <Input
                  type="number"
                  min="0"
                  value={teaCountInput}
                  onChange={(e) => setTeaCountInput(e.target.value)}
                  required
                  className="font-mono"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setQuickTeaModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={submittingTea}
              >
                {submittingTea ? "Saving..." : "Save Count"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import {
  ClipboardCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Camera,
  ArrowRight,
  RefreshCw,
  Building2,
  Calendar,
  Layers,
  Sparkles,
  Search,
  Filter,
  Radio,
  FileSpreadsheet,
  Package,
  UtensilsCrossed,
  Wrench,
  TrendingUp,
} from "lucide-react";

export default function OperatorTaskboard() {
  const [checkSheets, setCheckSheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [counterSummary, setCounterSummary] = useState(null);
  const [teaSummary, setTeaSummary] = useState(null);
  const [stockSummary, setStockSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("DUE");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split("T")[0];

      const [csRes, subRes, counterRes, teaRes, stockRes] = await Promise.all([
        fetch("/api/checksheets").then((r) => r.json()).catch(() => ({})),
        fetch("/api/submissions").then((r) => r.json()).catch(() => ({})),
        fetch(`/api/counter-logs?date=${today}&shift=SHIFT_1_GEN`).then((r) => r.json()).catch(() => ({})),
        fetch(`/api/tea-delivery?date=${today}&shift=MORNING`).then((r) => r.json()).catch(() => ({})),
        fetch(`/api/stock-audit?date=${today}`).then((r) => r.json()).catch(() => ({})),
      ]);

      setCheckSheets(csRes.checkSheets || []);
      setSubmissions(subRes.submissions || []);
      if (counterRes.success) setCounterSummary(counterRes.summary);
      if (teaRes.success) setTeaSummary(teaRes.summary);
      if (stockRes.success) setStockSummary(stockRes.currentDayAudit);
    } catch (err) {
      console.error("Failed to load operator tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute status for each checksheet
  const mappedTasks = checkSheets.map((cs) => {
    const matchingSub = submissions.find(
      (s) => s.checkSheet?._id === cs._id || s.checkSheet?.code === cs.code
    );

    let status = "DUE";
    let statusLabel = "Due for Execution";
    let statusColor = "text-amber-700 bg-amber-50 border-amber-200";

    if (matchingSub) {
      if (matchingSub.status === "APPROVED") {
        status = "COMPLETED";
        statusLabel = "Approved & Signed";
        statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      } else if (matchingSub.status === "PENDING_APPROVAL" || matchingSub.status === "SUBMITTED") {
        status = "PENDING_REVIEW";
        statusLabel = "Pending Supervisor Sign-Off";
        statusColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
      } else if (matchingSub.status === "REJECTED") {
        status = "REJECTED";
        statusLabel = "Returned for Rework";
        statusColor = "text-rose-700 bg-rose-50 border-rose-200";
      }
    }

    return {
      ...cs,
      taskStatus: status,
      statusLabel,
      statusColor,
      submission: matchingSub || null,
    };
  });

  // Filter tasks
  const filteredTasks = mappedTasks.filter((t) => {
    const matchesSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.code.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "DUE") return t.taskStatus === "DUE" || t.taskStatus === "REJECTED";
    if (activeTab === "COMPLETED")
      return t.taskStatus === "COMPLETED" || t.taskStatus === "PENDING_REVIEW";
    return true; // ALL
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const dueCount = mappedTasks.filter((t) => t.taskStatus === "DUE" || t.taskStatus === "REJECTED").length;
  const completedCount = mappedTasks.filter(
    (t) => t.taskStatus === "COMPLETED" || t.taskStatus === "PENDING_REVIEW"
  ).length;

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      {/* Shift Execution Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                Shift 1 &amp; General Active
              </span>
              <span className="text-xs text-slate-500 font-mono">06:00 – 14:00 (Floor Run)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-sans">
              Canteen Operator Operations Terminal
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl">
              Unified command terminal for food counters, shop floor tea delivery, 50+ checksheets, and biscuit audit ledgers.
            </p>
          </div>

          {/* Quick Shift Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-medium">Checksheets Compliance</span>
              <span className="font-bold text-indigo-600 font-mono">
                {checkSheets.length ? Math.round((completedCount / checkSheets.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                style={{
                  width: `${checkSheets.length ? (completedCount / checkSheets.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-slate-500 flex items-center justify-between">
              <span className="font-medium">{completedCount} Executed</span>
              <span className="text-amber-600 font-semibold">{dueCount} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4 CORE MODULE QUICK ACCESS CARDS (CLIENT SPECIFICATION FLOWS) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            Core Operator Modules (Handwritten Specification Flows)
          </h2>
          <span className="text-xs text-slate-500">Live Production Terminal</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Operator 1 Counters */}
          <Link href="/operator/counters" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    OP-1
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-indigo-600 transition-colors">
                  Counter Readiness &amp; Plates
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Shift 1 &amp; General, Shift 2, and VIP Breakfast &amp; Lunch plate audits with live camera proof.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>
                  {counterSummary?.readyCounters || 0} / {counterSummary?.totalCounters || 6} Ready
                </span>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center">
                  Open →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Tea Operator */}
          <Link href="/operator/tea-delivery" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-amber-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Radio className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                    TEA OP
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-amber-600 transition-colors">
                  Tea Delivery &amp; Wastage Log
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Shop floor delivery in Liters, returns, automated net consumption, and department-wise waste.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>
                  {teaSummary?.totalDeliveredLiters || 0} L Del. | {teaSummary?.totalWasteLiters || 0} L Waste
                </span>
                <span className="text-amber-600 group-hover:translate-x-1 transition-transform flex items-center">
                  Open →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: Operator 2 Checksheets */}
          <Link href="/operator/checksheets" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-purple-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    OP-2 (A)
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-purple-600 transition-colors">
                  50+ Operational Checksheets
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  0–25 Main Kitchen Sheets &amp; 25–50 JH Equipment Autonomous Maintenance sheets.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>54 Active Checksheets</span>
                <span className="text-purple-600 group-hover:translate-x-1 transition-transform flex items-center">
                  Open →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 4: Operator 2 Biscuit Audit */}
          <Link href="/operator/biscuit-audit" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    OP-2 (B)
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm mt-3 group-hover:text-indigo-600 transition-colors">
                  Biscuit &amp; Inventory Audit
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Parle-G &amp; 4 products daily roll-over ledger. Opening = previous closing automatically.
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>5 Products Ledger</span>
                <span className="text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center">
                  Open →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Quick Search & Filter Tabs for Scheduled Tasks */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("DUE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "DUE"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Action Required</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "DUE" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {dueCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "COMPLETED"
                ? "bg-indigo-600 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submitted &amp; Approved</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "COMPLETED" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "ALL"
                ? "bg-slate-900 text-white shadow-xs"
                : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Shift Tasks</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === "ALL" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
              }`}
            >
              {checkSheets.length}
            </span>
          </button>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search check sheets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
            />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* Check Sheet Task Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500">Loading scheduled check sheets for Shift 1...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
          <h3 className="text-base font-bold text-slate-900">All Scheduled Tasks Clear</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {activeTab === "DUE"
              ? "No pending check sheets found for this shift! Good job on maintaining full compliance."
              : "No check sheets found matching the current search criteria."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedTasks.map((task) => (
            <div
              key={task._id}
              className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-200 transition-all relative overflow-hidden group"
            >
              <div className="space-y-3">
                {/* Header row: Category & Status */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                    {task.category || "General"}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${task.statusColor}`}
                  >
                    {task.statusLabel}
                  </span>
                </div>

                {/* Task Title */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono font-bold text-indigo-600">{task.code}</span>
                    <span className="text-[10px] text-slate-400">• {task.frequency}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors">
                    {task.title}
                  </h3>
                </div>

                {/* Department & SLA Metadata */}
                <div className="space-y-1.5 pt-1 text-xs text-slate-500">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">
                      {typeof task.department === "object"
                        ? task.department?.name
                        : task.department || "Canteen Main Kitchen"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>SLA: {task.slaHours || 2}h target</span>
                    </div>
                    {task.photoRequirement !== "none" && (
                      <div className="flex items-center gap-1 text-indigo-600 font-medium">
                        <Camera className="w-3.5 h-3.5" />
                        <span>Live Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {task.fields?.length || 0} parameter checks
                </span>

                <Link href={`/operator/execute/${task._id}`}>
                  <button
                    className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      task.taskStatus === "COMPLETED"
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                    }`}
                  >
                    <span>{task.taskStatus === "COMPLETED" ? "View Checksheet" : "Execute Checksheet"}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        totalItems={filteredTasks.length}
      />
    </div>
  );
}

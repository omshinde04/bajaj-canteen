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
  Coffee,
  FileSpreadsheet,
  PackageCheck,
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
    let statusLabel = "Action Required";
    let statusColor = "text-amber-700 bg-amber-50 border-amber-200";

    if (matchingSub) {
      if (matchingSub.status === "APPROVED") {
        status = "COMPLETED";
        statusLabel = "Completed";
        statusColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
      } else if (matchingSub.status === "PENDING_APPROVAL" || matchingSub.status === "SUBMITTED") {
        status = "PENDING_REVIEW";
        statusLabel = "Pending Review";
        statusColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
      } else if (matchingSub.status === "REJECTED") {
        status = "REJECTED";
        statusLabel = "Rework Required";
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
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase tracking-wider">
                Shift 1 &amp; General Active
              </span>
              <span className="text-xs text-slate-400 font-mono">06:00 – 14:00</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Floor Operations Command
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              Real-time monitoring and execution terminal for meal service counters, shop floor tea logistics, autonomous machine checksheets, and pantry stock audit.
            </p>
          </div>

          {/* Quick Shift Summary Card */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between shrink-0 min-w-[220px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-slate-600 font-medium">Compliance Rate</span>
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
              <span className="font-medium text-emerald-700">{completedCount} Executed</span>
              <span className="text-amber-700 font-semibold">{dueCount} Pending</span>
            </div>
          </div>
        </div>
      </div>

      {/* CORE OPERATIONS MODULES (CLEAN SAAS CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Floor Operations Modules
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant access to food counter readiness, tea distribution, checksheets, and pantry audit.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Counters & Plates */}
          <Link href="/operator/counters" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                    <UtensilsCrossed className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                    {counterSummary?.readyCounters || 0} / {counterSummary?.totalCounters || 6} Ready
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    Counters &amp; Plates
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Shift 1 Breakfast &amp; Lunch, Shift 2 Snacks &amp; Dinner, and VIP plate audits with camera proof.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Plate Counts</span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Manage Counters →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 2: Tea Logistics */}
          <Link href="/operator/tea-delivery" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-amber-400 hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                    <Coffee className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                    {teaSummary?.totalDeliveredLiters || 0} L Dispatched
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-amber-600 transition-colors">
                    Tea Logistics &amp; Wastage
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Shop floor kettle distribution in Liters, returns, automated net consumption, and wastage.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Waste: {teaSummary?.totalWasteLiters || 0} L</span>
                <span className="text-amber-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Log Dispatch →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 3: 50+ Checksheets */}
          <Link href="/operator/checksheets" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                    <ClipboardCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                    54 Active Sheets
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                    Operational Checksheets
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    25 Main Kitchen Hygiene sheets &amp; 25 JH Autonomous Maintenance machine checksheets.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Live Photos Required</span>
                <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  Open Catalog →
                </span>
              </div>
            </div>
          </Link>

          {/* Card 4: Biscuit Inventory */}
          <Link href="/operator/biscuit-audit" className="group">
            <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-purple-400 hover:shadow-sm transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                    <PackageCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full">
                    5 Products
                  </span>
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                    Biscuit Inventory Audit
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    Parle-G &amp; 4 products daily roll-over ledger. Opening balance automatically carries over.
                  </p>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Auto Roll-over</span>
                <span className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                  View Ledger →
                </span>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Check Sheet Taskboard Section */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("DUE")}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "COMPLETED"
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Completed</span>
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
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === "ALL"
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Tasks</span>
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
                className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs"
              />
            </div>
            <button
              onClick={fetchData}
              disabled={loading}
              className="p-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all cursor-pointer shadow-2xs"
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
            <p className="text-xs text-slate-500">Loading scheduled check sheets...</p>
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
                className="flex flex-col justify-between p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all group"
              >
                <div className="space-y-3">
                  {/* Category & Status */}
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

                  {/* Title */}
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-xs font-mono font-bold text-indigo-600">{task.code}</span>
                      <span className="text-[10px] text-slate-400">• {task.frequency}</span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">
                      {task.title}
                    </h3>
                  </div>

                  {/* Metadata */}
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
                          <span>Photo Proof</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {task.fields?.length || 0} checkpoints
                  </span>

                  <Link href={`/operator/execute/${task._id}`}>
                    <button
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        task.taskStatus === "COMPLETED"
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      <span>{task.taskStatus === "COMPLETED" ? "View Sheet" : "Execute"}</span>
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
    </div>
  );
}

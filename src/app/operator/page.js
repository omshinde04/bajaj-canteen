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
} from "lucide-react";

export default function OperatorTaskboard() {
  const [checkSheets, setCheckSheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("DUE");
  const [search, setSearch] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      const [csRes, subRes] = await Promise.all([
        fetch("/api/checksheets").then((r) => r.json()).catch(() => ({})),
        fetch("/api/submissions").then((r) => r.json()).catch(() => ({})),
      ]);

      setCheckSheets(csRes.checkSheets || []);
      setSubmissions(subRes.submissions || []);
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
    let statusColor = "text-amber-400 bg-amber-400/10 border-amber-400/20";

    if (matchingSub) {
      if (matchingSub.status === "APPROVED") {
        status = "COMPLETED";
        statusLabel = "Approved & Signed";
        statusColor = "text-[#CDFE02] bg-[#CDFE02]/10 border-[#CDFE02]/30";
      } else if (matchingSub.status === "PENDING_APPROVAL" || matchingSub.status === "SUBMITTED") {
        status = "PENDING_REVIEW";
        statusLabel = "Pending Supervisor Sign-Off";
        statusColor = "text-sky-400 bg-sky-400/10 border-sky-400/20";
      } else if (matchingSub.status === "REJECTED") {
        status = "REJECTED";
        statusLabel = "Returned for Rework";
        statusColor = "text-rose-400 bg-rose-400/10 border-rose-400/20";
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
    <div className="space-y-6 pb-12">
      {/* Shift Execution Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#14141A] via-[#101016] to-[#14141A] border border-white/10 p-6 shadow-xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#5733F0]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#CDFE02] text-[#101010] uppercase tracking-wider">
                Shift A Active
              </span>
              <span className="text-xs text-zinc-400 font-mono">06:00 – 14:00 (Morning Run)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-sans">
              Operational Check Sheet Taskboard
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 max-w-xl">
              Complete scheduled kitchen hygiene logs, cold chain telemetry, and cooking oil quality verifications before shift handover.
            </p>
          </div>

          {/* Shift Execution Progress Ring/Bar */}
          <div className="p-4 rounded-xl bg-[#0B0B0E]/80 border border-white/10 flex flex-col justify-between shrink-0 min-w-[200px]">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-zinc-400">Shift Execution</span>
              <span className="font-bold text-[#CDFE02] font-mono">
                {checkSheets.length ? Math.round((completedCount / checkSheets.length) * 100) : 0}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden mb-2">
              <div
                className="bg-[#CDFE02] h-full rounded-full transition-all duration-500"
                style={{
                  width: `${checkSheets.length ? (completedCount / checkSheets.length) * 100 : 0}%`,
                }}
              />
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between">
              <span>{completedCount} Completed</span>
              <span className="text-amber-400 font-semibold">{dueCount} Due</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 [scrollbar-width:none]">
          <button
            onClick={() => setActiveTab("DUE")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "DUE"
                ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                : "bg-[#141418] text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Action Required</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/20 font-mono">
              {dueCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("COMPLETED")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "COMPLETED"
                ? "bg-[#5733F0] text-white shadow-md shadow-[#5733F0]/25"
                : "bg-[#141418] text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Submitted & Approved</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 font-mono">
              {completedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("ALL")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "ALL"
                ? "bg-white text-black shadow-md"
                : "bg-[#141418] text-zinc-400 hover:text-white border border-white/5"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>All Shift Tasks</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-zinc-700 text-white font-mono">
              {checkSheets.length}
            </span>
          </button>
        </div>

        {/* Search Bar & Refresh */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search check sheets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#141418] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
            />
          </div>
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2 rounded-xl bg-[#141418] border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
            title="Refresh Tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Check Sheet Task Cards Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-[#CDFE02] animate-spin mx-auto" />
          <p className="text-xs text-zinc-400">Loading scheduled check sheets for Shift A...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-[#141418] border border-white/10 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-[#CDFE02] mx-auto opacity-80" />
          <h3 className="text-base font-bold text-white">All Caught Up!</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            {activeTab === "DUE"
              ? "All check sheets for Shift A have been executed and dispatched to the supervisor queue."
              : "No check sheets match your search query."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedTasks.map((task) => {
              const isCompleted = task.taskStatus === "COMPLETED";
              const isPendingReview = task.taskStatus === "PENDING_REVIEW";
              const isRejected = task.taskStatus === "REJECTED";

              return (
                <div
                  key={task._id}
                  className="bg-[#141418] border border-white/10 rounded-2xl p-5 flex flex-col justify-between hover:border-white/20 transition-all group"
                >
                  <div className="space-y-3">
                    {/* Top Bar with Category and Status Pill */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-white/5 text-zinc-300 border border-white/10">
                        {task.category}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${task.statusColor}`}
                      >
                        {task.statusLabel}
                      </span>
                    </div>

                    {/* Code & Title */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-mono font-bold text-[#CDFE02]">{task.code}</span>
                        <span className="text-zinc-600">•</span>
                        <span className="text-xs text-zinc-400 capitalize">
                          {task.frequency.replace("_", " ")}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-[#D2EFF7] transition-all">
                        {task.title}
                      </h3>
                    </div>

                    {/* Metadata Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-zinc-400">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101014] border border-white/5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                        <span>{task.department?.name || "Main Kitchen"}</span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#101014] border border-white/5">
                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                        <span>SLA: {task.slaHours}h target</span>
                      </div>

                      {task.mandatoryPhotoCount > 0 && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 text-sky-400">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{task.mandatoryPhotoCount} Photo Required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Action Area */}
                  <div className="pt-5 mt-4 border-t border-white/5 flex items-center justify-between">
                    <div className="text-[11px] text-zinc-500">
                      {task.fields?.length || 0} parameter checks
                    </div>

                    {isCompleted ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#CDFE02]">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Score: {task.submission?.complianceScore || 100}%</span>
                      </div>
                    ) : isPendingReview ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-sky-400">
                        <Clock className="w-4 h-4" />
                        <span>In Supervisor Review</span>
                      </div>
                    ) : (
                      <Link
                        href={`/operator/execute/${task._id}`}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#6c4cf5] text-white text-xs font-bold transition-all shadow-md shadow-[#5733F0]/25 group-hover:scale-102 active:scale-95"
                      >
                        <span>{isRejected ? "Rework & Resubmit" : "Execute Checksheet"}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Dynamic Pagination Controls */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredTasks.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[4, 6, 12]}
          />
        </div>
      )}
    </div>
  );
}

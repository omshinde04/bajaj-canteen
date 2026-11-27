"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Pagination from "@/components/Pagination";
import { LoaderBlock, Spinner } from "@/components/ui/loader";
import {
  FileSpreadsheet,
  Search,
  Filter,
  Camera,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Building2,
  Wrench,
  UtensilsCrossed,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

export default function OperatorChecksheetsPage() {
  const [checkSheets, setCheckSheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeGroup, setActiveGroup] = useState("ALL"); // ALL, MAIN, JH, OTHER
  const [statusFilter, setStatusFilter] = useState("ALL"); // ALL, DUE, COMPLETED
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

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
      console.error("Failed to load operator checksheets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Map each checksheet with today's execution status
  const mappedSheets = checkSheets.map((cs) => {
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
      } else if (
        matchingSub.status === "PENDING_APPROVAL" ||
        matchingSub.status === "SUBMITTED"
      ) {
        status = "PENDING_REVIEW";
        statusLabel = "Pending Supervisor Review";
        statusColor = "text-indigo-700 bg-indigo-50 border-indigo-200";
      } else if (matchingSub.status === "REJECTED") {
        status = "REJECTED";
        statusLabel = "Returned for Rework";
        statusColor = "text-rose-700 bg-rose-50 border-rose-200";
      }
    }

    // Classify into Client Sheet 4 groups:
    // 0-25 are Main sheets (CS-MAIN-xx)
    // 25-50 are JH equipment sheets (CS-JH-xx)
    let group = "OTHER";
    if (cs.code && cs.code.startsWith("CS-MAIN-")) {
      group = "MAIN";
    } else if (cs.code && cs.code.startsWith("CS-JH-")) {
      group = "JH";
    }

    return {
      ...cs,
      taskStatus: status,
      statusLabel,
      statusColor,
      group,
      submission: matchingSub || null,
    };
  });

  // Calculate counts
  const countTotal = mappedSheets.length;
  const countMain = mappedSheets.filter((s) => s.group === "MAIN").length;
  const countJH = mappedSheets.filter((s) => s.group === "JH").length;
  const countOther = mappedSheets.filter((s) => s.group === "OTHER").length;

  const countDue = mappedSheets.filter((s) => s.taskStatus === "DUE" || s.taskStatus === "REJECTED").length;
  const countCompleted = mappedSheets.filter((s) => s.taskStatus === "COMPLETED" || s.taskStatus === "PENDING_REVIEW").length;

  // Filter list
  const filtered = mappedSheets.filter((sheet) => {
    // Group filter
    if (activeGroup === "MAIN" && sheet.group !== "MAIN") return false;
    if (activeGroup === "JH" && sheet.group !== "JH") return false;
    if (activeGroup === "OTHER" && sheet.group !== "OTHER") return false;

    // Status filter
    if (statusFilter === "DUE" && sheet.taskStatus !== "DUE" && sheet.taskStatus !== "REJECTED") return false;
    if (statusFilter === "COMPLETED" && sheet.taskStatus !== "COMPLETED" && sheet.taskStatus !== "PENDING_REVIEW") return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchCode = sheet.code?.toLowerCase().includes(q);
      const matchTitle = sheet.title?.toLowerCase().includes(q);
      const matchCategory = sheet.category?.toLowerCase().includes(q);
      const matchDept = (typeof sheet.department === "object" ? sheet.department?.name : sheet.department)?.toLowerCase().includes(q);
      if (!matchCode && !matchTitle && !matchCategory && !matchDept) return false;
    }

    return true;
  });

  // Pagination
  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleGroupChange = (group) => {
    setActiveGroup(group);
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
              OPERATOR 2 MODULE
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700">
              SHEET 4 - PART 1
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
              LIVE PHOTO PROOF MANDATORY
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            50+ Operational &amp; JH Check Sheets
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Complete daily kitchen sanitation, cold chain telemetries, and autonomous maintenance checks with camera verification.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={fetchData}
          disabled={loading}
          className="border-slate-200"
        >
          <RotateCcw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh Status
        </Button>
      </div>

      {/* KPI Overview Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Total Checksheets</div>
          <div className="text-2xl font-bold text-slate-900 mt-1">{countTotal}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">50+ Active Checksheets</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-indigo-700 flex items-center gap-1.5">
            <UtensilsCrossed className="w-3.5 h-3.5" />
            0–25 Main Sheets
          </div>
          <div className="text-2xl font-bold text-indigo-900 mt-1">{countMain}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Kitchen Hygiene &amp; Safety</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-purple-700 flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" />
            25–50 JH Machines
          </div>
          <div className="text-2xl font-bold text-purple-900 mt-1">{countJH}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Autonomous Maintenance</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-medium text-amber-700 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            Execution Due
          </div>
          <div className="text-2xl font-bold text-amber-900 mt-1">{countDue}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Completed: {countCompleted}
          </div>
        </div>
      </div>

      {/* Tabs and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Group Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleGroupChange("ALL")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                activeGroup === "ALL"
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              All Sheets ({countTotal})
            </button>
            <button
              onClick={() => handleGroupChange("MAIN")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeGroup === "MAIN"
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              0–25 Main Kitchen ({countMain})
            </button>
            <button
              onClick={() => handleGroupChange("JH")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap flex items-center gap-1.5 ${
                activeGroup === "JH"
                  ? "bg-purple-600 text-white"
                  : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200"
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              25–50 JH Equipment ({countJH})
            </button>
            {countOther > 0 && (
              <button
                onClick={() => handleGroupChange("OTHER")}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  activeGroup === "OTHER"
                    ? "bg-slate-900 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                Other Ops ({countOther})
              </button>
            )}
          </div>

          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setStatusFilter("ALL");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === "ALL" ? "bg-white text-slate-900 shadow-xs" : "text-slate-600"
              }`}
            >
              All Status
            </button>
            <button
              onClick={() => {
                setStatusFilter("DUE");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === "DUE" ? "bg-amber-100 text-amber-900 font-semibold" : "text-slate-600"
              }`}
            >
              Due ({countDue})
            </button>
            <button
              onClick={() => {
                setStatusFilter("COMPLETED");
                setCurrentPage(1);
              }}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${
                statusFilter === "COMPLETED" ? "bg-emerald-100 text-emerald-900 font-semibold" : "text-slate-600"
              }`}
            >
              Completed ({countCompleted})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            placeholder="Search checksheets by code (e.g. CS-JH-01, CS-MAIN-05), equipment name, or category..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 bg-slate-50 border-slate-200 text-sm focus:bg-white"
          />
        </div>
      </div>

      {/* Checksheets Cards Grid */}
      {loading ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <Spinner className="mx-auto" />
          <div className="text-sm text-slate-500 mt-2">Loading 50+ checksheets catalog...</div>
        </div>
      ) : paginated.length === 0 ? (
        <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
          <FileSpreadsheet className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-semibold text-slate-800 mt-3">No checksheets matched</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query or switching active tab filters.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((sheet) => {
            const isJH = sheet.group === "JH";
            const isMain = sheet.group === "MAIN";

            return (
              <div
                key={sheet._id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-300 hover:shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Card Header Tag */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded border ${
                        isJH
                          ? "bg-purple-50 text-purple-700 border-purple-200"
                          : isMain
                          ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                          : "bg-slate-100 text-slate-700 border-slate-200"
                      }`}
                    >
                      {sheet.code}
                    </span>

                    <span
                      className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sheet.statusColor}`}
                    >
                      {sheet.statusLabel}
                    </span>
                  </div>

                  {/* Title */}
                  <h3 className="font-semibold text-slate-900 text-sm mt-3 line-clamp-2 leading-snug">
                    {sheet.title}
                  </h3>

                  {/* Category & Meta */}
                  <div className="mt-2 text-xs text-slate-500 flex flex-wrap items-center gap-y-1 gap-x-3">
                    <span className="font-medium text-slate-700 bg-slate-50 px-2 py-0.5 rounded border border-slate-100">
                      {sheet.category || "General Operations"}
                    </span>
                    <span>{sheet.frequency || "DAILY"}</span>
                  </div>

                  {/* Photo Requirement Badge */}
                  <div className="mt-3 flex items-center gap-2 text-xs">
                    <span className="inline-flex items-center gap-1 font-medium text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-2 py-0.5 rounded text-[11px]">
                      <Camera className="w-3 h-3 text-indigo-600" />
                      Live Photo Proof
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {(sheet.fields || []).length} Checkpoints
                    </span>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="text-[11px] text-slate-500">
                    SLA: {sheet.slaHours ? `${sheet.slaHours}h target` : "2h target"}
                  </div>
                  <Link href={`/operator/execute/${sheet._id}`}>
                    <Button
                      size="sm"
                      className={`text-xs font-semibold h-8 px-3 ${
                        sheet.taskStatus === "COMPLETED"
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                      }`}
                    >
                      {sheet.taskStatus === "COMPLETED" ? (
                        <>View Entry →</>
                      ) : (
                        <>
                          <Camera className="w-3.5 h-3.5 mr-1.5" />
                          Execute →
                        </>
                      )}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {filtered.length > itemsPerPage && (
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  );
}

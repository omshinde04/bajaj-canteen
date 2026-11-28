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
  ShieldCheck,
  Crown,
  Users,
  Check,
  Flame,
} from "lucide-react";

export default function OperatorTaskboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Common Data State
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState("");

  // Checksheets State (for Op 2 & Admins)
  const [checkSheets, setCheckSheets] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [checksheetGroup, setChecksheetGroup] = useState("MAIN"); // MAIN (0-25), JH (26-50+), ALL
  const [checksheetTab, setChecksheetTab] = useState("DUE"); // DUE, COMPLETED, ALL
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);

  // Counters State (for Op 1 & Admins)
  const [counterLogs, setCounterLogs] = useState([]);
  const [counterSummary, setCounterSummary] = useState(null);
  const [activeCounterShift, setActiveCounterShift] = useState("SHIFT_1");

  // Tea Logistics State (for Op 3 & Admins)
  const [teaSummary, setTeaSummary] = useState(null);
  const [teaLogs, setTeaLogs] = useState([]);

  // Stock State (for Op 1, Op 2 & Admins)
  const [stockSummary, setStockSummary] = useState(null);

  // Overtime State (for OT Supervisors & Admins)
  const [otSummary, setOtSummary] = useState(null);
  const [otLogs, setOtLogs] = useState([]);

  // Admin View switcher
  const [adminViewTab, setAdminViewTab] = useState("CHECKSHEETS");

  // 1. Initial User Profile Fetch
  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setActiveDate(today);

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setCurrentUser(data.user);
        }
      })
      .catch((err) => console.error("Failed to load user profile:", err))
      .finally(() => setLoadingUser(false));
  }, []);

  // 2. Fetch Module Data based on Role
  const fetchData = async () => {
    if (!activeDate) return;
    try {
      setLoading(true);
      const today = activeDate;
      const roleCode = currentUser?.role?.code;

      const promises = [];

      // Checksheets (Only for Op 2, Admin, Super Admin, General)
      const needChecksheets =
        !roleCode ||
        roleCode === "OPERATOR_2" ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN" ||
        roleCode === "OPERATOR";

      // Counters (Only for Op 1, Admin, Super Admin, General)
      const needCounters =
        !roleCode ||
        roleCode === "OPERATOR_1" ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN" ||
        roleCode === "OPERATOR";

      // Tea (Only for Op 3, Admin, Super Admin, General)
      const needTea =
        !roleCode ||
        roleCode === "OPERATOR_3" ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN" ||
        roleCode === "OPERATOR";

      // Biscuits (Op 1, Op 2, Admin, Super Admin)
      const needStock =
        !roleCode ||
        roleCode === "OPERATOR_1" ||
        roleCode === "OPERATOR_2" ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN";

      // Overtime (OT Supervisor, Admin, Super Admin)
      const needOT =
        !roleCode ||
        roleCode === "OT_SUPERVISOR" ||
        roleCode === "ADMIN" ||
        roleCode === "SUPER_ADMIN";

      if (needChecksheets) {
        promises.push(
          fetch("/api/checksheets", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setCheckSheets(d.checkSheets || []))
            .catch(() => {})
        );
        promises.push(
          fetch("/api/submissions", { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => setSubmissions(d.submissions || []))
            .catch(() => {})
        );
      }

      if (needCounters) {
        promises.push(
          fetch(`/api/counter-logs?date=${today}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                setCounterLogs(d.logs || []);
                setCounterSummary(d.summary || null);
              }
            })
            .catch(() => {})
        );
      }

      if (needTea) {
        promises.push(
          fetch(`/api/tea-delivery?date=${today}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                setTeaSummary(d.summary || null);
                setTeaLogs(d.logs || []);
              }
            })
            .catch(() => {})
        );
      }

      if (needStock) {
        promises.push(
          fetch(`/api/stock-audit?date=${today}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) setStockSummary(d.currentDayAudit || []);
            })
            .catch(() => {})
        );
      }

      if (needOT) {
        promises.push(
          fetch(`/api/overtime?date=${today}`, { cache: "no-store" })
            .then((r) => r.json())
            .then((d) => {
              if (d.success) {
                setOtSummary(d.summary || null);
                setOtLogs(d.logs || []);
              }
            })
            .catch(() => {})
        );
      }

      await Promise.all(promises);
    } catch (err) {
      console.error("Failed to load operator tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser !== null) {
      fetchData();
    }
  }, [currentUser, activeDate]);

  const roleCode = currentUser?.role?.code || "GENERAL";
  const isOp1 = roleCode === "OPERATOR_1";
  const isOp2 = roleCode === "OPERATOR_2";
  const isOp3 = roleCode === "OPERATOR_3";
  const isOT = roleCode === "OT_SUPERVISOR";
  const isAdmin = roleCode === "SUPER_ADMIN" || roleCode === "ADMIN";

  // Checksheets Mapping & Status
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

    let group = "MAIN";
    if (cs.code && cs.code.startsWith("CS-JH-")) {
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

  // Calculate Checksheet Metrics
  const countMain = mappedTasks.filter((s) => s.group === "MAIN").length;
  const countJH = mappedTasks.filter((s) => s.group === "JH").length;
  const mainDone = mappedTasks.filter(
    (s) => s.group === "MAIN" && (s.taskStatus === "COMPLETED" || s.taskStatus === "PENDING_REVIEW")
  ).length;
  const jhDone = mappedTasks.filter(
    (s) => s.group === "JH" && (s.taskStatus === "COMPLETED" || s.taskStatus === "PENDING_REVIEW")
  ).length;

  const dueCount = mappedTasks.filter((t) => t.taskStatus === "DUE" || t.taskStatus === "REJECTED").length;
  const completedCount = mappedTasks.filter(
    (t) => t.taskStatus === "COMPLETED" || t.taskStatus === "PENDING_REVIEW"
  ).length;

  // Filter Tasks by Group (0-25 vs 26-50+), Tab, and Search
  const filteredTasks = mappedTasks.filter((t) => {
    // 1. Group Filter (0-25 Main vs 26-50+ JH)
    if (checksheetGroup === "MAIN" && t.group !== "MAIN") return false;
    if (checksheetGroup === "JH" && t.group !== "JH") return false;

    // 2. Status Filter
    if (checksheetTab === "DUE" && t.taskStatus !== "DUE" && t.taskStatus !== "REJECTED") return false;
    if (checksheetTab === "COMPLETED" && t.taskStatus !== "COMPLETED" && t.taskStatus !== "PENDING_REVIEW") return false;

    // 3. Search Query
    if (search.trim()) {
      const q = search.toLowerCase();
      const matches =
        t.title.toLowerCase().includes(q) ||
        t.code.toLowerCase().includes(q) ||
        (t.category && t.category.toLowerCase().includes(q));
      if (!matches) return false;
    }

    return true;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [checksheetGroup, checksheetTab, search]);

  const totalPages = Math.ceil(filteredTasks.length / pageSize) || 1;
  const paginatedTasks = filteredTasks.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Counter Status Breakdown
  const shift1Breakfast = counterLogs.find((l) => l.shift === "SHIFT_1_GEN" && l.mealType === "BREAKFAST");
  const shift1Lunch = counterLogs.find((l) => l.shift === "SHIFT_1_GEN" && l.mealType === "LUNCH");
  const shift2Snacks = counterLogs.find((l) => l.shift === "SHIFT_2" && l.mealType === "SNACKS");
  const shift2Dinner = counterLogs.find((l) => l.shift === "SHIFT_2" && l.mealType === "DINNER");
  const shift3Snacks = counterLogs.find((l) => l.shift === "SHIFT_3" && l.mealType === "SNACKS");
  const shift3Dinner = counterLogs.find((l) => l.shift === "SHIFT_3" && l.mealType === "DINNER");
  const vipLogs = counterLogs.filter((l) => l.shift === "VIP");

  return (
    <div className="space-y-6 pb-12 font-sans max-w-7xl mx-auto">
      {/* 1. HERO BANNER - SCOPED BY USER ROLE */}
      <div className="rounded-2xl bg-white border border-slate-200/90 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              {isOp1 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Operator 1 Active • Meal Service &amp; Dining
                </span>
              )}
              {isOp2 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                  Operator 2 Active • Checksheets &amp; Hygiene
                </span>
              )}
              {isOp3 && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Operator 3 Active • Shop Floor Tea Logistics
                </span>
              )}
              {isOT && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  OT Supervisor Active • {currentUser?.department?.name || "Department"}
                </span>
              )}
              {isAdmin && (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                  Master Operations Control • Akurdi Facility
                </span>
              )}
              <span className="text-xs text-slate-400 font-mono">Date: {activeDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {isOp1 && "Food Counters & VIP Dining Command"}
              {isOp2 && "Operational Checksheets & Hygiene Command"}
              {isOp3 && "Shop Floor Tea Distribution & Wastage Command"}
              {isOT && `${currentUser?.department?.name || "Department"} Overtime (OT) Roster`}
              {isAdmin && "Factory Canteen Operations Command"}
            </h1>

            <p className="text-xs sm:text-sm text-slate-500 max-w-xl leading-relaxed">
              {isOp1 &&
                "Confirm counter readiness, capture mandatory opening and closing live photo proof, and log plate counts across Shift 1, General Shift, Shift 2, Shift 3, and VIP Dining Suite."}
              {isOp2 &&
                "Execute scheduled daily kitchen hygiene logs (0–25 Main) and autonomous machine maintenance checksheets (26–50+ JH) with mandatory photo verification."}
              {isOp3 &&
                "Distribute kettle deliveries measured in Liters to shop floor locations, track returns, auto-calculate net consumption, and record tea wastage."}
              {isOT &&
                "Record daily shift overtime attendance for your assigned department, track 2-hour and 3-hour participant headcounts, and lock records with supervisor sign-off."}
              {isAdmin &&
                "Real-time monitoring and execution terminal for meal service counters, shop floor tea logistics, autonomous machine checksheets, and pantry stock audit."}
            </p>
          </div>

          {/* Quick Hero Summary Metric Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between shrink-0 min-w-[240px]">
            {isOp1 && (
              <>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Meal Readiness</span>
                  <span className="font-bold text-emerald-600 font-mono">
                    {counterSummary?.allCountersReady ? "All Counters Ready" : "Service In Progress"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Plates Consumed:</span>
                    <span className="font-bold text-slate-900 font-mono">
                      {counterSummary?.consumedPlates || 0} / {counterSummary?.totalPlates || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Balance Remaining:</span>
                    <span className="font-bold text-indigo-600 font-mono">
                      {counterSummary?.balancePlates || 0} plates
                    </span>
                  </div>
                </div>
              </>
            )}

            {isOp2 && (
              <>
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
              </>
            )}

            {isOp3 && (
              <>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Tea Dispatched</span>
                  <span className="font-bold text-amber-600 font-mono">
                    {teaSummary?.totalDeliveredLiters || 0} Liters
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Consumed:</span>
                    <span className="font-bold text-emerald-700 font-mono">
                      {teaSummary?.totalConsumedLiters || 0} L
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Wastage:</span>
                    <span className="font-bold text-rose-600 font-mono">
                      {teaSummary?.totalWasteLiters || 0} L
                    </span>
                  </div>
                </div>
              </>
            )}

            {isOT && (
              <>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Active Department</span>
                  <span className="font-bold text-blue-700 font-mono">
                    {currentUser?.department?.code || "DEPT"}
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>2-Hour OT:</span>
                    <span className="font-bold text-blue-600 font-mono">
                      {otSummary?.totalTwoHourCount || 0} Persons
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>3-Hour OT:</span>
                    <span className="font-bold text-purple-600 font-mono">
                      {otSummary?.totalThreeHourCount || 0} Persons
                    </span>
                  </div>
                </div>
              </>
            )}

            {isAdmin && (
              <>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600 font-medium">Facility Status</span>
                  <span className="font-bold text-indigo-600 font-mono">Live Master</span>
                </div>
                <div className="text-[11px] text-slate-600 space-y-1">
                  <div className="flex justify-between">
                    <span>Checksheets:</span>
                    <span className="font-semibold text-emerald-700">{completedCount} / {checkSheets.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tea Log:</span>
                    <span className="font-semibold text-amber-700">{teaSummary?.totalDeliveredLiters || 0} L</span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 2. CORE OPERATIONS MODULES (CLEAN SAAS CARDS FILTERED STRICTLY BY ROLE) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              {isOp1 && "Operator 1 Assigned Modules"}
              {isOp2 && "Operator 2 Assigned Modules"}
              {isOp3 && "Operator 3 Assigned Modules"}
              {isOT && "Overtime Supervisor Module"}
              {isAdmin && "Floor Operations Modules"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isOp1 && "Food counter readiness, plate counts, and shared biscuit inventory ledger."}
              {isOp2 && "54 Operational and autonomous maintenance checksheets and shared biscuit inventory."}
              {isOp3 && "Shop floor kettle tea delivery, returns, and wastage management."}
              {isOT && "Department-locked overtime attendance roster."}
              {isAdmin && "Instant access to food counter readiness, tea distribution, checksheets, and pantry audit."}
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100 hidden sm:inline-flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Live Sync
          </span>
        </div>

        {/* Dynamic Grid: Cards rendered strictly according to role */}
        <div className={`grid grid-cols-1 ${isOp1 || isOp2 ? "md:grid-cols-2" : isOp3 || isOT ? "md:grid-cols-1" : "md:grid-cols-2 lg:grid-cols-4"} gap-4`}>
          {/* Card: Counters & Plates (Op 1 & Admins Only) */}
          {(isOp1 || isAdmin) && (
            <Link href="/operator/counters" className="group">
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-400 hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                      <UtensilsCrossed className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full">
                      Shift 1 / Gen / 2 / 3 / VIP
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                      Counters &amp; Plates
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Shift 1 Breakfast &amp; Lunch, General Shift, Shift 2 Snacks &amp; Dinner, Shift 3, and VIP plate audits with dual opening/closing camera proof.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Plates Logged</span>
                  <span className="text-emerald-700 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Manage Counters →
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Card: 54 Checksheets (Op 2 & Admins Only) */}
          {(isOp2 || isAdmin) && (
            <Link href="/operator/checksheets" className="group">
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-400 hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <ClipboardCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full">
                      0–25 Main &amp; 26–50+ JH
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors">
                      54 Operational Checksheets
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      25 Main Kitchen Hygiene sheets &amp; 25 JH Autonomous Maintenance machine checksheets with live camera upload.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>{completedCount} / {checkSheets.length} Done</span>
                  <span className="text-indigo-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Open Catalog →
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Card: Biscuit Inventory Audit (Op 1, Op 2 & Admins Only - Shared Sync) */}
          {(isOp1 || isOp2 || isAdmin) && (
            <Link href="/operator/biscuit-audit" className="group">
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-purple-400 hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-purple-600" />
                      Shared Sync (Op 1 ⟷ Op 2)
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-purple-600 transition-colors">
                      Biscuit Inventory Audit
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Parle-G &amp; 4 products daily roll-over ledger. Opening balance automatically carries over with two-way operator notifications.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>5 Products Active</span>
                  <span className="text-purple-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    View Ledger →
                  </span>
                </div>
              </div>
            </Link>
          )}

          {/* Card: Tea Logistics (Op 3 & Admins Only) */}
          {(isOp3 || isAdmin) && (
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
                      Shop floor kettle distribution in Liters, returns, automated net consumption, and wastage across Shift 1, Shift 2, and offices.
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
          )}

          {/* Card: Overtime Log (OT Supervisor & Admins Only) */}
          {(isOT || isAdmin) && (
            <Link href="/operator/overtime" className="group">
              <div className="h-full bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-blue-400 hover:shadow-sm transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                      2h &amp; 3h OT Roster
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                      Department Overtime (OT)
                    </h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      Log employee overtime attendance for {currentUser?.department?.name || "your department"}. Track headcounts and lock rosters.
                    </p>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Dept Locked</span>
                  <span className="text-blue-600 font-semibold group-hover:translate-x-1 transition-transform flex items-center gap-1">
                    Record Overtime →
                  </span>
                </div>
              </div>
            </Link>
          )}
        </div>
      </div>

      {/* 3. MAIN WORKSPACE / TASKBOARD BASED ON OPERATOR ROLE */}

      {/* A. OPERATOR 1 WORKSPACE: MEAL COUNTER STATUS & QUICK SERVICE SNAPSHOT */}
      {isOp1 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Today's Meal Counter Service Status</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Dual Photo Verification
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor service readiness and recorded plate counts across Shift 1, General Shift, Shift 2, Shift 3, and VIP Dining.
              </p>
            </div>

            <Link href="/operator/counters">
              <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                <UtensilsCrossed className="w-4 h-4" />
                <span>Open Counter Management</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          {/* Quick Counter Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Shift 1 & General Breakfast */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Shift 1 &amp; General Breakfast</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${shift1Breakfast?.isReady ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {shift1Breakfast?.isReady ? "Ready" : "Pending"}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex justify-between">
                <span>Plates:</span>
                <span className="font-mono font-bold text-slate-900">
                  {shift1Breakfast?.consumedPlates || 0} / {shift1Breakfast?.totalPlates || 0} consumed
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span className={`flex items-center gap-1 ${shift1Breakfast?.openingPhoto ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                  <Camera className="w-3 h-3" /> Opening Photo
                </span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${shift1Breakfast?.closingPhoto ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                  <Camera className="w-3 h-3" /> Closing Photo
                </span>
              </div>
            </div>

            {/* Shift 1 & General Lunch */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Shift 1 &amp; General Lunch</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${shift1Lunch?.isReady ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {shift1Lunch?.isReady ? "Ready" : "Pending"}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex justify-between">
                <span>Plates:</span>
                <span className="font-mono font-bold text-slate-900">
                  {shift1Lunch?.consumedPlates || 0} / {shift1Lunch?.totalPlates || 0} consumed
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span className={`flex items-center gap-1 ${shift1Lunch?.openingPhoto ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                  <Camera className="w-3 h-3" /> Opening Photo
                </span>
                <span>•</span>
                <span className={`flex items-center gap-1 ${shift1Lunch?.closingPhoto ? "text-emerald-700 font-semibold" : "text-slate-400"}`}>
                  <Camera className="w-3 h-3" /> Closing Photo
                </span>
              </div>
            </div>

            {/* Shift 2 Snacks & Dinner */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Shift 2 (Snacks &amp; Dinner)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${shift2Snacks?.isReady || shift2Dinner?.isReady ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {shift2Snacks?.isReady || shift2Dinner?.isReady ? "Active" : "Pending"}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex justify-between">
                <span>Total Plates:</span>
                <span className="font-mono font-bold text-slate-900">
                  {(shift2Snacks?.consumedPlates || 0) + (shift2Dinner?.consumedPlates || 0)} consumed
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Snacks: {shift2Snacks?.isReady ? "Ready" : "Not Set"}</span>
                <span>•</span>
                <span>Dinner: {shift2Dinner?.isReady ? "Ready" : "Not Set"}</span>
              </div>
            </div>

            {/* Shift 3 Night Service */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Shift 3 (Night Snacks &amp; Dinner)</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${shift3Snacks?.isReady || shift3Dinner?.isReady ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"}`}>
                  {shift3Snacks?.isReady || shift3Dinner?.isReady ? "Active" : "Pending"}
                </span>
              </div>
              <div className="text-xs text-slate-600 flex justify-between">
                <span>Night Shift:</span>
                <span className="font-mono font-bold text-slate-900">
                  {(shift3Snacks?.consumedPlates || 0) + (shift3Dinner?.consumedPlates || 0)} consumed
                </span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                <span>Night Kitchen Service</span>
              </div>
            </div>

            {/* VIP Dining Suite */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/30 space-y-3 md:col-span-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-600" /> VIP Dining Suite (4 Meals)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-200">
                  Executive Service
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Breakfast, Lunch, Snacks, and Dinner with VIP filters, preparation readiness flags, and guest plate audit.
              </p>
              <div className="flex items-center justify-between text-xs pt-1 border-t border-amber-100">
                <span className="text-slate-500">Recorded Sessions: {vipLogs.length}</span>
                <Link href="/operator/counters" className="text-amber-800 font-bold hover:underline">
                  Open VIP Suite →
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* B. OPERATOR 2 WORKSPACE (OR ADMIN): CHECKSHEETS TASKBOARD WITH THE 2 CLIENT TABS */}
      {(isOp2 || isAdmin) && (
        <div className="space-y-4 pt-2">
          {/* Checksheet Header & 2 Tabs (0-25 Main vs 26-50+ JH) */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* PRIMARY 2 TABS REQUESTED BY USER */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 [scrollbar-width:none]">
                <button
                  onClick={() => setChecksheetGroup("MAIN")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    checksheetGroup === "MAIN"
                      ? "bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-200"
                      : "bg-indigo-50/80 text-indigo-700 hover:bg-indigo-100 border border-indigo-200"
                  }`}
                >
                  <UtensilsCrossed className="w-4 h-4" />
                  <span>0–25 Main Checksheets</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      checksheetGroup === "MAIN"
                        ? "bg-white/20 text-white font-bold"
                        : "bg-indigo-200 text-indigo-900 font-semibold"
                    }`}
                  >
                    {mainDone} / {countMain}
                  </span>
                </button>

                <button
                  onClick={() => setChecksheetGroup("JH")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap flex items-center gap-2 cursor-pointer ${
                    checksheetGroup === "JH"
                      ? "bg-purple-600 text-white shadow-sm ring-2 ring-purple-200"
                      : "bg-purple-50/80 text-purple-700 hover:bg-purple-100 border border-purple-200"
                  }`}
                >
                  <Wrench className="w-4 h-4" />
                  <span>26–50+ JH Checksheets</span>
                  <span
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      checksheetGroup === "JH"
                        ? "bg-white/20 text-white font-bold"
                        : "bg-purple-200 text-purple-900 font-semibold"
                    }`}
                  >
                    {jhDone} / {countJH}
                  </span>
                </button>

                <button
                  onClick={() => setChecksheetGroup("ALL")}
                  className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    checksheetGroup === "ALL"
                      ? "bg-slate-900 text-white shadow-sm"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200"
                  }`}
                >
                  All ({checkSheets.length})
                </button>
              </div>

              {/* Search Bar & Refresh */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by code or machine..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-2xs"
                  />
                </div>
                <button
                  onClick={fetchData}
                  disabled={loading}
                  className="p-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all cursor-pointer shadow-2xs"
                  title="Refresh Tasks"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
                </button>
              </div>
            </div>

            {/* Secondary Status Filter Pills (Action Required / Completed / All) */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setChecksheetTab("DUE")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  checksheetTab === "DUE"
                    ? "bg-amber-500 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Clock className="w-3 h-3" />
                <span>Action Required</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${checksheetTab === "DUE" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {dueCount}
                </span>
              </button>

              <button
                onClick={() => setChecksheetTab("COMPLETED")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  checksheetTab === "COMPLETED"
                    ? "bg-indigo-600 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <CheckCircle2 className="w-3 h-3" />
                <span>Completed</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${checksheetTab === "COMPLETED" ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                  {completedCount}
                </span>
              </button>

              <button
                onClick={() => setChecksheetTab("ALL")}
                className={`flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  checksheetTab === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>All Status</span>
              </button>
            </div>
          </div>

          {/* Check Sheet Task Cards Grid */}
          {loading ? (
            <div className="py-20 text-center space-y-3 bg-white rounded-2xl border border-slate-200">
              <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Loading scheduled check sheets...</p>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 space-y-3 shadow-xs">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto opacity-80" />
              <h3 className="text-base font-bold text-slate-900">All Scheduled Tasks Clear</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {checksheetTab === "DUE"
                  ? "No pending check sheets found in this group! Good job on maintaining full compliance."
                  : "No check sheets found matching the current criteria."}
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
                        {task.group === "MAIN" ? "0–25 Main" : "26–50+ JH"}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${task.statusColor}`}>
                        {task.statusLabel}
                      </span>
                    </div>

                    {/* Title */}
                    <div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-xs font-mono font-bold text-indigo-600">{task.code}</span>
                        <span className="text-[10px] text-slate-400">• {task.frequency || "Daily"}</span>
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
                          {typeof task.department === "object" ? task.department?.name : task.department || "Canteen Main Kitchen"}
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
      )}

      {/* C. OPERATOR 3 WORKSPACE: TEA DISTRIBUTION & WASTAGE SNAPSHOT */}
      {isOp3 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">Today's Shop Floor Tea Logistics</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  Liters Accounting
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Kettle distribution across Shift 1 Morning &amp; Afternoon, Shift 2, and other plant offices.
              </p>
            </div>

            <Link href="/operator/tea-delivery">
              <button className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                <Coffee className="w-4 h-4" />
                <span>Open Tea Delivery Console</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Delivered Liters</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {teaSummary?.totalDeliveredLiters || 0} L
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Shop floor dispatch</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-500 font-medium">Returned Liters</div>
              <div className="text-2xl font-bold text-slate-900 mt-1 font-mono">
                {teaSummary?.totalReturnedLiters || 0} L
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Unconsumed kettle tea</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-emerald-700 font-medium">Net Consumed</div>
              <div className="text-2xl font-bold text-emerald-700 mt-1 font-mono">
                {teaSummary?.totalConsumedLiters || 0} L
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Floor consumption</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-rose-700 font-medium">Wastage</div>
              <div className="text-2xl font-bold text-rose-700 mt-1 font-mono">
                {teaSummary?.totalWasteLiters || 0} L
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Discarded or cold</div>
            </div>
          </div>
        </div>
      )}

      {/* D. OT SUPERVISOR WORKSPACE: OVERTIME (OT) SNAPSHOT */}
      {isOT && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900">
                  {currentUser?.department?.name || "Department"} Overtime Log
                </h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Locked Department
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Record shift overtime attendance for your personnel. Slots: 2-Hour and 3-Hour Overtime.
              </p>
            </div>

            <Link href="/operator/overtime">
              <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer">
                <Clock className="w-4 h-4" />
                <span>Open Overtime Register</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
              <div className="text-xs text-blue-700 font-medium">2-Hour OT Count</div>
              <div className="text-3xl font-extrabold text-blue-900 mt-1 font-mono">
                {otSummary?.totalTwoHourCount || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Workers on 2-hour slot</div>
            </div>

            <div className="p-4 rounded-xl border border-purple-200 bg-purple-50/50">
              <div className="text-xs text-purple-700 font-medium">3-Hour OT Count</div>
              <div className="text-3xl font-extrabold text-purple-900 mt-1 font-mono">
                {otSummary?.totalThreeHourCount || 0}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Workers on 3-hour slot</div>
            </div>

            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="text-xs text-slate-600 font-medium">Total OT Personnel</div>
              <div className="text-3xl font-extrabold text-slate-900 mt-1 font-mono">
                {(otSummary?.totalTwoHourCount || 0) + (otSummary?.totalThreeHourCount || 0)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Active overtime headcount</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

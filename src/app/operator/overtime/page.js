"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LoaderBlock, Spinner } from "@/components/ui/loader";
import {
  Clock,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  Building2,
  Sparkles,
  Save,
  RotateCcw,
  ShieldCheck,
  AlertCircle,
  TrendingUp,
  FileText,
  Lock,
} from "lucide-react";

const SHIFTS = [
  { id: "GENERAL", name: "General Shift", hours: "08:30 - 17:00", description: "General factory timing" },
  { id: "SHIFT_1", name: "Shift 1", hours: "06:00 - 14:00", description: "Morning production shift" },
  { id: "SHIFT_2", name: "Shift 2", hours: "14:00 - 22:00", description: "Afternoon production shift" },
  { id: "SHIFT_3", name: "Shift 3", hours: "22:00 - 06:00", description: "Night production shift" },
];

export default function OvertimeOperatorPage() {
  const [date, setDate] = useState("");
  const [selectedShift, setSelectedShift] = useState("GENERAL");
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [twoHourCount, setTwoHourCount] = useState(0);
  const [threeHourCount, setThreeHourCount] = useState(0);
  const [notes, setNotes] = useState("");

  const [currentUser, setCurrentUser] = useState(null);
  const [isSupervisorLocked, setIsSupervisorLocked] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Fetch current user and overtime data
  const fetchData = async () => {
    if (!date) return;
    setLoading(true);
    setFeedback(null);
    try {
      // 1. Fetch user profile
      const meRes = await fetch("/api/auth/me").then((r) => r.json()).catch(() => ({}));
      if (meRes?.user) {
        setCurrentUser(meRes.user);
        const isSupervisor = meRes.user.role?.code === "OT_SUPERVISOR";
        setIsSupervisorLocked(isSupervisor);
        if (isSupervisor && meRes.user.department?._id) {
          setSelectedDeptId(meRes.user.department._id);
        }
      }

      // 2. Fetch overtime logs for date
      const otRes = await fetch(`/api/overtime?date=${date}`).then((r) => r.json()).catch(() => ({}));
      if (otRes?.success) {
        setLogs(otRes.logs || []);
        setSummary(otRes.summary || null);
        setDepartments(otRes.departments || []);

        // If not locked and no dept selected yet, select first dept
        if (!selectedDeptId && otRes.departments?.length > 0) {
          const defaultDept = otRes.currentUserDepartment?._id || otRes.departments[0]._id;
          setSelectedDeptId(defaultDept);
        }

        // Hydrate current form if log exists for active dept & shift
        const activeDeptId = meRes?.user?.department?._id || selectedDeptId || otRes.departments?.[0]?._id;
        const existingLog = (otRes.logs || []).find(
          (l) =>
            (l.department?._id === activeDeptId || l.department === activeDeptId) &&
            l.shift === selectedShift
        );

        if (existingLog) {
          setTwoHourCount(existingLog.twoHourCount || 0);
          setThreeHourCount(existingLog.threeHourCount || 0);
          setNotes(existingLog.notes || "");
        } else {
          setTwoHourCount(0);
          setThreeHourCount(0);
          setNotes("");
        }
      }
    } catch (e) {
      console.error("Failed to load overtime data:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date, selectedShift, selectedDeptId]);

  const parsed2hr = Math.max(0, Number(twoHourCount) || 0);
  const parsed3hr = Math.max(0, Number(threeHourCount) || 0);
  const totalOvertime = parsed2hr + parsed3hr;

  const handleSave = async (e) => {
    e?.preventDefault();
    if (!date) return;
    if (!selectedDeptId) {
      setFeedback({ type: "error", text: "Please select a department." });
      return;
    }

    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/overtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: selectedShift,
          departmentId: selectedDeptId,
          twoHourCount: parsed2hr,
          threeHourCount: parsed3hr,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback({
          type: "success",
          text: `Overtime record committed! Total: ${totalOvertime} workers logged (${parsed2hr} for 2-Hr OT, ${parsed3hr} for 3-Hr OT).`,
        });
        fetchData();
      } else {
        setFeedback({ type: "error", text: json.error || "Failed to save overtime log." });
      }
    } catch (err) {
      setFeedback({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const activeDepartment = departments.find((d) => d._id === selectedDeptId);

  if (currentUser && ["OPERATOR_1", "OPERATOR_2", "OPERATOR_3"].includes(currentUser.role?.code)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Overtime Register Restricted</h2>
        <p className="text-xs text-slate-600">
          Department Overtime (OT) registration is managed exclusively by designated <b>OT Supervisors</b>.
          You are currently signed in as <b>{currentUser.name} ({currentUser.role?.name})</b>.
        </p>
        <Link href={currentUser.role?.code === "OPERATOR_1" ? "/operator/counters" : currentUser.role?.code === "OPERATOR_2" ? "/operator/checksheets" : "/operator/tea-delivery"}>
          <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            Go to Your Assigned Workspace →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER BANNER */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
              Department Overtime Terminal
            </span>
            {isSupervisorLocked && (
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-500" />
                Department Locked
              </span>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Clock className="w-7 h-7 text-blue-600" />
            <span>Overtime (OT) Headcount Entry</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Fast 30-second logging for factory floor 2-Hour and 3-Hour overtime headcount to allocate canteen tea &amp; snacks.
          </p>
        </div>

        {/* DATE & REFRESH */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-2xs">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="text-slate-500 font-medium">Date:</span>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-900 font-mono text-xs font-bold focus:outline-none cursor-pointer"
            />
          </div>

          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Refresh">
            <RotateCcw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between shadow-xs ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2 font-medium">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{feedback.text}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="font-bold hover:underline ml-4">
            ✕
          </button>
        </div>
      )}

      {/* OVERVIEW METRICS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-200/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">2-Hour OT</span>
            <Clock className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-950 font-mono mt-1">
            {summary?.totalTwoHour || 0}
          </div>
          <p className="text-[10px] text-blue-700/80 mt-0.5">Workers staying for 2 hours</p>
        </div>

        <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-200/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">3-Hour OT</span>
            <TrendingUp className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-indigo-950 font-mono mt-1">
            {summary?.totalThreeHour || 0}
          </div>
          <p className="text-[10px] text-indigo-700/80 mt-0.5">Workers staying for 3 hours</p>
        </div>

        <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Total OT Pool</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-950 font-mono mt-1">
            {summary?.grandTotal || 0}
          </div>
          <p className="text-[10px] text-emerald-700/80 mt-0.5">Total factory overtime headcount</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Bays Logged</span>
            <Building2 className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-950 font-mono mt-1">
            {summary?.departmentsLogged || 0} / {summary?.totalDepartments || 6}
          </div>
          <p className="text-[10px] text-purple-700/80 mt-0.5">Departments submitted today</p>
        </div>
      </div>

      {/* SHIFT SELECTION TABS */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
          Select Applicable Factory Shift
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {SHIFTS.map((s) => {
            const isSelected = selectedShift === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedShift(s.id)}
                className={`p-3 rounded-xl border text-left transition cursor-pointer ${
                  isSelected
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-200"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                }`}
              >
                <div className="font-bold text-xs">{s.name}</div>
                <div className={`text-[10px] font-mono mt-0.5 ${isSelected ? "text-blue-100" : "text-slate-500"}`}>
                  {s.hours}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN FORM & TODAY'S LOGS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FAST-FILL OT ENTRY FORM (COL-SPAN-2) */}
        <Card className="lg:col-span-2 p-6 space-y-6 shadow-xs border-blue-100 bg-gradient-to-b from-blue-50/20 via-white to-white">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-md">
                Fast 30s Entry
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                Log Overtime Headcount
              </h2>
              <p className="text-xs text-slate-500">
                Department: <b className="text-slate-800">{activeDepartment?.name || "Select Department"}</b> | Shift:{" "}
                <b className="text-slate-800">{selectedShift}</b>
              </p>
            </div>

            {/* Department selector (Dropdown if Admin, Locked badge if Supervisor) */}
            {isSupervisorLocked ? (
              <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-800">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>{currentUser?.department?.name || "Assigned Department"}</span>
                <Lock className="w-3.5 h-3.5 text-slate-400" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-600">Department:</span>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <form onSubmit={handleSave} className="space-y-6">
            {/* 2-HOUR & 3-HOUR OT INPUT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 2-HOUR OT CARD */}
              <div className="p-4 rounded-2xl bg-white border-2 border-blue-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    2-Hour Overtime
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-100">
                    +2 Hours
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Workers staying 2 additional hours after shift completion.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setTwoHourCount((c) => Math.max(0, Number(c) - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="0"
                    value={twoHourCount}
                    onChange={(e) => setTwoHourCount(e.target.value)}
                    className="font-mono text-2xl font-extrabold text-center text-blue-900 h-12"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setTwoHourCount((c) => Number(c) + 1)}
                    className="w-10 h-10 rounded-xl bg-blue-50 hover:bg-blue-100 font-bold text-blue-700 flex items-center justify-center text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3-HOUR OT CARD */}
              <div className="p-4 rounded-2xl bg-white border-2 border-indigo-200/80 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    3-Hour Overtime
                  </span>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-800 border border-indigo-100">
                    +3 Hours
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Workers staying 3 additional hours after shift completion.
                </p>

                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setThreeHourCount((c) => Math.max(0, Number(c) - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700 flex items-center justify-center text-lg cursor-pointer"
                  >
                    -
                  </button>
                  <Input
                    type="number"
                    min="0"
                    value={threeHourCount}
                    onChange={(e) => setThreeHourCount(e.target.value)}
                    className="font-mono text-2xl font-extrabold text-center text-indigo-900 h-12"
                    placeholder="0"
                  />
                  <button
                    type="button"
                    onClick={() => setThreeHourCount((c) => Number(c) + 1)}
                    className="w-10 h-10 rounded-xl bg-indigo-50 hover:bg-indigo-100 font-bold text-indigo-700 flex items-center justify-center text-lg cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* DYNAMIC AUTO-TOTAL & MEAL ESTIMATION BANNER */}
            <div className="bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-emerald-500/10 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  Total Department Overtime Headcount
                </span>
                <div className="text-2xl font-extrabold text-slate-900 font-mono mt-0.5">
                  {totalOvertime} Workers
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Breakdown: <b className="text-blue-700">{parsed2hr} (2-Hour)</b> +{" "}
                  <b className="text-indigo-700">{parsed3hr} (3-Hour)</b>
                </p>
              </div>

              <div className="text-right sm:text-right">
                <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full border border-emerald-200">
                  {totalOvertime} Refreshment Packs Allocated
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Canteen hub automatically alerted</p>
              </div>
            </div>

            {/* OPERATIONAL NOTES */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                Operational Notes / Reason (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Engine line assembly bottleneck clearance or urgent export batch"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="bg-white"
              />
            </div>

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={saving}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-sm shadow-sm cursor-pointer"
            >
              {saving ? (
                <Spinner className="mr-2" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
              )}
              <span>Commit Overtime Headcount ({totalOvertime} Workers)</span>
            </Button>
          </form>
        </Card>

        {/* TODAY'S FACTORY OVERTIME SUMMARY & ACTIVITY (COL-SPAN-1) */}
        <div className="space-y-4">
          <Card className="p-5 bg-white border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Today&apos;s Department Log
                </h3>
                <p className="text-[11px] text-slate-500">Live submissions for {date}</p>
              </div>
              <Badge variant="outline" className="text-blue-700 border-blue-200 bg-blue-50 text-[10px]">
                {logs.length} Logged
              </Badge>
            </div>

            {logs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No overtime records logged yet for this date.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
                {logs.map((l) => (
                  <div
                    key={l._id}
                    className="p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100 transition text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{l.departmentName || "Department"}</span>
                      <span className="font-mono font-bold text-blue-700 bg-blue-100/70 px-1.5 py-0.2 rounded text-[10px]">
                        {l.shift}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-slate-600 text-[11px]">
                      <span>2h: <b className="text-slate-800">{l.twoHourCount}</b> | 3h: <b className="text-slate-800">{l.threeHourCount}</b></span>
                      <span className="font-bold text-emerald-700 font-mono">Total: {l.totalCount}</span>
                    </div>

                    <div className="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-200/60">
                      <span>By: {l.loggedBy || "Supervisor"}</span>
                      <span>{new Date(l.updatedAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* HELP & POLICY CARD */}
          <div className="rounded-2xl p-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white text-xs space-y-2 shadow-xs">
            <div className="flex items-center gap-1.5 font-bold text-blue-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Overtime Policy &amp; SLA</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              OT headcounts must be submitted before 15:30 IST for General Shift &amp; Shift 1 to ensure hot tea, biscuits, and canteen snacks are prepared on time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

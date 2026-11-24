"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  CalendarDays,
  RefreshCw,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Camera,
  Layers,
  Thermometer,
  Zap,
} from "lucide-react";

export default function StatusMonitoringPage() {
  const [data, setData] = useState({
    activeShift: { name: "Shift A (Morning)", code: "SHIFT_A", window: "06:00 – 14:00", elapsedPct: 82 },
    checklistRoster: [],
    departmentMetrics: [],
    liveIncidents: [],
  });
  const [loading, setLoading] = useState(true);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const [csRes, subRes] = await Promise.all([
        fetch("/api/checksheets").then((r) => r.json()).catch(() => ({})),
        fetch("/api/submissions").then((r) => r.json()).catch(() => ({})),
      ]);

      const checkSheets = csRes.checkSheets || [];
      const submissions = subRes.submissions || [];

      // Map each check sheet to its live execution status in Shift A
      const roster = checkSheets.map((cs) => {
        const sub = submissions.find((s) => s.checkSheet?._id === cs._id || s.checkSheet?.code === cs.code);
        let status = "SCHEDULED";
        let executionTime = null;
        let operatorName = null;

        if (sub) {
          if (sub.status === "APPROVED") status = "COMPLETED";
          else if (sub.status === "REJECTED") status = "RECTIFY_REQUIRED";
          else status = "IN_REVIEW";
          executionTime = new Date(sub.submissionDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
          operatorName = sub.submittedBy?.name;
        }

        return {
          _id: cs._id,
          code: cs.code,
          title: cs.title,
          department: cs.department?.name || "Kitchen",
          frequency: cs.frequency,
          status,
          executionTime,
          operatorName: operatorName || "Assigned Line Operator",
          slaHours: cs.slaHours || 2,
        };
      });

      setData({
        activeShift: { name: "Shift A (Morning)", code: "SHIFT_A", window: "06:00 – 14:00", elapsedPct: 82 },
        checklistRoster: roster,
        departmentMetrics: [
          { name: "Canteen Main Kitchen", completed: 8, total: 8, score: 99.8, status: "Normal" },
          { name: "Bakery & Confectionery", completed: 3, total: 3, score: 100, status: "Normal" },
          { name: "Cold Storage & Raw Materials", completed: 3, total: 4, score: 97.5, status: "Check Pending" },
          { name: "Dining Hall & Sanitization", completed: 6, total: 6, score: 100, status: "Normal" },
        ],
        liveIncidents: [
          {
            title: "Walk-in Freezer Temp SLA Approaching",
            desc: "Cold storage check sheet CS-COLD-02 due in 35 minutes.",
            severity: "warning",
            time: "10m ago",
          },
          {
            title: "Deep Fryer TPM Validated (14.5%)",
            desc: "Kitchen cooking oil tested within ISO safe limits.",
            severity: "success",
            time: "24m ago",
          },
        ],
      });
    } catch (err) {
      console.error("Status fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // 30s auto-refresh
    return () => clearInterval(interval);
  }, []);

  const getStatusBadge = (status) => {
    switch (status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
            <CheckCircle2 className="w-3 h-3" /> Completed & Verified
          </span>
        );
      case "IN_REVIEW":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
            <Clock className="w-3 h-3 text-[#CDFE02]" /> Pending Approval
          </span>
        );
      case "RECTIFY_REQUIRED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Action Required
          </span>
        );
      case "SCHEDULED":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-zinc-400 border border-white/10">
            <Clock className="w-3 h-3 text-zinc-500" /> Scheduled
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Real-Time Operational Command Center
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 6
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Live shift execution monitoring, SLA deadlines, sensor status, and automated handover readiness across all departments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400">
            <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
            Live 30s Telemetry Poll
          </span>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Poll Now</span>
          </button>
        </div>
      </div>

      {/* Active Shift Hero Command Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#5733F0]/25 via-[#16161E] to-[#101014] border border-white/10 p-6 overflow-hidden">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#CDFE02]" />
                {data.activeShift.name} ({data.activeShift.window})
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300">
                Akurdi Facility • Unit 04
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
                Supervisor: Rajesh Sharma (BAJAJ-SUP-01)
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-white tracking-tight">
              Shift A Operational Window Active
            </h2>
            <p className="text-xs text-zinc-400 max-w-xl">
              Breakfast & lunch meal distribution completed. Afternoon cold-chain checks and dinner preparation underway.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-2 min-w-[220px]">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400">Shift Elapsed</span>
              <strong className="text-white font-mono">{data.activeShift.elapsedPct}%</strong>
            </div>
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#5733F0] to-[#CDFE02] rounded-full"
                style={{ width: `${data.activeShift.elapsedPct}%` }}
              />
            </div>
            <div className="text-[10px] text-zinc-500 text-right">Handover to Shift B in 1h 18m</div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Command View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Shift Checklist Board (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#CDFE02]" />
              Shift A Execution Roster & Live Status
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              {data.checklistRoster.filter((r) => r.status === "COMPLETED").length} of {data.checklistRoster.length} Verified
            </span>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                    <th className="py-3 px-4 font-semibold">Check Sheet</th>
                    <th className="py-3 px-4 font-semibold">Department</th>
                    <th className="py-3 px-4 font-semibold">Executed At</th>
                    <th className="py-3 px-4 font-semibold">Assigned Staff</th>
                    <th className="py-3 px-4 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        Polling live operational roster...
                      </td>
                    </tr>
                  ) : (
                    data.checklistRoster.map((item) => (
                      <tr key={item._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-white">{item.title}</div>
                          <div className="text-[10px] text-zinc-500 font-mono">{item.code}</div>
                        </td>

                        <td className="py-3 px-4 text-zinc-300">{item.department}</td>

                        <td className="py-3 px-4 font-mono text-zinc-400">
                          {item.executionTime ? item.executionTime : <span className="text-zinc-600">Pending</span>}
                        </td>

                        <td className="py-3 px-4 text-zinc-300">{item.operatorName}</td>

                        <td className="py-3 px-4 text-right">{getStatusBadge(item.status)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Department Health & Live Incident Triage (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Department Compliance Health */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#5733F0]" />
                Facility Health Index
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#CDFE02]/15 text-[#CDFE02] font-bold">
                99.3% Avg
              </span>
            </div>

            <div className="space-y-3">
              {data.departmentMetrics.map((dept, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-2"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-white">{dept.name}</span>
                    <span className="font-mono text-[#CDFE02]">{dept.score}%</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-zinc-400">
                    <span>{dept.completed}/{dept.total} Checks Completed</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/5 text-zinc-300">
                      {dept.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Live Incident Stream */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Operational Alerts & SLA Watch
            </h3>

            <div className="space-y-2.5">
              {data.liveIncidents.map((inc, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    inc.severity === "warning"
                      ? "bg-amber-500/10 border-amber-500/30 text-amber-200"
                      : "bg-[#CDFE02]/10 border-[#CDFE02]/30 text-zinc-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{inc.title}</span>
                    <span className="text-[10px] text-zinc-400 font-normal">{inc.time}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{inc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Coffee,
  Plus,
  Calendar,
  Building2,
  Trash2,
  FileDown,
  RefreshCw,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function TeaCountPage() {
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedDeptId, setSelectedDeptId] = useState("");
  const [session, setSession] = useState("MORNING");
  const [count, setCount] = useState(100);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchTeaCounts = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tea-count?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        if (json.departments?.length > 0 && !selectedDeptId) {
          setSelectedDeptId(json.departments[0]._id);
        }
      }
    } catch (e) {
      console.error("Failed to fetch tea counts:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeaCounts();
  }, [date]);

  const handleSaveTeaCount = async (e) => {
    e.preventDefault();
    if (!selectedDeptId || count === undefined) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/tea-count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          departmentId: selectedDeptId,
          date,
          session,
          count: Number(count),
          notes,
          loggedBy: "Canteen Admin",
        }),
      });
      if (res.ok) {
        setModalOpen(false);
        setNotes("");
        fetchTeaCounts();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this tea count record?")) return;
    try {
      const res = await fetch(`/api/tea-count?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchTeaCounts();
    } catch (e) {
      console.error(e);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (!data?.records || data.records.length === 0) return;
    const headers = ["Department", "Date", "Session", "Count (Cups)", "Status", "Notes"];
    const rows = data.records.map((r) => [
      `"${r.departmentName}"`,
      r.date,
      r.session,
      r.count,
      r.deliveryStatus,
      `"${r.notes || ""}"`,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bajaj_Canteen_Tea_Count_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalCups = data?.totalCupsToday || 0;
  const deptTotals = data?.deptTotals || {};

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Department-Wise Tea Distribution (Point 9)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <Coffee className="w-7 h-7 text-[#CDFE02]" />
            <span>Department Tea Count</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Live cup counts delivered to factory lines (Engine Assembly, Vehicle Assembly, Machine Shop, etc.).
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-[#141418] border border-white/10 rounded-xl px-3 py-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span className="text-zinc-400 text-[11px]">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-white font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition shadow-lg shadow-[#5733F0]/25"
          >
            <Plus className="w-4 h-4 text-[#CDFE02]" />
            <span>+ Log Tea Count</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-medium text-xs transition border border-white/10"
          >
            <FileDown className="w-4 h-4 text-emerald-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchTeaCounts}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* TOP TOTAL BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Total Tea Served ({date})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#CDFE02] font-mono">{totalCups}</span>
            <span className="text-xs text-zinc-400">Cups Total</span>
          </div>
        </div>

        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Highest Consuming Dept
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-white truncate">
              {Object.keys(deptTotals)[0] || "Engine Assembly"}
            </span>
            <span className="text-xs text-emerald-400 font-mono font-bold">
              ({Object.values(deptTotals)[0] || 0} cups)
            </span>
          </div>
        </div>

        <div className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Departments Served
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white font-mono">
              {Object.keys(deptTotals).length}
            </span>
            <span className="text-xs text-zinc-400">Lines Active</span>
          </div>
        </div>
      </div>

      {/* DEPARTMENT-WISE CARDS SUMMARY */}
      <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#CDFE02]" />
            <h3 className="font-bold text-white text-sm">Department-wise Breakdown ({date})</h3>
          </div>
          <span className="text-xs text-zinc-400 font-mono">
            {Object.keys(deptTotals).length} Departments
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {Object.entries(deptTotals).map(([deptName, cups], idx) => {
            const max = Math.max(...Object.values(deptTotals), 1);
            const pct = Math.round((cups / max) * 100);

            return (
              <div
                key={idx}
                className="p-4 rounded-xl bg-[#09090C] border border-white/5 space-y-2 hover:border-white/20 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white text-xs truncate">{deptName}</span>
                  <span className="font-mono font-extrabold text-[#CDFE02] text-sm">{cups} cups</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#5733F0] to-[#CDFE02] h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1">
                  <span>Factory Bay Line</span>
                  <span className="text-emerald-400 font-medium">✓ Logged & Delivered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED LOGS TABLE */}
      <div className="bg-[#141418] border border-white/10 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-bold text-white text-sm">Individual Tea Log Entries ({date})</h3>
          <span className="text-xs text-zinc-400">Showing {data?.records?.length || 0} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#09090C] text-zinc-400 font-semibold border-b border-white/5 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Session</th>
                <th className="py-3 px-4">Cups Count</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Logged By</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Loading tea counts...
                  </td>
                </tr>
              ) : !data?.records || data.records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No tea count logged for this date. Click "+ Log Tea Count" above to add.
                  </td>
                </tr>
              ) : (
                data.records.map((r) => (
                  <tr key={r._id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 px-4 font-semibold text-white flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {r.departmentName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
                        {r.session}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-[#CDFE02] text-sm">
                      {r.count}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-400">
                        <CheckCircle2 className="w-3 h-3" />
                        {r.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-400">{r.loggedBy || "Canteen Staff"}</td>
                    <td className="py-3 px-4 text-zinc-400 truncate max-w-xs">{r.notes || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1 rounded text-zinc-500 hover:text-red-400 transition"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* LOG TEA MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Coffee className="w-4 h-4 text-[#CDFE02]" />
                <span>Log Department Tea Count</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeaCount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Factory Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  required
                >
                  {data?.departments?.map((dept) => (
                    <option key={dept._id} value={dept._id}>
                      {dept.name} ({dept.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Session
                  </label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="MORNING">Morning Tea</option>
                    <option value="EVENING">Evening Tea</option>
                    <option value="NIGHT">Night Shift</option>
                    <option value="SPECIAL">Special Batch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Number of Tea Cups
                </label>
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                  placeholder="e.g. 150"
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Line 2 extra tea requested"
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition"
                >
                  {submitting ? "Saving..." : "Save Record"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

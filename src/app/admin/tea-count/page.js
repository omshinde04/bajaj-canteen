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
  CheckCircle2,
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Department-Wise Tea Distribution (Point 9)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Coffee className="w-7 h-7 text-indigo-600" />
            <span>Department Tea Count</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Live cup counts delivered to factory lines (Engine Assembly, Vehicle Assembly, Machine Shop, etc.).
          </p>
        </div>

        {/* Date Selector & Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[11px] font-medium">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Log Tea Count</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs transition border border-slate-200 shadow-xs"
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={fetchTeaCounts}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-900 transition border border-slate-200 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* TOP TOTAL BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tea Served ({date})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 font-mono">{totalCups}</span>
            <span className="text-xs text-slate-500">Cups Total</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Highest Consuming Dept
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-slate-900 truncate">
              {Object.keys(deptTotals)[0] || "Engine Assembly"}
            </span>
            <span className="text-xs text-emerald-600 font-mono font-bold">
              ({Object.values(deptTotals)[0] || 0} cups)
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-1 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Departments Served
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {Object.keys(deptTotals).length}
            </span>
            <span className="text-xs text-slate-500">Lines Active</span>
          </div>
        </div>
      </div>

      {/* DEPARTMENT-WISE CARDS SUMMARY */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-slate-900 text-sm">Department-wise Breakdown ({date})</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
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
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 hover:border-slate-300 transition"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-xs truncate">{deptName}</span>
                  <span className="font-mono font-extrabold text-indigo-600 text-sm">{cups} cups</span>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-600 h-full rounded-full"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                  <span>Factory Bay Line</span>
                  <span className="text-emerald-600 font-semibold">✓ Logged & Delivered</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* DETAILED LOGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <h3 className="font-bold text-slate-900 text-sm">Individual Tea Log Entries ({date})</h3>
          <span className="text-xs text-slate-500">Showing {data?.records?.length || 0} entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[10px]">
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
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading tea counts...
                  </td>
                </tr>
              ) : !data?.records || data.records.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No tea count logged for this date. Click &quot;+ Log Tea Count&quot; above to add.
                  </td>
                </tr>
              ) : (
                data.records.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4 font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {r.departmentName}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {r.session}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-extrabold text-indigo-600 text-sm">
                      {r.count}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-600">
                        <CheckCircle2 className="w-3 h-3" />
                        {r.deliveryStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">{r.loggedBy || "Canteen Staff"}</td>
                    <td className="py-3 px-4 text-slate-500 truncate max-w-xs">{r.notes || "-"}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleDelete(r._id)}
                        className="p-1 rounded text-slate-400 hover:text-rose-600 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Coffee className="w-4 h-4 text-indigo-600" />
                <span>Log Department Tea Count</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveTeaCount} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Factory Department
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    Date
                  </label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    Session
                  </label>
                  <select
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="MORNING">Morning Tea</option>
                    <option value="EVENING">Evening Tea</option>
                    <option value="NIGHT">Night Shift</option>
                    <option value="SPECIAL">Special Batch</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Number of Tea Cups
                </label>
                <input
                  type="number"
                  min="0"
                  value={count}
                  onChange={(e) => setCount(e.target.value)}
                  required
                  placeholder="e.g. 150"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Remarks / Notes (Optional)
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Line 2 extra tea requested"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
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

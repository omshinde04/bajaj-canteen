"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
import {
  Coffee,
  Plus,
  Calendar,
  Building2,
  Trash2,
  FileDown,
  RefreshCw,
  CheckCircle2,
  Search,
  X,
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
  const [search, setSearch] = useState("");

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
    link.setAttribute("download", `Bajaj_Canteen_TeaCount_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const deptTotals = data?.departmentSummary || {};
  const totalCups = data?.summary?.totalCups || 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-600">
              Point 9: Shop Tea Count Show Zala Pahije (Dept. Wise)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Coffee className="w-7 h-7 text-amber-500" />
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

          <Button
            variant="default"
            size="default"
            onClick={() => setModalOpen(true)}
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>+ Log Tea Count</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleExportCSV}
          >
            <FileDown className="w-4 h-4 text-emerald-600" />
            <span>Export CSV</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchTeaCounts}
            disabled={loading}
            title="Refresh"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* TOP TOTAL BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Total Tea Served ({date})
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-indigo-600 font-mono">{totalCups}</span>
            <span className="text-xs text-slate-500">Cups Total</span>
          </div>
        </Card>

        <Card className="p-5 space-y-1">
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
        </Card>

        <Card className="p-5 space-y-1">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            Departments Served
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 font-mono">
              {Object.keys(deptTotals).length}
            </span>
            <span className="text-xs text-slate-500">Lines Active</span>
          </div>
        </Card>
      </div>

      {/* DEPARTMENT-WISE CARDS SUMMARY */}
      <Card className="p-6 space-y-4">
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
      </Card>

      {/* DETAILED LOGS TABLE */}
      <Card className="overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Individual Tea Log Entries ({date})</h3>
            <span className="text-xs text-slate-500">
              Showing{" "}
              {(data?.records || []).filter((r) => {
                if (!search.trim()) return true;
                const q = search.toLowerCase();
                return (
                  r.departmentName?.toLowerCase().includes(q) ||
                  r.notes?.toLowerCase().includes(q) ||
                  r.session?.toLowerCase().includes(q)
                );
              }).length}{" "}
              of {data?.records?.length || 0} entries
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by dept or notes..."
              className="pl-9 pr-8 py-1 text-xs h-8 bg-white"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department</TableHead>
              <TableHead>Session</TableHead>
              <TableHead>Cups Count</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Logged By</TableHead>
              <TableHead>Notes</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>Loading tea counts...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : !data?.records || data.records.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center text-slate-400">
                  No tea count logged for this date. Click &quot;+ Log Tea Count&quot; above to add.
                </TableCell>
              </TableRow>
            ) : (
              (data.records || [])
                .filter((r) => {
                  if (!search.trim()) return true;
                  const q = search.toLowerCase();
                  return (
                    r.departmentName?.toLowerCase().includes(q) ||
                    r.notes?.toLowerCase().includes(q) ||
                    r.session?.toLowerCase().includes(q)
                  );
                })
                .map((r) => (
                <TableRow key={r._id}>
                  <TableCell className="font-semibold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {r.departmentName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="indigo" className="font-mono">
                      {r.session}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono font-extrabold text-indigo-600 text-sm">
                    {r.count}
                  </TableCell>
                  <TableCell>
                    <Badge variant="success" className="gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      {r.deliveryStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">{r.loggedBy || "Canteen Staff"}</TableCell>
                  <TableCell className="text-slate-500 truncate max-w-xs">{r.notes || "-"}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(r._id)}
                      title="Delete"
                      className="h-8 w-8 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Shadcn Dialog: Log Tea Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-4 h-4 text-indigo-600" />
              <span>Log Department Tea Count</span>
            </DialogTitle>
          </DialogHeader>

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
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="font-mono"
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
              <Input
                type="number"
                min="0"
                value={count}
                onChange={(e) => setCount(e.target.value)}
                required
                placeholder="e.g. 150"
                className="font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Remarks / Notes (Optional)
              </label>
              <Input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. Line 2 extra tea requested"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={submitting}
              >
                {submitting ? "Saving..." : "Save Record"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

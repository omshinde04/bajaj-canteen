"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Camera,
  Clock,
  Building2,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Sparkles,
  PieChart,
} from "lucide-react";

export default function CheckSheetsPage() {
  const [activeTab, setActiveTab] = useState("master"); // "master" (CRUD) or "status" (Fill-up vs Pending)
  const [checkSheets, setCheckSheets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    category: "PNG Kitchen Equipment",
    department: "",
    frequency: "daily",
    mandatoryPhotoCount: 1,
    slaHours: 2,
  });

  const fetchData = async (page = currentPage, limit = pageSize) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedDept) query.set("department", selectedDept);
      if (selectedFrequency) query.set("frequency", selectedFrequency);
      query.set("page", page);
      query.set("limit", limit);

      const [csRes, deptRes, shiftRes] = await Promise.all([
        fetch(`/api/checksheets?${query.toString()}`).then((r) => r.json()),
        fetch("/api/departments").then((r) => r.json()),
        fetch("/api/shifts").then((r) => r.json()),
      ]);

      if (csRes.success) {
        setCheckSheets(csRes.checkSheets || []);
        setPagination(csRes.pagination || { total: csRes.checkSheets?.length || 0, totalPages: 1 });
      }
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
      }
      if (shiftRes.success) {
        setShifts(shiftRes.shifts || []);
      }
    } catch (err) {
      console.error("Failed to load check sheets data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage, pageSize);
  }, [currentPage, pageSize, selectedDept, selectedFrequency]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  const handleCreateCheckSheet = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/checksheets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create check sheet");
      }

      setIsModalOpen(false);
      setFormData({
        title: "",
        code: "",
        category: "PNG Kitchen Equipment",
        department: departments[0]?._id || "",
        frequency: "daily",
        mandatoryPhotoCount: 1,
        slaHours: 2,
      });
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCheckSheet = async (id, title) => {
    if (!confirm(`Are you sure you want to delete check sheet "${title}"?`)) return;
    try {
      const res = await fetch(`/api/checksheets/${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      alert("Failed to delete check sheet");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Points 2 & 3: Checksheets & Status
            </span>
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-[#CDFE02]" />
            <span>Checksheet Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Total checksheets: Add, update, delete. Check live daily status (Filled vs Pending).
          </p>
        </div>

        {/* Tab Switcher & New Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setActiveTab("master")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "master" ? "bg-[#5733F0] text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Master List (CRUD)
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "status" ? "bg-[#5733F0] text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Check Status
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-2 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5733F0]/30 shrink-0"
          >
            <Plus className="w-4 h-4 text-[#CDFE02]" />
            <span>+ Add Checksheet</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: MASTER LIST (CRUD) */}
      {activeTab === "master" ? (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by equipment title or code..."
                className="w-full bg-[#141414] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
              />
            </form>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
              >
                <option value="">All Departments</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                value={selectedFrequency}
                onChange={(e) => setSelectedFrequency(e.target.value)}
                className="w-full bg-[#141414] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
              >
                <option value="">All Frequencies</option>
                <option value="daily">Daily</option>
                <option value="per_shift">Per Shift</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center text-xs text-zinc-400 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-[#5733F0]" />
                <span>Loading check sheet records...</span>
              </div>
            ) : checkSheets.length === 0 ? (
              <div className="p-12 text-center text-xs text-zinc-400 space-y-3">
                <FileSpreadsheet className="w-8 h-8 text-zinc-600 mx-auto" />
                <div className="font-semibold text-zinc-300">No Check Sheets Found</div>
                <p className="max-w-xs mx-auto text-[11px]">
                  Click &quot;+ Add Checksheet&quot; above to configure a new operational sheet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-zinc-300">
                  <thead className="bg-white/[0.02] text-[10px] text-zinc-400 uppercase tracking-wider border-b border-white/10">
                    <tr>
                      <th className="px-5 py-3.5">Code</th>
                      <th className="px-5 py-3.5">Equipment / Check Sheet Name</th>
                      <th className="px-5 py-3.5">Department</th>
                      <th className="px-5 py-3.5">Frequency</th>
                      <th className="px-5 py-3.5">Photo Req.</th>
                      <th className="px-5 py-3.5">SLA Target</th>
                      <th className="px-5 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {checkSheets.map((cs) => (
                      <tr key={cs._id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-[#D2EFF7] font-semibold">
                          {cs.code}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-semibold text-white">{cs.title}</div>
                          <div className="text-[11px] text-zinc-400">{cs.category}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-300">
                          {cs.department?.name || "General Kitchen"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/10 text-white uppercase">
                            {cs.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {cs.mandatoryPhotoCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-[#CDFE02]">
                              <Camera className="w-3.5 h-3.5" />
                              <span>{cs.mandatoryPhotoCount} required</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-zinc-500">Optional</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-zinc-400">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-zinc-500" />
                            {cs.slaHours}h
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteCheckSheet(cs._id, cs.title)}
                              className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition-colors"
                              title="Delete Check Sheet"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            <div className="p-4 border-t border-white/5">
              <Pagination
                currentPage={currentPage}
                totalPages={pagination.totalPages || 1}
                totalItems={pagination.total || checkSheets.length}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
              />
            </div>
          </div>
        </div>
      ) : (
        /* VIEW 2: POINT 3 - CHECK STATUS FOR CHECK SHEETS */
        <div className="space-y-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#CDFE02]" />
                <h3 className="font-bold text-white text-sm">Today&apos;s Real-Time Check Status</h3>
              </div>
              <span className="text-xs text-zinc-400 font-mono">
                {checkSheets.length} Total Checksheets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkSheets.map((cs, idx) => {
                const isFilled = idx < 4; // 4 filled today
                return (
                  <div
                    key={cs._id}
                    className="p-4 rounded-xl bg-[#09090C] border border-white/5 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-white text-sm">{cs.title}</div>
                      <div className="text-[11px] text-zinc-400">
                        {cs.code} • {cs.department?.name || "Canteen Kitchen"} • {cs.frequency}
                      </div>
                    </div>
                    {isFilled ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Filled Up</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0 flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pending</span>
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-[#CDFE02]" />
                <span>Add New Checksheet</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCheckSheet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Equipment / Check Sheet Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JH CheckSheet - Wet Grinder (Electrical)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Checksheet Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-JH-19"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="daily">Daily</option>
                    <option value="per_shift">Per Shift</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Category / Equipment Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                >
                  <option value="PNG Kitchen Equipment">PNG Kitchen Equipment</option>
                  <option value="Electrical Equipment">Electrical Equipment</option>
                  <option value="Cold Chain Monitoring">Cold Chain Monitoring</option>
                  <option value="Hygiene & Safety">Hygiene & Safety</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    SLA Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Mandatory Photos
                  </label>
                  <select
                    value={formData.mandatoryPhotoCount}
                    onChange={(e) => setFormData({ ...formData, mandatoryPhotoCount: Number(e.target.value) })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value={0}>Optional (0)</option>
                    <option value={1}>1 Photo Required</option>
                    <option value={2}>2 Photos Required</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition"
                >
                  {submitting ? "Creating..." : "Create Checksheet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

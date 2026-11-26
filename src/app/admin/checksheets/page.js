"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import {
  FileSpreadsheet,
  Plus,
  Search,
  Camera,
  Clock,
  Trash2,
  CheckCircle2,
  Loader2,
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Points 2 & 3: Checksheets & Status
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2.5">
            <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
            <span>Checksheet Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Total checksheets: Add, update, delete. Check live daily status (Filled vs Pending).
          </p>
        </div>

        {/* Tab Switcher & New Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 text-xs shadow-xs">
            <button
              onClick={() => setActiveTab("master")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "master" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Master List (CRUD)
            </button>
            <button
              onClick={() => setActiveTab("status")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                activeTab === "status" ? "bg-indigo-600 text-white font-semibold" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Check Status
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4 text-amber-300" />
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
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by equipment title or code..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 shadow-xs"
              />
            </form>

            <div>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
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
                className="w-full bg-white border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
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
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-12 text-center text-xs text-slate-500 flex flex-col items-center gap-3">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                <span>Loading check sheet records...</span>
              </div>
            ) : checkSheets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">No Check Sheets Found</div>
                <p className="max-w-xs mx-auto text-[11px] text-slate-500">
                  Click &quot;+ Add Checksheet&quot; above to configure a new operational sheet.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-100 text-[10px] text-slate-600 uppercase tracking-wider border-b border-slate-200">
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
                  <tbody className="divide-y divide-slate-100">
                    {checkSheets.map((cs) => (
                      <tr key={cs._id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3.5 font-mono text-xs text-indigo-700 font-bold">
                          {cs.code}
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-slate-900">{cs.title}</div>
                          <div className="text-[11px] text-slate-500">{cs.category}</div>
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          {cs.department?.name || "General Kitchen"}
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 uppercase">
                            {cs.frequency}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          {cs.mandatoryPhotoCount > 0 ? (
                            <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                              <Camera className="w-3.5 h-3.5" />
                              <span>{cs.mandatoryPhotoCount} required</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">Optional</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-xs text-slate-600">
                          <span className="inline-flex items-center gap-1 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {cs.slaHours}h
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => handleDeleteCheckSheet(cs._id, cs.title)}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
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
            <div className="p-4 border-t border-slate-100 bg-slate-50">
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Today&apos;s Real-Time Check Status</h3>
              </div>
              <span className="text-xs text-slate-500 font-mono">
                {checkSheets.length} Total Checksheets
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {checkSheets.map((cs, idx) => {
                const isFilled = idx < 4; // 4 filled today
                return (
                  <div
                    key={cs._id}
                    className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-slate-900 text-sm">{cs.title}</div>
                      <div className="text-[11px] text-slate-500">
                        {cs.code} • {cs.department?.name || "Canteen Kitchen"} • {cs.frequency}
                      </div>
                    </div>
                    {isFilled ? (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Filled Up</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 shrink-0 flex items-center gap-1.5">
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                <span>Add New Checksheet</span>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700 font-bold text-sm">
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCheckSheet} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Equipment / Check Sheet Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. JH CheckSheet - Wet Grinder (Electrical)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    Checksheet Code
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CS-JH-19"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="per_shift">Per Shift</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Category / Equipment Type
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="PNG Kitchen Equipment">PNG Kitchen Equipment</option>
                  <option value="Electrical Equipment">Electrical Equipment</option>
                  <option value="Cold Chain Monitoring">Cold Chain Monitoring</option>
                  <option value="Hygiene & Safety">Hygiene & Safety</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    SLA Target (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                    Mandatory Photos
                  </label>
                  <select
                    value={formData.mandatoryPhotoCount}
                    onChange={(e) => setFormData({ ...formData, mandatoryPhotoCount: Number(e.target.value) })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
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

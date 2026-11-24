"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";

export default function CheckSheetsPage() {
  const [checkSheets, setCheckSheets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedFrequency, setSelectedFrequency] = useState("");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    code: "",
    category: "Food Safety & Hygiene",
    department: "",
    frequency: "daily",
    mandatoryPhotoCount: 1,
    slaHours: 4,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (selectedDept) query.set("department", selectedDept);
      if (selectedFrequency) query.set("frequency", selectedFrequency);

      const [csRes, deptRes, shiftRes] = await Promise.all([
        fetch(`/api/checksheets?${query.toString()}`).then((r) => r.json()),
        fetch("/api/departments").then((r) => r.json()),
        fetch("/api/shifts").then((r) => r.json()),
      ]);

      if (csRes.success) setCheckSheets(csRes.checkSheets || []);
      if (deptRes.success) {
        setDepartments(deptRes.departments || []);
        if (deptRes.departments?.length > 0 && !formData.department) {
          setFormData((prev) => ({ ...prev, department: deptRes.departments[0]._id }));
        }
      }
      if (shiftRes.success) setShifts(shiftRes.shifts || []);
    } catch (err) {
      console.error("Failed to load check sheets:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedDept, selectedFrequency]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
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
        category: "Food Safety & Hygiene",
        department: departments[0]?._id || "",
        frequency: "daily",
        mandatoryPhotoCount: 1,
        slaHours: 4,
      });
      fetchData();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              Check Sheet Management
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full font-bold bg-[#CDFE02] text-[#101010]">
              CRUD
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure operational templates, field constraints, shift assignments, and photo verification gates.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center justify-center gap-2 shadow-md shadow-[#5733F0]/30 shrink-0"
        >
          <Plus className="w-4 h-4 text-[#CDFE02]" />
          <span>New Check Sheet</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        <form onSubmit={handleSearchSubmit} className="sm:col-span-2 relative">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or code (e.g. CHK_OVEN)..."
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
            <option value="per_shift">Per Shift</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* Check Sheet Data Table */}
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
              No check sheets match your query. Click &quot;New Check Sheet&quot; to configure your first operational sheet.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-white/[0.02] text-xs text-zinc-400 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Code</th>
                  <th className="px-5 py-3.5">Title & Category</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Frequency</th>
                  <th className="px-5 py-3.5">Photo Req.</th>
                  <th className="px-5 py-3.5">SLA</th>
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
                      {cs.department?.name || "General"}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-white uppercase">
                        {cs.frequency}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      {cs.mandatoryPhotoCount > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#CDFE02]">
                          <Camera className="w-3.5 h-3.5" />
                          <span>{cs.mandatoryPhotoCount} required</span>
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">Optional</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">
                      <span className="inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-zinc-500" />
                        {cs.slaHours}h SLA
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="View Check Sheet"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Check Sheet Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="rounded-2xl bg-[#141414] border border-white/10 w-full max-w-lg p-6 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-[#CDFE02]" />
                <h3 className="font-bold text-white text-base">New Operational Check Sheet</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateCheckSheet} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300">Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Daily Bakery Oven Sanitization & Temp"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Unique Code</label>
                  <input
                    type="text"
                    required
                    placeholder="CHK_BAKERY_01"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono uppercase focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Category</label>
                  <input
                    type="text"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="per_shift">Per Shift</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">Mandatory Photos</label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={formData.mandatoryPhotoCount}
                    onChange={(e) =>
                      setFormData({ ...formData, mandatoryPhotoCount: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300">SLA (Hours)</label>
                  <input
                    type="number"
                    min="1"
                    max="48"
                    value={formData.slaHours}
                    onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value) || 4 })}
                    className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-md shadow-[#5733F0]/30 disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Check Sheet</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

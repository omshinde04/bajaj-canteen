"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sparkles,
  ArrowRight,
  Sun,
  Sunset,
  Moon,
} from "lucide-react";

export default function ShiftsPage() {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    startTime: "06:00",
    endTime: "14:00",
    description: "",
  });

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/shifts");
      const data = await res.json();
      if (data.success) {
        setShifts(data.shifts || []);
      }
    } catch (err) {
      console.error("Failed to load shifts:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  const openCreateModal = () => {
    setEditingShift(null);
    setFormData({
      name: "",
      code: "",
      startTime: "06:00",
      endTime: "14:00",
      description: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (shift) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name,
      code: shift.code,
      startTime: shift.startTime,
      endTime: shift.endTime,
      description: shift.description || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editingShift
        ? `/api/shifts/${editingShift._id}`
        : "/api/shifts";
      const method = editingShift ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save shift");
      }

      setModalOpen(false);
      fetchShifts();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete shift "${name}"?`)) return;

    try {
      const res = await fetch(`/api/shifts/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete shift");
      fetchShifts();
    } catch (err) {
      alert(err.message);
    }
  };

  const getShiftIcon = (code) => {
    if (code.includes("A") || code.includes("MORN")) {
      return <Sun className="w-5 h-5 text-[#CDFE02]" />;
    }
    if (code.includes("B") || code.includes("EVEN")) {
      return <Sunset className="w-5 h-5 text-amber-400" />;
    }
    return <Moon className="w-5 h-5 text-[#D2EFF7]" />;
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Shift Roster & Timetable Management
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 25
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Configure 24/7 manufacturing canteen shifts, automated handover transition windows, and operational checklists.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchShifts}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#5733F0]/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#CDFE02]" />
            <span>Add Shift Roster</span>
          </button>
        </div>
      </div>

      {/* Shift Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map((s, idx) => (
          <div
            key={s._id || idx}
            className="rounded-2xl bg-[#141414] border border-white/10 p-5 space-y-4 hover:border-white/20 transition-all relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-2xl bg-white/[0.04] border border-white/5 flex items-center justify-center">
                {getShiftIcon(s.code)}
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
                {s.code}
              </span>
            </div>

            <div>
              <h3 className="text-base font-bold text-white">{s.name}</h3>
              <div className="flex items-center gap-2 mt-1.5 text-xs text-[#CDFE02] font-mono">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  {s.startTime} — {s.endTime}
                </span>
                <span className="text-[10px] text-zinc-500 font-sans">(8 Hours)</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 line-clamp-2">
              {s.description || "Operational shift timetable"}
            </p>

            <div className="flex items-center justify-between pt-3 border-t border-white/5 text-xs">
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#CDFE02]">
                <CheckCircle2 className="w-3 h-3" /> Active
              </span>
              <button
                onClick={() => openEditModal(s)}
                className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <span>Edit Shift</span>
                <Edit2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Shifts Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Shift Name & Code</th>
                <th className="py-3.5 px-4 font-semibold">Operational Window</th>
                <th className="py-3.5 px-4 font-semibold">Description</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Loading shift rosters...
                  </td>
                </tr>
              ) : (
                shifts.map((s) => (
                  <tr key={s._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{s.name}</div>
                      <div className="text-[10px] font-mono text-[#D2EFF7] mt-0.5">{s.code}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-mono text-zinc-200 bg-white/[0.03] px-2.5 py-1 rounded-lg border border-white/5">
                        {s.startTime} — {s.endTime}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 max-w-sm truncate">
                      {s.description || "Operational shift window"}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(s)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Shift"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(s._id, s.name)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Shift"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Centered Modal: Create / Edit Shift */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-md bg-[#18181D] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-[#CDFE02]" />
                {editingShift ? "Edit Shift Roster" : "Add Shift Roster"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Shift Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Shift A (Morning)"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Shift Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. SHIFT_A"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Start Time (HH:MM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#5733F0]"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    End Time (HH:MM) *
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Operational Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Morning breakfast and lunch production handover"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all shadow-md shadow-[#5733F0]/25 cursor-pointer"
                >
                  {formLoading ? "Saving..." : editingShift ? "Save Changes" : "Create Shift"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import {
  Building2,
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Sparkles,
  Layers,
  ArrowRight,
  Shield,
} from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    plantLocation: "Bajaj Auto Akurdi Facility",
    description: "",
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      plantLocation: dept.plantLocation || "Bajaj Auto Akurdi Facility",
      description: dept.description || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editingDept
        ? `/api/departments/${editingDept._id}`
        : "/api/departments";
      const method = editingDept ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save department");
      }

      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;

    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete department");
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.plantLocation && d.plantLocation.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDepts.length / pageSize) || 1;
  const paginatedDepts = filteredDepts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Plant Departments & Facilities
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 15
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Manage factory food prep zones, cold storage units, dining areas, and hygiene stations at Akurdi Facility.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDepartments}
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
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Facility Telemetry Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-[#5733F0]/15 via-white/[0.02] to-[#141414] border border-white/10 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#5733F0]/20 border border-[#5733F0]/40 flex items-center justify-center text-[#CDFE02]">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-white flex items-center gap-2">
              <span>Bajaj Auto Akurdi Industrial Complex</span>
              <span className="text-[10px] px-2 py-0.2 rounded-full bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
                Plant 04
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              {departments.length} Active Operational Facilities Configured
            </p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search departments..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </div>
      </div>

      {/* Departments Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Department & Code</th>
                <th className="py-3.5 px-4 font-semibold">Plant Location</th>
                <th className="py-3.5 px-4 font-semibold">Scope & Description</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    Loading facility departments...
                  </td>
                </tr>
              ) : filteredDepts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-zinc-500">
                    No departments found matching your criteria.
                  </td>
                </tr>
              ) : (
                paginatedDepts.map((dept) => (
                  <tr key={dept._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white text-xs">{dept.name}</div>
                      <div className="text-[10px] font-mono text-[#D2EFF7] mt-0.5">{dept.code}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-zinc-300">
                        <MapPin className="w-3.5 h-3.5 text-[#CDFE02]" />
                        <span>{dept.plantLocation}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 max-w-xs truncate">
                      {dept.description || "Operational plant facility"}
                    </td>

                    <td className="py-3.5 px-4">
                      {dept.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-400">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(dept)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Department"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(dept._id, dept.name)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Department"
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

        {/* Dynamic Pagination Controls */}
        <div className="p-4 border-t border-white/5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDepts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      </div>

      {/* Centered Modal: Create / Edit Department */}
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
                <Building2 className="w-4 h-4 text-[#CDFE02]" />
                {editingDept ? "Edit Facility Department" : "Add Facility Department"}
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
                  Department Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Canteen Main Kitchen"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Department Code *
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. DEPT_KITCHEN"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Plant Location
                </label>
                <input
                  type="text"
                  value={formData.plantLocation}
                  onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                  placeholder="e.g. Bajaj Auto Akurdi Facility - Unit 04"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Description / Operational Scope
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Main food preparation, cooking ranges and fryer station"
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
                  {formLoading ? "Saving..." : editingDept ? "Save Changes" : "Create Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

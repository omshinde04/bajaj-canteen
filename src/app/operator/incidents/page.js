"use client";

import React, { useState } from "react";
import Pagination from "@/components/Pagination";
import {
  AlertTriangle,
  Plus,
  Camera,
  CheckCircle2,
  Clock,
  Building2,
  Upload,
  Send,
  XCircle,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

export default function OperatorIncidentsPage() {
  const [incidents, setIncidents] = useState([
    {
      id: "INC-2026-081",
      title: "Chiller #2 Door Gasket Minor Leakage",
      department: "Cold Storage & Raw Materials",
      severity: "MEDIUM",
      status: "OPEN",
      reportedAt: "24/11/2026, 09:15",
      reporter: "Ramesh Pawar (BAJAJ-OP-01)",
      description: "Temperature holding at 3.8°C, but rubber gasket on upper latch requires replacement.",
    },
    {
      id: "INC-2026-079",
      title: "Bain-Marie #3 Heating Coil Tripped Circuit",
      department: "Canteen Main Kitchen",
      severity: "HIGH",
      status: "IN_PROGRESS",
      reportedAt: "24/11/2026, 07:40",
      reporter: "Ramesh Pawar (BAJAJ-OP-01)",
      description: "Circuit breaker tripped during breakfast prep. Plant engineering technician dispatched.",
    },
    {
      id: "INC-2026-072",
      title: "Automatic Dishwasher Detergent Dosing Pump Replaced",
      department: "Dining Hall & Sanitization",
      severity: "LOW",
      status: "RESOLVED",
      reportedAt: "23/11/2026, 16:30",
      reporter: "Ramesh Pawar (BAJAJ-OP-01)",
      description: "New peristaltic pump installed and calibrated. Sanitizing thermocline verified > 82°C.",
    },
  ]);

  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Canteen Main Kitchen");
  const [severity, setSeverity] = useState("MEDIUM");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const totalPages = Math.ceil(incidents.length / pageSize) || 1;
  const paginatedIncidents = incidents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleCreateIncident = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const newInc = {
        id: `INC-2026-${Math.floor(100 + Math.random() * 900)}`,
        title,
        department,
        severity,
        status: "OPEN",
        reportedAt: new Date().toLocaleString("en-IN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        reporter: "Ramesh Pawar (BAJAJ-OP-01)",
        description,
      };
      setIncidents([newInc, ...incidents]);
      setSubmitting(false);
      setModalOpen(false);
      setTitle("");
      setDescription("");
      setSuccessBanner(true);
      setTimeout(() => setSuccessBanner(false), 4000);
    }, 500);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case "HIGH":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            HIGH / CRITICAL
          </span>
        );
      case "MEDIUM":
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            MEDIUM
          </span>
        );
      case "LOW":
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            LOW
          </span>
        );
    }
  };

  const getStatusBadge = (st) => {
    switch (st) {
      case "RESOLVED":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400">
            <CheckCircle2 className="w-3 h-3" /> Resolved
          </span>
        );
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-400">
            <Clock className="w-3 h-3" /> In Triage
          </span>
        );
      case "OPEN":
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400">
            <AlertTriangle className="w-3 h-3" /> Open Alert
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40">
              <ShieldAlert className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Incident & Equipment Defect Log
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Rapidly log kitchen equipment anomalies, refrigeration leaks, or safety hazards for immediate plant engineering triage.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold transition-all shadow-md shadow-rose-500/25 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Defect</span>
        </button>
      </div>

      {successBanner && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>Incident ticket submitted and dispatched to plant engineering desk!</span>
        </div>
      )}

      {/* Incidents Table */}
      <div className="rounded-2xl bg-[#141418] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Incident Ticket</th>
                <th className="py-3.5 px-4 font-semibold">Department & Location</th>
                <th className="py-3.5 px-4 font-semibold">Severity</th>
                <th className="py-3.5 px-4 font-semibold">Defect Description</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold">Reported At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {paginatedIncidents.map((inc) => (
                <tr key={inc.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">
                    <span className="text-[#CDFE02]">{inc.id}</span>
                  </td>

                  <td className="py-3.5 px-4 text-zinc-300">
                    <div className="font-semibold">{inc.department}</div>
                  </td>

                  <td className="py-3.5 px-4">{getSeverityBadge(inc.severity)}</td>

                  <td className="py-3.5 px-4 text-zinc-300 max-w-sm">
                    <div className="font-semibold text-white">{inc.title}</div>
                    <div className="text-[11px] text-zinc-400 truncate">{inc.description}</div>
                  </td>

                  <td className="py-3.5 px-4">{getStatusBadge(inc.status)}</td>

                  <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                    {inc.reportedAt}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="p-4 border-t border-white/5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={incidents.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[3, 5, 10]}
          />
        </div>
      </div>

      {/* Report Defect Modal */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#141418] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                <span>Report Defect or Equipment Malfunction</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateIncident} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Defect Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Deep Fryer Temperature Sensor Reading Erratic"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#101014] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Department
                  </label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full bg-[#101014] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="Canteen Main Kitchen">Canteen Main Kitchen</option>
                    <option value="Cold Storage & Raw Materials">Cold Storage & Raw Materials</option>
                    <option value="Bakery & Confectionery">Bakery & Confectionery</option>
                    <option value="Dining Hall & Sanitization">Dining Hall & Sanitization</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                    Severity Level
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    className="w-full bg-[#101014] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="LOW">Low (Cosmetic / Minor)</option>
                    <option value="MEDIUM">Medium (Requires Maintenance)</option>
                    <option value="HIGH">High (Immediate Plant Hazard)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                  Detailed Observations & Equipment Location *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain exact symptoms, machine serial number, or strange noises..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#101014] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 text-zinc-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-md shadow-rose-500/20 disabled:opacity-50"
                >
                  {submitting ? "Logging..." : "Dispatch Incident"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import {
  CheckSquare,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Camera,
  Eye,
  ShieldCheck,
  ChevronRight,
  X,
  FileCheck2,
  Building2,
  CalendarDays,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Hash,
} from "lucide-react";

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState([]);
  const [counts, setCounts] = useState({
    ALL: 0,
    PENDING_APPROVAL: 0,
    APPROVED: 0,
    REJECTED: 0,
    FLAGGED: 0,
  });
  const [activeTab, setActiveTab] = useState("ALL");
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("ALL");
  const [shiftFilter, setShiftFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  // Inspection Drawer State
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [supervisorRemarks, setSupervisorRemarks] = useState("");
  const [zoomPhoto, setZoomPhoto] = useState(null);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (activeTab !== "ALL") params.set("status", activeTab);
      if (deptFilter !== "ALL") params.set("department", deptFilter);
      if (shiftFilter !== "ALL") params.set("shift", shiftFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.counts) setCounts(data.counts);
      }
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, [activeTab, deptFilter, shiftFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchSubmissions();
  };

  const handleReviewAction = async (action) => {
    if (!selectedSubmission) return;
    if (action === "REJECT" && !rejectionReason.trim()) {
      alert("Please enter a specific rejection reason.");
      return;
    }

    try {
      setActionLoading(true);
      const res = await fetch(`/api/submissions/${selectedSubmission._id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          supervisorRemarks,
          rejectionReason,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Review action failed");
      }

      // Update local state
      setSelectedSubmission(data.submission);
      setRejectModalOpen(false);
      setRejectionReason("");
      setSupervisorRemarks("");
      fetchSubmissions();
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case "FLAGGED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Flagged Defect
          </span>
        );
      case "PENDING_APPROVAL":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
            <Clock className="w-3 h-3 text-[#CDFE02]" /> Pending Approval
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Shift Submissions & Approval Workflow
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 7
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Review operator checklist executions, examine photo evidence, verify tolerance ranges, and provide digital sign-off.
          </p>
        </div>

        <button
          onClick={fetchSubmissions}
          disabled={loading}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 [scrollbar-width:none]">
        {[
          { key: "ALL", label: "All Submissions", count: counts.ALL },
          { key: "PENDING_APPROVAL", label: "Pending Approval", count: counts.PENDING_APPROVAL, alert: counts.PENDING_APPROVAL > 0 },
          { key: "APPROVED", label: "Approved & Signed", count: counts.APPROVED },
          { key: "REJECTED", label: "Rejected / Rectify", count: counts.REJECTED },
          { key: "FLAGGED", label: "Flagged Defects", count: counts.FLAGGED },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition-all ${
                isActive
                  ? "bg-[#5733F0] text-white font-semibold shadow-md shadow-[#5733F0]/25"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : tab.alert
                    ? "bg-[#CDFE02]/20 text-[#CDFE02]"
                    : "bg-white/5 text-zinc-400"
                }`}
              >
                {tab.count || 0}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search and Secondary Filter Bar */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, code, or operator..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </form>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <select
            value={shiftFilter}
            onChange={(e) => setShiftFilter(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-xs text-zinc-300 focus:outline-none focus:border-[#5733F0]"
          >
            <option value="ALL">All Shifts</option>
            <option value="SHIFT_A">Shift A (Morning)</option>
            <option value="SHIFT_B">Shift B (Evening)</option>
            <option value="SHIFT_C">Shift C (Night)</option>
          </select>
        </div>
      </div>

      {/* Main Submissions Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Check Sheet & Code</th>
                <th className="py-3.5 px-4 font-semibold">Department & Shift</th>
                <th className="py-3.5 px-4 font-semibold">Operator</th>
                <th className="py-3.5 px-4 font-semibold">Evidence</th>
                <th className="py-3.5 px-4 font-semibold">Compliance</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    Loading submission queue...
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-zinc-500">
                    <CheckSquare className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-zinc-400">No submissions found</p>
                    <p className="text-xs text-zinc-600 mt-1">There are no submissions matching your active filter.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">
                        {sub.checkSheet?.title || "Operational Check Sheet"}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-2 mt-0.5">
                        <span>{sub.checkSheet?.code || "CS-GEN"}</span>
                        <span>•</span>
                        <span>{new Date(sub.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200 font-medium">{sub.department?.name || "Kitchen"}</div>
                      <div className="text-[10px] text-zinc-400">{sub.shift?.name || "Shift A"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">{sub.submittedBy?.name || "Operator"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {sub.submittedBy?.employeeId || "BAJAJ-000"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {sub.photos?.length > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-[#CDFE02] font-semibold">
                          <Camera className="w-3.5 h-3.5" />
                          {sub.photos.length} Photo{sub.photos.length > 1 ? "s" : ""}
                        </span>
                      ) : (
                        <span className="text-[11px] text-zinc-500">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{sub.complianceScore}%</span>
                        {sub.hasDefects && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 font-bold">
                            Defect
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all shadow-sm shadow-[#5733F0]/30 inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3 h-3 text-[#CDFE02]" />
                        <span>Inspect</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-over Inspection Drawer */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-[#141418] border-l border-white/10 h-screen flex flex-col justify-between shadow-2xl overflow-hidden animate-in slide-in-from-right duration-300">
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/10 flex items-start justify-between bg-[#101014] shrink-0">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
                    {selectedSubmission.checkSheet?.code}
                  </span>
                  {getStatusBadge(selectedSubmission.status)}
                </div>
                <h2 className="text-lg font-bold text-white">
                  {selectedSubmission.checkSheet?.title}
                </h2>
                <p className="text-xs text-zinc-400">
                  Submitted by {selectedSubmission.submittedBy?.name} ({selectedSubmission.submittedBy?.employeeId}) •{" "}
                  {new Date(selectedSubmission.submissionDate).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
              {/* Compliance & SLA Gauge Card */}
              <div className="rounded-xl bg-white/[0.02] border border-white/5 p-4 grid grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[11px] text-zinc-400">Compliance Score</div>
                  <div className="text-xl font-extrabold text-[#CDFE02] mt-0.5">
                    {selectedSubmission.complianceScore}%
                  </div>
                </div>
                <div className="border-x border-white/5">
                  <div className="text-[11px] text-zinc-400">Department</div>
                  <div className="text-xs font-semibold text-white mt-1 truncate">
                    {selectedSubmission.department?.name}
                  </div>
                </div>
                <div>
                  <div className="text-[11px] text-zinc-400">Shift Execution</div>
                  <div className="text-xs font-semibold text-white mt-1">
                    {selectedSubmission.shift?.name}
                  </div>
                </div>
              </div>

              {/* Digital Signature Seal if Approved */}
              {selectedSubmission.digitalSignature?.hash && (
                <div className="rounded-xl bg-[#CDFE02]/5 border border-[#CDFE02]/30 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#CDFE02]">
                      <ShieldCheck className="w-4 h-4" /> Digitally Signed & Sealed
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">SHA-256 Validated</span>
                  </div>
                  <div className="text-xs text-zinc-300">
                    Verified by <strong className="text-white">{selectedSubmission.digitalSignature.signedBy}</strong> on{" "}
                    {new Date(selectedSubmission.digitalSignature.timestamp).toLocaleString()}
                  </div>
                  <div className="text-[10px] font-mono text-zinc-500 break-all bg-black/40 p-2 rounded-lg border border-white/5">
                    Hash: {selectedSubmission.digitalSignature.hash}
                  </div>
                  {selectedSubmission.supervisorRemarks && (
                    <div className="text-xs text-zinc-300 pt-2 border-t border-white/5">
                      Remarks: "{selectedSubmission.supervisorRemarks}"
                    </div>
                  )}
                </div>
              )}

              {/* Rejection Notice if Rejected */}
              {selectedSubmission.status === "REJECTED" && (
                <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-400">
                    <XCircle className="w-4 h-4" /> Submission Rejected
                  </div>
                  <p className="text-xs text-rose-200">
                    Reason: <em>"{selectedSubmission.rejectionReason}"</em>
                  </p>
                  <p className="text-[11px] text-zinc-400">
                    Reviewed by {selectedSubmission.reviewedBy?.name} on{" "}
                    {new Date(selectedSubmission.reviewedAt).toLocaleString()}
                  </p>
                </div>
              )}

              {/* Checklist Field Responses Table */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                  Checklist Inspection Items & Measurements
                </h3>

                <div className="rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02] text-zinc-400">
                        <th className="py-2.5 px-3 font-semibold">Inspection Parameter</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Recorded Value</th>
                        <th className="py-2.5 px-3 font-semibold text-right">Outcome</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {selectedSubmission.responses?.map((r, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.01]">
                          <td className="py-2.5 px-3 font-medium text-white">{r.label}</td>
                          <td className="py-2.5 px-3 text-right font-mono text-zinc-200">
                            {typeof r.value === "boolean"
                              ? r.value
                                ? "Yes / Pass"
                                : "No / Fail"
                              : `${r.value} ${r.unit || ""}`}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            {r.isConforming ? (
                              <span className="text-[10px] font-bold text-[#CDFE02]">Pass</span>
                            ) : (
                              <span className="text-[10px] font-bold text-rose-400">Non-Conforming</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Photo Evidence Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-[#CDFE02]" />
                    Photo Evidence Lightbox ({selectedSubmission.photos?.length || 0})
                  </h3>
                  <span className="text-[10px] text-zinc-500 font-mono">Tamper-Proof Storage</span>
                </div>

                {selectedSubmission.photos?.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedSubmission.photos.map((photo, pIdx) => (
                      <div
                        key={pIdx}
                        onClick={() => setZoomPhoto(photo.url)}
                        className="group relative rounded-xl overflow-hidden border border-white/10 bg-black aspect-video cursor-pointer hover:border-[#5733F0] transition-all"
                      >
                        <img
                          src={photo.url}
                          alt={photo.caption || "Evidence photograph"}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end justify-between">
                          <span className="text-[10px] text-white font-medium truncate">
                            {photo.caption || "Click to zoom"}
                          </span>
                          <ExternalLink className="w-3 h-3 text-[#CDFE02]" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-white/10 p-6 text-center text-zinc-500 text-xs">
                    No photo evidence attached to this submission.
                  </div>
                )}
              </div>

              {/* Operator Notes */}
              {selectedSubmission.notes && (
                <div className="space-y-1.5">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Operator Notes</span>
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-zinc-300">
                    "{selectedSubmission.notes}"
                  </div>
                </div>
              )}
            </div>

            {/* Drawer Footer Actions (Supervisor Sign-off) */}
            <div className="p-4 border-t border-white/10 bg-[#101014] shrink-0 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
              >
                Close
              </button>

              {selectedSubmission.status === "PENDING_APPROVAL" && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setRejectModalOpen(true)}
                    disabled={actionLoading}
                    className="px-4 py-2.5 rounded-xl font-semibold text-xs text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition-all flex items-center gap-1.5"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject & Return</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleReviewAction("APPROVE")}
                    disabled={actionLoading}
                    className="px-5 py-2.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-1.5 shadow-lg shadow-[#5733F0]/30"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#CDFE02]" />
                    <span>Approve & Sign</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-md bg-[#18181D] border border-white/10 rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                Reject Check Sheet Submission
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-zinc-400">
              Provide a clear reason for rejecting this submission. The operator will be notified to rectify the non-conformance.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                Mandatory Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. Deep fryer TPM exceeds 25% safety limit. Oil must be completely discarded and fryer sanitized."
                rows={3}
                required
                className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleReviewAction("REJECT")}
                disabled={actionLoading || !rejectionReason.trim()}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-rose-600 hover:bg-rose-500 disabled:opacity-50 transition-all flex items-center gap-1.5"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Confirm Rejection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox Zoom Modal */}
      {zoomPhoto && (
        <div
          onClick={() => setZoomPhoto(null)}
          className="fixed inset-0 z-70 flex items-center justify-center p-6 bg-black/90 backdrop-blur-md cursor-zoom-out"
        >
          <div className="relative max-w-4xl max-h-[90vh] rounded-2xl overflow-hidden border border-white/20">
            <img src={zoomPhoto} alt="Evidence Full Zoom" className="w-full h-full object-contain" />
            <button
              onClick={() => setZoomPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

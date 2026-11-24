"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Pagination from "@/components/Pagination";
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Calendar,
  Building2,
  Eye,
  RefreshCw,
  Search,
  Filter,
  ShieldCheck,
  Camera,
  Hash,
  X,
  Sparkles,
} from "lucide-react";

export default function OperatorHistoryPage() {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchHistory = async (page = currentPage, limit = pageSize) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`/api/submissions?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setSubmissions(data.submissions || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to load submission history:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchHistory(1, pageSize);
  }, [statusFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchHistory(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchHistory(1, newSize);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchHistory(1, pageSize);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
            <CheckCircle2 className="w-3 h-3" /> Approved & Signed
          </span>
        );
      case "REJECTED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Returned / Rejected
          </span>
        );
      case "FLAGGED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <AlertTriangle className="w-3 h-3" /> Flagged Defect
          </span>
        );
      case "PENDING_APPROVAL":
      case "SUBMITTED":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
            <Clock className="w-3 h-3" /> In Review
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
            <span className="p-1.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] border border-[#5733F0]/40">
              <FileCheck2 className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              My Submissions & Execution Log
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Historical audit register of all checksheets executed on the floor with supervisor review statuses.
          </p>
        </div>

        <button
          onClick={() => fetchHistory(currentPage, pageSize)}
          disabled={loading}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#141418] hover:bg-white/5 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 [scrollbar-width:none]">
          {["ALL", "PENDING_APPROVAL", "APPROVED", "REJECTED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === st
                  ? "bg-[#5733F0] text-white shadow-md shadow-[#5733F0]/25"
                  : "bg-[#141418] text-zinc-400 hover:text-white border border-white/5"
              }`}
            >
              {st === "ALL"
                ? "All Logs"
                : st === "PENDING_APPROVAL"
                ? "Pending Review"
                : st.charAt(0) + st.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search checksheet..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#141418] border border-white/10 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </form>
      </div>

      {/* Submissions Table */}
      <div className="rounded-2xl bg-[#141418] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Check Sheet Code & Title</th>
                <th className="py-3.5 px-4 font-semibold">Department & Shift</th>
                <th className="py-3.5 px-4 font-semibold">Execution Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Compliance Index</th>
                <th className="py-3.5 px-4 font-semibold">Review Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Inspection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-[#CDFE02]" />
                    <span>Loading submissions log...</span>
                  </td>
                </tr>
              ) : submissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    No submissions found matching your filters.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => (
                  <tr key={sub._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{sub.checkSheet?.title || "Check Sheet"}</div>
                      <div className="text-[10px] font-mono text-[#CDFE02] mt-0.5">
                        {sub.checkSheet?.code || "CS-RECORD"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-300">{sub.department?.name || "Main Kitchen"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {sub.shift?.name || "Shift A"}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-400 font-mono text-[11px]">
                      {new Date(sub.submissionDate || sub.createdAt).toLocaleString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`font-mono font-bold ${
                          sub.complianceScore < 100 ? "text-amber-400" : "text-[#CDFE02]"
                        }`}
                      >
                        {sub.complianceScore}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(sub.status)}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedSubmission(sub)}
                        className="px-3 py-1.5 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#6c4cf5] transition-all inline-flex items-center gap-1.5 shadow-sm shadow-[#5733F0]/25 cursor-pointer"
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

        {/* Dynamic Pagination Controls */}
        <div className="p-4 border-t border-white/5">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total || submissions.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      </div>

      {/* Centered Inspection Modal */}
      {selectedSubmission && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedSubmission(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-2xl bg-[#141418] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#CDFE02] bg-[#CDFE02]/10 border border-[#CDFE02]/20 px-2 py-0.5 rounded">
                  {selectedSubmission.checkSheet?.code}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">
                  {selectedSubmission.checkSheet?.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Parameter Readings List */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                Recorded Readings & Conformance
              </h4>
              <div className="space-y-2">
                {(selectedSubmission.responses || []).map((resp, rIdx) => (
                  <div
                    key={rIdx}
                    className="p-3 rounded-xl bg-[#101014] border border-white/5 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-semibold text-white">{resp.label}</div>
                      {resp.remarks && (
                        <div className="text-[11px] text-rose-400 mt-0.5">Note: {resp.remarks}</div>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-white">
                        {String(resp.value)} {resp.unit || ""}
                      </span>
                      <div
                        className={`text-[10px] font-bold ${
                          resp.isConforming ? "text-emerald-400" : "text-rose-400"
                        }`}
                      >
                        {resp.isConforming ? "Pass" : "Non-Conforming"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Photos Lightbox */}
            {selectedSubmission.photos?.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">
                  Attached Evidence Photos ({selectedSubmission.photos.length})
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {selectedSubmission.photos.map((p, pIdx) => (
                    <div key={pIdx} className="rounded-xl overflow-hidden border border-white/10 aspect-video bg-black">
                      <img src={p.url} alt="Evidence" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Digital Signature Stamp */}
            {selectedSubmission.digitalSignature && (
              <div className="p-3.5 rounded-xl bg-[#5733F0]/10 border border-[#5733F0]/30 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-[#D2EFF7] font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#CDFE02]" />
                  <span>Digitally Signed by Supervisor</span>
                </div>
                <div className="text-zinc-400 text-[11px]">
                  Signer: {selectedSubmission.digitalSignature.signedBy}
                </div>
                <div className="text-[10px] text-zinc-500 font-mono truncate">
                  SHA-256: {selectedSubmission.digitalSignature.hash}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

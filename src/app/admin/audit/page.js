"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import {
  History,
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  User,
  ShieldCheck,
  ChevronRight,
  X,
  FileCode,
  Lock,
} from "lucide-react";

export default function AuditPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [selectedLog, setSelectedLog] = useState(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });

  const fetchLogs = async (page = currentPage, limit = pageSize) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (actionFilter !== "ALL") params.set("action", actionFilter);
      if (search.trim()) params.set("search", search.trim());
      params.set("page", page);
      params.set("limit", limit);

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs || []);
        if (data.pagination) setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Failed to load audit trail:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    fetchLogs(1, pageSize);
  }, [actionFilter]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchLogs(newPage, pageSize);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
    fetchLogs(1, newSize);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchLogs(1, pageSize);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case "SUBMISSION_APPROVED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/15 text-[#CDFE02] border border-[#CDFE02]/30">
            Approved
          </span>
        );
      case "SUBMISSION_REJECTED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            Rejected
          </span>
        );
      case "SECURITY_ALERT":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse">
            Security Alert
          </span>
        );
      case "CREATE":
      case "USER_CREATED":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
            Created
          </span>
        );
      case "LOGIN":
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-zinc-300 border border-white/10">
            Auth
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-zinc-400">
            {action}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Immutable Activity Audit Trail
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 11
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Permanent, append-only log of every administrative modification, checklist sign-off, rejection, and authentication event.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          disabled={loading}
          className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all cursor-pointer self-start md:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh Audit Stream</span>
        </button>
      </div>

      {/* Security Guarantee Banner */}
      <div className="rounded-2xl bg-[#5733F0]/10 border border-[#5733F0]/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-[#5733F0]/20 flex items-center justify-center text-[#CDFE02]">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <div className="font-bold text-white flex items-center gap-2">
              <span>Append-Only Regulatory Log Chain</span>
              <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-black/40 text-[#CDFE02] border border-[#CDFE02]/30">
                SHA-256 Validated
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">
              Audit records are cryptographically verified and cannot be modified or purged by any role.
            </p>
          </div>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search audit records..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </form>
      </div>

      {/* Audit Log Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3 px-4 font-semibold">Timestamp</th>
                <th className="py-3 px-4 font-semibold">Actor</th>
                <th className="py-3 px-4 font-semibold">Action & Module</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-4 font-semibold">IP Address</th>
                <th className="py-3 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Loading audit trail stream...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    No audit records match the current filter.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-400">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-white">{log.actorName || "System Worker"}</div>
                      <div className="text-[10px] text-zinc-500 font-mono">{log.actorEmail}</div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getActionBadge(log.action)}
                        <span className="text-[10px] font-mono text-zinc-500">{log.module}</span>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-zinc-300 max-w-sm truncate">
                      {log.description || "Operational action logged"}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-zinc-500">
                      {log.ipAddress || "127.0.0.1"}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                      >
                        Inspect
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
            totalItems={pagination.total || logs.length}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      </div>

      {/* Centered Modal: Audit Record JSON Inspector */}
      {selectedLog && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelectedLog(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-xl bg-[#18181D] border border-white/15 rounded-3xl p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <FileCode className="w-4 h-4 text-[#CDFE02]" />
                Audit Record Payload Details
              </h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Action:</span>
                <span className="font-bold text-white">{selectedLog.action}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Module:</span>
                <span className="font-mono text-[#D2EFF7]">{selectedLog.module}</span>
              </div>
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-zinc-400">Actor:</span>
                <span className="text-white">{selectedLog.actorName} ({selectedLog.actorEmail})</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                Metadata & State Diff
              </span>
              <pre className="p-3.5 rounded-2xl bg-black/60 border border-white/10 text-[11px] font-mono text-[#CDFE02] overflow-x-auto max-h-60 custom-scrollbar">
                {JSON.stringify(selectedLog.metadata || selectedLog, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5733F0] hover:bg-[#5733F0]/90 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

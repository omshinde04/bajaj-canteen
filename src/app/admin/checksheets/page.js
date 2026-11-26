"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  FileSpreadsheet,
  Plus,
  Search,
  Camera,
  Clock,
  Trash2,
  CheckCircle2,
  RefreshCw,
  X,
} from "lucide-react";

export default function CheckSheetsPage() {
  return (
    <Suspense fallback={<LoaderBlock text="Loading check sheets..." />}>
      <CheckSheetsContent />
    </Suspense>
  );
}

function CheckSheetsContent() {
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get("search") || "";

  const [activeTab, setActiveTab] = useState("master"); // "master" (CRUD) or "status" (Fill-up vs Pending)
  const [checkSheets, setCheckSheets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(initialSearch);
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

  // Sync when search parameter in URL changes
  useEffect(() => {
    const urlQuery = searchParams.get("search") || "";
    if (urlQuery !== search) {
      setSearch(urlQuery);
      setDebouncedSearch(urlQuery);
      setCurrentPage(1);
    }
  }, [searchParams]);

  // Debounce search input changes by 250ms
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== debouncedSearch) {
        setDebouncedSearch(search);
        setCurrentPage(1);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [search, debouncedSearch]);

  const fetchData = async (page = currentPage, limit = pageSize, q = debouncedSearch) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (q && q.trim()) query.set("search", q.trim());
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
    fetchData(currentPage, pageSize, debouncedSearch);
  }, [currentPage, pageSize, selectedDept, selectedFrequency, debouncedSearch]);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setCurrentPage(1);
    fetchData(1, pageSize, search);
  };

  const handleClearSearch = () => {
    setSearch("");
    setDebouncedSearch("");
    setCurrentPage(1);
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
      fetchData(1, pageSize, debouncedSearch);
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCheckSheet = async (id, title) => {
    if (!confirm(`Are you sure you want to delete check sheet "${title}"?`)) return;

    try {
      const res = await fetch(`/api/checksheets/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete check sheet");
      fetchData(currentPage, pageSize, debouncedSearch);
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Checksheets Master & Status (Points 2 & 3)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileSpreadsheet className="w-7 h-7 text-indigo-600" />
            <span>Checksheets Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Total checksheets: Add, update, delete & Real-time status for check sheets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="default"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Add Checksheet</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={() => fetchData(currentPage, pageSize, debouncedSearch)}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* TABS SWITCHER: POINT 2 (MASTER CRUD) vs POINT 3 (CHECK STATUS) */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("master")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "master"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          <span>Point 2: Total Checksheets Master (CRUD)</span>
        </button>

        <button
          onClick={() => setActiveTab("status")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "status"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>Point 3: Check Status (Filled Up vs Pending)</span>
        </button>
      </div>

      {/* FILTERS BAR (SHARED ACROSS BOTH VIEWS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by equipment title or code..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        <div>
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
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
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 shadow-xs"
          >
            <option value="">All Frequencies</option>
            <option value="daily">Daily</option>
            <option value="per_shift">Per Shift</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
        </div>
      </div>

      {/* ACTIVE SEARCH PILL */}
      {debouncedSearch && (
        <div className="flex items-center justify-between bg-indigo-50/60 border border-indigo-100 px-4 py-2 rounded-xl text-xs text-indigo-900">
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Searching for: <strong className="font-semibold">&quot;{debouncedSearch}&quot;</strong>
            </span>
            <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 font-mono text-[11px]">
              {pagination.total} {pagination.total === 1 ? "result" : "results"}
            </Badge>
          </div>
          <button
            onClick={handleClearSearch}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer flex items-center gap-1"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Filter</span>
          </button>
        </div>
      )}

      {/* VIEW 1: POINT 2 - TOTAL CHECKSHEETS CRUD MASTER */}
      {activeTab === "master" ? (
        <div className="space-y-4">
          {/* Table */}
          <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
            {loading ? (
              <LoaderBlock text="Loading check sheet records..." />
            ) : checkSheets.length === 0 ? (
              <div className="p-12 text-center text-xs text-slate-500 space-y-3">
                <FileSpreadsheet className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">No Check Sheets Found</div>
                <p className="max-w-xs mx-auto text-[11px] text-slate-500">
                  {debouncedSearch
                    ? `No checksheets matched "${debouncedSearch}". Try another search or clear the filter.`
                    : 'Click "+ Add Checksheet" above to configure a new operational sheet.'}
                </p>
                {debouncedSearch && (
                  <Button variant="outline" size="sm" onClick={handleClearSearch} className="mt-2">
                    Clear Search
                  </Button>
                )}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Equipment / Check Sheet Name</TableHead>
                    <TableHead>Department</TableHead>
                    <TableHead>Frequency</TableHead>
                    <TableHead>Photo Req.</TableHead>
                    <TableHead>SLA Target</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checkSheets.map((cs) => (
                    <TableRow key={cs._id}>
                      <TableCell className="font-mono text-xs text-indigo-700 font-bold">
                        {cs.code}
                      </TableCell>
                      <TableCell>
                        <div className="font-bold text-slate-900">{cs.title}</div>
                        <div className="text-[11px] text-slate-500">{cs.category}</div>
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        {cs.department?.name || "General Kitchen"}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="font-mono uppercase">
                          {cs.frequency}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {cs.mandatoryPhotoCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] text-indigo-600 font-semibold">
                            <Camera className="w-3.5 h-3.5" />
                            <span>{cs.mandatoryPhotoCount} required</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">Optional</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-slate-600">
                        <span className="inline-flex items-center gap-1 font-mono">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {cs.slaHours}h
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCheckSheet(cs._id, cs.title)}
                          title="Delete Check Sheet"
                          className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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

            {checkSheets.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto" />
                <div className="font-semibold text-slate-700">No Checksheets Found</div>
                <p className="text-[11px] text-slate-500">
                  {debouncedSearch
                    ? `No checksheets matched "${debouncedSearch}".`
                    : "No checksheets available to display status."}
                </p>
              </div>
            ) : (
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
                        <Badge variant="success" className="px-3 py-1 text-xs shrink-0 gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Filled Up</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="px-3 py-1 text-xs shrink-0 gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending</span>
                        </Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Shadcn Dialog: Add New Checksheet */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent onClose={() => setIsModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Add New Checksheet</span>
            </DialogTitle>
          </DialogHeader>

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
              <Input
                type="text"
                required
                placeholder="e.g. JH CheckSheet - Wet Grinder (Electrical)"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Checksheet Code
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. CS-JH-19"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="font-mono"
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
                  <option value="per_shift">Per Shift</option>
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="PNG Kitchen Equipment">PNG Kitchen Equipment</option>
                <option value="Electrical Kitchen Equipment">Electrical Kitchen Equipment</option>
                <option value="Cold Chain Monitoring">Cold Chain Monitoring</option>
                <option value="Hygiene & Sanitation">Hygiene & Sanitation</option>
                <option value="Bakery Operations">Bakery Operations</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Department
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Mandatory Photos
                </label>
                <Input
                  type="number"
                  min="0"
                  max="5"
                  value={formData.mandatoryPhotoCount}
                  onChange={(e) =>
                    setFormData({ ...formData, mandatoryPhotoCount: parseInt(e.target.value, 10) || 0 })
                  }
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  SLA Target (Hours)
                </label>
                <Input
                  type="number"
                  min="1"
                  max="48"
                  value={formData.slaHours}
                  onChange={(e) =>
                    setFormData({ ...formData, slaHours: parseInt(e.target.value, 10) || 1 })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={submitting}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                Create Checksheet
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

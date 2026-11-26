"use client";

import React, { useState, useEffect } from "react";
import {
  FileText,
  FileDown,
  Printer,
  Calendar,
  Building2,
  Coffee,
  CheckCircle2,
  Clock,
  RefreshCw,
  Sparkles,
  FileSpreadsheet,
} from "lucide-react";

export default function ReportsAndDownloadsPage() {
  const [reportType, setReportType] = useState("daily"); // "daily" or "monthly"
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    setMonth(today.substring(0, 7));
  }, []);

  const fetchReports = async () => {
    if (!date && !month) return;
    setLoading(true);
    try {
      const url =
        reportType === "monthly"
          ? `/api/reports/summary?type=monthly&month=${month}`
          : `/api/reports/summary?type=daily&date=${date}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [reportType, date, month]);

  // Export to Excel / CSV format
  const handleDownloadExcel = () => {
    if (!data) return;

    let csvRows = [];
    csvRows.push(["BAJAJ AUTO CANTEEN OPERATIONS - OFFICIAL REPORT"]);
    csvRows.push([`Report Period: ${data.period} (${reportType.toUpperCase()})`]);
    csvRows.push([`Generated On: ${new Date().toLocaleString()}`]);
    csvRows.push([]);

    // 1. Checksheet summary
    csvRows.push(["1. CHECKSHEET COMPLIANCE SUMMARY"]);
    csvRows.push(["Total Scheduled Checksheets", data.summary.totalChecksheets]);
    csvRows.push(["Filled Up Checksheets", data.summary.filledChecksheets]);
    csvRows.push(["Pending Checksheets", data.summary.pendingChecksheets]);
    csvRows.push(["Completion Rate", `${data.summary.fillupPercentage}%`]);
    csvRows.push([]);

    // 2. Department-wise Tea Count
    csvRows.push(["2. DEPARTMENT-WISE TEA DISTRIBUTION"]);
    csvRows.push(["Department Name", "Cups Count"]);
    Object.entries(data.teaByDepartment || {}).forEach(([dept, count]) => {
      csvRows.push([`"${dept}"`, count]);
    });
    csvRows.push(["Total Tea Cups", data.summary.totalTeaCount]);
    csvRows.push([]);

    // 3. Checksheet Status List
    csvRows.push(["3. INDIVIDUAL CHECKSHEET STATUS"]);
    csvRows.push(["Code", "Title", "Category", "Status"]);
    (data.checksheets || []).forEach((cs, idx) => {
      const status = idx < data.summary.filledChecksheets ? "FILLED UP" : "PENDING";
      csvRows.push([cs.code, `"${cs.title}"`, cs.category || "-", status]);
    });

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Bajaj_Canteen_${reportType.toUpperCase()}_Report_${data.period}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans print:bg-white print:text-black">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Reports & Downloads (Point 4)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <FileDown className="w-7 h-7 text-[#CDFE02]" />
            <span>Reports & Downloads</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Check daily reports & monthly reports. Download every report in Excel / PDF.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Daily / Monthly Switcher */}
          <div className="flex items-center gap-1 bg-[#141418] p-1 rounded-xl border border-white/10 text-xs">
            <button
              onClick={() => setReportType("daily")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                reportType === "daily" ? "bg-[#5733F0] text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Daily Reports
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                reportType === "monthly" ? "bg-[#5733F0] text-white font-semibold" : "text-zinc-400 hover:text-white"
              }`}
            >
              Monthly Reports
            </button>
          </div>

          {/* Date / Month Picker */}
          {reportType === "daily" ? (
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="bg-[#141418] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
            />
          ) : (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-[#141418] border border-white/10 rounded-xl px-3 py-1.5 text-white font-mono text-xs focus:outline-none"
            />
          )}

          {/* Download Buttons */}
          <button
            onClick={handleDownloadExcel}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#CDFE02] hover:bg-[#b8e602] text-[#09090C] font-bold text-xs transition shadow-lg shadow-[#CDFE02]/20"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-200 hover:text-white font-medium text-xs transition border border-white/10"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>Print / PDF</span>
          </button>

          <button
            onClick={fetchReports}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* REPORT CONTENT (PRINTABLE) */}
      <div className="space-y-6 bg-[#141418] border border-white/10 rounded-2xl p-6 print:border-none print:p-0 print:bg-white">
        {/* Printable Title Block */}
        <div className="border-b border-white/10 pb-4 print:border-b-2 print:border-black flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white print:text-black">
              BAJAJ AUTO CANTEEN OPERATIONS {reportType.toUpperCase()} DOSSIER
            </h2>
            <p className="text-xs text-zinc-400 print:text-zinc-600 font-mono">
              Period: {data?.period} • Facility: Akurdi Industrial Complex
            </p>
          </div>
          <span className="px-3 py-1 rounded bg-[#CDFE02]/10 text-[#CDFE02] border border-[#CDFE02]/20 text-xs font-mono font-bold print:hidden">
            Official System Report
          </span>
        </div>

        {/* 1. EXECUTIVE SUMMARY NUMBERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#09090C] border border-white/5 print:border print:border-zinc-300">
            <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block">
              Total Scheduled Checksheets
            </span>
            <span className="text-2xl font-extrabold text-white print:text-black font-mono">
              {data?.summary?.totalChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090C] border border-white/5 print:border print:border-zinc-300">
            <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block">
              Filled Up Checksheets
            </span>
            <span className="text-2xl font-extrabold text-emerald-400 print:text-emerald-700 font-mono">
              {data?.summary?.filledChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090C] border border-white/5 print:border print:border-zinc-300">
            <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block">
              Pending Checksheets
            </span>
            <span className="text-2xl font-extrabold text-amber-400 print:text-amber-700 font-mono">
              {data?.summary?.pendingChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-[#09090C] border border-white/5 print:border print:border-zinc-300">
            <span className="text-[10px] uppercase font-bold text-zinc-400 print:text-zinc-600 block">
              Total Tea Count
            </span>
            <span className="text-2xl font-extrabold text-[#CDFE02] print:text-black font-mono">
              {data?.summary?.totalTeaCount || 0} Cups
            </span>
          </div>
        </div>

        {/* 2. DEPARTMENT-WISE TEA DISTRIBUTION */}
        <div className="space-y-3">
          <h3 className="font-bold text-white print:text-black text-sm flex items-center gap-2">
            <Coffee className="w-4 h-4 text-[#CDFE02] print:text-black" />
            <span>Department-wise Tea Distribution ({data?.period})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data?.teaByDepartment || {}).map(([dName, count], idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-[#09090C] border border-white/5 print:border print:border-zinc-300 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-white print:text-black truncate">{dName}</span>
                <span className="font-mono font-bold text-[#CDFE02] print:text-black">{count} cups</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CHECKSHEET COMPLIANCE STATUS TABLE */}
        <div className="space-y-3">
          <h3 className="font-bold text-white print:text-black text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#CDFE02] print:text-black" />
            <span>Checksheet Status Breakdown</span>
          </h3>

          <div className="overflow-x-auto border border-white/5 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#09090C] print:bg-zinc-100 text-zinc-400 print:text-black font-semibold uppercase text-[10px] border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-4">Code</th>
                  <th className="py-2.5 px-4">Equipment / Check Sheet Name</th>
                  <th className="py-2.5 px-4">Category</th>
                  <th className="py-2.5 px-4">SLA Target</th>
                  <th className="py-2.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 print:divide-zinc-200">
                {data?.checksheets?.map((cs, idx) => {
                  const isFilled = idx < (data?.summary?.filledChecksheets || 0);
                  return (
                    <tr key={cs._id}>
                      <td className="py-2.5 px-4 font-mono font-bold text-zinc-400">{cs.code}</td>
                      <td className="py-2.5 px-4 font-semibold text-white print:text-black">{cs.title}</td>
                      <td className="py-2.5 px-4 text-zinc-400">{cs.category || "-"}</td>
                      <td className="py-2.5 px-4 text-zinc-400">{cs.slaHours ? `${cs.slaHours}h target` : "Daily"}</td>
                      <td className="py-2.5 px-4 text-right">
                        {isFilled ? (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            Filled Up
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

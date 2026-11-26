"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Reports & Downloads (Point 4)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileDown className="w-7 h-7 text-indigo-600" />
            <span>Reports & Downloads</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Check daily reports & monthly reports. Download every report in Excel / PDF.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Daily / Monthly Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
            <button
              onClick={() => setReportType("daily")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                reportType === "daily"
                  ? "bg-white text-indigo-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Daily Reports
            </button>
            <button
              onClick={() => setReportType("monthly")}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                reportType === "monthly"
                  ? "bg-white text-indigo-700 font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
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
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600 shadow-xs"
            />
          ) : (
            <input
              type="month"
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-900 font-mono text-xs focus:outline-none focus:border-indigo-600 shadow-xs"
            />
          )}

          {/* Download Buttons */}
          <Button
            variant="success"
            size="default"
            onClick={handleDownloadExcel}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={() => window.print()}
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print / PDF</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchReports}
            disabled={loading}
            title="Refresh"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* REPORT CONTENT (PRINTABLE) */}
      <Card className="space-y-6 p-6 print:border-none print:p-0 print:bg-white">
        {/* Printable Title Block */}
        <div className="border-b border-slate-200 pb-4 print:border-b-2 print:border-black flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 print:text-black">
              BAJAJ AUTO CANTEEN OPERATIONS {reportType.toUpperCase()} DOSSIER
            </h2>
            <p className="text-xs text-slate-500 print:text-zinc-600 font-mono">
              Period: {data?.period} • Facility: Akurdi Industrial Complex
            </p>
          </div>
          <Badge variant="indigo" className="print:hidden">
            Official System Report
          </Badge>
        </div>

        {/* 1. EXECUTIVE SUMMARY NUMBERS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Total Scheduled Checksheets
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {data?.summary?.totalChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Filled Up Checksheets
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">
              {data?.summary?.filledChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Pending Checksheets
            </span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono">
              {data?.summary?.pendingChecksheets || 0}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Total Tea Count
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">
              {data?.summary?.totalTeaCount || 0} Cups
            </span>
          </div>
        </div>

        {/* 2. DEPARTMENT-WISE TEA DISTRIBUTION */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Coffee className="w-4 h-4 text-indigo-600" />
            <span>Department-wise Tea Distribution ({data?.period})</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Object.entries(data?.teaByDepartment || {}).map(([dName, count], idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs"
              >
                <span className="font-medium text-slate-800 truncate">{dName}</span>
                <span className="font-mono font-bold text-indigo-700">{count} cups</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. CHECKSHEET COMPLIANCE STATUS TABLE */}
        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-indigo-600" />
            <span>Checksheet Status Breakdown</span>
          </h3>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Equipment / Check Sheet Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>SLA Target</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data?.checksheets?.map((cs, idx) => {
                  const isFilled = idx < (data?.summary?.filledChecksheets || 0);
                  return (
                    <TableRow key={cs._id}>
                      <TableCell className="font-mono font-bold text-indigo-600">{cs.code}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{cs.title}</TableCell>
                      <TableCell className="text-slate-500">{cs.category || "-"}</TableCell>
                      <TableCell className="text-slate-500">{cs.slaHours ? `${cs.slaHours}h target` : "Daily"}</TableCell>
                      <TableCell className="text-right">
                        {isFilled ? (
                          <Badge variant="success">
                            Filled Up
                          </Badge>
                        ) : (
                          <Badge variant="warning">
                            Pending
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

      </Card>
    </div>
  );
}

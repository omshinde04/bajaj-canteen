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
  UtensilsCrossed,
  Package,
  Radio,
} from "lucide-react";

export default function ReportsAndDownloadsPage() {
  const [reportType, setReportType] = useState("daily"); // "daily" or "monthly"
  const [date, setDate] = useState("");
  const [month, setMonth] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getCounterTitle = (c) => {
    if (c.shift === "VIP") {
      return c.mealType === "BREAKFAST" ? "VIP Breakfast Counter" : "VIP Lunch Counter";
    }
    if (c.shift === "SHIFT_1_GEN") {
      return c.mealType === "BREAKFAST" ? "Breakfast Counter" : "Lunch Counter";
    }
    if (c.shift === "SHIFT_2") {
      return c.mealType === "SNACKS" ? "Snacks Counter" : "Dinner Counter";
    }
    return `${c.mealType ? c.mealType.charAt(0) + c.mealType.slice(1).toLowerCase() : "Main"} Counter`;
  };

  const getShiftLabel = (shift) => {
    switch (shift) {
      case "SHIFT_1_GEN":
        return "Shift 1 & General";
      case "SHIFT_2":
        return "Shift 2";
      case "VIP":
        return "VIP Setup";
      default:
        return shift;
    }
  };

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
      const res = await fetch(url, { cache: "no-store" });
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

    // 2. Department-wise Tea Count (Cups)
    csvRows.push(["2. DEPARTMENT-WISE TEA DISTRIBUTION (CUPS)"]);
    csvRows.push(["Department Name", "Cups Count"]);
    Object.entries(data.teaByDepartment || {}).forEach(([dept, count]) => {
      csvRows.push([`"${dept}"`, count]);
    });
    csvRows.push(["Total Tea Cups", data.summary.totalTeaCount]);
    csvRows.push([]);

    // 3. Shop Floor Tea Liters & Wastage Log (Sheet 3)
    csvRows.push(["3. SHOP FLOOR TEA DISTRIBUTION & WASTAGE (LITERS)"]);
    csvRows.push(["Total Delivered Liters", data.summary.totalDeliveredLiters || 0]);
    csvRows.push(["Total Returned Liters", data.summary.totalReturnedLiters || 0]);
    csvRows.push(["Net Consumed Liters", data.summary.totalConsumedLiters || 0]);
    csvRows.push(["Department Wastage Liters", data.summary.totalWasteLiters || 0]);
    csvRows.push([]);
    csvRows.push(["Department", "Shift", "Delivered (L)", "Returned (L)", "Consumed (L)", "Wastage (L)"]);
    (data.teaDeliveryLogs || []).forEach((tl) => {
      csvRows.push([
        `"${tl.departmentName}"`,
        tl.shift,
        tl.deliveredLiters,
        tl.returnedLiters || 0,
        tl.consumedLiters || 0,
        tl.wasteLiters || 0,
      ]);
    });
    csvRows.push([]);

    // 4. Canteen Counters & Plate Counts (Sheets 1 & 2)
    csvRows.push(["4. CANTEEN COUNTER & PLATE AUDIT"]);
    csvRows.push(["Total Prepared Plates", data.summary.totalPreparedPlates || 0]);
    csvRows.push(["Total Consumed Plates", data.summary.totalConsumedPlates || 0]);
    csvRows.push(["Total Balance Plates", data.summary.totalBalancePlates || 0]);
    csvRows.push([]);
    csvRows.push(["Counter Name", "Shift", "Status", "Prepared Plates", "Consumed Plates", "Balance Plates"]);
    (data.counterLogs || []).forEach((c) => {
      csvRows.push([
        `"${getCounterTitle(c)}"`,
        getShiftLabel(c.shift),
        c.isReady ? "READY" : "NOT READY",
        c.totalPlates || 0,
        c.consumedPlates || 0,
        c.balancePlates || 0,
      ]);
    });
    csvRows.push([]);

    // 5. Biscuit Stock Ledger (Sheet 4)
    csvRows.push(["5. BISCUIT & INVENTORY AUDIT LEDGER"]);
    csvRows.push(["Product", "Date", "Opening Stock", "Added Stock", "1st Shift", "2nd Shift", "Total Consumed", "Closing Stock"]);
    (data.stockAuditLogs || []).forEach((s) => {
      csvRows.push([
        `"${s.productName}"`,
        s.date,
        s.openingStock,
        s.newAddedStock,
        s.shift1Consumption,
        s.shift2Consumption,
        s.totalConsumption,
        s.closingStock,
      ]);
    });
    csvRows.push([]);

    // 6. Overtime (OT) Headcount Dossier
    csvRows.push(["6. FACTORY OVERTIME (OT) HEADCOUNT DOSSIER"]);
    csvRows.push(["Department", "Date", "Shift", "2-Hour OT Count", "3-Hour OT Count", "Total OT Count", "Supervisor"]);
    (data.overtimeLogs || []).forEach((o) => {
      csvRows.push([
        `"${o.departmentName}"`,
        o.date,
        o.shift,
        o.twoHourCount || 0,
        o.threeHourCount || 0,
        o.totalCount || 0,
        `"${o.loggedBy || "Supervisor"}"`,
      ]);
    });
    csvRows.push([
      "Total Factory OT Headcount",
      data.period,
      "",
      data.summary?.totalTwoHourOT || 0,
      data.summary?.totalThreeHourOT || 0,
      data.summary?.totalOvertimeCount || 0,
      "",
    ]);

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
              REPORTS &amp; DOWNLOADS DOSSIER
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileDown className="w-7 h-7 text-indigo-600" />
            <span>Reports &amp; Downloads</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Comprehensive daily and monthly dossiers covering checksheets, tea liters logistics, food counter plate audits, and biscuit ledgers.
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
      <Card className="space-y-6 p-6 print:border-none print:p-0 print:bg-white bg-white border-slate-200">
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
              Scheduled Checksheets
            </span>
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {data?.summary?.totalChecksheets || 0}
            </span>
            <div className="text-[11px] text-emerald-600 mt-0.5">
              {data?.summary?.filledChecksheets || 0} Filled ({data?.summary?.fillupPercentage || 0}%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Tea Dispatched (Liters)
            </span>
            <span className="text-2xl font-extrabold text-indigo-600 font-mono">
              {data?.summary?.totalDeliveredLiters || 0} L
            </span>
            <div className="text-[11px] text-rose-600 mt-0.5">
              Waste: {data?.summary?.totalWasteLiters || 0} L
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Food Plates Served
            </span>
            <span className="text-2xl font-extrabold text-emerald-600 font-mono">
              {data?.summary?.totalConsumedPlates || 0}
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Balance: {data?.summary?.totalBalancePlates || 0}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-500 block">
              Tea Cups Tallied
            </span>
            <span className="text-2xl font-extrabold text-amber-600 font-mono">
              {data?.summary?.totalTeaCount || 0}
            </span>
            <div className="text-[11px] text-slate-500 mt-0.5">Line deliveries</div>
          </div>
        </div>

        {/* 2. CANTEEN COUNTER & PLATE COUNTS (SHEETS 1 & 2) */}
        {data?.counterLogs && data.counterLogs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-emerald-600" />
              <span>Canteen Counter Readiness &amp; Plate Audits</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Counter</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Readiness</TableHead>
                    <TableHead>Total Prepared</TableHead>
                    <TableHead>Consumed</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.counterLogs.map((c) => (
                    <TableRow key={c._id}>
                      <TableCell className="font-semibold text-slate-900">{getCounterTitle(c)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {getShiftLabel(c.shift)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.isReady ? "success" : "warning"} className="text-[10px]">
                          {c.isReady ? "Ready" : "Not Ready"}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono">{c.totalPlates || 0}</TableCell>
                      <TableCell className="font-mono font-bold text-indigo-600">{c.consumedPlates || 0}</TableCell>
                      <TableCell className="font-mono font-bold text-right text-slate-900">{c.balancePlates || 0}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 3. TEA LITERS LOGISTICS & WASTAGE (SHEET 3) */}
        {data?.teaDeliveryLogs && data.teaDeliveryLogs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Radio className="w-4 h-4 text-amber-600" />
              <span>Shop Floor Tea Delivery &amp; Wastage Log (Liters)</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>Delivered (L)</TableHead>
                    <TableHead>Returned (L)</TableHead>
                    <TableHead>Net Consumed (L)</TableHead>
                    <TableHead className="text-right">Dept. Wastage (L)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teaDeliveryLogs.map((t) => (
                    <TableRow key={t._id}>
                      <TableCell className="font-semibold text-slate-900">{t.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-xs">
                          {t.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-indigo-600">{t.deliveredLiters} L</TableCell>
                      <TableCell className="font-mono text-slate-700">{t.returnedLiters || 0} L</TableCell>
                      <TableCell className="font-mono font-bold text-emerald-600">{t.consumedLiters || 0} L</TableCell>
                      <TableCell className="font-mono font-bold text-right text-rose-600">{t.wasteLiters || 0} L</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 4. BISCUIT INVENTORY AUDIT LEDGERS (SHEET 4) */}
        {data?.stockAuditLogs && data.stockAuditLogs.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-purple-600" />
              <span>Biscuit &amp; Inventory Daily Roll-over Ledgers</span>
            </h3>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Opening Stock</TableHead>
                    <TableHead>New Added</TableHead>
                    <TableHead>1st Shift</TableHead>
                    <TableHead>2nd Shift</TableHead>
                    <TableHead>Total Consumed</TableHead>
                    <TableHead className="text-right">Closing Stock</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.stockAuditLogs.map((s) => (
                    <TableRow key={s._id}>
                      <TableCell className="font-semibold text-slate-900">{s.productName}</TableCell>
                      <TableCell className="font-mono text-xs">{s.date}</TableCell>
                      <TableCell className="font-mono">{s.openingStock}</TableCell>
                      <TableCell className="font-mono text-indigo-600">+{s.newAddedStock}</TableCell>
                      <TableCell className="font-mono">{s.shift1Consumption}</TableCell>
                      <TableCell className="font-mono">{s.shift2Consumption}</TableCell>
                      <TableCell className="font-mono font-bold text-amber-600">{s.totalConsumption}</TableCell>
                      <TableCell className="font-mono font-bold text-right text-emerald-700">{s.closingStock}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* FACTORY OVERTIME (OT) HEADCOUNT DOSSIER */}
        {data?.overtimeLogs && data.overtimeLogs.length > 0 && (
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>Factory Overtime (OT) Headcount Dossier</span>
              </h3>
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100 self-start sm:self-auto">
                Total OT Workers: {data.summary?.totalOvertimeCount || 0} (2h: {data.summary?.totalTwoHourOT || 0}, 3h: {data.summary?.totalThreeHourOT || 0})
              </span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Department / Factory Bay</TableHead>
                    <TableHead>Shift</TableHead>
                    <TableHead>2-Hour OT Count</TableHead>
                    <TableHead>3-Hour OT Count</TableHead>
                    <TableHead>Total OT Headcount</TableHead>
                    <TableHead className="text-right">Submitted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.overtimeLogs.map((o) => (
                    <TableRow key={o._id}>
                      <TableCell className="font-semibold text-slate-900">{o.departmentName}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {o.shift}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono font-bold text-blue-600">{o.twoHourCount || 0}</TableCell>
                      <TableCell className="font-mono font-bold text-indigo-600">{o.threeHourCount || 0}</TableCell>
                      <TableCell className="font-mono font-extrabold text-emerald-700">{o.totalCount || 0}</TableCell>
                      <TableCell className="text-right text-slate-500 text-xs">{o.loggedBy || "Supervisor"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {/* 5. CHECKSHEET COMPLIANCE STATUS TABLE */}
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
                {data?.checksheets?.slice(0, 15).map((cs) => {
                  const isFilled = (data?.submissions || []).some(
                    (s) => s.checkSheet?._id === cs._id || s.checkSheet === cs._id || s.checkSheet?.code === cs.code
                  );
                  return (
                    <TableRow key={cs._id}>
                      <TableCell className="font-mono font-bold text-indigo-600">{cs.code}</TableCell>
                      <TableCell className="font-semibold text-slate-900">{cs.title}</TableCell>
                      <TableCell className="text-slate-500">{cs.category || "-"}</TableCell>
                      <TableCell className="text-slate-500">{cs.slaHours ? `${cs.slaHours}h target` : "Daily"}</TableCell>
                      <TableCell className="text-right">
                        {isFilled ? (
                          <Badge variant="success">Filled Up</Badge>
                        ) : (
                          <Badge variant="warning">Pending</Badge>
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

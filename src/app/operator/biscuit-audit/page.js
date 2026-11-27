"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoaderBlock, Spinner } from "@/components/ui/loader";
import {
  CheckCircle2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Package,
  Save,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  ArrowDownRight,
  FileSpreadsheet,
} from "lucide-react";

const PRODUCTS = [
  { id: "parle-g", name: "Parle-G", code: "P-01", defaultInitial: 1000 },
  { id: "good-day", name: "Good Day", code: "GD-02", defaultInitial: 500 },
  { id: "marie-gold", name: "Marie Gold", code: "MG-03", defaultInitial: 500 },
  { id: "monaco", name: "Monaco", code: "MC-04", defaultInitial: 400 },
  { id: "krackjack", name: "Krackjack", code: "KJ-05", defaultInitial: 400 },
];

export default function BiscuitAuditPage() {
  const [selectedProduct, setSelectedProduct] = useState("parle-g");
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Form states for today's entry
  const [openingStock, setOpeningStock] = useState(0);
  const [newAddedStock, setNewAddedStock] = useState(0);
  const [shift1Consumption, setShift1Consumption] = useState(0);
  const [shift2Consumption, setShift2Consumption] = useState(0);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchAuditData = async () => {
    if (!selectedDate) return;
    setLoading(true);
    try {
      const res = await fetch(
        `/api/stock-audit?date=${selectedDate}&productId=${selectedProduct}`
      );
      const json = await res.json();
      if (json.success) {
        setData(json);

        // Find entry for current product
        const curEntry = (json.currentDayAudit || []).find(
          (e) => e.productId === selectedProduct
        );
        if (curEntry) {
          setOpeningStock(curEntry.openingStock || 0);
          setNewAddedStock(curEntry.newAddedStock || 0);
          setShift1Consumption(curEntry.shift1Consumption || 0);
          setShift2Consumption(curEntry.shift2Consumption || 0);
          setNotes(curEntry.notes || "");
        }
      }
    } catch (err) {
      console.error("Failed to load biscuit audit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData();
  }, [selectedDate, selectedProduct]);

  // Derived calculations
  const parsedOpening = Number(openingStock) || 0;
  const parsedAdded = Number(newAddedStock) || 0;
  const parsedShift1 = Number(shift1Consumption) || 0;
  const parsedShift2 = Number(shift2Consumption) || 0;

  // Formula as per Client Sheet 4:
  // Total Consumption = Shift 1 + Shift 2
  // Closing Stock = Opening + Added - Total Consumption
  const totalConsumption = parsedShift1 + parsedShift2;
  const closingStock = parsedOpening + parsedAdded - totalConsumption;

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/stock-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          productId: selectedProduct,
          openingStock: parsedOpening,
          newAddedStock: parsedAdded,
          shift1Consumption: parsedShift1,
          shift2Consumption: parsedShift2,
          notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const savedClosing =
          json.entry?.closingStock ?? json.audit?.closingStock ?? closingStock;
        setMessage({
          type: "success",
          text: `Audit log for ${currentProductObj?.name || "Product"} saved! Closing stock: ${savedClosing} pkts. Rolled over automatically for next day.`,
        });
        fetchAuditData();
      } else {
        setMessage({ type: "error", text: json.error || "Failed to save audit record." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const currentProductObj = PRODUCTS.find((p) => p.id === selectedProduct);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Pantry Inventory
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Auto Roll-Over Ledger
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            Biscuit Count &amp; Inventory Audit Ledger
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track daily opening stock, additions, 1st &amp; 2nd shift consumptions, and automatic closing stock roll-over across 5 products.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-800 focus:outline-none"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchAuditData}
            disabled={loading}
            className="border-slate-200"
          >
            <RotateCcw className={`w-4 h-4 mr-1.5 ${loading ? "animate-spin" : ""}`} />
            Sync
          </Button>
        </div>
      </div>

      {/* Product Selection Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {PRODUCTS.map((prod) => {
          const isSelected = selectedProduct === prod.id;
          return (
            <button
              key={prod.id}
              onClick={() => {
                setSelectedProduct(prod.id);
                setMessage(null);
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                isSelected
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Package className={`w-4 h-4 ${isSelected ? "text-white" : "text-slate-400"}`} />
              <span>{prod.name}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-indigo-700 text-indigo-100"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {prod.code}
              </span>
            </button>
          );
        })}
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">{message.text}</span>
          </div>
          <button
            onClick={() => setMessage(null)}
            className="text-xs hover:underline font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Grid: Today's Stock Entry & Auto Roll-over Explanation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form Card */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Daily Audit Entry: {currentProductObj?.name}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Log today&apos;s received additions and shift consumptions.
                </p>
              </div>
              <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                Date: {selectedDate}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              {/* Formula Formula Banner */}
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 flex flex-wrap items-center justify-between gap-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-indigo-600" />
                  Client Ledger Formula:
                </span>
                <code className="bg-white border border-slate-200 px-2 py-0.5 rounded text-indigo-700 font-mono">
                  Closing Stock = Opening + Added - (Shift 1 + Shift 2)
                </code>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Opening Stock */}
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700">
                      1. Opening Stock (Packets)
                    </label>
                    <Badge variant="secondary" className="text-[10px] bg-slate-200 text-slate-700">
                      Auto Carried
                    </Badge>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                    className="bg-white font-bold text-slate-900 text-lg border-slate-300"
                  />
                  <p className="text-[11px] text-slate-500">
                    Auto-carried from previous day&apos;s closing stock. Can adjust if physical audit differs.
                  </p>
                </div>

                {/* 2. New Added Stock */}
                <div className="space-y-1.5 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-indigo-900">
                      2. New Added Stock (Packets)
                    </label>
                    <span className="text-[10px] font-semibold text-indigo-600 bg-white px-2 py-0.5 rounded border border-indigo-200">
                      + Incoming
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={newAddedStock}
                    onChange={(e) => setNewAddedStock(e.target.value)}
                    placeholder="e.g. 1000"
                    className="bg-white font-bold text-indigo-900 text-lg border-indigo-200 focus:border-indigo-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Fresh stock received into kitchen pantry today.
                  </p>
                </div>

                {/* 3. 1st Shift Consumed */}
                <div className="space-y-1.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-900">
                      3. 1st Shift Consumed
                    </label>
                    <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Morning
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={shift1Consumption}
                    onChange={(e) => setShift1Consumption(e.target.value)}
                    placeholder="e.g. 250"
                    className="bg-white font-bold text-amber-900 text-lg border-amber-200 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Dispatched for Shift 1 breakfast &amp; general shift.
                  </p>
                </div>

                {/* 4. 2nd Shift Consumed */}
                <div className="space-y-1.5 bg-amber-50/50 p-3.5 rounded-xl border border-amber-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-amber-900">
                      4. 2nd Shift Consumed
                    </label>
                    <span className="text-[10px] font-semibold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-200">
                      Evening
                    </span>
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={shift2Consumption}
                    onChange={(e) => setShift2Consumption(e.target.value)}
                    placeholder="e.g. 250"
                    className="bg-white font-bold text-amber-900 text-lg border-amber-200 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Dispatched for Shift 2 tea &amp; snacks service.
                  </p>
                </div>
              </div>

              {/* Calculated Outputs Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900 text-white">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Daily Consumption</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1">
                    {totalConsumption}{" "}
                    <span className="text-xs font-normal text-slate-300">pkts</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    (Shift 1: {parsedShift1} + Shift 2: {parsedShift2})
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4">
                  <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span>Closing Stock (Automatic)</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      Rolls over to tomorrow
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 ${
                      closingStock < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {closingStock}{" "}
                    <span className="text-xs font-normal text-slate-300">pkts remaining</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({parsedOpening} + {parsedAdded} - {totalConsumption})
                  </div>
                </div>
              </div>

              {/* Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-700">Audit Remarks / Batch Notes (Optional)</label>
                <Input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Parle-G 100g standard packets carton lot #481"
                  className="bg-white text-sm border-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={fetchAuditData}
                  className="border-slate-200"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={saving || closingStock < 0}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6"
                >
                  {saving ? (
                    <>
                      <Spinner className="mr-2" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" /> Save &amp; Commit Daily Audit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Inventory Rules Card */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Inventory Accounting Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3.5 text-xs text-slate-600">
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 space-y-1">
                <span className="font-semibold text-indigo-950 block">Audit &amp; Roll-Over Standard:</span>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Daily closing balance automatically rolls over as tomorrow&apos;s opening balance, maintaining continuous variance-free pantry accounting.
                </p>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Automatic Next Day Roll-over:</span>
                    <p className="text-slate-500 mt-0.5">
                      Closing stock of Day N automatically becomes the Opening stock of Day N+1 without manual re-entry.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">5 Product Inventory:</span>
                    <p className="text-slate-500 mt-0.5">
                      Parle-G, Good Day, Marie Gold, Monaco, and Krackjack are monitored separately with identical ledger audit rules.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Consumption Balance:</span>
                    <p className="text-slate-500 mt-0.5">
                      Both Shift 1 and Shift 2 draws are tracked in real-time, giving exact canteen variance reports.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Product Status Summary */}
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center justify-between">
                <span>All 5 Products Today</span>
                <span className="text-xs font-normal text-slate-500">{selectedDate}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-3 divide-y divide-slate-100">
              {(data?.currentDayAudit || []).map((entry) => {
                const isCurrent = entry.productId === selectedProduct;
                return (
                  <div
                    key={entry.productId}
                    onClick={() => setSelectedProduct(entry.productId)}
                    className={`py-2 px-1.5 rounded-lg flex items-center justify-between cursor-pointer transition-colors ${
                      isCurrent ? "bg-indigo-50 font-medium" : "hover:bg-slate-50"
                    }`}
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                        {entry.productName}
                        {isCurrent && (
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600"></span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        Open: {entry.openingStock} | Added: {entry.newAddedStock}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-slate-900">
                        {entry.closingStock} <span className="text-[10px] font-normal text-slate-500">pkts</span>
                      </div>
                      <div className="text-[10px] text-amber-600">
                        Used: {entry.totalConsumption}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historical Ledger Table Matching Client Sheet 4 */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Ledger Audit Trail: {currentProductObj?.name}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact replica of client notebook format with automatic roll-over verification.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                Closing Roll-over
              </span>
              <span className="flex items-center gap-1 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block"></span>
                Added Stock
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Opening Stock</TableHead>
                  <TableHead className="font-semibold text-slate-700">New Added Stock</TableHead>
                  <TableHead className="font-semibold text-slate-700">1st Shift</TableHead>
                  <TableHead className="font-semibold text-slate-700">2nd Shift</TableHead>
                  <TableHead className="font-semibold text-slate-700">Total Consumption</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Closing Stock</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-center">Roll-over Link</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center">
                      <Spinner className="mx-auto" />
                      <div className="text-xs text-slate-500 mt-2">Loading audit ledger...</div>
                    </TableCell>
                  </TableRow>
                ) : !data?.recentLedger || data.recentLedger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-xs text-slate-500">
                      No ledger history found for {currentProductObj?.name}. Enter today&apos;s audit above.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentLedger.map((row, idx) => {
                    const nextRow = data.recentLedger[idx + 1];
                    const isRolledOverCorrectly =
                      nextRow && nextRow.openingStock === row.closingStock;

                    const isCurrentSelected = row.date === selectedDate;

                    return (
                      <TableRow
                        key={row._id || row.date}
                        className={isCurrentSelected ? "bg-indigo-50/40 font-medium" : "hover:bg-slate-50/70"}
                      >
                        <TableCell className="font-semibold text-slate-800">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {row.date}
                          </div>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-900">
                          {row.openingStock}
                        </TableCell>
                        <TableCell className="text-indigo-600 font-medium">
                          {row.newAddedStock > 0 ? `+${row.newAddedStock}` : "0"}
                        </TableCell>
                        <TableCell className="text-slate-700">{row.shift1Consumption}</TableCell>
                        <TableCell className="text-slate-700">{row.shift2Consumption}</TableCell>
                        <TableCell className="font-semibold text-amber-700">
                          {row.totalConsumption}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-right">
                          <span className="px-2.5 py-1 rounded bg-slate-100 font-mono text-sm">
                            {row.closingStock}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {nextRow ? (
                            isRolledOverCorrectly ? (
                              <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-normal inline-flex items-center gap-1">
                                <ArrowDownRight className="w-3 h-3 text-emerald-600" />
                                Rolls to {nextRow.date} ({nextRow.openingStock})
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px]">
                                Manual Adjusted
                              </Badge>
                            )
                          ) : (
                            <Badge variant="outline" className="text-slate-500 border-slate-200 text-[10px]">
                              Latest Record
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

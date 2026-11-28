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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
  Plus,
  Trash2,
  Truck,
  Check,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";

const PRODUCTS = [
  { id: "parle-g", name: "Parle-G", code: "P-01" },
  { id: "good-day", name: "Good Day", code: "GD-02" },
  { id: "marie-gold", name: "Marie Gold", code: "MG-03" },
  { id: "monaco", name: "Monaco", code: "MC-04" },
  { id: "krackjack", name: "Krackjack", code: "KJ-05" },
];

export default function BiscuitAuditPage() {
  const [selectedProduct, setSelectedProduct] = useState("parle-g");
  const [selectedDate, setSelectedDate] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  const [user, setUser] = useState(null);
  const [currentAuditEntry, setCurrentAuditEntry] = useState(null);

  // Form states for today's entry
  const [openingStock, setOpeningStock] = useState(0);
  const [newAddedStock, setNewAddedStock] = useState(0);
  const [deliveries, setDeliveries] = useState([]);
  const [shift1Consumption, setShift1Consumption] = useState(0);
  const [shift2Consumption, setShift2Consumption] = useState(0);
  const [notes, setNotes] = useState("");

  // Delivery Modal state
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [batchQuantity, setBatchQuantity] = useState("");
  const [batchNote, setBatchNote] = useState("");

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split("T")[0]);
    // Fetch logged in operator details
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setUser(d.user);
      })
      .catch(() => {});
  }, []);

  const fetchAuditData = async (isBackground = false) => {
    if (!selectedDate) return;
    if (!isBackground) setLoading(true);
    try {
      const res = await fetch(
        `/api/stock-audit?date=${selectedDate}&productId=${selectedProduct}`,
        { cache: "no-store" }
      );
      const json = await res.json();
      if (json.success) {
        setData(json);

        // Find entry for current product
        const curEntry = (json.currentDayAudit || []).find(
          (e) => e.productId === selectedProduct
        );
        setCurrentAuditEntry(curEntry || null);

        // ONLY update form input fields on explicit load/reset/save, NEVER during silent background polling!
        if (!isBackground) {
          if (curEntry) {
            setOpeningStock(curEntry.openingStock !== undefined ? curEntry.openingStock : 0);
            setNewAddedStock(curEntry.newAddedStock || 0);
            setDeliveries(curEntry.deliveries || []);
            setShift1Consumption(curEntry.shift1Consumption || 0);
            setShift2Consumption(curEntry.shift2Consumption || 0);
            setNotes(curEntry.notes || "");
          } else {
            setOpeningStock(0);
            setNewAddedStock(0);
            setDeliveries([]);
            setShift1Consumption(0);
            setShift2Consumption(0);
            setNotes("");
          }
        }
      }
    } catch (err) {
      console.error("Failed to load biscuit audit:", err);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditData(false);
    // Background polling every 20s updates ledger & notifications WITHOUT overwriting user's active inputs
    const interval = setInterval(() => {
      fetchAuditData(true);
    }, 20000);
    return () => clearInterval(interval);
  }, [selectedDate, selectedProduct]);

  // Derived calculations
  const parsedOpening = Number(openingStock) || 0;
  const parsedAdded = Number(newAddedStock) || 0;
  const parsedShift1 = Number(shift1Consumption) || 0;
  const parsedShift2 = Number(shift2Consumption) || 0;

  // Simple, intuitive math:
  // Total Available = Opening in Pantry + All Deliveries Arrived
  // Total Consumed = Shift 1 + Shift 2
  // Remaining Balance = Total Available - Total Consumed
  const totalAvailable = parsedOpening + parsedAdded;
  const totalConsumption = parsedShift1 + parsedShift2;
  const closingStock = totalAvailable - totalConsumption;

  // Add Delivery Batch handler
  const handleAddBatch = (e) => {
    e?.preventDefault();
    const qty = Number(batchQuantity);
    if (!qty || qty <= 0) return;

    const now = new Date();
    const timeStr = now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

    const newBatch = {
      quantity: qty,
      time: timeStr,
      note: batchNote.trim() || `Delivery #${deliveries.length + 1}`,
    };

    const updated = [...deliveries, newBatch];
    setDeliveries(updated);

    // Sum all deliveries into newAddedStock
    const sum = updated.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0);
    setNewAddedStock(sum);

    // Reset modal
    setBatchQuantity("");
    setBatchNote("");
    setDeliveryModalOpen(false);
  };

  // Remove a delivery batch
  const handleRemoveBatch = (index) => {
    const updated = deliveries.filter((_, idx) => idx !== index);
    setDeliveries(updated);
    const sum = updated.reduce((acc, d) => acc + (Number(d.quantity) || 0), 0);
    setNewAddedStock(sum);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const operatorName = user?.name
        ? `${user.name} (${user.role?.name || "Operator"})`
        : user?.role?.code === "OPERATOR_1"
        ? "Operator 1"
        : "Operator 2";

      const res = await fetch("/api/stock-audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: selectedDate,
          productId: selectedProduct,
          openingStock: parsedOpening,
          newAddedStock: parsedAdded,
          deliveries,
          shift1Consumption: parsedShift1,
          shift2Consumption: parsedShift2,
          notes,
          loggedBy: operatorName,
        }),
      });

      const json = await res.json();
      if (json.success) {
        const savedClosing =
          json.entry?.closingStock ?? json.audit?.closingStock ?? closingStock;
        setMessage({
          type: "success",
          text: `Audit log for ${currentProductObj?.name || "Product"} committed! Remaining stock balance: ${savedClosing} pkts.`,
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

  if (user && ["OPERATOR_3", "OT_SUPERVISOR"].includes(user.role?.code)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-purple-50 text-purple-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Biscuit Audit Restricted</h2>
        <p className="text-xs text-slate-600">
          Biscuit inventory audit is managed jointly by <b>Operator 1 and Operator 2</b>.
          You are currently signed in as <b>{user.name} ({user.role?.name})</b>.
        </p>
        <Link href={user.role?.code === "OPERATOR_3" ? "/operator/tea-delivery" : "/operator/overtime"}>
          <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            Go to Your Assigned Workspace →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 font-sans">
      {/* Page Header */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              Kitchen Pantry
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
              Live Stock Inventory
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-2 flex items-center gap-2">
            <Package className="w-7 h-7 text-indigo-600" />
            Biscuit Count &amp; Inventory Audit
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track available pantry stock, log fresh supplier deliveries, and record shift draws with automatic remaining balance.
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <Calendar className="w-4 h-4 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const val = e.target.value;
                const today = new Date().toISOString().split("T")[0];
                if (val > today) return;
                setSelectedDate(val);
              }}
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

      {/* TWO-WAY OPERATOR 1 & OPERATOR 2 SYNC BANNER */}
      <div className="bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border border-indigo-200/80 rounded-2xl p-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900">Shared Biscuit Pantry Synchronization</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Op 1 ⟷ Op 2
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Jointly managed by Operator 1 (Shift 1 &amp; VIP) &amp; Operator 2 (Checksheets). Changes made by either operator are instantly synced.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto text-xs font-medium text-slate-700 bg-white/80 border border-slate-200/80 px-3 py-1.5 rounded-xl">
            <span className="text-slate-400">Logged in as:</span>
            <span className="font-bold text-indigo-700">
              {user?.name || "Operator"} ({user?.role?.name || "Canteen Operator"})
            </span>
          </div>
        </div>

        {/* RECENT NOTIFICATIONS / AUDIT TRAIL */}
        {data?.recentActivity && data.recentActivity.length > 0 && (
          <div className="mt-3 pt-3 border-t border-indigo-100/80 flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Latest Sync Activity:</span>
            {data.recentActivity.slice(0, 2).map((act, idx) => (
              <span key={idx} className="bg-white px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 text-[11px] shadow-2xs">
                <b>{act.sender}:</b> {act.message.slice(0, 65)}...
              </span>
            ))}
          </div>
        )}
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
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap cursor-pointer ${
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
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
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

      {/* Main Grid: Today's Stock Entry */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Entry Form Card */}
        <Card className="lg:col-span-2 bg-white border-slate-200 shadow-xs">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  Daily Stock Entry: {currentProductObj?.name}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update starting stock, log incoming deliveries, and deduct shift consumption.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                {currentAuditEntry?.loggedBy && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                    <span className="text-slate-400">Last updated by:</span>
                    <span className="font-bold text-indigo-700">{currentAuditEntry.loggedBy}</span>
                  </div>
                )}
                <Badge variant="outline" className="border-indigo-200 text-indigo-700 bg-indigo-50">
                  Date: {selectedDate}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSave} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* 1. Starting Stock in Pantry (Freely Editable) */}
                <div className="space-y-1.5 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-800 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      1. Starting Pantry Stock (Previous Day Closing)
                    </label>
                    {currentAuditEntry?.hasPrevious ? (
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                        <Check className="w-3 h-3 text-emerald-600" />
                        From {currentAuditEntry.previousDate}: {currentAuditEntry.previousClosingStock} pkts
                      </span>
                    ) : (
                      <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-medium">
                        Initial Starting Count
                      </span>
                    )}
                  </div>
                  <Input
                    type="number"
                    min="0"
                    value={openingStock}
                    onChange={(e) => setOpeningStock(e.target.value)}
                    className="bg-white font-bold text-slate-900 text-xl border-slate-300"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                    <span>
                      {currentAuditEntry?.hasPrevious ? (
                        <>
                          Carried forward from <b>{currentAuditEntry.previousDate}</b> closing balance ({currentAuditEntry.previousClosingStock} pkts).
                          {Number(openingStock) !== Number(currentAuditEntry.previousClosingStock) && (
                            <span className="text-amber-700 font-semibold ml-1">
                              (Adjusted by {Number(openingStock) - Number(currentAuditEntry.previousClosingStock) > 0 ? "+" : ""}{Number(openingStock) - Number(currentAuditEntry.previousClosingStock)} pkts)
                            </span>
                          )}
                        </>
                      ) : (
                        "Physical count in kitchen pantry or stock allocated for today."
                      )}
                    </span>
                    {currentAuditEntry?.hasPrevious && Number(openingStock) !== Number(currentAuditEntry.previousClosingStock) && (
                      <button
                        type="button"
                        onClick={() => setOpeningStock(currentAuditEntry.previousClosingStock)}
                        className="text-[10px] text-indigo-600 hover:underline font-semibold cursor-pointer shrink-0 ml-2"
                      >
                        Reset to Previous ({currentAuditEntry.previousClosingStock})
                      </button>
                    )}
                  </div>
                </div>

                {/* 2. New Added Stock (+ Deliveries Accumulator) */}
                <div className="space-y-1.5 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-indigo-950 flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-indigo-600" />
                      2. Fresh Deliveries Received Today
                    </label>
                    <button
                      type="button"
                      onClick={() => setDeliveryModalOpen(true)}
                      className="text-[10px] font-semibold text-indigo-700 bg-white hover:bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3 text-indigo-600" /> + Add Delivery
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      value={newAddedStock}
                      onChange={(e) => setNewAddedStock(e.target.value)}
                      placeholder="e.g. 4000"
                      className="bg-white font-bold text-indigo-900 text-xl border-indigo-200 focus:border-indigo-500"
                    />
                  </div>

                  {/* List of Today's Delivery Batches */}
                  {deliveries.length > 0 ? (
                    <div className="mt-2 space-y-1 bg-white p-2 rounded-lg border border-indigo-100 text-xs">
                      <div className="text-[10px] font-semibold text-indigo-900">
                        Recorded Today ({deliveries.length} batch{deliveries.length > 1 ? "es" : ""}):
                      </div>
                      {deliveries.map((b, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between py-0.5 text-[11px] text-slate-700"
                        >
                          <span className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                            <span className="font-semibold text-indigo-900">+{b.quantity} pkts</span>
                            <span className="text-slate-400">({b.time || "Logged"})</span>
                            {b.note && <span className="text-slate-500 italic">• {b.note}</span>}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveBatch(idx)}
                            className="text-slate-400 hover:text-rose-600 transition p-0.5"
                            title="Remove delivery batch"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[11px] text-slate-500">
                      Total new stock received into kitchen pantry today.
                    </p>
                  )}
                </div>

                {/* 3. 1st Shift Consumed */}
                <div className="space-y-1.5 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
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
                    placeholder="e.g. 200 or 250"
                    className="bg-white font-bold text-amber-900 text-xl border-amber-200 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Packets issued for Shift 1 breakfast &amp; tea.
                  </p>
                </div>

                {/* 4. 2nd Shift Consumed */}
                <div className="space-y-1.5 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
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
                    placeholder="e.g. 200 or 250"
                    className="bg-white font-bold text-amber-900 text-xl border-amber-200 focus:border-amber-500"
                  />
                  <p className="text-[11px] text-slate-500">
                    Packets issued for Shift 2 tea &amp; snacks service.
                  </p>
                </div>
              </div>

              {/* Intuitive 3-Column Math Summary Banner */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 rounded-2xl bg-slate-900 text-white">
                <div>
                  <div className="text-xs text-slate-400 font-medium">Total Available Stock</div>
                  <div className="text-2xl font-bold text-indigo-300 mt-1 font-mono">
                    {totalAvailable}{" "}
                    <span className="text-xs font-normal text-slate-300">pkts</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({parsedOpening} starting + {parsedAdded} added)
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4">
                  <div className="text-xs text-slate-400 font-medium">Total Consumed Today</div>
                  <div className="text-2xl font-bold text-amber-400 mt-1 font-mono">
                    {totalConsumption}{" "}
                    <span className="text-xs font-normal text-slate-300">pkts</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    (Shift 1: {parsedShift1} + Shift 2: {parsedShift2})
                  </div>
                </div>

                <div className="border-t md:border-t-0 md:border-l border-slate-700 pt-3 md:pt-0 md:pl-4">
                  <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
                    <span>Remaining Balance</span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-mono">
                      In Pantry
                    </span>
                  </div>
                  <div
                    className={`text-2xl font-bold mt-1 font-mono ${
                      closingStock < 0 ? "text-rose-400" : "text-emerald-400"
                    }`}
                  >
                    {closingStock}{" "}
                    <span className="text-xs font-normal text-slate-300">pkts remaining</span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    ({totalAvailable} available - {totalConsumption} used)
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

              {closingStock < 0 && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Negative Balance Warning ({closingStock} pkts):</span>{" "}
                    Total consumption ({totalConsumption}) exceeds available stock ({totalAvailable}). Please check if starting stock or fresh deliveries need adjustment.
                  </div>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fetchAuditData(false)}
                  className="border-slate-200 cursor-pointer"
                >
                  Reset Form
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Spinner className="mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-1.5" />
                      Save &amp; Commit Daily Audit
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Sidebar: Rules & All 5 Products Today */}
        <div className="space-y-6">
          <Card className="bg-white border-slate-200 shadow-xs">
            <CardHeader className="pb-3 border-b border-slate-100">
              <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
                Floor Audit Rules
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs text-slate-600">
              <div className="bg-indigo-50/70 p-3 rounded-lg border border-indigo-100 space-y-1">
                <span className="font-semibold text-indigo-950 block">Simple Floor Inventory Rule:</span>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Start with available stock, add any shipments received, and subtract shift draws. The remaining balance rolls forward.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Multiple Deliveries Supported:</span>
                    <p className="text-slate-500 mt-0.5">
                      If 4,000 arrives in the morning and 9,000 in the afternoon, add both batches to get the true 13,000 total.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <div className="w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-[10px] shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="font-semibold text-slate-800">Flexible Shift Draws:</span>
                    <p className="text-slate-500 mt-0.5">
                      Shift consumption changes every day (sometimes 200, sometimes 250). Enter what is actually distributed.
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
                      <div className="text-xs font-bold text-slate-900 font-mono">
                        {entry.closingStock} <span className="text-[10px] font-normal text-slate-500">pkts</span>
                      </div>
                      <div className="text-[10px] text-amber-600 font-mono">
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

      {/* Historical Ledger Table */}
      <Card className="bg-white border-slate-200 shadow-xs">
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-600" />
                Ledger Audit Trail: {currentProductObj?.name}
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Daily record of starting stock, additions, shift draws, and remaining balance.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[120px] font-semibold text-slate-700">Date</TableHead>
                  <TableHead className="font-semibold text-slate-700">Opening (Carried)</TableHead>
                  <TableHead className="font-semibold text-slate-700">Fresh Deliveries</TableHead>
                  <TableHead className="font-semibold text-slate-700">Shift 1 Used</TableHead>
                  <TableHead className="font-semibold text-slate-700">Shift 2 Used</TableHead>
                  <TableHead className="font-semibold text-slate-700">Total Used</TableHead>
                  <TableHead className="font-semibold text-slate-700 text-right">Closing Balance (Rolls Over)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center">
                      <Spinner className="mx-auto" />
                      <div className="text-xs text-slate-500 mt-2">Loading audit ledger...</div>
                    </TableCell>
                  </TableRow>
                ) : !data?.recentLedger || data.recentLedger.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-xs text-slate-500">
                      No ledger history found for {currentProductObj?.name}. Enter today&apos;s audit above.
                    </TableCell>
                  </TableRow>
                ) : (
                  data.recentLedger.map((row) => {
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
                        <TableCell className="font-semibold text-slate-900 font-mono">
                          {row.openingStock}
                        </TableCell>
                        <TableCell className="text-indigo-600 font-medium font-mono">
                          {row.newAddedStock > 0 ? `+${row.newAddedStock}` : "0"}
                        </TableCell>
                        <TableCell className="text-slate-700 font-mono">{row.shift1Consumption}</TableCell>
                        <TableCell className="text-slate-700 font-mono">{row.shift2Consumption}</TableCell>
                        <TableCell className="font-semibold text-amber-700 font-mono">
                          {row.totalConsumption}
                        </TableCell>
                        <TableCell className="font-bold text-slate-900 text-right">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-mono text-xs font-bold">
                            <span>{row.closingStock} pkts</span>
                            <span className="text-[10px] text-emerald-600 font-medium">→ roll</span>
                          </span>
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

      {/* Add Delivery Batch Dialog Modal */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Truck className="w-5 h-5 text-indigo-600" />
              Add Delivery Batch ({currentProductObj?.name})
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddBatch} className="space-y-4 pt-2">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Packets Received in This Batch
              </label>
              <Input
                type="number"
                min="1"
                placeholder="e.g. 4000 or 9000"
                value={batchQuantity}
                onChange={(e) => setBatchQuantity(e.target.value)}
                autoFocus
                className="text-lg font-bold text-indigo-900"
              />

              {/* Quick Click Add Buttons */}
              <div className="flex items-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400">Quick:</span>
                {[500, 1000, 2000, 4000, 5000, 9000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setBatchQuantity(String(num))}
                    className="px-2 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-[10px] font-mono font-medium text-slate-700 border border-slate-200 transition cursor-pointer"
                  >
                    +{num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-700 block mb-1">
                Delivery Note / Challan / Truck (Optional)
              </label>
              <Input
                type="text"
                placeholder="e.g. Supplier Challan #104 / Truck 2"
                value={batchNote}
                onChange={(e) => setBatchNote(e.target.value)}
                className="text-sm"
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDeliveryModalOpen(false)}
                className="border-slate-200 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!batchQuantity || Number(batchQuantity) <= 0}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add to Today&apos;s Stock
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

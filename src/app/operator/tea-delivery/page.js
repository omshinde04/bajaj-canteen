"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  Coffee,
  Plus,
  Camera,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
  Clock,
  RefreshCw,
  Upload,
  ArrowRight,
  TrendingDown,
  Trash2,
  ShieldCheck,
} from "lucide-react";

export default function TeaDeliveryOperatorPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [date, setDate] = useState("");
  const [data, setData] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Delivery Modal State (Stage 1)
  const [deliveryModalOpen, setDeliveryModalOpen] = useState(false);
  const [delivering, setDelivering] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState({
    departmentId: "",
    deliveredLiters: 15,
    deliveryPhoto: "",
    notes: "",
  });

  // Return Modal State (Stage 2)
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [returning, setReturning] = useState(false);
  const [activeReturnLog, setActiveReturnLog] = useState(null);
  const [returnLiters, setReturnLiters] = useState(0);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
  }, []);

  const fetchData = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/tea-delivery?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
        setDepartments(json.departments || []);
        if (json.departments?.length > 0 && !deliveryForm.departmentId) {
          setDeliveryForm((p) => ({ ...p, departmentId: json.departments[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [date]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const d = await res.json();
      if (d.success && d.url) {
        setDeliveryForm((p) => ({ ...p, deliveryPhoto: d.url }));
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  // Stage 1: Submit Initial Delivery
  const handleDeliverySubmit = async (e) => {
    e.preventDefault();
    if (!deliveryForm.departmentId || deliveryForm.deliveredLiters === undefined) return;
    setDelivering(true);
    try {
      const res = await fetch("/api/tea-delivery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: "SHIFT_1",
          session: "MORNING",
          departmentId: deliveryForm.departmentId,
          deliveredLiters: Number(deliveryForm.deliveredLiters),
          deliveryPhoto: deliveryForm.deliveryPhoto,
          loggedBy: "Tea Operator",
          notes: deliveryForm.notes,
        }),
      });

      const json = await res.json();
      if (json.success) {
        setDeliveryModalOpen(false);
        setDeliveryForm({
          departmentId: departments[0]?._id || "",
          deliveredLiters: 15,
          deliveryPhoto: "",
          notes: "",
        });
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setDelivering(false);
    }
  };

  // Stage 2: Submit Returned Tea
  const openReturnModal = (log) => {
    setActiveReturnLog(log);
    setReturnLiters(log.returnedLiters || 0);
    setReturnModalOpen(true);
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    if (!activeReturnLog) return;
    setReturning(true);
    try {
      const res = await fetch("/api/tea-delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logId: activeReturnLog._id,
          returnedLiters: Number(returnLiters),
        }),
      });

      const json = await res.json();
      if (json.success) {
        setReturnModalOpen(false);
        setActiveReturnLog(null);
        fetchData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReturning(false);
    }
  };

  const summary = data?.summary || {
    totalDeliveredLiters: 0,
    totalReturnedLiters: 0,
    totalConsumedLiters: 0,
    totalWasteLiters: 0,
    totalDepartmentsServed: 0,
  };

  if (currentUser && ["OPERATOR_1", "OPERATOR_2", "OT_SUPERVISOR"].includes(currentUser.role?.code)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4 font-sans">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Operator 3 Module Restricted</h2>
        <p className="text-xs text-slate-600">
          Shop floor tea distribution and wastage are managed exclusively by <b>Operator 3</b>.
          You are currently signed in as <b>{currentUser.name} ({currentUser.role?.name})</b>.
        </p>
        <Link href={currentUser.role?.code === "OPERATOR_1" ? "/operator/counters" : currentUser.role?.code === "OPERATOR_2" ? "/operator/checksheets" : "/operator/overtime"}>
          <Button className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
            Go to Your Assigned Workspace →
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-amber-600">
              Shop Floor Logistics
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Coffee className="w-7 h-7 text-amber-500" />
            <span>Tea Distribution &amp; Wastage Log</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log dispatch kettle volumes in Liters with verification photos, collect returns, and track real-time departmental consumption &amp; wastage.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[11px] font-medium">Date:</span>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => {
                const val = e.target.value;
                const today = new Date().toISOString().split("T")[0];
                if (val > today) return;
                setDate(val);
              }}
              className="bg-transparent text-slate-900 font-mono text-xs focus:outline-none"
            />
          </div>

          <Button
            onClick={() => setDeliveryModalOpen(true)}
            className="bg-amber-600 hover:bg-amber-700 text-white font-bold"
          >
            <Plus className="w-4 h-4" />
            <span>+ Log Tea Delivery</span>
          </Button>

          <Button variant="outline" size="icon" onClick={fetchData} disabled={loading} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-amber-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* 4 TOP AUTOMATED KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Delivered */}
        <Card className="p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            1. Total Delivered
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-slate-900 font-mono">
              {summary.totalDeliveredLiters}
            </span>
            <span className="text-xs text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Total tea dispatched to plant</span>
        </Card>

        {/* 2. Returned */}
        <Card className="p-4 space-y-1 shadow-xs">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
            2. Total Returned
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-rose-600 font-mono">
              {summary.totalReturnedLiters}
            </span>
            <span className="text-xs text-slate-500">Liters</span>
          </div>
          <span className="text-[10px] text-slate-400 block">Unconsumed returned tea</span>
        </Card>

        {/* 3. Total Consumption (Formula: Delivered - Returned) */}
        <Card className="p-4 space-y-1 shadow-xs bg-indigo-50/50 border-indigo-100">
          <span className="text-[11px] font-semibold text-indigo-700 uppercase tracking-wider block">
            3. Net Consumed
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-indigo-700 font-mono">
              {summary.totalConsumedLiters}
            </span>
            <span className="text-xs text-indigo-600">Liters</span>
          </div>
          <span className="text-[10px] text-indigo-600 block">
            Automatic: (Delivered - Return)
          </span>
        </Card>

        {/* 4. Total Waste */}
        <Card className="p-4 space-y-1 shadow-xs bg-amber-50/50 border-amber-100">
          <span className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider block">
            4. Total Waste
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-extrabold text-amber-800 font-mono">
              {summary.totalWasteLiters}
            </span>
            <span className="text-xs text-amber-700">Liters Waste</span>
          </div>
          <span className="text-[10px] text-amber-600 block">
            Dept-wise surplus returned
          </span>
        </Card>
      </div>

      {/* DEPARTMENT-WISE WASTAGE SUMMARY BREAKDOWN */}
      {data?.deptBreakdown && Object.keys(data.deptBreakdown).length > 0 && (
        <Card className="p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <h3 className="font-bold text-slate-900 text-sm">Department-wise Wastage Breakdown</h3>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              Formula: (Delivered - Returned = Consumption)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {Object.entries(data.deptBreakdown).map(([dName, stats], idx) => {
              const wastePct = stats.delivered > 0 ? Math.round((stats.waste / stats.delivered) * 100) : 0;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-xs truncate">{dName}</span>
                    <Badge variant={wastePct > 20 ? "destructive" : "secondary"} className="text-[10px] font-mono">
                      {wastePct}% Waste
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between text-xs font-mono pt-1">
                    <span className="text-slate-500">Delivered: <strong>{stats.delivered}L</strong></span>
                    <span className="text-rose-600">Return: <strong>{stats.returned}L</strong></span>
                  </div>

                  <div className="text-[11px] text-emerald-700 font-semibold font-mono bg-white p-1.5 rounded-lg border border-slate-100 flex items-center justify-between">
                    <span>Consumed:</span>
                    <span>{stats.consumed} Liters</span>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* LIVE DEPARTMENT TEA LOGS TABLE */}
      <Card className="overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Live Department Tea Logs ({date})</h3>
            <span className="text-xs text-slate-500">
              Showing {data?.logs?.length || 0} distribution entries
            </span>
          </div>
          <span className="text-xs text-indigo-600 font-semibold">
            Tea Operator Ground Dispatches
          </span>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">
            <LoaderBlock text="Loading tea delivery records..." />
          </div>
        ) : !data?.logs || data.logs.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500 space-y-2">
            <Coffee className="w-8 h-8 text-slate-300 mx-auto" />
            <div className="font-semibold text-slate-700">No Tea Delivery Logged Yet</div>
            <p className="text-[11px] text-slate-500">
              Click &quot;+ Log Tea Delivery&quot; above to dispatch tea to factory departments.
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Delivered Liters</TableHead>
                <TableHead>Delivery Photo</TableHead>
                <TableHead>Returned Liters</TableHead>
                <TableHead>Total Consumed (Auto)</TableHead>
                <TableHead>Waste (Auto)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.logs.map((log) => {
                const isCompleted = log.status === "COMPLETED";
                return (
                  <TableRow key={log._id}>
                    <TableCell className="font-semibold text-slate-900 flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{log.departmentName}</span>
                    </TableCell>

                    <TableCell className="font-mono font-bold text-indigo-700">
                      {log.deliveredLiters} Liters
                    </TableCell>

                    <TableCell>
                      {log.deliveryPhoto ? (
                        <a
                          href={log.deliveryPhoto}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-indigo-600 font-semibold hover:underline"
                        >
                          <img
                            src={log.deliveryPhoto}
                            alt="Proof"
                            className="w-7 h-7 rounded-md object-cover border border-slate-200"
                          />
                          <span>View Proof</span>
                        </a>
                      ) : (
                        <span className="text-[11px] text-slate-400">No Photo</span>
                      )}
                    </TableCell>

                    <TableCell className="font-mono font-bold text-rose-600">
                      {log.returnedLiters} Liters
                    </TableCell>

                    <TableCell className="font-mono font-extrabold text-emerald-700">
                      {log.consumedLiters} Liters
                    </TableCell>

                    <TableCell className="font-mono font-bold text-amber-700">
                      {log.wasteLiters} Liters
                    </TableCell>

                    <TableCell>
                      {isCompleted ? (
                        <Badge variant="success" className="gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Return Logged</span>
                        </Badge>
                      ) : (
                        <Badge variant="warning" className="gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Return</span>
                        </Badge>
                      )}
                    </TableCell>

                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant={isCompleted ? "outline" : "default"}
                        onClick={() => openReturnModal(log)}
                        className={!isCompleted ? "bg-amber-600 hover:bg-amber-700 text-white" : ""}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>{isCompleted ? "Edit Return" : "Log Return"}</span>
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      {/* DIALOG 1: LOG TEA DELIVERY (STAGE 1) */}
      <Dialog open={deliveryModalOpen} onOpenChange={setDeliveryModalOpen}>
        <DialogContent onClose={() => setDeliveryModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Coffee className="w-5 h-5 text-amber-600" />
              <span>Step 1: Tea Delivery to Department</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleDeliverySubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Target Department (Eng, Forg, etc.)
              </label>
              <select
                value={deliveryForm.departmentId}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, departmentId: e.target.value })}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600"
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Tea किती Liters ठेवलाय (Delivered Quantity)
              </label>
              <Input
                type="number"
                step="any"
                min="0.5"
                required
                value={deliveryForm.deliveredLiters}
                onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveredLiters: e.target.value })}
                className="font-mono text-base font-bold"
              />
            </div>

            {/* Live Photo Proof */}
            <div className="space-y-2">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px] block">
                Submit Live Photo Proof (Mandatory)
              </label>
              {deliveryForm.deliveryPhoto ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={deliveryForm.deliveryPhoto} alt="Delivery Proof" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDeliveryForm({ ...deliveryForm, deliveryPhoto: "" })}
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 hover:border-amber-500 rounded-xl bg-slate-50 cursor-pointer transition-all text-center">
                  <Camera className="w-6 h-6 text-amber-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-800">Capture Live Delivery Photo</span>
                  <span className="text-[10px] text-slate-500">Camera click showing tea kettle at department</span>
                  <input type="file" accept="image/*" capture="environment" onChange={handlePhotoUpload} className="hidden" />
                </label>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDeliveryModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={delivering} className="bg-amber-600 hover:bg-amber-700 text-white">
                Submit Delivery
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* DIALOG 2: LOG TEA RETURN (STAGE 2) */}
      <Dialog open={returnModalOpen} onOpenChange={setReturnModalOpen}>
        <DialogContent onClose={() => setReturnModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-rose-600" />
              <span>Step 2: Return Tea Count (in Liters)</span>
            </DialogTitle>
          </DialogHeader>

          {activeReturnLog && (
            <form onSubmit={handleReturnSubmit} className="space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                <div className="text-slate-500">Department:</div>
                <div className="font-bold text-slate-900 text-sm">{activeReturnLog.departmentName}</div>
                <div className="text-slate-500 pt-1">Tea Delivered Earlier: <strong className="text-indigo-600">{activeReturnLog.deliveredLiters} Liters</strong></div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                  Tea किती Return आलाय (Returned Liters मध्ये)
                </label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  max={activeReturnLog.deliveredLiters}
                  required
                  value={returnLiters}
                  onChange={(e) => setReturnLiters(e.target.value)}
                  className="font-mono text-base font-bold text-rose-600"
                />
              </div>

              {/* Automatic Calculation Preview */}
              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl space-y-1 font-mono text-xs">
                <div className="flex justify-between text-indigo-900 font-bold">
                  <span>Automatic Net Consumption:</span>
                  <span>{Math.max(0, activeReturnLog.deliveredLiters - Number(returnLiters))} Liters</span>
                </div>
                <div className="flex justify-between text-amber-800 font-semibold">
                  <span>Wastage Recorded:</span>
                  <span>{Number(returnLiters)} Liters</span>
                </div>
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setReturnModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" loading={returning} className="bg-rose-600 hover:bg-rose-700 text-white font-bold">
                  Calculate & Save Return
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

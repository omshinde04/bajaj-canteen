"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { LoaderBlock } from "@/components/ui/loader";
import {
  Utensils,
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Save,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Crown,
  RefreshCw,
  Upload,
  Moon,
  Filter,
} from "lucide-react";

export default function OperatorCountersPage() {
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("SHIFT_1_GEN"); // "SHIFT_1_GEN", "SHIFT_2", "SHIFT_3", "VIP"
  const [activeVipTab, setActiveVipTab] = useState("BREAKFAST"); // "BREAKFAST", "LUNCH", "SNACKS", "DINNER"
  const [vipFilter, setVipFilter] = useState("ALL"); // "ALL", "CONSUMED", "BALANCE"
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState("");
  const [feedback, setFeedback] = useState("");

  const emptyShift1 = {
    BREAKFAST: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      shift1Count: 0,
      generalCount: 0,
      photo1stShift: "",
      photoGeneral: "",
      notes: "",
    },
    LUNCH: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      shift1Count: 0,
      generalCount: 0,
      photo1stShift: "",
      photoGeneral: "",
      notes: "",
    },
  };

  const emptyShift2 = {
    SNACKS: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
    DINNER: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
  };

  const emptyShift3 = {
    SNACKS: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
    DINNER: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
  };

  const emptyVip = {
    BREAKFAST: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
    LUNCH: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
    SNACKS: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
    DINNER: {
      isReady: false,
      totalPlates: 0,
      consumedPlates: 0,
      photo: "",
      notes: "",
    },
  };

  // Counter Forms State
  const [shift1Forms, setShift1Forms] = useState(emptyShift1);
  const [shift2Forms, setShift2Forms] = useState(emptyShift2);
  const [shift3Forms, setShift3Forms] = useState(emptyShift3);
  const [vipForms, setVipForms] = useState(emptyVip);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchLogs = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/counter-logs?date=${date}`, { cache: "no-store" });
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);

        const nextShift1 = JSON.parse(JSON.stringify(emptyShift1));
        const nextShift2 = JSON.parse(JSON.stringify(emptyShift2));
        const nextShift3 = JSON.parse(JSON.stringify(emptyShift3));
        const nextVip = JSON.parse(JSON.stringify(emptyVip));

        // Hydrate forms if logs exist
        (json.logs || []).forEach((log) => {
          if (log.shift === "SHIFT_1_GEN" && nextShift1[log.mealType]) {
            nextShift1[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              shift1Count: log.subShiftBreakdown?.shift1Count ?? 0,
              generalCount: log.subShiftBreakdown?.generalCount ?? 0,
              photo1stShift: log.photos?.find((p) => p.subShift === "1ST_SHIFT")?.url || "",
              photoGeneral: log.photos?.find((p) => p.subShift === "GENERAL")?.url || "",
              notes: log.notes || "",
            };
          } else if (log.shift === "SHIFT_2" && nextShift2[log.mealType]) {
            nextShift2[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              photo: log.photos?.[0]?.url || "",
              notes: log.notes || "",
            };
          } else if (log.shift === "SHIFT_3" && nextShift3[log.mealType]) {
            nextShift3[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              photo: log.photos?.[0]?.url || "",
              notes: log.notes || "",
            };
          } else if (log.shift === "VIP" && nextVip[log.mealType]) {
            nextVip[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              photo: log.photos?.[0]?.url || "",
              notes: log.notes || "",
            };
          }
        });

        setShift1Forms(nextShift1);
        setShift2Forms(nextShift2);
        setShift3Forms(nextShift3);
        setVipForms(nextVip);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [date]);

  // Handle Photo Upload
  const handlePhotoUpload = async (e, onUploaded) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success && data.url) {
        onUploaded(data.url);
      }
    } catch (err) {
      console.error("Photo upload failed:", err);
    }
  };

  // Save Shift 1 & General Meal
  const handleSaveShift1 = async (mealType) => {
    const form = shift1Forms[mealType];
    setSavingMeal(mealType);
    setFeedback("");
    try {
      const photos = [];
      if (form.photo1stShift) {
        photos.push({ url: form.photo1stShift, subShift: "1ST_SHIFT", caption: "1st Shift Counter" });
      }
      if (form.photoGeneral) {
        photos.push({ url: form.photoGeneral, subShift: "GENERAL", caption: "General Shift Counter" });
      }

      const res = await fetch("/api/counter-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: "SHIFT_1_GEN",
          mealType,
          isReady: form.isReady,
          totalPlates: Number(form.totalPlates),
          consumedPlates: Number(form.consumedPlates),
          subShiftBreakdown: {
            shift1Count: Number(form.shift1Count),
            generalCount: Number(form.generalCount),
          },
          photos,
          notes: form.notes,
          loggedBy: "Operator 1",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`${mealType} Counter Log saved successfully!`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeal("");
    }
  };

  // Save Shift 2 Meal
  const handleSaveShift2 = async (mealType) => {
    const form = shift2Forms[mealType];
    setSavingMeal(mealType);
    setFeedback("");
    try {
      const photos = form.photo ? [{ url: form.photo, subShift: "STANDARD", caption: `${mealType} Setup` }] : [];

      const res = await fetch("/api/counter-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: "SHIFT_2",
          mealType,
          isReady: form.isReady,
          totalPlates: Number(form.totalPlates),
          consumedPlates: Number(form.consumedPlates),
          photos,
          notes: form.notes,
          loggedBy: "Operator 1",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Shift 2 ${mealType} Log saved successfully!`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeal("");
    }
  };

  // Save Shift 3 Meal (Night Snacks & Dinner)
  const handleSaveShift3 = async (mealType) => {
    const form = shift3Forms[mealType];
    setSavingMeal(`SHIFT_3_${mealType}`);
    setFeedback("");
    try {
      const photos = form.photo ? [{ url: form.photo, subShift: "STANDARD", caption: `Shift 3 ${mealType}` }] : [];

      const res = await fetch("/api/counter-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: "SHIFT_3",
          mealType,
          isReady: form.isReady,
          totalPlates: Number(form.totalPlates),
          consumedPlates: Number(form.consumedPlates),
          photos,
          notes: form.notes,
          loggedBy: "Operator 1",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`Shift 3 ${mealType} Log saved successfully!`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeal("");
    }
  };

  // Save VIP Counter
  const handleSaveVip = async (mealType) => {
    const form = vipForms[mealType];
    setSavingMeal(mealType);
    setFeedback("");
    try {
      const photos = form.photo ? [{ url: form.photo, subShift: "STANDARD", caption: `VIP ${mealType}` }] : [];

      const res = await fetch("/api/counter-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift: "VIP",
          mealType,
          isReady: form.isReady,
          totalPlates: Number(form.totalPlates),
          consumedPlates: Number(form.consumedPlates),
          photos,
          notes: form.notes,
          loggedBy: "Operator 1",
        }),
      });

      const json = await res.json();
      if (json.success) {
        setFeedback(`VIP ${mealType} Log saved successfully!`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeal("");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Food Service &amp; Dining
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-indigo-600" />
            <span>Counter Readiness &amp; Plate Counts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Confirm counter service readiness, capture shift verification photos, and record prepared vs consumed plates.
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

          <Button variant="outline" size="icon" onClick={fetchLogs} disabled={loading} title="Refresh">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between shadow-xs animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{feedback}</span>
          </div>
          <button onClick={() => setFeedback("")} className="text-emerald-700 font-bold hover:underline">
            ✕
          </button>
        </div>
      )}

      {/* TABS SWITCHER */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("SHIFT_1_GEN")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_1_GEN"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift 1 &amp; General (Breakfast + Lunch)</span>
        </button>

        <button
          onClick={() => setActiveTab("SHIFT_2")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_2"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Shift 2 (Snacks &amp; Dinner)</span>
        </button>

        <button
          onClick={() => setActiveTab("SHIFT_3")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_3"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-300" />
          <span>Shift 3 (Night Snacks &amp; Dinner)</span>
        </button>

        <button
          onClick={() => setActiveTab("VIP")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "VIP"
              ? "bg-amber-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-400" />
          <span>VIP Dining Suite (4 Meals)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: SHIFT 1 & GENERAL (BREAKFAST & LUNCH WITH SEPARATE CLICKS)        */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_1_GEN" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SECTION 1: BREAKFAST COUNTER */}
          <Card className="p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Breakfast Service
                </span>
                <h3 className="text-lg font-bold text-slate-900">Breakfast Counter Setup</h3>
                <p className="text-xs text-slate-500">1st Shift & General Shift (Separate Live Photos)</p>
              </div>

              {/* Ready / Not Ready Toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift1Forms((p) => ({
                      ...p,
                      BREAKFAST: { ...p.BREAKFAST, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift1Forms.BREAKFAST.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift1Forms((p) => ({
                      ...p,
                      BREAKFAST: { ...p.BREAKFAST, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift1Forms.BREAKFAST.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* SEPARATE LIVE PHOTOS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Live Photo Proof (1st Shift & General Separate Click)
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* 1st Shift Live Photo */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
                  <span className="text-[11px] font-bold text-slate-700 block">1st Shift Photo</span>
                  {shift1Forms.BREAKFAST.photo1stShift ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={shift1Forms.BREAKFAST.photo1stShift}
                        alt="1st Shift"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShift1Forms((p) => ({
                            ...p,
                            BREAKFAST: { ...p.BREAKFAST, photo1stShift: "" },
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-600 bg-white">
                      <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-700">Capture 1st Shift</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          handlePhotoUpload(e, (url) =>
                            setShift1Forms((p) => ({
                              ...p,
                              BREAKFAST: { ...p.BREAKFAST, photo1stShift: url },
                            }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* General Shift Live Photo */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
                  <span className="text-[11px] font-bold text-slate-700 block">General Shift Photo</span>
                  {shift1Forms.BREAKFAST.photoGeneral ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={shift1Forms.BREAKFAST.photoGeneral}
                        alt="General Shift"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShift1Forms((p) => ({
                            ...p,
                            BREAKFAST: { ...p.BREAKFAST, photoGeneral: "" },
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-600 bg-white">
                      <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-700">Capture General</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          handlePhotoUpload(e, (url) =>
                            setShift1Forms((p) => ({
                              ...p,
                              BREAKFAST: { ...p.BREAKFAST, photoGeneral: url },
                            }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* PLATE COUNTS (TOTAL vs CONSUMED) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Breakfast Plate Counts (ex: 600 / 550)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift1Forms.BREAKFAST.totalPlates) - Number(shift1Forms.BREAKFAST.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={shift1Forms.BREAKFAST.totalPlates}
                    onChange={(e) =>
                      setShift1Forms((p) => ({
                        ...p,
                        BREAKFAST: { ...p.BREAKFAST, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift1Forms.BREAKFAST.consumedPlates}
                    onChange={(e) =>
                      setShift1Forms((p) => ({
                        ...p,
                        BREAKFAST: { ...p.BREAKFAST, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSaveShift1("BREAKFAST")}
              loading={savingMeal === "BREAKFAST"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Breakfast Setup & Counts</span>
            </Button>
          </Card>

          {/* SECTION 2: LUNCH COUNTER */}
          <Card className="p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Lunch Service
                </span>
                <h3 className="text-lg font-bold text-slate-900">Lunch Counter Setup</h3>
                <p className="text-xs text-slate-500">1st Shift & General Shift (Separate Live Photos)</p>
              </div>

              {/* Ready / Not Ready Toggle */}
              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift1Forms((p) => ({
                      ...p,
                      LUNCH: { ...p.LUNCH, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift1Forms.LUNCH.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift1Forms((p) => ({
                      ...p,
                      LUNCH: { ...p.LUNCH, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift1Forms.LUNCH.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* SEPARATE LIVE PHOTOS */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Live Photo Proof (1st Shift & General Separate Click)
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* 1st Shift Live Photo */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
                  <span className="text-[11px] font-bold text-slate-700 block">1st Shift Photo</span>
                  {shift1Forms.LUNCH.photo1stShift ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={shift1Forms.LUNCH.photo1stShift}
                        alt="1st Shift Lunch"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShift1Forms((p) => ({
                            ...p,
                            LUNCH: { ...p.LUNCH, photo1stShift: "" },
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-600 bg-white">
                      <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-700">Capture 1st Shift</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          handlePhotoUpload(e, (url) =>
                            setShift1Forms((p) => ({
                              ...p,
                              LUNCH: { ...p.LUNCH, photo1stShift: url },
                            }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* General Shift Live Photo */}
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
                  <span className="text-[11px] font-bold text-slate-700 block">General Shift Photo</span>
                  {shift1Forms.LUNCH.photoGeneral ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200">
                      <img
                        src={shift1Forms.LUNCH.photoGeneral}
                        alt="General Shift Lunch"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShift1Forms((p) => ({
                            ...p,
                            LUNCH: { ...p.LUNCH, photoGeneral: "" },
                          }))
                        }
                        className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-indigo-600 bg-white">
                      <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                      <span className="text-[11px] font-semibold text-slate-700">Capture General</span>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) =>
                          handlePhotoUpload(e, (url) =>
                            setShift1Forms((p) => ({
                              ...p,
                              LUNCH: { ...p.LUNCH, photoGeneral: url },
                            }))
                          )
                        }
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            {/* PLATE COUNTS (TOTAL vs CONSUMED) */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Lunch Plate Counts (ex: 600 / 450)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift1Forms.LUNCH.totalPlates) - Number(shift1Forms.LUNCH.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={shift1Forms.LUNCH.totalPlates}
                    onChange={(e) =>
                      setShift1Forms((p) => ({
                        ...p,
                        LUNCH: { ...p.LUNCH, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift1Forms.LUNCH.consumedPlates}
                    onChange={(e) =>
                      setShift1Forms((p) => ({
                        ...p,
                        LUNCH: { ...p.LUNCH, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSaveShift1("LUNCH")}
              loading={savingMeal === "LUNCH"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Lunch Setup & Counts</span>
            </Button>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: SHIFT 2 (SNACKS & DINNER)                                         */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_2" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SNACKS COUNTER */}
          <Card className="p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600">
                  Item 1
                </span>
                <h3 className="text-lg font-bold text-slate-900">Snacks (Breakfast) Counter Setup</h3>
                <p className="text-xs text-slate-500">Shift 2 Afternoon Operation</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift2Forms((p) => ({
                      ...p,
                      SNACKS: { ...p.SNACKS, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift2Forms.SNACKS.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift2Forms((p) => ({
                      ...p,
                      SNACKS: { ...p.SNACKS, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift2Forms.SNACKS.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* LIVE PHOTO */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Snacks Live Image
              </label>
              {shift2Forms.SNACKS.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={shift2Forms.SNACKS.photo} alt="Snacks Setup" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setShift2Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-600 bg-slate-50">
                  <Camera className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture Snacks Counter Live Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setShift2Forms((p) => ({
                          ...p,
                          SNACKS: { ...p.SNACKS, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Total Plate Count (ex: 600 / 600)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift2Forms.SNACKS.totalPlates) - Number(shift2Forms.SNACKS.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Plates</label>
                  <Input
                    type="number"
                    value={shift2Forms.SNACKS.totalPlates}
                    onChange={(e) =>
                      setShift2Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift2Forms.SNACKS.consumedPlates}
                    onChange={(e) =>
                      setShift2Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSaveShift2("SNACKS")}
              loading={savingMeal === "SNACKS"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Snacks Setup & Counts</span>
            </Button>
          </Card>

          {/* DINNER COUNTER */}
          <Card className="p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                  Lunch Service
                </span>
                <h3 className="text-lg font-bold text-slate-900">Dinner Counter Setup</h3>
                <p className="text-xs text-slate-500">Shift 2 Night Operation</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift2Forms((p) => ({
                      ...p,
                      DINNER: { ...p.DINNER, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift2Forms.DINNER.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift2Forms((p) => ({
                      ...p,
                      DINNER: { ...p.DINNER, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift2Forms.DINNER.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* LIVE PHOTO */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Dinner Live Photo
              </label>
              {shift2Forms.DINNER.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={shift2Forms.DINNER.photo} alt="Dinner Setup" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setShift2Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-600 bg-slate-50">
                  <Camera className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture Dinner Counter Live Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setShift2Forms((p) => ({
                          ...p,
                          DINNER: { ...p.DINNER, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Total Plate Count (ex: 600 / 400)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift2Forms.DINNER.totalPlates) - Number(shift2Forms.DINNER.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Plates</label>
                  <Input
                    type="number"
                    value={shift2Forms.DINNER.totalPlates}
                    onChange={(e) =>
                      setShift2Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift2Forms.DINNER.consumedPlates}
                    onChange={(e) =>
                      setShift2Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            <Button
              onClick={() => handleSaveShift2("DINNER")}
              loading={savingMeal === "DINNER"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Dinner Setup & Counts</span>
            </Button>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SHIFT 3 (NIGHT SNACKS & DINNER)                                   */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_3" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* SHIFT 3 SNACKS */}
          <Card className="p-6 space-y-5 shadow-xs border-indigo-100 bg-gradient-to-b from-indigo-50/20 to-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night Operation 1</span>
                </span>
                <h3 className="text-lg font-bold text-slate-900">Shift 3 Snacks Counter</h3>
                <p className="text-xs text-slate-500">Night Shift Refreshments Setup &amp; Plates</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift3Forms((p) => ({
                      ...p,
                      SNACKS: { ...p.SNACKS, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift3Forms.SNACKS.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift3Forms((p) => ({
                      ...p,
                      SNACKS: { ...p.SNACKS, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift3Forms.SNACKS.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* LIVE PHOTO */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Shift 3 Snacks Live Image
              </label>
              {shift3Forms.SNACKS.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={shift3Forms.SNACKS.photo} alt="Shift 3 Snacks" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setShift3Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-600 bg-white">
                  <Camera className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture Shift 3 Snacks Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setShift3Forms((p) => ({
                          ...p,
                          SNACKS: { ...p.SNACKS, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Plates (Prepared / Consumed)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift3Forms.SNACKS.totalPlates) - Number(shift3Forms.SNACKS.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={shift3Forms.SNACKS.totalPlates}
                    onChange={(e) =>
                      setShift3Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift3Forms.SNACKS.consumedPlates}
                    onChange={(e) =>
                      setShift3Forms((p) => ({
                        ...p,
                        SNACKS: { ...p.SNACKS, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Operational Notes</label>
              <Input
                type="text"
                placeholder="e.g. Dispatched to late night shift line"
                value={shift3Forms.SNACKS.notes}
                onChange={(e) =>
                  setShift3Forms((p) => ({
                    ...p,
                    SNACKS: { ...p.SNACKS, notes: e.target.value },
                  }))
                }
              />
            </div>

            <Button
              onClick={() => handleSaveShift3("SNACKS")}
              loading={savingMeal === "SHIFT_3_SNACKS"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Shift 3 Snacks Setup &amp; Counts</span>
            </Button>
          </Card>

          {/* SHIFT 3 DINNER */}
          <Card className="p-6 space-y-5 shadow-xs border-indigo-100 bg-gradient-to-b from-indigo-50/20 to-white">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1">
                  <Moon className="w-3.5 h-3.5" />
                  <span>Night Operation 2</span>
                </span>
                <h3 className="text-lg font-bold text-slate-900">Shift 3 Dinner Counter</h3>
                <p className="text-xs text-slate-500">Night Shift Dinner Setup &amp; Plates</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setShift3Forms((p) => ({
                      ...p,
                      DINNER: { ...p.DINNER, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    shift3Forms.DINNER.isReady
                      ? "bg-emerald-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Ready
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setShift3Forms((p) => ({
                      ...p,
                      DINNER: { ...p.DINNER, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !shift3Forms.DINNER.isReady
                      ? "bg-rose-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Not Ready
                </button>
              </div>
            </div>

            {/* LIVE PHOTO */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
                Shift 3 Dinner Live Image
              </label>
              {shift3Forms.DINNER.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={shift3Forms.DINNER.photo} alt="Shift 3 Dinner" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setShift3Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-600 bg-white">
                  <Camera className="w-6 h-6 text-indigo-600 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture Shift 3 Dinner Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setShift3Forms((p) => ({
                          ...p,
                          DINNER: { ...p.DINNER, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  Plates (Prepared / Consumed)
                </span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(shift3Forms.DINNER.totalPlates) - Number(shift3Forms.DINNER.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={shift3Forms.DINNER.totalPlates}
                    onChange={(e) =>
                      setShift3Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, totalPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Consumed Plates</label>
                  <Input
                    type="number"
                    value={shift3Forms.DINNER.consumedPlates}
                    onChange={(e) =>
                      setShift3Forms((p) => ({
                        ...p,
                        DINNER: { ...p.DINNER, consumedPlates: e.target.value },
                      }))
                    }
                    className="font-mono text-base font-bold text-emerald-700"
                  />
                </div>
              </div>
            </div>

            {/* NOTES */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Operational Notes</label>
              <Input
                type="text"
                placeholder="e.g. Night shift production dinner service"
                value={shift3Forms.DINNER.notes}
                onChange={(e) =>
                  setShift3Forms((p) => ({
                    ...p,
                    DINNER: { ...p.DINNER, notes: e.target.value },
                  }))
                }
              />
            </div>

            <Button
              onClick={() => handleSaveShift3("DINNER")}
              loading={savingMeal === "SHIFT_3_DINNER"}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save Shift 3 Dinner Setup &amp; Counts</span>
            </Button>
          </Card>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: VIP DINING SUITE (4 DEDICATED TABS & FILTERS)                      */}
      {/* ========================================================================= */}
      {activeTab === "VIP" && (
        <div className="space-y-6">
          {/* VIP EXECUTIVE SUMMARY HEADER */}
          {(() => {
            const meals = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
            const totalPrepared = meals.reduce((sum, m) => sum + Number(vipForms[m]?.totalPlates || 0), 0);
            const totalConsumed = meals.reduce((sum, m) => sum + Number(vipForms[m]?.consumedPlates || 0), 0);
            const totalBalance = Math.max(0, totalPrepared - totalConsumed);
            const readyCount = meals.filter((m) => vipForms[m]?.isReady).length;

            return (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700">VIP Prepared</span>
                    <Crown className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-amber-950 font-mono mt-1">{totalPrepared}</div>
                  <p className="text-[10px] text-amber-700/80 mt-0.5">Plates across 4 meals</p>
                </div>

                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">VIP Consumed</span>
                    <Utensils className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-emerald-950 font-mono mt-1">{totalConsumed}</div>
                  <p className="text-[10px] text-emerald-700/80 mt-0.5">Plates consumed today</p>
                </div>

                <div className="bg-gradient-to-br from-indigo-500/10 to-indigo-500/5 border border-indigo-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700">VIP Balance</span>
                    <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-indigo-950 font-mono mt-1">{totalBalance}</div>
                  <p className="text-[10px] text-indigo-700/80 mt-0.5">Remaining balance</p>
                </div>

                <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-200/80 rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700">Service Status</span>
                    <Sparkles className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="text-2xl font-extrabold text-purple-950 font-mono mt-1">{readyCount} / 4</div>
                  <p className="text-[10px] text-purple-700/80 mt-0.5">Counters marked ready</p>
                </div>
              </div>
            );
          })()}

          {/* VIP 4 MEAL TABS + FILTER CONTROLS */}
          <div className="bg-white border border-amber-200/80 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              {/* 4 Dedicated VIP Tabs */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { key: "BREAKFAST", label: "VIP Breakfast", time: "07:30 - 09:30" },
                  { key: "LUNCH", label: "VIP Lunch", time: "12:00 - 14:00" },
                  { key: "SNACKS", label: "VIP Snacks", time: "16:00 - 17:30" },
                  { key: "DINNER", label: "VIP Dinner", time: "19:30 - 21:30" },
                ].map((item) => {
                  const isCurrent = activeVipTab === item.key;
                  const isMealReady = vipForms[item.key]?.isReady;
                  const consumed = Number(vipForms[item.key]?.consumedPlates || 0);
                  const total = Number(vipForms[item.key]?.totalPlates || 0);

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveVipTab(item.key)}
                      className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                        isCurrent
                          ? "bg-amber-600 text-white shadow-sm ring-2 ring-amber-300"
                          : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                      }`}
                    >
                      <Crown className={`w-3.5 h-3.5 ${isCurrent ? "text-amber-200" : "text-amber-500"}`} />
                      <span>{item.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded-full font-mono ${
                          isCurrent
                            ? "bg-white/20 text-white"
                            : isMealReady
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-slate-200 text-slate-600"
                        }`}
                      >
                        {isMealReady ? "Ready" : "Pending"}
                      </span>
                      {total > 0 && (
                        <span className={`text-[10px] font-mono ${isCurrent ? "text-amber-100" : "text-slate-500"}`}>
                          ({consumed}/{total})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Status & Consumption Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl p-1">
                <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
                {[
                  { key: "ALL", label: "All" },
                  { key: "CONSUMED", label: "Consumed > 0" },
                  { key: "BALANCE", label: "Balance > 0" },
                ].map((flt) => (
                  <button
                    key={flt.key}
                    type="button"
                    onClick={() => setVipFilter(flt.key)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
                      vipFilter === flt.key
                        ? "bg-amber-600 text-white shadow-2xs"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {flt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ACTIVE VIP TAB EDIT FORM CARD */}
          {(() => {
            const form = vipForms[activeVipTab] || emptyVip[activeVipTab];
            const balancePlates = Math.max(0, Number(form.totalPlates || 0) - Number(form.consumedPlates || 0));

            // Check filter match
            let matchesFilter = true;
            if (vipFilter === "CONSUMED" && Number(form.consumedPlates || 0) <= 0) matchesFilter = false;
            if (vipFilter === "BALANCE" && balancePlates <= 0) matchesFilter = false;

            return (
              <Card className="p-6 space-y-6 shadow-sm border-amber-200 bg-gradient-to-b from-amber-50/25 via-white to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
                      <Crown className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                          VIP Service Active
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            form.isReady
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : "bg-rose-100 text-rose-800 border border-rose-200"
                          }`}
                        >
                          {form.isReady ? "READY FOR SERVICE" : "NOT READY"}
                        </span>
                      </div>
                      <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
                        VIP {activeVipTab} Dining Setup
                      </h3>
                      <p className="text-xs text-slate-500">
                        Record counter readiness, proof photo, and plate allocation for executive dining.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-100 border border-slate-200 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() =>
                        setVipForms((p) => ({
                          ...p,
                          [activeVipTab]: { ...p[activeVipTab], isReady: true },
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        form.isReady
                          ? "bg-emerald-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Ready
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setVipForms((p) => ({
                          ...p,
                          [activeVipTab]: { ...p[activeVipTab], isReady: false },
                        }))
                      }
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition cursor-pointer ${
                        !form.isReady
                          ? "bg-rose-600 text-white shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      Not Ready
                    </button>
                  </div>
                </div>

                {!matchesFilter && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    Notice: Current tab does not match the active filter ({vipFilter}). Reset filter to view normal details.
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* LIVE PHOTO PROOF */}
                  <div className="space-y-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                      <span>VIP {activeVipTab} Live Photo Proof</span>
                      {form.photo && <span className="text-emerald-600 text-[10px] font-semibold">Photo Attached</span>}
                    </label>

                    {form.photo ? (
                      <div className="relative aspect-video rounded-xl overflow-hidden border border-amber-200 shadow-2xs">
                        <img
                          src={form.photo}
                          alt={`VIP ${activeVipTab}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setVipForms((p) => ({
                              ...p,
                              [activeVipTab]: { ...p[activeVipTab], photo: "" },
                            }))
                          }
                          className="absolute top-2 right-2 px-2 py-1 bg-black/75 hover:bg-black text-white rounded-md text-xs font-bold cursor-pointer"
                        >
                          Remove Photo
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-amber-300 rounded-xl cursor-pointer hover:border-amber-500 bg-amber-50/30 transition">
                        <Camera className="w-8 h-8 text-amber-600 mb-2" />
                        <span className="text-xs font-bold text-slate-800">
                          Capture VIP {activeVipTab} Counter Photo
                        </span>
                        <span className="text-[10px] text-slate-500 mt-0.5">Click or upload live image proof</span>
                        <input
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={(e) =>
                            handlePhotoUpload(e, (url) =>
                              setVipForms((p) => ({
                                ...p,
                                [activeVipTab]: { ...p[activeVipTab], photo: url },
                              }))
                            )
                          }
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  {/* PLATE ALLOCATION & BALANCE */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                            Calculated Balance
                          </span>
                          <span className="text-xl font-extrabold text-amber-700 font-mono">
                            {balancePlates} Plates
                          </span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Total Prepared ({form.totalPlates || 0}) - Consumed ({form.consumedPlates || 0})
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Total Prepared Plates *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={form.totalPlates}
                            onChange={(e) =>
                              setVipForms((p) => ({
                                ...p,
                                [activeVipTab]: {
                                  ...p[activeVipTab],
                                  totalPlates: e.target.value,
                                },
                              }))
                            }
                            className="font-mono text-lg font-bold"
                            placeholder="0"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-slate-700">
                            Consumed Plates *
                          </label>
                          <Input
                            type="number"
                            min="0"
                            value={form.consumedPlates}
                            onChange={(e) =>
                              setVipForms((p) => ({
                                ...p,
                                [activeVipTab]: {
                                  ...p[activeVipTab],
                                  consumedPlates: e.target.value,
                                },
                              }))
                            }
                            className="font-mono text-lg font-bold text-emerald-700"
                            placeholder="0"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-slate-700">
                          VIP Service Notes / Guest Feedback
                        </label>
                        <Input
                          type="text"
                          placeholder="e.g. Executive guest arrangement in Private Dining Hall"
                          value={form.notes || ""}
                          onChange={(e) =>
                            setVipForms((p) => ({
                              ...p,
                              [activeVipTab]: {
                                ...p[activeVipTab],
                                notes: e.target.value,
                              },
                            }))
                          }
                        />
                      </div>
                    </div>

                    <Button
                      onClick={() => handleSaveVip(activeVipTab)}
                      loading={savingMeal === activeVipTab}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 text-sm shadow-xs cursor-pointer"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      <span>Save VIP {activeVipTab} Setup &amp; Plates</span>
                    </Button>
                  </div>
                </div>

                {/* VIP 4 MEAL STATUS MATRIX */}
                <div className="pt-4 border-t border-slate-100">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2.5">
                    Today&apos;s VIP 4-Service Operational Summary
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {["BREAKFAST", "LUNCH", "SNACKS", "DINNER"].map((m) => {
                      const f = vipForms[m];
                      const b = Math.max(0, Number(f?.totalPlates || 0) - Number(f?.consumedPlates || 0));
                      const isSelected = activeVipTab === m;

                      return (
                        <div
                          key={m}
                          onClick={() => setActiveVipTab(m)}
                          className={`p-3 rounded-xl border text-left cursor-pointer transition ${
                            isSelected
                              ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                              : "bg-white border-slate-200 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-bold text-slate-800">VIP {m}</span>
                            <span
                              className={`w-2 h-2 rounded-full ${
                                f?.isReady ? "bg-emerald-500" : "bg-slate-300"
                              }`}
                            />
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            Prep: <b className="text-slate-800">{f?.totalPlates || 0}</b> | Cons:{" "}
                            <b className="text-emerald-700">{f?.consumedPlates || 0}</b>
                          </div>
                          <div className="text-[10px] font-semibold text-amber-700 mt-1">
                            Bal: {b} plates
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}
    </div>
  );
}

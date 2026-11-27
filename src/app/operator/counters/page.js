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
} from "lucide-react";

export default function OperatorCountersPage() {
  const [date, setDate] = useState("");
  const [activeTab, setActiveTab] = useState("SHIFT_1_GEN"); // "SHIFT_1_GEN", "SHIFT_2", "VIP"
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState("");
  const [feedback, setFeedback] = useState("");

  // Counter Forms State for Shift 1 & General
  const [shift1Forms, setShift1Forms] = useState({
    BREAKFAST: {
      isReady: true,
      totalPlates: 600,
      consumedPlates: 550,
      shift1Count: 350,
      generalCount: 200,
      photo1stShift: "",
      photoGeneral: "",
      notes: "",
    },
    LUNCH: {
      isReady: true,
      totalPlates: 600,
      consumedPlates: 450,
      shift1Count: 300,
      generalCount: 150,
      photo1stShift: "",
      photoGeneral: "",
      notes: "",
    },
  });

  // Counter Forms State for Shift 2
  const [shift2Forms, setShift2Forms] = useState({
    SNACKS: {
      isReady: true,
      totalPlates: 600,
      consumedPlates: 600,
      photo: "",
      notes: "",
    },
    DINNER: {
      isReady: true,
      totalPlates: 600,
      consumedPlates: 400,
      photo: "",
      notes: "",
    },
  });

  // Counter Forms State for VIP Counter
  const [vipForms, setVipForms] = useState({
    BREAKFAST: {
      isReady: true,
      totalPlates: 10,
      consumedPlates: 9,
      photo: "",
      notes: "",
    },
    LUNCH: {
      isReady: true,
      totalPlates: 15,
      consumedPlates: 10,
      photo: "",
      notes: "",
    },
  });

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const fetchLogs = async () => {
    if (!date) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/counter-logs?date=${date}`);
      const json = await res.json();
      if (json.success) {
        setLogs(json.logs || []);

        // Hydrate forms if logs exist
        (json.logs || []).forEach((log) => {
          if (log.shift === "SHIFT_1_GEN") {
            setShift1Forms((prev) => ({
              ...prev,
              [log.mealType]: {
                isReady: log.isReady,
                totalPlates: log.totalPlates,
                consumedPlates: log.consumedPlates,
                shift1Count: log.subShiftBreakdown?.shift1Count || 0,
                generalCount: log.subShiftBreakdown?.generalCount || 0,
                photo1stShift: log.photos?.find((p) => p.subShift === "1ST_SHIFT")?.url || "",
                photoGeneral: log.photos?.find((p) => p.subShift === "GENERAL")?.url || "",
                notes: log.notes || "",
              },
            }));
          } else if (log.shift === "SHIFT_2") {
            setShift2Forms((prev) => ({
              ...prev,
              [log.mealType]: {
                isReady: log.isReady,
                totalPlates: log.totalPlates,
                consumedPlates: log.consumedPlates,
                photo: log.photos?.[0]?.url || "",
                notes: log.notes || "",
              },
            }));
          } else if (log.shift === "VIP") {
            setVipForms((prev) => ({
              ...prev,
              [log.mealType]: {
                isReady: log.isReady,
                totalPlates: log.totalPlates,
                consumedPlates: log.consumedPlates,
                photo: log.photos?.[0]?.url || "",
                notes: log.notes || "",
              },
            }));
          }
        });
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
              * Operator 1 Flow * (Client Sheet 1 & 2)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Utensils className="w-7 h-7 text-indigo-600" />
            <span>Counter Readiness & Plate Counts</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Shift 1 & General, Shift 2, and VIP Counter readiness confirmation + separate live photos + total/consumed plates.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs shadow-xs">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500 text-[11px] font-medium">Date:</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
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

      {/* TABS SWITCHER: SHIFT 1 & GEN vs SHIFT 2 vs VIP COUNTER */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("SHIFT_1_GEN")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_1_GEN"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>1) Shift 1 & General (Separate Clicks)</span>
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
          <span>2) Shift 2 (Snacks & Dinner)</span>
        </button>

        <button
          onClick={() => setActiveTab("VIP")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "VIP"
              ? "bg-indigo-600 text-white shadow-xs"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>3) VIP Counter (Setup)</span>
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
                  Item 1
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
                  Item 2
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
                  Item 2
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
      {/* VIEW 3: VIP COUNTER (SETUP) (BREAKFAST & LUNCH)                           */}
      {/* ========================================================================= */}
      {activeTab === "VIP" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* VIP BREAKFAST */}
          <Card className="p-6 space-y-5 shadow-xs border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Setup 1</span>
                </span>
                <h3 className="text-lg font-bold text-slate-900">VIP Breakfast Counter</h3>
                <p className="text-xs text-slate-500">Executive Dining Setup & Plates</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setVipForms((p) => ({
                      ...p,
                      BREAKFAST: { ...p.BREAKFAST, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    vipForms.BREAKFAST.isReady
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
                      BREAKFAST: { ...p.BREAKFAST, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !vipForms.BREAKFAST.isReady
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
                VIP Breakfast Live Photo
              </label>
              {vipForms.BREAKFAST.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={vipForms.BREAKFAST.photo} alt="VIP Breakfast" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setVipForms((p) => ({
                        ...p,
                        BREAKFAST: { ...p.BREAKFAST, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 bg-white">
                  <Camera className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture VIP Breakfast Live Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setVipForms((p) => ({
                          ...p,
                          BREAKFAST: { ...p.BREAKFAST, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  VIP Breakfast Plate Count (ex: 10 / 9)
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(vipForms.BREAKFAST.totalPlates) - Number(vipForms.BREAKFAST.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={vipForms.BREAKFAST.totalPlates}
                    onChange={(e) =>
                      setVipForms((p) => ({
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
                    value={vipForms.BREAKFAST.consumedPlates}
                    onChange={(e) =>
                      setVipForms((p) => ({
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
              onClick={() => handleSaveVip("BREAKFAST")}
              loading={savingMeal === "BREAKFAST"}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save VIP Breakfast Setup</span>
            </Button>
          </Card>

          {/* VIP LUNCH */}
          <Card className="p-6 space-y-5 shadow-xs border-amber-200/80 bg-gradient-to-b from-amber-50/20 to-white">
            <div className="flex items-center justify-between border-b border-amber-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5" />
                  <span>VIP Setup 2</span>
                </span>
                <h3 className="text-lg font-bold text-slate-900">VIP Lunch Counter</h3>
                <p className="text-xs text-slate-500">Executive Dining Setup & Plates</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
                <button
                  type="button"
                  onClick={() =>
                    setVipForms((p) => ({
                      ...p,
                      LUNCH: { ...p.LUNCH, isReady: true },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    vipForms.LUNCH.isReady
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
                      LUNCH: { ...p.LUNCH, isReady: false },
                    }))
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                    !vipForms.LUNCH.isReady
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
                VIP Lunch Live Photo
              </label>
              {vipForms.LUNCH.photo ? (
                <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200">
                  <img src={vipForms.LUNCH.photo} alt="VIP Lunch" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setVipForms((p) => ({
                        ...p,
                        LUNCH: { ...p.LUNCH, photo: "" },
                      }))
                    }
                    className="absolute top-1 right-1 p-1 bg-black/70 text-white rounded-md text-[10px]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-amber-200 rounded-xl cursor-pointer hover:border-amber-400 bg-white">
                  <Camera className="w-6 h-6 text-amber-500 mb-1" />
                  <span className="text-xs font-semibold text-slate-700">Capture VIP Lunch Live Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) =>
                      handlePhotoUpload(e, (url) =>
                        setVipForms((p) => ({
                          ...p,
                          LUNCH: { ...p.LUNCH, photo: url },
                        }))
                      )
                    }
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* PLATE COUNTS */}
            <div className="space-y-3 pt-2 border-t border-amber-100">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
                  VIP Lunch Plate Count (ex: 15 / 10)
                </span>
                <span className="text-xs font-mono font-bold text-amber-700">
                  Balance:{" "}
                  {Math.max(
                    0,
                    Number(vipForms.LUNCH.totalPlates) - Number(vipForms.LUNCH.consumedPlates)
                  )}{" "}
                  plates
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
                  <Input
                    type="number"
                    value={vipForms.LUNCH.totalPlates}
                    onChange={(e) =>
                      setVipForms((p) => ({
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
                    value={vipForms.LUNCH.consumedPlates}
                    onChange={(e) =>
                      setVipForms((p) => ({
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
              onClick={() => handleSaveVip("LUNCH")}
              loading={savingMeal === "LUNCH"}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold"
            >
              <Save className="w-4 h-4" />
              <span>Save VIP Lunch Setup</span>
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}

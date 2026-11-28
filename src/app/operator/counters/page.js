"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
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
  Sun,
} from "lucide-react";

// Initial state helpers
const emptyShift1 = {
  BREAKFAST: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  LUNCH: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
};

const emptyGeneral = {
  BREAKFAST: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  LUNCH: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
};

const emptyShift2 = {
  SNACKS: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  DINNER: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
};

const emptyShift3 = {
  SNACKS: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  DINNER: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
};

const emptyVip = {
  BREAKFAST: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  LUNCH: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  SNACKS: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
  DINNER: {
    isReady: false,
    totalPlates: 0,
    consumedPlates: 0,
    openingPhoto: "",
    closingPhoto: "",
    notes: "",
  },
};

export default function OperatorCountersPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [date, setDate] = useState("");
  // Tabs: "SHIFT_1", "GENERAL", "SHIFT_2", "SHIFT_3", "VIP"
  const [activeTab, setActiveTab] = useState("SHIFT_1");
  const [activeVipTab, setActiveVipTab] = useState("BREAKFAST");
  const [vipFilter, setVipFilter] = useState("ALL"); // "ALL", "CONSUMED", "BALANCE"
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingMeal, setSavingMeal] = useState("");
  const [feedback, setFeedback] = useState("");

  // Counter Forms State
  const [shift1Forms, setShift1Forms] = useState(emptyShift1);
  const [generalForms, setGeneralForms] = useState(emptyGeneral);
  const [shift2Forms, setShift2Forms] = useState(emptyShift2);
  const [shift3Forms, setShift3Forms] = useState(emptyShift3);
  const [vipForms, setVipForms] = useState(emptyVip);

  useEffect(() => {
    setDate(new Date().toISOString().split("T")[0]);
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCurrentUser(d.user);
      })
      .catch(() => {});
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
        const nextGeneral = JSON.parse(JSON.stringify(emptyGeneral));
        const nextShift2 = JSON.parse(JSON.stringify(emptyShift2));
        const nextShift3 = JSON.parse(JSON.stringify(emptyShift3));
        const nextVip = JSON.parse(JSON.stringify(emptyVip));

        const extractPhotos = (log) => {
          let opening = log.openingPhoto || "";
          let closing = log.closingPhoto || "";

          // Fallback to photos array if opening/closing not set directly
          if (!opening && log.photos && log.photos.length > 0) {
            const openP = log.photos.find(
              (p) =>
                p.caption?.toLowerCase().includes("open") ||
                p.subShift === "OPENING" ||
                p.subShift === "1ST_SHIFT"
            );
            opening = openP ? openP.url : log.photos[0]?.url || "";
          }

          if (!closing && log.photos && log.photos.length > 1) {
            const closeP = log.photos.find(
              (p) =>
                p.caption?.toLowerCase().includes("close") ||
                p.subShift === "CLOSING" ||
                p.subShift === "GENERAL"
            );
            closing = closeP ? closeP.url : log.photos[1]?.url || "";
          }

          return { opening, closing };
        };

        // Hydrate forms if logs exist
        (json.logs || []).forEach((log) => {
          const { opening, closing } = extractPhotos(log);

          if (log.shift === "SHIFT_1" && nextShift1[log.mealType]) {
            nextShift1[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              openingPhoto: opening,
              closingPhoto: closing,
              notes: log.notes || "",
            };
          } else if (log.shift === "GENERAL" && nextGeneral[log.mealType]) {
            nextGeneral[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              openingPhoto: opening,
              closingPhoto: closing,
              notes: log.notes || "",
            };
          } else if (log.shift === "SHIFT_1_GEN") {
            // Legacy backwards-compatibility hydration
            if (nextShift1[log.mealType] && !nextShift1[log.mealType].openingPhoto) {
              const photo1 = log.photos?.find((p) => p.subShift === "1ST_SHIFT")?.url || opening;
              nextShift1[log.mealType] = {
                isReady: log.isReady ?? false,
                totalPlates: log.subShiftBreakdown?.shift1Count || log.totalPlates || 0,
                consumedPlates: log.consumedPlates ?? 0,
                openingPhoto: photo1,
                closingPhoto: "",
                notes: log.notes || "",
              };
            }
            if (nextGeneral[log.mealType] && !nextGeneral[log.mealType].openingPhoto) {
              const photoGen = log.photos?.find((p) => p.subShift === "GENERAL")?.url || closing;
              nextGeneral[log.mealType] = {
                isReady: log.isReady ?? false,
                totalPlates: log.subShiftBreakdown?.generalCount || log.totalPlates || 0,
                consumedPlates: log.consumedPlates ?? 0,
                openingPhoto: photoGen,
                closingPhoto: "",
                notes: log.notes || "",
              };
            }
          } else if (log.shift === "SHIFT_2" && nextShift2[log.mealType]) {
            nextShift2[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              openingPhoto: opening,
              closingPhoto: closing,
              notes: log.notes || "",
            };
          } else if (log.shift === "SHIFT_3" && nextShift3[log.mealType]) {
            nextShift3[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              openingPhoto: opening,
              closingPhoto: closing,
              notes: log.notes || "",
            };
          } else if (log.shift === "VIP" && nextVip[log.mealType]) {
            nextVip[log.mealType] = {
              isReady: log.isReady ?? false,
              totalPlates: log.totalPlates ?? 0,
              consumedPlates: log.consumedPlates ?? 0,
              openingPhoto: opening,
              closingPhoto: closing,
              notes: log.notes || "",
            };
          }
        });

        setShift1Forms(nextShift1);
        setGeneralForms(nextGeneral);
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

  // Generic Save Handler for any shift and meal
  const handleSaveMeal = async (shift, mealType, form) => {
    setSavingMeal(`${shift}_${mealType}`);
    setFeedback("");
    try {
      const photos = [];
      if (form.openingPhoto) {
        photos.push({
          url: form.openingPhoto,
          subShift: "OPENING",
          caption: `${shift} ${mealType} Opening Photo`,
        });
      }
      if (form.closingPhoto) {
        photos.push({
          url: form.closingPhoto,
          subShift: "CLOSING",
          caption: `${shift} ${mealType} Closing Photo`,
        });
      }

      const res = await fetch("/api/counter-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          shift,
          mealType,
          isReady: form.isReady,
          openingPhoto: form.openingPhoto,
          closingPhoto: form.closingPhoto,
          totalPlates: Number(form.totalPlates),
          consumedPlates: Number(form.consumedPlates),
          photos,
          notes: form.notes,
          loggedBy: "Operator 1",
        }),
      });

      const json = await res.json();
      if (json.success) {
        const shiftDisplay =
          shift === "SHIFT_1"
            ? "Shift 1"
            : shift === "GENERAL"
            ? "General Shift"
            : shift === "SHIFT_2"
            ? "Shift 2"
            : shift === "SHIFT_3"
            ? "Shift 3"
            : "VIP";
        setFeedback(`${shiftDisplay} ${mealType} saved successfully! (Opening & Closing photos synced)`);
        fetchLogs();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavingMeal("");
    }
  };

  // Reusable Counter Card Component
  const renderCounterCard = ({
    shift,
    mealType,
    title,
    subtitle,
    badgeText,
    badgeColor = "text-indigo-600",
    form,
    setForm,
    isVip = false,
  }) => {
    const isSaving = savingMeal === `${shift}_${mealType}`;
    const balance = Math.max(0, Number(form.totalPlates || 0) - Number(form.consumedPlates || 0));

    const updateField = (field, val) => {
      setForm((prev) => ({
        ...prev,
        [mealType]: {
          ...prev[mealType],
          [field]: val,
        },
      }));
    };

    return (
      <Card
        className={`p-6 space-y-5 shadow-xs transition-all ${
          isVip
            ? "border-amber-200/80 bg-gradient-to-b from-amber-50/20 via-white to-white"
            : shift === "GENERAL"
            ? "border-sky-200/80 bg-gradient-to-b from-sky-50/20 via-white to-white"
            : shift === "SHIFT_3"
            ? "border-indigo-100 bg-gradient-to-b from-indigo-50/20 via-white to-white"
            : "border-slate-200 bg-white"
        }`}
      >
        {/* CARD HEADER */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <span className={`text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${badgeColor}`}>
              {isVip && <Crown className="w-3.5 h-3.5" />}
              {shift === "GENERAL" && <Sun className="w-3.5 h-3.5" />}
              {badgeText}
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{title}</h3>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>

          {/* READY / NOT READY TOGGLE */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => updateField("isReady", true)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                form.isReady ? "bg-emerald-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Ready
            </button>
            <button
              type="button"
              onClick={() => updateField("isReady", false)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                !form.isReady ? "bg-rose-600 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Not Ready
            </button>
          </div>
        </div>

        {/* OPENING & CLOSING PHOTO PROOF (SIDE-BY-SIDE) */}
        <div className="space-y-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-600 block">
            Live Photo Verification (Opening &amp; Closing Required)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* 1. Counter Opening Photo */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Counter Opening Photo</span>
                <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  Service Start
                </span>
              </div>

              {form.openingPhoto ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={form.openingPhoto} alt="Opening" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => updateField("openingPhoto", "")}
                    className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-black text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 hover:border-indigo-600 rounded-lg cursor-pointer bg-white transition">
                  <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Capture Opening Photo</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Click or upload start photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoUpload(e, (url) => updateField("openingPhoto", url))}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* 2. Counter Closing Photo */}
            <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 space-y-2 text-center">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-700">Counter Closing Photo</span>
                <span className="text-[9px] font-mono font-bold text-indigo-700 bg-indigo-100 px-1.5 py-0.2 rounded">
                  Service Close
                </span>
              </div>

              {form.closingPhoto ? (
                <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={form.closingPhoto} alt="Closing" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => updateField("closingPhoto", "")}
                    className="absolute top-1 right-1 p-1 bg-black/75 hover:bg-black text-white rounded text-[10px] font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center p-3 border-2 border-dashed border-slate-200 hover:border-indigo-600 rounded-lg cursor-pointer bg-white transition">
                  <Camera className="w-5 h-5 text-indigo-600 mb-1" />
                  <span className="text-[11px] font-semibold text-slate-700">Capture Closing Photo</span>
                  <span className="text-[9px] text-slate-400 mt-0.5">Click or upload end photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={(e) => handlePhotoUpload(e, (url) => updateField("closingPhoto", url))}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* PLATE COUNTS (TOTAL vs CONSUMED & BALANCE) */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600">
              Plate Count (Prepared / Consumed)
            </span>
            <span
              className={`text-xs font-mono font-bold ${
                isVip ? "text-amber-700" : shift === "GENERAL" ? "text-sky-700" : "text-indigo-600"
              }`}
            >
              Balance: {balance} plates
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Total Prepared Plates</label>
              <Input
                type="number"
                min="0"
                value={form.totalPlates}
                onChange={(e) => updateField("totalPlates", e.target.value)}
                className="font-mono text-base font-bold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-700">Total Consumed Plates</label>
              <Input
                type="number"
                min="0"
                value={form.consumedPlates}
                onChange={(e) => updateField("consumedPlates", e.target.value)}
                className="font-mono text-base font-bold text-emerald-700"
              />
            </div>
          </div>
        </div>

        {/* OPERATIONAL NOTES */}
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-700">Operational Notes</label>
          <Input
            type="text"
            placeholder="e.g. Counter setup ready, clean inspection completed"
            value={form.notes || ""}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>

        {/* SAVE BUTTON */}
        <Button
          onClick={() => handleSaveMeal(shift, mealType, form)}
          loading={isSaving}
          className={`w-full font-bold shadow-xs cursor-pointer ${
            isVip
              ? "bg-amber-600 hover:bg-amber-700 text-white"
              : shift === "GENERAL"
              ? "bg-sky-600 hover:bg-sky-700 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white"
          }`}
        >
          <Save className="w-4 h-4 mr-2" />
          <span>Save {title} Setup &amp; Photos</span>
        </Button>
      </Card>
    );
  };

  if (currentUser && ["OPERATOR_2", "OPERATOR_3", "OT_SUPERVISOR"].includes(currentUser.role?.code)) {
    return (
      <div className="max-w-xl mx-auto my-16 p-8 bg-white border border-slate-200 rounded-2xl shadow-xs text-center space-y-4">
        <div className="w-12 h-12 bg-amber-50 text-amber-700 rounded-2xl flex items-center justify-center mx-auto">
          <ShieldCheck className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Operator 1 Module Restricted</h2>
        <p className="text-xs text-slate-600">
          Meal counter setups and plate counts are managed exclusively by <b>Operator 1</b>.
          You are currently signed in as <b>{currentUser.name} ({currentUser.role?.name})</b>.
        </p>
        <Link href={currentUser.role?.code === "OPERATOR_2" ? "/operator/checksheets" : currentUser.role?.code === "OPERATOR_3" ? "/operator/tea-delivery" : "/operator/overtime"}>
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
            Confirm counter service readiness, capture shift opening &amp; closing verification photos, and record prepared vs consumed plates.
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
              onChange={(e) => setDate(e.target.value)}
              className="bg-transparent text-slate-900 font-mono text-xs focus:outline-none cursor-pointer"
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
          <button onClick={() => setFeedback("")} className="text-emerald-700 font-bold hover:underline cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* TOP TABS SWITCHER: 5 DEDICATED SEPARATE TABS */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {/* TAB 1: SHIFT 1 */}
        <button
          onClick={() => setActiveTab("SHIFT_1")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_1"
              ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Shift 1 (Breakfast &amp; Lunch)</span>
        </button>

        {/* TAB 2: GENERAL SHIFT */}
        <button
          onClick={() => setActiveTab("GENERAL")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "GENERAL"
              ? "bg-sky-600 text-white shadow-xs ring-2 ring-sky-200"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Sun className="w-4 h-4 text-amber-300" />
          <span>General Shift (Breakfast &amp; Lunch)</span>
        </button>

        {/* TAB 3: SHIFT 2 */}
        <button
          onClick={() => setActiveTab("SHIFT_2")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_2"
              ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Shift 2 (Snacks &amp; Dinner)</span>
        </button>

        {/* TAB 4: SHIFT 3 */}
        <button
          onClick={() => setActiveTab("SHIFT_3")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "SHIFT_3"
              ? "bg-indigo-600 text-white shadow-xs ring-2 ring-indigo-200"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Moon className="w-4 h-4 text-indigo-300" />
          <span>Shift 3 (Night Snacks &amp; Dinner)</span>
        </button>

        {/* TAB 5: VIP DINING SUITE */}
        <button
          onClick={() => setActiveTab("VIP")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
            activeTab === "VIP"
              ? "bg-amber-600 text-white shadow-xs ring-2 ring-amber-200"
              : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
          }`}
        >
          <Crown className="w-4 h-4 text-amber-300" />
          <span>VIP Dining Suite (4 Meals)</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* VIEW 1: FIRST SHIFT (BREAKFAST & LUNCH - OPENING & CLOSING PHOTOS)         */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_1" && (
        <div className="space-y-4">
          <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-900">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span className="font-bold">First Shift Operations (06:00 - 14:00)</span>
              <span className="text-slate-500">• Breakfast Service (07:30 - 09:30) &amp; Lunch Service (11:30 - 13:30)</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
              Both Opening &amp; Closing Photos Required
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCounterCard({
              shift: "SHIFT_1",
              mealType: "BREAKFAST",
              title: "Shift 1 Breakfast Counter Setup",
              subtitle: "Morning Service (Opening & Closing Live Proof)",
              badgeText: "Shift 1 • Breakfast",
              badgeColor: "text-indigo-600",
              form: shift1Forms.BREAKFAST,
              setForm: setShift1Forms,
            })}

            {renderCounterCard({
              shift: "SHIFT_1",
              mealType: "LUNCH",
              title: "Shift 1 Lunch Counter Setup",
              subtitle: "Midday Service (Opening & Closing Live Proof)",
              badgeText: "Shift 1 • Lunch",
              badgeColor: "text-indigo-600",
              form: shift1Forms.LUNCH,
              setForm: setShift1Forms,
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 2: GENERAL SHIFT (BREAKFAST & LUNCH - OPENING & CLOSING PHOTOS)       */}
      {/* ========================================================================= */}
      {activeTab === "GENERAL" && (
        <div className="space-y-4">
          <div className="bg-sky-50/60 border border-sky-200 rounded-xl p-3 flex items-center justify-between text-xs text-sky-950">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <span className="font-bold">General Shift Operations (08:30 - 17:00)</span>
              <span className="text-slate-500">• Dedicated General Shift Breakfast &amp; Lunch Line</span>
            </div>
            <span className="text-[11px] font-semibold text-sky-800 bg-white px-2 py-0.5 rounded border border-sky-200">
              Both Opening &amp; Closing Photos Required
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCounterCard({
              shift: "GENERAL",
              mealType: "BREAKFAST",
              title: "General Shift Breakfast Counter Setup",
              subtitle: "General Shift Service (Opening & Closing Live Proof)",
              badgeText: "General Shift • Breakfast",
              badgeColor: "text-sky-700",
              form: generalForms.BREAKFAST,
              setForm: setGeneralForms,
            })}

            {renderCounterCard({
              shift: "GENERAL",
              mealType: "LUNCH",
              title: "General Shift Lunch Counter Setup",
              subtitle: "General Shift Service (Opening & Closing Live Proof)",
              badgeText: "General Shift • Lunch",
              badgeColor: "text-sky-700",
              form: generalForms.LUNCH,
              setForm: setGeneralForms,
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 3: SHIFT 2 (SNACKS & DINNER - OPENING & CLOSING PHOTOS)               */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_2" && (
        <div className="space-y-4">
          <div className="bg-amber-50/40 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between text-xs text-amber-950">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <span className="font-bold">Shift 2 Afternoon Operations (14:00 - 22:00)</span>
              <span className="text-slate-500">• Afternoon Snacks (16:00 - 17:30) &amp; Evening Dinner (19:30 - 21:30)</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-800 bg-white px-2 py-0.5 rounded border border-amber-200">
              Both Opening &amp; Closing Photos Required
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCounterCard({
              shift: "SHIFT_2",
              mealType: "SNACKS",
              title: "Shift 2 Snacks Counter Setup",
              subtitle: "Afternoon Refreshment Service (Opening & Closing)",
              badgeText: "Shift 2 • Snacks",
              badgeColor: "text-amber-700",
              form: shift2Forms.SNACKS,
              setForm: setShift2Forms,
            })}

            {renderCounterCard({
              shift: "SHIFT_2",
              mealType: "DINNER",
              title: "Shift 2 Dinner Counter Setup",
              subtitle: "Evening Service (Opening & Closing)",
              badgeText: "Shift 2 • Dinner",
              badgeColor: "text-indigo-600",
              form: shift2Forms.DINNER,
              setForm: setShift2Forms,
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 4: SHIFT 3 (NIGHT SNACKS & DINNER - OPENING & CLOSING PHOTOS)         */}
      {/* ========================================================================= */}
      {activeTab === "SHIFT_3" && (
        <div className="space-y-4">
          <div className="bg-indigo-950/10 border border-indigo-200 rounded-xl p-3 flex items-center justify-between text-xs text-indigo-950">
            <div className="flex items-center gap-2">
              <Moon className="w-4 h-4 text-indigo-700" />
              <span className="font-bold">Shift 3 Night Operations (22:00 - 06:00)</span>
              <span className="text-slate-500">• Night Shift Production Refreshments &amp; Midnight Dinner Service</span>
            </div>
            <span className="text-[11px] font-semibold text-indigo-800 bg-white px-2 py-0.5 rounded border border-indigo-200">
              Both Opening &amp; Closing Photos Required
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {renderCounterCard({
              shift: "SHIFT_3",
              mealType: "SNACKS",
              title: "Shift 3 Night Snacks Counter",
              subtitle: "Night Shift Refreshments (Opening & Closing)",
              badgeText: "Shift 3 • Night Snacks",
              badgeColor: "text-indigo-600",
              form: shift3Forms.SNACKS,
              setForm: setShift3Forms,
            })}

            {renderCounterCard({
              shift: "SHIFT_3",
              mealType: "DINNER",
              title: "Shift 3 Night Dinner Counter",
              subtitle: "Late Night Dinner (Opening & Closing)",
              badgeText: "Shift 3 • Night Dinner",
              badgeColor: "text-indigo-600",
              form: shift3Forms.DINNER,
              setForm: setShift3Forms,
            })}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW 5: VIP DINING SUITE (4 DEDICATED TABS WITH OPENING & CLOSING PHOTOS) */}
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
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition cursor-pointer ${
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

          {/* ACTIVE VIP TAB COUNTER CARD (WITH OPENING & CLOSING LIVE PHOTOS) */}
          {(() => {
            const form = vipForms[activeVipTab] || emptyVip[activeVipTab];
            const balancePlates = Math.max(0, Number(form.totalPlates || 0) - Number(form.consumedPlates || 0));

            // Check filter match
            let matchesFilter = true;
            if (vipFilter === "CONSUMED" && Number(form.consumedPlates || 0) <= 0) matchesFilter = false;
            if (vipFilter === "BALANCE" && balancePlates <= 0) matchesFilter = false;

            return (
              <div className="space-y-4">
                {!matchesFilter && (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                    Notice: Current tab does not match the active filter ({vipFilter}). Reset filter to view normal details.
                  </div>
                )}

                {renderCounterCard({
                  shift: "VIP",
                  mealType: activeVipTab,
                  title: `VIP ${activeVipTab} Dining Setup`,
                  subtitle: "Executive Dining Service (Opening & Closing Live Proof)",
                  badgeText: `VIP Setup • ${activeVipTab}`,
                  badgeColor: "text-amber-700",
                  form,
                  setForm: setVipForms,
                  isVip: true,
                })}

                {/* VIP 4-MEAL OPERATIONAL STATUS MATRIX */}
                <Card className="p-4 bg-white border-amber-200/80 shadow-2xs">
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
                </Card>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}

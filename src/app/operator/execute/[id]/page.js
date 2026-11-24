"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Camera,
  Upload,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Building2,
  ShieldCheck,
  Send,
  Trash2,
  Sparkles,
  Info,
  Fingerprint,
} from "lucide-react";

export default function CheckSheetExecutionWizard({ params }) {
  const unwrappedParams = use(params);
  const checkSheetId = unwrappedParams.id;
  const router = useRouter();

  const [checkSheet, setCheckSheet] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Dynamic responses mapping: fieldId -> { value, isConforming, remarks }
  const [responses, setResponses] = useState({});
  const [photos, setPhotos] = useState([]);
  const [operatorNotes, setOperatorNotes] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [digitalSignChecked, setDigitalSignChecked] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [csRes, userRes] = await Promise.all([
          fetch(`/api/checksheets/${checkSheetId}`).then((r) => r.json()),
          fetch("/api/auth/me").then((r) => r.json()).catch(() => ({})),
        ]);

        if (userRes.user) {
          setCurrentUser(userRes.user);
        }

        if (csRes.success && csRes.checkSheet) {
          const cs = csRes.checkSheet;
          setCheckSheet(cs);

          // Initialize default responses for each field
          const initial = {};
          (cs.fields || []).forEach((f) => {
            let defValue = "";
            let defConforming = true;
            if (f.fieldType === "boolean") {
              defValue = true; // Default to pass
            } else if (f.fieldType === "number") {
              defValue = f.minValue !== null && f.minValue !== undefined ? f.minValue : "";
            } else if (f.fieldType === "select" && f.options?.length > 0) {
              defValue = f.options[0];
            }
            initial[f.fieldId] = {
              value: defValue,
              isConforming: defConforming,
              remarks: "",
            };
          });
          setResponses(initial);
        } else {
          setErrorMessage(csRes.error || "Failed to load check sheet template");
        }
      } catch (err) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [checkSheetId]);

  // Handle value change for a field
  const handleValueChange = (field, val) => {
    let isConforming = true;

    // Boundary check for numbers
    if (field.fieldType === "number") {
      const num = Number(val);
      if (field.minValue !== null && field.minValue !== undefined && num < field.minValue) {
        isConforming = false;
      }
      if (field.maxValue !== null && field.maxValue !== undefined && num > field.maxValue) {
        isConforming = false;
      }
    } else if (field.fieldType === "boolean") {
      isConforming = Boolean(val);
    }

    setResponses((prev) => ({
      ...prev,
      [field.fieldId]: {
        ...prev[field.fieldId],
        value: val,
        isConforming,
      },
    }));
  };

  // Handle remarks change
  const handleRemarksChange = (fieldId, remarks) => {
    setResponses((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        remarks,
      },
    }));
  };

  // Handle Photo Upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setErrorMessage("");
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/uploads", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to upload photo");
      }

      setPhotos((prev) => [
        ...prev,
        {
          url: data.url,
          caption: file.name,
          fileSizeKb: data.sizeKb,
          mimeType: data.mimeType,
          uploadedAt: new Date().toISOString(),
        },
      ]);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  const removePhoto = (idx) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  // Calculate live compliance score
  const responseList = Object.values(responses);
  const defectCount = responseList.filter((r) => r.isConforming === false).length;
  const totalCount = checkSheet?.fields?.length || 1;
  const currentCompliance = Math.max(
    0,
    Math.round(((totalCount - defectCount) / totalCount) * 100)
  );

  // Submit check sheet
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    // Validate mandatory photo requirement
    if (checkSheet.mandatoryPhotoCount > 0 && photos.length < checkSheet.mandatoryPhotoCount) {
      setErrorMessage(
        `This check sheet requires at least ${checkSheet.mandatoryPhotoCount} photograph(s) as evidence before dispatch.`
      );
      return;
    }

    if (!digitalSignChecked) {
      setErrorMessage("Please confirm and digitally sign the operational verification statement below.");
      return;
    }

    try {
      setSubmitting(true);

      // Build structured responses array
      const payloadResponses = (checkSheet.fields || []).map((f) => {
        const resp = responses[f.fieldId] || {};
        return {
          fieldId: f.fieldId,
          label: f.label,
          fieldType: f.fieldType,
          value: resp.value,
          unit: f.unit || "",
          isConforming: resp.isConforming !== false,
          remarks: resp.remarks || "",
        };
      });

      const payload = {
        checkSheetId: checkSheet._id,
        departmentId: checkSheet.department?._id || checkSheet.department,
        shiftId:
          checkSheet.allowedShifts?.[0]?._id ||
          checkSheet.allowedShifts?.[0] ||
          currentUser?.shift ||
          "67431c3c983d5a2d12345678", // Fallback Shift A
        responses: payloadResponses,
        photos: photos.map((p) => ({
          url: p.url,
          caption: p.caption,
          fileSizeKb: p.fileSizeKb,
          mimeType: p.mimeType,
        })),
        notes: operatorNotes,
      };

      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit checksheet");
      }

      setSubmittedSuccess(data.submission);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[#5733F0] border-t-[#CDFE02] rounded-full animate-spin mx-auto" />
        <p className="text-xs text-zinc-400">Loading check sheet wizard...</p>
      </div>
    );
  }

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-[#CDFE02]/20 border border-[#CDFE02]/40 flex items-center justify-center text-[#CDFE02] mx-auto animate-bounce">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#CDFE02] text-black">
            Submission Dispatched Successfully
          </span>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Check Sheet Queued for Supervisor Review
          </h2>
          <p className="text-xs text-zinc-400 max-w-md mx-auto">
            {checkSheet.title} ({checkSheet.code}) has been committed to the live supervisor approval queue and logged in the immutable audit trail.
          </p>
        </div>

        {/* Submission Details Card */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 text-left space-y-3">
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
            <span className="text-zinc-400">Submission Reference ID</span>
            <span className="font-mono font-bold text-white">{submittedSuccess._id}</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
            <span className="text-zinc-400">Compliance Index</span>
            <span className="font-bold text-[#CDFE02]">{submittedSuccess.complianceScore}%</span>
          </div>
          <div className="flex items-center justify-between text-xs pb-3 border-b border-white/5">
            <span className="text-zinc-400">Defects / Non-Conformances</span>
            <span className={submittedSuccess.hasDefects ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
              {submittedSuccess.hasDefects ? "Flagged for Correction" : "Zero Defects"}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-400">Evidence Uploads</span>
            <span className="text-white">{photos.length} photograph(s) attached</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link
            href="/operator"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5733F0] hover:bg-[#6c4cf5] text-white text-xs font-bold transition-all shadow-md shadow-[#5733F0]/25"
          >
            Back to Shift Taskboard
          </Link>
          <Link
            href="/admin/submissions"
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#141418] hover:bg-white/5 border border-white/10 text-zinc-300 text-xs font-bold transition-all"
          >
            View in Supervisor Console
          </Link>
        </div>
      </div>
    );
  }

  if (!checkSheet) {
    return (
      <div className="py-20 text-center space-y-4">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Check Sheet Not Found</h3>
        <p className="text-xs text-zinc-400">{errorMessage || "The requested template does not exist."}</p>
        <Link
          href="/operator"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5733F0] text-white text-xs font-bold"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Return to Tasks</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 max-w-3xl mx-auto">
      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4 pb-2 border-b border-white/5">
        <Link
          href="/operator"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>

        {/* Live Score Indicator */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#141418] border border-white/10 text-xs">
          <span className="text-zinc-400">Compliance:</span>
          <span
            className={`font-mono font-bold ${
              currentCompliance < 100 ? "text-amber-400" : "text-[#CDFE02]"
            }`}
          >
            {currentCompliance}%
          </span>
          {defectCount > 0 && (
            <span className="text-[10px] text-rose-400 font-semibold">({defectCount} defect)</span>
          )}
        </div>
      </div>

      {/* Check Sheet Banner */}
      <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-[#CDFE02] bg-[#CDFE02]/10 border border-[#CDFE02]/20 px-2.5 py-0.5 rounded-lg">
              {checkSheet.code}
            </span>
            <span className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">
              {checkSheet.category}
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <Building2 className="w-3.5 h-3.5 text-zinc-500" />
            <span>{checkSheet.department?.name || "Kitchen Operations"}</span>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {checkSheet.title}
        </h1>

        <div className="flex items-center gap-4 text-[11px] text-zinc-400 pt-1">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>SLA: {checkSheet.slaHours} hours response</span>
          </div>
          {checkSheet.mandatoryPhotoCount > 0 && (
            <div className="flex items-center gap-1.5 text-sky-400 font-semibold">
              <Camera className="w-3.5 h-3.5" />
              <span>{checkSheet.mandatoryPhotoCount} Mandatory Photo Evidence</span>
            </div>
          )}
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Execution Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Dynamic Fields Section */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 px-1">
            Inspection Parameters & Readings ({checkSheet.fields?.length || 0})
          </h3>

          <div className="space-y-3">
            {(checkSheet.fields || []).map((field, idx) => {
              const currentResp = responses[field.fieldId] || {};
              const isNonConforming = currentResp.isConforming === false;

              return (
                <div
                  key={field.fieldId || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    isNonConforming
                      ? "bg-rose-500/[0.04] border-rose-500/30"
                      : "bg-[#141418] border-white/10"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Label & Description */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{field.label}</span>
                        {field.isRequired && (
                          <span className="text-[10px] text-rose-400 font-bold">*</span>
                        )}
                        {field.requiresPhoto && (
                          <span className="text-[10px] text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded border border-sky-500/20">
                            Photo Required
                          </span>
                        )}
                      </div>
                      {/* Min/Max Guardrail hints */}
                      {field.fieldType === "number" &&
                        (field.minValue !== null || field.maxValue !== null) && (
                          <p className="text-[11px] text-zinc-400 font-mono">
                            Tolerance:{" "}
                            {field.minValue !== null ? `Min: ${field.minValue}${field.unit} ` : ""}
                            {field.maxValue !== null ? `Max: ${field.maxValue}${field.unit}` : ""}
                          </p>
                        )}
                    </div>

                    {/* Input Controls */}
                    <div className="flex items-center gap-2 shrink-0">
                      {/* 1. Boolean Toggle */}
                      {field.fieldType === "boolean" && (
                        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#101014] border border-white/5">
                          <button
                            type="button"
                            onClick={() => handleValueChange(field, true)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentResp.value === true
                                ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/20"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Pass / Conforming
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueChange(field, false)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              currentResp.value === false
                                ? "bg-rose-500 text-white shadow-md shadow-rose-500/20"
                                : "text-zinc-400 hover:text-white"
                            }`}
                          >
                            Fail / Defect
                          </button>
                        </div>
                      )}

                      {/* 2. Number Input */}
                      {field.fieldType === "number" && (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="any"
                            value={currentResp.value ?? ""}
                            onChange={(e) => handleValueChange(field, e.target.value)}
                            placeholder="0.0"
                            className={`w-28 bg-[#101014] border rounded-xl px-3 py-2 text-xs font-mono text-white text-right focus:outline-none ${
                              isNonConforming
                                ? "border-rose-500 focus:border-rose-400"
                                : "border-white/10 focus:border-[#5733F0]"
                            }`}
                          />
                          {field.unit && (
                            <span className="text-xs text-zinc-400 font-mono min-w-[24px]">
                              {field.unit}
                            </span>
                          )}
                        </div>
                      )}

                      {/* 3. Select Dropdown */}
                      {field.fieldType === "select" && (
                        <select
                          value={currentResp.value || ""}
                          onChange={(e) => handleValueChange(field, e.target.value)}
                          className="bg-[#101014] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                        >
                          {(field.options || []).map((opt, oIdx) => (
                            <option key={oIdx} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      )}

                      {/* 4. Text / General */}
                      {(field.fieldType === "text" || field.fieldType === "remarks") && (
                        <input
                          type="text"
                          value={currentResp.value || ""}
                          onChange={(e) => handleValueChange(field, e.target.value)}
                          placeholder="Record reading or status..."
                          className="w-48 bg-[#101014] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                        />
                      )}
                    </div>
                  </div>

                  {/* Non-conformance breach alert & defect explanation */}
                  {isNonConforming && (
                    <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-2 animate-fadeIn">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Critical Parameter Breach Detected!</span>
                      </div>
                      <input
                        type="text"
                        placeholder="Provide mandatory defect details and immediate corrective action taken..."
                        value={currentResp.remarks || ""}
                        onChange={(e) => handleRemarksChange(field.fieldId, e.target.value)}
                        className="w-full bg-[#101014] border border-rose-500/30 rounded-lg px-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-rose-400"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section: Live Photo Evidence Lightbox & Camera Capture */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#CDFE02]" />
                <span>Photo Evidence & Visual Verification</span>
              </h3>
              <p className="text-[11px] text-zinc-400">
                Capture live images of the kitchen station, temperature gauge, or equipment condition.
              </p>
            </div>

            <div className="text-xs">
              <span
                className={`font-bold font-mono ${
                  photos.length >= (checkSheet.mandatoryPhotoCount || 0)
                    ? "text-[#CDFE02]"
                    : "text-amber-400"
                }`}
              >
                {photos.length} / {checkSheet.mandatoryPhotoCount || 0} Attached
              </span>
            </div>
          </div>

          {/* Upload Button / Dropzone */}
          <div>
            <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-white/10 hover:border-[#5733F0] rounded-xl bg-[#101014] cursor-pointer transition-all group">
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoUpload}
                disabled={uploadingPhoto}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="w-10 h-10 rounded-full bg-[#5733F0]/20 flex items-center justify-center text-[#CDFE02] group-hover:scale-110 transition-all">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white">
                    {uploadingPhoto ? "Uploading photograph..." : "Tap to Snap Photo or Upload"}
                  </span>
                  <p className="text-[10px] text-zinc-500">Supports direct mobile camera capture (Max 8MB)</p>
                </div>
              </div>
            </label>
          </div>

          {/* Photo Gallery Grid */}
          {photos.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
              {photos.map((photo, pIdx) => (
                <div
                  key={pIdx}
                  className="relative group rounded-xl overflow-hidden border border-white/10 bg-black aspect-video flex items-center justify-center"
                >
                  <img
                    src={photo.url}
                    alt={photo.caption || "Evidence"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => removePhoto(pIdx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-rose-500 text-white transition-all opacity-0 group-hover:opacity-100"
                    title="Remove Photo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                  <div className="absolute bottom-0 inset-x-0 p-1.5 bg-black/80 backdrop-blur-xs text-[10px] text-zinc-300 truncate">
                    {photo.caption || "Inspection Evidence"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section: Operator Observations & Notes */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-2">
          <label className="text-xs font-bold uppercase tracking-wider text-white block">
            Operator Observations / Shift Remarks
          </label>
          <textarea
            rows={3}
            value={operatorNotes}
            onChange={(e) => setOperatorNotes(e.target.value)}
            placeholder="Add any specific observations, machine noises, or handover notes for the incoming shift supervisor..."
            className="w-full bg-[#101014] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </div>

        {/* Section: Digital Operator Verification & Sign-off */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-[#5733F0]/20 text-[#CDFE02] border border-[#5733F0]/30 shrink-0 mt-0.5">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Operator Attestation & Digital Verification
              </h4>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                By ticking below, you certify under penalty of internal audit policy that you have physically inspected all parameters and recorded true telemetry.
              </p>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-[#101014] border border-white/5 cursor-pointer">
            <input
              type="checkbox"
              checked={digitalSignChecked}
              onChange={(e) => setDigitalSignChecked(e.target.checked)}
              className="w-4 h-4 rounded accent-[#5733F0]"
            />
            <span className="text-xs font-semibold text-zinc-300">
              I, <strong className="text-white">{currentUser?.name || "Ramesh Pawar"}</strong> ({currentUser?.employeeId || "BAJAJ-OP-01"}), hereby verify and submit these readings.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-4 pt-2">
          <Link
            href="/operator"
            className="px-5 py-2.5 rounded-xl bg-[#141418] hover:bg-white/5 border border-white/10 text-xs font-semibold text-zinc-400 hover:text-white transition-all"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CDFE02] hover:bg-[#b8e602] text-[#101010] text-xs font-bold transition-all shadow-lg shadow-[#CDFE02]/20 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Dispatching Submission...</span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>Submit for Supervisor Approval</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

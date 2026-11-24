"use client";

import React, { useState } from "react";
import {
  ArrowRightLeft,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  CalendarDays,
  Send,
  Save,
  ShieldCheck,
  Thermometer,
  Layers,
  Sparkles,
} from "lucide-react";

export default function ShiftHandoverPage() {
  const [outgoingShift, setOutgoingShift] = useState("SHIFT_A");
  const [incomingShift, setIncomingShift] = useState("SHIFT_B");
  const [handoverNotes, setHandoverNotes] = useState(
    "All morning breakfast and lunch runs concluded with zero food safety non-conformances. Deep fryer oil TPM measured 18.2% (safe). Walk-in chiller temp maintained at 3.2°C. Evening dinner prep ingredients staged in walk-in chiller #2."
  );
  const [submitting, setSubmitting] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  const handleSignHandover = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSignedSuccess(true);
    }, 600);
  };

  return (
    <div className="space-y-6 pb-12 w-full font-sans">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-white/5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] border border-[#5733F0]/40">
              <ArrowRightLeft className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Shift Handover & Transition Log
            </h1>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Formally transition kitchen equipment, cold chain telemetry, and open defects to the incoming shift supervisor.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#141418] border border-white/10 text-xs">
          <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
          <span className="text-zinc-300 font-mono">Shift Transition Window: 13:30 – 14:00</span>
        </div>
      </div>

      {signedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              Shift Handover co-signed successfully! Recorded into the immutable plant governance ledger.
            </span>
          </div>
          <button
            onClick={() => setSignedSuccess(false)}
            className="text-[11px] underline hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Shift Transition Flow Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Outgoing Shift */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Relieving / Outgoing Shift
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CDFE02] text-black">
              Shift A (Morning)
            </span>
          </div>
          <div className="text-sm font-bold text-white">Ramesh Pawar (BAJAJ-OP-01)</div>
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Duty: 06:00 – 14:00 (Akurdi Main Kitchen)</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Checksheets Executed: 4 / 4 &bull; Zero Open Defects
          </div>
        </div>

        {/* Incoming Shift */}
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Incoming Shift Recipient
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5733F0] text-white">
              Shift B (Evening)
            </span>
          </div>
          <div className="text-sm font-bold text-white">Suresh Patil (BAJAJ-OP-02)</div>
          <div className="text-xs text-zinc-400 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-zinc-500" />
            <span>Duty: 14:00 – 22:00 (Dinner & Sanitization)</span>
          </div>
          <div className="text-[11px] text-zinc-500 font-mono">
            Roster Status: Checked-in & Ready to Assume Line
          </div>
        </div>
      </div>

      {/* Critical Control Point Telemetry Status Matrix */}
      <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#CDFE02]" />
          <span>Handover Critical Control Point (CCP) Telemetry</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl bg-[#101014] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Walk-in Chiller Temp
            </span>
            <div className="text-base font-bold text-white font-mono">3.2°C</div>
            <span className="text-[10px] text-emerald-400 font-semibold">&le; 4.0°C (Conforming)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101014] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Deep Freezer Temp
            </span>
            <div className="text-base font-bold text-white font-mono">-19.4°C</div>
            <span className="text-[10px] text-emerald-400 font-semibold">&le; -18.0°C (Conforming)</span>
          </div>

          <div className="p-3.5 rounded-xl bg-[#101014] border border-white/5 space-y-1">
            <span className="text-[10px] text-zinc-500 uppercase tracking-wider block">
              Cooking Oil TPM
            </span>
            <div className="text-base font-bold text-white font-mono">18.2%</div>
            <span className="text-[10px] text-emerald-400 font-semibold">&le; 25% (Safe for Shift B)</span>
          </div>
        </div>
      </div>

      {/* Handover Observations & Notes Form */}
      <form onSubmit={handleSignHandover} className="space-y-4">
        <div className="p-5 rounded-2xl bg-[#141418] border border-white/10 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-white block">
            Handover Observations & Special Instructions for Shift B
          </label>
          <textarea
            rows={4}
            value={handoverNotes}
            onChange={(e) => setHandoverNotes(e.target.value)}
            className="w-full bg-[#101014] border border-white/10 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#CDFE02] hover:bg-[#b8e602] text-[#101010] text-xs font-bold transition-all shadow-md shadow-[#CDFE02]/20 active:scale-95 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                <span>Co-Signing Handover...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Submit & Co-Sign Shift Handover</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

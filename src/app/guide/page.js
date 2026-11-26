"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  FileCheck2,
  Layers,
  Terminal,
  Activity,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Lock,
  UserCheck,
  ClipboardList,
  Server,
  Zap,
  Printer,
  ChevronRight,
  Flame,
  Clock,
  Sparkles,
  QrCode,
  Wrench,
  CloudUpload,
  Container,
  Cpu,
  History,
  Eye,
  Building2,
  FolderTree,
} from "lucide-react";

export default function ClientGuidePage() {
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("all");

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const credentials = [
    {
      role: "Admin",
      badge: "FULL ACCESS",
      badgeColor: "bg-[#CDFE02]/10 text-[#CDFE02] border-[#CDFE02]/30",
      email: "admin@bajaj.com",
      password: "AdminPassword@2026",
      dest: "/admin/dashboard",
      desc: "Full administrative governance, checksheets creation, tea count monitoring, reports dispatch, and notifications.",
      targetScenario: "Admin Flow (All 9 Modules)",
    },
    {
      role: "Operator",
      badge: "TOUCH TERMINAL",
      badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
      email: "operator@bajaj.com",
      password: "Operator@2026",
      dest: "/operator",
      desc: "Touch-optimized floor workstation for executing daily JH checksheets, live verification, and camera photo capture.",
      targetScenario: "Floor Checksheet Execution",
    },
  ];

  return (
    <div className="min-h-screen bg-[#09090C] text-zinc-100 font-sans selection:bg-[#CDFE02] selection:text-[#09090C] pb-24 print:bg-white print:text-black">
      {/* TOP NOTIFICATION BAR */}
      <div className="bg-gradient-to-r from-[#5733F0] via-[#3b1fb5] to-[#121218] border-b border-white/10 px-4 py-2.5 text-xs text-zinc-200 text-center flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
          <span className="font-semibold text-white tracking-wide">
            BAJAJ AUTO CANTEEN OPERATIONS OS 2.0
          </span>
          <span className="text-zinc-400 hidden sm:inline">— Official Client Testing & Handover Manual</span>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-[#0D0D12]/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between print:static print:bg-white print:border-b-2 print:border-black">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#5733F0] flex items-center justify-center font-bold text-white shadow-lg shadow-[#5733F0]/30">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-white text-base">BAJAJ OPERATIONS OS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-[#CDFE02]/10 text-[#CDFE02] border border-[#CDFE02]/20">
                v2.0 Beta
              </span>
            </div>
            <p className="text-[11px] text-zinc-400">Executive Walkthrough & Client Testing Guide</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#CDFE02] text-[#09090C] font-semibold text-xs hover:bg-[#b8e602] transition shadow-lg shadow-[#CDFE02]/10"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="relative border-b border-white/5 bg-gradient-to-b from-[#12121A] to-[#09090C] overflow-hidden px-6 py-12 md:py-16">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#5733F0]/15 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#CDFE02]" />
            <span>Comprehensive Client Delivery Documentation</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white mb-4">
            Bajaj Canteen Operations <span className="text-[#CDFE02]">2.0</span>
          </h1>
          <p className="text-sm md:text-base text-zinc-400 max-w-3xl leading-relaxed mb-6">
            Welcome to the interactive walkthrough for the next-generation Bajaj Auto Canteen Operations OS.
            This document outlines what has been engineered to date across <strong className="text-white">Module 1 (Admin Control Plane)</strong> and{" "}
            <strong className="text-white">Module 2 (Floor Operator Terminal)</strong>, provides step-by-step interactive testing instructions with live credentials, and previews our upcoming cloud deployment roadmap.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/5 max-w-4xl">
            <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-400 block">Current Status</span>
              <span className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Modules 1 & 2 Ready
              </span>
            </div>
            <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-400 block">Unit & E2E Tests</span>
              <span className="text-sm font-semibold text-[#CDFE02] mt-0.5 block">
                35 / 35 Passing (100%)
              </span>
            </div>
            <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-400 block">Compliance Standard</span>
              <span className="text-sm font-semibold text-white mt-0.5 block">
                FSSAI Sch. IV & ISO 22000
              </span>
            </div>
            <div className="bg-[#141418] p-3 rounded-lg border border-white/5">
              <span className="text-xs text-zinc-400 block">Signature Engine</span>
              <span className="text-sm font-semibold text-[#D2EFF7] mt-0.5 block">
                Cryptographic SHA-256
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-16">

        {/* SECTION 1: WHAT HAS BEEN BUILT */}
        <section id="what-we-covered" className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#5733F0]/20 border border-[#5733F0]/40 flex items-center justify-center text-[#CDFE02] font-mono text-sm font-bold">
                01
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  What Has Been Covered & Built (From Start to Present)
                </h2>
                <p className="text-xs text-zinc-400">Complete summary of full-stack modules implemented</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* MODULE 1: ADMIN CONSOLE */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#5733F0]/20 text-[#CDFE02]">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Module 1: Administrative Control Plane</h3>
                    <span className="text-xs text-zinc-400 font-mono">Routes: /admin/*</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COMPLETED
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Centralized command hub for facility directors, quality assurance managers, and supervisors to control compliance and operations across all plants.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Executive Command Dashboard:</strong> Real-time shift status, overall 94.2% compliance telemetry, pending review queues, CCP breach counter, and live audit feed.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Dynamic Checksheet Master:</strong> Configure frequency (Daily, Weekly, Shift-based), SLA turnarounds, tolerance intervals (min/max), CCP mandatory flags, and photo requirements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Centered Review & Digital Signature Modal:</strong> Full inspection verification drawer with side-by-side photo evidence, parameter readings, and cryptographic SHA-256 seal generator.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Plant Master Governance:</strong> Multi-tier departments (Kitchen, Storage, Quality QA), 3-shift rotating rosters with 30-min handover overlap windows, and RBAC user provisioning.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Immutable Forensic Audit Trail:</strong> Complete historical event log tracking all actor actions, IP addresses, digital signatures, and timestamps.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">System Settings & Telemetry:</strong> FSSAI License validation, ISO 22000 hygiene rules, Critical Control Point (CCP) tolerance thresholds.
                  </span>
                </li>
              </ul>
            </div>

            {/* MODULE 2: OPERATOR TOUCH TERMINAL */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-6 space-y-4 shadow-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-[#5733F0]/20 text-[#CDFE02]">
                    <Terminal className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base">Module 2: Floor Operator Touch Terminal</h3>
                    <span className="text-xs text-zinc-400 font-mono">Routes: /operator/*</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  COMPLETED
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                Ruggedized, touch-first operator workstation built for fast, error-free check execution on kitchen floor tablets and industrial touchscreens.
              </p>

              <ul className="space-y-2.5 text-xs text-zinc-300">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Ergonomic Fixed Shell:</strong> Dedicated dark left sidebar with on-duty employee badge, live shift countdown clock, and quick incident reporting shortcut.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Shift Taskboard:</strong> Live shift progress bar (e.g. 80% Shift Execution), task status filters ("Action Required", "Submitted & Approved"), and universal pagination.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Zero-Waste 2-Column Inspection Workbench:</strong> Full screen width utilization, real-time CCP out-of-tolerance red alerts, camera photo upload zone, and operator signature pad.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Shift Handover Log:</strong> Formal shift-to-shift handover records ensuring incoming operators receive kitchen status, cold room telemetry, and open defects.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Equipment Defect & Incident Triage:</strong> Fast floor logging for fryer breakdowns, oven sensor deviations, refrigeration leaks with severity tagging.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#CDFE02] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Universal SaaS Pagination Component:</strong> Reusable pagination widget integrated across all tables and taskboards with dynamic page sizing (6, 10, 25, 50).
                  </span>
                </li>
              </ul>
            </div>
          </div>

          {/* ARCHITECTURAL PILLARS HIGHLIGHT */}
          <div className="bg-[#141418] rounded-xl border border-white/5 p-6 space-y-4">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider text-zinc-400">
              Core Architectural Guardrails Built Into Every Screen
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-lg bg-[#09090C] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#CDFE02] font-semibold">
                  <Flame className="w-4 h-4" />
                  <span>CCP Safety Boundaries</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Cooking oil TPM &gt; 25% or deep freezer temp &gt; -18°C triggers instant visual hazard warnings preventing uninspected food batch releases.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#09090C] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-[#D2EFF7] font-semibold">
                  <Lock className="w-4 h-4" />
                  <span>SHA-256 Digital Seal</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Every supervisory approval produces a deterministic SHA-256 cryptographic hash combining inspector ID, timestamp, and review status for forensic validity.
                </p>
              </div>

              <div className="p-4 rounded-lg bg-[#09090C] border border-white/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                  <Activity className="w-4 h-4" />
                  <span>Zero-Vendor Lock-in</span>
                </div>
                <p className="text-zinc-400 leading-relaxed">
                  Engineered using modern Next.js 16 + React 19 + MongoDB + Tailwind CSS, ready for on-premise Docker deployment or private cloud servers.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: INTERACTIVE CLIENT TESTING GUIDE */}
        <section id="testing-guide" className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#CDFE02]/20 border border-[#CDFE02]/40 flex items-center justify-center text-[#CDFE02] font-mono text-sm font-bold">
                02
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  Interactive Client Testing Guide (Step-by-Step)
                </h2>
                <p className="text-xs text-zinc-400">
                  Pre-configured demo accounts and 4 concrete scenarios to test the platform right now
                </p>
              </div>
            </div>
          </div>

          {/* CREDENTIALS CARDS */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-[#CDFE02]" />
              <span>Available Test Accounts (Click Credentials to Copy or Fast-Login)</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentials.map((cred, idx) => (
                <div
                  key={idx}
                  className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 hover:border-white/20 transition relative group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-white text-sm">{cred.role}</h4>
                      <p className="text-[11px] text-zinc-400">{cred.desc}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${cred.badgeColor}`}>
                      {cred.badge}
                    </span>
                  </div>

                  <div className="bg-[#09090C] rounded-lg p-3 border border-white/5 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Email:</span>
                      <button
                        onClick={() => copyToClipboard(cred.email, `email-${idx}`)}
                        className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition font-medium"
                      >
                        <span>{cred.email}</span>
                        {copiedKey === `email-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-500">Password:</span>
                      <button
                        onClick={() => copyToClipboard(cred.password, `pass-${idx}`)}
                        className="flex items-center gap-1.5 text-zinc-200 hover:text-white transition font-medium"
                      >
                        <span>{cred.password}</span>
                        {copiedKey === `pass-${idx}` ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 text-zinc-500" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-zinc-400">
                      Best tested for: <strong className="text-zinc-300">{cred.targetScenario}</strong>
                    </span>
                    <Link
                      href={`/login?email=${encodeURIComponent(cred.email)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-white transition border border-white/10"
                    >
                      <span>Sign In with this Role</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* TESTING SCENARIOS */}
          <div className="space-y-4 pt-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-[#CDFE02]" />
              <span>Recommended End-to-End Testing Workflows</span>
            </h3>

            {/* SCENARIO 1 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#CDFE02] text-[#09090C] font-bold text-xs flex items-center justify-center">
                    A
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    Scenario 1: Floor Operator Executes Checksheet & Tests CCP Safeguards
                  </h4>
                </div>
                <span className="text-xs font-mono text-zinc-400">Role: OPERATOR</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#CDFE02] block">Step 1. Login to Terminal</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Open <strong className="text-white">/login</strong>, sign in with <code className="text-zinc-300">operator@bajaj.com</code>. You are instantly routed to <strong className="text-white">/operator</strong>.
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#CDFE02] block">Step 2. Select Active Task</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Under "Action Required", click <strong className="text-white">"Execute Checksheet →"</strong> on any due task (e.g. *Bakery Oven Calibration*).
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#CDFE02] block">Step 3. Enter Readings & CCP</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Test the out-of-tolerance guardrail: enter a value exceeding the max limit (e.g. 50). Notice the immediate red safety badge.
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#CDFE02] block">Step 4. Attach Photo & Submit</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Tap the photo upload box to add station evidence, sign with your name, and click <strong className="text-white">Submit Checksheet</strong>.
                  </p>
                </div>
              </div>
            </div>

            {/* SCENARIO 2 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#5733F0] text-white font-bold text-xs flex items-center justify-center">
                    B
                  </span>
                  <h4 className="font-bold text-white text-sm">
                    Scenario 2: Supervisor Reviews Inspection & Applies Cryptographic Stamp
                  </h4>
                </div>
                <span className="text-xs font-mono text-zinc-400">Role: SUPERVISOR or ADMIN</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#5733F0] block">Step 1. Open Submissions</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Log in as <code className="text-zinc-300">admin@bajaj.com</code> or <code className="text-zinc-300">supervisor@bajaj.com</code> and navigate to <strong className="text-white">/admin/submissions</strong>.
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#5733F0] block">Step 2. Launch Review Modal</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Locate the submission with status <span className="text-amber-400 font-semibold">SUBMITTED</span>. Click the purple <strong className="text-white">"Review & Sign"</strong> button.
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#5733F0] block">Step 3. Verify Photo & Data</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Inspect the centered modal showing all readings, tolerance ranges, and photo attachments captured by the floor operator.
                  </p>
                </div>

                <div className="bg-[#141418] p-3.5 rounded-lg border border-white/5 space-y-1">
                  <span className="font-bold text-[#5733F0] block">Step 4. Digitally Sign</span>
                  <p className="text-zinc-400 leading-relaxed">
                    Select <strong className="text-emerald-400">Approved</strong>, write notes, and click <strong className="text-white">Approve & Digitally Sign</strong>. View the generated SHA-256 seal!
                  </p>
                </div>
              </div>
            </div>

            {/* SCENARIO 3 & 4 IN TWO COLUMNS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* SCENARIO 3 */}
              <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-emerald-500 text-[#09090C] font-bold text-xs flex items-center justify-center">
                    C
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Scenario 3: Audit Trail & Compliance Forensic</h4>
                    <span className="text-[11px] text-zinc-400">Verify regulatory accountability</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Go to <strong className="text-white">/admin/audit</strong>. Verify that every login, checksheet edit, submission creation, and supervisory SHA-256 signature is logged with timestamp, user ID, and IP address for FSSAI auditors.
                </p>
                <div className="pt-2">
                  <Link
                    href="/admin/audit"
                    className="inline-flex items-center gap-1.5 text-xs text-[#CDFE02] hover:underline font-medium"
                  >
                    <span>View Audit Trail →</span>
                  </Link>
                </div>
              </div>

              {/* SCENARIO 4 */}
              <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-500 text-[#09090C] font-bold text-xs flex items-center justify-center">
                    D
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">Scenario 4: Shift Handover & Defect Triage</h4>
                    <span className="text-[11px] text-zinc-400">Shift overlap logs & machinery issues</span>
                  </div>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Visit <strong className="text-white">/operator/handover</strong> to see shift-to-shift handover logs and <strong className="text-white">/operator/incidents</strong> to view equipment defect logs reported from the kitchen floor.
                </p>
                <div className="pt-2">
                  <Link
                    href="/operator/handover"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline font-medium"
                  >
                    <span>View Handover Logs →</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: WHAT IS NEXT (PRODUCT ROADMAP) */}
        <section id="what-is-next" className="space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#D2EFF7]/20 border border-[#D2EFF7]/40 flex items-center justify-center text-[#D2EFF7] font-mono text-sm font-bold">
                03
              </div>
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  What Is Next (Production Phase Roadmap)
                </h2>
                <p className="text-xs text-zinc-400">
                  Planned engineering deliverables before real cloud server cutover
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* ITEM 1 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">1. Real-Time WebSockets & Push Alerts</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Live Server-Sent Events / Socket.io channel so supervisors get instant desktop notifications the moment an operator flags a CCP breach or submits a checksheet.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.1 • In Pipeline
              </span>
            </div>

            {/* ITEM 2 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">2. Kitchen Machinery QR Asset Scanning</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Operators scan physical QR badges on fryers, cold rooms, and ovens using tablet cameras to auto-select and lock the correct equipment checksheet.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.2 • Planned
              </span>
            </div>

            {/* ITEM 3 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">3. Maintenance Work Order Ticket Engine</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automated dispatch of corrective maintenance tickets to Bajaj engineering teams when critical equipment defects are logged on the kitchen floor.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.3 • Planned
              </span>
            </div>

            {/* ITEM 4 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <CloudUpload className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">4. Enterprise S3 / Cloud Storage Sync</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Direct pre-signed uploads to AWS S3 or Cloudflare R2 for high-resolution inspection photos with automated image compression and EXIF metadata extraction.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.4 • Pre-Deploy
              </span>
            </div>

            {/* ITEM 5 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <Container className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">5. Dockerization & Production Cloud Cutover</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Multi-stage Docker containerization, PM2 process management, automated database backup crons, and SSL/TLS certificate deployment for Bajaj production servers.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.5 • Final Release
              </span>
            </div>

            {/* ITEM 6 */}
            <div className="bg-[#101014] rounded-xl border border-white/10 p-5 space-y-3 relative group hover:border-[#5733F0]/50 transition">
              <div className="p-2.5 rounded-lg bg-[#5733F0]/20 text-[#CDFE02] w-fit">
                <History className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-white text-sm">6. FSSAI Regulatory One-Click Export</h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Automated monthly compliance dossiers compiled with all supervisor SHA-256 stamps ready for annual food safety licensing inspections.
              </p>
              <span className="inline-block text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-white/5 text-zinc-300">
                Phase 3.6 • Final Release
              </span>
            </div>
          </div>
        </section>

        {/* BOTTOM CALL TO ACTION */}
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#5733F0]/30 via-[#101014] to-[#CDFE02]/10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 print:hidden">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl md:text-2xl font-bold text-white">
              Ready to test the live platform?
            </h3>
            <p className="text-xs md:text-sm text-zinc-400 max-w-xl">
              Sign in with any of the demo accounts above to experience the dual-terminal workflow in real time.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/login"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#CDFE02] text-[#09090C] font-bold text-sm hover:bg-[#b8e602] transition shadow-lg shadow-[#CDFE02]/20"
            >
              <span>Go to Login Screen</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

      {/* FOOTER */}
      <footer className="border-t border-white/5 pt-8 text-center text-xs text-zinc-500 max-w-6xl mx-auto px-6">
        <p>Bajaj Auto Canteen Operations OS 2.0 • Akurdi & Chakan Facilities • Confidential & Proprietary</p>
      </footer>
    </div>
  );
}

"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/loader";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  KeyRound,
  FileCheck2,
  BookOpen,
  Zap,
  Users,
  UtensilsCrossed,
  ClipboardCheck,
  Coffee,
  Factory,
} from "lucide-react";

const DEMO_PRESETS = [
  {
    category: "OPERATIONS",
    title: "Admin",
    sub: "Full Console Access",
    email: "admin@bajaj.com",
    password: "AdminPassword@2026",
    badge: "Super Admin",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
    icon: ShieldCheck,
  },
  {
    category: "OPERATIONS",
    title: "Operator 1",
    sub: "Counters, Plates & Biscuits",
    email: "op1.counter@bajaj.com",
    password: "Operator1@2026",
    badge: "Shift 1/Gen/2/3/VIP",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: UtensilsCrossed,
  },
  {
    category: "OPERATIONS",
    title: "Operator 2",
    sub: "54 Checksheets & Biscuits",
    email: "op2.checks@bajaj.com",
    password: "Operator2@2026",
    badge: "0-25 & 26-50+",
    badgeColor: "bg-indigo-100 text-indigo-800 border-indigo-200",
    icon: ClipboardCheck,
  },
  {
    category: "OPERATIONS",
    title: "Operator 3",
    sub: "Shop Floor Tea Logistics",
    email: "op3.tea@bajaj.com",
    password: "Operator3@2026",
    badge: "Kettle Liters",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Coffee,
  },
  // OT Supervisors across all 6 departments
  {
    category: "OT_SUPERVISOR",
    title: "Engine Assy",
    sub: "Engine Shop OT Roster",
    email: "ot.engine@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  {
    category: "OT_SUPERVISOR",
    title: "Vehicle Assy",
    sub: "Vehicle Assembly OT",
    email: "ot.vehicle@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  {
    category: "OT_SUPERVISOR",
    title: "Machine Shop",
    sub: "Machine Shop OT",
    email: "ot.machine@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  {
    category: "OT_SUPERVISOR",
    title: "Paint Shop",
    sub: "Paint Shop OT",
    email: "ot.paint@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  {
    category: "OT_SUPERVISOR",
    title: "Press Shop",
    sub: "Press Shop OT",
    email: "ot.press@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
  {
    category: "OT_SUPERVISOR",
    title: "Quality (QA)",
    sub: "QA & Inspection OT",
    email: "ot.qa@bajaj.com",
    password: "OTSupervisor@2026",
    badge: "2h & 3h OT",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
    icon: Clock,
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@bajaj.com");
  const [password, setPassword] = useState("AdminPassword@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [activePresetTab, setActivePresetTab] = useState("OPERATIONS"); // "OPERATIONS" or "OT"

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      if (emailParam === "operator@bajaj.com") setPassword("Operator@2026");
      else if (emailParam.startsWith("op1")) setPassword("Operator1@2026");
      else if (emailParam.startsWith("op2")) setPassword("Operator2@2026");
      else if (emailParam.startsWith("op3")) setPassword("Operator3@2026");
      else if (emailParam.startsWith("ot.")) setPassword("OTSupervisor@2026");
      else setPassword("AdminPassword@2026");
    }
  }, [searchParams]);

  const performLogin = async (targetEmail, targetPassword) => {
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, password: targetPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please verify your email and password.");
      }

      setSuccess(true);
      setTimeout(() => {
        const code = data.user?.role?.code || "";
        if (code === "OPERATOR_1") {
          router.push("/operator/counters");
        } else if (code === "OPERATOR_2") {
          router.push("/operator/checksheets");
        } else if (code === "OPERATOR_3") {
          router.push("/operator/tea-delivery");
        } else if (code === "OT_SUPERVISOR") {
          router.push("/operator/overtime");
        } else if (code === "OPERATOR") {
          router.push("/operator");
        } else {
          router.push("/admin/dashboard");
        }
      }, 350);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  const handleQuickLogin = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    performLogin(preset.email, preset.password);
  };

  const handleFillOnly = (preset) => {
    setEmail(preset.email);
    setPassword(preset.password);
    setError("");
  };

  const filteredPresets = DEMO_PRESETS.filter((p) =>
    activePresetTab === "OPERATIONS" ? p.category === "OPERATIONS" : p.category === "OT_SUPERVISOR"
  );

  return (
    <div className="w-full max-w-sm mx-auto my-auto space-y-5 relative z-10 font-sans">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to console
        </h1>
        <p className="text-xs text-slate-500">
          Enter your credentials or click any authorized role below for 1-click instant login.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {success && (
        <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-xs text-emerald-700 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-semibold">Credentials verified. Redirecting to workspace...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleManualSubmit} className="space-y-3.5">
        <div className="space-y-1">
          <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
            Work Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@bajaj.com"
              className="pl-10 text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <span className="text-[10px] text-slate-400 font-mono">Encrypted TLS</span>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="pl-10 pr-10 text-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Shadcn Button */}
        <Button
          type="submit"
          variant="default"
          size="lg"
          loading={loading}
          disabled={loading || success}
          className="w-full mt-1 bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
        >
          <span>{loading ? "Authenticating..." : "Sign In to Console"}</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* 1-CLICK INSTANT LOGIN PANEL */}
      <div className="pt-3 border-t border-slate-200 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-700">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>1-Click Instant Login</span>
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100">
            One Click • Zero Typing
          </span>
        </div>

        {/* Tab Switcher: Operations vs OT Supervisors */}
        <div className="grid grid-cols-2 gap-1 p-0.5 rounded-xl bg-slate-100 border border-slate-200">
          <button
            type="button"
            onClick={() => setActivePresetTab("OPERATIONS")}
            className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePresetTab === "OPERATIONS"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Operations &amp; Admin (4)
          </button>
          <button
            type="button"
            onClick={() => setActivePresetTab("OT")}
            className={`py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
              activePresetTab === "OT"
                ? "bg-white text-indigo-700 shadow-2xs font-semibold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            OT Supervisors (6 Depts)
          </button>
        </div>

        {/* Dynamic Preset Cards */}
        <div className={`grid ${activePresetTab === "OPERATIONS" ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-3"} gap-2`}>
          {filteredPresets.map((preset, idx) => {
            const Icon = preset.icon;
            return (
              <button
                key={idx}
                type="button"
                disabled={loading || success}
                onClick={() => handleQuickLogin(preset)}
                className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50/80 border border-slate-200 hover:border-indigo-300 text-left transition-all group shadow-2xs cursor-pointer flex flex-col justify-between space-y-2"
                title={`Click to log in instantly as ${preset.title}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-indigo-600 group-hover:scale-105 transition-transform">
                      <Icon className="w-3.5 h-3.5" />
                    </span>
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full border ${preset.badgeColor}`}>
                      {preset.badge}
                    </span>
                  </div>
                  <div className="text-slate-900 font-bold text-xs group-hover:text-indigo-600 transition-colors">
                    {preset.title}
                  </div>
                  <div className="text-slate-500 text-[10px] truncate leading-tight">
                    {preset.sub}
                  </div>
                </div>

                <div className="pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-indigo-600 font-bold">
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <div className="flex-1 flex">
        {/* LEFT COLUMN: Industrial Operations Showcase (Desktop Only) */}
        <div className="hidden lg:flex lg:w-[50%] xl:w-[54%] relative flex-col justify-between p-12 border-r border-slate-200 bg-linear-to-b from-indigo-50/70 via-slate-50 to-white overflow-hidden">
          {/* Ambient Subtle Highlights */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Header on Left Panel */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-600 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-sm">
                B
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-sm tracking-tight text-slate-900">BAJAJ AUTO</span>
                  <Badge variant="indigo" className="text-[10px]">
                    OPERATIONS OS
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-500">Akurdi Industrial Facility • Unit 04</p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-700 text-[11px] font-mono font-medium">Shift 1 &amp; General (06:00 – 14:00)</span>
            </div>
          </div>

          {/* Center Live Cockpit Preview Card */}
          <div className="relative z-10 my-auto py-8 max-w-lg">
            <div className="space-y-4">
              <Badge variant="indigo" className="gap-2 px-3 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Quality &amp; Food Safety Governance</span>
              </Badge>

              <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Standardized plant operations, daily checksheets &amp; digital reporting.
              </h2>

              <p className="text-sm text-slate-600 leading-relaxed">
                Centralized platform connecting plant administrators, floor supervisors, and operators across all manufacturing shifts with tamper-proof digital evidence.
              </p>
            </div>

            {/* High-End Clean Telemetry Widget */}
            <div className="mt-8 rounded-2xl bg-white border border-slate-200 p-5 space-y-4 shadow-sm">
              {/* Shift Progress bar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-600" />
                    Shift 1 &amp; General Progress
                  </span>
                  <span className="font-mono text-indigo-600 font-semibold">Live Monitored</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-linear-to-r from-indigo-600 to-emerald-500 rounded-full w-[85%]" />
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Food Safety</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight">100%</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Target met
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Active Checklists</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight">54 Catalog</div>
                  <div className="text-[10px] text-slate-500">2 Groups (0-25 &amp; 26-50+)</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Audit Status</div>
                  <div className="text-lg font-bold text-indigo-600 tracking-tight">Verified</div>
                  <div className="text-[10px] text-slate-500">Digital ledger</div>
                </div>
              </div>

              {/* Recent Live Feed Item */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[11px]">Factory Canteen Operations 2.0</div>
                    <div className="text-[10px] text-slate-500">Tamper-Proof Audit Trail • Akurdi Unit</div>
                  </div>
                </div>
                <Badge variant="success">
                  Active
                </Badge>
              </div>
            </div>
          </div>

          {/* Left Panel Footer / Compliance Badges */}
          <div className="relative z-10 flex items-center gap-4 text-xs text-slate-500 pt-6 border-t border-slate-200">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
              HACCP Compliant
            </span>
            <span>•</span>
            <span>ISO 22000 Framework</span>
            <span>•</span>
            <span>256-Bit TLS Security</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Ultra-Clean SaaS Login Experience */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-10 lg:p-12 relative bg-white overflow-y-auto">
          {/* Mobile Top Header (Hidden on Desktop) */}
          <div className="flex items-center justify-between lg:hidden mb-6 relative z-10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-white text-sm">
                B
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-slate-900">BAJAJ CANTEEN</span>
                <p className="text-[10px] text-slate-500">Operations Console</p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700">
              OPERATIONS 2.0
            </span>
          </div>

          {/* Empty Spacer on Desktop Top */}
          <div className="hidden lg:block h-2" />

          {/* Suspended Login Form */}
          <Suspense fallback={<div className="text-slate-400 text-xs text-center py-10">Loading login console...</div>}>
            <LoginForm />
          </Suspense>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 pt-6 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            <p>© 2026 Bajaj Auto Limited • Operations OS 2.0</p>
            <p className="text-slate-400 text-[11px]">Factory Canteen &amp; Shop Floor Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

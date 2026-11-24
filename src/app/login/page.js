"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Sparkles,
  Building,
  KeyRound,
  FileCheck2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@bajaj.com");
  const [password, setPassword] = useState("AdminPassword@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Invalid credentials. Please verify your email and password.");
      }

      setSuccess(true);
      setTimeout(() => {
        if (data.user?.role?.code === "OPERATOR") {
          router.push("/operator");
        } else {
          router.push("/admin/dashboard");
        }
      }, 500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = (type = "admin") => {
    if (type === "operator") {
      setEmail("operator@bajaj.com");
      setPassword("Operator@2026");
    } else {
      setEmail("admin@bajaj.com");
      setPassword("AdminPassword@2026");
    }
    setError("");
  };

  return (
    <div className="min-h-screen w-full bg-[#09090C] text-zinc-100 flex font-sans selection:bg-[#CDFE02] selection:text-[#09090C]">
      {/* LEFT COLUMN: Industrial Operations Showcase (Desktop Only) */}
      <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 border-r border-white/5 bg-[#0D0D12] overflow-hidden">
        {/* Ambient Radial Gradient Mesh */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-[#5733F0]/20 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#CDFE02]/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute inset-0 bg-saas-grid opacity-60 pointer-events-none" />

        {/* Top Header on Left Panel */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-lg shadow-[#5733F0]/30 border border-white/10">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm tracking-tight text-white">BAJAJ AUTO</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#5733F0]/20 border border-[#5733F0]/40 text-[#D2EFF7]">
                  OPERATIONS OS
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Akurdi Industrial Facility • Unit 04</p>
            </div>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs">
            <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-zinc-300 text-[11px] font-mono">Shift A Active (06:00 – 14:00)</span>
          </div>
        </div>

        {/* Center Live Cockpit Preview Card */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CDFE02]/10 border border-[#CDFE02]/30 text-[#CDFE02] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Real-Time Quality & Food Safety Governance</span>
            </div>

            <h2 className="text-3xl xl:text-4xl font-bold tracking-tight text-white leading-tight">
              Standardized plant operations, shift handovers & digital audit trails.
            </h2>

            <p className="text-sm text-zinc-400 leading-relaxed">
              Centralized platform connecting plant administrators, floor supervisors, and operators across all manufacturing shifts with tamper-proof digital evidence.
            </p>
          </div>

          {/* High-End Glass Telemetry Widget */}
          <div className="mt-8 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl p-5 space-y-4 shadow-2xl">
            {/* Shift Progress bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-zinc-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#5733F0]" />
                  Shift A Operational Progress
                </span>
                <span className="font-mono text-[#CDFE02] font-semibold">82% Completed</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-[#5733F0] to-[#CDFE02] rounded-full w-[82%]" />
              </div>
            </div>

            {/* Metrics Strip */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
              <div className="space-y-0.5">
                <div className="text-xs text-zinc-400">Hygiene Score</div>
                <div className="text-lg font-bold text-white tracking-tight">99.8%</div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Target met
                </div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-zinc-400">Check Sheets</div>
                <div className="text-lg font-bold text-white tracking-tight">148 Active</div>
                <div className="text-[10px] text-zinc-400">4 Departments</div>
              </div>
              <div className="space-y-0.5">
                <div className="text-xs text-zinc-400">Audit Status</div>
                <div className="text-lg font-bold text-[#D2EFF7] tracking-tight">Verified</div>
                <div className="text-[10px] text-zinc-400">Immutable log</div>
              </div>
            </div>

            {/* Recent Live Feed Item */}
            <div className="rounded-xl bg-black/40 border border-white/5 p-3 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#5733F0]/20 flex items-center justify-center text-[#5733F0]">
                  <FileCheck2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-white text-[11px]">Daily Cold Storage Log</div>
                  <div className="text-[10px] text-zinc-400">Verified by Shift Supervisor • 12m ago</div>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                Approved
              </span>
            </div>
          </div>
        </div>

        {/* Left Panel Footer / Compliance Badges */}
        <div className="relative z-10 flex items-center gap-4 text-xs text-zinc-500 pt-6 border-t border-white/5">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#5733F0]" />
            HACCP Compliant
          </span>
          <span>•</span>
          <span>ISO 22000 Quality Framework</span>
          <span>•</span>
          <span>256-Bit TLS Encryption</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Ultra-Clean SaaS Login Experience */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative">
        <div className="absolute inset-0 bg-dot-pattern opacity-40 pointer-events-none" />

        {/* Mobile Top Header (Hidden on Desktop) */}
        <div className="flex items-center justify-between lg:hidden mb-8 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#5733F0] flex items-center justify-center font-bold text-white text-sm">
              B
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight text-white">BAJAJ CANTEEN</span>
              <p className="text-[10px] text-zinc-400">Operations Console</p>
            </div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#09090C]">
            ADMIN 2.0
          </span>
        </div>

        {/* Empty Spacer on Desktop Top */}
        <div className="hidden lg:block h-6" />

        {/* Centered Login Box */}
        <div className="w-full max-w-sm mx-auto my-auto space-y-6 relative z-10">
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Sign in to console
            </h1>
            <p className="text-xs text-zinc-400">
              Enter your enterprise credentials to access your administrative dashboard and shift checklists.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3 flex items-start gap-2.5 text-xs text-red-300 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Banner */}
          {success && (
            <div className="rounded-xl bg-[#CDFE02]/10 border border-[#CDFE02]/30 p-3 flex items-center gap-2 text-xs text-[#CDFE02] animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span className="font-semibold">Credentials verified. Loading console...</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                Work Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@bajaj.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0] focus:ring-1 focus:ring-[#5733F0] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider">
                  Password
                </label>
                <button
                  type="button"
                  className="text-[11px] text-[#D2EFF7] hover:underline"
                  tabIndex={-1}
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0] focus:ring-1 focus:ring-[#5733F0] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Tactile Primary Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#5733F0] hover:bg-[#5733F0]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5733F0]/25 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#CDFE02]" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 text-[#CDFE02]" />
                </>
              )}
            </button>
          </form>

          {/* Refined Staging / Demo Instance Presets */}
          <div className="pt-4 border-t border-white/5 space-y-2">
            <div className="flex items-center justify-between text-[11px] text-zinc-400">
              <span className="flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#5733F0]" />
                <span>Demo Staging Accounts</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">1-Click Fast Fill</span>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleFillDemo("admin")}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-[#5733F0]/10 border border-white/5 hover:border-[#5733F0]/40 text-left transition-all group"
              >
                <div className="text-white font-medium text-[11px] group-hover:text-[#CDFE02]">
                  Super Admin
                </div>
                <div className="text-zinc-500 text-[10px] font-mono truncate">admin@bajaj.com</div>
              </button>

              <button
                type="button"
                onClick={() => handleFillDemo("operator")}
                className="p-2.5 rounded-xl bg-white/[0.02] hover:bg-[#CDFE02]/10 border border-white/5 hover:border-[#CDFE02]/40 text-left transition-all group"
              >
                <div className="text-white font-medium text-[11px] group-hover:text-[#CDFE02]">
                  Floor Operator
                </div>
                <div className="text-zinc-500 text-[10px] font-mono truncate">operator@bajaj.com</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-zinc-500 pt-8 relative z-10">
          <p>© 2026 Bajaj Auto Limited • Industrial Canteen Administration Portal</p>
        </div>
      </div>
    </div>
  );
}

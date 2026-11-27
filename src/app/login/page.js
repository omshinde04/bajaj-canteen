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
} from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("admin@bajaj.com");
  const [password, setPassword] = useState("AdminPassword@2026");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const emailParam = searchParams.get("email");
    const demoParam = searchParams.get("demo");

    if (emailParam) {
      setEmail(emailParam);
      if (emailParam === "operator@bajaj.com") setPassword("Operator@2026");
      else setPassword("AdminPassword@2026");
    } else if (demoParam) {
      handleFillDemo(demoParam);
    }
  }, [searchParams]);

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
    <div className="w-full max-w-sm mx-auto my-auto space-y-6 relative z-10">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to console
        </h1>
        <p className="text-xs text-slate-500">
          Enter your enterprise credentials to access your administrative dashboard and checksheet system.
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
          <span className="font-semibold">Credentials verified. Loading console...</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-1.5">
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
              className="pl-10"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            <button
              type="button"
              className="text-[11px] text-indigo-600 hover:underline"
              tabIndex={-1}
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••••••"
              className="pl-10 pr-10"
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
          className="w-full mt-2"
        >
          <span>Sign In</span>
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>

      {/* Refined Staging / Demo Instance Presets */}
      <div className="pt-4 border-t border-slate-200 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1.5 font-medium">
            <KeyRound className="w-3.5 h-3.5 text-indigo-600" />
            <span>Authorized Logins (Admin & Operator)</span>
          </span>
          <span className="text-[10px] text-slate-400 font-mono">1-Click Fast Fill</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleFillDemo("admin")}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="text-slate-800 font-semibold text-[11px] group-hover:text-indigo-600">
              Admin
            </div>
            <div className="text-slate-500 text-[10px] font-mono truncate">admin@bajaj.com</div>
          </button>

          <button
            type="button"
            onClick={() => handleFillDemo("operator")}
            className="p-2.5 rounded-xl bg-slate-50 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 text-left transition-all group shadow-xs cursor-pointer"
          >
            <div className="text-slate-800 font-semibold text-[11px] group-hover:text-indigo-600">
              Operator
            </div>
            <div className="text-slate-500 text-[10px] font-mono truncate">operator@bajaj.com</div>
          </button>
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
        <div className="hidden lg:flex lg:w-[52%] xl:w-[55%] relative flex-col justify-between p-12 border-r border-slate-200 bg-linear-to-b from-indigo-50/70 via-slate-50 to-white overflow-hidden">
          {/* Ambient Subtle Highlights */}
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-200/30 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-blue-100/50 rounded-full blur-[120px] pointer-events-none" />

          {/* Top Header on Left Panel */}
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg tracking-wider shadow-sm">
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
              <span className="text-slate-700 text-[11px] font-mono font-medium">Shift A Active (06:00 – 14:00)</span>
            </div>
          </div>

          {/* Center Live Cockpit Preview Card */}
          <div className="relative z-10 my-auto py-8 max-w-lg">
            <div className="space-y-4">
              <Badge variant="indigo" className="gap-2 px-3 py-1 text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Real-Time Quality & Food Safety Governance</span>
              </Badge>

              <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
                Standardized plant operations, daily checksheets & digital reporting.
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
                    Shift A Operational Progress
                  </span>
                  <span className="font-mono text-indigo-600 font-semibold">82% Completed</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-linear-to-r from-indigo-600 to-emerald-500 rounded-full w-[82%]" />
                </div>
              </div>

              {/* Metrics Strip */}
              <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100">
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Hygiene Score</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight">99.8%</div>
                  <div className="text-[10px] text-emerald-600 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Target met
                  </div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Check Sheets</div>
                  <div className="text-lg font-bold text-slate-900 tracking-tight">148 Active</div>
                  <div className="text-[10px] text-slate-500">4 Departments</div>
                </div>
                <div className="space-y-0.5">
                  <div className="text-xs text-slate-500">Audit Status</div>
                  <div className="text-lg font-bold text-indigo-600 tracking-tight">Verified</div>
                  <div className="text-[10px] text-slate-500">Official log</div>
                </div>
              </div>

              {/* Recent Live Feed Item */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-3 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                    <FileCheck2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 text-[11px]">Daily Cold Storage Log</div>
                    <div className="text-[10px] text-slate-500">Verified by Shift Supervisor • 12m ago</div>
                  </div>
                </div>
                <Badge variant="success">
                  Approved
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
            <span>ISO 22000 Quality Framework</span>
            <span>•</span>
            <span>256-Bit TLS Security</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Ultra-Clean SaaS Login Experience */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 relative bg-white">
          {/* Mobile Top Header (Hidden on Desktop) */}
          <div className="flex items-center justify-between lg:hidden mb-8 relative z-10">
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
          <div className="hidden lg:block h-6" />

          {/* Suspended Login Form */}
          <Suspense fallback={<div className="text-slate-400 text-xs text-center py-10">Loading login console...</div>}>
            <LoginForm />
          </Suspense>

          {/* Footer */}
          <div className="text-center text-xs text-slate-500 pt-8 relative z-10 flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-slate-100">
            <p>© 2026 Bajaj Auto Limited • Operations OS 2.0</p>
            <p className="text-slate-400 text-[11px]">Factory Canteen &amp; Shop Floor Operations</p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  ShieldCheck,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  Sparkles,
  ArrowRight,
  Server,
  Database,
  Building2,
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
        throw new Error(data.error || "Login failed. Please check credentials.");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/dashboard");
      }, 600);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoFill = (roleType) => {
    if (roleType === "super_admin") {
      setEmail("admin@bajaj.com");
      setPassword("AdminPassword@2026");
    }
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#101010] text-white flex flex-col justify-between font-sans selection:bg-[#CDFE02] selection:text-[#101010]">
      {/* Top Brand Bar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between backdrop-blur-md bg-[#101010]/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-[#5733F0]/30">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base tracking-tight">BAJAJ CANTEEN</span>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
                ENTERPRISE 2.0
              </span>
            </div>
            <p className="text-xs text-zinc-400">Akurdi Facility & Operations</p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-400">
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
            MongoDB Shard: Online
          </span>
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <Server className="w-3.5 h-3.5 text-[#5733F0]" />
            Auth Guard: Active
          </span>
        </div>
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <div className="w-full max-w-md">
          {/* Outer glow wrapper */}
          <div className="relative rounded-3xl bg-gradient-to-b from-white/10 to-white/[0.02] p-px shadow-2xl">
            <div className="rounded-3xl bg-[#141414] p-7 sm:p-9 space-y-6">
              {/* Header inside card */}
              <div className="space-y-2 text-center sm:text-left">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5733F0]/20 border border-[#5733F0]/40 text-[#D2EFF7] text-xs font-medium">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#CDFE02]" />
                  <span>Role-Based Access Control (RBAC)</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Admin Sign In
                </h1>
                <p className="text-xs text-zinc-400">
                  Authenticate with authorized operational credentials to manage check sheets, shifts, and approvals.
                </p>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 p-3.5 flex items-start gap-3 text-xs text-red-300 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <div className="leading-relaxed">{error}</div>
                </div>
              )}

              {/* Success Notification */}
              {success && (
                <div className="rounded-xl bg-[#CDFE02]/10 border border-[#CDFE02]/40 p-3.5 flex items-center gap-2.5 text-xs text-[#CDFE02] animate-in fade-in">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">Authentication verified. Entering Admin Console...</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-zinc-300 block">
                    Corporate Email / Employee ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="e.g. admin@bajaj.com"
                      className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0] focus:ring-1 focus:ring-[#5733F0] transition-colors"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">
                      Password
                    </label>
                    <span className="text-[11px] text-[#D2EFF7] hover:underline cursor-pointer">
                      Forgot Password?
                    </span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••••••"
                      className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0] focus:ring-1 focus:ring-[#5733F0] transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit CTA */}
                <button
                  type="submit"
                  disabled={loading || success}
                  className="w-full mt-2 py-3 px-4 rounded-xl font-semibold text-sm text-white bg-[#5733F0] hover:bg-[#5733F0]/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#5733F0]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#CDFE02]" />
                      <span>Authenticating Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Admin Console</span>
                      <ArrowRight className="w-4 h-4 text-[#CDFE02]" />
                    </>
                  )}
                </button>
              </form>

              {/* Quick Preset Demo Login Helper */}
              <div className="pt-2 border-t border-white/10">
                <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Pre-Seeded Test Credentials:</span>
                  <span className="text-[#CDFE02] font-mono">1-Click Auto Fill</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleQuickDemoFill("super_admin")}
                  className="w-full text-left p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-colors text-xs flex items-center justify-between"
                >
                  <div>
                    <div className="font-semibold text-white">Super Administrator</div>
                    <div className="text-[11px] text-zinc-400 font-mono">admin@bajaj.com / AdminPassword@2026</div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#CDFE02] text-[#101010]">
                    Super Admin
                  </span>
                </button>
              </div>

              {/* Security Compliance Pill */}
              <div className="text-center pt-1">
                <p className="text-[11px] text-zinc-500">
                  Protected by 256-bit encryption & immutable audit logging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-4 px-6 text-center text-xs text-zinc-500">
        <p>Bajaj Auto Operations & Canteen Administration Portal • Version 2.0</p>
      </footer>
    </div>
  );
}

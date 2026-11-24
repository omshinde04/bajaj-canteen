"use client";

import React, { useState, useEffect } from "react";
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Layers,
  ArrowUpRight,
  Database,
  CloudCheck,
  Sparkles,
  Server,
  Zap,
} from "lucide-react";

export default function Home() {
  const [health, setHealth] = useState({ status: "checking", database: { status: "checking" } });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((data) => setHealth(data))
      .catch((err) => setHealth({ status: "error", error: err.message }));
  }, []);

  const kpis = [
    {
      title: "Total Check Sheets",
      value: "148",
      subtext: "+12 created this week",
      icon: FileSpreadsheet,
      accent: "border-[#5733F0]/40 text-[#5733F0]",
      bg: "bg-[#5733F0]/10",
    },
    {
      title: "Active Operators",
      value: "42",
      subtext: "Across Shifts A, B, C",
      icon: Users,
      accent: "border-[#D2EFF7]/40 text-[#D2EFF7]",
      bg: "bg-[#D2EFF7]/10",
    },
    {
      title: "Pending Approvals",
      value: "19",
      subtext: "Action required today",
      icon: Clock,
      accent: "border-[#CDFE02]/40 text-[#CDFE02]",
      bg: "bg-[#CDFE02]/10",
    },
    {
      title: "SLA & Compliance",
      value: "99.4%",
      subtext: "Target: 98.0% achieved",
      icon: ShieldCheck,
      accent: "border-[#CDFE02]/40 text-[#CDFE02]",
      bg: "bg-[#CDFE02]/10",
    },
  ];

  const recentActivities = [
    {
      id: "ACT-1092",
      operator: "Rajesh Sharma",
      dept: "Canteen Bakery Line 1",
      sheet: "Daily Hygiene & Oven Temperature Check",
      shift: "Shift A",
      time: "10 mins ago",
      status: "Submitted",
      statusColor: "bg-[#D2EFF7] text-[#101010]",
    },
    {
      id: "ACT-1091",
      operator: "Amit Verma",
      dept: "Cold Storage Room B",
      sheet: "Freezer Deep Cleaning & Storage Audit",
      shift: "Shift A",
      time: "24 mins ago",
      status: "Approved",
      statusColor: "bg-[#CDFE02] text-[#101010]",
    },
    {
      id: "ACT-1090",
      operator: "Suresh Patil",
      dept: "Kitchen Main Exhaust",
      sheet: "Filter Inspection & Grease Trap Service",
      shift: "Shift C",
      time: "1 hour ago",
      status: "Under Review",
      statusColor: "bg-[#5733F0] text-white",
    },
    {
      id: "ACT-1089",
      operator: "Vikram Kulkarni",
      dept: "Dishwashing Sanitization",
      sheet: "Water Temperature & Chemical Dispenser Check",
      shift: "Shift C",
      time: "2 hours ago",
      status: "Completed",
      statusColor: "bg-[#CDFE02] text-[#101010]",
    },
  ];

  return (
    <div className="min-h-screen bg-[#101010] text-[#FFFFFF] font-sans selection:bg-[#CDFE02] selection:text-[#101010]">
      {/* Top Navigation Bar */}
      <header className="border-b border-white/10 bg-[#101010]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-lg text-white shadow-lg shadow-[#5733F0]/20">
              B
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-white">
                  BAJAJ CANTEEN
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-[#CDFE02] text-[#101010]">
                  ADMIN 2.0
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Enterprise Operations Management Console
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Database & Vercel live badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  health.status === "operational" ? "bg-[#CDFE02] animate-pulse" : "bg-amber-400"
                }`}
              />
              <span className="text-zinc-300 font-mono text-[11px]">
                DB: {health.database?.status || "Checking..."}
              </span>
            </div>

            <a
              href="/login"
              className="text-xs px-3.5 py-1.5 rounded-full bg-[#CDFE02] hover:bg-[#CDFE02]/90 text-[#101010] font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <span>Sign In</span>
            </a>

            <a
              href="https://github.com/omshinde04/bajaj-canteen"
              target="_blank"
              rel="noreferrer"
              className="text-xs px-3.5 py-1.5 rounded-full bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-medium flex items-center gap-1.5 transition-all shadow-md shadow-[#5733F0]/25"
            >
              <span>GitHub Repo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Hero Banner */}
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#5733F0]/30 via-white/5 to-[#101010] p-6 sm:p-8 border border-white/10">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#CDFE02]/10 border border-[#CDFE02]/30 text-[#CDFE02] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Phase 1 Architecture Deployed & Connected</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white">
              Centralized Operational Governance & Live Admin Control
            </h1>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              Real-time monitoring for check sheets, shift operations (Shift A, B, C), multi-tiered approvals, photo evidence, and automated compliance for Bajaj facilities.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-3">
              <a
                href="/login"
                className="px-5 py-2.5 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs flex items-center gap-2 shadow-lg shadow-[#5733F0]/30 transition-all"
              >
                <span>Launch Admin Console</span>
                <ArrowUpRight className="w-4 h-4 text-[#CDFE02]" />
              </a>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5 text-[#CDFE02]" />
                MongoDB Atlas: {health.database?.name || "bajaj_enterprise"}
              </span>
              <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-zinc-300 flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-[#5733F0]" />
                Next.js 16 App Router
              </span>
            </div>
          </div>
        </section>

        {/* Operational KPI Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 hover:border-white/20 transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-zinc-400">{kpi.title}</span>
                  <div className={`p-2 rounded-xl ${kpi.bg}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-4">
                  <div className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
                    {kpi.value}
                  </div>
                  <div className="text-xs text-zinc-400 mt-1">{kpi.subtext}</div>
                </div>
              </div>
            );
          })}
        </section>

        {/* Live Submissions & Shifts Table */}
        <section className="rounded-2xl bg-white/[0.03] border border-white/10 overflow-hidden">
          <div className="p-5 border-b border-white/10 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="text-base font-semibold text-white">Live Activity & Shift Submissions</h2>
              <p className="text-xs text-zinc-400">
                Synchronized real-time feed across plant departments
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs text-[#CDFE02] bg-[#CDFE02]/10 px-2.5 py-1 rounded-full border border-[#CDFE02]/30">
                <Zap className="w-3 h-3" />
                Live Sync
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-300">
              <thead className="bg-white/[0.02] text-xs text-zinc-400 uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Record ID</th>
                  <th className="px-5 py-3.5">Operator</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Check Sheet</th>
                  <th className="px-5 py-3.5">Shift</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentActivities.map((row) => (
                  <tr key={row.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-xs text-zinc-400">{row.id}</td>
                    <td className="px-5 py-3.5 font-medium text-white">{row.operator}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-300">{row.dept}</td>
                    <td className="px-5 py-3.5 text-xs text-zinc-300">{row.sheet}</td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-white/10 text-white">
                        {row.shift}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-zinc-400">{row.time}</td>
                    <td className="px-5 py-3.5 text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${row.statusColor}`}
                      >
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Architecture Specs & Color Palette preview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#5733F0]" />
              <span>Design System Tokens</span>
            </h3>
            <p className="text-xs text-zinc-400">
              Verified color tokens from approved visual identity:
            </p>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#CDFE02]" />
                  <span className="font-mono text-zinc-200">#CDFE02</span>
                </div>
                <span className="text-zinc-400">Neon Lime (Primary Accent)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#5733F0]" />
                  <span className="font-mono text-zinc-200">#5733F0</span>
                </div>
                <span className="text-zinc-400">Vibrant Purple (Brand)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#D2EFF7]" />
                  <span className="font-mono text-zinc-200">#D2EFF7</span>
                </div>
                <span className="text-zinc-400">Ice Blue (Secondary Soft)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-lg bg-white/5 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-[#101010] border border-white/20" />
                  <span className="font-mono text-zinc-200">#101010</span>
                </div>
                <span className="text-zinc-400">Dark Surface (Background)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 rounded-2xl bg-white/[0.03] border border-white/10 p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#CDFE02]" />
              <span>Production Deployment & Governance</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CDFE02]" />
                  Vercel Serverless Ready
                </div>
                <p className="text-zinc-400">
                  Optimized Next.js 16 build with cached connection pooling to prevent cold-start bottlenecks.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CDFE02]" />
                  Automated Testing Harness
                </div>
                <p className="text-zinc-400">
                  Vitest test suites configured with CI verification before any deployment.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CDFE02]" />
                  Immutable Audit Trail
                </div>
                <p className="text-zinc-400">
                  Every submission, update, approval, and rejection is permanently recorded in MongoDB.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white/5 border border-white/5 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#CDFE02]" />
                  Multi-Tier RBAC
                </div>
                <p className="text-zinc-400">
                  Backend session validation across Super Admin, Plant Admin, Supervisors, and Operators.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-12 py-6 text-center text-xs text-zinc-500">
        <p>Bajaj Operations Enterprise Admin Panel 2.0 • Built with Next.js & MongoDB Atlas</p>
      </footer>
    </div>
  );
}

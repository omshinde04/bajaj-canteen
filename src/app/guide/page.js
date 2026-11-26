"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  FileCheck2,
  Terminal,
  Activity,
  ArrowRight,
  Copy,
  Check,
  ExternalLink,
  Lock,
  UserCheck,
  ClipboardList,
  Printer,
  Sparkles,
  Coffee,
  Building2,
  FileDown,
  MailCheck,
  BellRing,
  PieChart,
} from "lucide-react";

export default function ClientGuidePage() {
  const [copiedKey, setCopiedKey] = useState(null);

  const copyToClipboard = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const credentials = [
    {
      role: "Admin",
      badge: "FULL ACCESS",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      email: "admin@bajaj.com",
      password: "AdminPassword@2026",
      dest: "/admin/dashboard",
      desc: "Full administrative control for checksheets, tea count monitoring, reports dispatch, departments master, and notifications.",
      targetScenario: "Admin Flow (All 9 Modules as per Handwritten Notes)",
    },
    {
      role: "Operator",
      badge: "TOUCH TERMINAL",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      email: "operator@bajaj.com",
      password: "Operator@2026",
      dest: "/operator",
      desc: "Touch-optimized floor workstation for executing daily JH checksheets, live verification, and camera photo capture.",
      targetScenario: "Floor Checksheet Execution",
    },
  ];

  const adminPoints = [
    {
      id: "Point 1",
      title: "All Access (Admin, Operator)",
      marathi: "Add, update, delete (Admin, operator)",
      desc: "Provision and manage system users with strict dual-role access control (Admin & Operator only).",
      icon: UserCheck,
      link: "/admin/users",
    },
    {
      id: "Point 2",
      title: "Total Checksheet Master",
      marathi: "Add, update, delete",
      desc: "Configure canteen kitchen checksheets (Four Burner PNG, Deep Freezer, Bhatpan, Boilers, Veg Cutter, Combi Oven, Idly Maker).",
      icon: ClipboardList,
      link: "/admin/checksheets",
    },
    {
      id: "Point 3",
      title: "Check Status for Check Sheets",
      marathi: "Real-time Filled Up vs Pending tracking",
      desc: "Live visibility on which checksheets have been completed and signed versus which remain pending.",
      icon: CheckCircle2,
      link: "/admin/checksheets",
    },
    {
      id: "Point 4",
      title: "Daily & Monthly Reports & 1-Click Download",
      marathi: "Check daily reports & monthly reports & download every reports",
      desc: "Comprehensive operations dossiers exportable directly to Excel (.xlsx/.csv) or printable to official PDF.",
      icon: FileDown,
      link: "/admin/reports",
    },
    {
      id: "Point 5",
      title: "Check Sheet Chart (Fillup / Not Fillup)",
      marathi: "Check sheet Chart - fillup or not fillup",
      desc: "Interactive visual donut and progress indicators for daily shift compliance and monthly trends.",
      icon: PieChart,
      link: "/admin/dashboard",
    },
    {
      id: "Point 6",
      title: "Automated Report Dispatch Configuration",
      marathi: "Reports कोणाच्या mail vr आणि whatsapp ver पाठवायचे ते add, update, delete",
      desc: "Manage stakeholder contact list for scheduled automatic report delivery via Email and WhatsApp.",
      icon: MailCheck,
      link: "/admin/dispatch",
    },
    {
      id: "Point 7",
      title: "Factory Departments Master (Tea Count Focus)",
      marathi: "Department ex (Eng Assimbly, vech. Assimbly etc.) add, update, delete. हे फक्त tea count साठी",
      desc: "Manage factory departments specifically for tea distribution: Engine Assembly, Vehicle Assembly, Machine Shop, Paint Shop, Press Shop, QA.",
      icon: Building2,
      link: "/admin/departments",
    },
    {
      id: "Point 8",
      title: "2-Way Notifications (WhatsApp, Mail & Normal)",
      marathi: "Notification receive & send दोन्ही आले पाहिजे (Whatsapp, mail & normal)",
      desc: "Bidirectional broadcast and reception center across In-App alerts, WhatsApp mobile pings, and Email notices.",
      icon: BellRing,
      link: "/admin/notifications",
    },
    {
      id: "Point 9",
      title: "Department-wise Tea Count",
      marathi: "Shop tea count show झाला पाहिजे Dept. wise",
      desc: "Live tally of morning, noon, and evening tea batches per manufacturing department with instant updates.",
      icon: Coffee,
      link: "/admin/tea-count",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24 print:bg-white print:text-black">
      {/* TOP NOTIFICATION BAR */}
      <div className="bg-indigo-600 border-b border-indigo-700 px-4 py-2.5 text-xs text-white text-center flex items-center justify-between print:hidden">
        <div className="flex items-center gap-2 mx-auto">
          <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-semibold tracking-wide">
            BAJAJ AUTO CANTEEN OPERATIONS OS 2.0
          </span>
          <span className="text-indigo-200 hidden sm:inline">— Official Client Testing & Handover Manual</span>
        </div>
        <button
          onClick={() => window.print()}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-white font-medium text-xs transition cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          Print / Save PDF
        </button>
      </div>

      {/* STICKY HEADER */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-6 py-4 flex items-center justify-between print:static print:bg-white print:border-b-2 print:border-black shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white shadow-sm">
            B
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold tracking-tight text-slate-900 text-base">BAJAJ OPERATIONS OS</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                v2.0 Clean Theme
              </span>
            </div>
            <p className="text-[11px] text-slate-500">Executive Walkthrough & Client Testing Guide</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white font-semibold text-xs hover:bg-indigo-700 transition shadow-xs"
          >
            <span>Launch Platform</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* HERO BANNER */}
      <div className="relative border-b border-slate-200 bg-linear-to-b from-indigo-50/70 via-white to-slate-50 overflow-hidden px-6 py-12 md:py-16">
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-xs text-indigo-700 mb-4 font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Built Exactly to Client Specification</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 mb-4">
            Bajaj Canteen Operations <span className="text-indigo-600">2.0</span>
          </h1>
          <p className="text-sm md:text-base text-slate-600 max-w-3xl leading-relaxed mb-6">
            Welcome to the walkthrough for the Bajaj Auto Canteen Operations Platform.
            This system faithfully implements all <strong className="text-slate-900">9 Admin flow requirements</strong> specified in the client&apos;s handwritten notes with a clean, high-contrast light theme UI.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-200 max-w-4xl">
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Current Status</span>
              <span className="text-sm font-semibold text-emerald-700 flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                9 Modules Ready
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Unit & E2E Tests</span>
              <span className="text-sm font-semibold text-indigo-600 mt-0.5 block">
                35 / 35 Passing (100%)
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">User Access</span>
              <span className="text-sm font-semibold text-slate-900 mt-0.5 block">
                Admin & Operator Only
              </span>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 block">Color Theme</span>
              <span className="text-sm font-semibold text-indigo-600 mt-0.5 block">
                Clean White / Light UI
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">

        {/* SECTION 1: CREDENTIALS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
              01
            </div>
            <h2 className="text-xl font-bold text-slate-900">1-Click Test Credentials</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {credentials.map((cred, idx) => (
              <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-base">{cred.role}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${cred.badgeColor}`}>
                    {cred.badge}
                  </span>
                </div>
                <p className="text-xs text-slate-600">{cred.desc}</p>
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Email:</span>
                    <span className="text-slate-800 font-bold">{cred.email}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Password:</span>
                    <span className="text-slate-800 font-bold">{cred.password}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/login?email=${cred.email}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold text-center transition shadow-xs"
                  >
                    Login as {cred.role} →
                  </Link>
                  <button
                    onClick={() => copyToClipboard(`${cred.email} / ${cred.password}`, cred.role)}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition"
                    title="Copy Credentials"
                  >
                    {copiedKey === cred.role ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 2: 9 ADMIN FLOW REQUIREMENTS */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-xs">
              02
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">The 9 Admin Flow Modules</h2>
              <p className="text-xs text-slate-500">Strictly mapped to client&apos;s handwritten specification notes</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {adminPoints.map((pt, idx) => {
              const Icon = pt.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs hover:border-indigo-300 transition flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-indigo-600 uppercase">
                        {pt.id}
                      </span>
                      <Icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <h3 className="font-bold text-slate-900 text-sm">{pt.title}</h3>
                    <p className="text-[11px] font-medium text-indigo-800 bg-indigo-50/70 p-2 rounded-lg border border-indigo-100">
                      &quot;{pt.marathi}&quot;
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">{pt.desc}</p>
                  </div>

                  <Link
                    href={pt.link}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-800 pt-2 border-t border-slate-100"
                  >
                    <span>Open Module Screen</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: FOOTER ACTION */}
        <div className="rounded-2xl bg-indigo-600 text-white p-8 text-center space-y-4 shadow-sm">
          <h2 className="text-2xl font-bold">Ready to test the Bajaj Canteen Platform?</h2>
          <p className="text-indigo-100 text-xs max-w-xl mx-auto leading-relaxed">
            All screens are live, light-themed, populated with real JH equipment checksheets, and fully connected to our verified backend endpoints.
          </p>
          <div>
            <Link
              href="/admin/dashboard"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-indigo-700 font-bold text-xs hover:bg-slate-50 transition shadow-xs"
            >
              <span>Open Admin Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

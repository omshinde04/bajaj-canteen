"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Bell,
  LogOut,
  Clock,
  AlertTriangle,
  Building2,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function OperatorHeader() {
  const router = useRouter();
  const [user, setUser] = useState({
    name: "Ramesh Pawar",
    employeeId: "BAJAJ-OP-01",
    email: "operator@bajaj.com",
    role: { name: "Operator" },
  });
  const [currentTime, setCurrentTime] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {
      router.push("/login");
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 font-sans shadow-xs">
      {/* Left: Quick Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search check sheets, equipment, SOP..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          />
        </div>
      </div>

      {/* Center: Active Shift Execution Status Pill */}
      <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-indigo-900 font-bold">Shift A</span>
          <span className="text-indigo-300">•</span>
          <span className="text-indigo-700">06:00 – 14:00</span>
        </div>
        <div className="w-px h-3.5 bg-indigo-200" />
        <div className="flex items-center gap-1.5 text-indigo-600">
          <Clock className="w-3 h-3 text-indigo-500" />
          <span>{currentTime || "08:30:00"} IST</span>
        </div>
      </div>

      {/* Right Actions: Report Incident, Notifications, Operator Profile */}
      <div className="flex items-center gap-3">
        <Link
          href="/operator"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-xs font-semibold transition-all"
        >
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          <span>Report Defect</span>
        </Link>

        {/* Notifications Icon with Badge */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
          title="Shift Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-600 rounded-full ring-2 ring-white" />
        </button>

        {/* Operator Profile Badge */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
            {user.name ? user.name[0] : "O"}
          </div>

          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900 leading-tight flex items-center gap-1.5">
              <span>{user.name}</span>
              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                ON DUTY
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              {user.employeeId || "BAJAJ-OP-01"}
            </div>
          </div>

          {/* Quick Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors ml-1 cursor-pointer"
            title="End Shift / Logout"
          >
            <LogOut className={`w-3.5 h-3.5 ${loggingOut ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
}

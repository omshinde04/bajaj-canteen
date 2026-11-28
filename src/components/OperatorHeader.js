"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  Clock,
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  LogOut,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function OperatorHeader() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState("");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
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
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 font-sans shadow-2xs">
      {/* Left: Quick Search Bar */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search checklists, machines, logs..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          />
        </div>
      </div>

      {/* Center: Active Shift Execution Status Pill */}
      <div className="hidden lg:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-indigo-50/80 border border-indigo-100 text-xs text-indigo-700 font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-indigo-950 font-bold">Shift 1 &amp; General</span>
          <span className="text-indigo-300">•</span>
          <span className="text-indigo-700">06:00 – 14:00</span>
        </div>
        <div className="w-px h-3.5 bg-indigo-200" />
        <div className="flex items-center gap-1.5 text-indigo-600">
          <Clock className="w-3.5 h-3.5 text-indigo-500" />
          <span>{currentTime || "08:30:00"} IST</span>
        </div>
      </div>

      {/* Right Actions: Notifications, Status & 1-Click Logout */}
      <div className="flex items-center gap-3">
        {/* Plant Online Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Akurdi Plant • Floor Active</span>
        </div>

        {/* Notifications Dropdown with Live Badge */}
        <NotificationBell role="OPERATOR" />

        {/* Header 1-Click Logout Button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200 cursor-pointer"
          title="Sign Out / Logout"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}

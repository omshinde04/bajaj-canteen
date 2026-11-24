"use client";

import React, { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Clock,
  User,
  LogOut,
  ShieldCheck,
  Building2,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function OperatorLayout({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Fetch logged in session
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});

    // Clock update
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
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (err) {
      router.push("/login");
    }
  };

  const isAdminOrSupervisor =
    user?.role?.code === "SUPER_ADMIN" ||
    user?.role?.code === "PLANT_ADMIN" ||
    user?.role?.code === "SUPERVISOR";

  return (
    <div className="min-h-screen bg-[#09090C] text-zinc-100 flex flex-col font-sans selection:bg-[#CDFE02] selection:text-[#09090C]">
      {/* Top Mobile/Tablet Ergonomic Industrial Header */}
      <header className="sticky top-0 z-40 bg-[#101014]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Terminal Identifier */}
          <Link href="/operator" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-white text-base shadow-md shadow-[#5733F0]/30 border border-white/10 group-hover:scale-105 transition-all">
              B
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">
                  BAJAJ FLOOR OS
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#CDFE02] text-[#101010]">
                  TOUCH
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">Akurdi Complex • Kitchen Line Terminal</p>
            </div>
          </Link>

          {/* Center Shift & Live Clock (Hidden on small mobile) */}
          <div className="hidden md:flex items-center gap-3 px-3.5 py-1.5 rounded-full bg-[#141418] border border-white/10 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#CDFE02] animate-pulse" />
              <span className="font-bold text-[#CDFE02]">Shift A</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-300 font-mono">06:00 – 14:00</span>
            </div>
            <div className="w-px h-3.5 bg-white/10" />
            <div className="font-mono text-zinc-400 text-[11px]">{currentTime || "08:30:00"}</div>
          </div>

          {/* Right Action & Profile Area */}
          <div className="flex items-center gap-2.5">
            {isAdminOrSupervisor && (
              <Link
                href="/admin/dashboard"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#5733F0]/20 hover:bg-[#5733F0]/30 border border-[#5733F0]/40 text-xs font-semibold text-[#D2EFF7] transition-all"
                title="Switch to Full Admin Console"
              >
                <span>Admin Console</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            )}

            {/* Operator Badge */}
            <div className="flex items-center gap-2 pl-2 border-l border-white/10">
              <div className="w-8 h-8 rounded-full bg-[#5733F0]/30 border border-[#5733F0]/40 flex items-center justify-center text-xs font-bold text-white">
                {user?.name ? user.name[0] : "O"}
              </div>
              <div className="hidden sm:block text-left">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user?.name || "Ramesh Pawar"}
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  {user?.employeeId || "BAJAJ-OP-01"}
                </div>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
              title="End Shift / Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6">
        <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-500">Loading Floor Terminal...</div>}>
          {children}
        </Suspense>
      </main>

      {/* Touch Footer with Quick Shift Status */}
      <footer className="border-t border-white/5 py-3 px-6 bg-[#0B0B0E] text-[11px] text-zinc-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#CDFE02]" />
          <span>FSSAI Schedule IV & CCP Live Monitoring System • Akurdi Facility</span>
        </div>
        <div>Bajaj Auto Canteen Operations OS v2.0</div>
      </footer>
    </div>
  );
}

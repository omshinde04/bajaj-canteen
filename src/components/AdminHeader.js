"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Search,
  LogOut,
  User,
  Shield,
  Layers,
  RefreshCw,
  Building,
  Clock,
  Sparkles,
} from "lucide-react";

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Super Administrator", role: { name: "Super Admin" }, email: "admin@bajaj.com" });
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
    <header className="h-16 border-b border-white/10 bg-[#141414]/90 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
      {/* Search / Context bar */}
      <div className="flex items-center gap-4">
        <div className="relative w-64 md:w-80 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search check sheets, operators, records..."
            className="w-full bg-[#1b1b1b] border border-white/10 rounded-xl py-1.5 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </div>

        {/* Live Shift Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-zinc-300">
          <Clock className="w-3.5 h-3.5 text-[#CDFE02]" />
          <span className="font-semibold text-white">Shift A</span>
          <span className="text-[10px] text-zinc-400">(06:00 – 14:00)</span>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <button
          type="button"
          className="relative p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-[#CDFE02] absolute top-1.5 right-1.5" />
        </button>

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          <div className="w-8 h-8 rounded-xl bg-[#5733F0] flex items-center justify-center font-bold text-xs text-white shadow-sm shadow-[#5733F0]/30">
            {user.name?.[0] || "A"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-white">{user.name}</div>
            <div className="text-[10px] text-[#CDFE02] font-medium">{user.role?.name || "Super Admin"}</div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

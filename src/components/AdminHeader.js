"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  LogOut,
  Clock,
  X,
} from "lucide-react";
import NotificationBell from "@/components/NotificationBell";

export default function AdminHeader() {
  const router = useRouter();
  const [user, setUser] = useState({ name: "Admin", role: { name: "Admin" }, email: "admin@bajaj.com" });
  const [loggingOut, setLoggingOut] = useState(false);
  const [headerSearch, setHeaderSearch] = useState("");

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

  const handleHeaderSearch = (e) => {
    e.preventDefault();
    if (headerSearch.trim()) {
      router.push(`/admin/checksheets?search=${encodeURIComponent(headerSearch.trim())}`);
    }
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs">
      {/* Search / Context bar */}
      <div className="flex items-center gap-4">
        <form onSubmit={handleHeaderSearch} className="relative w-64 md:w-80 hidden sm:block">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={headerSearch}
            onChange={(e) => setHeaderSearch(e.target.value)}
            placeholder="Search checksheets, departments, tea counts..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-1.5 pl-9 pr-8 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
          />
          {headerSearch && (
            <button
              type="button"
              onClick={() => setHeaderSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </form>

        {/* Live Shift Pill */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
          <Clock className="w-3.5 h-3.5 text-indigo-600" />
          <span className="font-semibold text-indigo-900">Shift A Active</span>
          <span className="text-[10px] text-indigo-500 font-mono">(06:00 – 14:00)</span>
        </div>
      </div>

      {/* Right User Bar */}
      <div className="flex items-center gap-3">
        {/* In-App Live Notifications Bell */}
        <NotificationBell role="ADMIN" />

        {/* User Badge */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-xs text-white shadow-xs">
            {user.name?.[0] || "A"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-xs font-semibold text-slate-900">{user.name}</div>
            <div className="text-[10px] text-indigo-600 font-medium">{user.role?.name || "Admin"}</div>
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

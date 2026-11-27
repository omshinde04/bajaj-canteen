"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  Clock,
  ExternalLink,
  AlertCircle,
  Utensils,
  Coffee,
  FileSpreadsheet,
  Layers,
  MessageSquare,
  CheckCircle2,
  X,
  Sparkles,
} from "lucide-react";

// Format relative time helper
function timeAgo(dateString) {
  if (!dateString) return "";
  const now = new Date();
  const past = new Date(dateString);
  const diffInSec = Math.floor((now - past) / 1000);

  if (diffInSec < 60) return "Just now";
  const diffInMin = Math.floor(diffInSec / 60);
  if (diffInMin < 60) return `${diffInMin}m ago`;
  const diffInHours = Math.floor(diffInMin / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
}

// Select icon based on notification title or message
function getNotificationIcon(title = "", message = "") {
  const text = `${title} ${message}`.toLowerCase();
  if (text.includes("tea") || text.includes("kettle") || text.includes("liters")) {
    return <Coffee className="w-4 h-4 text-amber-600" />;
  }
  if (text.includes("counter") || text.includes("plate") || text.includes("meal") || text.includes("lunch")) {
    return <Utensils className="w-4 h-4 text-emerald-600" />;
  }
  if (text.includes("checksheet") || text.includes("audit") || text.includes("cs-jh")) {
    return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
  }
  if (text.includes("defect") || text.includes("failure") || text.includes("breach") || text.includes("critical")) {
    return <AlertCircle className="w-4 h-4 text-rose-600" />;
  }
  if (text.includes("biscuit") || text.includes("stock") || text.includes("inventory")) {
    return <Layers className="w-4 h-4 text-violet-600" />;
  }
  return <Bell className="w-4 h-4 text-indigo-600" />;
}

export default function NotificationBell({ role = "ADMIN" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  // Fetch live notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications?channel=ALL");
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Auto-poll notifications every 20 seconds
    const interval = setInterval(fetchNotifications, 20000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Mark all read
  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  // Mark single as read & navigate
  const handleItemClick = async (notif) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: notif._id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n._id === notif._id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    if (notif.link) {
      setIsOpen(false);
      router.push(notif.link);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
        aria-label="View notifications"
        aria-expanded={isOpen}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white shadow-xs animate-in zoom-in-50">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Flyout Dropdown Modal */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden font-sans animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-xs text-slate-900 tracking-tight">
                Live Notifications
              </span>
              {unreadCount > 0 ? (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-[10px] font-bold text-rose-600">
                  {unreadCount} new
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[10px] font-medium text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" /> All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3 h-3" /> Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 transition cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notifications Feed */}
          <div className="max-h-88 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-10 text-center px-4">
                <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-2">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-xs font-medium text-slate-700">No notifications yet</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Checksheets, tea logs, and floor submissions will show here.
                </p>
              </div>
            ) : (
              notifications.slice(0, 15).map((notif) => {
                const isUnread = !notif.isRead;
                return (
                  <div
                    key={notif._id}
                    onClick={() => handleItemClick(notif)}
                    className={`p-3.5 flex gap-3 items-start transition-colors cursor-pointer text-left ${
                      isUnread
                        ? "bg-indigo-50/40 hover:bg-indigo-50/80"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    {/* Icon container */}
                    <div
                      className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center border ${
                        isUnread
                          ? "bg-white border-indigo-200 shadow-2xs"
                          : "bg-slate-100 border-slate-200"
                      }`}
                    >
                      {getNotificationIcon(notif.title, notif.message)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span
                          className={`text-xs truncate ${
                            isUnread
                              ? "font-bold text-slate-900"
                              : "font-medium text-slate-700"
                          }`}
                        >
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1 font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {timeAgo(notif.createdAt)}
                        </span>
                      </div>

                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>

                      <div className="mt-1.5 flex items-center gap-2">
                        {notif.direction === "INCOMING" ? (
                          <span className="px-1.5 py-0.2 rounded bg-amber-50 text-[9px] font-semibold text-amber-700 border border-amber-200">
                            Floor Alert
                          </span>
                        ) : (
                          <span className="px-1.5 py-0.2 rounded bg-indigo-50 text-[9px] font-semibold text-indigo-700 border border-indigo-200">
                            Broadcast
                          </span>
                        )}

                        {notif.priority === "HIGH" && (
                          <span className="px-1.5 py-0.2 rounded bg-rose-50 text-[9px] font-bold text-rose-700 border border-rose-200">
                            High Priority
                          </span>
                        )}

                        <span className="text-[10px] text-slate-400">
                          by {notif.sender || "System"}
                        </span>
                      </div>
                    </div>

                    {/* Unread dot */}
                    {isUnread && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0 mt-1.5" />
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 text-center">
            {role === "ADMIN" ? (
              <Link
                href="/admin/notifications"
                onClick={() => setIsOpen(false)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition inline-flex items-center gap-1.5"
              >
                Open Notification Center <ExternalLink className="w-3 h-3" />
              </Link>
            ) : (
              <span className="text-[11px] text-slate-500 font-medium flex items-center justify-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Akurdi Operations Channel Active
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

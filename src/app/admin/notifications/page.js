"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
import Pagination from "@/components/Pagination";
import {
  BellRing,
  Send,
  MessageSquare,
  Mail,
  Smartphone,
  CheckCircle2,
  Clock,
  Trash2,
  Check,
  CheckCheck,
  RefreshCw,
  Plus,
  Filter,
  Search,
  ExternalLink,
  Layers,
  Utensils,
  Coffee,
  FileSpreadsheet,
  AlertCircle,
  Inbox,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldAlert,
  Sparkles,
} from "lucide-react";

// Relative time formatting helper
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

// Icon helper based on content
function getTopicIcon(title = "", message = "", channel = "NORMAL") {
  if (channel === "WHATSAPP") {
    return <Smartphone className="w-4 h-4 text-emerald-600" />;
  }
  if (channel === "EMAIL") {
    return <Mail className="w-4 h-4 text-sky-600" />;
  }

  const text = `${title} ${message}`.toLowerCase();
  if (text.includes("tea") || text.includes("kettle") || text.includes("liters")) {
    return <Coffee className="w-4 h-4 text-amber-600" />;
  }
  if (text.includes("counter") || text.includes("plate") || text.includes("meal") || text.includes("lunch")) {
    return <Utensils className="w-4 h-4 text-emerald-600" />;
  }
  if (text.includes("checksheet") || text.includes("cs-jh") || text.includes("compliance")) {
    return <FileSpreadsheet className="w-4 h-4 text-indigo-600" />;
  }
  if (text.includes("defect") || text.includes("breach") || text.includes("critical")) {
    return <AlertCircle className="w-4 h-4 text-rose-600" />;
  }
  if (text.includes("biscuit") || text.includes("inventory") || text.includes("stock")) {
    return <Layers className="w-4 h-4 text-violet-600" />;
  }
  return <BellRing className="w-4 h-4 text-indigo-600" />;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [filterDirection, setFilterDirection] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
  const [stats, setStats] = useState({ total: 0, unread: 0, incoming: 0, outgoing: 0 });

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    channel: "NORMAL",
    recipient: "All Staff",
    priority: "NORMAL",
  });

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        channel: filterChannel,
        direction: filterDirection,
        page: String(currentPage),
        limit: String(pageSize),
      });
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
        setPagination(
          data.pagination || {
            total: data.notifications?.length || 0,
            totalPages: 1,
            page: currentPage,
            limit: pageSize,
          }
        );
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterChannel, filterDirection, currentPage, pageSize]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchNotifications();
  };

  const handleSendNotification = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        setModalOpen(false);
        setFormData({
          title: "",
          message: "",
          channel: "NORMAL",
          recipient: "All Staff",
          priority: "NORMAL",
        });
        setCurrentPage(1);
        fetchNotifications();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      if (res.ok) fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  const handleMarkSingleRead = async (id) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
        );
        setStats((prev) => ({ ...prev, unread: Math.max(0, prev.unread - 1) }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Operational Communications Hub
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-indigo-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time 2-way shop floor alerts, operator submission feeds, and automated multi-channel broadcasts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="default"
            size="default"
            onClick={() => setModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4 text-white mr-1.5" />
            <span>+ Send Notification</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleMarkAllRead}
            className="border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4 mr-1.5 text-indigo-600" />
            Mark All Read
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchNotifications}
            disabled={loading}
            title="Refresh"
            className="h-9 w-9 border-slate-200 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* QUICK STATS CARDS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
            <BellRing className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Total Notifications</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{stats.total}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Unread Pending</div>
            <div className="text-xl font-bold text-rose-600 font-mono mt-0.5">{stats.unread}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-700 shrink-0">
            <ArrowDownLeft className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Floor Alerts (Inbound)</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{stats.incoming}</div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
            <ArrowUpRight className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-slate-500">Admin Broadcasts (Outbound)</div>
            <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">{stats.outgoing}</div>
          </div>
        </div>
      </div>

      {/* SEARCH & FILTERS BAR */}
      <Card className="p-4 bg-white border-slate-200 shadow-xs space-y-4">
        {/* Search Row */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search notifications by title, operator, machine, or content..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 transition"
            />
          </div>
          <Button type="submit" variant="default" size="sm" className="bg-slate-900 hover:bg-slate-800 text-white cursor-pointer">
            Search
          </Button>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCurrentPage(1);
                setTimeout(fetchNotifications, 50);
              }}
              className="border-slate-200 text-slate-600"
            >
              Clear
            </Button>
          )}
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100">
          {/* Channel Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Channel:</span>
            {[
              { id: "ALL", label: "All Channels" },
              { id: "NORMAL", label: "In-App / Normal" },
              { id: "WHATSAPP", label: "WhatsApp" },
              { id: "EMAIL", label: "Email" },
            ].map((ch) => (
              <button
                key={ch.id}
                onClick={() => {
                  setFilterChannel(ch.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filterChannel === ch.id
                    ? "bg-indigo-600 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>

          {/* Direction Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-500 font-semibold mr-1">Direction:</span>
            {[
              { id: "ALL", label: "All" },
              { id: "INCOMING", label: "Floor Alerts 📥" },
              { id: "OUTGOING", label: "Dispatches 📤" },
            ].map((dir) => (
              <button
                key={dir.id}
                onClick={() => {
                  setFilterDirection(dir.id);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filterDirection === dir.id
                    ? "bg-slate-900 text-white font-semibold shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {dir.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* NOTIFICATION FEED */}
      <div className="space-y-3">
        {loading ? (
          <LoaderBlock text="Loading notifications feed..." />
        ) : notifications.length === 0 ? (
          <Card className="p-16 text-center bg-white border-slate-200">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-slate-400" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800">No Notifications Found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery
                ? `No notifications matched "${searchQuery}". Try clearing search filters.`
                : "No operational alerts recorded for the selected filter."}
            </p>
          </Card>
        ) : (
          notifications.map((n) => {
            const isUnread = !n.isRead;
            const isIncoming = n.direction === "INCOMING";

            return (
              <div
                key={n._id}
                className={`p-4 rounded-xl border transition-all duration-150 flex flex-col sm:flex-row items-start justify-between gap-4 ${
                  isUnread
                    ? "bg-white border-indigo-300 shadow-sm ring-1 ring-indigo-50"
                    : "bg-white border-slate-200 shadow-2xs hover:border-slate-300"
                }`}
              >
                <div className="flex items-start gap-3.5 w-full min-w-0">
                  {/* Category Topic Icon */}
                  <div
                    className={`w-9 h-9 rounded-xl shrink-0 flex items-center justify-center border ${
                      isUnread
                        ? "bg-indigo-50/70 border-indigo-200 shadow-2xs"
                        : "bg-slate-100 border-slate-200"
                    }`}
                  >
                    {getTopicIcon(n.title, n.message, n.channel)}
                  </div>

                  {/* Body Content */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4
                        className={`text-xs ${
                          isUnread ? "font-bold text-slate-900" : "font-semibold text-slate-800"
                        }`}
                      >
                        {n.title}
                      </h4>

                      {isIncoming ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                          <ArrowDownLeft className="w-2.5 h-2.5 text-amber-600" /> Received Alert
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <ArrowUpRight className="w-2.5 h-2.5 text-emerald-600" /> Dispatched
                        </span>
                      )}

                      <span className="text-[10px] text-slate-400 font-mono">
                        via {n.channel} • {new Date(n.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} ({timeAgo(n.createdAt)})
                      </span>

                      {n.priority === "HIGH" && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-50 text-[9px] font-bold text-rose-700 border border-rose-200">
                          HIGH PRIORITY
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">
                      {n.message}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 flex-wrap">
                      <span>
                        Sender: <strong className="text-slate-800 font-semibold">{n.sender || "System"}</strong>
                      </span>
                      <span>•</span>
                      <span>
                        Recipient: <strong className="text-slate-800 font-semibold">{n.recipient || "All Staff"}</strong>
                      </span>

                      {n.link && (
                        <>
                          <span>•</span>
                          <Link
                            href={n.link}
                            className="text-indigo-600 hover:text-indigo-800 font-semibold inline-flex items-center gap-1"
                          >
                            Open Module <ExternalLink className="w-2.5 h-2.5" />
                          </Link>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Actions */}
                <div className="flex items-center gap-1 self-end sm:self-center shrink-0">
                  {isUnread && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleMarkSingleRead(n._id)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 h-8 px-2.5 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5 mr-1" /> Mark Read
                    </Button>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(n._id)}
                    title="Delete Notification"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION CONTROLS */}
      {pagination.total > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <Pagination
            currentPage={currentPage}
            totalPages={pagination.totalPages || 1}
            totalItems={pagination.total}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(sz) => {
              setPageSize(sz);
              setCurrentPage(1);
            }}
          />
        </div>
      )}

      {/* Shadcn Dialog: Send Notification */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)} className="max-w-md bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-900 font-bold">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Send Broadcast Notification</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSendNotification} className="space-y-4 text-xs pt-1">
            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Dispatch Channel
              </label>
              <select
                value={formData.channel}
                onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="NORMAL">In-App Notification (Normal Feed)</option>
                <option value="WHATSAPP">WhatsApp Alert</option>
                <option value="EMAIL">Email Dossier Dispatch</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Target Recipient
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. All Staff, or +91 98000 00001, or plantlead@bajaj.com"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Broadcast Title
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Shift 1 Food Service Audit Completed"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Message Content
              </label>
              <textarea
                required
                rows={3}
                placeholder="Enter alert message details to broadcast..."
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-700 font-semibold uppercase tracking-wider text-[10px]">
                Priority Level
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
              >
                <option value="NORMAL">Normal Priority</option>
                <option value="HIGH">High Priority (Urgent Floor Action)</option>
                <option value="LOW">Low (Info Only)</option>
              </select>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setModalOpen(false)}
                className="border-slate-200 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={submitting}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Spinner className="mr-1.5" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-1.5" />
                    Dispatch Now
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

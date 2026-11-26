"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Plus,
  Filter,
} from "lucide-react";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterChannel, setFilterChannel] = useState("ALL");
  const [filterDirection, setFilterDirection] = useState("ALL");
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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
      const res = await fetch(`/api/notifications?channel=${filterChannel}&direction=${filterDirection}`);
      const data = await res.json();
      if (data.success) {
        setNotifications(data.notifications || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [filterChannel, filterDirection]);

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
        setFormData({ title: "", message: "", channel: "NORMAL", recipient: "All Staff", priority: "NORMAL" });
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
              2-Way Notifications (Point 8)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-indigo-600" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Notification receive & send दोन्ही आले पाहिजे (WhatsApp, Mail & Normal).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <Send className="w-4 h-4 text-white" />
            <span>+ Send Notification</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium border border-slate-200 shadow-xs"
          >
            Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition border border-slate-200 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
        {/* Channel Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Channel:</span>
          {["ALL", "NORMAL", "WHATSAPP", "EMAIL"].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterChannel === ch
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {ch === "NORMAL" ? "In-App / Normal" : ch}
            </button>
          ))}
        </div>

        {/* Direction Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Direction:</span>
          {["ALL", "INCOMING", "OUTGOING"].map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterDirection === dir
                  ? "bg-slate-800 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {dir === "INCOMING" ? "Received (Alerts)" : dir === "OUTGOING" ? "Sent (Dispatched)" : "All"}
            </button>
          ))}
        </div>
      </div>

      {/* NOTIFICATION FEED */}
      <div className="space-y-3">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl">
            No notifications found for this filter.
          </div>
        ) : (
          notifications.map((n) => {
            const isWhatsApp = n.channel === "WHATSAPP";
            const isEmail = n.channel === "EMAIL";
            const isIncoming = n.direction === "INCOMING";

            return (
              <div
                key={n._id}
                className={`p-4 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  !n.isRead
                    ? "bg-white border-indigo-200 shadow-sm"
                    : "bg-slate-50/70 border-slate-200 shadow-xs"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isWhatsApp
                        ? "bg-emerald-50 text-emerald-600"
                        : isEmail
                        ? "bg-blue-50 text-blue-600"
                        : "bg-indigo-50 text-indigo-600"
                    }`}
                  >
                    {isWhatsApp ? (
                      <Smartphone className="w-4 h-4" />
                    ) : isEmail ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <BellRing className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-slate-900 text-xs">{n.title}</h4>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold ${
                          isIncoming
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {isIncoming ? "RECEIVED ALERT" : "SENT DISPATCH"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        via {n.channel} • {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{n.message}</p>

                    <div className="flex items-center gap-3 text-[10px] text-slate-500 pt-1">
                      <span>Recipient: <strong className="text-slate-800">{n.recipient}</strong></span>
                      <span>•</span>
                      <span>Sender: <strong className="text-slate-800">{n.sender}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-slate-400 hover:text-rose-600 transition p-1"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* SEND NOTIFICATION MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Send className="w-4 h-4 text-indigo-600" />
                <span>Send Notification (Broadcast)</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Channel (WhatsApp / Mail / In-App)
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                >
                  <option value="NORMAL">Normal (In-App Notification)</option>
                  <option value="WHATSAPP">WhatsApp Notification</option>
                  <option value="EMAIL">Email Alert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Target Recipient
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All Staff, or +91 98000 00001, or plantlead@bajaj.com"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Subject / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Tea count updated for Engine Assembly"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Message Content
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter message to send..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
                >
                  {submitting ? "Sending..." : "Send Notification"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

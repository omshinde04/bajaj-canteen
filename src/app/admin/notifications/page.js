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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              2-Way Notifications (Point 8)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <BellRing className="w-7 h-7 text-[#CDFE02]" />
            <span>Notification Center</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Notification receive & send दोन्ही आले पाहिजे (WhatsApp, Mail & Normal).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition shadow-lg shadow-[#5733F0]/25"
          >
            <Send className="w-4 h-4 text-[#CDFE02]" />
            <span>+ Send Notification</span>
          </button>
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium border border-white/10"
          >
            Mark All Read
          </button>
          <button
            onClick={fetchNotifications}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-[#141418] border border-white/10 rounded-2xl p-4">
        {/* Channel Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-semibold mr-1">Channel:</span>
          {["ALL", "NORMAL", "WHATSAPP", "EMAIL"].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterChannel === ch
                  ? "bg-[#5733F0] text-white font-semibold shadow"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
              }`}
            >
              {ch === "NORMAL" ? "In-App / Normal" : ch}
            </button>
          ))}
        </div>

        {/* Direction Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-zinc-500 font-semibold mr-1">Direction:</span>
          {["ALL", "INCOMING", "OUTGOING"].map((dir) => (
            <button
              key={dir}
              onClick={() => setFilterDirection(dir)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                filterDirection === dir
                  ? "bg-white/15 text-white font-semibold"
                  : "text-zinc-400 hover:text-white hover:bg-white/5"
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
          <div className="p-12 text-center text-zinc-500 text-xs">Loading notifications...</div>
        ) : notifications.length === 0 ? (
          <div className="p-12 text-center text-zinc-500 text-xs">No notifications found for this filter.</div>
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
                    ? "bg-[#141418] border-[#5733F0]/40 shadow-lg shadow-[#5733F0]/5"
                    : "bg-[#101014] border-white/5"
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`p-2.5 rounded-xl shrink-0 ${
                      isWhatsApp
                        ? "bg-emerald-500/10 text-emerald-400"
                        : isEmail
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-[#5733F0]/20 text-[#CDFE02]"
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
                      <h4 className="font-bold text-white text-xs">{n.title}</h4>
                      <span
                        className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold ${
                          isIncoming
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}
                      >
                        {isIncoming ? "RECEIVED ALERT" : "SENT DISPATCH"}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        via {n.channel} • {new Date(n.createdAt).toLocaleTimeString()}
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-3xl">{n.message}</p>

                    <div className="flex items-center gap-3 text-[10px] text-zinc-400 pt-1">
                      <span>Recipient: <strong className="text-zinc-300">{n.recipient}</strong></span>
                      <span>•</span>
                      <span>Sender: <strong className="text-zinc-300">{n.sender}</strong></span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleDelete(n._id)}
                  className="text-zinc-500 hover:text-red-400 transition p-1"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Send className="w-4 h-4 text-[#CDFE02]" />
                <span>Send Notification (Broadcast)</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Channel (WhatsApp / Mail / In-App)
                </label>
                <select
                  value={formData.channel}
                  onChange={(e) => setFormData({ ...formData, channel: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                >
                  <option value="NORMAL">Normal (In-App Notification)</option>
                  <option value="WHATSAPP">WhatsApp Notification</option>
                  <option value="EMAIL">Email Alert</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Target Recipient
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. All Staff, or +91 98000 00001, or plantlead@bajaj.com"
                  value={formData.recipient}
                  onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Subject / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Morning Tea count updated for Engine Assembly"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Message Content
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Enter message to send..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition"
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

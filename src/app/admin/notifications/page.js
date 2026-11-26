"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
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
          <Button
            variant="default"
            size="default"
            onClick={() => setModalOpen(true)}
          >
            <Send className="w-4 h-4 text-white" />
            <span>+ Send Notification</span>
          </Button>

          <Button
            variant="outline"
            size="default"
            onClick={handleMarkAllRead}
          >
            Mark All Read
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchNotifications}
            disabled={loading}
            title="Refresh"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
        </div>
      </div>

      {/* FILTERS */}
      <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
        {/* Channel Filter */}
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-slate-500 font-semibold mr-1">Channel:</span>
          {["ALL", "NORMAL", "WHATSAPP", "EMAIL"].map((ch) => (
            <button
              key={ch}
              onClick={() => setFilterChannel(ch)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
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
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                filterDirection === dir
                  ? "bg-slate-800 text-white font-semibold shadow-xs"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {dir === "INCOMING" ? "Received (Alerts)" : dir === "OUTGOING" ? "Sent (Dispatched)" : "All"}
            </button>
          ))}
        </div>
      </Card>

      {/* NOTIFICATION FEED */}
      <div className="space-y-3">
        {loading ? (
          <LoaderBlock text="Loading notifications..." />
        ) : notifications.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 text-xs">
            No notifications found for this filter.
          </Card>
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
                      {isIncoming ? (
                        <Badge variant="warning">
                          RECEIVED ALERT
                        </Badge>
                      ) : (
                        <Badge variant="success">
                          SENT DISPATCH
                        </Badge>
                      )}
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

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(n._id)}
                  title="Delete"
                  className="h-8 w-8 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            );
          })
        )}
      </div>

      {/* Shadcn Dialog: Send Notification */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Send className="w-4 h-4 text-indigo-600" />
              <span>Send Notification (Broadcast)</span>
            </DialogTitle>
          </DialogHeader>

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
              <Input
                type="text"
                required
                placeholder="e.g. All Staff, or +91 98000 00001, or plantlead@bajaj.com"
                value={formData.recipient}
                onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Subject / Title
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Morning Tea count updated for Engine Assembly"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
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

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                loading={submitting}
              >
                {submitting ? "Sending..." : "Send Notification"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

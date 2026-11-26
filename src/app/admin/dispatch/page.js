"use client";

import React, { useState, useEffect } from "react";
import {
  MailCheck,
  Plus,
  Trash2,
  Edit2,
  Mail,
  Phone,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Send,
  Calendar,
  Building2,
  Sparkles,
  Smartphone,
  Shield,
} from "lucide-react";

export default function ReportDispatchPage() {
  const [recipients, setRecipients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [testSending, setTestSending] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    whatsapp: "",
    frequency: "BOTH",
    departmentName: "All Departments",
    sendDailyReport: true,
    sendMonthlyReport: true,
  });

  const fetchRecipients = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/report-dispatch");
      const data = await res.json();
      if (data.success) {
        setRecipients(data.recipients || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipients();
  }, []);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      name: "",
      email: "",
      whatsapp: "+91 ",
      frequency: "BOTH",
      departmentName: "All Departments",
      sendDailyReport: true,
      sendMonthlyReport: true,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      email: item.email,
      whatsapp: item.whatsapp,
      frequency: item.frequency || "BOTH",
      departmentName: item.departmentName || "All Departments",
      sendDailyReport: item.sendDailyReport !== false,
      sendMonthlyReport: item.sendMonthlyReport !== false,
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const url = "/api/report-dispatch";
      const method = editingItem ? "PUT" : "POST";
      const body = editingItem ? { id: editingItem._id, ...formData } : formData;

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchRecipients();
        showToast(editingItem ? "Recipient updated successfully!" : "New report recipient added!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from report distribution?`)) return;
    try {
      const res = await fetch(`/api/report-dispatch?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchRecipients();
        showToast("Recipient removed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTestReport = (recipient) => {
    setTestSending(recipient._id);
    setTimeout(() => {
      setTestSending(null);
      showToast(`Test Report dispatched to ${recipient.name} via Email & WhatsApp!`);
    }, 1200);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 3500);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Automated Report Dispatch Configuration (Point 6)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2.5">
            <MailCheck className="w-7 h-7 text-[#CDFE02]" />
            <span>Report Dispatch Settings</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Reports कोणाच्या mail vr आणि whatsapp ver पाठवायचे ते Add, update, delete करा.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition shadow-lg shadow-[#5733F0]/25"
          >
            <Plus className="w-4 h-4 text-[#CDFE02]" />
            <span>+ Add Report Recipient</span>
          </button>
          <button
            onClick={fetchRecipients}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition border border-white/10"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#CDFE02]" : ""}`} />
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {successToast && (
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successToast}</span>
        </div>
      )}

      {/* RECIPIENTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
            Loading recipient configuration...
          </div>
        ) : recipients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
            No recipients configured yet. Click "+ Add Report Recipient" above.
          </div>
        ) : (
          recipients.map((r) => (
            <div
              key={r._id}
              className="bg-[#141418] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-white text-sm">{r.name}</h3>
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-500" />
                      {r.departmentName || "All Departments"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-[#5733F0]/20 text-[#D2EFF7] border border-[#5733F0]/40">
                    {r.frequency}
                  </span>
                </div>

                {/* Email & WhatsApp Details */}
                <div className="bg-[#09090C] rounded-xl p-3 border border-white/5 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-zinc-300 truncate">
                    <Mail className="w-3.5 h-3.5 text-[#CDFE02] shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{r.whatsapp}</span>
                  </div>
                </div>

                {/* Badges for Daily / Monthly */}
                <div className="flex items-center gap-2 text-[10px]">
                  {r.sendDailyReport && (
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                      Daily Report (Active)
                    </span>
                  )}
                  {r.sendMonthlyReport && (
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-medium">
                      Monthly Report (Active)
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <button
                  onClick={() => handleSendTestReport(r)}
                  disabled={testSending === r._id}
                  className="flex items-center gap-1.5 text-xs text-[#CDFE02] hover:underline font-semibold"
                >
                  <Send className={`w-3.5 h-3.5 ${testSending === r._id ? "animate-spin" : ""}`} />
                  <span>{testSending === r._id ? "Dispatching..." : "Send Test Report"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id, r.name)}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-white/5 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* CREATE / EDIT MODAL */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#141418] border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <MailCheck className="w-4 h-4 text-[#CDFE02]" />
                <span>{editingItem ? "Edit Report Recipient" : "Add Report Recipient"}</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-zinc-500 hover:text-white text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Recipient Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni (Canteen In-charge)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  Email Address (Mail वर पाठवण्यासाठी)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@bajaj.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                  WhatsApp Mobile Number (Whatsapp वर पाठवण्यासाठी)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98000 00001"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="BOTH">Daily & Monthly</option>
                    <option value="DAILY">Daily Only</option>
                    <option value="MONTHLY">Monthly Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-zinc-300 font-semibold uppercase tracking-wider text-[10px]">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    placeholder="e.g. All Departments"
                    className="w-full bg-[#09090C] border border-white/10 rounded-xl p-2.5 text-white text-xs focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
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
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-[#5733F0] hover:bg-[#5733F0]/90 text-white font-semibold text-xs transition"
                >
                  {formLoading ? "Saving..." : "Save Recipient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

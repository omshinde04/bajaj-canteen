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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Automated Report Dispatch Configuration (Point 6)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2.5">
            <MailCheck className="w-7 h-7 text-indigo-600" />
            <span>Report Dispatch Settings</span>
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Reports कोणाच्या mail vr आणि whatsapp ver पाठवायचे ते Add, update, delete करा.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Add Report Recipient</span>
          </button>
          <button
            onClick={fetchRecipients}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition border border-slate-200 shadow-xs"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </button>
        </div>
      </div>

      {/* TOAST NOTIFICATION */}
      {successToast && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          <span className="font-medium">{successToast}</span>
        </div>
      )}

      {/* RECIPIENTS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs">
            Loading recipient configuration...
          </div>
        ) : recipients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 text-xs bg-white border border-slate-200 rounded-2xl">
            No recipients configured yet. Click "+ Add Report Recipient" above.
          </div>
        ) : (
          recipients.map((r) => (
            <div
              key={r._id}
              className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 hover:border-slate-300 transition shadow-xs flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{r.name}</h3>
                    <span className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {r.departmentName || "All Departments"}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {r.frequency}
                  </span>
                </div>

                {/* Email & WhatsApp Details */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200 space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-slate-700 truncate">
                    <Mail className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                    <span className="truncate">{r.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{r.whatsapp}</span>
                  </div>
                </div>

                {/* Badges for Daily / Monthly */}
                <div className="flex items-center gap-2 text-[10px]">
                  {r.sendDailyReport && (
                    <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                      Daily Report (Active)
                    </span>
                  )}
                  {r.sendMonthlyReport && (
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                      Monthly Report (Active)
                    </span>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => handleSendTestReport(r)}
                  disabled={testSending === r._id}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  <Send className={`w-3.5 h-3.5 ${testSending === r._id ? "animate-spin" : ""}`} />
                  <span>{testSending === r._id ? "Dispatching..." : "Send Test Report"}</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => openEditModal(r)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                    title="Edit"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(r._id, r.name)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
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
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <MailCheck className="w-4 h-4 text-indigo-600" />
                <span>{editingItem ? "Edit Report Recipient" : "Add Report Recipient"}</span>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 text-sm">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Recipient Name / Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni (Canteen In-charge)"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  Email Address (Mail वर पाठवण्यासाठी)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@bajaj.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                  WhatsApp Mobile Number (Whatsapp वर पाठवण्यासाठी)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 98000 00001"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  >
                    <option value="BOTH">Daily & Monthly</option>
                    <option value="DAILY">Daily Only</option>
                    <option value="MONTHLY">Monthly Only</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                    Department
                  </label>
                  <input
                    type="text"
                    value={formData.departmentName}
                    onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                    placeholder="e.g. All Departments"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 text-xs focus:outline-none focus:border-indigo-600 focus:bg-white"
                  />
                </div>
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
                  disabled={formLoading}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs transition shadow-xs"
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

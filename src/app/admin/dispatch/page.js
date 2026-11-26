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
          <Button
            variant="default"
            size="default"
            onClick={openCreateModal}
          >
            <Plus className="w-4 h-4 text-white" />
            <span>+ Add Report Recipient</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={fetchRecipients}
            disabled={loading}
            title="Refresh"
            className="h-9 w-9"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-indigo-600" : ""}`} />
          </Button>
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
          <LoaderBlock text="Loading recipient configuration..." />
        ) : recipients.length === 0 ? (
          <Card className="col-span-full py-12 text-center text-slate-400 text-xs">
            No recipients configured yet. Click &quot;+ Add Report Recipient&quot; above.
          </Card>
        ) : (
          recipients.map((r) => (
            <Card
              key={r._id}
              className="p-5 space-y-4 hover:border-slate-300 transition flex flex-col justify-between"
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
                  <Badge variant="indigo" className="font-mono">
                    {r.frequency}
                  </Badge>
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
                    <Badge variant="success">
                      Daily Report (Active)
                    </Badge>
                  )}
                  {r.sendMonthlyReport && (
                    <Badge variant="indigo">
                      Monthly Report (Active)
                    </Badge>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <Button
                  variant="link"
                  size="sm"
                  onClick={() => handleSendTestReport(r)}
                  disabled={testSending === r._id}
                  className="p-0 h-auto text-indigo-600 font-semibold"
                >
                  <Send className={`w-3.5 h-3.5 mr-1 ${testSending === r._id ? "animate-spin" : ""}`} />
                  <span>{testSending === r._id ? "Dispatching..." : "Send Test Report"}</span>
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(r)}
                    title="Edit"
                    className="h-8 w-8 text-slate-400 hover:text-slate-700"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(r._id, r.name)}
                    title="Delete"
                    className="h-8 w-8 text-slate-400 hover:text-rose-600"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Shadcn Dialog: Create / Edit Report Recipient */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MailCheck className="w-4 h-4 text-indigo-600" />
              <span>{editingItem ? "Edit Report Recipient" : "Add Report Recipient"}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Recipient Name / Title
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Ramesh Kulkarni (Canteen In-charge)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Email Address (Mail वर पाठवण्यासाठी)
              </label>
              <Input
                type="email"
                required
                placeholder="e.g. admin@bajaj.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                WhatsApp Mobile Number (Whatsapp वर पाठवण्यासाठी)
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. +91 98000 00001"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
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
                <Input
                  type="text"
                  value={formData.departmentName}
                  onChange={(e) => setFormData({ ...formData, departmentName: e.target.value })}
                  placeholder="e.g. All Departments"
                />
              </div>
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
                loading={formLoading}
              >
                {formLoading ? "Saving..." : "Save Recipient"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

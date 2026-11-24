"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Calendar,
  CheckCircle2,
  Building2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  ShieldCheck,
  ArrowRight,
  Filter,
} from "lucide-react";

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState("shift_handover");
  const [selectedShift, setSelectedShift] = useState("SHIFT_A");
  const [selectedDept, setSelectedDept] = useState("ALL");
  const [generating, setGenerating] = useState(false);

  const reportTemplates = [
    {
      id: "shift_handover",
      title: "Daily Shift Handover & Operational Verification Log",
      description: "Complete shift summary listing all executed check sheets, supervisor sign-offs, and open defects.",
      standards: "Internal SOP & Quality Standard",
      icon: Clock,
      category: "Shift Operations",
    },
    {
      id: "fssai_hygiene",
      title: "FSSAI Regulatory Food Safety & Hygiene Audit Dossier",
      description: "Official compliance report covering oil TPM thresholds (<25%), refrigeration logs, and personal hygiene checks.",
      standards: "FSSAI Schedule IV & ISO 22000",
      icon: ShieldCheck,
      category: "Statutory Compliance",
    },
    {
      id: "cold_chain",
      title: "Cold Chain & Walk-in Refrigeration Temperature Register",
      description: "Continuous temperature readings for walk-in chillers (0-4°C) and deep freezers (-18 to -25°C) with photo evidence.",
      standards: "HACCP & Critical Control Point (CCP-1)",
      icon: FileSpreadsheet,
      category: "Cold Chain Monitoring",
    },
    {
      id: "monthly_audit",
      title: "Monthly Plant-Wide Quality Governance Dossier",
      description: "Executive summary across Kitchen, Bakery, Storage, and Dining departments with historical defect Pareto.",
      standards: "Bajaj Corporate Safety Governance",
      icon: FileText,
      category: "Executive Governance",
    },
  ];

  const handleDownloadCSV = () => {
    setGenerating(true);
    setTimeout(() => {
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          ["Bajaj Canteen Operational Report", "Akurdi Plant Facility 04"],
          ["Generated At", new Date().toISOString()],
          ["Report Type", selectedReport],
          ["Selected Shift", selectedShift],
          [],
          ["Check Sheet Code", "Title", "Department", "Shift", "Recorded Value", "Compliance", "Supervisor Signature", "Status"],
          ["CS-KTCH-01", "Deep Fryer TPM & Oil Log", "Canteen Main Kitchen", "Shift A", "TPM: 14.5%", "100%", "Rajesh Sharma (BAJAJ-SUP-01)", "Approved"],
          ["CS-COLD-02", "Walk-in Freezer Temp Monitor", "Cold Storage", "Shift A", "Chiller: 2.8C / Freezer: -20.5C", "100%", "Rajesh Sharma (BAJAJ-SUP-01)", "Approved"],
          ["CS-DINE-03", "Dining Sanitization Log", "Dining Hall Alpha", "Shift A", "UV Chamber Active", "100%", "Rajesh Sharma (BAJAJ-SUP-01)", "Approved"],
          ["CS-HYGN-05", "Staff Personal Hygiene Audit", "Canteen Main Kitchen", "Shift A", "Attire defect flagged", "66%", "Amit Deshmukh (BAJAJ-PLANT-01)", "Rejected"],
        ]
          .map((row) => row.join(","))
          .join("\n");

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `Bajaj_Report_${selectedReport}_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setGenerating(false);
    }, 600);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Compliance Reports & Export Engine
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#CDFE02] text-[#101010]">
              Module 5
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Generate formal food safety registers, daily shift handover certifications, and export compliance data for ISO/FSSAI audits.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleDownloadCSV}
            disabled={generating}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#5733F0]/30 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#CDFE02]" />
            <span>{generating ? "Exporting..." : "Export CSV Dossier"}</span>
          </button>
        </div>
      </div>

      {/* Filter Parameters Strip */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="text-zinc-400 font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#CDFE02]" /> Parameters:
          </span>

          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
          >
            <option value="ALL">All Shifts</option>
            <option value="SHIFT_A">Shift A (Morning 06:00–14:00)</option>
            <option value="SHIFT_B">Shift B (Evening 14:00–22:00)</option>
            <option value="SHIFT_C">Shift C (Night 22:00–06:00)</option>
          </select>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="bg-white/[0.03] border border-white/10 rounded-xl py-1.5 px-3 text-xs text-white focus:outline-none focus:border-[#5733F0]"
          >
            <option value="ALL">All Plant Facilities</option>
            <option value="KITCHEN">Canteen Main Kitchen</option>
            <option value="BAKERY">Bakery & Confectionery</option>
            <option value="STORAGE">Cold Storage & Refrigeration</option>
            <option value="DINING">Dining Hall & Sanitization</option>
          </select>
        </div>

        <div className="text-xs text-zinc-400 font-mono">
          Facility: <strong className="text-white">Akurdi Complex • Unit 04</strong>
        </div>
      </div>

      {/* Report Template Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportTemplates.map((template) => {
          const Icon = template.icon;
          const isSelected = selectedReport === template.id;

          return (
            <div
              key={template.id}
              onClick={() => setSelectedReport(template.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer space-y-3 relative ${
                isSelected
                  ? "bg-[#5733F0]/15 border-[#5733F0] shadow-lg shadow-[#5733F0]/20"
                  : "bg-[#141414] border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/5 text-[#D2EFF7]">
                  {template.category}
                </span>
                {isSelected ? (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02]" />
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{template.title}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">{template.description}</p>
              </div>

              <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5">
                <span className="text-zinc-500 font-mono">Standard: {template.standards}</span>
                <span className="text-xs font-semibold text-[#CDFE02] flex items-center gap-1">
                  <span>Selected</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live Preview Box */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-sm font-bold text-white">Live Report Dossier Preview</h3>
            <p className="text-xs text-zinc-400">
              Bajaj Auto Limited • Akurdi Facility 04 • Verified Shift Data
            </p>
          </div>
          <span className="text-xs font-mono text-[#CDFE02] bg-[#CDFE02]/10 px-3 py-1 rounded-full border border-[#CDFE02]/20">
            Audit-Ready Certified
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-zinc-400">
                <th className="pb-3 font-semibold">Check Sheet</th>
                <th className="pb-3 font-semibold">Facility</th>
                <th className="pb-3 font-semibold">Shift Execution</th>
                <th className="pb-3 font-semibold">Key Readings</th>
                <th className="pb-3 font-semibold">Supervisor Seal</th>
                <th className="pb-3 font-semibold text-right">Result</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <tr className="hover:bg-white/[0.01]">
                <td className="py-3 font-semibold text-white">Deep Fryer TPM & Oil Quality Log</td>
                <td className="py-3 text-zinc-300">Canteen Main Kitchen</td>
                <td className="py-3 text-zinc-400">Shift A (06:00–14:00)</td>
                <td className="py-3 font-mono text-[#CDFE02]">TPM: 14.5% (Max 25%)</td>
                <td className="py-3 text-zinc-300">Rajesh Sharma (BAJAJ-SUP-01)</td>
                <td className="py-3 text-right font-bold text-[#CDFE02]">Pass</td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-3 font-semibold text-white">Walk-in Freezer Temp Monitor</td>
                <td className="py-3 text-zinc-300">Cold Storage Unit</td>
                <td className="py-3 text-zinc-400">Shift A (06:00–14:00)</td>
                <td className="py-3 font-mono text-zinc-300">Chiller: 2.8°C / Freezer: -20.5°C</td>
                <td className="py-3 text-zinc-300">Rajesh Sharma (BAJAJ-SUP-01)</td>
                <td className="py-3 text-right font-bold text-[#CDFE02]">Pass</td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-3 font-semibold text-white">Dining Hall Sanitization & UV Log</td>
                <td className="py-3 text-zinc-300">Dining Hall Alpha</td>
                <td className="py-3 text-zinc-400">Shift A (06:00–14:00)</td>
                <td className="py-3 font-mono text-zinc-300">UV Chamber 15m Complete</td>
                <td className="py-3 text-zinc-300">Rajesh Sharma (BAJAJ-SUP-01)</td>
                <td className="py-3 text-right font-bold text-[#CDFE02]">Pass</td>
              </tr>
              <tr className="hover:bg-white/[0.01]">
                <td className="py-3 font-semibold text-white">Food Handler Personal Hygiene Audit</td>
                <td className="py-3 text-zinc-300">Canteen Main Kitchen</td>
                <td className="py-3 text-zinc-400">Shift A (06:00–14:00)</td>
                <td className="py-3 font-mono text-rose-400">Attire non-conformance</td>
                <td className="py-3 text-zinc-300">Amit Deshmukh (BAJAJ-PLANT-01)</td>
                <td className="py-3 text-right font-bold text-rose-400">Rectify</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

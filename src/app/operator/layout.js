import React, { Suspense } from "react";
import OperatorSidebar from "@/components/OperatorSidebar";
import OperatorHeader from "@/components/OperatorHeader";

export const metadata = {
  title: "Bajaj Floor Operations Terminal",
  description: "Touchscreen Check Sheet Execution & Quality Monitoring",
};

export default function OperatorLayout({ children }) {
  return (
    <div className="h-screen w-full bg-slate-50 text-slate-900 flex font-sans overflow-hidden selection:bg-indigo-600 selection:text-white">
      {/* Permanent Fixed / Sticky Operator Sidebar */}
      <Suspense fallback={<div className="w-64 bg-white border-r border-slate-200 shrink-0 h-screen" />}>
        <OperatorSidebar />
      </Suspense>

      {/* Main Terminal Shell with Header & Independent Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Suspense fallback={<div className="h-16 bg-white border-b border-slate-200 shrink-0" />}>
          <OperatorHeader />
        </Suspense>
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<div className="py-20 text-center text-xs text-slate-500">Loading Floor Terminal...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

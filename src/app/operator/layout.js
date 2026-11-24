import React, { Suspense } from "react";
import OperatorSidebar from "@/components/OperatorSidebar";
import OperatorHeader from "@/components/OperatorHeader";

export const metadata = {
  title: "Bajaj Floor Operations Terminal",
  description: "Touchscreen Check Sheet Execution & Quality Monitoring",
};

export default function OperatorLayout({ children }) {
  return (
    <div className="h-screen w-full bg-[#101010] text-white flex font-sans overflow-hidden selection:bg-[#CDFE02] selection:text-[#101010]">
      {/* Permanent Fixed / Sticky Operator Sidebar */}
      <Suspense fallback={<div className="w-64 bg-[#141414] border-r border-white/10 shrink-0 h-screen" />}>
        <OperatorSidebar />
      </Suspense>

      {/* Main Terminal Shell with Header & Independent Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Suspense fallback={<div className="h-16 bg-[#141414] border-b border-white/10 shrink-0" />}>
          <OperatorHeader />
        </Suspense>
        <main className="flex-1 p-6 overflow-y-auto">
          <Suspense fallback={<div className="py-20 text-center text-xs text-zinc-500">Loading Floor Terminal...</div>}>
            {children}
          </Suspense>
        </main>
      </div>
    </div>
  );
}

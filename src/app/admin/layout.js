import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const metadata = {
  title: "Bajaj Operations Admin Console 2.0",
  description: "Enterprise Check Sheet, Shift, and Canteen Management",
};

export default function AdminLayout({ children }) {
  return (
    <div className="h-screen w-full bg-[#F8FAFC] text-slate-900 flex font-sans overflow-hidden selection:bg-indigo-100 selection:text-indigo-900">
      {/* Permanent Fixed / Sticky Sidebar */}
      <AdminSidebar />

      {/* Main Application Shell */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-[#F8FAFC]">
        <AdminHeader />
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

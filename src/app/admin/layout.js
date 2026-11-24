import React from "react";
import AdminSidebar from "@/components/AdminSidebar";
import AdminHeader from "@/components/AdminHeader";

export const metadata = {
  title: "Bajaj Operations Admin Console 2.0",
  description: "Enterprise Check Sheet, Shift, and Canteen Management",
};

export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#101010] text-white flex font-sans selection:bg-[#CDFE02] selection:text-[#101010]">
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader />
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

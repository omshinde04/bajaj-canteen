"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import {
  Users,
  Shield,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Building2,
  CalendarDays,
  Mail,
  Lock,
  Phone,
  KeyRound,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeRoleFilter, setActiveRoleFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    name: "",
    email: "",
    password: "",
    roleId: "",
    departmentId: "",
    shiftId: "",
    phoneNumber: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, rolesRes, deptsRes, shiftsRes] = await Promise.all([
        fetch("/api/users").then((r) => r.json()),
        fetch("/api/roles").then((r) => r.json()),
        fetch("/api/departments").then((r) => r.json()),
        fetch("/api/shifts").then((r) => r.json()),
      ]);

      if (usersRes.success) setUsers(usersRes.users || []);
      if (rolesRes.success) setRoles(rolesRes.roles || []);
      if (deptsRes.success) setDepartments(deptsRes.departments || []);
      if (shiftsRes.success) setShifts(shiftsRes.shifts || []);
    } catch (err) {
      console.error("Failed to load users data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openCreateModal = () => {
    setEditingUser(null);
    setFormData({
      employeeId: "",
      name: "",
      email: "",
      password: "",
      roleId: roles[0]?._id || "",
      departmentId: departments[0]?._id || "",
      shiftId: shifts[0]?._id || "",
      phoneNumber: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setFormData({
      employeeId: u.employeeId,
      name: u.name,
      email: u.email,
      password: "",
      roleId: u.role?._id || "",
      departmentId: u.department?._id || "",
      shiftId: u.assignedShift?._id || "",
      phoneNumber: u.phoneNumber || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editingUser ? `/api/users/${editingUser._id}` : "/api/users";
      const method = editingUser ? "PATCH" : "POST";

      const payload = { ...formData };
      if (editingUser && !payload.password) {
        delete payload.password; // Don't overwrite password if left blank in edit
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save user");
      }

      setModalOpen(false);
      fetchData();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (id, name, isActive) => {
    const action = isActive ? "deactivate" : "reactivate";
    if (!confirm(`Are you sure you want to ${action} user "${name}"?`)) return;

    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed to ${action} user`);
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId?.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      activeRoleFilter === "ALL" || u.role?.code === activeRoleFilter;

    return matchesSearch && matchesRole;
  });

  useEffect(() => {
    setCurrentPage(1);
  }, [activeRoleFilter, search]);

  const totalPages = Math.ceil(filteredUsers.length / pageSize) || 1;
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getRoleBadge = (code, name) => {
    switch (code) {
      case "SUPER_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#CDFE02]/20 text-[#CDFE02] border border-[#CDFE02]/40">
            <Shield className="w-2.5 h-2.5" /> Super Admin
          </span>
        );
      case "PLANT_ADMIN":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#5733F0]/25 text-[#D2EFF7] border border-[#5733F0]/40">
            Plant Admin
          </span>
        );
      case "SUPERVISOR":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
            Supervisor
          </span>
        );
      case "OPERATOR":
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/5 text-zinc-300 border border-white/10">
            Operator
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#CDFE02] animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-[#CDFE02]">
              Point 1: All Access — (Admin, Operator)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            <Users className="w-6 h-6 text-[#CDFE02]" />
            <span>User Access Management</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Add, update, delete Admin and Operator accounts with credentials and department bindings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 flex items-center gap-2 transition-all cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={openCreateModal}
            className="px-4 py-2 rounded-xl font-semibold text-xs text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all flex items-center gap-2 shadow-lg shadow-[#5733F0]/30 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#CDFE02]" />
            <span>Add Staff Member</span>
          </button>
        </div>
      </div>

      {/* Role Filter Tabs (Only Admin & Operator as per Handwritten Specification) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-white/10 pb-3 [scrollbar-width:none]">
        {[
          { key: "ALL", label: "All Users", count: users.length },
          { key: "SUPER_ADMIN", label: "Admin Accounts", count: users.filter((u) => u.role?.code === "SUPER_ADMIN" || u.role?.code === "ADMIN").length },
          { key: "OPERATOR", label: "Operator Accounts", count: users.filter((u) => u.role?.code === "OPERATOR").length },
        ].map((tab) => {
          const isActive = activeRoleFilter === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveRoleFilter(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium shrink-0 flex items-center gap-2 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#5733F0] text-white font-semibold shadow-md shadow-[#5733F0]/25"
                  : "bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/5 border border-white/5"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-zinc-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 p-4 flex items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or employee ID..."
            className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
          />
        </div>

        <span className="text-xs text-zinc-400 hidden sm:inline">
          Showing {filteredUsers.length} active staff profiles
        </span>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-[#141414] border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400">
                <th className="py-3.5 px-4 font-semibold">Staff Name & ID</th>
                <th className="py-3.5 px-4 font-semibold">Corporate Email</th>
                <th className="py-3.5 px-4 font-semibold">Assigned Role</th>
                <th className="py-3.5 px-4 font-semibold">Department & Shift</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    Loading staff directory...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-zinc-500">
                    No users found matching your search.
                  </td>
                </tr>
              ) : (
                paginatedUsers.map((u) => (
                  <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{u.name}</div>
                      <div className="text-[10px] font-mono text-[#D2EFF7] mt-0.5">{u.employeeId}</div>
                    </td>

                    <td className="py-3.5 px-4 text-zinc-300 font-mono text-[11px]">{u.email}</td>

                    <td className="py-3.5 px-4">{getRoleBadge(u.role?.code, u.role?.name)}</td>

                    <td className="py-3.5 px-4">
                      <div className="text-zinc-200">{u.department?.name || "All Departments"}</div>
                      <div className="text-[10px] text-zinc-500">{u.assignedShift?.name || "Flexible"}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#CDFE02]">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-500">
                          <XCircle className="w-3 h-3" /> Deactivated
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(u)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                          title="Edit Profile"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeactivate(u._id, u.name, u.isActive)}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.isActive
                              ? "text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10"
                              : "text-zinc-400 hover:text-[#CDFE02] hover:bg-[#CDFE02]/10"
                          }`}
                          title={u.isActive ? "Deactivate User" : "Reactivate User"}
                        >
                          {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Dynamic Pagination Controls */}
        <div className="p-4 border-t border-white/5">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredUsers.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[10, 20, 50]}
          />
        </div>
      </div>

      {/* Centered Modal: Create / Edit Staff Member */}
      {modalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-lg bg-[#18181D] border border-white/15 rounded-3xl p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#CDFE02]" />
                {editingUser ? "Edit Staff Member" : "Add New Staff Member"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-300">
                {error}
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Employee ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.employeeId}
                    onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                    placeholder="e.g. BAJAJ-140"
                    disabled={!!editingUser}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-xs text-white font-mono placeholder-zinc-500 focus:outline-none focus:border-[#5733F0] disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rajesh Sharma"
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  Corporate Email Address *
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rsharma@bajaj.com"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                  {editingUser ? "Change Password (leave empty to keep current)" : "Password *"}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="••••••••••••"
                  className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#5733F0]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Role *
                  </label>
                  <select
                    value={formData.roleId}
                    onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    {roles
                      .filter((r) => r.code === "SUPER_ADMIN" || r.code === "ADMIN" || r.code === "OPERATOR")
                      .map((r) => (
                        <option key={r._id} value={r._id}>
                          {r.code === "SUPER_ADMIN" ? "Admin" : r.name}
                        </option>
                      ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Department
                  </label>
                  <select
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="">None / All</option>
                    {departments.map((d) => (
                      <option key={d._id} value={d._id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-semibold text-zinc-300 uppercase tracking-wider block">
                    Shift
                  </label>
                  <select
                    value={formData.shiftId}
                    onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                    className="w-full bg-white/[0.03] border border-white/10 rounded-xl py-2 px-2.5 text-xs text-white focus:outline-none focus:border-[#5733F0]"
                  >
                    <option value="">None / Flexible</option>
                    {shifts.map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-5 py-2 rounded-xl text-xs font-semibold text-white bg-[#5733F0] hover:bg-[#5733F0]/90 transition-all shadow-md shadow-[#5733F0]/25 cursor-pointer"
                >
                  {formLoading ? "Saving..." : editingUser ? "Update Profile" : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

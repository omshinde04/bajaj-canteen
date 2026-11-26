"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Spinner, LoaderBlock } from "@/components/ui/loader";
import {
  Users,
  Shield,
  Plus,
  Search,
  UserCheck,
  UserX,
  Edit2,
  Trash2,
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
  X,
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

  const getRoleBadge = (code) => {
    switch (code) {
      case "SUPER_ADMIN":
      case "ADMIN":
        return (
          <Badge variant="indigo" className="gap-1">
            <Shield className="w-2.5 h-2.5" /> Admin
          </Badge>
        );
      case "OPERATOR":
      default:
        return (
          <Badge variant="secondary">
            Operator
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Point 1: All Access — (Admin, Operator)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Users className="w-6 h-6 text-indigo-600" />
            <span>User Access Management</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, update, delete Admin and Operator accounts with credentials and department bindings.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-indigo-600" : ""}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="default"
            size="default"
            onClick={openCreateModal}
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Add Staff Member</span>
          </Button>
        </div>
      </div>

      {/* Role Filter Tabs (Only Admin & Operator as per Handwritten Specification) */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 [scrollbar-width:none]">
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
                  ? "bg-indigo-600 text-white font-semibold shadow-xs"
                  : "bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                  isActive ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl bg-white border border-slate-200 p-4 flex items-center justify-between gap-3 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email, or employee ID..."
            className="pl-9 pr-8"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <span className="text-xs text-slate-500 hidden sm:inline">
          Showing {filteredUsers.length} staff profiles
        </span>
      </div>

      {/* Staff Table */}
      <div className="rounded-2xl bg-white border border-slate-200 overflow-hidden shadow-xs">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Staff Name & ID</TableHead>
              <TableHead>Corporate Email</TableHead>
              <TableHead>Assigned Role</TableHead>
              <TableHead>Department & Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>Loading staff directory...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-10 text-center text-slate-400">
                  No users found matching your search.
                </TableCell>
              </TableRow>
            ) : (
              paginatedUsers.map((u) => (
                <TableRow key={u._id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900">{u.name}</div>
                    <div className="text-[10px] font-mono text-indigo-600 mt-0.5">{u.employeeId}</div>
                  </TableCell>

                  <TableCell className="font-mono text-[11px] text-slate-600">
                    {u.email}
                  </TableCell>

                  <TableCell>{getRoleBadge(u.role?.code)}</TableCell>

                  <TableCell>
                    <div className="text-slate-800 font-medium">{u.department?.name || "All Departments"}</div>
                    <div className="text-[10px] text-slate-500">{u.assignedShift?.name || "Flexible"}</div>
                  </TableCell>

                  <TableCell>
                    {u.isActive ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3" /> Deactivated
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(u)}
                        title="Edit Profile"
                        className="h-8 w-8 text-slate-400 hover:text-slate-700"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeactivate(u._id, u.name, u.isActive)}
                        title={u.isActive ? "Deactivate User" : "Reactivate User"}
                        className={`h-8 w-8 ${
                          u.isActive
                            ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            : "text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        {u.isActive ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Dynamic Shadcn Pagination Controls */}
        <div className="p-4 border-t border-slate-100">
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

      {/* Shadcn Dialog: Create / Edit Staff Member */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>{editingUser ? "Edit Staff Member" : "Add New Staff Member"}</span>
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Employee ID *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value.toUpperCase() })}
                  placeholder="e.g. BAJAJ-140"
                  disabled={!!editingUser}
                  className="font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Full Name *
                </label>
                <Input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Sharma"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                Corporate Email Address *
              </label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="rsharma@bajaj.com"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                {editingUser ? "Change Password (leave empty to keep current)" : "Password *"}
              </label>
              <Input
                type="password"
                required={!editingUser}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••••••"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Role *
                </label>
                <select
                  value={formData.roleId}
                  onChange={(e) => setFormData({ ...formData, roleId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Department
                </label>
                <select
                  value={formData.departmentId}
                  onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                <label className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider block">
                  Shift
                </label>
                <select
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-2.5 text-xs text-slate-900 focus:outline-none focus:border-indigo-600 focus:bg-white"
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
                {formLoading ? "Saving..." : editingUser ? "Update Profile" : "Create User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import Pagination from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  Building2,
  Plus,
  Search,
  MapPin,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RefreshCw,
} from "lucide-react";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    code: "",
    plantLocation: "Bajaj Auto Akurdi Facility",
    description: "",
  });

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success) {
        setDepartments(data.departments || []);
      }
    } catch (err) {
      console.error("Failed to load departments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openCreateModal = () => {
    setEditingDept(null);
    setFormData({
      name: "",
      code: "",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "",
    });
    setError("");
    setModalOpen(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setFormData({
      name: dept.name,
      code: dept.code,
      plantLocation: dept.plantLocation || "Bajaj Auto Akurdi Facility",
      description: dept.description || "",
    });
    setError("");
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFormLoading(true);

    try {
      const url = editingDept
        ? `/api/departments/${editingDept._id}`
        : "/api/departments";
      const method = editingDept ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to save department");
      }

      setModalOpen(false);
      fetchDepartments();
    } catch (err) {
      setError(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete department "${name}"?`)) return;

    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete department");
      fetchDepartments();
    } catch (err) {
      alert(err.message);
    }
  };

  const filteredDepts = departments.filter(
    (d) =>
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.code.toLowerCase().includes(search.toLowerCase()) ||
      (d.plantLocation && d.plantLocation.toLowerCase().includes(search.toLowerCase()))
  );

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(filteredDepts.length / pageSize) || 1;
  const paginatedDepts = filteredDepts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-wider uppercase text-indigo-600">
              Point 7: Factory Departments (हे फक्त count साठी)
            </span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-indigo-600" />
            <span>Departments Master</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Add, update, delete factory departments (Engine Assembly, Vehicle Assembly, Machine Shop, etc.) specifically for count tracking.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="default"
            onClick={fetchDepartments}
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
            <span>Add Department</span>
          </Button>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <Card className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3.5">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <Input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search department by name or code..."
            className="pl-9"
          />
        </div>
        <div className="text-xs text-slate-500 font-mono">
          Showing {paginatedDepts.length} of {filteredDepts.length} departments
        </div>
      </Card>

      {/* Table Container */}
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Department Name & Code</TableHead>
              <TableHead>Location / Bay</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-slate-400">
                  <div className="flex items-center justify-center gap-2">
                    <Spinner size="sm" />
                    <span>Loading facility departments...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredDepts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-slate-400">
                  No departments found matching your criteria.
                </TableCell>
              </TableRow>
            ) : (
              paginatedDepts.map((dept) => (
                <TableRow key={dept._id}>
                  <TableCell>
                    <div className="font-semibold text-slate-900 text-xs">{dept.name}</div>
                    <div className="text-[10px] font-mono text-indigo-600 font-bold mt-0.5">{dept.code}</div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{dept.plantLocation}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-slate-500 max-w-xs truncate">
                    {dept.description || "Operational plant facility"}
                  </TableCell>

                  <TableCell>
                    {dept.isActive ? (
                      <Badge variant="success">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <XCircle className="w-3 h-3" /> Inactive
                      </Badge>
                    )}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(dept)}
                        title="Edit Department"
                        className="h-8 w-8 text-slate-400 hover:text-indigo-600"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(dept._id, dept.name)}
                        title="Delete Department"
                        className="h-8 w-8 text-slate-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredDepts.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={(newSize) => {
              setPageSize(newSize);
              setCurrentPage(1);
            }}
            pageSizeOptions={[5, 10, 20]}
          />
        </div>
      </Card>

      {/* Shadcn Dialog: Create / Edit Department */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-indigo-600" />
              <span>{editingDept ? "Edit Department" : "Add Factory Department"}</span>
            </DialogTitle>
          </DialogHeader>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Department Name *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. Engine Assembly (Line 01)"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Department Code *
              </label>
              <Input
                type="text"
                required
                placeholder="e.g. ENG-ASSY"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                className="font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Plant Facility Location / Shop Floor
              </label>
              <Input
                type="text"
                value={formData.plantLocation}
                onChange={(e) => setFormData({ ...formData, plantLocation: e.target.value })}
                placeholder="e.g. Bay 4 - South Assembly Wing"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-600 font-semibold uppercase tracking-wider text-[10px]">
                Description
              </label>
              <Input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Primary powertrain conveyor line"
              />
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
                {formLoading ? "Saving..." : editingDept ? "Update Department" : "Create Department"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

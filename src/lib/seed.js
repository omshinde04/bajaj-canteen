import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import Shift from "../models/Shift.js";
import User from "../models/User.js";
import { hashPassword } from "./auth.js";

const ALL_PERMISSIONS = [
  "view",
  "add",
  "edit",
  "update",
  "delete",
  "approve",
  "reject",
  "upload",
  "download",
  "export",
  "manage_users",
  "manage_roles",
  "manage_checksheets",
  "manage_departments",
  "manage_shifts",
  "access_analytics",
  "manage_settings",
  "manage_backups",
  "view_audit_trail",
];

export async function seedDatabase() {
  await connectDB();
  console.log("Seeding Master Enterprise Data into MongoDB Atlas...");

  // 1. Roles
  const roles = [
    {
      name: "Super Admin",
      code: "SUPER_ADMIN",
      description: "Full system-wide administrative control across all facilities and modules",
      isSystemRole: true,
      permissions: ALL_PERMISSIONS,
    },
    {
      name: "Plant Admin",
      code: "PLANT_ADMIN",
      description: "Plant-level administration across all departments and shifts",
      isSystemRole: true,
      permissions: ALL_PERMISSIONS.filter((p) => p !== "manage_backups"),
    },
    {
      name: "Department Admin",
      code: "DEPT_ADMIN",
      description: "Departmental administration and check sheet configuration",
      isSystemRole: true,
      permissions: [
        "view",
        "add",
        "edit",
        "update",
        "approve",
        "reject",
        "upload",
        "download",
        "export",
        "manage_checksheets",
        "access_analytics",
      ],
    },
    {
      name: "Supervisor",
      code: "SUPERVISOR",
      description: "Shift operational review, submissions approval and issue triage",
      isSystemRole: true,
      permissions: ["view", "approve", "reject", "upload", "download", "export"],
    },
    {
      name: "Operator",
      code: "OPERATOR",
      description: "Check sheet execution, form submission, and evidence photo uploads",
      isSystemRole: true,
      permissions: ["view", "add", "upload"],
    },
  ];

  const roleMap = {};
  for (const r of roles) {
    const upserted = await Role.findOneAndUpdate({ code: r.code }, r, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    roleMap[r.code] = upserted._id;
  }
  console.log("✓ Enterprise Roles seeded:", Object.keys(roleMap));

  // 2. Shifts
  const shifts = [
    {
      name: "Shift A (Morning)",
      code: "SHIFT_A",
      startTime: "06:00",
      endTime: "14:00",
      description: "Morning operational shift",
    },
    {
      name: "Shift B (Evening)",
      code: "SHIFT_B",
      startTime: "14:00",
      endTime: "22:00",
      description: "Evening operational shift",
    },
    {
      name: "Shift C (Night)",
      code: "SHIFT_C",
      startTime: "22:00",
      endTime: "06:00",
      description: "Overnight sanitization and baking prep shift",
    },
  ];

  const shiftMap = {};
  for (const s of shifts) {
    const upserted = await Shift.findOneAndUpdate({ code: s.code }, s, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    shiftMap[s.code] = upserted._id;
  }
  console.log("✓ Shifts seeded:", Object.keys(shiftMap));

  // 3. Departments
  const departments = [
    {
      name: "Canteen Main Kitchen",
      code: "DEPT_KITCHEN",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "Main food preparation and cooking facility",
    },
    {
      name: "Bakery & Confectionery",
      code: "DEPT_BAKERY",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "Daily bakery and snack production line",
    },
    {
      name: "Cold Storage & Raw Materials",
      code: "DEPT_STORAGE",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "Refrigeration, meat, dairy and ingredient storage",
    },
    {
      name: "Dining Hall & Sanitization",
      code: "DEPT_DINING",
      plantLocation: "Bajaj Auto Akurdi Facility",
      description: "Dining area hygiene, dishwashing and waste management",
    },
  ];

  const deptMap = {};
  for (const d of departments) {
    const upserted = await Department.findOneAndUpdate({ code: d.code }, d, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    deptMap[d.code] = upserted._id;
  }
  console.log("✓ Departments seeded:", Object.keys(deptMap));

  // 4. Default Super Admin User
  const adminEmail = "admin@bajaj.com";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const hashedPassword = await hashPassword("AdminPassword@2026");
    const superAdminUser = await User.create({
      employeeId: "BAJAJ-001",
      name: "Super Administrator",
      email: adminEmail,
      password: hashedPassword,
      role: roleMap["SUPER_ADMIN"],
      department: deptMap["DEPT_KITCHEN"],
      assignedShift: shiftMap["SHIFT_A"],
      phoneNumber: "+91 98000 00000",
      isActive: true,
    });
    console.log("✓ Super Admin user created:", superAdminUser.email);
  } else {
    console.log("✓ Super Admin user already exists:", existingAdmin.email);
  }

  console.log("Master database seeding complete!");
}

// Allow direct execution: node -r dotenv/config src/lib/seed.js
if (process.argv[1] && process.argv[1].endsWith("seed.js")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("Seeding failed:", err);
      process.exit(1);
    });
}

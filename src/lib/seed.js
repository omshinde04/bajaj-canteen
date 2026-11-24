import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import Shift from "../models/Shift.js";
import User from "../models/User.js";
import CheckSheet from "../models/CheckSheet.js";
import Submission from "../models/Submission.js";
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

  // 4. Default Super Admin User & Plant Personnel
  const staffMembers = [
    {
      employeeId: "BAJAJ-001",
      name: "Super Administrator",
      email: "admin@bajaj.com",
      passwordRaw: "AdminPassword@2026",
      roleCode: "SUPER_ADMIN",
      deptCode: "DEPT_KITCHEN",
      shiftCode: "SHIFT_A",
      phoneNumber: "+91 98000 00001",
    },
    {
      employeeId: "BAJAJ-SUP-01",
      name: "Rajesh Sharma",
      email: "supervisor@bajaj.com",
      passwordRaw: "Supervisor@2026",
      roleCode: "SUPERVISOR",
      deptCode: "DEPT_KITCHEN",
      shiftCode: "SHIFT_A",
      phoneNumber: "+91 98000 00002",
    },
    {
      employeeId: "BAJAJ-PLANT-01",
      name: "Amit Deshmukh",
      email: "plantlead@bajaj.com",
      passwordRaw: "PlantLead@2026",
      roleCode: "PLANT_ADMIN",
      deptCode: "DEPT_STORAGE",
      shiftCode: "SHIFT_B",
      phoneNumber: "+91 98000 00003",
    },
    {
      employeeId: "BAJAJ-OP-01",
      name: "Ramesh Pawar",
      email: "operator@bajaj.com",
      passwordRaw: "Operator@2026",
      roleCode: "OPERATOR",
      deptCode: "DEPT_KITCHEN",
      shiftCode: "SHIFT_A",
      phoneNumber: "+91 98000 00004",
    },
  ];

  for (const s of staffMembers) {
    const existing = await User.findOne({ email: s.email });
    if (!existing) {
      const hashedPassword = await hashPassword(s.passwordRaw);
      await User.create({
        employeeId: s.employeeId,
        name: s.name,
        email: s.email,
        password: hashedPassword,
        role: roleMap[s.roleCode],
        department: deptMap[s.deptCode],
        assignedShift: shiftMap[s.shiftCode],
        phoneNumber: s.phoneNumber,
        isActive: true,
      });
      console.log(`✓ Staff user created: ${s.name} (${s.email}) - ${s.roleCode}`);
    }
  }

  // 5. Seed Master Operational Check Sheets
  const masterCheckSheets = [
    {
      title: "Deep Fryer TPM & Cooking Oil Quality Log",
      code: "CS-KTCH-01",
      category: "Food Safety & Quality",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_tpm", label: "Total Polar Material (TPM %)", fieldType: "number", isRequired: true, unit: "%", minValue: 0, maxValue: 25, order: 1 },
        { fieldId: "f_oil_temp", label: "Cooking Oil Temperature (°C)", fieldType: "number", isRequired: true, unit: "°C", minValue: 150, maxValue: 190, order: 2 },
        { fieldId: "f_clarity", label: "Oil Color & Clarity Test", fieldType: "select", options: ["Pass (Clear Golden)", "Warning (Amber)", "Fail (Dark/Foaming - Discard)"], isRequired: true, order: 3 },
        { fieldId: "f_photo", label: "Digital TPM Meter Reading Photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 4 },
      ],
    },
    {
      title: "Walk-in Freezer & Chiller Temp Monitor",
      code: "CS-COLD-02",
      category: "Cold Chain Monitoring",
      department: deptMap["DEPT_STORAGE"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"], shiftMap["SHIFT_C"]],
      frequency: "per_shift",
      mandatoryPhotoCount: 1,
      slaHours: 1,
      isActive: true,
      fields: [
        { fieldId: "f_chiller", label: "Walk-in Chiller Temperature (°C)", fieldType: "number", isRequired: true, unit: "°C", minValue: 0, maxValue: 4, order: 1 },
        { fieldId: "f_freezer", label: "Walk-in Deep Freezer Temp (°C)", fieldType: "number", isRequired: true, unit: "°C", minValue: -25, maxValue: -18, order: 2 },
        { fieldId: "f_door_seal", label: "Door Gaskets & Air Curtain Integrity", fieldType: "boolean", isRequired: true, order: 3 },
        { fieldId: "f_photo", label: "Digital Thermometer Dial Photograph", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 4 },
      ],
    },
    {
      title: "Dining Hall Sanitization & UV Inspection",
      code: "CS-DINE-03",
      category: "Hygiene & Sanitization",
      department: deptMap["DEPT_DINING"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "per_shift",
      mandatoryPhotoCount: 2,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_tables", label: "Tabletop 200ppm Chlorine Disinfection", fieldType: "boolean", isRequired: true, order: 1 },
        { fieldId: "f_uv", label: "Cutlery UV Sterilization Chamber Timer", fieldType: "select", options: ["Active (15 Min Cycle)", "Maintenance Required"], isRequired: true, order: 2 },
        { fieldId: "f_floor", label: "Floor Auto-Scrubber Cleaning Complete", fieldType: "boolean", isRequired: true, order: 3 },
        { fieldId: "f_bin", label: "Wet & Dry Waste Segregation Bins Cleared", fieldType: "boolean", isRequired: true, order: 4 },
      ],
    },
    {
      title: "Bakery Oven Calibration & Proofing Log",
      code: "CS-BAKE-04",
      category: "Production Quality",
      department: deptMap["DEPT_BAKERY"],
      allowedShifts: [shiftMap["SHIFT_A"]],
      frequency: "daily",
      mandatoryPhotoCount: 0,
      slaHours: 4,
      isActive: true,
      fields: [
        { fieldId: "f_proof_temp", label: "Dough Proofing Room Temp (°C)", fieldType: "number", isRequired: true, unit: "°C", minValue: 28, maxValue: 38, order: 1 },
        { fieldId: "f_oven_temp", label: "Deck Oven Core Temp (°C)", fieldType: "number", isRequired: true, unit: "°C", minValue: 180, maxValue: 240, order: 2 },
        { fieldId: "f_batch_weight", label: "Sample Bun Weight Conformity (g)", fieldType: "number", isRequired: true, unit: "g", minValue: 65, maxValue: 75, order: 3 },
      ],
    },
    {
      title: "Food Handler Personal Hygiene Audit",
      code: "CS-HYGN-05",
      category: "Personal Hygiene & FSSAI",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"], shiftMap["SHIFT_C"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_nails", label: "Finger Nails Clipped & No Jewelry", fieldType: "boolean", isRequired: true, order: 1 },
        { fieldId: "f_ppe", label: "Clean Apron, Hair Net & Beard Cover", fieldType: "boolean", isRequired: true, order: 2 },
        { fieldId: "f_health", label: "Zero Symptoms of Cough, Fever, or Lesions", fieldType: "boolean", isRequired: true, order: 3 },
        { fieldId: "f_photo", label: "Line Hygiene Inspection Group Photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 4 },
      ],
    },
  ];

  const checkSheetMap = {};
  for (const cs of masterCheckSheets) {
    const upserted = await CheckSheet.findOneAndUpdate({ code: cs.code }, cs, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
    checkSheetMap[cs.code] = upserted._id;
  }
  console.log("✓ Master Operational Check Sheets seeded:", Object.keys(checkSheetMap));

  // 6. Seed Operational Submissions
  const adminUser = await User.findOne({ email: "admin@bajaj.com" });

  const existingSubmissionsCount = await Submission.countDocuments();
  if (existingSubmissionsCount === 0) {
    const sampleSubmissions = [
      {
        checkSheet: checkSheetMap["CS-KTCH-01"],
        department: deptMap["DEPT_KITCHEN"],
        shift: shiftMap["SHIFT_A"],
        submittedBy: adminUser._id,
        status: "PENDING_APPROVAL",
        complianceScore: 100,
        hasDefects: false,
        notes: "Morning batch deep fryer testing completed at 07:15 AM.",
        responses: [
          { fieldId: "f_tpm", label: "Total Polar Material (TPM %)", fieldType: "number", value: 14.5, unit: "%", isConforming: true },
          { fieldId: "f_oil_temp", label: "Cooking Oil Temperature (°C)", fieldType: "number", value: 175, unit: "°C", isConforming: true },
          { fieldId: "f_clarity", label: "Oil Color & Clarity Test", fieldType: "select", value: "Pass (Clear Golden)", isConforming: true },
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80",
            caption: "Digital TPM meter showing 14.5% reading",
            fieldId: "f_photo",
          },
        ],
        submissionDate: new Date(Date.now() - 15 * 60 * 1000), // 15m ago
      },
      {
        checkSheet: checkSheetMap["CS-COLD-02"],
        department: deptMap["DEPT_STORAGE"],
        shift: shiftMap["SHIFT_A"],
        submittedBy: adminUser._id,
        status: "PENDING_APPROVAL",
        complianceScore: 100,
        hasDefects: false,
        notes: "Chiller and deep freezer within nominal ISO range.",
        responses: [
          { fieldId: "f_chiller", label: "Walk-in Chiller Temperature (°C)", fieldType: "number", value: 2.8, unit: "°C", isConforming: true },
          { fieldId: "f_freezer", label: "Walk-in Deep Freezer Temp (°C)", fieldType: "number", value: -20.5, unit: "°C", isConforming: true },
          { fieldId: "f_door_seal", label: "Door Gaskets & Air Curtain Integrity", fieldType: "boolean", value: true, isConforming: true },
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80",
            caption: "Deep freezer thermostat digital reading display",
            fieldId: "f_photo",
          },
        ],
        submissionDate: new Date(Date.now() - 35 * 60 * 1000), // 35m ago
      },
      {
        checkSheet: checkSheetMap["CS-DINE-03"],
        department: deptMap["DEPT_DINING"],
        shift: shiftMap["SHIFT_A"],
        submittedBy: adminUser._id,
        status: "APPROVED",
        complianceScore: 100,
        hasDefects: false,
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 20 * 60 * 1000),
        supervisorRemarks: "All dining hall tables sanitized and UV sterilization chamber verified.",
        digitalSignature: {
          signedBy: "Super Administrator (BAJAJ-001)",
          timestamp: new Date(Date.now() - 20 * 60 * 1000),
          hash: "a4f8902c3b5d8e71fa9900223bc789e023154876aefbc901235678cdfa1902bb",
        },
        responses: [
          { fieldId: "f_tables", label: "Tabletop 200ppm Chlorine Disinfection", fieldType: "boolean", value: true, isConforming: true },
          { fieldId: "f_uv", label: "Cutlery UV Sterilization Chamber Timer", fieldType: "select", value: "Active (15 Min Cycle)", isConforming: true },
          { fieldId: "f_floor", label: "Floor Auto-Scrubber Cleaning Complete", fieldType: "boolean", value: true, isConforming: true },
          { fieldId: "f_bin", label: "Wet & Dry Waste Segregation Bins Cleared", fieldType: "boolean", value: true, isConforming: true },
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=600&q=80",
            caption: "Sanitized dining hall seating area view",
          },
        ],
        submissionDate: new Date(Date.now() - 60 * 60 * 1000), // 1h ago
      },
      {
        checkSheet: checkSheetMap["CS-HYGN-05"],
        department: deptMap["DEPT_KITCHEN"],
        shift: shiftMap["SHIFT_A"],
        submittedBy: adminUser._id,
        status: "REJECTED",
        complianceScore: 66,
        hasDefects: true,
        reviewedBy: adminUser._id,
        reviewedAt: new Date(Date.now() - 45 * 60 * 1000),
        rejectionReason: "Kitchen prep assistant #3 was wearing wrist jewelry and apron was stained. Must re-inspect after full attire replacement.",
        responses: [
          { fieldId: "f_nails", label: "Finger Nails Clipped & No Jewelry", fieldType: "boolean", value: false, isConforming: false },
          { fieldId: "f_ppe", label: "Clean Apron, Hair Net & Beard Cover", fieldType: "boolean", value: false, isConforming: false },
          { fieldId: "f_health", label: "Zero Symptoms of Cough, Fever, or Lesions", fieldType: "boolean", value: true, isConforming: true },
        ],
        photos: [
          {
            url: "https://images.unsplash.com/photo-1577219491135-ce391730fb2c?auto=format&fit=crop&w=600&q=80",
            caption: "Food handler personal hygiene station audit",
          },
        ],
        submissionDate: new Date(Date.now() - 90 * 60 * 1000),
      },
    ];

    await Submission.insertMany(sampleSubmissions);
    console.log("✓ Operational Submissions seeded:", sampleSubmissions.length);
  } else {
    console.log("✓ Submissions already present in database:", existingSubmissionsCount);
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

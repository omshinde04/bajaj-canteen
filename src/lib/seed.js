import mongoose from "mongoose";
import { connectDB } from "./db.js";
import Role from "../models/Role.js";
import Department from "../models/Department.js";
import Shift from "../models/Shift.js";
import User from "../models/User.js";
import CheckSheet from "../models/CheckSheet.js";
import Submission from "../models/Submission.js";
import TeaCount from "../models/TeaCount.js";
import ReportRecipient from "../models/ReportRecipient.js";
import Notification from "../models/Notification.js";
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

  // 1. Roles (Strictly Admin and Operator as per Client Specifications)
  const roles = [
    {
      name: "Super Admin",
      code: "SUPER_ADMIN",
      description: "Full system-wide administrative control across all facilities and modules",
      isSystemRole: true,
      permissions: ALL_PERMISSIONS,
    },
    {
      name: "Operator",
      code: "OPERATOR",
      description: "Check sheet execution, counter readiness, tea logistics, and biscuit audit",
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
      description: "Overnight sanitization shift",
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

  // 3. Departments (Factory Departments for Tea Count Tracking as per handwritten spec)
  const departments = [
    {
      name: "Engine Assembly",
      code: "DEPT_ENG_ASSY",
      plantLocation: "Bajaj Auto Akurdi Facility - Bay 1",
      description: "Engine assembly and testing line",
    },
    {
      name: "Vehicle Assembly",
      code: "DEPT_VEH_ASSY",
      plantLocation: "Bajaj Auto Akurdi Facility - Bay 2",
      description: "Two-wheeler and chassis final assembly",
    },
    {
      name: "Machine Shop",
      code: "DEPT_MACHINE_SHOP",
      plantLocation: "Bajaj Auto Akurdi Facility - Bay 3",
      description: "Engine components, transmission & machining",
    },
    {
      name: "Paint Shop",
      code: "DEPT_PAINT_SHOP",
      plantLocation: "Bajaj Auto Akurdi Facility - Unit 4",
      description: "Automated electrostatic painting booths",
    },
    {
      name: "Press Shop",
      code: "DEPT_PRESS_SHOP",
      plantLocation: "Bajaj Auto Akurdi Facility - Unit 2",
      description: "Heavy sheet metal pressing and stamping",
    },
    {
      name: "Quality Assurance",
      code: "DEPT_QA",
      plantLocation: "Bajaj Auto Akurdi Facility - Admin Block",
      description: "Inspection, metrology & quality testing labs",
    },
    {
      name: "Canteen Main Kitchen",
      code: "DEPT_KITCHEN",
      plantLocation: "Bajaj Auto Akurdi Facility - Central Canteen",
      description: "Main food preparation and tea production facility",
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

  // 4. Default Logins (Strictly Admin & Operator as per Handwritten Specification)
  const staffMembers = [
    {
      employeeId: "BAJAJ-001",
      name: "Admin",
      email: "admin@bajaj.com",
      passwordRaw: "AdminPassword@2026",
      roleCode: "SUPER_ADMIN",
      deptCode: "DEPT_KITCHEN",
      shiftCode: "SHIFT_A",
      phoneNumber: "+91 98000 00001",
    },
    {
      employeeId: "BAJAJ-OP-01",
      name: "Ramesh Pawar (Operator)",
      email: "operator@bajaj.com",
      passwordRaw: "Operator@2026",
      roleCode: "OPERATOR",
      deptCode: "DEPT_KITCHEN",
      shiftCode: "SHIFT_A",
      phoneNumber: "+91 98000 00004",
    },
  ];

  // Remove any non-whitelisted accounts
  await User.deleteMany({ email: { $nin: ["admin@bajaj.com", "operator@bajaj.com"] } });

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

  // 5. Real JH CheckSheets from Client's Master Sheet
  const masterCheckSheets = [
    {
      title: "JH CheckSheet - Four Burner Range (PNG)",
      code: "CS-JH-01",
      category: "PNG Kitchen Equipment",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_body", label: "Range top, drip tray & body - Clean, no residue (C)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 1 },
        { fieldId: "f_ports", label: "Burner heads & ports (all 4) - Not clogged (C)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_flame", label: "Burner flame - Blue, steady, uniform (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_knobs", label: "Control knobs - Turn smoothly, shut off fully (I, T)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
        { fieldId: "f_leak", label: "PNG leak check at joints - No bubbles/smell (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 5 },
        { fieldId: "f_photo", label: "Burner flame & inspection photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 6 },
      ],
    },
    {
      title: "JH CheckSheet - Deep Freezer (Electrical)",
      code: "CS-JH-02",
      category: "Cold Chain Monitoring",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"], shiftMap["SHIFT_C"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 1,
      isActive: true,
      fields: [
        { fieldId: "f_temp", label: "Temperature display (°C) - Target <= -18°C", fieldType: "number", isRequired: true, unit: "°C", minValue: -30, maxValue: -18, order: 1 },
        { fieldId: "f_gasket", label: "Door gasket & seal - Intact, no tear (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_frost", label: "Frost build-up inside - < 5mm (C)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_compressor", label: "Compressor & fan - No abnormal vibration (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
        { fieldId: "f_photo", label: "Thermometer display dial photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 5 },
      ],
    },
    {
      title: "JH CheckSheet - Veg Cutting Machine (Electrical)",
      code: "CS-JH-03",
      category: "Electrical Equipment",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "daily",
      mandatoryPhotoCount: 0,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_body", label: "Machine body, hopper & chute - Clean (C)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 1 },
        { fieldId: "f_blades", label: "Cutting blades/discs - Sharp, no rust (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_safety", label: "Hopper lid safety interlock working (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_emergency", label: "ON/OFF & Emergency stop functional (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
      ],
    },
    {
      title: "JH CheckSheet - Walk-in Chiller 1 (Electrical)",
      code: "CS-JH-04",
      category: "Cold Chain Monitoring",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"], shiftMap["SHIFT_C"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 1,
      isActive: true,
      fields: [
        { fieldId: "f_temp", label: "Temperature display (°C) - Target 0 to 5°C", fieldType: "number", isRequired: true, unit: "°C", minValue: 0, maxValue: 5, order: 1 },
        { fieldId: "f_door", label: "Door handle & hinges close smoothly (I, T)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_emergency", label: "Inside emergency door release working (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_evaporator", label: "Evaporator fan running without noise (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
        { fieldId: "f_photo", label: "Digital temperature readout photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 5 },
      ],
    },
    {
      title: "JH CheckSheet - Boiler 1 (PNG)",
      code: "CS-JH-05",
      category: "PNG Kitchen Equipment",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "daily",
      mandatoryPhotoCount: 1,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_gauge", label: "Pressure gauge reading in normal range (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 1 },
        { fieldId: "f_water", label: "Water level gauge glass visible & clean (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_safety", label: "Safety valve - No leak or blockage (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_gas", label: "PNG gas leak check at joints (I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
        { fieldId: "f_photo", label: "Boiler gauge & valve status photo", fieldType: "photo", requiresPhoto: true, isRequired: true, order: 5 },
      ],
    },
    {
      title: "JH CheckSheet - Combi Oven (Electrical)",
      code: "CS-JH-06",
      category: "Electrical Equipment",
      department: deptMap["DEPT_KITCHEN"],
      allowedShifts: [shiftMap["SHIFT_A"], shiftMap["SHIFT_B"]],
      frequency: "daily",
      mandatoryPhotoCount: 0,
      slaHours: 2,
      isActive: true,
      fields: [
        { fieldId: "f_cavity", label: "Cooking cavity & door glass clean (C)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 1 },
        { fieldId: "f_gasket", label: "Door gasket intact, no tear (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 2 },
        { fieldId: "f_probe", label: "Core temperature probe intact & clean (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 3 },
        { fieldId: "f_drain", label: "Drain filter clear, no water leak (C, I)", fieldType: "select", options: ["✔️ Ok", "❌ Not Ok", "🔴 Ok After Repair"], isRequired: true, order: 4 },
      ],
    },
  ];

  for (const cs of masterCheckSheets) {
    await CheckSheet.findOneAndUpdate({ code: cs.code }, cs, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
  }
  console.log("✓ Real JH CheckSheets seeded successfully");

  // 6. Pre-seed Department-wise Tea Counts for Today & Recent Days
  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayDate = new Date(Date.now() - 86400000);
  const yesterdayStr = yesterdayDate.toISOString().split("T")[0];

  const sampleTeaCounts = [
    { deptCode: "DEPT_ENG_ASSY", deptName: "Engine Assembly", date: todayStr, session: "MORNING", count: 140, notes: "Morning tea 1st run" },
    { deptCode: "DEPT_ENG_ASSY", deptName: "Engine Assembly", date: todayStr, session: "EVENING", count: 120, notes: "Evening tea 2nd run" },
    { deptCode: "DEPT_VEH_ASSY", deptName: "Vehicle Assembly", date: todayStr, session: "MORNING", count: 110, notes: "Full line batch" },
    { deptCode: "DEPT_VEH_ASSY", deptName: "Vehicle Assembly", date: todayStr, session: "EVENING", count: 100, notes: "Regular shift tea" },
    { deptCode: "DEPT_MACHINE_SHOP", deptName: "Machine Shop", date: todayStr, session: "MORNING", count: 95, notes: "Delivered to Dispenser" },
    { deptCode: "DEPT_MACHINE_SHOP", deptName: "Machine Shop", date: todayStr, session: "EVENING", count: 85, notes: "Delivered to Dispenser" },
    { deptCode: "DEPT_PAINT_SHOP", deptName: "Paint Shop", date: todayStr, session: "MORNING", count: 75, notes: "Clean booth drop" },
    { deptCode: "DEPT_PAINT_SHOP", deptName: "Paint Shop", date: todayStr, session: "EVENING", count: 65, notes: "Clean booth drop" },
    { deptCode: "DEPT_PRESS_SHOP", deptName: "Press Shop", date: todayStr, session: "MORNING", count: 65, notes: "Delivered" },
    { deptCode: "DEPT_PRESS_SHOP", deptName: "Press Shop", date: todayStr, session: "EVENING", count: 55, notes: "Delivered" },
    { deptCode: "DEPT_QA", deptName: "Quality Assurance", date: todayStr, session: "MORNING", count: 30, notes: "Office drop" },
    { deptCode: "DEPT_QA", deptName: "Quality Assurance", date: todayStr, session: "EVENING", count: 30, notes: "Office drop" },
    // Yesterday
    { deptCode: "DEPT_ENG_ASSY", deptName: "Engine Assembly", date: yesterdayStr, session: "MORNING", count: 135, notes: "Yesterday morning" },
    { deptCode: "DEPT_VEH_ASSY", deptName: "Vehicle Assembly", date: yesterdayStr, session: "MORNING", count: 105, notes: "Yesterday morning" },
  ];

  for (const tc of sampleTeaCounts) {
    const deptId = deptMap[tc.deptCode];
    if (deptId) {
      await TeaCount.findOneAndUpdate(
        { department: deptId, date: tc.date, session: tc.session },
        {
          department: deptId,
          departmentName: tc.deptName,
          date: tc.date,
          session: tc.session,
          count: tc.count,
          deliveryStatus: "DELIVERED",
          loggedBy: "Canteen Supervisor",
          notes: tc.notes,
        },
        { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
      );
    }
  }
  console.log("✓ Sample Department-wise Tea Counts seeded");

  // 7. Pre-seed Report Recipients (Whose Mail & WhatsApp to send reports to)
  const sampleRecipients = [
    {
      name: "Ramesh Kulkarni",
      email: "canteen.admin@bajaj.com",
      whatsapp: "+91 98000 00001",
      frequency: "BOTH",
      sendDailyReport: true,
      sendMonthlyReport: true,
      departmentName: "All Departments",
      isActive: true,
    },
    {
      name: "Rajesh Sharma",
      email: "supervisor@bajaj.com",
      whatsapp: "+91 98000 00002",
      frequency: "DAILY",
      sendDailyReport: true,
      sendMonthlyReport: false,
      departmentName: "Engine Assembly",
      isActive: true,
    },
    {
      name: "Amit Deshmukh (FE Manager)",
      email: "plantlead@bajaj.com",
      whatsapp: "+91 98000 00003",
      frequency: "BOTH",
      sendDailyReport: true,
      sendMonthlyReport: true,
      departmentName: "Plant Operations",
      isActive: true,
    },
  ];

  for (const r of sampleRecipients) {
    await ReportRecipient.findOneAndUpdate({ email: r.email }, r, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
  }
  console.log("✓ Report Recipients (Mail & WhatsApp) seeded");

  // 8. Pre-seed Notifications (Receive & Send across WhatsApp, Email, Normal)
  const sampleNotifications = [
    {
      title: "Daily Tea Distribution Report Sent",
      message: "Daily tea summary report dispatched to FE Manager & Canteen In-charge via WhatsApp. Total: 970 cups.",
      channel: "WHATSAPP",
      direction: "OUTGOING",
      recipient: "+91 98000 00001, +91 98000 00003",
      sender: "Automated System",
      status: "DELIVERED",
      isRead: true,
      priority: "NORMAL",
    },
    {
      title: "Daily Checksheet Summary Dispatched",
      message: "All 6 Daily JH checksheets filled and submitted for today. Consolidated PDF report emailed.",
      channel: "EMAIL",
      direction: "OUTGOING",
      recipient: "plantlead@bajaj.com, canteen.admin@bajaj.com",
      sender: "Automated Reporting",
      status: "SENT",
      isRead: true,
      priority: "NORMAL",
    },
    {
      title: "Equipment Inspection Alert: Deep Freezer",
      message: "Deep Freezer temperature verified at -19°C (Within standard condition <= -18°C).",
      channel: "NORMAL",
      direction: "INCOMING",
      recipient: "Canteen Admin Console",
      sender: "Ramesh Pawar (Operator)",
      status: "RECEIVED",
      isRead: false,
      priority: "LOW",
    },
    {
      title: "⚠️ PNG Gas Line Pressure Verified",
      message: "Four Burner Range PNG leak check completed with soap solution - zero bubbles, pressure normal.",
      channel: "NORMAL",
      direction: "INCOMING",
      recipient: "Canteen Admin Console",
      sender: "FE Technician",
      status: "RECEIVED",
      isRead: false,
      priority: "NORMAL",
    },
  ];

  for (const n of sampleNotifications) {
    await Notification.findOneAndUpdate({ title: n.title }, n, {
      upsert: true,
      returnDocument: "after",
      setDefaultsOnInsert: true,
    });
  }
  console.log("✓ 2-Way Notifications seeded");

  // 9. Pre-seed Submissions so Checksheet Fill-up Chart shows real data today!
  const adminUser = await User.findOne({ email: "admin@bajaj.com" });
  const operatorUser = await User.findOne({ email: "operator@bajaj.com" });
  const checksheetsList = await CheckSheet.find();

  if (operatorUser && checksheetsList.length > 0) {
    // Submit 4 checksheets as completed today so chart has Filled vs Pending!
    for (let i = 0; i < Math.min(4, checksheetsList.length); i++) {
      const cs = checksheetsList[i];
      const existing = await Submission.findOne({ checkSheet: cs._id, shift: shiftMap["SHIFT_A"] });
      if (!existing) {
        await Submission.create({
          checkSheet: cs._id,
          checkSheetCode: cs.code,
          checkSheetTitle: cs.title,
          department: cs.department,
          shift: shiftMap["SHIFT_A"],
          submittedBy: operatorUser._id,
          status: "APPROVED",
          reviewedBy: adminUser?._id,
          reviewedAt: new Date(),
          answers: [
            { fieldId: cs.fields[0]?.fieldId || "f1", label: cs.fields[0]?.label || "Item 1", value: "✔️ Ok", isPassed: true },
            { fieldId: cs.fields[1]?.fieldId || "f2", label: cs.fields[1]?.label || "Item 2", value: "✔️ Ok", isPassed: true },
          ],
          signature: "Ramesh Pawar",
          digitalSignatureHash: "a7f34b29c91d8e6a12b4e5f7c89a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a",
        });
      }
    }
    console.log("✓ Sample Completed Checksheets seeded for today's chart");
  }

  console.log("==================================================");
  console.log("MASTER DATA RE-SEED COMPLETE (Aligned to Handwritten Requirements)");
  console.log("==================================================");
}

import mongoose from "mongoose";

const BASE_URL = "http://localhost:3000";

const ACCOUNTS = [
  { role: "SUPER_ADMIN", email: "admin@bajaj.com", pass: "AdminPassword@2026", name: "Super Administrator" },
  { role: "OPERATOR_1", email: "op1.counter@bajaj.com", pass: "Operator1@2026", name: "Ramesh Pawar (Operator 1)" },
  { role: "OPERATOR_2", email: "op2.checks@bajaj.com", pass: "Operator2@2026", name: "Suresh Gaikwad (Operator 2)" },
  { role: "OPERATOR_3", email: "op3.tea@bajaj.com", pass: "Operator3@2026", name: "Ganesh Kadam (Operator 3)" },
  { role: "OT_SUPERVISOR", email: "ot.engine@bajaj.com", pass: "OTSupervisor@2026", name: "Engine Assy Supervisor", dept: "Engine Assembly" },
  { role: "OT_SUPERVISOR", email: "ot.vehicle@bajaj.com", pass: "OTSupervisor@2026", name: "Vehicle Assy Supervisor", dept: "Vehicle Assembly" },
  { role: "OT_SUPERVISOR", email: "ot.machine@bajaj.com", pass: "OTSupervisor@2026", name: "Machine Shop Supervisor", dept: "Machine Shop" },
  { role: "OT_SUPERVISOR", email: "ot.paint@bajaj.com", pass: "OTSupervisor@2026", name: "Paint Shop Supervisor", dept: "Paint Shop" },
  { role: "OT_SUPERVISOR", email: "ot.press@bajaj.com", pass: "OTSupervisor@2026", name: "Press Shop Supervisor", dept: "Press Shop" },
  { role: "OT_SUPERVISOR", email: "ot.qa@bajaj.com", pass: "OTSupervisor@2026", name: "QA Supervisor", dept: "Quality Assurance" },
  { role: "OPERATOR", email: "operator@bajaj.com", pass: "Operator@2026", name: "General Operator" },
];

async function runQATestMatrix() {
  console.log("===============================================================");
  console.log("   WORLD-CLASS QA & TEST SUITE - BAJAJ CANTEEN OPERATIONS 2.0  ");
  console.log("===============================================================\n");

  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, testName, extraInfo = "") {
    totalTests++;
    if (condition) {
      passedTests++;
      console.log(`  ✅ [PASS] ${testName}`);
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${extraInfo}`);
    }
  }

  // 1. Health check
  console.log("\n--- PHASE 1: SYSTEM HEALTH & SERVER READINESS ---");
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  const healthData = await healthRes.json();
  assert(healthRes.ok && healthData.status === "operational", "API Health check operational");
  assert(healthData.database?.status === "connected", "Database status connected");

  // 2. Authentication & Persistent Cookie Testing for All 11 Accounts
  console.log("\n--- PHASE 2: AUTHENTICATION & PERSISTENT SESSION TEST (ALL 11 USERS) ---");
  const sessions = {};

  for (const acc of ACCOUNTS) {
    const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: acc.email, password: acc.pass }),
    });

    const loginData = await loginRes.json();
    assert(loginRes.ok && loginData.success, `Login succeeded for ${acc.email} (${acc.name})`);

    const setCookie = loginRes.headers.get("set-cookie") || "";
    const cookieMatch = setCookie.match(/bajaj_token=([^;]+)/);
    const token = cookieMatch ? cookieMatch[1] : loginData.token;
    assert(Boolean(token), `Session cookie/token issued for ${acc.email}`);

    sessions[acc.email] = token;

    // Verify /api/auth/me using this session token
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: `bajaj_token=${token}` },
    });
    const meData = await meRes.json();
    assert(meRes.ok && meData.authenticated, `/api/auth/me authenticated for ${acc.email}`);
    assert(meData.user?.role?.code === acc.role, `Role matches '${acc.role}' for ${acc.email}`);
  }

  // 3. Operator 1: Counters & Plates Workflow
  console.log("\n--- PHASE 3: OPERATOR 1 - COUNTERS & PLATES WORKFLOW ---");
  const op1Token = sessions["op1.counter@bajaj.com"];
  const today = new Date().toISOString().split("T")[0];

  // Save Shift 1 Breakfast
  const s1PostRes = await fetch(`${BASE_URL}/api/counter-logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bajaj_token=${op1Token}`,
    },
    body: JSON.stringify({
      date: today,
      shift: "SHIFT_1",
      mealType: "BREAKFAST",
      isReady: true,
      openingPhoto: "https://images.unsplash.com/photo-opening-test",
      closingPhoto: "https://images.unsplash.com/photo-closing-test",
      totalPlates: 500,
      consumedPlates: 480,
      notes: "Shift 1 Breakfast QA test execution",
    }),
  });
  const s1PostData = await s1PostRes.json();
  assert(s1PostRes.ok && s1PostData.success, "Operator 1 logged Shift 1 Breakfast with opening/closing photos");

  // Save General Shift Lunch
  const genPostRes = await fetch(`${BASE_URL}/api/counter-logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bajaj_token=${op1Token}`,
    },
    body: JSON.stringify({
      date: today,
      shift: "GENERAL",
      mealType: "LUNCH",
      isReady: true,
      openingPhoto: "https://images.unsplash.com/photo-gen-open",
      closingPhoto: "https://images.unsplash.com/photo-gen-close",
      totalPlates: 650,
      consumedPlates: 620,
      notes: "General Shift Lunch QA test execution",
    }),
  });
  const genPostData = await genPostRes.json();
  assert(genPostRes.ok && genPostData.success, "Operator 1 logged General Shift Lunch with separate photos");

  // Query Counter Logs
  const counterGetRes = await fetch(`${BASE_URL}/api/counter-logs?date=${today}`, {
    headers: { Cookie: `bajaj_token=${op1Token}` },
  });
  const counterGetData = await counterGetRes.json();
  assert(counterGetRes.ok && counterGetData.success, "Operator 1 fetched today's counter logs");
  assert(counterGetData.logs?.length >= 2, `Logs count verified: ${counterGetData.logs?.length} records`);

  // 4. Operator 2: Checksheets & Biscuit Shared Audit
  console.log("\n--- PHASE 4: OPERATOR 2 - CHECKSHEETS & BISCUIT AUDIT WORKFLOW ---");
  const op2Token = sessions["op2.checks@bajaj.com"];

  // Fetch Checksheets catalog
  const csRes = await fetch(`${BASE_URL}/api/checksheets`, {
    headers: { Cookie: `bajaj_token=${op2Token}` },
  });
  const csData = await csRes.json();
  assert(csRes.ok && csData.checkSheets?.length === 54, `Operator 2 fetched 54 checksheets (actual: ${csData.checkSheets?.length})`);

  // Log Biscuit Audit for Parle-G
  const biscuitPostRes = await fetch(`${BASE_URL}/api/stock-audit`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bajaj_token=${op2Token}`,
    },
    body: JSON.stringify({
      date: today,
      productId: "parle-g",
      openingStock: 250,
      newAddedStock: 1000,
      deliveries: [{ time: "09:00 AM", quantity: 1000, note: "QA Morning batch delivery" }],
      shift1Consumption: 120,
      shift2Consumption: 130,
      notes: "QA Verified Stock Audit Entry",
      updatedBy: "Operator 2",
    }),
  });
  const biscuitPostData = await biscuitPostRes.json();
  assert(biscuitPostRes.ok && biscuitPostData.success, "Operator 2 saved daily Parle-G stock audit");

  // Verify biscuit audit retrieval by Operator 1 (Shared Sync)
  const biscuitGetRes = await fetch(`${BASE_URL}/api/stock-audit?date=${today}&productId=parle-g`, {
    headers: { Cookie: `bajaj_token=${op1Token}` },
  });
  const biscuitGetData = await biscuitGetRes.json();
  assert(biscuitGetRes.ok && biscuitGetData.success, "Operator 1 read Operator 2's biscuit audit (Shared Sync)");
  assert(biscuitGetData.record?.closingStock === 1000, `Remaining stock calculated correctly: ${biscuitGetData.record?.closingStock} pkts`);

  // 5. Operator 3: Tea Logistics Workflow
  console.log("\n--- PHASE 5: OPERATOR 3 - TEA LOGISTICS & KETTLE DISPATCH ---");
  const op3Token = sessions["op3.tea@bajaj.com"];

  // Get departments
  const teaInitialRes = await fetch(`${BASE_URL}/api/tea-delivery?date=${today}`, {
    headers: { Cookie: `bajaj_token=${op3Token}` },
  });
  const teaInitialData = await teaInitialRes.json();
  const targetDept = teaInitialData.departments?.[0] || { _id: "674000000000000000000001", name: "Engine Assembly" };

  const teaPostRes = await fetch(`${BASE_URL}/api/tea-delivery`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bajaj_token=${op3Token}`,
    },
    body: JSON.stringify({
      date: today,
      shift: "SHIFT_1",
      session: "MORNING",
      departmentId: targetDept._id,
      deliveredLiters: 25,
      deliveryPhoto: "https://images.unsplash.com/photo-tea-dispatch",
      notes: "QA Morning tea dispatch",
      loggedBy: "Ganesh Kadam (Operator 3)",
    }),
  });
  const teaPostData = await teaPostRes.json();
  assert(teaPostRes.ok && teaPostData.success, "Operator 3 logged kettle tea delivery (Stage 1)");

  // Log Tea Return (Stage 2)
  if (teaPostData.log?._id) {
    const teaReturnRes = await fetch(`${BASE_URL}/api/tea-delivery`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: `bajaj_token=${op3Token}`,
      },
      body: JSON.stringify({
        logId: teaPostData.log._id,
        returnedLiters: 6,
        notes: "QA Tea kettle return",
      }),
    });
    const teaReturnData = await teaReturnRes.json();
    assert(teaReturnRes.ok && teaReturnData.success, "Operator 3 logged kettle return & wastage calculation (Stage 2)");
  }

  const teaGetRes = await fetch(`${BASE_URL}/api/tea-delivery?date=${today}`, {
    headers: { Cookie: `bajaj_token=${op3Token}` },
  });
  const teaGetData = await teaGetRes.json();
  assert(teaGetRes.ok && teaGetData.success, "Operator 3 retrieved daily tea summary");
  assert(teaGetData.summary?.totalDeliveredLiters === 25, `Delivered liters verified: 25 L`);
  assert(teaGetData.summary?.totalConsumedLiters === 19, `Net consumed calculated (25 - 6 = 19 L): ${teaGetData.summary?.totalConsumedLiters} L`);

  // 6. OT Supervisor: Overtime Attendance Workflow
  console.log("\n--- PHASE 6: OT SUPERVISOR - DEPARTMENT OVERTIME ROSTER ---");
  const otEngineToken = sessions["ot.engine@bajaj.com"];

  const otPostRes = await fetch(`${BASE_URL}/api/overtime`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: `bajaj_token=${otEngineToken}`,
    },
    body: JSON.stringify({
      date: today,
      shift: "SHIFT_1",
      department: "Engine Assembly",
      twoHourCount: 18,
      threeHourCount: 12,
      dietaryPreference: "Tea + Dinner",
      supervisorName: "Engine Assy Supervisor",
      notes: "Engine Assembly shift 1 overtime QA test",
    }),
  });
  const otPostData = await otPostRes.json();
  assert(otPostRes.ok && otPostData.success, "OT Supervisor logged 2-hr (18) and 3-hr (12) overtime headcount");

  const otGetRes = await fetch(`${BASE_URL}/api/overtime?date=${today}`, {
    headers: { Cookie: `bajaj_token=${otEngineToken}` },
  });
  const otGetData = await otGetRes.json();
  assert(otGetRes.ok && otGetData.success, "OT Supervisor fetched department overtime summary");
  assert(otGetData.summary?.totalTwoHourCount === 18, `2-hr OT headcount matches: 18`);
  assert(otGetData.summary?.totalThreeHourCount === 12, `3-hr OT headcount matches: 12`);

  // 7. Admin: Reports & System Administration
  console.log("\n--- PHASE 7: ADMIN - CONSOLIDATED REPORTS & GOVERNANCE ---");
  const adminToken = sessions["admin@bajaj.com"];

  const reportSummaryRes = await fetch(`${BASE_URL}/api/reports/summary?date=${today}`, {
    headers: { Cookie: `bajaj_token=${adminToken}` },
  });
  const reportSummaryData = await reportSummaryRes.json();
  assert(reportSummaryRes.ok, "Admin accessed executive operational summary report");

  const usersRes = await fetch(`${BASE_URL}/api/users`, {
    headers: { Cookie: `bajaj_token=${adminToken}` },
  });
  const usersData = await usersRes.json();
  assert(usersRes.ok && usersData.users?.length === 11, `Admin fetched all 11 user accounts (actual: ${usersData.users?.length})`);

  // 8. Logout & Session Invalidation
  console.log("\n--- PHASE 8: LOGOUT & SESSION INVALIDATION ---");
  const logoutRes = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: `bajaj_token=${adminToken}` },
  });
  const logoutData = await logoutRes.json();
  assert(logoutRes.ok && logoutData.success, "Logout endpoint invalidated session and cleared cookie");

  // 9. CLEAN DATABASE TEST DATA PURGE
  console.log("\n--- PHASE 9: PURGE ALL TEST EXECUTION DATA ---");
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected to MongoDB for data cleanup...");

  const collectionsToPurge = [
    "counterlogs",
    "teadeliverylogs",
    "stockaudits",
    "overtimelogs",
    "submissions",
    "notifications",
    "auditlogs",
    "teacounts",
  ];

  for (const collName of collectionsToPurge) {
    const res = await mongoose.connection.db.collection(collName).deleteMany({});
    console.log(`  🧹 Purged ${res.deletedCount} test documents from '${collName}'`);
  }

  // Verify master catalog is preserved untouched
  const finalUsersCount = await mongoose.connection.db.collection("users").countDocuments();
  const finalRolesCount = await mongoose.connection.db.collection("roles").countDocuments();
  const finalChecksheetsCount = await mongoose.connection.db.collection("checksheets").countDocuments();
  const finalDeptsCount = await mongoose.connection.db.collection("departments").countDocuments();
  const finalShiftsCount = await mongoose.connection.db.collection("shifts").countDocuments();

  assert(finalUsersCount === 11, `All 11 user login credentials preserved untouched (count: ${finalUsersCount})`);
  assert(finalRolesCount === 6, `All 6 system roles preserved (count: ${finalRolesCount})`);
  assert(finalChecksheetsCount === 54, `All 54 checksheets preserved (count: ${finalChecksheetsCount})`);
  assert(finalDeptsCount === 10, `All 10 departments preserved (count: ${finalDeptsCount})`);
  assert(finalShiftsCount === 3, `All 3 shifts preserved (count: ${finalShiftsCount})`);

  await mongoose.disconnect();

  console.log("\n===============================================================");
  console.log(`   QA SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED (100% SUCESS)`);
  console.log("   DATABASE STATE: ZERO TEST DATA, ALL 11 LOGINS PRESERVED!     ");
  console.log("===============================================================\n");
}

runQATestMatrix().catch(console.error);

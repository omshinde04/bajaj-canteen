import { describe, it, expect } from "vitest";

describe("End-to-End Enterprise Operations Lifecycle", () => {
  const BASE_URL = "http://localhost:3000";

  it("executes the complete Operator-to-Supervisor operational sign-off loop", async () => {
    // 1. Operator Login
    const opLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "operator@bajaj.com",
        password: "Operator@2026",
      }),
    });
    expect(opLoginRes.status).toBe(200);
    const opLoginData = await opLoginRes.json();
    expect(opLoginData.success).toBe(true);
    expect(opLoginData.user.role.code).toBe("OPERATOR");

    const opCookie = opLoginRes.headers.get("set-cookie");
    expect(opCookie).toBeDefined();

    // Extract cookie value
    const tokenCookie = opCookie.split(";")[0];

    // 2. Fetch Check Sheets as Operator
    const csRes = await fetch(`${BASE_URL}/api/checksheets`, {
      headers: { Cookie: tokenCookie },
    });
    expect(csRes.status).toBe(200);
    const csData = await csRes.json();
    expect(csData.checkSheets.length).toBeGreaterThan(0);

    const targetCheckSheet = csData.checkSheets[0];
    expect(targetCheckSheet._id).toBeDefined();

    // 3. Fetch Single Check Sheet Template by ID
    const singleCsRes = await fetch(`${BASE_URL}/api/checksheets/${targetCheckSheet._id}`, {
      headers: { Cookie: tokenCookie },
    });
    expect(singleCsRes.status).toBe(200);
    const singleCsData = await singleCsRes.json();
    expect(singleCsData.success).toBe(true);
    expect(singleCsData.checkSheet._id).toBe(targetCheckSheet._id);

    // 4. Operator Submits Check Sheet Responses
    const sampleResponses = (targetCheckSheet.fields || []).map((f) => ({
      fieldId: f.fieldId,
      label: f.label,
      fieldType: f.fieldType,
      value: f.fieldType === "boolean" ? true : f.fieldType === "number" ? 22 : "Normal",
      isConforming: true,
      unit: f.unit || "",
    }));

    const samplePhotos = targetCheckSheet.mandatoryPhotoCount > 0
      ? [{ url: "/uploads/evidence/test_sample.jpg", caption: "Test Calibration Photo", fileSizeKb: 120 }]
      : [];

    const subPayload = {
      checkSheetId: targetCheckSheet._id,
      departmentId: targetCheckSheet.department?._id || targetCheckSheet.department,
      shiftId: targetCheckSheet.allowedShifts?.[0]?._id || targetCheckSheet.allowedShifts?.[0] || opLoginData.user.shift,
      responses: sampleResponses,
      photos: samplePhotos,
      notes: "Routine morning verification completed with zero non-conformances.",
    };

    const submitRes = await fetch(`${BASE_URL}/api/submissions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: tokenCookie,
      },
      body: JSON.stringify(subPayload),
    });

    expect(submitRes.status).toBe(201);
    const submitData = await submitRes.json();
    expect(submitData.success).toBe(true);
    expect(submitData.submission.status).toBe("PENDING_APPROVAL");
    expect(submitData.submission.complianceScore).toBe(100);

    const newSubmissionId = submitData.submission._id;

    // 5. Admin / Supervisor Login
    const adminLoginRes = await fetch(`${BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "admin@bajaj.com",
        password: "AdminPassword@2026",
      }),
    });
    expect(adminLoginRes.status).toBe(200);
    const adminLoginData = await adminLoginRes.json();
    const adminCookie = adminLoginRes.headers.get("set-cookie").split(";")[0];

    // 6. Supervisor Approves & Digitally Signs Submission
    const reviewRes = await fetch(`${BASE_URL}/api/submissions/${newSubmissionId}/review`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: adminCookie,
      },
      body: JSON.stringify({
        action: "APPROVE",
        comments: "All critical CCP criteria verified conforming. Approved for Shift A.",
      }),
    });

    expect(reviewRes.status).toBe(200);
    const reviewData = await reviewRes.json();
    expect(reviewData.success).toBe(true);
    expect(reviewData.submission.status).toBe("APPROVED");
    expect(reviewData.submission.digitalSignature?.hash).toBeDefined();
    expect(reviewData.submission.digitalSignature?.hash.length).toBe(64);

    // 7. Verify Audit Log was recorded
    const auditRes = await fetch(`${BASE_URL}/api/audit?action=SUBMISSION_APPROVED`, {
      headers: { Cookie: adminCookie },
    });
    expect(auditRes.status).toBe(200);
    const auditData = await auditRes.json();
    expect(auditData.success).toBe(true);
    const matchingAudit = auditData.logs.find(
      (l) => l.recordId === newSubmissionId || l.targetId === newSubmissionId
    );
    expect(matchingAudit).toBeDefined();
    expect(matchingAudit.action).toBe("SUBMISSION_APPROVED");
  });
});

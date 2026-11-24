import { NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/rbac";

export async function GET(req) {
  try {
    const auth = await authenticateRequest(req);
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { user } = auth;
    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id || user._id,
        employeeId: user.employeeId,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        assignedShift: user.assignedShift,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to retrieve user profile" },
      { status: 500 }
    );
  }
}

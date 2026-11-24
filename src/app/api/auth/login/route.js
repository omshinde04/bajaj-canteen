import { NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import Department from "@/models/Department";
import Shift from "@/models/Shift";
import { verifyPassword, signToken } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const clientIp =
      req.headers.get("x-forwarded-for") ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";

    // Rate Limiting / Brute Force Guard via Cache
    const rateLimitKey = `rate:login:${clientIp}:${email.toLowerCase()}`;
    const failedAttempts = (await cache.get(rateLimitKey)) || 0;

    if (failedAttempts >= 5) {
      await recordAuditLog({
        actorName: email,
        action: "SECURITY_ALERT",
        module: "Auth",
        metadata: { reason: "Rate limit exceeded (5 failed logins)" },
        req,
      });

      return NextResponse.json(
        { error: "Too many failed attempts. Account temporarily locked for 15 minutes." },
        { status: 429 }
      );
    }

    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() })
      .select("+password")
      .populate("role")
      .populate("department")
      .populate("assignedShift");

    if (!user || !user.isActive) {
      await cache.set(rateLimitKey, failedAttempts + 1, 900); // 15 mins TTL
      await recordAuditLog({
        actorName: email,
        action: "LOGIN_FAILED",
        module: "Auth",
        metadata: { reason: "User not found or inactive", email },
        req,
      });

      return NextResponse.json(
        { error: "Invalid credentials or account inactive" },
        { status: 401 }
      );
    }

    const isMatch = await verifyPassword(password, user.password);
    if (!isMatch) {
      await cache.set(rateLimitKey, failedAttempts + 1, 900);
      await recordAuditLog({
        actorId: user._id,
        actorName: user.name,
        action: "LOGIN_FAILED",
        module: "Auth",
        metadata: { email, attempts: failedAttempts + 1 },
        req,
      });

      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Reset failed attempts on successful login
    await cache.del(rateLimitKey);

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Create session token
    const tokenPayload = {
      userId: user._id.toString(),
      email: user.email,
      roleCode: user.role?.code,
    };
    const token = signToken(tokenPayload);

    // Cache user session
    const sessionCacheKey = `user:session:${user._id}`;
    const userSafe = {
      _id: user._id,
      id: user._id,
      employeeId: user.employeeId,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      assignedShift: user.assignedShift,
    };
    await cache.set(sessionCacheKey, userSafe, 300);

    // Record successful audit log
    await recordAuditLog({
      actorId: user._id,
      actorName: user.name,
      action: "LOGIN",
      module: "Auth",
      metadata: { role: user.role?.code, department: user.department?.code },
      req,
    });

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: userSafe,
      token,
    });

    // Set secure HTTP-only cookie
    response.cookies.set("bajaj_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 8 * 60 * 60, // 8 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { error: "Internal server error during authentication" },
      { status: 500 }
    );
  }
}

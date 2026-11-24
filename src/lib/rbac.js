import { NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import Role from "@/models/Role";
import cache from "@/lib/cache";

/**
 * Authenticates request, extracts current user, and checks permissions against cached Role.
 */
export async function authenticateRequest(req) {
  const token = extractToken(req);
  if (!token) {
    return { authenticated: false, error: "Authentication token missing", status: 401 };
  }

  const decoded = verifyToken(token);
  if (!decoded || !decoded.userId) {
    return { authenticated: false, error: "Invalid or expired session token", status: 401 };
  }

  // Check cache for user profile + permissions
  const cacheKey = `user:session:${decoded.userId}`;
  const cachedUser = await cache.get(cacheKey);

  if (cachedUser) {
    return { authenticated: true, user: cachedUser };
  }

  await connectDB();
  const user = await User.findById(decoded.userId)
    .populate("role")
    .populate("department")
    .populate("assignedShift")
    .lean();

  if (!user || !user.isActive) {
    return { authenticated: false, error: "Account inactive or not found", status: 403 };
  }

  // Cache user session for 5 minutes (300s)
  await cache.set(cacheKey, user, 300);

  return { authenticated: true, user };
}

/**
 * Route protection wrapper: checks if user has the required permission
 */
export function requirePermission(requiredPermission) {
  return (handler) => {
    return async (req, context = {}) => {
      const auth = await authenticateRequest(req);
      if (!auth.authenticated) {
        return NextResponse.json({ error: auth.error }, { status: auth.status });
      }

      const { user } = auth;
      const permissions = user.role?.permissions || [];

      // Super Admin role code bypasses all permission checks
      if (user.role?.code === "SUPER_ADMIN" || permissions.includes(requiredPermission)) {
        return handler(req, { ...context, user });
      }

      return NextResponse.json(
        {
          error: "Forbidden: You do not have permission to perform this action",
          requiredPermission,
          userRole: user.role?.name,
        },
        { status: 403 }
      );
    };
  };
}

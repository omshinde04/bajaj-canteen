import { NextResponse } from "next/server";
import { extractToken, verifyToken } from "@/lib/auth";
import { recordAuditLog } from "@/lib/audit";
import cache from "@/lib/cache";

export async function POST(req) {
  try {
    const token = extractToken(req);
    if (token) {
      const decoded = verifyToken(token);
      if (decoded?.userId) {
        // Invalidate cached session
        await cache.del(`user:session:${decoded.userId}`);
        await recordAuditLog({
          actorId: decoded.userId,
          action: "LOGOUT",
          module: "Auth",
          req,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Successfully logged out",
    });

    // Clear cookie
    response.cookies.set("bajaj_token", "", {
      httpOnly: true,
      expires: new Date(0),
      path: "/",
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Error during logout" },
      { status: 500 }
    );
  }
}

import { describe, it, expect } from "vitest";
import { signToken, verifyToken } from "@/lib/auth";
import cache from "@/lib/cache";

describe("Phase 1 Production Flow Integration Suite", () => {
  it("simulates full login, token generation, caching, and role permission flow", async () => {
    // 1. Simulating Super Admin Payload
    const user = {
      userId: "64e0a7b4f1b2c3d4e5f6a7b8",
      email: "admin@bajaj.com",
      roleCode: "SUPER_ADMIN",
      permissions: [
        "view",
        "manage_users",
        "manage_checksheets",
        "manage_departments",
        "manage_shifts",
      ],
    };

    // 2. Token generation
    const token = signToken({
      userId: user.userId,
      email: user.email,
      roleCode: user.roleCode,
    });
    expect(token).toBeTruthy();

    // 3. Cache session
    const sessionKey = `user:session:${user.userId}`;
    await cache.set(sessionKey, user, 300);

    const cachedUser = await cache.get(sessionKey);
    expect(cachedUser).toEqual(user);
    expect(cachedUser.permissions).toContain("manage_checksheets");

    // 4. Token validation
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(user.userId);
    expect(decoded.roleCode).toBe("SUPER_ADMIN");

    // 5. Invalidate on logout
    await cache.del(sessionKey);
    const postLogout = await cache.get(sessionKey);
    expect(postLogout).toBeNull();
  });
});

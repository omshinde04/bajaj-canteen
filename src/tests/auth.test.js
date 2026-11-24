import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, signToken, verifyToken } from "@/lib/auth";

describe("Production Authentication & Cryptography Suite", () => {
  it("hashes password with salt and successfully verifies match", async () => {
    const rawPass = "SecureBajajPass#2026";
    const hashed = await hashPassword(rawPass);

    expect(hashed).not.toBe(rawPass);
    expect(hashed.startsWith("$2")).toBe(true); // bcrypt prefix

    const isMatch = await verifyPassword(rawPass, hashed);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword123", hashed);
    expect(isWrongMatch).toBe(false);
  });

  it("enforces minimum password length requirement", async () => {
    await expect(hashPassword("12345")).rejects.toThrow("Password must be at least 6 characters long");
  });

  it("signs and verifies JWT tokens with payload", () => {
    const payload = {
      userId: "64e0a7b4f1b2c3d4e5f6a7b8",
      roleCode: "SUPER_ADMIN",
      departmentCode: "BAKERY_L1",
    };

    const token = signToken(payload);
    expect(token).toBeTruthy();
    expect(typeof token).toBe("string");

    const decoded = verifyToken(token);
    expect(decoded.userId).toBe(payload.userId);
    expect(decoded.roleCode).toBe(payload.roleCode);
    expect(decoded.departmentCode).toBe(payload.departmentCode);
  });

  it("rejects tampered or malformed tokens", () => {
    const validToken = signToken({ user: "test" });
    const tampered = validToken.slice(0, -5) + "abcde";

    const result = verifyToken(tampered);
    expect(result).toBeNull();

    const emptyResult = verifyToken("invalid.token.string");
    expect(emptyResult).toBeNull();
  });
});

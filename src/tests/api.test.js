import { describe, it, expect } from "vitest";
import { z } from "zod";

describe("API Payloads & Validation Engine Test Suite", () => {
  it("validates login payload requirements correctly", () => {
    const loginSchema = z.object({
      email: z.string().email(),
      password: z.string().min(1),
    });

    const valid = loginSchema.safeParse({
      email: "admin@bajaj.com",
      password: "AdminPassword@2026",
    });
    expect(valid.success).toBe(true);

    const invalidEmail = loginSchema.safeParse({
      email: "not-an-email",
      password: "123",
    });
    expect(invalidEmail.success).toBe(false);
  });

  it("validates industrial shift timing format (HH:MM regex)", () => {
    const shiftSchema = z.object({
      name: z.string().min(2),
      code: z.string().toUpperCase(),
      startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
      endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/),
    });

    const validShift = shiftSchema.safeParse({
      name: "Shift A (Morning)",
      code: "SHIFT_A",
      startTime: "06:00",
      endTime: "14:00",
    });
    expect(validShift.success).toBe(true);

    const invalidShift = shiftSchema.safeParse({
      name: "Bad Shift",
      code: "SHIFT_BAD",
      startTime: "25:70", // Invalid hour and minute
      endTime: "14:00",
    });
    expect(invalidShift.success).toBe(false);
  });

  it("validates checksheet fields and mandatory photo constraints", () => {
    const checkSheetSchema = z.object({
      title: z.string().min(3),
      code: z.string(),
      frequency: z.enum(["per_shift", "daily", "weekly", "monthly"]),
      mandatoryPhotoCount: z.number().min(0),
      slaHours: z.number().min(1),
    });

    const validSheet = checkSheetSchema.safeParse({
      title: "Daily Oven Temperature & Hygiene Check",
      code: "CHK_OVEN_01",
      frequency: "daily",
      mandatoryPhotoCount: 2,
      slaHours: 4,
    });
    expect(validSheet.success).toBe(true);

    const invalidFrequency = checkSheetSchema.safeParse({
      title: "Test",
      code: "TEST_01",
      frequency: "hourly", // Not allowed
      mandatoryPhotoCount: -1, // Cannot be negative
      slaHours: 0,
    });
    expect(invalidFrequency.success).toBe(false);
  });
});

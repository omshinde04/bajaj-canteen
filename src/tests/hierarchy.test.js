import { describe, it, expect } from "vitest";

describe("Plant Hierarchy & Shift Roster Validation Tests", () => {
  it("validates shift time format HH:MM correctly", () => {
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/;

    expect(timeRegex.test("06:00")).toBe(true);
    expect(timeRegex.test("14:00")).toBe(true);
    expect(timeRegex.test("22:00")).toBe(true);
    expect(timeRegex.test("24:00")).toBe(false);
    expect(timeRegex.test("06:60")).toBe(false);
    expect(timeRegex.test("6:00")).toBe(false);
  });

  it("calculates shift operational duration in hours", () => {
    const parseTimeToMinutes = (t) => {
      const [h, m] = t.split(":").map(Number);
      return h * 60 + m;
    };

    const calculateDurationHours = (start, end) => {
      const startMin = parseTimeToMinutes(start);
      const endMin = parseTimeToMinutes(end);
      let diff = endMin - startMin;
      if (diff < 0) diff += 24 * 60; // Crosses midnight (e.g. 22:00 to 06:00)
      return diff / 60;
    };

    expect(calculateDurationHours("06:00", "14:00")).toBe(8);
    expect(calculateDurationHours("14:00", "22:00")).toBe(8);
    expect(calculateDurationHours("22:00", "06:00")).toBe(8);
  });

  it("formats and normalizes employee IDs to uppercase", () => {
    const normalizeEmployeeId = (id) => id.trim().toUpperCase();

    expect(normalizeEmployeeId("bajaj-140")).toBe("BAJAJ-140");
    expect(normalizeEmployeeId("  bajaj-001 ")).toBe("BAJAJ-001");
  });

  it("verifies system role deletion prevention safeguard", () => {
    const roles = [
      { name: "Super Admin", isSystemRole: true },
      { name: "Shift Supervisor", isSystemRole: true },
      { name: "Temporary Auditor", isSystemRole: false },
    ];

    const canDeleteRole = (role) => !role.isSystemRole;

    expect(canDeleteRole(roles[0])).toBe(false);
    expect(canDeleteRole(roles[1])).toBe(false);
    expect(canDeleteRole(roles[2])).toBe(true);
  });
});

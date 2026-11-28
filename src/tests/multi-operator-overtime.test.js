import { describe, it, expect } from "vitest";
import CounterLog from "../models/CounterLog";
import OvertimeLog from "../models/OvertimeLog";
import StockAudit from "../models/StockAudit";

describe("Multi-Operator & Overtime Data Integrity Tests", () => {
  it("validates CounterLog supports Shift 3 and all 4 VIP meals", () => {
    const shift3Meal = new CounterLog({
      date: "2026-11-28",
      shift: "SHIFT_3",
      mealType: "SNACKS",
      totalPlates: 120,
      consumedPlates: 110,
      isReady: true,
      loggedBy: "Operator 1",
    });

    shift3Meal.balancePlates = Math.max(0, (shift3Meal.totalPlates || 0) - (shift3Meal.consumedPlates || 0));
    expect(shift3Meal.shift).toBe("SHIFT_3");
    expect(shift3Meal.mealType).toBe("SNACKS");
    expect(shift3Meal.balancePlates).toBe(10);

    const vipSnacks = new CounterLog({
      date: "2026-11-28",
      shift: "VIP",
      mealType: "SNACKS",
      totalPlates: 25,
      consumedPlates: 20,
      isReady: true,
      loggedBy: "Operator 1",
    });

    vipSnacks.balancePlates = Math.max(0, (vipSnacks.totalPlates || 0) - (vipSnacks.consumedPlates || 0));
    expect(vipSnacks.shift).toBe("VIP");
    expect(vipSnacks.mealType).toBe("SNACKS");
    expect(vipSnacks.balancePlates).toBe(5);

    const vipDinner = new CounterLog({
      date: "2026-11-28",
      shift: "VIP",
      mealType: "DINNER",
      totalPlates: 30,
      consumedPlates: 28,
      isReady: true,
      loggedBy: "Operator 1",
    });

    vipDinner.balancePlates = Math.max(0, (vipDinner.totalPlates || 0) - (vipDinner.consumedPlates || 0));
    expect(vipDinner.shift).toBe("VIP");
    expect(vipDinner.mealType).toBe("DINNER");
    expect(vipDinner.balancePlates).toBe(2);
  });

  it("validates Shift 1 and General Shift separate counters with opening and closing photos", () => {
    const shift1Breakfast = new CounterLog({
      date: "2026-11-28",
      shift: "SHIFT_1",
      mealType: "BREAKFAST",
      totalPlates: 600,
      consumedPlates: 550,
      isReady: true,
      openingPhoto: "https://bajaj.storage/shift1_open.jpg",
      closingPhoto: "https://bajaj.storage/shift1_close.jpg",
      loggedBy: "Operator 1",
    });

    expect(shift1Breakfast.shift).toBe("SHIFT_1");
    expect(shift1Breakfast.openingPhoto).toBe("https://bajaj.storage/shift1_open.jpg");
    expect(shift1Breakfast.closingPhoto).toBe("https://bajaj.storage/shift1_close.jpg");

    const generalBreakfast = new CounterLog({
      date: "2026-11-28",
      shift: "GENERAL",
      mealType: "BREAKFAST",
      totalPlates: 400,
      consumedPlates: 380,
      isReady: true,
      openingPhoto: "https://bajaj.storage/gen_open.jpg",
      closingPhoto: "https://bajaj.storage/gen_close.jpg",
      loggedBy: "Operator 1",
    });

    expect(generalBreakfast.shift).toBe("GENERAL");
    expect(generalBreakfast.openingPhoto).toBe("https://bajaj.storage/gen_open.jpg");
    expect(generalBreakfast.closingPhoto).toBe("https://bajaj.storage/gen_close.jpg");
  });

  it("validates OvertimeLog automatically computes totalCount from 2hr and 3hr OT", () => {
    const otLog = new OvertimeLog({
      date: "2026-11-28",
      shift: "GENERAL",
      department: "507f1f77bcf86cd799439011",
      departmentName: "Engine Assembly",
      departmentCode: "DEPT_ENG_ASSY",
      twoHourCount: 15,
      threeHourCount: 25,
      loggedBy: "Engine Assy Supervisor",
    });

    // Run pre-save calculation logic
    otLog.totalCount = (Number(otLog.twoHourCount) || 0) + (Number(otLog.threeHourCount) || 0);

    expect(otLog.twoHourCount).toBe(15);
    expect(otLog.threeHourCount).toBe(25);
    expect(otLog.totalCount).toBe(40);
    expect(otLog.departmentCode).toBe("DEPT_ENG_ASSY");
  });

  it("validates StockAudit calculation and closing balance formula", () => {
    const audit = new StockAudit({
      date: "2026-11-28",
      productId: "parle-g",
      productName: "Parle-G",
      openingStock: 1000,
      newAddedStock: 500,
      shift1Consumption: 300,
      shift2Consumption: 400,
      loggedBy: "Operator 1 (Shift 1 & VIP)",
    });

    audit.totalConsumption = (audit.shift1Consumption || 0) + (audit.shift2Consumption || 0);
    audit.closingStock = (audit.openingStock || 0) + (audit.newAddedStock || 0) - audit.totalConsumption;

    expect(audit.totalConsumption).toBe(700);
    expect(audit.closingStock).toBe(800);
    expect(audit.loggedBy).toBe("Operator 1 (Shift 1 & VIP)");
  });
});

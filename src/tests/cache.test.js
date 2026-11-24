import { describe, it, expect, beforeEach } from "vitest";
import cache, { CacheService } from "@/lib/cache";

describe("Enterprise Cache Service Suite", () => {
  let testCache;

  beforeEach(() => {
    testCache = new CacheService();
  });

  it("stores and retrieves primitive and complex object values", async () => {
    await testCache.set("test:primitive", 12345, 60);
    const primVal = await testCache.get("test:primitive");
    expect(primVal).toBe(12345);

    const userObj = { id: "USR-001", role: "Super Admin", dept: "Canteen Bakery" };
    await testCache.set("test:user", userObj, 60);
    const cachedUser = await testCache.get("test:user");
    expect(cachedUser).toEqual(userObj);
  });

  it("deletes single keys and pattern-matched keys", async () => {
    await testCache.set("shifts:shift_a", { name: "Shift A" }, 60);
    await testCache.set("shifts:shift_b", { name: "Shift B" }, 60);
    await testCache.set("users:user_1", { name: "Rajesh" }, 60);

    expect(await testCache.get("shifts:shift_a")).toBeTruthy();

    await testCache.del("shifts:shift_a");
    expect(await testCache.get("shifts:shift_a")).toBeNull();

    await testCache.delPattern("shifts:*");
    expect(await testCache.get("shifts:shift_b")).toBeNull();
    expect(await testCache.get("users:user_1")).toBeTruthy();
  });

  it("implements Cache-Aside ('remember') correctly", async () => {
    let databaseCalls = 0;
    const fetchFromDB = async () => {
      databaseCalls++;
      return { totalCheckSheets: 42 };
    };

    // First call: executes fetcher and populates cache
    const firstCall = await testCache.remember("kpi:summary", 60, fetchFromDB);
    expect(firstCall.totalCheckSheets).toBe(42);
    expect(databaseCalls).toBe(1);

    // Second call: serves directly from cache without hitting database
    const secondCall = await testCache.remember("kpi:summary", 60, fetchFromDB);
    expect(secondCall.totalCheckSheets).toBe(42);
    expect(databaseCalls).toBe(1);
  });

  it("reports healthy cache telemetry", () => {
    const health = testCache.health();
    expect(health).toHaveProperty("driver");
    expect(health).toHaveProperty("redisConfigured");
    expect(health).toHaveProperty("inMemoryKeyCount");
  });
});

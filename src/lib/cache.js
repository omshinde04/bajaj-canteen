import Redis from "ioredis";

/**
 * Enterprise Production Caching Service
 * Supports:
 * - Redis via ioredis with connection pooling & auto-reconnect
 * - In-Memory Fallback (TTL-aware) when Redis is unavailable or unconfigured
 * - Cache-Aside Pattern ('remember' method)
 * - Safe error boundaries (Never crashes the application if cache fails)
 */

class InMemoryStore {
  constructor() {
    this.store = new Map();
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  del(key) {
    this.store.delete(key);
  }

  delPattern(pattern) {
    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$");
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }

  clear() {
    this.store.clear();
  }
}

class CacheService {
  constructor() {
    this.driver = "memory";
    this.redisClient = null;
    this.memoryStore = new InMemoryStore();
    this.init();
  }

  init() {
    const redisUrl = process.env.REDIS_URL;

    if (redisUrl) {
      try {
        this.redisClient = new Redis(redisUrl, {
          lazyConnect: true,
          maxRetriesPerRequest: 2,
          connectTimeout: 5000,
          retryStrategy(times) {
            if (times > 3) return null; // stop reconnecting to avoid spam
            return Math.min(times * 100, 2000);
          },
        });

        this.redisClient.on("connect", () => {
          this.driver = "redis";
          console.log("Redis Cache: Connected successfully");
        });

        this.redisClient.on("error", (err) => {
          console.warn("Redis Cache Warning: Falling back to in-memory store. Error:", err.message);
          this.driver = "memory";
        });

        // Trigger connection asynchronously
        this.redisClient.connect().catch((e) => {
          console.warn("Redis initial connection failed; using in-memory cache:", e.message);
          this.driver = "memory";
        });
      } catch (err) {
        console.warn("Redis initialization failed; using in-memory cache:", err.message);
        this.driver = "memory";
      }
    } else {
      this.driver = "memory";
    }
  }

  /**
   * Get cached value by key
   */
  async get(key) {
    try {
      if (this.driver === "redis" && this.redisClient?.status === "ready") {
        const raw = await this.redisClient.get(key);
        return raw ? JSON.parse(raw) : null;
      }
    } catch (e) {
      console.warn(`Cache GET error on key "${key}", falling back to memory:`, e.message);
    }
    return this.memoryStore.get(key);
  }

  /**
   * Store value in cache with TTL in seconds (default 300s = 5m)
   */
  async set(key, value, ttlSeconds = 300) {
    try {
      if (this.driver === "redis" && this.redisClient?.status === "ready") {
        await this.redisClient.set(key, JSON.stringify(value), "EX", ttlSeconds);
      }
    } catch (e) {
      console.warn(`Cache SET error on key "${key}", storing in memory:`, e.message);
    }
    this.memoryStore.set(key, value, ttlSeconds);
  }

  /**
   * Delete key from cache
   */
  async del(key) {
    try {
      if (this.driver === "redis" && this.redisClient?.status === "ready") {
        await this.redisClient.del(key);
      }
    } catch (e) {
      console.warn(`Cache DEL error on key "${key}":`, e.message);
    }
    this.memoryStore.del(key);
  }

  /**
   * Invalidate all keys matching a glob pattern (e.g., "shifts:*")
   */
  async delPattern(pattern) {
    try {
      if (this.driver === "redis" && this.redisClient?.status === "ready") {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(...keys);
        }
      }
    } catch (e) {
      console.warn(`Cache delPattern error on pattern "${pattern}":`, e.message);
    }
    this.memoryStore.delPattern(pattern);
  }

  /**
   * Cache-Aside Pattern Helper:
   * Returns cached value if present; otherwise executes the fetcher function, caches the result, and returns it.
   */
  async remember(key, ttlSeconds, fetcherFn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }

    const freshData = await fetcherFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }

  /**
   * Health and telemetry check
   */
  health() {
    return {
      driver: this.driver,
      redisConfigured: Boolean(process.env.REDIS_URL),
      redisStatus: this.redisClient ? this.redisClient.status : "unconfigured",
      inMemoryKeyCount: this.memoryStore.store.size,
    };
  }
}

// Global cached singleton pattern to prevent multiple clients in Next.js hot reload
const globalCache = global.cacheService || new CacheService();
if (process.env.NODE_ENV !== "production") {
  global.cacheService = globalCache;
}

export default globalCache;
export { CacheService };

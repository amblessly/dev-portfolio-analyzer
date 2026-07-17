import { createClient, type RedisClientType } from "redis";

const globalForRedis = globalThis as unknown as {
  redis: RedisClientType | undefined;
};

export const redis =
  globalForRedis.redis ??
  (process.env.REDIS_URL
    ? createClient({ url: process.env.REDIS_URL })
    : null);

if (process.env.REDIS_URL && process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis ?? undefined;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  if (!redis) return null;
  const raw = await redis.get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds = 300,
): Promise<void> {
  if (!redis) return;
  await redis.set(key, JSON.stringify(value), { EX: ttlSeconds });
}

export async function rateLimit(
  key: string,
  limit: number,
  windowSeconds: number,
): Promise<{ success: boolean; remaining: number }> {
  if (!redis) return { success: true, remaining: limit };
  const current = await redis.incr(key);
  if (current === 1) {
    await redis.expire(key, windowSeconds);
  }
  return { success: current <= limit, remaining: Math.max(0, limit - current) };
}

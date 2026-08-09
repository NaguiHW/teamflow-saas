import "dotenv/config";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL ?? "redis://localhost:6379";

export const redis = createClient({ url: redisUrl });
redis.on("error", () => undefined);

export const checkRedis = async () => {
  try {
    if (!redis.isOpen) {
      await redis.connect();
    }
    await redis.ping();
    return { status: "ok" as const };
  } catch (error) {
    return {
      status: "error" as const,
      message: error instanceof Error ? error.message : "Redis check failed",
    };
  }
};

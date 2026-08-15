import type { FastifyReply, FastifyRequest } from "fastify";
import { redis } from "../db/redis.js";
import { ApiError } from "../errors.js";

export const rateLimit =
  (name: string, limit: number, windowSeconds: number) =>
  async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      if (!redis.isOpen) await redis.connect();
      const bucket = Math.floor(Date.now() / (windowSeconds * 1000));
      const key = `teamflow:rate-limit:${name}:${request.ip}:${bucket}`;
      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, windowSeconds);
      if (count > limit) {
        reply.header("Retry-After", String(windowSeconds));
        throw new ApiError(
          429,
          "RATE_LIMITED",
          "Too many requests. Try again later.",
        );
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        503,
        "RATE_LIMIT_UNAVAILABLE",
        "Sensitive operations are temporarily unavailable.",
      );
    }
  };

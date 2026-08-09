import type { TaskStatus } from "@teamflow/types";
import Fastify, { type FastifyInstance } from "fastify";
import { checkDatabase } from "./db/client.js";
import { checkRedis } from "./db/redis.js";

const supportedTaskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

const createApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    status: "ok",
    service: "api",
    supportedTaskStatuses,
  }));

  app.get("/health/dependencies", async (_request, reply) => {
    const [database, redis] = await Promise.all([
      checkDatabase(),
      checkRedis(),
    ]);
    const status =
      database.status === "ok" && redis.status === "ok" ? "ok" : "degraded";

    return reply.code(status === "ok" ? 200 : 503).send({
      status,
      service: "api",
      dependencies: { database, redis },
    });
  });

  return app;
};

export default createApp;

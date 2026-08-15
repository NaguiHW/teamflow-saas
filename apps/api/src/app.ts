import type { TaskStatus } from "@teamflow/types";
import cookie from "@fastify/cookie";
import Fastify, { type FastifyInstance } from "fastify";
import { checkDatabase } from "./db/client.js";
import { checkRedis } from "./db/redis.js";
import { ApiError } from "./errors.js";
import authRoutes from "./auth/routes.js";
import organizationRoutes from "./organizations/routes.js";
import projectRoutes from "./projects/routes.js";
import taskRoutes from "./tasks/routes.js";

const supportedTaskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

const createApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });
  void app.register(cookie);

  app.setErrorHandler((error, request, reply) => {
    const errorName = error instanceof Error ? error.name : "";
    const apiError =
      error instanceof ApiError
        ? error
        : errorName === "ZodError"
          ? new ApiError(400, "VALIDATION_ERROR", "Request validation failed.")
          : new ApiError(
              500,
              "INTERNAL_ERROR",
              "An unexpected error occurred.",
            );
    if (apiError.statusCode >= 500) request.log.error(error);
    return reply.code(apiError.statusCode).send({
      error: {
        code: apiError.code,
        message: apiError.message,
        requestId: request.id,
      },
    });
  });

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

  void app.register(authRoutes);
  void app.register(organizationRoutes);
  void app.register(projectRoutes);
  void app.register(taskRoutes);

  return app;
};

export default createApp;

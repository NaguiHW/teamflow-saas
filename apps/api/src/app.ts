import type { TaskStatus } from "@teamflow/types";
import cookie from "@fastify/cookie";
import Fastify, { type FastifyInstance } from "fastify";
import * as Sentry from "@sentry/node";
import { checkDatabase } from "./db/client.js";
import { checkRedis } from "./db/redis.js";
import { ApiError } from "./errors.js";
import authRoutes from "./auth/routes.js";
import organizationRoutes from "./organizations/routes.js";
import projectRoutes from "./projects/routes.js";
import taskRoutes from "./tasks/routes.js";
import { getMetrics, recordRequest } from "./observability/metrics.js";

const supportedTaskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV ?? "development",
    tracesSampleRate: 0.1,
  });
}

const createApp = (): FastifyInstance => {
  const app = Fastify({ logger: true, requestIdHeader: "x-request-id" });
  void app.register(cookie);

  app.addHook("onRequest", async (request, reply) => {
    reply.header("x-request-id", request.id);
  });

  app.addHook("onResponse", async (request, reply) => {
    recordRequest({
      method: request.method,
      route: request.routeOptions.url ?? request.url.split("?")[0],
      statusCode: reply.statusCode,
      durationMs: reply.elapsedTime,
    });
  });

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
    if (apiError.statusCode >= 500) {
      request.log.error(error);
      Sentry.captureException(error, { tags: { requestId: request.id } });
    }
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

  app.get("/health/metrics", async () => ({
    status: "ok",
    service: "api",
    metrics: getMetrics(),
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

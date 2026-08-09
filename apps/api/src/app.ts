import type { TaskStatus } from "@teamflow/types";
import Fastify, { type FastifyInstance } from "fastify";

const supportedTaskStatuses: TaskStatus[] = ["todo", "in_progress", "done"];

const createApp = (): FastifyInstance => {
  const app = Fastify({ logger: true });

  app.get("/health", async () => ({
    status: "ok",
    service: "api",
    supportedTaskStatuses,
  }));

  return app;
};

export default createApp;

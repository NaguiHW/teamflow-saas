import createApp from "./app.js";
import { sql } from "./db/client.js";
import { redis } from "./db/redis.js";

const port = Number(process.env.API_PORT ?? 4000);
const host = process.env.API_HOST ?? "127.0.0.1";
const app = createApp();

try {
  await app.listen({ host, port });
} catch (error) {
  app.log.error(error);
  await redis.quit().catch(() => undefined);
  await sql.end();
  process.exit(1);
}

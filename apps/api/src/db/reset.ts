import { sql } from "drizzle-orm";
import { db, sql as client } from "./client.js";

await db.execute(sql`drop schema if exists drizzle cascade`);
await db.execute(sql`drop schema if exists public cascade`);
await db.execute(sql`create schema public`);
await client.end();

console.log(
  "Reset the local database. Run db:migrate and db:seed to restore it.",
);

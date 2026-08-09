import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const databaseUrl =
  process.env.DATABASE_URL ??
  "postgres://teamflow:teamflow@localhost:5432/teamflow";

export const sql = postgres(databaseUrl, { max: 5 });
export const db = drizzle(sql);

export const checkDatabase = async () => {
  try {
    await sql`select 1`;
    return { status: "ok" as const };
  } catch (error) {
    return {
      status: "error" as const,
      message: error instanceof Error ? error.message : "Database check failed",
    };
  }
};

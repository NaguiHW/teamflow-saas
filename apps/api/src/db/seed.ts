import { sql } from "drizzle-orm";
import { db, sql as client } from "./client.js";
import { appMetadata } from "./schema.js";

await db
  .insert(appMetadata)
  .values({ key: "environment", value: "local" })
  .onConflictDoUpdate({
    target: appMetadata.key,
    set: { value: "local", updatedAt: sql`now()` },
  });

console.log("Seeded local application metadata.");
await client.end();

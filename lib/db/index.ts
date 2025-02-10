import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

let db: PostgresJsDatabase<typeof schema>;

function getDb() {
  if (!db) {
    db = drizzle(process.env.DATABASE_URL!, { schema });
  }
  return db;
}

export { getDb };

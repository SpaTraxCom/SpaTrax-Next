import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

let db: PostgresJsDatabase;

function getDb() {
  if (!db) {
    db = drizzle(process.env.DATABASE_URL!);
  }
  return db;
}

export { getDb };

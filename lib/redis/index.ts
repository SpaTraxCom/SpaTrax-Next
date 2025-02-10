import "dotenv/config";
import type { RedisClientType } from "@redis/client";
import { createClient } from "redis";

/**
 USERS: "users:{{ CLERK ID }}" -> Gets user based off of Clerk ID
 TEAMS: "team:{{ establishmentTable.id }}" -> Gets team based off of establishment ID
 LOGS: "logs:{{ establishmentTable.id }}" -> Gets recent logs based off of establishment ID
*/

let client: RedisClientType;

async function getClient() {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL || "redis://localhost:6379",
    });
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();
  }
  return client;
}

export { getClient };

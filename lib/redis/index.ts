import type { RedisClientType } from "@redis/client";
import { createClient } from "redis";

let client: RedisClientType;

async function getClient() {
  if (!client) {
    client = createClient();
    client.on("error", (err) => console.log("Redis Client Error", err));
    await client.connect();
  }
  return client;
}

export { getClient };

"use server";

import { eq, InferSelectModel } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { getDb } from "@/lib/db";
import { getClient } from "@/lib/redis";
import { usersTable } from "@/lib/db/schema";

export async function getUserAction(): Promise<
  InferSelectModel<typeof usersTable> | undefined
> {
  const { userId } = await auth();
  const db = await getDb();
  const redis = await getClient();

  try {
    // Attempt to grab user from Redis
    const rUser = await redis.get(`users:${userId}`);
    if (rUser) {
      return JSON.parse(rUser);
    }

    // Otherwise grab user from Database
    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId!));

    await redis.set(`users:${userId}`, JSON.stringify(users[0]));
    return users[0];
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

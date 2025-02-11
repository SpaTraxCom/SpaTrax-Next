"use server";

import { revalidatePath } from "next/cache";
import { and, desc, eq, gte, InferSelectModel, lte } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { getClient } from "@/lib/redis";
import { logsTable, usersTable } from "@/lib/db/schema";

import { getUserAction } from "@/app/(dashboard)/actions/users";
import { getEstablishmentAction } from "./establishments";

export async function getLogsAction(): Promise<
  | (InferSelectModel<typeof logsTable> & {
      user: InferSelectModel<typeof usersTable>;
    })[]
  | undefined
> {
  try {
    const user = await getUserAction();

    if (!user || !user.establishment_id) return [];

    const db = await getDb();
    const redis = await getClient();

    // Attempt to grab user from Redis
    const rLogs = await redis.get(`logs:${user.establishment_id}`);
    if (rLogs) {
      return JSON.parse(rLogs);
    }

    // Otherwise grab user from Database
    const logs = await db
      .select()
      .from(logsTable)
      .orderBy(desc(logsTable.performed_at))
      .innerJoin(usersTable, eq(logsTable.user_id, usersTable.id))
      .where(eq(logsTable.establishment_id, +user.establishment_id));

    const mappedLogs = logs.map((log) => {
      return {
        ...log.logs,
        user: { ...log.users },
      };
    });

    await redis.set(
      `logs:${user.establishment_id}`,
      JSON.stringify(mappedLogs)
    );
    return mappedLogs;
  } catch (e) {
    console.log(`[Error]: ${e}`);
  }
}

export async function searchLogsAction(search: {
  userId?: number;
  dateStart: Date;
  dateEnd: Date;
}) {
  try {
    const user = await getUserAction();
    let logs = [];

    if (!user || !user.establishment_id) return [];
    if (user.role === "employee" && user.id !== search.userId)
      throw new Error("Unauthorized");

    const db = await getDb();

    // TODO: Don't write this twice?
    if (search.userId && !isNaN(search.userId)) {
      logs = await db
        .select()
        .from(logsTable)
        .orderBy(desc(logsTable.performed_at))
        .innerJoin(usersTable, eq(logsTable.user_id, usersTable.id))
        .where(
          and(
            eq(logsTable.establishment_id, +user.establishment_id),
            eq(logsTable.user_id, search.userId),
            gte(logsTable.performed_at, search.dateStart),
            lte(logsTable.performed_at, search.dateEnd)
          )
        );
    } else {
      logs = await db
        .select()
        .from(logsTable)
        .orderBy(desc(logsTable.performed_at))
        .innerJoin(usersTable, eq(logsTable.user_id, usersTable.id))
        .where(
          and(
            eq(logsTable.establishment_id, +user.establishment_id),
            gte(logsTable.performed_at, search.dateStart),
            lte(logsTable.performed_at, search.dateEnd)
          )
        );
    }

    const mappedLogs = logs.map((log) => {
      return {
        ...log.logs,
        user: { ...log.users },
      };
    });

    return mappedLogs;
  } catch (e) {
    console.log(`[Error]: ${e}`);
  }
}

export async function createLogAction(log: {
  performed_at: Date;
  chair: number;
  user_id: number;
  presets: string[];
}): Promise<InferSelectModel<typeof logsTable> | undefined> {
  try {
    const user = await getUserAction();

    if (!user) throw new Error("Unauthorized");
    if (user.role === "employee" && user.id !== log.user_id)
      throw new Error("Unauthorized");
    if (!user.esignature) throw new Error("User esignature is required");

    const establishment = await getEstablishmentAction(user);

    if (!establishment) throw new Error("Unauthorized");

    const db = await getDb();
    const redis = await getClient();

    // Create the cleaning log
    const createdLogs = await db
      .insert(logsTable)
      .values({
        performed_at: log.performed_at,
        chair: log.chair.toString(),
        esignature: user.esignature,
        user_id: log.user_id,
        establishment_id: establishment.id,
        presets: log.presets,
      })
      .returning();

    // Get the user object from the created log
    const logUsers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, log.user_id));

    const mappedLogs = createdLogs.map((log) => {
      return {
        ...log,
        user: { ...logUsers[0] },
      };
    });

    // Add to Redis
    const rLogs = await redis.get(`logs:${user.establishment_id}`);
    if (rLogs) {
      const parsedRLogs = JSON.parse(rLogs) as InferSelectModel<
        typeof logsTable
      > &
        { user: InferSelectModel<typeof usersTable> }[];
      // We only store the 10 most recent logs in Redis
      if (parsedRLogs.length >= 10) {
        parsedRLogs.shift();
      }

      parsedRLogs.push(mappedLogs[0]);
      await redis.set(`logs:${establishment.id}`, JSON.stringify(parsedRLogs));
    } else {
      await redis.set(
        `logs:${user.establishment_id}`,
        JSON.stringify(mappedLogs)
      );
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/logs");

    return createdLogs[0];
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return undefined;
  }
}

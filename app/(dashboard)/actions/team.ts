"use server";

import { eq, InferSelectModel } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { getClient } from "@/lib/redis";
import { usersTable } from "@/lib/db/schema";

import { getUserAction } from "@/app/(dashboard)/actions/users";
import { revalidatePath } from "next/cache";

export async function getTeamAction(): Promise<
  InferSelectModel<typeof usersTable>[] | undefined
> {
  const user = await getUserAction();

  if (!user || !user.establishment_id) return [];

  const db = await getDb();
  const redis = await getClient();

  try {
    // Attempt to grab team from Redis
    const rTeam = await redis.get(`team:${user.establishment_id}`);
    if (rTeam) {
      return JSON.parse(rTeam);
    }

    // Otherwise grab team from Database
    const team = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.establishment_id, +user.establishment_id));

    await redis.set(`team:${user.establishment_id}`, JSON.stringify(team));
    return team;
  } catch (e) {
    console.log(e);
  }
}

export async function getTeamMemberAction(id: number) {
  const user = await getUserAction();

  if (!user || !user.establishment_id) return [];

  const db = await getDb();
  const redis = await getClient();

  try {
    // Attempt to grab team member from Redis
    const rTeam = await redis.get(`team:${user.establishment_id}`);
    if (rTeam) {
      const parsedTeam = JSON.parse(rTeam);

      const member = parsedTeam.find((member: any) => member.id === id);

      if (member) return member;
    }

    // Otherwise grab user from Database
    const team = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));

    return team;
  } catch (e) {
    console.log(e);
  }
}

export async function createTeamMemberAction(member: {
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "manager";
  chair?: number;
}): Promise<InferSelectModel<typeof usersTable> | undefined> {
  try {
    const user = await getUserAction();

    if (!user || !user.establishment_id || user.role === "employee")
      throw new Error("Unauthorized");

    const db = await getDb();
    const redis = await getClient();

    const preMembers = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.email, member.email));

    if (preMembers.length) throw new Error("User with email already exists");

    // TODO: Field Validation

    const createdMembers = await db
      .insert(usersTable)
      .values({
        first_name: member.firstName,
        last_name: member.lastName,
        email: member.email,
        role: member.role,
        default_chair: member.chair?.toString(),
        establishment_id: user.establishment_id,
      })
      .returning();

    // Set in Redis
    await redis.set(
      `users:${createdMembers[0].id}`,
      JSON.stringify(createdMembers[0])
    );
    const rTeam = await redis.get(`team:${user.establishment_id}`);
    if (rTeam) {
      const parsedRTeam = JSON.parse(rTeam) as any[];
      if (parsedRTeam.length) {
        parsedRTeam.push(createdMembers[0]);
      }
      await redis.set(
        `team:${user.establishment_id}`,
        JSON.stringify(parsedRTeam)
      );
    }

    return createdMembers[0];
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function editTeamMemberAction(member: {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  role: "employee" | "manager" | "admin";
  chair: string;
  esignature?: string;
}) {
  const db = await getDb();
  const redis = await getClient();

  try {
    const user = await getUserAction();
    if (!user || user.role === "employee") throw new Error("Unauthorized");

    const updatedMember = await db
      .update(usersTable)
      .set({
        first_name: member.firstName,
        last_name: member.lastName,
        email: member.email,
        role: member.role,
        default_chair: member.chair,
        esignature: member.esignature,
      })
      .where(eq(usersTable.id, member.id))
      .returning();

    // Update in Redis
    redis.set(
      `users:${updatedMember[0].clerk_id}`,
      JSON.stringify(updatedMember[0])
    );

    // Update Redis "team:"
    const rTeam = await redis.get(`team:${updatedMember[0].establishment_id}`);
    if (rTeam) {
      const team: any[] = JSON.parse(rTeam);

      const index = team.findIndex((m: any) => m.id === updatedMember[0].id);

      if (index !== -1) {
        team[index] = updatedMember[0];
      }

      await redis.set(
        `team:${updatedMember[0].establishment_id}`,
        JSON.stringify(team)
      );
    }

    revalidatePath("/dashboard");

    return updatedMember;
  } catch (e) {
    console.log(e);
  }
}

export async function editTeamMemberSignatureAction({
  id,
  esignature,
}: {
  id: number;
  esignature: string;
}) {
  const db = await getDb();
  const redis = await getClient();

  try {
    const user = await getUserAction();
    if (!user || (user.role === "employee" && user.id !== id))
      throw new Error("Unauthorized");

    const updatedMember = await db
      .update(usersTable)
      .set({
        esignature,
      })
      .where(eq(usersTable.id, id))
      .returning();

    // Update in Redis
    redis.set(
      `users:${updatedMember[0].clerk_id}`,
      JSON.stringify(updatedMember[0])
    );

    // Update Redis "team:"
    const rTeam = await redis.get(`team:${updatedMember[0].establishment_id}`);
    if (rTeam) {
      const team: any[] = JSON.parse(rTeam);

      const index = team.findIndex((m: any) => m.id === updatedMember[0].id);

      if (index !== -1) {
        team[index] = updatedMember[0];
      }

      await redis.set(
        `team:${updatedMember[0].establishment_id}`,
        JSON.stringify(team)
      );
    }

    revalidatePath("/dashboard");

    return updatedMember;
  } catch (e) {
    console.log(e);
  }
}

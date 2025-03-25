"use server";

import { eq, InferSelectModel } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";

import { getDb } from "@/lib/db";
import { getClient } from "@/lib/redis";
import { establishmentsTable, usersTable } from "@/lib/db/schema";

import { getUserAction } from "@/app/(dashboard)/actions/users";

export async function getEstablishmentAction(
  preUser?: InferSelectModel<typeof usersTable>
): Promise<InferSelectModel<typeof establishmentsTable> | undefined> {
  let user = preUser;

  try {
    if (!user) user = await getUserAction();
    if (!user) throw new Error("You must be logged in to perform this action.");
    if (!user.establishment_id)
      throw new Error("You are not associated with an establishment.");
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return;
  }

  const db = await getDb();
  const redis = await getClient();

  try {
    // Attempt to grab establishment from Redis
    const rEstablishment = await redis.get(
      `establishments:${user.establishment_id}`
    );
    if (rEstablishment) {
      return JSON.parse(rEstablishment);
    }

    // Otherwise grab establishment from Database
    const establishments = await db
      .select()
      .from(establishmentsTable)
      .where(eq(establishmentsTable.id, user.establishment_id));

    // Set in Redis
    await redis.set(
      `establishments:${user.establishment_id}`,
      JSON.stringify(establishments[0])
    );
    return establishments[0];
  } catch (e) {
    console.log(e);
    return;
  }
}

export async function createEstablishmentAction(establishment: {
  name: string;
  address: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  chairs: number;
  presets: string[];
}) {
  try {
    // Make sure user is logged in and is not associated
    // with an establishment already
    const { userId } = await auth();
    if (!userId)
      throw new Error("You must be logged in to perform this action.");
    const db = await getDb();
    const redis = await getClient();

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId));

    if (users[0].establishment_id)
      throw new Error("Already a part of an establishment.");

    // Field Validation
    if (establishment.name.length < 2)
      throw new Error("Establishment name must be atleast 2 characters.");
    if (establishment.name.length > 255)
      throw new Error("Establishment name must be less than 256 characters");
    if (establishment.address.length < 2)
      throw new Error("Establishment address must be atleast 2 characters.");
    if (establishment.address.length > 255)
      throw new Error("Establishment address must be less than 256 characters");
    if (establishment.city.length < 2)
      throw new Error("Establishment city must be atleast 2 characters.");
    if (establishment.city.length > 255)
      throw new Error("Establishment city must be less than 256 characters");
    if (establishment.state.length < 2)
      throw new Error("Establishment state must be atleast 2 characters.");
    if (establishment.state.length > 255)
      throw new Error("Establishment state must be less than 256 characters");
    if (establishment.postal.length < 2)
      throw new Error("Establishment postal must be atleast 2 characters.");
    if (establishment.postal.length > 255)
      throw new Error("Establishment postal must be less than 256 characters");
    if (establishment.country.length < 2)
      throw new Error("Establishment country must be atleast 2 characters.");
    if (establishment.country.length > 255)
      throw new Error("Establishment country must be less than 256 characters");
    if (establishment.chairs < 1)
      throw new Error("Establishment chairs must be atleast 1.");
    if (establishment.chairs > 10000)
      throw new Error("Establishment chairs must be less than 10000.");

    // Create Establishment
    const createdEstablishment = await db
      .insert(establishmentsTable)
      .values({
        business_name: establishment.name,
        address: establishment.address,
        city: establishment.city,
        state: establishment.state,
        postal: establishment.postal,
        country: establishment.country,
        chairs: establishment.chairs,
      })
      .returning();

    // Update User
    const user = await db
      .update(usersTable)
      .set({
        establishment_id: createdEstablishment[0].id,
        role: "admin",
      })
      .where(eq(usersTable.clerk_id, userId))
      .returning();

    // Add to Redis
    redis.set(
      `establishments:${createdEstablishment[0].id}`,
      JSON.stringify(createdEstablishment[0])
    );

    // Update User in Redis
    await redis.set(`users:${user[0].clerk_id}`, JSON.stringify(user[0]));

    return createdEstablishment[0];
  } catch (e) {
    console.log(e);
  }
}

export async function editEstablishmentAction(establishment: {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  postal: string;
  country: string;
  chairs: number;
  presets: string[];
}) {
  try {
    const db = await getDb();
    const redis = await getClient();

    // Make sure user is admin of establishment
    const { userId } = await auth();
    if (!userId)
      throw new Error("You must be logged in to perform this action.");

    const users = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.clerk_id, userId));

    if (
      users[0].role !== "admin" ||
      users[0].establishment_id !== establishment.id
    )
      throw new Error("Unauthorized");

    // Field Validation
    if (establishment.name.length < 2)
      throw new Error("Establishment name must be atleast 2 characters.");
    if (establishment.name.length > 255)
      throw new Error("Establishment name must be less than 256 characters");
    if (establishment.address.length < 2)
      throw new Error("Establishment address must be atleast 2 characters.");
    if (establishment.address.length > 255)
      throw new Error("Establishment address must be less than 256 characters");
    if (establishment.city.length < 2)
      throw new Error("Establishment city must be atleast 2 characters.");
    if (establishment.city.length > 255)
      throw new Error("Establishment city must be less than 256 characters");
    if (establishment.state.length < 2)
      throw new Error("Establishment state must be atleast 2 characters.");
    if (establishment.state.length > 255)
      throw new Error("Establishment state must be less than 256 characters");
    if (establishment.postal.length < 2)
      throw new Error("Establishment postal must be atleast 2 characters.");
    if (establishment.postal.length > 255)
      throw new Error("Establishment postal must be less than 256 characters");
    if (establishment.country.length < 2)
      throw new Error("Establishment country must be atleast 2 characters.");
    if (establishment.country.length > 255)
      throw new Error("Establishment country must be less than 256 characters");
    if (establishment.chairs < 1)
      throw new Error("Establishment chairs must be atleast 1.");
    if (establishment.chairs > 10000)
      throw new Error("Establishment chairs must be less than 10000.");

    const updatedEstablishment = await db
      .update(establishmentsTable)
      .set({
        business_name: establishment.name,
        address: establishment.address,
        city: establishment.city,
        state: establishment.state,
        postal: establishment.postal,
        country: establishment.country,
        chairs: establishment.chairs,
        presets: establishment.presets,
      })
      .where(eq(establishmentsTable.id, establishment.id))
      .returning();

    // Update in Redis
    redis.set(
      `establishments:${updatedEstablishment[0].id}`,
      JSON.stringify(updatedEstablishment[0])
    );

    return updatedEstablishment;
  } catch (e) {
    console.log(`[Error]: ${e}`);
  }
}

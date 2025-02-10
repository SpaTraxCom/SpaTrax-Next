"use server";

import { Resend } from "resend";
import { eq, InferSelectModel } from "drizzle-orm";

import { getDb } from "@/lib/db";
import { invitesTable } from "@/lib/db/schema";
import { getUserAction } from "@/app/(dashboard)/actions/users";

import SpaTraxInviteUserEmail from "@/lib/email-templates/invite";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getInviteAction(
  inviteId: number
): Promise<InferSelectModel<typeof invitesTable> | undefined> {
  try {
    const db = await getDb();

    const invites = await db
      .select()
      .from(invitesTable)
      .where(eq(invitesTable.id, inviteId));

    return invites[0];
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function createInviteAction(
  inviteUserId: number,
  inviteUserEmail: string
): Promise<InferSelectModel<typeof invitesTable> | undefined> {
  const user = await getUserAction();

  if (!user || user.role === "employee" || !user.establishment_id)
    throw new Error("Unauthorized");

  const db = await getDb();

  try {
    const createdInvites = await db
      .insert(invitesTable)
      .values({
        user_id: inviteUserId,
        establishment_id: user.establishment_id,
        invite_email: inviteUserEmail,
      })
      .returning();

    return createdInvites[0];
  } catch (e) {
    console.log(e);
    return undefined;
  }
}

export async function sendInviteEmailAction(invite: {
  invitedFirstName: string;
  invitedLastName: string;
  invitedEmail: string;
  inviteId: number;
}) {
  const user = await getUserAction();

  if (!user || user.role === "employee" || !user.establishment_id)
    throw new Error("Unauthorized");

  const establishment = await getEstablishmentAction(user);

  if (!establishment) throw new Error("Unauthorized");

  try {
    const email = await resend.emails.send({
      from: "SpaTrax <noreply@spatrax.com>",
      to: invite.invitedEmail,
      subject: "Welcome to SpaTrax!",
      react: SpaTraxInviteUserEmail({
        username: invite.invitedFirstName
          ? `${invite.invitedFirstName} ${invite.invitedLastName}`
          : "User",
        invitedByUsername: user.first_name
          ? `${user.first_name} ${user.last_name}`
          : "Admin",
        invitedByEmail: user.email,
        teamName: establishment.business_name,
        inviteLink: `http://localhost:3000/sign-up?inviteId=${invite.inviteId}`,
      }),
    });

    return email;
  } catch (err) {
    console.log(err);
    return new Response("Error sending welcome email", { status: 500 });
  }
}

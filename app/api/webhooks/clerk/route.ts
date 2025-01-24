import "dotenv/config";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { UserJSON, WebhookEvent } from "@clerk/nextjs/server";
import { Resend } from "resend";

import { getDb } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const SIGNING_SECRET = process.env.CLERK_SIGNING_SECRET;

  if (!SIGNING_SECRET) {
    throw new Error(
      "Error: Please add SIGNING_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Create new Svix instance with secret
  const wh = new Webhook(SIGNING_SECRET);

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get DB instance
  const db = await getDb();

  // Get body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  let evt: WebhookEvent;

  // Verify payload with headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error: Could not verify webhook:", err);
    return new Response("Error: Verification error", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const data = evt.data as UserJSON;

    // Create user in database
    try {
      const user = await db.insert(usersTable).values({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        email: data.email_addresses[0].email_address,
      });
    } catch (err) {
      console.log(err);
      return new Response("Error creating user in database", { status: 500 });
    }

    // Send welcome email
    try {
      const email = await resend.emails.send({
        from: "SpaTrax <noreply@spatrax.com>",
        to: data.email_addresses[0].email_address,
        subject: "Welcome to SpaTrax!",
        html: "<p>Welcome to <strong>SpaTrax</strong>! Your go to solution for pedicure logging and more.</p>",
      });

      console.log(email);
    } catch (err) {
      console.log(err);
      return new Response("Error sending welcome email", { status: 500 });
    }
  }

  return new Response("Webhook received", { status: 200 });
}

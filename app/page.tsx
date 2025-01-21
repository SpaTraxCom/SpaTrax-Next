import { getClient } from "@/lib/redis/index";
import { getDb } from "@/lib/db";
import { usersTable } from "@/lib/db/schema";

export default async function Home() {
  const redis = await getClient();
  const db = await getDb();
  let users;

  async function getUsers() {
    try {
      const rUsers = await redis.get("users");
      if (rUsers) {
        console.log("Cache hit");
        users = JSON.parse(rUsers);
        return;
      }

      users = await db.select().from(usersTable);
      await redis.set("users", JSON.stringify(users));
    } catch (e) {
      console.log(e);
    }
  }

  await getUsers();
  console.log(users);

  return <div>Hello, world!</div>;
}

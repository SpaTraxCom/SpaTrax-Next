import Link from "next/link";

import { Button } from "@/components/ui/button";

import { getTeamAction } from "@/app/(dashboard)/actions/team";
import { getUserAction } from "@/app/(dashboard)/actions/users";
import { TeamTable } from "@/app/(dashboard)/dashboard/components/team-table";

export default async function TeamPage() {
  const user = await getUserAction();
  const team = await getTeamAction();

  if (!user || user.role === "employee") return <h1>Unauthorized</h1>;

  return (
    <div className="mt-8 space-y-4">
      <div className="flex justify-end">
        <Link href="/dashboard/team/create">
          <Button>Add User</Button>
        </Link>
      </div>
      <TeamTable team={team || []} />
    </div>
  );
}

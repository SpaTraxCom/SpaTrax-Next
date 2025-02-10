import { getTeamMemberAction } from "@/app/(dashboard)/actions/team";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

import UserForm from "@/app/(dashboard)/dashboard/components/user-form";

export default async function EditTeamMemberPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const id = (await params).id;

  if (!id) return <h1>User not found</h1>;

  const user = await getTeamMemberAction(+id);
  const establishment = await getEstablishmentAction();

  if (!establishment) return <h1>Error</h1>;

  return (
    <div>
      <UserForm establishment={establishment} user={user} />
    </div>
  );
}

import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";
import { getUserAction } from "@/app/(dashboard)/actions/users";

import CreateUserForm from "@/app/(dashboard)/dashboard/components/create-user-form";

export default async function CreateTeamMemberPage() {
  const user = await getUserAction();

  if (!user || user.role === "employee") return <h1>Unauthorized</h1>;

  const establishment = await getEstablishmentAction(user);

  if (!establishment) return <h1>Unauthorized</h1>;

  return (
    <div>
      <CreateUserForm establishment={establishment} />
    </div>
  );
}

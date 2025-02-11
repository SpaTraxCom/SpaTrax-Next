import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";
import { getUserAction } from "@/app/(dashboard)/actions/users";

import CreateUserForm from "@/app/(dashboard)/dashboard/components/create-user-form";

export default async function CreateTeamMemberPage() {
  let user;
  let establishment;

  try {
    user = await getUserAction();
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return <h1>Error</h1>;
  }

  if (!user || user.role === "employee") return <h1>Unauthorized</h1>;

  try {
    establishment = await getEstablishmentAction(user);
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return <h1>Error</h1>;
  }

  if (!establishment) return <h1>Unauthorized</h1>;

  return (
    <div>
      <CreateUserForm establishment={establishment} />
    </div>
  );
}

import { SettingsForm } from "@/app/(dashboard)/dashboard/components/settings-form";
import { getUserAction } from "@/app/(dashboard)/actions/users";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

export default async function SettingsPage() {
  let user;
  let establishment;

  try {
    user = await getUserAction();

    establishment = await getEstablishmentAction();
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return <h1>Error</h1>;
  }

  if (!user || user.role !== "admin") return <h1>Unauthorized</h1>;
  if (!establishment) return <h1>Unauthorized</h1>;

  return (
    <div className="mt-8">
      <SettingsForm establishment={establishment} />
    </div>
  );
}

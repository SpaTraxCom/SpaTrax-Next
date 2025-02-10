import { SettingsForm } from "@/app/(dashboard)/dashboard/components/settings-form";
import { getUserAction } from "@/app/(dashboard)/actions/users";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

export default async function SettingsPage() {
  const user = await getUserAction();

  if (!user || user.role !== "admin") return <h1>Unauthorized</h1>;

  const establishment = await getEstablishmentAction();

  if (!establishment) return <h1>Unauthorized</h1>;

  return (
    <div className="mt-8">
      <SettingsForm establishment={establishment} />
    </div>
  );
}

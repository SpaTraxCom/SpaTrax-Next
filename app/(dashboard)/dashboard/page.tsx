import Link from "next/link";
import { connection } from "next/server";

import { getUserAction } from "@/app/(dashboard)/actions/users";
import { getTeamAction } from "@/app/(dashboard)/actions/team";
import { getLogsAction } from "@/app/(dashboard)/actions/logs";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

import { Button } from "@/components/ui/button";
import CreateLogForm from "@/app/(dashboard)/dashboard/components/create-log-form";
import { LogsTable } from "@/app/(dashboard)/dashboard/components/logs-table";
import { InferSelectModel } from "drizzle-orm";
import { establishmentsTable, logsTable, usersTable } from "@/lib/db/schema";

export default async function Dashboard() {
  await connection();

  const date = new Date();
  let user;

  try {
    user = await getUserAction();
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return <h1>Error</h1>;
  }

  if (!user)
    return (
      <div>
        <h1>Unauthorized</h1>
      </div>
    );

  if (!user.establishment_id)
    return (
      <div className="mt-8">
        <Link href={"/dashboard/register"}>
          <Button>Add Establishment</Button>
        </Link>
      </div>
    );

  let team: InferSelectModel<typeof usersTable>[];
  let logs: (InferSelectModel<typeof logsTable> & {
    user: InferSelectModel<typeof usersTable>;
  })[];
  let establishment: InferSelectModel<typeof establishmentsTable>;

  try {
    // TODO: Make a function to get all this in one call?
    const teamPromise = getTeamAction();
    const logsPromise = getLogsAction();
    const establishmentPromise = getEstablishmentAction(user);

    const [vTeam, vLogs, vEstablishment] = await Promise.all([
      teamPromise,
      logsPromise,
      establishmentPromise,
    ]);

    if (!vTeam || !vLogs || !vEstablishment) return <h1>Error</h1>;

    team = vTeam;
    logs = vLogs;
    establishment = vEstablishment;
  } catch (e) {
    console.log(`[Error]: ${e}`);
    return <h1>Error</h1>;
  }

  return (
    <div className="mt-8">
      {/* Welcome Message */}
      <div>
        <h1 className="font-bold text-xl">
          Welcome,{" "}
          {user.first_name || user.last_name ? (
            <span className="text-primary">
              {`${user.first_name} ${user.last_name}`}
            </span>
          ) : (
            <span className="text-primary">{establishment?.business_name}</span>
          )}
          !
        </h1>
        <p className="text-muted-foreground text-sm">
          Today is{" "}
          {date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            weekday: "long",
          })}
        </p>
      </div>
      {/* Create Log / Today's Logs */}
      <div className="flex flex-col justify-between items-start gap-8 lg:flex-row">
        <CreateLogForm
          team={user.role !== "employee" ? team || [] : [user]}
          chairs={establishment?.chairs || 100}
          presets={establishment?.presets || []}
          technician={user}
        />
        <div className="w-full flex flex-col items-end space-y-8">
          <LogsTable logs={logs} />
          <div className="space-x-4">
            {user.role !== "employee" && <Button disabled>Export</Button>}
            <Link href={"/dashboard/logs"}>
              <Button>View All</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

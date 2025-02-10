import { redirect } from "next/navigation";

import {
  getLogsAction,
  searchLogsAction,
} from "@/app/(dashboard)/actions/logs";
import { getUserAction } from "@/app/(dashboard)/actions/users";
import { getTeamAction } from "@/app/(dashboard)/actions/team";
import { getEstablishmentAction } from "@/app/(dashboard)/actions/establishments";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { LogsTable } from "@/app/(dashboard)/dashboard/components/logs-table";
import ClientPDFViewer from "@/app/(dashboard)/dashboard/components/client-pdf-viewer";
import ClientLogsExport from "../components/client-logs-export";

export default async function LogsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const { userId, dateStart, dateEnd } = await searchParams;

  let startDate = new Date(Date.now()).setUTCHours(0, 0, 0, 0);
  let endDate = new Date(Date.now()).setUTCHours(23, 59, 59, 999);

  if (dateStart)
    startDate = new Date(dateStart as string).setUTCHours(0, 0, 0, 0);
  if (dateEnd)
    endDate = new Date(dateEnd as string).setUTCHours(23, 59, 59, 999);

  const user = await getUserAction();
  const establishment = await getEstablishmentAction();
  let logs;
  let team;

  if (!user) return <h1>Unauthorized</h1>;
  if (!establishment) return <h1>Error</h1>;

  if (user.role === "employee") {
    // Grab only users logs
    logs = await searchLogsAction({
      userId: user.id,
      dateStart: new Date(startDate),
      dateEnd: new Date(endDate),
    });

    team = [user];
  } else {
    // Grab all logs
    if (!userId && !dateStart && !dateEnd) {
      // If no search queries specified grab all
      logs = await getLogsAction();
    } else {
      // Otherwise use search queries
      logs = await searchLogsAction({
        userId: userId ? +userId : user.id,
        dateStart: new Date(startDate),
        dateEnd: new Date(endDate),
      });
    }

    // Grab team
    team = await getTeamAction();
  }

  if (!team) return <h1>An error has occured</h1>;

  async function searchLogs(formData: FormData) {
    "use server";

    const rawFormData = {
      startDate: formData.get("startDate"),
      endDate: formData.get("endDate"),
      technician: formData.get("technician"),
    };

    let query = "";

    if (rawFormData.technician) query += `userId=${rawFormData.technician}&`;
    if (rawFormData.startDate) query += `dateStart=${rawFormData.startDate}&`;
    if (rawFormData.endDate) query += `dateEnd=${rawFormData.endDate}&`;

    redirect(`/dashboard/logs?${query}`);
  }

  if (!logs) return <p>No logs found</p>;

  const csvData = [["Date", "Name", "Chair", "Cleaned"]];

  logs.forEach((log) => {
    csvData.push([
      `${new Date(log.performed_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })}`,
      `${log.user.first_name} ${log.user.last_name}`,
      log.chair.toString(),
      log.presets?.join(", ") || "",
    ]);
  });

  return (
    <div className="mt-8">
      <form
        action={searchLogs}
        className="flex flex-col gap-8 lg:flex-row lg:items-end"
      >
        <div className="flex flex-col gap-4 lg:flex-row">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              name="startDate"
              defaultValue={new Date(startDate).toISOString().slice(0, 10)}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              name="endDate"
              defaultValue={new Date(endDate).toISOString().slice(0, 10)}
            />
          </div>
          <div className="space-y-2">
            <Label>Technician</Label>
            <Select name="technician" defaultValue={userId as string}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select a technician" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {[
                    { id: "all", first_name: "All", last_name: "Technicians" },
                    ...team,
                  ].map((member) => {
                    return (
                      <SelectItem
                        key={member.id}
                        value={member.id.toString()}
                      >{`${member.first_name} ${member.last_name}`}</SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-x-4">
          <Button>Search</Button>
          {logs.length ? (
            <ClientLogsExport
              logs={csvData}
              fileName={`${establishment.business_name.replace(" ", "_")}-${new Date(Date.now()).toLocaleDateString()}`}
            />
          ) : null}
        </div>
      </form>

      <div className="mt-8">
        <LogsTable logs={logs} description="Cleaning logs." />
      </div>

      <div className="mt-8 hidden lg:block">
        <ClientPDFViewer
          establishment={establishment}
          dateStart={startDate.toString()}
          dateEnd={endDate.toString()}
          logs={logs}
        />
      </div>
    </div>
  );
}

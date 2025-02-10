import { InferSelectModel } from "drizzle-orm";
import { logsTable, usersTable } from "@/lib/db/schema";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Props {
  logs:
    | (InferSelectModel<typeof logsTable> & {
        user: InferSelectModel<typeof usersTable>;
      })[]
    | undefined;
  description?: string;
}

export function LogsTable(props: Props) {
  // TODO: Allow non-employees to select "All Members" in tech dropdown

  return (
    <Table>
      <TableCaption>
        {props.description || "Recent cleaning logs."}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date/Time</TableHead>
          <TableHead>Team Member</TableHead>
          <TableHead>Presets</TableHead>
          <TableHead className="text-right">Chair</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.logs?.reverse().map((log) => {
          return (
            <TableRow key={log.id}>
              <TableCell className="font-medium">
                {new Date(log.performed_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "numeric",
                  day: "numeric",
                  weekday: "long",
                  hour: "numeric",
                  minute: "numeric",
                })}
              </TableCell>
              <TableCell>
                {`${log.user.first_name} ${log.user.last_name}`}
              </TableCell>
              <TableCell>
                {log.presets?.join(", ").substring(0, 30)}
                {log.presets!.join(", ")!.length > 30 ? "..." : ""}
              </TableCell>
              <TableCell className="text-right">{log.chair}</TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}

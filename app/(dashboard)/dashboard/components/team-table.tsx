import { InferSelectModel } from "drizzle-orm";
import { usersTable } from "@/lib/db/schema";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";

interface Props {
  team: InferSelectModel<typeof usersTable>[];
}

export function TeamTable(props: Props) {
  return (
    <Table>
      <TableCaption>This is your team! Hi team 👋</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>First Name</TableHead>
          <TableHead>Last Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Chair</TableHead>
          <TableHead className="text-right">Role</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {props.team.map((member) => {
          return (
            <Link
              legacyBehavior={true}
              key={member.id}
              href={`/dashboard/team/${member.id}`}
            >
              <TableRow className="cursor-pointer">
                <TableCell>{member.first_name}</TableCell>
                <TableCell>{member.last_name}</TableCell>
                <TableCell>{member.email}</TableCell>
                <TableCell>{member.default_chair}</TableCell>
                <TableCell className="text-right">{member.role}</TableCell>
              </TableRow>
            </Link>
          );
        })}
      </TableBody>
    </Table>
  );
}

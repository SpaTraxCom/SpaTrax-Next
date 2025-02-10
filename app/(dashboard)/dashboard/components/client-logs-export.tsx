"use client";

import { Button } from "@/components/ui/button";
import { CSVLink } from "react-csv";

interface Props {
  logs: string[][];
  fileName: string;
}

export default function ClientLogsExport(props: Props) {
  return (
    <CSVLink data={props.logs} filename={props.fileName} target="_blank">
      <Button type="button">Export</Button>
    </CSVLink>
  );
}

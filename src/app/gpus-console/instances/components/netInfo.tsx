"use client";

import {
  Table,
  TableRow,
  TableBody,
  TableCell,
  TableHeader,
} from "@/components/ui/table";

export default function NetInfo({
  netInfoList,
}: {
  netInfoList: any[];
}) {
  const details = (
    <Table
      className="border border-solid border-[var(--border)]] min-w-[200px]"
      style={{ maxHeight: "300px", minWidth: "200px" }}
    >
      <TableHeader>
        <TableRow>
          <TableCell
            className="font-small-console-medium p-2"
            style={{ backgroundColor: "var(--gray-3)", color: "var(--dark-2)" }}
          >
            {"Size"}
          </TableCell>
          <TableCell
            className="font-small-console-medium p-2"
            style={{ backgroundColor: "var(--gray-3)", color: "var(--dark-2)" }}
          >
            {"Mount Path"}
          </TableCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {netInfoList.map((item: any, index: number) => (
          <TableRow key={index}>
          <TableCell
            className="font-small-console p-2"
            style={{ color: "var(--dark-2)" }}
          >
            {item.size} GB
          </TableCell>
          <TableCell
            className="font-small-console p-2"
            style={{ color: "var(--dark-1)" }}
          >
            {item.mountPath}
          </TableCell>
        </TableRow>
        ))}
      </TableBody>
    </Table>
  );

  return details;
}

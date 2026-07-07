"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableSpinner,
} from "@/components/ui/table";
import styles from "../page.module.scss";

type RowGroup = {
  startIndex: number;
  endIndex: number;
  rowspan: number;
};

interface MergedRowsTableProps {
  loading?: boolean;
  columns: any[];
  data: any[];
  cellRenderer: (row: any, column: any, index: number) => React.ReactNode;
}

const MergedRowsTable: React.FC<MergedRowsTableProps> = ({
  loading,
  columns,
  data,
  cellRenderer,
}) => {
  const [rowGroups, setRowGroups] = useState<RowGroup[]>([]);
  const [hoveredRowIndex, setHoveredRowIndex] = useState<number | null>(null);
  const tableBodyRef = useRef<HTMLTableSectionElement>(null);

  useEffect(() => {
    const groups: RowGroup[] = [];
    data.forEach((row, index) => {
      if (row.rowspan && row.rowspan > 1) {
        groups.push({
          startIndex: index,
          endIndex: index + row.rowspan - 1,
          rowspan: row.rowspan,
        });
      }
    });
    setRowGroups(groups);
  }, [data]);

  const getRowGroupForIndex = (index: number) => {
    return rowGroups.find(
      (group) => index >= group.startIndex && index <= group.endIndex,
    );
  };

  const shouldHighlightRow = (index: number) => {
    if (hoveredRowIndex === null) return false;

    const hoveredGroup = getRowGroupForIndex(hoveredRowIndex);
    if (!hoveredGroup) return index === hoveredRowIndex;

    return index >= hoveredGroup.startIndex && index <= hoveredGroup.endIndex;
  };

  return (
    <Table loading={loading} className={loading ? styles.table_loading : ""}>
      <TableHeader>
        <TableRow>
          {columns.map((column) => (
            <TableHead
              className={column.className || ""}
              key={column.accessorKey}
            >
              {column.header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody ref={tableBodyRef}>
        {data.map((row, rowIndex) => (
          <TableRow
            key={rowIndex}
            className={
              shouldHighlightRow(rowIndex) ? styles.hover_highlight : ""
            }
            onMouseEnter={() => setHoveredRowIndex(rowIndex)}
            onMouseLeave={() => setHoveredRowIndex(null)}
          >
            {columns.map((column, colIndex) => {
              return cellRenderer(row, column, colIndex);
            })}
          </TableRow>
        ))}
        {loading && <TableSpinner className={styles.table_spinner} />}
      </TableBody>
    </Table>
  );
};

export default MergedRowsTable;

"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { TableCell } from "@/components/ui/table";
import { NoData } from "@/components/ui/standard/no-data";
import StandardPagination from "@/components/ui/standard/pagination";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import IncreaseLimit from "./IncreaseLimit";
import QuotaDefinition from "./QuotaDefinition";
import MergedRowsTable from "./MergedRowsTable";
import { getQuotaList } from "@/api/quota";
import { SearchInput } from "@/components/ui/input";
import {
  makeMergedRowsTableData,
  sortQuotaList,
} from "@/lib/utils/quota-limits";
import styles from "../page.module.scss";

const PAGE_SIZE = 10;

export default function ImageQuotaLimits() {
  const [quotaList, setQuotaList] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");

  const canAdjustQuota = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.quota,
    resource: PERMISSION.RESOURCE.apply_adjust_quota,
    action: PERMISSION.ACTION.read,
  });

  const fetchQuotas = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const response = await getQuotaList({
        modal: "image",
        quotaObject: search || "",
      });
      setQuotaList(sortQuotaList(response.data || []));
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch quotas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotas();
  }, [fetchQuotas]);

  const displayQuotaList = useMemo(() => {
    const filteredQuotaList = quotaList.filter(
      (quota) =>
        !search ||
        quota.quotaObject.toLowerCase().includes(search.toLowerCase()),
    );
    setTotal(filteredQuotaList.length);
    const targetQuotaList = filteredQuotaList.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
    return makeMergedRowsTableData(targetQuotaList, PAGE_SIZE);
  }, [quotaList, currentPage, search]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "quotaObject",
        header: "Resource/Service",
        className: "min-w-[200px]",
        render: (row: Quota) => row.quotaObject,
      },
      {
        accessorKey: "quotaType",
        header: (
          <span>
            {"Limit/​Quota Metric"}
            <QuotaDefinition />
          </span>
        ),
        className: "min-w-[200px]",
        render: (row: Quota) => {
          return row.quotaType;
        },
      },
      {
        accessorKey: "currentQuota",
        header: "Current Limit",
        className: "min-w-[100px]",
        render: (row: Quota) => {
          return row.currentQuota;
        },
      },
      {
        accessorKey: "defaultQuota",
        header: "Default Limit",
        className: "min-w-[120px]",
        render: (row: Quota) => {
          return row.defaultQuota;
        },
      },
      {
        accessorKey: "productType",
        header: "Product Type",
        className: "min-w-[120px]",
        render: (row: Quota) => {
          return row.productType;
        },
      },
      {
        accessorKey: "limitAdjustable",
        header: "Limit Adjustable",
        className: "min-w-[150px]",
        render: (row: Quota) => {
          return row.adjustable ? "Adjustable" : "Not Adjustable";
        },
      },
      ...(canAdjustQuota
        ? [
            {
              accessorKey: "action",
              header: "​Actions",
              className: "min-w-[120px]",
              render: (row: Quota) => {
                if (row.adjustable) {
                  return <IncreaseLimit quotaInfo={row} />;
                }
                return <span className={styles.disabled}>Increase Limit</span>;
              },
            },
          ]
        : []),
    ],
    [canAdjustQuota],
  );

  const renderTableCell = useCallback((row: Quota, column: any) => {
    const accessorKey = column.accessorKey as keyof typeof row;
    let tableExtraObj = {};

    if (accessorKey === "quotaObject") {
      if (row.rowspan) {
        tableExtraObj = {
          rowSpan: row.rowspan,
        };
      } else {
        return null;
      }
    }

    return (
      <TableCell
        key={column.accessorKey}
        className={styles.table_cell}
        {...tableExtraObj}
      >
        {column.render ? column.render(row) : (row[accessorKey] as string)}
      </TableCell>
    );
  }, []);

  return (
    <div className={styles.content}>
      <div className="max-w-[450px] my-6">
        <SearchInput
          onSearch={(value) => {
            setLoading(true);
            setTimeout(() => {
              setLoading(false);
              setCurrentPage(1);
              setSearch(value.trim());
            }, 100);
          }}
          placeholder="Search service"
        />
      </div>

      <main className={styles.table_container}>
        <MergedRowsTable
          loading={loading}
          columns={columns}
          data={displayQuotaList}
          cellRenderer={renderTableCell}
        />
        {!loading && displayQuotaList.length === 0 && (
          <div className="min-h-[300px] flex flex-col justify-center items-center">
            <NoData />
          </div>
        )}
        {!loading && total !== 0 && (
          <StandardPagination
            className="mt-8"
            total={total}
            pageSize={PAGE_SIZE}
            defaultCurrent={currentPage}
            onChange={(page) => setCurrentPage(page)}
          />
        )}
      </main>
    </div>
  );
}

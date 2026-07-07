"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import Link from "next/link";
import { useAppSelector } from "@/store";
import { TableCell } from "@/components/ui/table";
import { NoData } from "@/components/ui/standard/no-data";
import StandardPagination from "@/components/ui/standard/pagination";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import IncreaseLimit from "./IncreaseLimit";
import QuotaDefinition from "./QuotaDefinition";
import EndpointTypeDefinition from "./EndpointTypeDefinition";
import LimitAdjustableDefinition from "./LimitAdjustableDefinition";
import TierQuotaInfo from "./TierQuotaInfo";
import MergedRowsTable from "./MergedRowsTable";
import { getQuotaList } from "@/api/quota";
import { SearchInput } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL, DOCS_URL } from "@/constants/urls";
import { TIER_CONDITION_INFO } from "@/constants/tier";
import {
  makeMergedRowsTableData,
  sortQuotaList,
} from "@/lib/utils/quota-limits";
import styles from "../page.module.scss";

const PAGE_SIZE = 10;

export default function LLMQuotaLimits() {
  const [quotaList, setQuotaList] = useState<Quota[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const userInfo = useAppSelector((state) => state.user) || {};
  const currentTier = userInfo.tier;

  const canAdjustQuota = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.quota,
    resource: PERMISSION.RESOURCE.apply_adjust_quota,
    action: PERMISSION.ACTION.read,
  });

  const fetchQuotas = useCallback(async (search?: string) => {
    setLoading(true);
    try {
      const response = await getQuotaList({
        modal: "llm",
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
        accessorKey: "productType",
        header: (
          <span>
            {"Endpoint Type"}
            <EndpointTypeDefinition />
          </span>
        ),
        className: "min-w-[120px]",
        render: (row: Quota) => {
          return row.productType;
        },
      },
      {
        accessorKey: "limitAdjustable",
        header: (
          <span>
            {"Limit Adjustable"}
            <LimitAdjustableDefinition />
          </span>
        ),
        className: "min-w-[150px]",
        render: (row: Quota) => {
          return row.adjustable ? "Adjustable" : "Not Adjustable";
        },
      },
      {
        accessorKey: "defaultQuota",
        header: "Limit by Tier",
        className: "min-w-[120px]",
        render: (row: Quota) => {
          return <TierQuotaInfo data={row.quotaItems} />;
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
      <div className="font-body" style={{ color: "var(--dark-1)" }}>
        {currentTier && (
          <>
            <span>Current Tier </span>
            <span className="font-bold ml-1">{`${currentTier} (${
              TIER_CONDITION_INFO[
                currentTier as keyof typeof TIER_CONDITION_INFO
              ] || ""
            })`}</span>
            <span>, </span>
          </>
        )}
        <Button
          asChild
          variant="link"
          className="p-0 ml-1"
          id={CLICK_BTN_IDs.QUOTA_LIMITS.LLM_TOPUP}
        >
          <Link href={NOVITA_URL.BILLING_PAYMENT}>Top Up</Link>
        </Button>
        <span className="ml-2">to unlock quota limits for higher tiers.</span>
        <span className="ml-2 mr-2">Learn more</span>
        <Button
          asChild
          variant="link"
          className="p-0"
          id={CLICK_BTN_IDs.QUOTA_LIMITS.LLM_RATE_LIMITS_DOCS}
        >
          <Link href={DOCS_URL.LLM_RATE_LIMITS} target="_blank">
            here
          </Link>
        </Button>
        <span className="ml-1">.</span>
      </div>

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

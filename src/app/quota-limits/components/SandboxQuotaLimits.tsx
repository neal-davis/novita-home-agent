"use client";

import React, { useEffect, useMemo, useState, useCallback } from "react";
import { TableCell } from "@/components/ui/table";
import { NoData } from "@/components/ui/standard/no-data";
// import StandardPagination from "@/components/ui/standard/pagination";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import IncreaseLimit from "./IncreaseLimit";
import { reqGetSandboxQuotaLevel, reqGetSandboxQuotaList } from "@/api/sandbox";
import { makeMergedRowsTableData } from "@/lib/utils/quota-limits";
import styles from "../page.module.scss";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableSpinner,
} from "@/components/ui/table";
import Button from "@/app/components/button/Button";
import { getVoucherList } from "@/api/user";
import {
  daysLeftFromUnix,
  formatUnix,
  isExpiredUnix,
} from "@/app/billing/overview/components/voucher/constants";
import { balanceFormat } from "@/lib/utils/money";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import { BREVO_BOOK_LINK, NOVITA_URL } from "@/constants/urls";

const PAGE_SIZE = 1000;
const VOUCHER_PROGRESS_SEGMENTS = 4;

function getVoucherSegmentFillRatio(
  progress: number,
  segmentIndex: number,
  segmentCount = VOUCHER_PROGRESS_SEGMENTS,
): number {
  const segmentSize = 1 / segmentCount;
  const segmentStart = segmentIndex * segmentSize;
  const fillInSegment = Math.min(
    segmentSize,
    Math.max(0, progress - segmentStart),
  );
  return fillInSegment / segmentSize;
}

const TIER_INFO = [
  {
    title: "Maximum Concurrent Sandboxes",
    tier: "5",
    paid: "100",
    enterprice: "No Limit",
  },
  {
    title: "Sandbox Maximum Lifetime",
    tier: "1h",
    paid: "24h",
    enterprice: "24h +",
  },
  {
    title: "Maximum vCPU per Sandbox",
    tier: "2c",
    paid: "2c",
    enterprice: "2c",
  },
  {
    title: "Maximum Memory per Sandbox",
    tier: "4 GB",
    paid: "8 GB",
    enterprice: "64 GB",
  },
  {
    title: "Maximum Local Storage per Sandbox",
    tier: "20 GB",
    paid: "20 GB",
    enterprice: "20 GB",
  },
];

function PriceInfoLink() {
  return (
    <a
      href={NOVITA_URL.CONSOLE_PRICING_SANDBOX}
      className="text-paragraph-12 text-text-3 underline"
      target="_blank"
      rel="noopener noreferrer"
    >
      About pricing
    </a>
  );
}

export function QuotaInfo() {
  return (
    <div className="flex flex-col gap-2">
      <div className="text-paragraph-16 text-text-1">Quota Tier</div>
      <div className="bg-white rounded-lg p-3 border border-border-2">
        <Table>
          <TableHeader>
            <TableRow>
              {["", "FREE", "PAID", "ENTERPRISE"].map((item, index) => (
                <TableHead className="text-brand" key={index}>
                  {item}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {TIER_INFO.map((row, rowIndex) => (
              <TableRow
                key={rowIndex}
                className="text-paragraph-13 text-text-3"
              >
                <TableCell>{row.title}</TableCell>
                <TableCell className="text-right">{row.tier}</TableCell>
                <TableCell className="text-right">{row.paid}</TableCell>
                <TableCell className="text-right">{row.enterprice}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export default function SandboxQuotaLimits() {
  const router = useRouter();
  const [quotaList, setQuotaList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage] = useState(1);
  // const [total, setTotal] = useState(0);

  const canAdjustQuota = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.quota,
    resource: PERMISSION.RESOURCE.apply_adjust_quota,
    action: PERMISSION.ACTION.read,
  });

  const fetchQuotas = useCallback(async () => {
    setLoading(true);
    try {
      const response = await reqGetSandboxQuotaList({});
      console.log("response: ", response);
      const data = response?.tiers || [];
      const displayQuotaListTmp = [];
      if (data.length > 1) {
        displayQuotaListTmp.push({
          name: "Maximum Concurrent Sandboxes",
          currentLimit: data[1].concurrentInstances,
          limitUnit: "",
          defaultLimit: data[0].concurrentInstances,
          limitAdjustable: true,
        });
        displayQuotaListTmp.push({
          name: "Sandbox Maximum Lifetime",
          currentLimit: data[1].maxLengthHours,
          limitUnit: "h",
          defaultLimit: data[0].maxLengthHours,
          limitAdjustable: true,
        });
        displayQuotaListTmp.push({
          name: "Maximum Local Storage per Sandbox",
          currentLimit: Math.round(Number(data[1].diskMb || 0) / 1024) || 0,
          limitUnit: "GB",
          defaultLimit: Math.round(Number(data[0].diskMb || 0) / 1024) || 0,
          limitAdjustable: false,
        });
        displayQuotaListTmp.push({
          name: "Maximum vCPU per Sandbox",
          currentLimit: data[1].maxVcpu,
          limitUnit: "c",
          defaultLimit: data[0].maxVcpu,
          limitAdjustable: false,
        });
        displayQuotaListTmp.push({
          name: "Maximum Memory per Sandbox",
          currentLimit: data[1].maxRamMb,
          limitUnit: "MiB",
          defaultLimit: data[0].maxRamMb,
          limitAdjustable: false,
        });
      }
      setQuotaList(displayQuotaListTmp);
      // setTotal(response.total || 0);
    } catch (error) {
      console.error("Failed to fetch quotas:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuotas();
  }, [fetchQuotas]);

  const [sandboxQuotaLevel, setSandboxQuotaLevel] = useState<any>(null);
  const [sandboxVoucher, setSandboxVoucher] = useState<any>({});

  useEffect(() => {
    reqGetSandboxQuotaLevel({}).then((res) => {
      console.log("res: ", res);
      setSandboxQuotaLevel(res.sandbox_quota_level);
      getVoucherList([res.sandbox_voucher_template_id]).then((res) => {
        if (res?.data?.length > 0) {
          const voucher = res.data[0];
          setSandboxVoucher({
            name: voucher.name,
            effectDate: voucher.effectDate,
            expiryDate: voucher.expiryDate,
            balance: voucher.balance,
            // balance: "600000",
            originalValue: voucher.originalValue,
          });
        }
      });
    });
  }, []);

  const displayQuotaList = useMemo(() => {
    const filteredQuotaList = quotaList;
    // setTotal(filteredQuotaList.length);
    const targetQuotaList = filteredQuotaList.slice(
      (currentPage - 1) * PAGE_SIZE,
      currentPage * PAGE_SIZE,
    );
    // debugger;
    return makeMergedRowsTableData(targetQuotaList, PAGE_SIZE);
  }, [quotaList, currentPage]);

  const columns = useMemo(
    () => [
      {
        accessorKey: "name",
        header: "Quota name",
        className: "min-w-[200px]",
        render: (row: any) => row.name,
      },
      {
        accessorKey: "currentLimit",
        header: "Current Limit",
        className: "min-w-[100px]",
        render: (row: any) => {
          return row.currentLimit + row.limitUnit;
        },
      },
      // {
      //   accessorKey: "defaultLimit",
      //   header: "Default Limit",
      //   className: "min-w-[120px]",
      //   render: (row: any) => {
      //     return row.defaultLimit + row.limitUnit;
      //   },
      // },
      ...(canAdjustQuota
        ? [
            {
              accessorKey: "action",
              header: "​Actions",
              className: "min-w-[120px]",
              render: (row: any) => {
                if (row.limitAdjustable) {
                  return (
                    <IncreaseLimit
                      quotaInfo={{
                        ...row,
                        quotaType: row.name,
                        quotaObject: "Sandbox",
                        currentQuota: Number(row?.currentLimit || 0),
                      }}
                    />
                  );
                }
                return (
                  <span
                    className={`${styles.disabled} inline-flex items-center h-9`}
                  >
                    -
                  </span>
                );
              },
            },
          ]
        : []),
    ],
    [canAdjustQuota],
  );

  const renderTableCell = useCallback((row: any, column: any) => {
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
    } else {
      tableExtraObj = {
        // rowSpan: 1,
      };
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

  const voucherUsageProgress = useMemo(() => {
    const original = Number(sandboxVoucher.originalValue) || 0;
    if (original <= 0) return 0;
    const used = original - Number(sandboxVoucher.balance ?? 0);
    return Math.min(1, Math.max(0, used / original));
  }, [sandboxVoucher.balance, sandboxVoucher.originalValue]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-row gap-2">
        <div
          className={`p-4 flex flex-row items-center justify-between gap-4
          border border-border-2 rounded-lg bg-white relative
          ${
            sandboxVoucher.effectDate &&
            !isExpiredUnix(sandboxVoucher.expiryDate)
              ? "w-1/2"
              : "w-full"
          }`}
        >
          <div className="flex flex-col gap-3">
            <div className="text-paragraph-16 text-text-1">
              Your Current Tier:
            </div>
            <div className="inline-flex">
              <div className="inline-flex flex-row items-center gap-2 rounded-md px-3 py-1 border border-brand-2 bg-brand-3">
                <span
                  className="size-[6px] shrink-0 rounded-full bg-[var(--brand-1)]"
                  aria-hidden
                />
                <div className="text-paragraph-16 text-brand-1 uppercase">
                  {`${sandboxQuotaLevel || "-"} TIER`}
                </div>
              </div>
            </div>
          </div>
          {sandboxQuotaLevel?.toLowerCase() === "free" ? (
            <div className="flex flex-col items-center gap-3">
              <TooltipProvider>
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        onClick={() => {
                          router.push(NOVITA_URL.BILLING_PAYMENT);
                        }}
                        type="primary"
                        height={36}
                      >
                        Upgrade to Paid Tier
                      </Button>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <div className="text-center">
                      <div>Unlock higher quotas</div>
                      <div>after top-up.</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <PriceInfoLink />
            </div>
          ) : (
            <div className="absolute right-4 bottom-4">
              <PriceInfoLink />
            </div>
          )}
        </div>
        {sandboxVoucher.effectDate &&
          !isExpiredUnix(sandboxVoucher.expiryDate) && (
            <div className="w-1/2 p-4 flex gap-4 flex-col justify-between gap-4 border border-border-2 rounded-lg bg-white">
              <span className="inline-flex self-start text-mono-12 text-text-2 rounded-sm p-1 bg-fill-4">
                PROMO CREDITS
              </span>
              <div>
                <div className="flex flex-row items-center justify-between gap-1">
                  <span className="text-paragraph-12-medium text-text-1">
                    {`$ ${balanceFormat(
                      Number(sandboxVoucher.originalValue) -
                        Number(sandboxVoucher.balance),
                    )} / $ ${balanceFormat(sandboxVoucher.originalValue)} used`}
                  </span>
                  <span className="text-paragraph-12 text-text-3">
                    {`Expires ${formatUnix(sandboxVoucher.expiryDate)} · ${daysLeftFromUnix(sandboxVoucher.expiryDate)} days left`}
                  </span>
                </div>
                <div className="mt-2 flex flex-row gap-1 items-center">
                  {Array.from(
                    { length: VOUCHER_PROGRESS_SEGMENTS },
                    (_, index) => {
                      const fillRatio = getVoucherSegmentFillRatio(
                        voucherUsageProgress,
                        index,
                      );
                      return (
                        <div
                          key={index}
                          className="relative h-2 w-1/4 overflow-hidden rounded-md bg-brand-2"
                        >
                          <div
                            className="absolute inset-y-0 left-0 bg-fill-1"
                            style={{ width: `${fillRatio * 100}%` }}
                          />
                        </div>
                      );
                    },
                  )}
                </div>
              </div>
            </div>
          )}
      </div>
      <div className={styles.content}>
        <main className={styles.table_container}>
          <Table
            loading={loading}
            className={loading ? styles.table_loading : ""}
          >
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
            <TableBody>
              {displayQuotaList.map((row, rowIndex) => (
                <TableRow
                  key={rowIndex}
                  // className={
                  //   shouldHighlightRow(rowIndex) ? styles.hover_highlight : ""
                  // }
                  // onMouseEnter={() => setHoveredRowIndex(rowIndex)}
                  // onMouseLeave={() => setHoveredRowIndex(null)}
                >
                  {columns.map((column) => {
                    return renderTableCell(row, column);
                  })}
                </TableRow>
              ))}
              {loading && <TableSpinner className={styles.table_spinner} />}
            </TableBody>
          </Table>
          {!loading && displayQuotaList.length === 0 && (
            <div className="min-h-[300px] flex flex-col justify-center items-center">
              <NoData />
            </div>
          )}
          {/* {!loading && total !== 0 && (
            <StandardPagination
              className="mt-8"
              total={total}
              pageSize={PAGE_SIZE}
              defaultCurrent={currentPage}
              onChange={(page) => setCurrentPage(page)}
            />
          )} */}
        </main>
      </div>
      <div className="p-4 flex flex-row items-center gap-4 border border-border-2 rounded-lg bg-white">
        <img
          src="/sandbox/console/quota.svg"
          alt="quota"
          className="w-18 h-18"
        />
        <div className="flex flex-col justify-between gap-2">
          <div className="text-paragraph-20 text-text-1">
            Need Custom Quotas？
          </div>
          <div className="text-paragraph-14 text-text-3">
            For advanced workloads that need higher resource limits, custom
            deployment regions, or dedicated infrastructure.
          </div>
        </div>
        <Button
          onClick={() => {
            window.open(BREVO_BOOK_LINK, "_blank");
          }}
          elAttrs={{ target: "_blank", rel: "noopener noreferrer" }}
          type="outline"
          height={36}
        >
          Contact Sales
        </Button>
      </div>
    </div>
  );
}

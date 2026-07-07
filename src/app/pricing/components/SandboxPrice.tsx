"use client";

import React, {
  useEffect,
  useState,
  // useMemo, useCallback
} from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
// import map from "lodash/map";
import Big from "big.js";
// import { Skeleton } from "@/components/ui/skeleton";
// import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
// import analytics from "@/app/components/analytics/analytics";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/app/components/button/Button";
import { DOCS_URL } from "@/constants/urls";
import PricingMobileCard from "./PricingMobileCard";

const SandboxPrice: React.FC<{
  sandboxPriceInfo: any;
  sandboxStorageInfo: any;
  isConsole?: boolean;
}> = ({ sandboxPriceInfo, sandboxStorageInfo, isConsole = false }) => {
  const [cpuUnitPrice, setCpuUnitPrice] = useState(
    Big(sandboxPriceInfo?.discountPrice0 || 0)
      .div(Big(sandboxPriceInfo?.pricePrecision || 1))
      .div(10000),
  );
  const [originalCpuUnitPrice, setOriginalCpuUnitPrice] = useState(
    Big(sandboxPriceInfo?.basePrice0 || 0)
      .div(Big(sandboxPriceInfo?.pricePrecision || 1))
      .div(10000),
  );
  const [memoryUnitPrice, setMemoryUnitPrice] = useState(
    Big(sandboxPriceInfo?.discountPrice1 || 0)
      .div(Big(sandboxPriceInfo?.pricePrecision || 1))
      .div(10000),
  );
  const [originalMemoryUnitPrice, setOriginalMemoryUnitPrice] = useState(
    Big(sandboxPriceInfo?.basePrice1 || 0)
      .div(Big(sandboxPriceInfo?.pricePrecision || 1))
      .div(10000),
  );
  const [storageUnitPrice, setStorageUnitPrice] = useState(
    Big(sandboxStorageInfo?.discountPrice0 || 0)
      .div(Big(sandboxStorageInfo?.pricePrecision || 1))
      .div(10000),
  );
  const [originalStorageUnitPrice, setOriginalStorageUnitPrice] = useState(
    Big(sandboxStorageInfo?.basePrice0 || 0)
      .div(Big(sandboxStorageInfo?.pricePrecision || 1))
      .div(10000),
  );

  useEffect(() => {
    setCpuUnitPrice(
      Big(sandboxPriceInfo?.discountPrice0 || 0)
        .div(Big(sandboxPriceInfo?.pricePrecision || 1))
        .div(10000),
    );
    setOriginalCpuUnitPrice(
      Big(sandboxPriceInfo?.basePrice0 || 0)
        .div(Big(sandboxPriceInfo?.pricePrecision || 1))
        .div(10000),
    );
  }, [sandboxPriceInfo]);

  useEffect(() => {
    setMemoryUnitPrice(
      Big(sandboxPriceInfo?.discountPrice1 || 0)
        .div(Big(sandboxPriceInfo?.pricePrecision || 1))
        .div(10000),
    );
    setOriginalMemoryUnitPrice(
      Big(sandboxPriceInfo?.basePrice1 || 0)
        .div(Big(sandboxPriceInfo?.pricePrecision || 1))
        .div(10000),
    );
  }, [sandboxPriceInfo]);

  useEffect(() => {
    setStorageUnitPrice(
      Big(sandboxStorageInfo?.discountPrice0 || 0)
        .div(Big(sandboxStorageInfo?.pricePrecision || 1))
        .div(10000),
    );
    setOriginalStorageUnitPrice(
      Big(sandboxStorageInfo?.basePrice0 || 0)
        .div(Big(sandboxStorageInfo?.pricePrecision || 1))
        .div(10000),
    );
  }, [sandboxStorageInfo]);
  const headCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-3)] px-space-12 py-space-8 whitespace-nowrap bg-fill-4 border-b border-[var(--border-default)]";
  const bodyCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-1)] px-space-12 py-space-12";
  const cardCls = `bg-white rounded-8 p-space-16 mb-space-16 [box-shadow:none]`;
  const cpuRows = [1, 2, 3, 4, 5, 6, 7, 8];
  const memoryRows = [512, 1024, 2048];
  const storageDescription =
    "Each account includes 60 GB of free storage. Usage beyond this limit is billed on a pay-as-you-go basis.";

  const renderCpuPrice = (item: number) => {
    if (
      !sandboxPriceInfo ||
      (!sandboxPriceInfo.basePrice0 && sandboxPriceInfo.basePrice0 !== 0)
    ) {
      return <Skeleton className="h-5 rounded-sm animate-pulse" />;
    }

    if (sandboxPriceInfo.discountPrice0 === sandboxPriceInfo.basePrice0) {
      return (
        <>
          $
          {cpuUnitPrice
            .mul(Big(item))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /s
        </>
      );
    }

    return (
      <>
        <span className="text-[var(--brand-1)]">
          $
          {cpuUnitPrice
            .mul(Big(item))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /s
        </span>
        <span className="ml-space-4 text-[var(--text-3)] line-through">
          $
          {originalCpuUnitPrice
            .mul(Big(item))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /s
        </span>
      </>
    );
  };

  const renderMemoryUnitPrice = () => {
    if (
      !sandboxPriceInfo ||
      (!sandboxPriceInfo.basePrice1 && sandboxPriceInfo.basePrice1 !== 0)
    ) {
      return <Skeleton className="h-5 rounded-sm animate-pulse" />;
    }

    if (sandboxPriceInfo.discountPrice1 === sandboxPriceInfo.basePrice1) {
      return (
        <>
          $
          {memoryUnitPrice
            .mul(Big(1))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /GiB/s
        </>
      );
    }

    return (
      <>
        <span className="text-[var(--brand-1)]">
          $
          {memoryUnitPrice
            .mul(Big(1))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /GiB/s
        </span>
        <span className="ml-space-4 text-[var(--text-3)] line-through">
          $
          {originalMemoryUnitPrice
            .mul(Big(1))
            .toFixed(9)
            .replace(/\.?0+$/, "")}
          /GiB/s
        </span>
      </>
    );
  };

  const renderMemoryPrice = (item: number, index: number) => {
    if (
      !sandboxPriceInfo ||
      (!sandboxPriceInfo.basePrice1 && sandboxPriceInfo.basePrice1 !== 0)
    ) {
      return <Skeleton className="h-5 rounded-sm animate-pulse" />;
    }

    const discounted =
      index === 0
        ? memoryUnitPrice
            .div(2)
            .toFixed(9)
            .replace(/\.?0+$/, "")
        : Number(
            memoryUnitPrice
              .mul(Big(item).div(1024))
              .toFixed(9)
              .replace(/\.?0+$/, ""),
          ).toString();
    const original =
      index === 0
        ? originalMemoryUnitPrice
            .div(2)
            .toFixed(9)
            .replace(/\.?0+$/, "")
        : Number(
            originalMemoryUnitPrice
              .mul(Big(item).div(1024))
              .toFixed(9)
              .replace(/\.?0+$/, ""),
          ).toString();

    if (sandboxPriceInfo.discountPrice1 === sandboxPriceInfo.basePrice1) {
      return `$${discounted}/s`;
    }

    return (
      <>
        <span className="text-[var(--brand-1)]">${discounted}/s</span>
        <span className="ml-space-4 text-[var(--text-3)] line-through">
          ${original}/s
        </span>
      </>
    );
  };

  const renderStoragePrice = () => {
    if (
      !sandboxStorageInfo ||
      (!sandboxStorageInfo.basePrice0 && sandboxStorageInfo.basePrice0 !== 0)
    ) {
      return <Skeleton className="h-5 rounded-sm animate-pulse" />;
    }

    const current =
      storageUnitPrice.toNumber() === 0 ? (
        <span className="flex h-5 w-8 items-center justify-center rounded-[2px] bg-[var(--green-7)] font-miletus text-paragraph-12 text-[var(--green-2)]">
          Free
        </span>
      ) : (
        <span className="text-[var(--brand-1)]">
          ${storageUnitPrice.toFixed(9).replace(/\.?0+$/, "")}/GB/h
        </span>
      );

    if (sandboxStorageInfo.discountPrice0 === sandboxStorageInfo.basePrice0) {
      return storageUnitPrice.toNumber() === 0 ? (
        current
      ) : (
        <>${storageUnitPrice.toFixed(9).replace(/\.?0+$/, "")}/GB/h</>
      );
    }

    return (
      <>
        {current}
        <span className="ml-space-4 text-[var(--text-3)] line-through">
          ${originalStorageUnitPrice.toFixed(9).replace(/\.?0+$/, "")}/GB/h
        </span>
      </>
    );
  };

  return (
    <div
      className={`${isConsole ? "w-full pl-4 pr-2" : "max_width_container"}`}
    >
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-space-16">
          <h5 className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
            CPU
          </h5>
          <Button
            type="text"
            size="small"
            renderTag="link"
            link={DOCS_URL.SANDBOX_PRICING}
          >
            Integration Guide
          </Button>
        </div>
        <div className="md:hidden">
          <PricingMobileCard
            title="CPU"
            data-testid="sandbox-mobile-card-cpu"
            fields={cpuRows.map((item) => ({
              label: <>{item}X CPU</>,
              value: renderCpuPrice(item),
            }))}
          />
        </div>
        <div className="hidden overflow-hidden rounded-8 [box-shadow:none] md:block">
          <Table>
            <TableHeader>
              <TableRow className="h-[48px]">
                <TableHead className={`${headCellCls} w-[50%]`}>
                  vCPUs
                </TableHead>
                <TableHead className={`${headCellCls} w-[50%]`}>
                  Unit Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cpuRows.map((item: any, index: number) => {
                return (
                  <TableRow
                    key={index}
                    className="bg-white border-b border-[var(--border-subtle)]"
                  >
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {item}X CPU
                    </TableCell>
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {sandboxPriceInfo &&
                      (sandboxPriceInfo.basePrice0 ||
                        sandboxPriceInfo.basePrice0 === 0) ? (
                        sandboxPriceInfo?.discountPrice0 !==
                        sandboxPriceInfo?.basePrice0 ? (
                          <>
                            <span className="text-[var(--brand-1)]">
                              $
                              {cpuUnitPrice
                                .mul(Big(item))
                                .toFixed(9)
                                .replace(/\.?0+$/, "")}
                              /s
                            </span>
                            <span className="text-[var(--text-3)] ml-space-4 line-through">
                              $
                              {originalCpuUnitPrice
                                .mul(Big(item))
                                .toFixed(9)
                                .replace(/\.?0+$/, "")}
                              /s
                            </span>
                          </>
                        ) : (
                          <>
                            $
                            {cpuUnitPrice
                              .mul(Big(item))
                              .toFixed(9)
                              .replace(/\.?0+$/, "")}
                            /s
                          </>
                        )
                      ) : (
                        <Skeleton className="h-5 rounded-sm animate-pulse" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className={cardCls}>
        <div className="flex items-center justify-between mb-space-16">
          <h5 className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
            Memory
          </h5>
          <Button
            type="text"
            size="small"
            renderTag="link"
            link={DOCS_URL.SANDBOX_PRICING}
          >
            Integration Guide
          </Button>
        </div>
        <div className="md:hidden">
          <PricingMobileCard
            title="Memory"
            data-testid="sandbox-mobile-card-memory"
            fields={[
              {
                label:
                  "Valid values: multiples of 512 MiB, from 512 MiB to 8192 MiB",
                value: renderMemoryUnitPrice(),
              },
              ...memoryRows.map((item, index) => ({
                label:
                  index === 0
                    ? "512 MiB"
                    : `${Big(item).div(1024).toString()} GiB`,
                value: renderMemoryPrice(item, index),
              })),
            ]}
          />
        </div>
        <div className="hidden overflow-hidden rounded-8 [box-shadow:none] md:block">
          <Table>
            <TableHeader>
              <TableRow className="h-[48px]">
                <TableHead className={`${headCellCls} w-[50%]`}>
                  Memory
                </TableHead>
                <TableHead className={`${headCellCls} w-[50%]`}>
                  Unit Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow
                key={-1}
                className="bg-white border-b border-[var(--border-subtle)]"
              >
                <TableCell className={`${bodyCellCls} w-[50%]`}>
                  {
                    "Valid values: multiples of 512 MiB, from 512 MiB to 8192 MiB"
                  }
                </TableCell>
                <TableCell className={`${bodyCellCls} w-[50%]`}>
                  {sandboxPriceInfo &&
                  (sandboxPriceInfo.basePrice1 ||
                    sandboxPriceInfo.basePrice1 === 0) ? (
                    sandboxPriceInfo?.discountPrice1 ===
                    sandboxPriceInfo?.basePrice1 ? (
                      <>
                        {"$" +
                          memoryUnitPrice
                            .mul(Big(1))
                            .toFixed(9)
                            .replace(/\.?0+$/, "") +
                          "/GiB/s"}
                      </>
                    ) : (
                      <>
                        <span className="text-[var(--brand-1)]">
                          {"$" +
                            memoryUnitPrice
                              .mul(Big(1))
                              .toFixed(9)
                              .replace(/\.?0+$/, "") +
                            "/GiB/s"}
                        </span>
                        <span className="text-[var(--text-3)] ml-space-4 line-through">
                          {"$" +
                            originalMemoryUnitPrice
                              .mul(Big(1))
                              .toFixed(9)
                              .replace(/\.?0+$/, "") +
                            "/GiB/s"}
                        </span>
                      </>
                    )
                  ) : (
                    <Skeleton className="h-5 rounded-sm animate-pulse" />
                  )}
                </TableCell>
              </TableRow>
              {memoryRows.map((item: any, index: number) => {
                return (
                  <TableRow
                    key={index}
                    className="bg-white border-b border-[var(--border-subtle)]"
                  >
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {index === 0
                        ? "512 MiB"
                        : `${Big(item).div(1024).toString()} GiB`}
                    </TableCell>
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {sandboxPriceInfo &&
                      (sandboxPriceInfo.basePrice1 ||
                        sandboxPriceInfo.basePrice1 === 0) ? (
                        sandboxPriceInfo?.discountPrice1 ===
                        sandboxPriceInfo?.basePrice1 ? (
                          <>
                            {index === 0
                              ? "$" +
                                memoryUnitPrice
                                  .div(2)
                                  .toFixed(9)
                                  .replace(/\.?0+$/, "") +
                                "/s"
                              : "$" +
                                Number(
                                  memoryUnitPrice
                                    .mul(Big(item).div(1024))
                                    .toFixed(9),
                                ) +
                                "/s"}
                          </>
                        ) : (
                          <>
                            {index === 0 ? (
                              <>
                                <span className="text-[var(--brand-1)]">
                                  {" "}
                                  {"$" +
                                    memoryUnitPrice
                                      .div(2)
                                      .toFixed(9)
                                      .replace(/\.?0+$/, "") +
                                    "/s"}
                                </span>
                                <span className="text-[var(--text-3)] ml-space-4 line-through">
                                  {" "}
                                  {"$" +
                                    originalMemoryUnitPrice
                                      .div(2)
                                      .toFixed(9)
                                      .replace(/\.?0+$/, "") +
                                    "/s"}
                                </span>
                              </>
                            ) : (
                              <>
                                <span className="text-[var(--brand-1)]">
                                  {" "}
                                  {"$" +
                                    Number(
                                      memoryUnitPrice
                                        .mul(Big(item).div(1024))
                                        .toFixed(9)
                                        .replace(/\.?0+$/, ""),
                                    ) +
                                    "/s"}
                                </span>
                                <span className="text-[var(--text-3)] ml-space-4 line-through">
                                  {" "}
                                  {Number(
                                    originalMemoryUnitPrice
                                      .mul(Big(item).div(1024))
                                      .toFixed(9)
                                      .replace(/\.?0+$/, ""),
                                  ) + "/s"}
                                </span>
                              </>
                            )}
                          </>
                        )
                      ) : (
                        <Skeleton className="h-5 rounded-sm animate-pulse" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className={cardCls}>
        <div className="flex items-center justify-between mb-space-16">
          <h5 className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
            Storage
          </h5>
          <Button
            type="text"
            size="small"
            renderTag="link"
            link={DOCS_URL.SANDBOX_PRICING}
          >
            Integration Guide
          </Button>
        </div>
        <div className="md:hidden">
          <PricingMobileCard
            title="Storage"
            data-testid="sandbox-mobile-card-storage"
            fields={[
              {
                label: storageDescription,
                value: renderStoragePrice(),
              },
            ]}
          />
        </div>
        <div className="hidden overflow-hidden rounded-8 [box-shadow:none] md:block">
          <Table>
            <TableHeader>
              <TableRow className="h-[48px]">
                <TableHead className={`${headCellCls} w-[50%]`}>
                  Storage
                </TableHead>
                <TableHead className={`${headCellCls} w-[50%]`}>
                  Unit Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[storageDescription].map((item: any, index: number) => {
                return (
                  <TableRow
                    key={index}
                    className="bg-white border-b border-[var(--border-subtle)]"
                  >
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {`${item}`}
                    </TableCell>
                    <TableCell className={`${bodyCellCls} w-[50%]`}>
                      {sandboxStorageInfo &&
                      (sandboxStorageInfo.basePrice0 ||
                        sandboxStorageInfo.basePrice0 === 0) ? (
                        sandboxStorageInfo?.discountPrice0 !==
                        sandboxStorageInfo?.basePrice0 ? (
                          <>
                            {storageUnitPrice.toNumber() === 0 ? (
                              <span className="w-8 h-5 rounded-[2px] bg-[var(--green-7)] text-[var(--green-2)] font-miletus text-paragraph-12 flex items-center justify-center">
                                Free
                              </span>
                            ) : (
                              <span className="text-[var(--brand-1)]">
                                $
                                {storageUnitPrice
                                  .toFixed(9)
                                  .replace(/\.?0+$/, "")}
                                /GB/h
                              </span>
                            )}
                            <span className="text-[var(--text-3)] ml-space-4 line-through">
                              $
                              {originalStorageUnitPrice
                                .toFixed(9)
                                .replace(/\.?0+$/, "")}
                              /GB/h
                            </span>
                          </>
                        ) : (
                          <>
                            {storageUnitPrice.toNumber() === 0 ? (
                              <span className="w-8 h-5 rounded-[2px] bg-[var(--green-7)] text-[var(--green-2)] font-miletus text-paragraph-12 flex items-center justify-center">
                                Free
                              </span>
                            ) : (
                              <>
                                $
                                {storageUnitPrice
                                  .toFixed(9)
                                  .replace(/\.?0+$/, "")}
                                /GB/h
                              </>
                            )}
                          </>
                        )
                      ) : (
                        <Skeleton className="h-5 rounded-sm animate-pulse" />
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default SandboxPrice;

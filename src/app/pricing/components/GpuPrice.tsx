import React from "react";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import Button from "@/app/components/button/Button";
import { dealGPUMoney } from "@/lib/utils/money";
import Link from "next/link";
import { NOVITA_URL } from "@/constants/urls";
import PricingMobileCard from "./PricingMobileCard";
const commonTips = {
  success: "success",
  paginationPreTxt: "Rows per page",
  balanceNotEnough: "Balance is not enough.",
  portLimit: "Please enter valid port, split with [,] port can be 1 to 65535",
  port2000: "Port can not be 2222, 2223, 2224",
  portSame: "Exposed ports cannot be same.",
  httpTcpPortSame: "Exposed http ports and tcp ports cannot be same.",
  httpTcpPortLimit: "Exposed http ports and tcp ports cannot be more than 25.",
  emptyKeyValue: "Key can not be empty",
  loginFailure: "Login failure, please log in again",
  itemIsRequired: "This field is required",
  loginFirst: "Please log in first",
  instanceStatus: {
    Creating: "Creating",
    Created: "Created",
    Starting: "Starting",
    Running: "Running",
    Stopping: "Stopping",
    Exited: "Exited",
    Terminating: "Terminating",
    Terminated: "Terminated",
    creating: "creating",
    toCreate: "toCreate",
    pulling: "pulling",
    running: "running",
    toStart: "toStart",
    starting: "starting",
    migrating: "migrating",
    toStop: "toStop",
    stopping: "stopping",
    exited: "exited",
    toRemove: "toRemove",
    removing: "removing",
    removed: "removed",
    resetting: "resetting",
    toRestart: "toRestart",
    restarting: "restarting",
    other: "other",
  },
  noData: "No Data",
  copyFailed: "Copy failed",
  copySuccess: "Copy success",
  clickCopy: "Click to copy",
  maxHttp10: "The max number of http ports is 10",
  newVoucherTitle: "New Voucher",
  newVoucherTip: "Received a new voucher!",
  newVoucherView: "view",
  invalidImagePath: "The container image is not valid",
  gpuPriceDot: 2,
  storagePriceDot: 3,
};
const GpuPrice: React.FC<{
  gpuPriceList: any[];
  loading?: boolean;
  isConsole?: boolean;
}> = ({ gpuPriceList, loading = false, isConsole = false }) => {
  const headCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-3)] px-space-12 py-space-8 whitespace-nowrap bg-fill-4 border-b border-[var(--border-default)]";
  const bodyCellCls =
    "font-miletus text-[13px] leading-[18px] text-[var(--text-1)] px-space-12 py-space-12";
  const cardCls = `bg-white rounded-8 p-space-16 mb-space-16 [box-shadow:none]`;
  const renderOnDemandPrice = (price: any, multiplier: number) => {
    if (!price?.instancePrice?.discount) return "-";
    const discounted = dealGPUMoney(+price.instancePrice.discount) * multiplier;
    const original = dealGPUMoney(+price.instancePrice.price) * multiplier;

    if (price.instancePrice.price !== price.instancePrice.discount) {
      return (
        <>
          <span className="text-[var(--brand-1)]">
            ${discounted.toFixed(commonTips.gpuPriceDot)}/hr
          </span>
          <span className="ml-space-4 text-[var(--text-3)] line-through">
            ${original.toFixed(commonTips.gpuPriceDot)}/hr
          </span>
        </>
      );
    }

    return `$${discounted.toFixed(commonTips.gpuPriceDot)}/hr`;
  };
  const renderSpotPrice = (price: any, multiplier: number) => {
    if (!price?.instanceSpotPrice?.discount) return "-";
    return `$${(
      dealGPUMoney(+price.instanceSpotPrice.discount) * multiplier
    ).toFixed(commonTips.gpuPriceDot)}/hr`;
  };
  return (
    <div
      className={`${isConsole ? "w-full pl-4 pr-2" : "max_width_container"}`}
    >
      {loading && (
        <div className="animate-pulse py-4">
          <Skeleton
            className="h-[160px] rounded-xl"
            style={{ backgroundColor: "var(--white)" }}
          />
          <Skeleton
            className="h-[160px] rounded-xl my-8"
            style={{ backgroundColor: "var(--white)" }}
          />
          <Skeleton
            className="h-[160px] rounded-xl my-8"
            style={{ backgroundColor: "var(--white)" }}
          />
        </div>
      )}
      <div>
        {gpuPriceList.filter(Boolean).map((price: any, index: number) => (
          <div key={price.productId ?? index} className={cardCls}>
            <div className="flex items-center justify-between mb-space-16">
              <p className="font-miletus text-paragraph-16-medium text-[var(--text-1)]">
                1x {price?.productName}
              </p>
              <Button
                type="text"
                renderTag="link"
                size="small"
                link={NOVITA_URL.GPU_CONSOLE_EXPLORE}
              >
                Get Started
              </Button>
            </div>
            <div className="md:hidden">
              <PricingMobileCard
                title={`1x ${price?.productName}`}
                data-testid={`gpu-price-mobile-card-${price.productId ?? index}`}
                fields={[
                  {
                    label: "Specification",
                    value: `${price?.gpuMemory ? price.gpuMemory + " GB VRAM" : "-"}`,
                  },
                  {
                    label: "On-Demand · 1x GPU",
                    value: renderOnDemandPrice(price, 1),
                  },
                  {
                    label: "On-Demand · 8x GPU",
                    value: renderOnDemandPrice(price, 8),
                  },
                  ...(price?.instanceSpotPrice &&
                  Number(price.instanceSpotPrice.discount) > 0
                    ? [
                        {
                          label: (
                            <span className="inline-flex flex-wrap items-center gap-space-8">
                              Spot · 1x GPU
                              <Link
                                href={NOVITA_URL.GPUS_SPOT}
                                className="font-miletus text-[12px] leading-[16px] text-brand-0 hover:opacity-80"
                              >
                                Spot Instance Info
                              </Link>
                            </span>
                          ),
                          value: renderSpotPrice(price, 1),
                        },
                        {
                          label: "Spot · 8x GPU",
                          value: renderSpotPrice(price, 8),
                        },
                      ]
                    : []),
                ]}
              />
            </div>
            <div className="hidden overflow-hidden rounded-8 [box-shadow:none] md:block">
              <Table>
                <TableHeader>
                  <TableRow className="h-[48px]">
                    <TableHead className={headCellCls}>Specification</TableHead>
                    <TableHead className={headCellCls}>
                      Billing Method
                    </TableHead>
                    <TableHead className={headCellCls}>GPU</TableHead>
                    <TableHead className={headCellCls}>Pricing</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow className="bg-white border-b border-[var(--border-subtle)] hover:bg-transparent">
                    <TableCell
                      className={`${bodyCellCls}`}
                      rowSpan={price?.instanceSpotPrice ? 4 : 2}
                    >
                      <div>{`${price.gpuMemory ? price.gpuMemory + " GB VRAM" : "-"}`}</div>
                    </TableCell>
                    <TableCell className={`${bodyCellCls}`} rowSpan={2}>
                      On-Demand
                    </TableCell>
                    <TableCell className={bodyCellCls}>1x GPU</TableCell>
                    <TableCell className={bodyCellCls}>
                      <div>
                        {price?.instancePrice?.discount ? (
                          price?.instancePrice?.price !==
                          price?.instancePrice?.discount ? (
                            <>
                              <span className="text-[var(--brand-1)]">
                                $
                                {dealGPUMoney(
                                  +price?.instancePrice?.discount,
                                ).toFixed(commonTips.gpuPriceDot)}
                                /hr
                              </span>
                              <span className="text-[var(--text-3)] ml-space-4 line-through">
                                {`$${dealGPUMoney(+price?.instancePrice?.price).toFixed(commonTips.gpuPriceDot)}/hr`}
                              </span>
                            </>
                          ) : (
                            `$${dealGPUMoney(+price?.instancePrice?.discount).toFixed(commonTips.gpuPriceDot)}/hr`
                          )
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  <TableRow className="bg-white border-b border-[var(--border-subtle)] hover:bg-transparent">
                    <TableCell className={bodyCellCls}>8x GPU</TableCell>
                    <TableCell className={bodyCellCls}>
                      <div>
                        {price?.instancePrice?.discount ? (
                          price?.instancePrice?.price !==
                          price?.instancePrice?.discount ? (
                            <>
                              <span className="text-[var(--brand-1)]">
                                $
                                {(
                                  dealGPUMoney(
                                    +price?.instancePrice?.discount,
                                  ) * 8
                                ).toFixed(commonTips.gpuPriceDot)}
                                /hr
                              </span>
                              <span className="text-[var(--text-3)] ml-space-4 line-through">
                                {`$${(dealGPUMoney(+price?.instancePrice?.price) * 8).toFixed(commonTips.gpuPriceDot)}/hr`}
                              </span>
                            </>
                          ) : (
                            `$${(dealGPUMoney(+price?.instancePrice?.discount) * 8).toFixed(commonTips.gpuPriceDot)}/hr`
                          )
                        ) : (
                          "-"
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  {price?.instanceSpotPrice &&
                    Number(price.instanceSpotPrice.discount) > 0 && (
                      <>
                        <TableRow className="bg-white border-b border-[var(--border-subtle)] hover:bg-transparent">
                          <TableCell className={`${bodyCellCls}`} rowSpan={2}>
                            Spot
                            <Link
                              href={NOVITA_URL.GPUS_SPOT}
                              className="font-miletus text-[13px] leading-[18px] text-brand-0 hover:opacity-80 transition-opacity ml-space-8"
                            >
                              Spot Instance Info
                            </Link>
                          </TableCell>
                          <TableCell className={bodyCellCls}>1x GPU</TableCell>
                          <TableCell className={bodyCellCls}>
                            <div>
                              {`$${dealGPUMoney(+price.instanceSpotPrice.discount).toFixed(commonTips.gpuPriceDot)}/hr`}
                            </div>
                          </TableCell>
                        </TableRow>
                        <TableRow className="bg-white border-b border-[var(--border-subtle)] hover:bg-transparent">
                          <TableCell className={bodyCellCls}>8x GPU</TableCell>
                          <TableCell className={bodyCellCls}>
                            <div>
                              {`$${(dealGPUMoney(+price.instanceSpotPrice.discount) * 8).toFixed(commonTips.gpuPriceDot)}/hr`}
                            </div>
                          </TableCell>
                        </TableRow>
                      </>
                    )}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GpuPrice;

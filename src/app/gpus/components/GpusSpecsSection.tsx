"use client";
import { useEffect, useMemo, useState } from "react";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { dealGPUMoney } from "@/lib/utils/money";
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
type GpuPricingRow = {
  sampleConfiguration: string;
  usageExample: string;
  onDemand: string;
  spot: string;
};
const GPU_PRICING_SKELETON_ROWS = Array.from(
  { length: 4 },
  (_, index) => index,
);
export default function GpusSpecsSection() {
  const [rows, setRows] = useState<GpuPricingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const usageExampleSuffix = useMemo(() => "GB VRAM", []);
  useEffect(() => {
    let active = true;
    setLoading(true);
    reqMarketProducts({})
      .then((res) => {
        if (!active) {
          return;
        }
        const originProducts: any[] = res?.products || [];
        const nextRows: GpuPricingRow[] = originProducts
          .slice(0, 4)
          .map((p) => {
            const onDemand1x = p?.instancePrice?.discount
              ? dealGPUMoney(+p.instancePrice.discount).toFixed(
                  commonTips.gpuPriceDot,
                )
              : null;
            const spot1x =
              p?.instanceSpotPrice?.discount &&
              Number(p.instanceSpotPrice.discount) > 0
                ? dealGPUMoney(+p.instanceSpotPrice.discount).toFixed(
                    commonTips.gpuPriceDot,
                  )
                : null;
            return {
              sampleConfiguration: p?.productName || "-",
              usageExample: p?.gpuMemory
                ? `${p.gpuMemory} ${usageExampleSuffix}`
                : "—",
              onDemand: onDemand1x !== null ? `${onDemand1x}/hr/GPU` : "—",
              spot: spot1x !== null ? `${spot1x}/hr/GPU` : "—",
            };
          });
        setRows(nextRows);
      })
      .catch(() => {
        if (active) {
          setRows([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [usageExampleSuffix]);
  return (
    <section className="pt-space-24">
      <div className="w-full border-b border-[var(--border-strong)] pb-space-8">
        <div className="max-w-[780px]">
          <div className="flex items-center gap-space-12">
            <span className="inline-flex h-[8px] w-[8px] rounded-[2px] bg-[var(--brand-0)]" />
            <span className="font-mono-14 text-[var(--text-2)]">
              GPU pricing
            </span>
          </div>
        </div>
      </div>

      <div className="mt-space-24 max-w-[780px]">
        <div className="flex flex-col gap-space-16">
          <h2 className="font-miletus text-[28px] font-normal leading-[38px] tracking-[-0.56px] text-[var(--text-1)]">
            GPU Pricing
          </h2>
          <p className="max-w-[430px] font-miletus text-[18px] font-normal leading-[24px] text-[var(--text-3)]">
            Deploy GPU instances closer to your users through our worldwide
            network. Ensure minimal latency and fast access, no matter where
            your users or teams are located.
          </p>
        </div>
      </div>

      <div className="mt-space-48 overflow-x-auto">
        <div className="min-w-[980px]">
          <div className="grid w-full grid-cols-[minmax(280px,1fr)_minmax(240px,1fr)_minmax(200px,1fr)_minmax(200px,1fr)]">
            <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
              <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--text-3)]">
                Sample Configuration
              </span>
            </div>
            <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
              <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--text-3)]">
                Usage Example
              </span>
            </div>
            <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
              <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--text-3)]">
                On-Demand
              </span>
            </div>
            <div className="flex items-center justify-end border-b border-[var(--border-default)] px-space-12 py-space-16">
              <span className="font-mono-13 uppercase tracking-[0.26px] text-[var(--text-3)]">
                SPOT
              </span>
            </div>

            {loading
              ? GPU_PRICING_SKELETON_ROWS.map((row) => (
                  <div className="contents" key={`gpu-pricing-loading-${row}`}>
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <div className="h-5 w-[180px] animate-pulse rounded-[2px] bg-fill-4" />
                    </div>
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <div className="h-5 w-[92px] animate-pulse rounded-[2px] bg-fill-4" />
                    </div>
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <div className="h-5 w-[96px] animate-pulse rounded-[2px] bg-fill-4" />
                    </div>
                    <div className="flex items-center justify-end border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <div className="h-5 w-[96px] animate-pulse rounded-[2px] bg-fill-4" />
                    </div>
                  </div>
                ))
              : rows.map((row) => (
                  <div
                    className="contents"
                    key={`${row.sampleConfiguration}-${row.usageExample}`}
                  >
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <span className="font-paragraph-16 text-[var(--text-1)]">
                        {row.sampleConfiguration}
                      </span>
                    </div>
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <span className="font-paragraph-16 text-[var(--text-3)]">
                        {row.usageExample}
                      </span>
                    </div>
                    <div className="flex items-center border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <span className="font-paragraph-16 text-[var(--green-700)]">
                        {row.onDemand}
                      </span>
                    </div>
                    <div className="flex items-center justify-end border-b border-[var(--border-default)] px-space-12 py-space-16">
                      <span className="font-paragraph-16 text-[var(--green-700)]">
                        {row.spot}
                      </span>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
}

"use client";

import Image from "next/image";
import { NOVITA_URL } from "@/constants/urls";
import { useRouter } from "next/navigation";

export interface GPUCardProps {
  data: {
    productName: string;
    gpuMemory: string;
    maxAvailableGpuNumber: number;
    cpuNum: number;
    memory: string;
    cudaVersion: string;
    usableNode: boolean;
    inventoryState?: string;
    cloudServiceType?: string;
    instancePrice?: {
      price: number;
      discount?: number;
    };
    gpuSpecId?: string;
  };
  isFeatured?: boolean;
  onClick?: () => void;
  className?: string;
}

const getStockNode = (inventoryState: any) => {
  switch (inventoryState) {
    case "none":
      return <span className="text-[var(--red-1)]">Unavailable</span>;
    case "low":
      return <span className="text-[var(--yellow-2)]">Low</span>;
    case "normal":
      return <span className="text-[var(--brand-1)]">Medium</span>;
    case "high":
      return <span className="text-[var(--brand-1)]">High</span>;
    default:
      return <span className="text-[var(--red-1)]">Unavailable</span>;
  }
};

export default function GPUCard({
  data,
  isFeatured = false,
  onClick,
  className = "",
}: GPUCardProps) {
  const router = useRouter();
  const isAvailable = data.usableNode || true;
  // const pricePerHour =
  //   data.instancePrice?.discount || data.instancePrice?.price || 0;
  const hasDiscount =
    data.instancePrice?.discount &&
    data.instancePrice.discount !== data.instancePrice.price;

  return (
    <div
      className={`bg-white cursor-pointer flex flex-col gap-2 h-full w-full rounded-lg border transition-all ${
        isAvailable
          ? "hover:border-[var(--border-1)] hover:bg-[var(--fill-3)] border-[var(--border-2)]"
          : "border-[var(--border-2)] cursor-not-allowed"
      } ${className}`}
      onClick={
        isAvailable
          ? () => router.push(`${NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE}`)
          : undefined
      }
    >
      <div className="w-full h-full relative p-4 flex flex-col gap-1.5">
        {/* {data.cloudServiceType === "Center" && (
          <div className="absolute top-0 right-0 bg-[var(--brand-2)] text-[var(--brand-1)] font-small-console-medium px-2 py-0.5 rounded-br-lg rounded-tl-lg">
            Secure Cloud
          </div>
        )} */}

        <div className="flex justify-between items-start">
          <div className="font-paragraph-14-medium text-text-1">
            {data.productName}
          </div>
          {isFeatured && (
            <div className="flex items-center gap-0.5 mt-1">
              <Image
                src="/gpu-instance/explore/favorite.svg"
                alt="star"
                width={14}
                height={14}
              />
              <span className="font-small-console text-[var(--brand-1)]">
                Featured
              </span>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center">
          <div className="font-paragraph-12 text-text-2">On-Demand</div>
          <div className="font-subtle-demibold flex items-center gap-1">
            {hasDiscount && (
              <span className="font-paragraph-13 text-text-4 line-through">
                ${(Number(data.instancePrice?.price || 0) / 100000)?.toFixed(2)}{" "}
                /hr
              </span>
            )}
            <span className="font-paragraph-14-medium text-[var(--brand-1)]">
              $
              {(Number(data.instancePrice?.discount || 0) / 100000)?.toFixed(2)}{" "}
              /hr
            </span>
          </div>
        </div>

        <div className="flex justify-between">
          <div className="font-paragraph-12 text-text-2">
            {data.gpuMemory ? `${data.gpuMemory} GB VRAM` : "- -"}
          </div>
          <div className="font-paragraph-13 text-dark-1">
            {data.maxAvailableGpuNumber} max
          </div>
        </div>

        <div className="flex justify-between">
          <div className="font-paragraph-12 text-text-2">
            {!data.memory || !data.cpuNum
              ? "- -"
              : `${data.cpuNum} vCPU  ${data.memory} GB RAM`}
          </div>
        </div>

        <div className="flex justify-between">
          <div className="flex items-center gap-1">
            <div className="font-paragraph-12 text-text-2">Max CUDA</div>
            <div className="font-paragraph-12 text-text-2">
              {data.cudaVersion || "- -"}
            </div>
          </div>
          <div className="font-paragraph-13">
            {!isAvailable ? (
              <span className="text-[var(--red-1)]">Unavailable</span>
            ) : (
              getStockNode(data.inventoryState || "none")
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

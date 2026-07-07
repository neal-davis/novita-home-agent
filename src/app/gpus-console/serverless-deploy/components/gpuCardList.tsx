"use client";

import { Check, CircleQuestionMark, Cpu } from "lucide-react";
import styles from "./gpuCardList.module.scss";
import { useServerlessContext } from "./Context";
import ContentSkeletonDeep from "../../components/ContentSkeletonDeep";
import { useEffect } from "react";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";

const SelectedCorner = () => (
  <div
    className="absolute top-[-3px] right-[-3px] flex h-[22px] w-[22px] items-center justify-center rounded-bl-[8px] rounded-tr-[8px] bg-[var(--dark-1)] shadow-sm"
    aria-hidden
  >
    <Check className="h-[14px] w-[14px] text-white" />
  </div>
);

export default function GPUCardList({
  onDeploy,
  selectedId,
}: {
  selectedId: string;
  onDeploy: (item: any) => void;
}) {
  const { productsLoading, products, formConstraints } = useServerlessContext();
  useEffect(() => {
    if (products.length > 0) {
      onDeploy && onDeploy(products[0]);
    }
  }, [products, onDeploy]);

  function getGpuItem(item: any) {
    let itemContent = item?.models || "";
    if (itemContent) {
      itemContent = itemContent.replaceAll(
        "<b>",
        `<span class=${styles.model}>`,
      );
      itemContent = itemContent.replaceAll("</b>", "</span>");
      return (
        <div className={styles.desc}>
          <div dangerouslySetInnerHTML={{ __html: itemContent }}></div>
        </div>
      );
    } else {
      return "";
    }
  }
  return (
    <>
      {productsLoading && <ContentSkeletonDeep className="pt-4" />}
      {!productsLoading && (
        <div className={styles.productContainer}>
          {products?.map((item: any, index: number) => (
            <div
              key={index}
              className={`${styles.productItem} cursor-pointer relative flex flex-col h-full w-full`}
              style={{
                backgroundColor:
                  selectedId === item.id
                    ? "var(--gray-3) !important"
                    : "var(--white)",
                border:
                  selectedId === item.id
                    ? "1px solid var(--dark-1)"
                    : "1px solid var(--gray-2)",
              }}
              onClick={() => {
                onDeploy(item);
              }}
            >
              {selectedId === item.id && <SelectedCorner />}
              <div
                className={`w-full h-full relative px-4 pt-3 pb-[6px] flex flex-col gap-[6px]
              border-b border-b-[var(--gray-3)]`}
              >
                <div className="inline-flex">
                  <span
                    className={`${styles.gpu_brand_text}
                ${selectedId === item.id ? "!bg-[var(--gray-4)]" : ""}`}
                  >
                    {"NVIDIA"}
                  </span>
                </div>
                <div className="flex flex-col gap-[4px]">
                  <div className="flex items-center gap-1">
                    <div className="font-h7 text-[var(--dark-1)]">
                      {item.gpu_name}
                    </div>
                    {(item?.models || "").trim() !== "" && (
                      <Tooltip title={getGpuItem(item)}>
                        <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                      </Tooltip>
                    )}
                  </div>
                  <div className="flex flex-row items-center justify-between gap-1">
                    <div className="font-small-console text-[var(--dark-3-1)]">
                      {`Max CUDA ${
                        formConstraints?.cudaVersionList?.length > 0
                          ? formConstraints?.cudaVersionList[
                              formConstraints?.cudaVersionList?.length - 1
                            ]
                          : "- -"
                      }`}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-row items-center justify-between px-4 pt-2 pb-[6px] border-b border-b-[var(--gray-3)]">
                <div>
                  <div className="flex items-center">
                    <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                    <div className="font-small-console text-[var(--dark-3-1)]">
                      {" VRAM"}
                    </div>
                  </div>
                  <div className="font-subtle-demibold text-[var(--dark-1)]">
                    {`${item.gpu_size || "- -"} GB`}
                  </div>
                </div>
                <div className="w-[1px] h-[38px] bg-[var(--gray-3)]"></div>
                <div>
                  <div className="flex items-center">
                    <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                    <div className="font-small-console text-[var(--dark-3-1)]">
                      {" vCPU"}
                    </div>
                  </div>
                  <div className="font-subtle-demibold text-[var(--dark-1)]">
                    {item.cpuNum || "- -"}
                  </div>
                </div>
                <div className="w-[1px] h-[38px] bg-[var(--gray-3)]"></div>
                <div>
                  <div className="flex items-center">
                    <Cpu className="w-3 h-3 text-[var(--dark-3-1)] mr-[2px]" />
                    <div className="font-small-console text-[var(--dark-3-1)]">
                      {" RAM"}
                    </div>
                  </div>
                  <div className="font-subtle-demibold text-[var(--dark-1)]">
                    {item.memory || "- -"} GB
                  </div>
                </div>
              </div>

              <div className="px-4 pt-2 pb-3 flex items-center justify-between">
                <span className="font-subtle text-[var(--black)]">
                  {"On Demand"}
                </span>
                <div className="flex items-end gap-[4px]">
                  {item.discount !== item.price && (
                    <span className={`${styles.price} text-[var(--dark-3)]`}>
                      ${item.price}/s
                    </span>
                  )}
                  <span className="font-subtle-demibold text-[var(--brand-1)]">
                    ${item.discount}
                  </span>
                  <span className="font-subtle text-[var(--dark-3-1)]">
                    {"/s"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}

import { getFullLLMModelsWithCache } from "@/api/model";
import LLMModelCard from "@/app/components/ModelLibrary/LLMModelCard";
import ModelCardSkeleton from "./ModelCardSkeleton";
import { LLMModelWithStatus } from "@/types/models";
import { useEffect, useState } from "react";
import { Button, ButtonArrow } from "@/components/ui/button";
import { NOVITA_URL } from "@/constants/urls";
import { useRouter } from "next/navigation";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import GPUCardSkeleton from "./GPUCardSkeleton";
import GPUCard from "./GPUCard";

export default function Explore() {
  const router = useRouter();
  const [llmModelList, setLlmModelList] = useState<LLMModelWithStatus[]>([]);
  const [gpuList, setGpuList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [gpuLoading, setGpuLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getFullLLMModelsWithCache()
      .then((res) => {
        setLlmModelList(res);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    setGpuLoading(true);
    reqMarketProducts({
      billingMethod: "onDemand",
      cpuModel: 4,
      memoryModel: 8,
      auth: 1,
    })
      .then((res) => {
        setGpuList(
          (res?.products || []).filter((product: any) => product?.canBuy),
        );
      })
      .finally(() => {
        setGpuLoading(false);
      });
  }, []);

  return (
    <div>
      <h2 className="font-h5 text-common-dark-1">
        <span className="font-paragraph-20-medium text-text-1">
          Explore & Launch
        </span>
      </h2>
      <div className="font-paragraph-12 text-text-3 mt-1">
        Choose from optimized models and GPUs to instantly power your projects.
      </div>
      <div className="mt-4 p-4 bg-fill-4 rounded-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-paragraph-14-medium text-text-1">Model APIs</h3>
          <Button
            asChild
            size="sm"
            variant="text"
            className="no-underline"
            onClick={() => {
              router.push(NOVITA_URL.MODEL_API_CONSOLE_MODEL_LIBRARY);
              analytics.trackClick(
                CLICK_BTN_IDs.MAIN_CONSOLE
                  .EXPLORE_MODEL_API_GO_TO_MODEL_LIBRARY,
              );
            }}
          >
            <div className="group flex items-center cursor-pointer">
              <span className="text-text-1 uppercase group-hover:underline">
                Model Library
              </span>
              <ButtonArrow
                style={{
                  fontSize: 16,
                  color: "inherit",
                }}
              />
            </div>
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          {loading ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-full">
                  <ModelCardSkeleton />
                </div>
              ))}
            </>
          ) : (
            llmModelList
              .slice(0, 4)
              .map((model) => (
                <LLMModelCard key={model.id} data={model} className="w-full" />
              ))
          )}
        </div>
      </div>
      <div className="mt-4 p-4 bg-fill-4 rounded-sm">
        <div className="flex justify-between items-center">
          <h3 className="font-paragraph-14-medium text-text-1">GPUs</h3>
          <Button
            asChild
            size="sm"
            variant="text"
            className="no-underline"
            onClick={() => {
              router.push(NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE);
              analytics.trackClick(
                CLICK_BTN_IDs.MAIN_CONSOLE.EXPLORE_GPU_GO_TO_MORE,
              );
            }}
          >
            <div className="group flex items-center cursor-pointer">
              <span className="text-text-1 uppercase group-hover:underline">
                More
              </span>
              <ButtonArrow
                style={{
                  fontSize: 16,
                  color: "inherit",
                }}
              />
            </div>
          </Button>
        </div>
        <div className="flex gap-2 mt-3">
          {gpuLoading ? (
            <>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="w-1/4">
                  <GPUCardSkeleton />
                </div>
              ))}
            </>
          ) : (
            gpuList.slice(0, 4).map((product: any, index: number) => {
              const gpuData = product || {};
              return (
                <GPUCard
                  key={index}
                  data={{
                    productName: product.productName || "",
                    gpuMemory: gpuData.gpuMemory || "",
                    maxAvailableGpuNumber: gpuData.maxAvailableGpuNumber || 0,
                    cpuNum: gpuData.cpuNum || 0,
                    memory: gpuData.memory || "",
                    cudaVersion: gpuData.cudaVersion || "",
                    usableNode: gpuData.usableNode || false,
                    inventoryState: gpuData.inventoryState,
                    cloudServiceType: product.cloudServiceType,
                    instancePrice: gpuData.instancePrice || {},
                    gpuSpecId: gpuData.gpuSpecId,
                  }}
                  className="w-[calc(25%-6px)]"
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

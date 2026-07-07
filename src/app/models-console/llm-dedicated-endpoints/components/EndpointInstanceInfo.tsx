import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import {
  getLLMDedicatedSpec,
  getRecommendedEndpointConfig,
} from "@/api/dedicated-endpoint";
import { message } from "@/components/ui/standard/notify";
import InstanceField from "./form-field/InstanceField";
import { Skeleton } from "@/components/ui/skeleton";
import styles from "../sub-pages/DedicatedEndpointDetail.module.scss";

import type { InstanceType } from "../sub-pages/CreateEndpoint/useCreateEndpointForm";

export default function EndpointInstanceInfo({
  resources,
  baseModel,
  handleUpdate,
  syncEndpointData,
}: {
  resources: LLMDedicatedEndpointResources;
  baseModel: LLMDedicatedEndpointModel;
  handleUpdate: (resources: LLMDedicatedEndpointResources) => Promise<void>;
  syncEndpointData: () => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gpuInfo, setGpuInfo] = useState<Record<string, LLMDedicatedSpec>>({});
  const [instanceList, setInstanceList] = useState<InstanceType[]>([]);
  const [selectedInstance, setSelectedInstance] = useState<InstanceType | null>(
    null,
  );
  const [recommendedSpec, setRecommendedSpec] =
    useState<RecommendedEndpointConfig>({
      engineType: "",
      engineVersion: "",
      resources: [],
    });

  useEffect(() => {
    getLLMDedicatedSpec({}).then((res) => {
      const specs = res.specs.reduce(
        (acc, spec) => {
          acc[spec.gpuName] = spec;
          return acc;
        },
        {} as Record<string, LLMDedicatedSpec>,
      );
      setGpuInfo(specs);
    });
  }, []);

  useEffect(() => {
    if (baseModel.modelId) {
      getRecommendedEndpointConfig({
        modelId: baseModel.modelId,
        hfToken: baseModel.token,
      }).then((res) => {
        setRecommendedSpec(res);
      });
    }
  }, [baseModel.modelId, baseModel.token]);

  useEffect(() => {
    if (recommendedSpec.engineType && Object.keys(gpuInfo).length > 0) {
      const newInstanceList = recommendedSpec.resources.map((resource) => {
        // Calculate initial gpuNum: if current selected GPU name matches, use current count (but limit within gpuNums range)
        // Otherwise use the first value from gpuNums
        let initialGpuNum: number;
        const gpuNums = resource.gpuNums || [];

        if (resource.gpuName === resources.gpu.name && gpuNums.length > 0) {
          // If current selected GPU, prefer current count but limit within gpuNums range
          if (gpuNums.includes(resources.gpu.count)) {
            initialGpuNum = resources.gpu.count;
          } else {
            // Find the closest value (prefer max value <= current value, or min value if all are greater)
            const sortedGpuNums = [...gpuNums].sort((a, b) => a - b);
            const lessOrEqual = sortedGpuNums.filter(
              (num) => num <= resources.gpu.count,
            );
            initialGpuNum =
              lessOrEqual.length > 0
                ? lessOrEqual[lessOrEqual.length - 1]
                : sortedGpuNums[0];
          }
        } else {
          initialGpuNum = gpuNums[0] ?? 1;
        }

        return {
          ...gpuInfo[resource.gpuName],
          gpuNum: initialGpuNum,
          gpuNums: resource.gpuNums,
        };
      });
      setInstanceList(newInstanceList);

      const current = newInstanceList.find(
        (spec) => spec.gpuName === resources.gpu.name,
      );
      if (current) {
        setSelectedInstance(current);
      } else if (newInstanceList.length > 0) {
        setSelectedInstance(newInstanceList[0]);
      }

      setIsLoading(false);
    }
  }, [recommendedSpec, gpuInfo, resources]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    const resetInstance = instanceList.find(
      (spec) => spec.gpuName === resources.gpu.name,
    );
    if (resetInstance) {
      setSelectedInstance({
        ...resetInstance,
        gpuNum: resources.gpu.count,
      });
    }
  };

  const handleSave = async () => {
    if (!selectedInstance) {
      message.warning("Please select an instance");
      return;
    }

    setIsSaving(true);
    try {
      const newResources: LLMDedicatedEndpointResources = {
        gpu: {
          name: selectedInstance.gpuName,
          count: selectedInstance.gpuNum,
          cudaVersion: resources.gpu.cudaVersion,
        },
        cpuNum: resources.cpuNum,
        memory: resources.memory,
        storage: resources.storage,
      };
      await handleUpdate(newResources);
      await syncEndpointData();
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update instance:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.card_wrapper}>
      <div
        className={`p-4 pb-2 flex items-center justify-between ${styles.separator_title}`}
      >
        <p className={styles.title}>Instance type</p>
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="px-3"
              onClick={handleCancel}
              disabled={isSaving}
            >
              Cancel
            </Button>
            {instanceList.length > 0 && (
              <Button
                variant="secondary"
                size="sm"
                className="px-3"
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving && <Loader2 className="h-3 w-3 mr-1 animate-spin" />}
                Save
              </Button>
            )}
          </div>
        ) : (
          <button className={styles.edit_button} onClick={handleEdit}>
            <span className="iconfont icon-pencil-line"></span>
            <span className={styles.edit_text}>Edit</span>
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="p-4">
          {isLoading ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <div className="grid grid-cols-2 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            </div>
          ) : (
            <InstanceField
              selectedInstance={selectedInstance}
              instanceList={instanceList}
              setInstanceList={setInstanceList}
              onChange={setSelectedInstance}
              isEditing={isEditing}
            />
          )}
        </div>
      ) : (
        <div className={styles.grid_info}>
          <div>
            <p className={styles.info_title}>GPU</p>
            <p className={styles.info_value}>{resources?.gpu?.name}</p>
          </div>

          <div>
            <p className={styles.info_title}>Number of GPUs</p>
            <p className={`${styles.info_value} ${styles.highlight}`}>
              {resources?.gpu?.count}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

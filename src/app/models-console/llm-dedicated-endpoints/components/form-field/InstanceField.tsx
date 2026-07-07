"use client";

import { useCallback, useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import Tooltip from "@/app/components/Tooltip";
import { Info } from "lucide-react";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import analytics from "@/app/components/analytics/analytics";
import styles from "./InstanceField.module.scss";
import commonStyles from "../../sub-pages/CreateEndpoint/CreateEndpoint.module.scss";

import type { InstanceType } from "../../sub-pages/CreateEndpoint/useCreateEndpointForm";

function InstanceCard({
  instance,
  selectedId,
  onGpuNumChange,
}: {
  instance: InstanceType;
  selectedId: string;
  onGpuNumChange: (gpuNum: string) => void;
}) {
  const counts = useMemo(() => {
    return instance.gpuNums || [];
  }, [instance]);

  const calculatedPrice = useCallback(
    (count: number) => {
      return dealMoneyWithPrecision(
        instance.discount * 3600 * count,
        instance.pricePrecision,
        3,
      );
    },
    [instance],
  );

  return (
    <label
      className={`${styles.instance_card} ${
        selectedId === instance.id ? styles.selected : ""
      }`}
    >
      <RadioGroupItem value={instance.id} />
      <div className="flex-1">
        <h3 className={styles.instance_name}>{instance.displayName}</h3>
        <Select
          value={instance.gpuNum.toString()}
          onValueChange={onGpuNumChange}
        >
          <SelectTrigger className={`w-full h-8 ${styles.select_trigger}`}>
            <SelectValue placeholder="Select GPU" />
          </SelectTrigger>
          <SelectContent>
            {counts.map((count, index) => (
              <SelectItem value={count.toString()} key={index}>
                {count}X GPU ${calculatedPrice(count)}/h
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </label>
  );
}

export default function InstanceField({
  selectedInstance,
  instanceList,
  setInstanceList,
  onChange,
  isEditing = false,
}: {
  selectedInstance: InstanceType | null;
  instanceList: InstanceType[];
  setInstanceList: (value: InstanceType[]) => void;
  onChange: (value: InstanceType) => void;
  isEditing?: boolean;
}) {
  const handleInstanceChange = useCallback(
    (instanceId: string) => {
      const newInstance = instanceList.find((spec) => spec.id === instanceId);
      if (newInstance) {
        analytics.trackClick(
          CLICK_BTN_IDs.MODELS_CONSOLE.LLM_DE_SELECT_GPU_INSTANCE,
          {
            gpuName: newInstance.gpuName,
          },
        );
        onChange(newInstance);
      }
    },
    [instanceList, onChange],
  );

  const handlegpuNumChange = useCallback(
    (gpuNum: string, instanceId: string) => {
      const newInstanceList = instanceList.map((instance) => {
        if (instance.id === instanceId) {
          return { ...instance, gpuNum: parseInt(gpuNum) };
        }
        return instance;
      });
      setInstanceList(newInstanceList);
      if (selectedInstance && selectedInstance.id === instanceId) {
        onChange(
          newInstanceList.find((instance) => instance.id === instanceId)!,
        );
      }
    },
    [instanceList, selectedInstance, setInstanceList, onChange],
  );

  return (
    <div className={`${commonStyles.form_card} mt-2`}>
      <div className="flex items-center gap-2">
        <h3 className={commonStyles.subtitle}>Instance type</h3>
        <Tooltip
          content="The total GPU quota for all card types under each account is 8. If you need more, please contact us."
          contentClassName="w-[246px] whitespace-normal"
          placement="right"
        >
          <Info className="w-3 h-3" color="var(--dark-2)" />
        </Tooltip>
      </div>
      {instanceList.length === 0 ? (
        <div className="mt-2 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="text-center text-[var(--red-2)]">
            <p className="font-subtle">
              {isEditing
                ? "There is currently no recommended GPU configuration."
                : "Insufficient GPU resources. Please retry after some time."}
            </p>
          </div>
        </div>
      ) : (
        <RadioGroup
          value={selectedInstance?.id}
          onValueChange={handleInstanceChange}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          {instanceList.map((instance) => (
            <InstanceCard
              key={instance.id}
              instance={instance}
              selectedId={selectedInstance?.id || ""}
              onGpuNumChange={(gpuNum) =>
                handlegpuNumChange(gpuNum, instance.id)
              }
            />
          ))}
        </RadioGroup>
      )}
    </div>
  );
}

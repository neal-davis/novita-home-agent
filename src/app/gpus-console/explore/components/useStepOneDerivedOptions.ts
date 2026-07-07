import { useMemo } from "react";
import {
  getClusterOptions,
  getGpuNumOptions,
  getNetworkVolumeOptions,
} from "./stepOneOptions";

export function useStepOneDerivedOptions({
  createInstanceInfo,
  myStorages,
  filters,
  params,
}: any) {
  const gpuNumMax = Math.max(
    Number(createInstanceInfo?.currProduct?.maxAvailableGpuNumber || 1),
    1,
  );
  const gpuNumOptions = useMemo<number[]>(
    () => getGpuNumOptions(createInstanceInfo, gpuNumMax),
    [createInstanceInfo, gpuNumMax],
  );
  const selectedNetworkVolumeId =
    (
      createInstanceInfo?.volumeMounts?.find(
        (item: any) => item.type === "network",
      ) || { size: 10, id: "-1", mountPath: "" }
    ).id || "-1";
  const isNetworkVolumeUnsupported =
    params.clusterId !== "-1" &&
    (
      filters?.clusters?.find((item: any) => item.id === params.clusterId) || {
        supportNetStorage: false,
      }
    ).supportNetStorage !== true;
  const networkVolumeOptions = useMemo(
    () => getNetworkVolumeOptions(myStorages, selectedNetworkVolumeId),
    [myStorages, selectedNetworkVolumeId],
  );
  const clusterOptions = useMemo(
    () => getClusterOptions(filters, params),
    [filters, params],
  );

  return {
    gpuNumMax,
    gpuNumOptions,
    selectedNetworkVolumeId,
    isNetworkVolumeUnsupported,
    networkVolumeOptions,
    clusterOptions,
  };
}

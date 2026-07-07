export function getGpuNumOptions(createInstanceInfo: any, gpuNumMax: number) {
  const options = createInstanceInfo?.GpuNumOptions || [1];
  const normalizedOptions = options
    .map((item: number | string) => Number(item))
    .filter((item: number) => item >= 1 && item <= gpuNumMax);

  return Array.from(
    new Set<number>(normalizedOptions.length ? normalizedOptions : [1]),
  ).sort((a, b) => a - b);
}

export function getNetworkVolumeOptions(
  myStorages: any,
  selectedNetworkVolumeId: any,
) {
  const storages = Array.isArray(myStorages) ? myStorages : [];
  const hasSelectedStorage =
    selectedNetworkVolumeId === "-1" ||
    storages.some(
      (item: any) => String(item.storageId) === String(selectedNetworkVolumeId),
    );

  return [
    {
      storageId: "__create_network_volume__",
      storageName: "+ Create Volume",
      isAction: true,
    },
    {
      storageId: "-1",
      storageName: "Network Volume",
    },
    ...(!hasSelectedStorage
      ? [
          {
            storageId: selectedNetworkVolumeId,
            storageName: selectedNetworkVolumeId,
          },
        ]
      : []),
    ...storages,
  ];
}

export function getClusterOptions(filters: any, params: any) {
  const clusters = Array.isArray(filters?.clusters) ? filters.clusters : [];
  const hasSelectedCluster =
    params.clusterId === "-1" ||
    clusters.some((item: any) => String(item.id) === String(params.clusterId));

  return [
    { id: "-1", name: "Any" },
    ...(!hasSelectedCluster
      ? [
          {
            id: params.clusterId,
            name: params.clusterId,
          },
        ]
      : []),
    ...clusters,
  ];
}

export function getRootLocalSize(template: any) {
  const rootFSSize = template?.rootfsSize || 0;
  const localVolume: any = template?.volumes?.find(
    (item: any) => item.type === "local",
  ) || { size: 0 };
  const localVolumeSize: any = localVolume?.size || 0;
  return [rootFSSize, localVolumeSize];
}

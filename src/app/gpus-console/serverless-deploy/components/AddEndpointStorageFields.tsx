import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  FieldError,
  SelectChevronWithClearIcon,
} from "./addEndpointFormHelpers";
import styles from "./addEndpoint.module.scss";

// react-doctor-disable-next-line react-doctor/no-giant-component -- Storage/env dynamic rows share parent form mutation semantics; deeper row extraction should be handled separately.
export default function AddEndpointStorageFields({
  state,
  actions,
  options,
  validation,
}: any) {
  const { mode, endpoint, params, isAuth, showAddNetworkStorageAuth } = state;
  const { setParams, setShowAddNetworkStorageAuth } = actions;
  const { storageOptions, clusterList } = options;
  const { formConstraints, visibleFieldErrors } = validation;

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--brand-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">
            {"Storage Configuration"}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          {mode === "Create" && (
            <div className="flex flex-row items-start gap-3 w-full">
              <div className="w-[calc(50%_+_12px)] flex flex-col gap-[6px]">
                <div className="flex flex-row items-center gap-1">
                  <div className={styles.required_text}>{"*"}</div>
                  <div className="font-small-console text-[var(--dark-1)] mr-1">
                    {"Container Disk"}
                  </div>
                  <div
                    style={{
                      backgroundColor: "rgba(22, 176, 99, 0.10)",
                    }}
                    className="flex flex-row items-center justify-center rounded-[4px] px-1 font-small-console text-[#16B063]"
                  >
                    {`Free ${formConstraints.freeRootfsSize}GB`}
                  </div>
                </div>
                <div>
                  <Input
                    {...{
                      id: "serverless_osDiskSize",
                      type: "number",
                      min: formConstraints.minRootfsSize,
                      max: formConstraints.maxRootfsSize,
                      step: 1,
                      value: params.osDiskSize,
                      onChange: (e) =>
                        setParams({
                          ...params,
                          osDiskSize: Number(e.target.value),
                        }),
                      // i18n-disable-next-line
                      placeholder: "Enter Container Disk",
                      className: cn(
                        "h-[40px]",
                        visibleFieldErrors.osDiskSize &&
                          "!border-[var(--error-color)]",
                      ),
                    }}
                  />
                  <FieldError message={visibleFieldErrors.osDiskSize} />
                </div>
              </div>
              {params.isLocalMount ? (
                <>
                  <div className="w-[25%] flex flex-col gap-[6px]">
                    <div className="flex flex-row items-center gap-1">
                      <div className={styles.required_text}>{"*"}</div>
                      <div className="font-small-console text-[var(--dark-1)] mr-1">
                        {"Volume Disk"}
                      </div>
                      <div
                        style={{
                          backgroundColor: "rgba(22, 176, 99, 0.10)",
                        }}
                        className="flex flex-row items-center justify-center rounded-[4px] px-1 font-small-console text-[#16B063]"
                      >
                        {`Free ${formConstraints.freeLocalVolumeSize}GB`}
                      </div>
                    </div>
                    <div>
                      <Input
                        {...{
                          id: "serverless_localDiskSize",
                          type: "number",
                          min: formConstraints.minLocalVolumeSize,
                          max: formConstraints.maxLocalVolumeSize,
                          step: 1,
                          value:
                            params.localDiskSize === "" ||
                            params.localDiskSize == null
                              ? ""
                              : params.localDiskSize,
                          onChange: (e) => {
                            const v = e.target.value;
                            setParams({
                              ...params,
                              localDiskSize: v === "" ? "" : Number(v),
                            });
                          },
                          // i18n-disable-next-line
                          placeholder: "Enter Volume Disk",
                          className: cn(
                            "h-[40px]",
                            visibleFieldErrors.localDiskSize &&
                              "!border-[var(--error-color)]",
                          ),
                        }}
                      />
                      <FieldError message={visibleFieldErrors.localDiskSize} />
                    </div>
                  </div>
                  <div className="w-[25%] flex flex-col gap-[6px]">
                    <div className="flex flex-row items-center gap-1">
                      <div className={styles.required_text}>{"*"}</div>
                      <div className="font-small-console text-[var(--dark-1)]">
                        {"Volume Mount Path"}
                      </div>
                    </div>
                    <div>
                      <Input
                        id="serverless_localMountPath"
                        value={params.localMountPath}
                        onChange={(e) =>
                          setParams({
                            ...params,
                            localMountPath: e.target.value,
                          })
                        }
                        placeholder="Enter Volume Mount Path"
                        className={cn(
                          "h-[40px]",
                          visibleFieldErrors.localMountPath &&
                            "!border-[var(--error-color)]",
                        )}
                      />
                      <FieldError message={visibleFieldErrors.localMountPath} />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-[25%] flex flex-col gap-[6px]"></div>
                  <div className="w-[25%] flex flex-col gap-[6px]"></div>
                </>
              )}
            </div>
          )}
          <div className="flex flex-row items-start gap-3 w-full">
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1 h-5">
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Network Volume"}
                </div>
              </div>
              <Select
                key={
                  params.networkStorageId
                    ? String(params.networkStorageId)
                    : "__network_volume_unselected__"
                }
                value={
                  params.networkStorageId
                    ? String(params.networkStorageId)
                    : undefined
                }
                onValueChange={(value) => {
                  if (value === "create") {
                    setParams({
                      ...params,
                      networkStorageId: "",
                      clusterIDs:
                        mode === "Create"
                          ? [clusterList[0].id]
                          : endpoint?.clusterIDs?.[0]
                            ? [endpoint?.clusterIDs?.[0]]
                            : [],
                    });
                    if (isAuth()) {
                      setShowAddNetworkStorageAuth({
                        ...showAddNetworkStorageAuth,
                        showModal: true,
                      });
                    }
                  } else {
                    const clusterId =
                      storageOptions.find(
                        (storage: any) => storage.storageId === value,
                      )?.clusterId || "";
                    setParams({
                      ...params,
                      networkStorageId: value,
                      clusterIDs: clusterId ? [clusterId] : [],
                    });
                  }
                }}
              >
                <SelectTrigger
                  className="relative h-[40px] pr-9"
                  icon={
                    <SelectChevronWithClearIcon
                      // i18n-disable-next-line
                      clearAriaLabel="Clear network volume selection"
                      canClear={Boolean(
                        params.networkStorageId &&
                          String(params.networkStorageId).trim() !== "",
                      )}
                      onClear={() =>
                        setParams({
                          ...params,
                          networkStorageId: "",
                          clusterIDs: [],
                        })
                      }
                    />
                  }
                >
                  <SelectValue placeholder="Select Network Volume" />
                </SelectTrigger>
                <SelectContent>
                  {[
                    {
                      label: "Create Network Volume",
                      value: "create",
                    },
                    ...storageOptions.map((storage: any) => ({
                      label: storage.storageName,
                      value: storage.storageId,
                    })),
                  ].map((cluster: any) => (
                    <SelectItem
                      key={cluster.value}
                      value={String(cluster.value)}
                    >
                      {cluster.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {params.networkStorageId && params.networkStorageId !== "create" ? (
              <div className="w-[50%] flex flex-col gap-[6px]">
                <div className="flex flex-row items-center gap-1">
                  <div className={styles.required_text}>{"*"}</div>
                  <div className="font-small-console text-[var(--dark-1)] mr-1">
                    {"Network Volume Mount Path"}
                  </div>
                </div>
                <div>
                  <Input
                    id="serverless_networkStorageMountPath"
                    value={params.networkStorageMountPath}
                    onChange={(e) =>
                      setParams({
                        ...params,
                        networkStorageMountPath: e.target.value,
                      })
                    }
                    placeholder="Enter Network Volume Mount Path"
                    className={cn(
                      "h-[40px]",
                      visibleFieldErrors.networkStorageMountPath &&
                        "!border-[var(--error-color)]",
                    )}
                  />
                  <FieldError
                    message={visibleFieldErrors.networkStorageMountPath}
                  />
                </div>
              </div>
            ) : (
              <div className="w-[50%] flex flex-col gap-[6px]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--brand-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">
            {"Other Configuration"}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start gap-3 w-full">
            {mode === "Create" && (
              <div className="w-[50%] flex flex-col gap-[6px]">
                <div className="flex flex-row items-center gap-1 min-h-[20px]">
                  <div className="font-small-console text-[var(--dark-1)] mr-1">
                    {"Region"}
                  </div>
                </div>
                <Select
                  key={params.clusterIDs?.[0]}
                  disabled={params.networkStorageId !== ""}
                  value={params.clusterIDs?.[0]}
                  onValueChange={(value) =>
                    setParams({ ...params, clusterIDs: [value] })
                  }
                >
                  <SelectTrigger className="h-[40px]">
                    <SelectValue placeholder="Select Region" />
                  </SelectTrigger>
                  <SelectContent>
                    {clusterList?.map((cluster: any) => (
                      <SelectItem key={cluster.id} value={String(cluster.id)}>
                        {cluster.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div
              className={`${mode === "Create" ? "w-[50%]" : "w-full"} flex flex-col gap-[6px]`}
            >
              <div className="flex flex-row items-start gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)] mr-1">
                  {"Health Check Path"}
                </div>
              </div>
              <div>
                <Input
                  id="serverless_healthCheckPath"
                  value={params.healthCheckPath}
                  onChange={(e) =>
                    setParams({ ...params, healthCheckPath: e.target.value })
                  }
                  placeholder="Enter Health Check Path"
                  className={cn(
                    "h-[40px]",
                    visibleFieldErrors.healthCheckPath &&
                      "!border-[var(--error-color)]",
                  )}
                />
                <FieldError message={visibleFieldErrors.healthCheckPath} />
              </div>
            </div>
          </div>
          <div className="flex flex-row items-center gap-3 w-full">
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Environment Variables"}
                </div>
              </div>
              <div className="flex flex-col gap-[6px] w-full">
                {params.envs.map((env: any, index: number) => (
                  <div
                    key={index}
                    className="flex flex-row items-center gap-2 w-full"
                  >
                    <Input
                      id={`serverless_key_${index}`}
                      // i18n-disable-next-line
                      containerClassName="w-full"
                      className={cn(
                        "w-full",
                        visibleFieldErrors.envs &&
                          env.key?.trim() === "" &&
                          "!border-[var(--error-color)]",
                      )}
                      value={env.key}
                      onChange={(e) => {
                        const envs = [...params.envs];
                        envs[index].key = e.target.value;
                        setParams({ ...params, envs });
                      }}
                    />
                    <Input
                      // i18n-disable-next-line
                      containerClassName="w-full"
                      className="w-full"
                      value={env.value}
                      onChange={(e) => {
                        const envs = [...params.envs];
                        envs[index].value = e.target.value;
                        setParams({ ...params, envs });
                      }}
                    />
                    <Button
                      variant="noborderoutline"
                      size="icon"
                      className={cn("w-10 h-10 shrink-0 rounded-[6px]")}
                      onClick={() => {
                        const envs = [...params.envs];
                        envs.splice(index, 1);
                        setParams({ ...params, envs });
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-[var(--dark-1)]" />
                    </Button>
                  </div>
                ))}
                <FieldError message={visibleFieldErrors.envs} />
              </div>
              <Button
                onClick={() =>
                  setParams({
                    ...params,
                    envs: [...params.envs, { key: "", value: "" }],
                  })
                }
                variant="outline"
                className="h-[46px] w-[194px]"
              >
                {"+ Add Environment Variable"}
              </Button>
            </div>
            <div className="w-[50%] flex flex-col gap-[6px]"></div>
          </div>
        </div>
      </div>
    </>
  );
}

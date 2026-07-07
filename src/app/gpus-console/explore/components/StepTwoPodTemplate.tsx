import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { reqGetTemplateById } from "@/api/gpu-instance/templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import styles from "./stepTwo.module.scss";

export default function StepTwoPodTemplate({
  state,
  actions,
  validators,
  storagePriceDot,
}: any) {
  const {
    createInstanceInfo,
    invalidDiskMarks,
    myStorages,
    networkVolumeSelectOpen,
  } = state;
  const {
    changeCreateInstanceInfo,
    changeCreateInstanceVolumeInfo,
    setNetworkVolumeSelectOpen,
    setShowVolumeModal,
    setOperateInfo,
  } = actions;
  const { judgeContainerDisk, judgeSumDisk, judgeNetworkMountPath } =
    validators;

  return (
    <>
      <div className="font-subtle-medium text-[var(--dark-1)]">
        Pod Template
      </div>
      <div className="flex flex-row gap-[12px]">
        <div className="inline-flex flex-col flex-1">
          <div className="font-subtle mb-[4px]">
            <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
              *
            </span>
            {"Container Disk"}(
            {createInstanceInfo?.currProduct?.freeRootFS || 0}GB {"free"}{" "}
            {`Disk Cost:${
              "$" +
              (
                Number(
                  createInstanceInfo?.currProduct?.storagePrice?.discount || 0,
                ) / 100000
              ).toFixed(storagePriceDot)
            } /GB/day`}
            )
          </div>
          <Input
            onBlur={() => {
              const stepFirst: any = judgeContainerDisk();
              !stepFirst && judgeSumDisk();
            }}
            className={`${styles.inputItem}
                    ${invalidDiskMarks?.containerDisk ? styles.redInput : ""}`}
            onChange={(e: any) => {
              changeCreateInstanceInfo("rootfsSize", e.target.value);
            }}
            value={createInstanceInfo?.rootfsSize || ""}
          ></Input>
          {Number(createInstanceInfo?.rootfsSize || 0) >
            (createInstanceInfo?.currProduct?.maxRootFS || 0) && (
            <div className="font-small mt-2 text-[var(--dark-2)] mr-1 text-sm">
              Capacity has exceeded the limit, please contact{" "}
              <a
                href={"mailto:support@novita.ai"}
                className="cursor-pointer text-[var(--brand-0)]"
              >
                support
              </a>
            </div>
          )}
          {createInstanceInfo?.imageObj?.volumes?.find(
            (item: any) => item.type === "local",
          ) && (
            <div style={{ marginTop: "8px" }}>
              <div className="flex justify-between gap-1 px-3 py-2 rounded-[var(--radius-input)] bg-common-gray-3">
                <div className="w-4 shrink-0 mt-[-2px]">
                  <span className="iconfont icon-badge-alert text-common-dark-2 text-[16px]"></span>
                </div>
                <div className="flex flex-col gap-2 grow">
                  <div className="text-common-dark-2 font-small-console">
                    <div>
                      Your template currently includes Volume Disk mounting,
                      which is no longer supported (Container Disk has been
                      expanded). Please update your template to remove Volume
                      Disk mounting configurations and store data on the
                      Container Disk.{" "}
                      <Button
                        type="button"
                        variant="noborderghost"
                        className="h-auto cursor-pointer border-0 bg-transparent p-0 text-[var(--brand-0)]"
                        onClick={() => {
                          reqGetTemplateById(
                            createInstanceInfo?.imageObj?.Id,
                          ).then((res: any) => {
                            const templateTmp = res?.template || {
                              Id: "",
                            };
                            if (templateTmp.Id) {
                              setOperateInfo({
                                mode: "Edit",
                                addOpen: true,
                                templateObj: templateTmp,
                              });
                            }
                          });
                        }}
                        id={
                          CLICK_BTN_IDs.GPUS_CONSOLE
                            .EXPLORE_CUSTOMIZE_UPDATE_TEMPLATE
                        }
                      >
                        Update Template Now
                      </Button>{" "}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        {createInstanceInfo.storageId ? (
          <div className="inline-flex flex-col flex-1">
            <div className="font-subtle mb-[4px]">
              <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                *
              </span>
              <span>{"Network Volume"}</span>
            </div>
            <Select
              disabled={createInstanceInfo.storageId}
              open={networkVolumeSelectOpen}
              onOpenChange={setNetworkVolumeSelectOpen}
              value={
                (
                  createInstanceInfo?.volumeMounts?.find(
                    (item: any) => item.type === "network",
                  ) || { size: 10, id: "-1", mountPath: "" }
                ).id
              }
              onValueChange={(value) =>
                changeCreateInstanceVolumeInfo("network", "id", value)
              }
            >
              <SelectTrigger className={`${styles.storageSelect} h-[32px]`}>
                {
                  <span className={styles.selectStorageName}>
                    {
                      (
                        createInstanceInfo?.volumeMounts?.find(
                          (item: any) => item.type === "network",
                        ) || { size: 10, id: "-1", mountPath: "" }
                      ).storageName
                    }
                  </span>
                }
              </SelectTrigger>
              <SelectContent>
                <Button
                  type="button"
                  variant="noborderghost"
                  className={`${styles.menuItem} ${styles.filterActionItem}`}
                  onClick={() => {
                    setNetworkVolumeSelectOpen(false);
                    setShowVolumeModal(true);
                  }}
                >
                  {"+ Create Volume"}
                </Button>
                {!!myStorages &&
                  !!myStorages.length &&
                  myStorages.map((item: any) => (
                    <SelectItem
                      key={item.storageId}
                      value={String(item.storageId)}
                    >
                      {item.storageName}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="inline-flex flex-col flex-1"></div>
        )}
        {createInstanceInfo.storageId && (
          <div className="inline-flex flex-col flex-1">
            <div className="font-subtle mb-[4px]">
              <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                *
              </span>
              <span>{"Network Mount Path"}</span>
            </div>
            <Input
              onBlur={judgeNetworkMountPath}
              className={`${styles.inputItem}
                              ${
                                invalidDiskMarks?.networkMountPath
                                  ? styles.redInput
                                  : ""
                              }`}
              onChange={(e: any) =>
                changeCreateInstanceVolumeInfo(
                  "network",
                  "mountPath",
                  e.target.value,
                )
              }
              value={
                (
                  createInstanceInfo?.volumeMounts?.find(
                    (item: any) => item.type === "network",
                  ) || { size: "", id: "", mountPath: "" }
                ).mountPath
              }
            ></Input>
          </div>
        )}
      </div>
    </>
  );
}

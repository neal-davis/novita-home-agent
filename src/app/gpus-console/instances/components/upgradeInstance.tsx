"use client";
import styles from "./upgradeNewInstance.module.scss";
import outStyles from "./section.module.scss";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ChevronDown } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { message } from "@/components/ui/standard/notify";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import Modal from "@/app/components/Modal/Modal";
import { reqGetImageAuths } from "@/api/gpu-instance/settings";
import {
  reqSingleGpuInstance,
  reqUpgradeInstance,
} from "@/api/gpu-instance/instances";
import { checkEnvs, dealParamsText } from "@/lib/utils/utils";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import ExpansionInstance from "./expansionInstance";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import ImageAuth from "../../settings/components/imageAuth";
import { CurrModal } from "../../image/components/addImagePrewarmJob";
import { cn } from "@/lib/utils";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
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
const ADD_CREDENTIALS_OPTION_VALUE = "__add_credentials__";
export default function UpgradeInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo, setInstanceInfo] = useState({
    ...instanceInfoObj,
    httpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "http",
      ) || [],
    tcpPorts:
      instanceInfoObj?.portMappings?.filter(
        (item: any) => item.type === "tcp",
      ) || [],
  });
  useEffect(() => {
    if (instanceInfo.id) {
      getSingleGpuInstance(instanceInfo.id);
    }
  }, [instanceInfo.id]);
  function getSingleGpuInstance(id: string) {
    reqSingleGpuInstance(id)
      .then((res: any) => {
        const instanceInfoObj: any = res || {};
        setInstanceInfo({
          ...instanceInfoObj,
          httpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "http",
            ) || [],
          tcpPorts:
            instanceInfoObj?.portMappings?.filter(
              (item: any) => item.type === "tcp",
            ) || [],
        });
      })
      .catch(() => {
        setInstanceInfo({});
      });
  }
  function inputInstanceInfo(item: string, value: any) {
    setInstanceInfo({ ...instanceInfo, [item]: value });
  }
  const [myAuths, setMyAuths] = useState([]);
  useEffect(() => {
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }, []);
  function removeEnv(index: number) {
    const envs = [...instanceInfo.envs];
    envs.splice(index, 1);
    setInstanceInfo({ ...instanceInfo, envs });
  }
  function inputEnvInfo(index: number, item: string, e: any) {
    const envs = [...instanceInfo.envs];
    envs[index][item] = e.target.value;
    setInstanceInfo({ ...instanceInfo, envs });
  }
  function addEnvs() {
    const envs = [...instanceInfo.envs];
    envs.push({ key: "", value: "" });
    setInstanceInfo({ ...instanceInfo, envs });
  }
  const [save, setSave] = useState(true);
  const [expandSizeInfo, setExpandSizeInfo] = useState<any>({
    showModal: false,
    instanceInfoObj: {},
    expandSize: 0,
  });
  const [btnLoading, setBtnLoading] = useState(false);
  function upgradeInstanceFun() {
    if (localVolumeMount && !localMountInfo.isMount) {
      message.error(
        `Local storage that is already mounted is not allowed to be unmounted`,
      );
      return;
    }
    if (
      !instanceInfo.imageUrl ||
      instanceInfo.imageUrl.trim() === "" ||
      instanceInfo.imageUrl.trim().length > 500
    ) {
      message.error(`${"Please input valid image, max length 500"}`);
      return;
    }
    if (instanceInfo.entrypoint?.trim()?.length > 2047) {
      message.error(`Entrypoint length cannot exceed 2047 characters`);
      return;
    }
    const ret = isValidDockerImageAddress(instanceInfo.imageUrl);
    if (ret) {
      message.error(ret);
      return;
    }
    if (localMountInfo.isMount) {
      const origin = instanceInfoObj?.volumeMounts?.find(
        (item: any) => item.type === "local",
      );
      if (Number(localMountInfo.size) < (origin?.size || 1)) {
        message.error(
          "Volume disk size can not be smaller than " +
            (origin?.size || 1) +
            "GB",
        );
        return;
      }
      const maxLocalVolumeSize = instanceInfo?.node?.maxLocalVolumeSize || 0;
      if (
        isNaN(localMountInfo.size) ||
        Number(localMountInfo.size) > Number(maxLocalVolumeSize)
      ) {
        message.error(
          dealParamsText(
            "Please enter a valid local volume size and can not be greater than ${0} GB",
            {
              0: maxLocalVolumeSize,
            },
          ),
        );
        return;
      }
      if (
        !localMountInfo.mountPath ||
        localMountInfo.mountPath.trim() === "/" ||
        localMountInfo.mountPath[0] !== "/" ||
        localMountInfo.mountPath.indexOf(" ") >= 0
      ) {
        message.error("Volume mount path is invalid");
        return;
      }
      const netVolumeMount = instanceInfoObj?.volumeMounts?.find(
        (item: any) => item.type === "network",
      );
      if (
        netVolumeMount &&
        localMountInfo.mountPath.trim() === netVolumeMount.mountPath.trim()
      ) {
        message.error(
          "The volume mount path and network mount path can not be the same.",
        );
        return;
      }
    }
    const envs = instanceInfo.envs || [];
    const envRet: any = checkEnvs(envs);
    if (envRet) {
      message.error(envRet);
      return;
    }
    if (
      instanceInfo.billingMode === "monthly" &&
      localMountInfo.isMount &&
      Number(localMountInfo.size) -
        (localMountInfo.isMount
          ? instanceInfo?.volumeMounts?.find(
              (item: any) => item.type === "local",
            )?.size || 0
          : 0) >
        0
    ) {
      setExpandSizeInfo({
        showModal: true,
        instanceInfoObj: instanceInfo,
        expandSize:
          Number(localMountInfo.size) -
          (localMountInfo.isMount
            ? instanceInfo?.volumeMounts?.find(
                (item: any) => item.type === "local",
              )?.size || 0
            : 0),
      });
    } else {
      upgradeInstanceMainFun();
    }
  }
  const [dockerError, setDockerError] = useState("");
  const checkDockerError = useCallback(() => {
    if (
      !instanceInfo.imageUrl ||
      instanceInfo.imageUrl.trim() === "" ||
      instanceInfo.imageUrl.trim().length > 500
    ) {
      return `${"Please input valid image, max length 500"}`;
    }
    const ret = isValidDockerImageAddress(instanceInfo.imageUrl);
    if (ret) {
      return ret;
    }
    return "";
  }, [instanceInfo.imageUrl]);
  useEffect(() => {
    const error = checkDockerError();
    setDockerError(error);
  }, [checkDockerError, instanceInfo.imageUrl]);

  const [entrypointError, setEntrypointError] = useState("");
  const checkEntrypointError = useCallback(() => {
    if (instanceInfo.entrypoint.trim().length > 2047) {
      return `Entrypoint length cannot exceed 2047 characters`;
    }
    return "";
  }, [instanceInfo.entrypoint]);
  useEffect(() => {
    const error = checkEntrypointError();
    setEntrypointError(error);
  }, [checkEntrypointError]);

  function upgradeInstanceMainFun() {
    if (btnLoading) {
      return new Promise((resolve, reject) => {
        reject(false);
      });
    }
    setBtnLoading(true);
    return reqUpgradeInstance(instanceInfo.id, {
      envs: instanceInfo.envs,
      command: instanceInfo.command,
      entrypoint: instanceInfo.entrypoint?.trim() || "",
      imageUrl: instanceInfo.imageUrl.trim(),
      imageAuthId: instanceInfo.imageAuthId,
      save: save,
      localVolume:
        !localVolumeMount && localMountInfo.isMount
          ? {
              volumeMounts: [
                {
                  ...localMountInfo,
                  mountPath: localMountInfo.mountPath.trim(),
                  size: Number(localMountInfo.size),
                  isMount: undefined,
                },
              ],
            }
          : undefined,
    })
      .then(() => {
        message.success("success");
        finishForm(true, instanceInfo);
      })
      .finally(() => {
        setBtnLoading(false);
      });
  }
  function expansionFinishForm(mark: boolean) {
    if (!mark) {
      setExpandSizeInfo((prev: any) => ({ ...prev, showModal: false }));
      return;
    } else {
      upgradeInstanceMainFun().then(() => {
        setExpandSizeInfo((prev: any) => ({ ...prev, showModal: false }));
      });
    }
  }
  // function toOtherPage() {
  //   window.location.href = window.location.origin + "/gpus-console/settings";
  // }
  const localVolumeMount = instanceInfoObj?.volumeMounts?.find(
    (item: any) => item.type === "local",
  );
  const [localMountInfo, setLocalMountInfo] = useState<{
    isMount: boolean;
    type: string;
    size: any;
    id: any;
    mountPath: any;
  }>({
    isMount: !!localVolumeMount,
    type: "local",
    size: localVolumeMount?.size || 0,
    id: localVolumeMount?.id || undefined,
    mountPath: localVolumeMount?.mountPath || "",
  });
  const [showAddImageAuth, setShowAddImageAuth] = useState({
    showModal: false,
  });
  function addAuthValue(mark?: boolean, id?: string) {
    setShowAddImageAuth({ ...showAddImageAuth, showModal: false });
    if (mark && id) {
      inputInstanceInfo("imageAuthId", id);
    }
    reqGetImageAuths({}).then((res: any) => {
      setMyAuths(res?.data || []);
    });
  }
  return (
    <div className={styles.subContainer}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Upgrade"}</h1>
        <div>
          <div className={styles.funcDesc}>
            <span className={`iconfont icon-badge-alert ${styles.alertIcon}`} />
            <div className="font-small text-[var(--dark-1)]">
              {'Choosing "Upgrade" will cause your running Instance to'}{" "}
              <span className="text-[var(--red-2)]">{"reset"}</span>
              {"!"}
            </div>
          </div>
          <div className={styles.formBlock}>
            {false && !localVolumeMount && (
              <div className={styles.localMountRefCred}>
                <label className="inline-flex items-center gap-2">
                  <Checkbox
                    disabled={localVolumeMount}
                    checked={localMountInfo.isMount}
                    onCheckedChange={(checked: boolean) => {
                      setLocalMountInfo({
                        ...localMountInfo,
                        isMount: checked,
                      });
                    }}
                  />
                  <span
                    className={`${styles.isSaveDataTxt} ${
                      localVolumeMount
                        ? styles.isSaveDataTxtDisabled
                        : styles.isSaveDataTxtEnabled
                    }`}
                  >
                    {"Local Mount"}
                  </span>
                </label>
                {localMountInfo.isMount && (
                  <>
                    <div className={styles.localMountTxt}>
                      <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                        *
                      </span>
                      {"Volume Disk"}
                    </div>
                    <Input
                      className={styles.dockerImageNameInput}
                      value={localMountInfo?.size}
                      onChange={(e: any) => {
                        const value = e.target.value;
                        if (
                          /^[1-9]\d*$/.test(value) ||
                          value === "0" ||
                          value === ""
                        ) {
                          setLocalMountInfo({
                            ...localMountInfo,
                            size: value,
                          });
                          return;
                        }
                      }}
                    ></Input>
                    {instanceInfo.billingMode === "monthly" && (
                      <div className="text-sm text-[var(--dark-3)] mt-1">
                        <div>{`Upgrade the instance, you need to pay for the expansion storage cost of the remaining period of the Subscription Instance`}</div>
                        <span className="text-[var(--red-1)]">
                          {`Price: $${(Math.round(Number(instanceInfo?.exitedLocalStoragePrice || 0)) / 100000).toFixed(commonTips.storagePriceDot)}/GB/Day`}
                        </span>
                      </div>
                    )}
                    <div className={styles.localMountTxt}>
                      <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                        *
                      </span>
                      {"Volume Mount Path"}
                    </div>
                    <Input
                      className={styles.dockerImageNameInput}
                      value={localMountInfo?.mountPath}
                      onChange={(e: any) =>
                        setLocalMountInfo({
                          ...localMountInfo,
                          mountPath: e.target.value,
                        })
                      }
                    ></Input>
                  </>
                )}
              </div>
            )}
            <div className={styles.imageUrl}>
              <div className={styles.dockerImageNameTxt}>
                <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                  *
                </span>
                {"Docker Image Name"}
              </div>
              <Input
                className={`${styles.dockerImageNameInput} ${dockerError ? "error-input" : ""}`}
                value={instanceInfo?.imageUrl}
                onChange={(e: any) =>
                  inputInstanceInfo("imageUrl", e.target.value)
                }
              ></Input>
              {dockerError && (
                <div className={"ant-form-item-explain-error"}>
                  {dockerError}
                </div>
              )}
            </div>
            <div className={styles.containerRefCred}>
              <div className={styles.containerRefCredTxt}>
                {"Container Registry Credentials"}
              </div>
              <SelectFilter
                {...{
                  value: instanceInfo?.imageAuthId || "",
                  options: [
                    {
                      id: ADD_CREDENTIALS_OPTION_VALUE,
                      name: "+ Add Credentials",
                    },
                    ...myAuths,
                  ],
                  onValueChange: (value) => {
                    if (value === ADD_CREDENTIALS_OPTION_VALUE) {
                      setShowAddImageAuth({
                        ...showAddImageAuth,
                        showModal: true,
                      });
                      return;
                    }
                    inputInstanceInfo("imageAuthId", value);
                  },
                  onClear: () => inputInstanceInfo("imageAuthId", ""),
                  allowClear: !!instanceInfo.imageAuthId,
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear container registry credentials",
                  getOptionValue: (item: any) => item.id,
                  getOptionLabel: (item: any) => item.name,
                  renderTrigger: (item: any) => (
                    <span className="truncate text-[var(--black)]">
                      {item?.name || ""}
                    </span>
                  ),
                  renderOption: (item: any) => item.name,
                  placeholder: "",
                  triggerClassName: styles.containerRefCredSelect,
                  // i18n-disable-next-line
                  contentClassName: "max-h-[450px]",
                  itemClassName: outStyles.menuItem,
                  showSearch: false,
                }}
              />
            </div>
          </div>

          <div className={styles.startCommand}>{"Container Start Command"}</div>
          <Textarea
            rows={4}
            className={styles.startCommandInput}
            placeholder={"Enter your Container Start Command"}
            value={instanceInfo?.command}
            onChange={(e: any) => inputInstanceInfo("command", e.target.value)}
          />

          <div className={styles.startCommand}>{"Entrypoint"}</div>
          <Textarea
            rows={4}
            className={`${styles.startCommandInput} ${entrypointError ? styles.redInput : ""}`}
            placeholder={"Please input the entrypoint"}
            value={instanceInfo?.entrypoint}
            onChange={(e: any) =>
              inputInstanceInfo("entrypoint", e.target.value)
            }
          />
          {entrypointError && (
            <div className={"ant-form-item-explain-error"}>
              {entrypointError}
            </div>
          )}
          <div
            className={`rounded-[6px] border !border-[var(--gray-1)] ${styles.envPanel}`}
          >
            <Collapsible className="createInstanceAdvance">
              <CollapsibleTrigger asChild>
                <div className="group relative flex w-full items-center px-3 py-2 text-left cursor-pointer">
                  <span className={styles.envVarTxt}>
                    {"Environment Variables"}
                  </span>
                  <ChevronDown className="absolute right-3 top-1.5 h-4 w-4 text-[var(--black)] transition-transform group-data-[state=open]:rotate-180" />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="p-3">
                  {instanceInfo.envs
                    ? instanceInfo.envs.map((item: any, index: number) => {
                        return (
                          <div className={styles.envRow} key={index}>
                            <div className={styles.envItem}>
                              <Input
                                onChange={(e: any) =>
                                  inputEnvInfo(index, "key", e)
                                }
                                placeholder={"key"}
                                className={styles.envKeyInput}
                                value={item.key}
                              ></Input>
                            </div>
                            <div className={styles.envValueItem}>
                              <div className="flex items-center gap-2">
                                <Input
                                  onChange={(e: any) =>
                                    inputEnvInfo(index, "value", e)
                                  }
                                  placeholder={"value"}
                                  // i18n-disable-next-line
                                  containerClassName="w-full"
                                  className={styles.envValueInput}
                                  value={item.value}
                                ></Input>
                                <Button
                                  onClick={() => removeEnv(index)}
                                  variant="noborderoutline"
                                  size="icon"
                                  className={cn(styles.removeEnvBtn)}
                                >
                                  {/* <img src="/gpu-instance/instances/icon-delete.svg" /> */}
                                  <span
                                    className={`iconfont icon-delete ${styles.deleteIcon}`}
                                  />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    : ""}

                  <Button
                    onClick={() => addEnvs()}
                    className={styles.addEnvBtn}
                    variant="outline"
                  >
                    <span className={styles.addEnvBtnTxt}>
                      {"+ Add Environment Variable"}
                    </span>
                  </Button>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <div className={styles.saveDataContainer}>
            <label className="inline-flex items-center gap-2">
              <Checkbox
                checked={save}
                onCheckedChange={(checked: boolean) => {
                  setSave(checked);
                }}
              />
              <span
                className={`${styles.isSaveDataTxt} ${
                  save
                    ? styles.isSaveDataTxtDisabled
                    : styles.isSaveDataTxtEnabled
                }`}
              >
                {"Save data on reset"}
              </span>
            </label>
            <div className={styles.saveDataDescPrefixTxt}>
              {"If the data and system are incompatible, the data"}{" "}
              <span className={styles.saveDataWarning}>
                {"cannot be saved"}
              </span>
            </div>
          </div>

          <div className={styles.actionRow}>
            <Button
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_UPGRADE_INSTANCE}
              className={styles.upgradeBtn}
              onClick={() => upgradeInstanceFun()}
              variant="default"
            >
              <span className={styles.upgradeBtnTxt}>{"Upgrade"}</span>
            </Button>
            <Button
              onClick={() => finishForm()}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
      {expandSizeInfo.showModal ? (
        <Modal
          centered
          className={styles.expansionModal}
          width="min(890px, calc(100vw - 32px))"
          footer={null}
          open={expandSizeInfo.showModal}
          title={null}
          onCancel={() =>
            setExpandSizeInfo({ ...expandSizeInfo, showModal: false })
          }
        >
          <ExpansionInstance
            instanceInfoObj={expandSizeInfo.instanceInfoObj}
            finishForm={expansionFinishForm}
            expandSize={expandSizeInfo.expandSize}
          />
        </Modal>
      ) : (
        ""
      )}
      {showAddImageAuth.showModal ? (
        <CurrModal
          footer={null}
          open={showAddImageAuth.showModal}
          title={"Add Credential"}
          onCancel={() =>
            setShowAddImageAuth({ ...showAddImageAuth, showModal: false })
          }
        >
          <ImageAuth addModelValue={addAuthValue} />
        </CurrModal>
      ) : (
        ""
      )}
    </div>
  );
}

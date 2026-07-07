"use client";
import styles from "./editInstance.module.scss";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import Modal from "@/app/components/Modal/Modal";
import {
  reqEditInstance,
  reqSingleGpuInstance,
} from "@/api/gpu-instance/instances";
import {
  checkHttpTcpPortSame,
  checkPorts,
  dealParamsText,
} from "@/lib/utils/utils";
import ExpansionInstance from "./expansionInstance";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
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
export default function EditInstance({
  instanceInfoObj,
  finishForm,
}: {
  instanceInfoObj: any;
  finishForm: any;
}) {
  const [instanceInfo, setInstanceInfo] = useState<any>();
  useEffect(() => {
    if (instanceInfoObj.id) {
      getSingleGpuInstance(instanceInfoObj.id);
    }
  }, [instanceInfoObj.id]);
  function getSingleGpuInstance(id: string) {
    reqSingleGpuInstance(id)
      .then((res: any) => {
        const instanceInfoObj: any = res || {};
        setInstanceInfo({
          ...instanceInfoObj,
          httpPorts:
            instanceInfoObj?.portMappings
              ?.filter((item: any) => item.type === "http")
              ?.map((ele: any) => ele.port)
              ?.join(",") || ",",
          tcpPorts:
            instanceInfoObj?.portMappings
              ?.filter((item: any) => item.type === "tcp")
              ?.map((ele: any) => ele.port)
              ?.join(",") || ",",
        });
        setParams({
          rootfsSize: 0,
          diskSize: (
            instanceInfoObj?.volumeMounts?.find(
              (item: any) => item.type === "local",
            ) || {
              size: 0,
            }
          ).size,
          httpPorts:
            instanceInfoObj?.portMappings
              ?.filter((item: any) => item.type === "http")
              ?.map((ele: any) => ele.port)
              ?.join(",") || ",",
          tcpPorts:
            instanceInfoObj?.portMappings
              ?.filter((item: any) => item.type === "tcp")
              ?.map((ele: any) => ele.port)
              ?.join(",") || ",",
        });
      })
      .catch(() => {
        setInstanceInfo({});
        setParams({
          rootfsSize: 0,
          diskSize: 0,
          httpPorts: ",",
          tcpPorts: ",",
        });
      });
  }
  const [params, setParams] = useState({
    rootfsSize: 0,
    diskSize: (
      instanceInfo?.volumeMounts?.find(
        (item: any) => item.type === "local",
      ) || { size: 0 }
    ).size,
    httpPorts:
      instanceInfoObj?.portMappings
        ?.filter((item: any) => item.type === "http")
        ?.map((ele: any) => ele.port)
        ?.join(",") || ",",
    tcpPorts:
      instanceInfoObj?.portMappings
        ?.filter((item: any) => item.type === "tcp")
        ?.map((ele: any) => ele.port)
        ?.join(",") || ",",
  });
  function inputChangeParamsInfo(item: string, value: any) {
    if (item === "diskSize" || item === "rootfsSize") {
      if (item === "diskSize") {
        if (/^[1-9]\d*$/.test(value) || value === "0" || value === "") {
          setParams({ ...params, [item]: value });
          return;
        }
      }
      if (item === "rootfsSize") {
        if (/^[1-9]\d*$/.test(value) || value === "0" || value === "") {
          setParams({ ...params, [item]: value });
          return;
        }
      }
    } else {
      setParams({ ...params, [item]: value });
    }
  }
  const [expandSizeInfo, setExpandSizeInfo] = useState<any>({
    showModal: false,
    instanceInfoObj: {},
    expandSize: 0,
  });
  const [dealParamsInfo, setDealParamsInfo] = useState({
    originDiskSize: 0,
    originRootfsSize: 0,
    httpPorts: [],
    tcpPorts: [],
  });
  const [btnLoading, setBtnLoading] = useState(false);
  function editInstanceFun() {
    const originDiskSize = (
      instanceInfo?.volumeMounts?.find(
        (item: any) => item.type === "local",
      ) || { size: 0 }
    ).size;
    if (
      isNaN(params.diskSize) ||
      Number(params.diskSize) < Number(originDiskSize)
    ) {
      message.error(
        `${dealParamsText(
          "Please enter a valid local volume size and can not be smaller than the original value(${0} GB)",
          {
            0: originDiskSize,
          },
        )}`,
      );
      return;
    }
    const originRootfsSize = instanceInfo?.rootfsSize || 0;
    if (isNaN(params.rootfsSize) || Number(params.rootfsSize) < 0) {
      message.error(
        `Please enter a valid size and can not be smaller than 0 GB`,
      );
      return;
    }
    let httpPorts: any = [];
    const httpTools: any =
      instanceInfo?.tools
        ?.filter((ele: any) => ele.type === "http")
        .map((item: any) => item.port + "") || [];
    const tcpTools: any =
      instanceInfo?.tools
        ?.filter((ele: any) => ele.type === "tcp")
        .map((item: any) => item.port + "") || [];
    let allHttpPorts = [];
    if (params?.httpPorts) {
      const httpPortsInfo: any = checkPorts(
        (params?.httpPorts?.split(",") || []).concat(httpTools),
      );
      allHttpPorts = (params?.httpPorts?.split(",") || []).concat(httpTools);
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          message.error(httpPortsInfo[0]);
          return;
        } else {
          const portsTmp: any =
            httpPortsInfo[1].map((item: any) => ({
              port: item,
              type: "http",
            })) || [];
          httpPorts = [...portsTmp];
        }
      }
    }
    if (httpPorts.length > 10) {
      message.error(
        `${"HttpPort field must have less than or equal to 10 items."}`,
      );
      return;
    } else {
      const httpPortsInfo: any = checkPorts(
        params?.httpPorts?.split(",") || [],
      );
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          message.error(httpPortsInfo[0]);
          return;
        } else {
          const portsTmp: any =
            httpPortsInfo[1].map((item: any) => ({
              port: item,
              type: "http",
            })) || [];
          httpPorts = [...portsTmp];
        }
      }
    }
    const maxLocalVolumeSize = instanceInfo?.node?.maxLocalVolumeSize || 0;
    if (
      isNaN(params.diskSize) ||
      Number(params.diskSize) > Number(maxLocalVolumeSize)
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
    const maxRootfsSize = instanceInfo?.node?.maxRootfsSize || 0;
    if (
      isNaN(params.rootfsSize) ||
      Number(params.rootfsSize) + Number(originRootfsSize) >
        Number(maxRootfsSize)
    ) {
      message.error(
        `Please enter a valid size, current size after expanding can not be greater than ${maxRootfsSize} GB`,
      );
      return;
    }
    let tcpPorts: any = [];
    let allTcpPorts = [];
    if (params?.tcpPorts) {
      const tcpPortsInfo: any = checkPorts(
        (params?.tcpPorts?.split(",") || []).concat(tcpTools),
      );
      allTcpPorts = (params?.tcpPorts?.split(",") || []).concat(tcpTools);
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          message.error(tcpPortsInfo[0]);
          return;
        } else {
          const tcpPortsInfoTmp: any = checkPorts(
            params?.tcpPorts?.split(",") || [],
          );
          if (tcpPortsInfoTmp?.length && tcpPortsInfoTmp.length > 1) {
            const portsTmp: any =
              tcpPortsInfoTmp[1].map((item: any) => ({
                port: item,
                type: "tcp",
              })) || [];
            tcpPorts = [...portsTmp];
          }
        }
      }
    }
    const samePorts = checkHttpTcpPortSame(
      allHttpPorts.filter((el: any) => el && el.trim()),
      allTcpPorts.filter((el: any) => el && el.trim()),
    );
    if (samePorts) {
      message.error(samePorts);
      return;
    }
    // if (tcpPorts.length > 10) {
    //   message.error("HttpPort field must have less than or equal to 10 items.");
    //   return;
    // }
    // const httpPorts: any = [];
    // const httpPortsArr: any = params.httpPorts.split(",") || [];
    // httpPortsArr.forEach((item: any) => {
    //   if (item) {
    //     httpPorts.push({type: "http", port: Number(item)});
    //   }
    // });
    // const tcpPorts: any = [];
    // const tcpPortsArr: any = params.tcpPorts.split(",") || [];
    // tcpPortsArr.forEach((item: any) => {
    //   if (item) {
    //     tcpPorts.push({type: "tcp", port: Number(item)});
    //   }
    // });
    if (
      instanceInfo.billingMode === "monthly" &&
      (Number(params.diskSize) - Number(originDiskSize) > 0 ||
        Number(params.rootfsSize) > 0)
    ) {
      setDealParamsInfo({
        originRootfsSize: originRootfsSize,
        originDiskSize: originDiskSize,
        httpPorts: httpPorts,
        tcpPorts: tcpPorts,
      });
      setExpandSizeInfo({
        showModal: true,
        instanceInfoObj: instanceInfo,
        expandSize: Number(params.rootfsSize),
      });
    } else {
      editInstanceMainFun(
        originDiskSize,
        originRootfsSize,
        httpPorts,
        tcpPorts,
      );
    }
  }
  const checkHttpError = useCallback(() => {
    let httpPorts: any = [];
    const httpTools: any =
      instanceInfo?.tools
        ?.filter((ele: any) => ele.type === "http")
        .map((item: any) => item.port + "") || [];
    if (params?.httpPorts) {
      const httpPortsInfo: any = checkPorts(
        (params?.httpPorts?.split(",") || []).concat(httpTools),
      );
      if (httpPortsInfo?.length) {
        if (httpPortsInfo[0]) {
          return httpPortsInfo[0];
        } else {
          const portsTmp: any =
            httpPortsInfo[1].map((item: any) => ({
              port: item,
              type: "http",
            })) || [];
          httpPorts = [...portsTmp];
        }
      }
    }
    if (httpPorts.length > 10) {
      return `${"HttpPort field must have less than or equal to 10 items."}`;
    }
    return "";
  }, [instanceInfo?.tools, params?.httpPorts]);
  const [httpError, setHttpError] = useState("");
  const checkTcpError = useCallback(() => {
    const tcpTools: any =
      instanceInfo?.tools
        ?.filter((ele: any) => ele.type === "tcp")
        .map((item: any) => item.port + "") || [];
    if (params?.tcpPorts) {
      const tcpPortsInfo: any = checkPorts(
        (params?.tcpPorts?.split(",") || []).concat(tcpTools),
      );
      if (tcpPortsInfo?.length) {
        if (tcpPortsInfo[0]) {
          return tcpPortsInfo[0];
        }
      }
    }
    return "";
  }, [instanceInfo?.tools, params?.tcpPorts]);
  const [tcpError, setTcpError] = useState("");
  useEffect(() => {
    const error = checkHttpError();
    setHttpError(error);
  }, [checkHttpError, params.httpPorts]);
  useEffect(() => {
    const error = checkTcpError();
    setTcpError(error);
  }, [checkTcpError, params.tcpPorts]);
  function editInstanceMainFun(
    originDiskSize?: any,
    originRootfsSize?: any,
    httpPorts?: any,
    tcpPorts?: any,
  ) {
    if (btnLoading) {
      return new Promise((resolve, reject) => {
        reject(false);
      });
    }
    setBtnLoading(true);
    return reqEditInstance({
      instanceId: instanceInfo.id,
      instanceParams: {
        expandDataDisk:
          Number(params.diskSize) -
          Number(originDiskSize || dealParamsInfo.originDiskSize),
        ports: [
          ...(httpPorts || dealParamsInfo.httpPorts),
          ...(tcpPorts || dealParamsInfo.tcpPorts),
        ],
        expandRootDisk: Number(params.rootfsSize),
      },
    })
      .then(() => {
        message.success("Success");
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
      editInstanceMainFun().then(() => {
        setExpandSizeInfo((prev: any) => ({ ...prev, showModal: false }));
      });
    }
  }
  function getTipTxt() {
    if (instanceInfo?.billingMode === "monthly") {
      return Number(instanceInfo?.rootfsSize || 0) +
        Number(instanceInfo?.diskSize || 0) +
        Number(params.rootfsSize || 0) >
        Math.max(
          Number(instanceInfo?.rootfsSize || 0) +
            Number(instanceInfo?.diskSize || 0),
          Number(instanceInfo?.freeStorageSize || 0),
        )
        ? `Additional storage costs: $${(
            Math.round(
              (Number(instanceInfo?.rootfsSize || 0) +
                Number(instanceInfo?.diskSize || 0) +
                Number(params.rootfsSize || 0) -
                Math.max(
                  Number(instanceInfo?.rootfsSize || 0) +
                    Number(instanceInfo?.diskSize || 0),
                  Number(instanceInfo?.freeStorageSize || 0),
                )) *
                Number(instanceInfo?.exitedLocalStoragePrice || 0),
            ) / 100000
          ).toFixed(commonTips.storagePriceDot)} /day`
        : "No additional storage costs";
    } else {
      return Number(instanceInfo?.rootfsSize || 0) +
        Number(instanceInfo?.diskSize || 0) +
        Number(params.rootfsSize || 0) >
        Number(instanceInfo?.freeStorageSize || 0)
        ? `Additional storage costs: $${(
            Math.round(
              (Number(instanceInfo?.rootfsSize || 0) +
                Number(instanceInfo?.diskSize || 0) +
                Number(params.rootfsSize || 0) -
                Number(instanceInfo?.freeStorageSize || 0)) *
                Number(instanceInfo?.exitedLocalStoragePrice || 0),
            ) / 100000
          ).toFixed(commonTips.storagePriceDot)} /day`
        : "No additional storage costs";
    }
  }
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>{"Edit Instance"}</h1>
        <div>
          <div className={styles.funcDesc}>
            {"You can edit while the instance is running ,you won't lose data."}
          </div>
          {/* <div className={styles.volDiskTxt}>
          <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
            *
          </span>
          {"Volume Disk"}
        </div>
        {Number(
          (
            instanceInfo?.volumeMounts?.find(
              (item: any) => item.type === "local",
            ) || { size: 0 }
          ).size,
        ) === 0 ? (
          <span>
            The volume disk was not mounted. If you need to mount it again,
            please click{" "}
            <a
              // style={{ color: "var(--brand-0)" }}
              className={styles.textLink}
              href="javascript:void(0);"
              onClick={() => reOpenUpgrade()}
            >
              Upgrade
            </a>{" "}
            to operate.
          </span>
        ) : (
          <>
            <MyTextField
              disabled={
                Number(
                  (
                    instanceInfo?.volumeMounts?.find(
                      (item: any) => item.type === "local",
                    ) || { size: 0 }
                  ).size,
                ) === 0
              }
              sx={{ height: 48, borderRadius: 8 }}
              className={styles.bolDiskInput}
              placeholder={"Enter your volume disk size"}
              value={params.diskSize}
              onChange={(e: any) =>
                inputChangeParamsInfo("diskSize", e.target.value)
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <span style={{ color: "var(--dark-1)" }}>GB</span>
                  </InputAdornment>
                ),
              }}
            />
            {instanceInfo.billingMode === "monthly" && (
              <div className="text-sm text-[var(--dark-3)] mt-[8px]">
                <div>
                  {`Subscription Instance expansion requires prepayment of the expansion storage fee for the remaining period of the Subscription Instance. `}
                  <span className="text-[var(--red-1)]">
                    {`Price $${(
                      Math.round(
                        Number(instanceInfo?.exitedLocalStoragePrice || 0),
                      ) / 100000
                    ).toFixed(commonTips.storagePriceDot)}/GB/day`}
                  </span>
                </div>
              </div>
            )}
          </>
        )} */}
          <div className={styles.volDiskTxt}>
            <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
              *
            </span>
            Container Disk Expansion (Current {instanceInfoObj?.rootfsSize || 0}
            GB)
          </div>
          {
            <>
              <div className="flex justify-start items-center">
                <div className="mr-2">Expand: </div>
                <Input
                  {...{
                    disabled: instanceInfo?.status === "exited",
                    className: `${styles.bolDiskInput} ${
                      instanceInfo?.status === "exited"
                        ? styles.disabledInput
                        : ""
                    }
                  ${
                    isNaN(params.rootfsSize) ||
                    Number(params.rootfsSize) +
                      Number(instanceInfo?.rootfsSize || 0) >
                      Number(instanceInfo?.node?.maxRootfsSize || 0)
                      ? "error-textarea"
                      : ""
                  }`,
                    // i18n-disable-next-line
                    placeholder: "Enter your container disk expand size",
                    value: params.rootfsSize,
                    onChange: (e: any) =>
                      inputChangeParamsInfo("rootfsSize", e.target.value),
                    containerClassName: "w-1/2",
                    style: {
                      height: 52,
                      borderRadius: "var(--radius-input)",
                    },
                    suffix: <span style={{ color: "var(--dark-1)" }}>GB</span>,
                  }}
                />
                <Tooltip
                  zIndex={2000}
                  title={
                    <div>
                      <div>{getTipTxt()}</div>
                    </div>
                  }
                >
                  <span
                    className="iconfont icon-badge-info ml-2 inline-flex cursor-help"
                    style={{ color: "var(--dark-1)", fontSize: "16px" }}
                  />
                </Tooltip>
              </div>
              {(isNaN(params.rootfsSize) ||
                Number(params.rootfsSize) +
                  Number(instanceInfo?.rootfsSize || 0) >
                  Number(instanceInfo?.node?.maxRootfsSize || 0)) && (
                <div className={"ant-form-item-explain-error"}>
                  Please enter a valid size, current size after expanding can
                  not be greater than {instanceInfo?.node?.maxRootfsSize || 0}{" "}
                  GB
                </div>
              )}
              {instanceInfo?.status === "exited" && (
                <div className="flex justify-between gap-1 px-3 py-2 rounded-[var(--radius-input)] bg-common-gray-3 mt-[8px]">
                  <div className="w-4 shrink-0">
                    <span className="iconfont icon-badge-alert text-common-dark-2 text-[16px]"></span>
                  </div>
                  <div className="flex flex-col gap-2 grow">
                    <div className="text-common-dark-2 font-small-console">
                      <div>
                        The current instance has been shut down. When the
                        instance is running, you can adjust the system disk
                        capacity.
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {instanceInfo?.billingMode === "monthly" && (
                <div className="text-sm text-[var(--dark-3)] mt-[8px]">
                  <div>
                    {`Subscription Instance expansion requires prepayment of the expansion storage fee for the remaining period of the Subscription Instance.`}{" "}
                    <span className="text-[var(--red-1)]">
                      {`Price $${(Math.round(Number(instanceInfo?.exitedLocalStoragePrice || 0)) / 100000).toFixed(commonTips.storagePriceDot)}/GB/day`}
                    </span>
                  </div>
                </div>
              )}
            </>
          }
          <div style={{ marginTop: "24px" }}>
            <div>
              <div className={styles.httpPortsTxt}>
                {"Expose HTTP Ports (Max 10)"}
              </div>
              <Input
                className={`${styles.httpPortsInput} ${httpError ? "error-input" : ""}`}
                onChange={(e: any) =>
                  inputChangeParamsInfo("httpPorts", e.target.value)
                }
                value={params.httpPorts}
              />
              {httpError && (
                <div className={"ant-form-item-explain-error"}>{httpError}</div>
              )}
            </div>
            <div className="mt-3">
              <div className={styles.tcpPortsTxt}>{"Expose TCP Ports"}</div>
              <Input
                className={`${styles.tcpPortsInput} ${tcpError ? "error-input" : ""}`}
                onChange={(e: any) =>
                  inputChangeParamsInfo("tcpPorts", e.target.value)
                }
                value={params.tcpPorts}
              />
              {tcpError && (
                <div className={"ant-form-item-explain-error"}>{tcpError}</div>
              )}
            </div>
            {instanceInfo?.tools?.map((item: any) => item.port)?.length ===
            1 ? (
              <div className={styles.inUsePortTxt}>
                {dealParamsText("Port: ${0} is already in use", {
                  0: instanceInfo?.tools
                    ?.map((item: any) => item.port)
                    ?.join(","),
                })}
              </div>
            ) : (
              ""
            )}
            {instanceInfo?.tools?.map((item: any) => item.port)?.length > 1 ? (
              <div className={styles.inUsePortTxt}>
                {dealParamsText("Ports: ${0} are already in use", {
                  0: instanceInfo?.tools
                    ?.map((item: any) => item.port)
                    ?.join(","),
                })}
              </div>
            ) : (
              ""
            )}
          </div>

          <div className={styles.btnContainer}>
            <Button
              id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_EDIT_INSTANCE}
              className={styles.saveBtn}
              onClick={() => editInstanceFun()}
              variant="default"
            >
              <span className={styles.saveBtnTxt}>{"Save"}</span>
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
          style={{ padding: "0", width: "fit-content" }}
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
    </div>
  );
}

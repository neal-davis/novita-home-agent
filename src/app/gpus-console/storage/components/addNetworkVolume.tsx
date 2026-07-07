"use client";
import styles from "./addNetworkVolume.module.scss";
import {
  useEffect,
  useRef,
  useState,
  type RefObject,
  useCallback,
} from "react";
import React from "react";
import {
  reqCreateNetworkStorage,
  reqGpuStorageBaseInfo,
  reqUpdateNetworkStorage,
} from "@/api/gpu-instance/storage";
import { reqMarketProducts } from "@/api/gpu-instance/explore";
import { dealMoney } from "@/lib/utils/money";
import { message } from "@/components/ui/standard/notify";
// import { reqUserInfo } from "@/api/gpu-instance/userInfo";
import { reqBalanceTotal } from "@/api/gpu-instance/billing";
import { DISCORD_INVITE_LINK } from "@/constants/urls";
import { dealParamsText } from "@/lib/utils/utils";
import { Button as UButton } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import AddConfirm from "./addConfirm";
import Modal from "@/app/components/Modal/Modal";
function createCopyOut() {
  return {
    addNetVol: "+ New Network Volume",
    filterPlaceHolder: "Storage Name/ID Filter",
    rowsPerPage: "Rows per page:",
    editMenu: "Edit",
    deleteMenu: "Delete",
    deployBtnTxt: "Deploy",
    defaultStatusTxt: "All",
    creatorTxt: "Creator",
    creatTimeTxt: "Create Time",
    addNetVolModal: {
      createTitle: "Create Network Volume",
      editTitle: "Edit Network Volume",
      dataCenterTip: "Select Data Center",
      availableGpuTip: "Data Center GPU Availability",
      availableTxt: "Available",
      unavailableTxt: "None",
      volNameTitle: "Volume Name",
      volSizeTitle: "GB (minimum 10GB)",
      sizeTip11:
        "Network Volumes are charged at $${0}/GB per day, with a maximum of 4TB. Please",
      sizeTip12Desc: true,
      sizeTip12: "contact support",
      sizeTip13: "for larger volumes.",
      invalidCluster: "Please select a data center",
      invalidName: "Please input valid volume name",
      invalidSizeMin10: "Please input valid volume size must be at least 10 GB",
      invalidSizeMinLatest:
        "New volume size can not be smaller than the original size (${0} GB)",
      cancelBtnTxt: "Cancel",
      saveBtnTxt: "Save",
    },
    delNetVolModal: {
      title: "Delete Network Volume",
      mainDesc:
        'Delete the volume named "${0}". This action is irreversible! Confirm you want to permanently delete this Volume by entering it\'s name below.',
      enterNameTip: "Enter the name",
      enterNamePlaceholder: "Enter your storage name to delete",
      cancelBtnTxt: "Cancel",
      confirmBtnTxt: "Confirm",
    },
  };
}
const dictCommon = {
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
export default function AddNetworkVolume({
  openDiag = false,
  mode = "Add",
  info = {},
  finishOper,
  /** When nested inside another modal (e.g. Radix Dialog), portal into this node so content stays interactive (Radix modal/inert does not block it). */
  mountContainerRef,
}: {
  openDiag: boolean;
  mode: string; // "Add" | "Edit",
  info: any;
  finishOper: any;
  mountContainerRef?: RefObject<HTMLDivElement>;
}) {
  function handleClose() {
    finishOper(false);
  }
  const [clusterList, setClusterList] = useState<any>([]);
  const [products, setProducts] = useState([]);
  const [price, setPrice] = useState("");
  const [productsLoading, setProductsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [balanceTotal, setBalanceTotal] = useState<{
    credit: any;
    userBalance: any;
    voucherBalance: any;
    totalBalance: any;
  }>({
    credit: 0,
    userBalance: 0,
    voucherBalance: 0,
    totalBalance: 0,
  });
  const [paramsData, setParamsData] = useState({
    storageId: info?.storageId || undefined,
    clusterId: info?.clusterId || "",
    storageName: info?.storageName || "",
    storageSize: info?.storageSize || 10,
  });
  const prevAbortController = useRef<AbortController | undefined>();
  const getProducts = useCallback((clusterId: any) => {
    if (prevAbortController.current) {
      prevAbortController.current.abort("CanceledByUser");
    }
    const abortController = new AbortController();
    prevAbortController.current = abortController;
    setProductsLoading(true);
    reqMarketProducts(
      {
        cpuModel: "",
        memoryModel: "",
        cloudServiceType: "",
        cudaVersion: "",
        clusterId: clusterId,
        storageId: "",
        auth: true,
      },
      abortController.signal,
    )
      .then((res: any) => {
        setProducts(res?.products || []);
        setProductsLoading(false);
      })
      .catch((e: any) => {
        if (e !== "CanceledByUser") {
          setProductsLoading(false);
        }
      });
  }, []);
  useEffect(() => {
    reqBalanceTotal({ businessType: "gpu_instance" })
      .then((response: any) => {
        setBalanceTotal({
          credit: Number(response.credit),
          totalBalance: Number(response.totalBalance),
          userBalance: Number(response.userBalance),
          voucherBalance: Number(response.voucherBalance),
        });
      })
      .catch(() => {
        setBalanceTotal({
          credit: 0,
          totalBalance: 0,
          userBalance: 0,
          voucherBalance: 0,
        });
      });
  }, []);
  useEffect(() => {
    reqGpuStorageBaseInfo({})
      .then((res: any) => {
        const clusterArr: any = res?.clusters || [];
        setClusterList(clusterArr);
        if (clusterArr.length) {
          const useableArr: any =
            clusterArr.filter((item: any) => item.supportNetStorage) || [];
          if (useableArr.length === 1) {
            setParamsData((prev) => ({ ...prev, clusterId: useableArr[0].id }));
            getProducts(useableArr[0].id);
          } else {
            getProducts("");
          }
        } else {
          getProducts("");
        }
        let price = res?.price || "";
        if (
          !isNaN(Number(price)) &&
          price !== "" &&
          price.trim &&
          price.trim() !== ""
        ) {
          price = dealMoney(Number(price), 5).toFixed(
            dictCommon.storagePriceDot,
          );
        }
        setPrice(price);
      })
      .catch(() => {
        getProducts("");
      });
  }, [getProducts]);
  function createStorageClick() {
    if (isSubmitting) {
      return;
    }
    if (!paramsData.clusterId) {
      message.error(`${"Please select a data center"}`);
      return;
    }
    if (!paramsData.storageName || paramsData.storageName.trim() === "") {
      setNameInit(true);
      setNameError(`${"Please input valid volume name"}`);
      message.error(`${"Please input valid volume name"}`);
      return;
    }
    if (
      paramsData.storageSize === "" ||
      isNaN(paramsData.storageSize) ||
      Number(paramsData.storageSize) < 10
      //  ||
      // Number(paramsData.storageSize) > 4096
    ) {
      setSizeError(
        `${"Please input valid volume size must be at least 10 GB"}`,
      );
      message.error(
        `${"Please input valid volume size must be at least 10 GB"}`,
      );
      return;
    }
    if (mode === "Add") {
      setShowConfirm(true);
    } else {
      createStorage();
    }
  }
  function createStorage() {
    if (!paramsData.clusterId) {
      message.error(`${"Please select a data center"}`);
      return;
    }
    if (!paramsData.storageName || paramsData.storageName.trim() === "") {
      message.error(`${"Please input valid volume name"}`);
      return;
    }
    if (
      paramsData.storageSize === "" ||
      isNaN(paramsData.storageSize) ||
      Number(paramsData.storageSize) < 10
      //  ||
      // Number(paramsData.storageSize) > 4096
    ) {
      message.error(
        `${"Please input valid volume size must be at least 10 GB"}`,
      );
      return;
    }
    if (mode === "Edit") {
      if (Number(paramsData.storageSize) < Number(info.storageSize || 0)) {
        setSizeError(
          `${dealParamsText(
            "New volume size can not be smaller than the original size (${0} GB)",
            {
              0: info.storageSize,
            },
          )}`,
        );
        message.error(
          `${dealParamsText(
            "New volume size can not be smaller than the original size (${0} GB)",
            {
              0: info.storageSize,
            },
          )}`,
        );
        return;
      }
    }
    if (mode === "Add") {
      if (
        Number(balanceTotal.credit || 0) +
          Number(balanceTotal.userBalance || 0) +
          Number(balanceTotal.voucherBalance || 0) <=
        0
      ) {
        message.error("Balance is not enough.");
        return;
      }
    } else if (mode === "Edit") {
      if (
        Number(balanceTotal.credit || 0) +
          Number(balanceTotal.userBalance || 0) +
          Number(balanceTotal.voucherBalance || 0) <=
        0
      ) {
        message.error("Balance is not enough.");
        return;
      }
    }
    if (mode === "Add") {
      setIsSubmitting(true);
      reqCreateNetworkStorage({
        clusterId: paramsData.clusterId,
        storageName: paramsData.storageName.trim(),
        storageSize: Number(paramsData.storageSize),
      })
        .then((res) => {
          finishOper(true, {
            storageId: res.storageId,
            storageName: res.storageName,
            clusterId: res.clusterId,
          });
          setIsSubmitting(false);
        })
        .catch(() => {
          setIsSubmitting(false);
        });
    }
    if (mode === "Edit") {
      setIsSubmitting(true);
      reqUpdateNetworkStorage({
        storageId: paramsData.storageId,
        storageName: paramsData.storageName,
        storageSize: Number(paramsData.storageSize),
      })
        .then(() => {
          finishOper(true);
          setIsSubmitting(false);
        })
        .catch(() => {
          setIsSubmitting(false);
        });
    }
  }
  const [sizeError, setSizeError] = useState("");
  const checkSizeError = useCallback(() => {
    if (mode === "Add") {
      if (
        paramsData.storageSize === "" ||
        isNaN(paramsData.storageSize) ||
        Number(paramsData.storageSize) < 10
      ) {
        return `${"Please input valid volume size must be at least 10 GB"}`;
      }
    } else {
      if (Number(paramsData.storageSize) < Number(info.storageSize || 0)) {
        return `${dealParamsText(
          "New volume size can not be smaller than the original size (${0} GB)",
          {
            0: info.storageSize,
          },
        )}`;
      }
    }
    return "";
  }, [info.storageSize, mode, paramsData.storageSize]);
  useEffect(() => {
    const error = checkSizeError();
    setSizeError(error);
  }, [paramsData.storageSize, mode, info.storageSize, checkSizeError]);

  const [nameError, setNameError] = useState("");
  const checkNameError = useCallback(() => {
    if (!paramsData.storageName || paramsData.storageName.trim() === "") {
      return `${"Please input valid volume name"}`;
    }
    return "";
  }, [paramsData.storageName]);
  useEffect(() => {
    const error = checkNameError();
    setNameError(error);
  }, [paramsData.storageName, mode, info.storageName, checkNameError]);

  function changeParams(item: string, value: any) {
    if (item === "storageSize") {
      if (/^[1-9]\d*$/.test(value) || value === "") {
        setParamsData({ ...paramsData, [item]: value });
        return;
      }
    } else {
      setParamsData({ ...paramsData, [item]: value });
      if (item === "clusterId") {
        getProducts(value);
      }
    }
  }
  const [showConfirm, setShowConfirm] = useState(false);
  const confirmMountRef = useRef<HTMLDivElement>(null);
  function handleConfirm(mark?: boolean) {
    setShowConfirm(false);
    if (mark) {
      createStorage();
    }
  }
  const [nameInit, setNameInit] = useState(false);
  return (
    <React.Fragment>
      {mountContainerRef ? <div ref={mountContainerRef} /> : null}
      <Modal
        open={openDiag}
        title={mode === "Add" ? "Create Network Volume" : "Edit Network Volume"}
        footer={null}
        width={870}
        className={styles.addNetworkVolumeModal}
        maskClosable={false}
        onCancel={handleClose}
      >
        <div
          style={{
            backgroundColor: "var(--white)",
            color: "var(--black)",
            padding: "var(--spacing-console-24)",
          }}
        >
          <div>
            <div
              className={styles.sizeTip}
              style={{ marginTop: "0px", marginBottom: "20px" }}
            >
              <div className="flex justify-between gap-1 px-3 py-2 rounded-[var(--radius-input)] bg-common-gray-3">
                <div className="w-4 shrink-0">
                  <span className="iconfont icon-badge-alert text-common-dark-2 text-[16px]"></span>
                </div>
                <div className="flex flex-col gap-2 grow">
                  <div className="text-common-dark-2 font-small-console">
                    <div>
                      Please note that if your account is in arrears and no
                      instances are running, your Network Volume will be{" "}
                      {
                        <section className="inline text-[#000]">
                          released 3 days later.
                        </section>
                      }
                    </div>
                    <div>
                      Network Volume is provided in the pursuit of running tasks
                      using its GPUs and is{" "}
                      {
                        <section className="inline text-[#000]">
                          not meant to be a long-term backup solution.
                        </section>
                      }{" "}
                      It is highly advisable to continually back up anything you
                      want to save offsite locally or to a cloud provider.
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.subTitle}>{"Select Data Center"}</div>
            <div className={styles.dataCenterWrap}>
              {clusterList.map((item: any, index: number) => (
                <span
                  key={index}
                  className={styles.dataCenterItem}
                  style={{
                    cursor:
                      item.supportNetStorage && mode !== "Edit"
                        ? "pointer"
                        : "not-allowed",
                    background:
                      item.supportNetStorage && mode !== "Edit"
                        ? "var(--white)"
                        : "var(--gray-3)",
                    // paramsData.clusterId === clusterList[index].id
                    //   ? "var(--brand-2)"
                    //   : item.supportNetStorage
                    //     ? "none"
                    //     : "rgba(241, 242, 244, 0.1)",
                    // opacity:
                    //   item.supportNetStorage && mode !== "Edit" ? 1 : "0.6",
                    border: item.supportNetStorage
                      ? "1px solid var(--dark-1)"
                      : "1px solid (--gray-3)",
                    // paramsData.clusterId === clusterList[index].id
                    //   ? "1px solid var(--brand-0)"
                    //   : "1px solid #d9dbe9",
                  }}
                  onClick={() =>
                    item.supportNetStorage &&
                    mode !== "Edit" &&
                    changeParams("clusterId", clusterList[index].id)
                  }
                >
                  {paramsData.clusterId === clusterList[index].id ? (
                    <img
                      alt=""
                      style={{
                        position: "absolute",
                        top: "-1px",
                        right: "-1px",
                      }}
                      src={
                        item.supportNetStorage
                          ? "/gpu-instance/storage/icon-storage-checked.svg"
                          : "/gpu-instance/storage/icon-storage-checked-disabled.svg"
                      }
                    />
                  ) : (
                    ""
                  )}
                  <div
                    className={styles.dataCenterName}
                    style={{
                      color: item.supportNetStorage
                        ? "var(--black)"
                        : "var(--dark-3)",
                    }}
                  >
                    {item.name}
                  </div>
                  {item.continent ? (
                    <div
                      className={styles.continent}
                      style={{
                        color: item.supportNetStorage
                          ? "var(--black)"
                          : "var(--dark-3)",
                      }}
                    >
                      {item.continent}
                    </div>
                  ) : (
                    ""
                  )}
                </span>
              ))}
            </div>
            <div className={styles.subTitleContainer}>
              <div className={styles.subTitle}>
                {"Data Center GPU Availability"}
              </div>
            </div>
            <div className={styles.avaliableWrap}>
              <div style={{ padding: "8px 0" }}>
                <div className={styles.avaliableTitle}>{"Available"}</div>
              </div>
              <div className={styles.avaliable}>
                {productsLoading ? (
                  <div className={styles.avaliableContent}>{"Loading..."}</div>
                ) : (
                  products.map(
                    (item: any, index: number) =>
                      item?.usableNode && (
                        <div key={index} className={styles.avaliableContent}>
                          {item.productName}
                        </div>
                      ),
                  )
                )}
              </div>
            </div>
            <div
              className={`${styles.avaliableWrap} ${styles.unAvaliableWrap}`}
            >
              <div style={{ padding: "8px 0" }}>
                <div className={styles.unAvaliableTitle}>{"None"}</div>
              </div>
              <div className={styles.unAvaliable}>
                {!productsLoading &&
                  products.map(
                    (item: any, index: number) =>
                      !item?.usableNode && (
                        <div key={index} className={styles.unAvaliableContent}>
                          {item.productName}
                        </div>
                      ),
                  )}
              </div>
            </div>

            <div className="flex">
              <div className={styles.half}>
                <div className={styles.halfTitle}>
                  <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                    *
                  </span>
                  {"Volume Name"}
                </div>
                <Input
                  placeholder={"Volume Name"}
                  className={`${styles.halfInput} ${nameInit && nameError ? "error-input" : ""}`}
                  value={paramsData.storageName}
                  onChange={(e: any) => {
                    changeParams("storageName", e.target.value);
                    setNameInit(true);
                  }}
                />
                {nameInit && nameError && (
                  <div className={"ant-form-item-explain-error"}>
                    {nameError}
                  </div>
                )}
              </div>
              <div className={styles.otherHalf}>
                <div className={styles.otherHalfTitle}>
                  <span className="text-[var(--red-1)] mr-1 text-sm align-sub leading-[6px]">
                    *
                  </span>
                  {"GB (minimum 10GB)"}
                </div>
                <Input
                  className={`${styles.otherHalfInput} ${sizeError ? "error-input" : ""}`}
                  value={paramsData.storageSize}
                  onChange={(e: any) =>
                    changeParams("storageSize", e.target.value)
                  }
                />
                {sizeError && (
                  <div className={"ant-form-item-explain-error"}>
                    {sizeError}
                  </div>
                )}
              </div>
            </div>
            <div className={styles.sizeTip}>
              {dealParamsText(
                "Network Volumes are charged at $${0}/GB per day, with a maximum of 4TB. Please",
                { 0: price },
              )}
              &nbsp;
              {true ? (
                <UButton
                  className={styles.textLink}
                  variant="text"
                  onClick={() => window.open(DISCORD_INVITE_LINK)}
                >
                  {"contact support"}
                </UButton>
              ) : (
                <UButton
                  className={styles.textLink}
                  variant="text"
                  onClick={() => window.open("/contact")}
                >
                  {"contact support"}
                </UButton>
              )}
              &nbsp;
              {"for larger volumes."}
            </div>
          </div>
          <div className={styles.btnContainer}>
            <UButton
              className={styles.cancelBtn}
              variant="outline"
              onClick={handleClose}
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </UButton>
            <UButton
              className={styles.createBtn}
              variant="default"
              id={
                mode === "Add"
                  ? CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_CREATE_NETWORK_VOLUME
                  : CLICK_BTN_IDs.GPUS_CONSOLE.STORAGE_EDIT_STORAGE
              }
              onClick={() => !isSubmitting && createStorageClick()}
            >
              {!isSubmitting && (
                <span className={styles.createBtnTxt}>{"Save"}</span>
              )}
              {isSubmitting && (
                <div className={styles.loadingWrap}>
                  <img alt="" src="/gpu-instance/loading.gif" />
                </div>
              )}
            </UButton>
          </div>
        </div>
      </Modal>
      {showConfirm && (
        <AddConfirm
          openDiag={showConfirm}
          finishOper={handleConfirm}
          price={(
            Math.round(Number(price) * Number(paramsData.storageSize) * 1000) /
            1000
          ).toFixed(3)}
          mountContainerRef={mountContainerRef ? confirmMountRef : undefined}
        />
      )}
    </React.Fragment>
  );
}

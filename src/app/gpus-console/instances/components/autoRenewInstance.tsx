"use client";
import styles from "./autoRenewInstance.module.scss";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog";
import MonthlyPrice from "./monthlyPrice";
import { useEffect, useRef, useState } from "react";
import { reqGetProductMonthlyPricing } from "@/api/gpu-instance/explore";
import { sliceUTCString } from "@/lib/utils/date";
import { Switch } from "@/components/ui/switch";
// import dayjs from "dayjs";
import { reqSingleGpuInstance } from "@/api/gpu-instance/instances";
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
const detailTableClassName =
  "min-h-0 border border-solid border-[var(--border)]]";
const detailLabelCellClassName =
  "w-1/2 border-r border-[var(--border)] bg-[var(--gray-3)]";
const settlementLabelCellClassName =
  "border-r border-[var(--border)] bg-[var(--gray-3)]";
const durationSelectTriggerClassName = "h-7 w-[180px]";
const footerActionsClassName = "mt-[30px] mb-8";

export default function AutoRenewInstance({
  instanceIds,
  instanceInfoObj,
  btnLoading = false,
  finishForm,
}: {
  instanceIds: string[];
  instanceInfoObj?: any;
  btnLoading?: boolean;
  finishForm: any;
}) {
  const userEditedRef = useRef(false);
  const [params, setParams] = useState({
    instanceIds: instanceIds,
    instanceId: instanceInfoObj?.id,
    autoRenew: false,
    autoRenewMonth:
      instanceInfoObj.autoRenewMonth || instanceInfoObj.monthlyPrice[0].month,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [monthlyPrice, setMonthlyPrice] = useState({
    endTime: "",
    instanceAmount: "",
    storageAmount: "",
    instanceMonthPrice: "",
    instanceMonthPricePrecision: 0,
    storagePrice: "",
    storagePricePricePrecision: 0,
    gpuNum: 0,
    storageSize: 0,
    month: 0,
  });
  function changeMonthlyPrice(value: any) {
    userEditedRef.current = true;
    setParams((prev) => ({
      ...prev,
      autoRenewMonth: value || "",
    }));
    reqGetProductMonthlyPricing({
      instanceId: instanceInfoObj.id,
      productId: instanceInfoObj.productId,
      month: value || instanceInfoObj.monthlyPrice[0].month,
      gpuNum: instanceInfoObj.gpuNum,
      storageSize:
        Number(instanceInfoObj.rootfsSize) +
        (instanceInfoObj?.volumeMounts?.find(
          (item: any) => item.type === "local",
        )?.size || 0),
    }).then((res: any) => {
      if (res) {
        setMonthlyPrice(res);
      }
    });
  }
  useEffect(() => {
    userEditedRef.current = false;
  }, [instanceInfoObj.id]);

  useEffect(() => {
    let ignore = false;

    reqSingleGpuInstance(instanceInfoObj.id).then((res: any) => {
      if (ignore) {
        return;
      }

      const autoRenewMonth =
        res.autoRenewMonth ||
        res.monthlyPrice?.[0]?.month ||
        instanceInfoObj.monthlyPrice[0].month;

      setParams((prev) => {
        if (userEditedRef.current) {
          return {
            ...prev,
            instanceIds,
            instanceId: instanceInfoObj?.id,
          };
        }

        return {
          ...prev,
          instanceIds,
          instanceId: instanceInfoObj?.id,
          autoRenewMonth,
          autoRenew: res.autoRenew,
        };
      });
      reqGetProductMonthlyPricing({
        instanceId: instanceInfoObj.id,
        productId: instanceInfoObj.productId,
        month: autoRenewMonth,
        gpuNum: instanceInfoObj.gpuNum,
        storageSize:
          Number(instanceInfoObj.rootfsSize) +
          (instanceInfoObj?.volumeMounts?.find(
            (item: any) => item.type === "local",
          )?.size || 0),
      }).then((res: any) => {
        if (ignore) {
          return;
        }

        if (res) {
          setMonthlyPrice(res);
        }
      });
    });

    return () => {
      ignore = true;
    };
  }, [
    instanceInfoObj.gpuNum,
    instanceInfoObj.id,
    instanceInfoObj.monthlyPrice,
    instanceInfoObj.productId,
    instanceInfoObj.rootfsSize,
    instanceInfoObj?.volumeMounts,
    instanceIds,
  ]);
  const renderMonthValue = (
    selected: any,
    badgeSizeClassName = "text-[10px]",
  ) => {
    let ret: any = "";
    let curItem: any = null;
    if (selected) {
      curItem = instanceInfoObj.monthlyPrice.find(
        (item: any) => Number(item.month) === Number(selected),
      );
      if (curItem) {
        ret = curItem.month + " " + (curItem.month > 1 ? "months" : "month");
      } else {
        ret = selected + " " + (selected > 1 ? "months" : "month");
      }
    }
    return (
      <span className="font-subtle flex items-center">
        {ret}
        {curItem &&
          Number(
            (
              (Number(curItem.price) /
                Number(curItem.pricePrecision || 1) /
                10000 /
                ((Number(instanceInfoObj.instanceBasePrice || 1) / 100000) *
                  24 *
                  30)) *
              10
            ).toFixed(1),
          ) < 10 && (
            <span
              className={`ml-1 inline-flex h-[14px] items-center justify-center rounded-[6px_0] bg-[var(--red-3)] p-1 font-normal leading-5 text-[var(--brand-7,#F4F8FF)] ${badgeSizeClassName}`}
            >
              {(
                100 -
                (Number(curItem.price) /
                  Number(curItem.pricePrecision || 1) /
                  10000 /
                  ((Number(instanceInfoObj.instanceBasePrice || 1) / 100000) *
                    24 *
                    30)) *
                  100
              ).toFixed(0)}
              % OFF
            </span>
          )}
      </span>
    );
  };
  return (
    <div className={`${styles.subContainer} relative`}>
      <div className={styles.line}></div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirm"
        description="Confirm current operation?"
        confirmClassName={styles.confirmOkBtn}
        cancelClassName={styles.confirmCancelBtn}
        onConfirm={() => {
          finishForm(true, { ...params, instanceId: undefined });
        }}
      />
      <div className={styles.section}>
        <h1 className={styles.title}>{"Manage Auto-renew"}</h1>
        <div>
          <div className={styles.subtitle}>
            <Table className={detailTableClassName}>
              <TableBody>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Instance ID "}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {instanceInfoObj.id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"GPU"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {instanceInfoObj.productName} * {instanceInfoObj.gpuNum}
                  </TableCell>
                </TableRow>
                {instanceInfoObj.billingMode === "monthly" && (
                  <TableRow>
                    <TableCell
                      className={`${styles.table_cell} ${detailLabelCellClassName}`}
                    >
                      {"Current expiration time"}
                    </TableCell>
                    <TableCell className={styles.table_cell}>
                      {Number(instanceInfoObj.endTime) > 0 &&
                        sliceUTCString(
                          new Date(
                            Number(instanceInfoObj.endTime) * 1000,
                          ).toUTCString(),
                          "second",
                        )}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <div className={`${styles.subtitle} !mt-[0px]`}>
            <Table className={detailTableClassName}>
              <TableBody>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Auto-renew"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    <Switch
                      checked={params.autoRenew}
                      onCheckedChange={(checked: boolean) => {
                        userEditedRef.current = true;
                        setParams((prev) => ({
                          ...prev,
                          autoRenew: checked,
                        }));
                      }}
                    />
                  </TableCell>
                </TableRow>
                {params.autoRenew && (
                  <>
                    <TableRow>
                      <TableCell
                        className={`${styles.table_cell} ${detailLabelCellClassName}`}
                      >
                        {"Renewal duration"}
                      </TableCell>
                      <TableCell className={styles.table_cell}>
                        <Select
                          value={String(params.autoRenewMonth)}
                          onValueChange={(value) => {
                            changeMonthlyPrice(Number(value));
                          }}
                        >
                          <SelectTrigger
                            className={`${styles.topSelectSearch} ${durationSelectTriggerClassName}`}
                          >
                            {renderMonthValue(params.autoRenewMonth)}
                          </SelectTrigger>
                          <SelectContent>
                            {instanceInfoObj.monthlyPrice.map((item: any) => (
                              <SelectItem
                                className={styles.menuItem}
                                key={item.month}
                                value={String(item.month)}
                              >
                                {renderMonthValue(item.month, "text-[9px]")}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className={`${styles.table_cell} ${detailLabelCellClassName}`}
                      >
                        {"Unit price"}
                      </TableCell>
                      <TableCell className={styles.table_cell}>
                        {`$ ${(
                          Number(monthlyPrice?.instanceMonthPrice || 0) /
                          Number(
                            monthlyPrice?.instanceMonthPricePrecision || 1,
                          ) /
                          10000
                        ).toFixed(commonTips.gpuPriceDot)} /month`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        className={`${styles.table_cell} ${settlementLabelCellClassName}`}
                      >
                        {"Next renewal time"}
                      </TableCell>
                      <TableCell className={styles.table_cell}>
                        {Number(monthlyPrice.endTime) > 0 &&
                          sliceUTCString(
                            new Date(
                              Number(monthlyPrice.endTime) * 1000,
                            ).toUTCString(),
                            "second",
                          )}
                      </TableCell>
                    </TableRow>
                  </>
                )}
              </TableBody>
            </Table>
            {params.autoRenew && (
              <div className="font-small-console text-[var(--dark-2)] mt-[8px]">
                We will attempt charge 3 days before expiration
              </div>
            )}
          </div>
          <div>
            <div className="flex justify-between items-center font-subtle-medium mb-[12px]">
              <span className="text-[var(--dark-1)]">
                {"Estimated Renewal Amount"}
              </span>
              <Tooltip
                title={<MonthlyPrice monthlyPriceInfo={monthlyPrice} />}
                placement="topRight"
                overlayClassName={styles.tooltip}
              >
                <span className="text-[var(--brand-0)]">{"Details"}</span>
              </Tooltip>
            </div>
            <div>
              <Table className={detailTableClassName}>
                <TableBody>
                  <TableRow>
                    <TableCell
                      className={`${styles.table_cell} ${detailLabelCellClassName}`}
                    >
                      {"GPU fee"}
                    </TableCell>
                    <TableCell className={styles.table_cell}>
                      {params.autoRenew
                        ? `$ ${(Number(monthlyPrice?.instanceAmount || 0) / 10000).toFixed(2)}`
                        : "/"}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell
                      className={`${styles.table_cell} ${detailLabelCellClassName}`}
                    >
                      {"Storage fee"}
                    </TableCell>
                    <TableCell className={styles.table_cell}>
                      {params.autoRenew
                        ? `$ ${(Number(monthlyPrice?.storageAmount || 0) / 10000).toFixed(3)}`
                        : "/"}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div className={footerActionsClassName}>
            {btnLoading ? (
              <Button className={styles.upgradeDisabledBtn} variant="default">
                <img
                  className={styles.upgradeOperatingBtn}
                  alt="loading"
                  src="/gpu-instance/loading.gif"
                />
                <span className={styles.upgradeDisabledBtnTxt}>
                  {"Processing"}
                </span>
              </Button>
            ) : (
              <Button
                className={styles.upgradeBtn}
                onClick={() => {
                  setConfirmOpen(true);
                }}
                variant="default"
              >
                <span className={styles.upgradeBtnTxt}>{"Confirm"}</span>
              </Button>
            )}
            <Button
              onClick={() => finishForm(false, params)}
              className={styles.cancelBtn}
              variant="default"
            >
              <span className={styles.cancelBtnTxt}>{"Cancel"}</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

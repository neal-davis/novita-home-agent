"use client";
import styles from "./expansionInstance.module.scss";
import { Button } from "@/components/ui/button";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { useEffect, useState } from "react";
import { reqGetProductExpandAmount } from "@/api/gpu-instance/explore";
import { sliceUTCString } from "@/lib/utils/date";
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
const footerActionsClassName = "mt-[30px] mb-8";

export default function ExpansionInstance({
  instanceInfoObj,
  finishForm,
  expandSize,
}: {
  instanceInfoObj: any;
  finishForm: any;
  expandSize: number;
}) {
  const [result, setResult] = useState({
    remainDays: 0,
    amount: "0",
    currentSize: "",
    freeSize: "",
  });
  useEffect(() => {
    reqGetProductExpandAmount({
      instanceId: instanceInfoObj.id,
      expandSize: expandSize,
    }).then((res: any) => {
      if (res) {
        setResult(res);
      }
    });
  }, [expandSize, instanceInfoObj.id]);
  return (
    <div className={`${styles.subContainer} relative`}>
      <div className={styles.line}></div>
      <div className={styles.section}>
        <h1 className={styles.title}>
          {"Subscription Instance expansion billing"}
        </h1>
        <div>
          <div className={styles.subtitle}>
            <Table className={detailTableClassName}>
              <TableBody>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Instance ID"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {instanceInfoObj.id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Expiration time"}
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
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Storage price"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    $
                    {(
                      Math.round(
                        Number(instanceInfoObj?.exitedLocalStoragePrice || 0),
                      ) / 100000
                    ).toFixed(commonTips.storagePriceDot)}{" "}
                    /GB/day
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Remaining rental period"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {result.remainDays}{" "}
                    {Number(result.remainDays || 0) > 1 ? "days" : "day"}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Expansion capacity"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {expandSize} GB
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Free capacity"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {result.freeSize} GB
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    className={`${styles.table_cell} ${detailLabelCellClassName}`}
                  >
                    {"Used capacity"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    {result.currentSize} GB
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div>
            <div className="flex justify-between items-center mb-[12px] font-subtle-medium">
              <span className="text-[var(--dark-1)]">
                {"Settlement Amount"}
              </span>
            </div>
            <div>
              <Table className={detailTableClassName}>
                <TableBody>
                  <TableRow>
                    <TableCell
                      className={`${styles.table_cell} ${detailLabelCellClassName}`}
                    >
                      {"Expansion fee"}
                    </TableCell>
                    <TableCell className={styles.table_cell}>
                      {`$ ${(Number(result?.amount || 0) / 10000).toFixed(2)}`}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
          <div className={footerActionsClassName}>
            <Button
              className={styles.upgradeBtn}
              onClick={() => finishForm(true)}
              variant="default"
            >
              <span className={styles.upgradeBtnTxt}>{"Confirm"}</span>
            </Button>
            <Button
              onClick={() => finishForm(false)}
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

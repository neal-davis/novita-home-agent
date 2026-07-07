"use client";

import styles from "./autoRenewInstanceBat.module.scss";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Table, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

export default function AutoRenewInstanceBat({
  instanceIds,
  btnLoading = false,
  finishForm,
}: {
  instanceIds: string[];
  btnLoading?: boolean;
  finishForm: any;
}) {
  const [params, setParams] = useState({
    instanceIds: instanceIds,
    autoRenew: false,
    autoRenewMonth: 1,
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  return (
    <div className={styles.subContainer} style={{ position: "relative" }}>
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
        <h1 className={styles.title}>{"Bulk Auto-renew"}</h1>
        <div>
          <div className={`${styles.subtitle}`}>
            <Table
              className="border border-solid border-[var(--border)]]"
              style={{ minHeight: "none" }}
            >
              <TableBody>
                <TableRow>
                  <TableCell
                    className={styles.table_cell}
                    style={{
                      borderRight: "1px solid var(--border)",
                      width: "50%",
                      backgroundColor: "var(--gray-3)",
                    }}
                  >
                    {"Auto-renew"}
                  </TableCell>
                  <TableCell className={styles.table_cell}>
                    <Switch
                      checked={params.autoRenew}
                      onCheckedChange={(checked: boolean) => {
                        setParams({
                          ...params,
                          autoRenew: checked,
                        });
                      }}
                    />
                  </TableCell>
                </TableRow>
                {params.autoRenew && (
                  <TableRow>
                    <TableCell
                      className={styles.table_cell}
                      style={{
                        borderRight: "1px solid var(--border)",
                        width: "50%",
                        backgroundColor: "var(--gray-3)",
                      }}
                    >
                      {"Renewal duration"}
                    </TableCell>
                    <TableCell className={styles.table_cell}>
                      <Select
                        value={String(params.autoRenewMonth)}
                        onValueChange={(value) => {
                          setParams({
                            ...params,
                            autoRenewMonth: Number(value),
                          });
                        }}
                      >
                        <SelectTrigger
                          className={styles.topSelectSearch}
                          style={{ width: "180px", height: "28px" }}
                        >
                          <span className="font-subtle flex items-center">
                            {params.autoRenewMonth}&nbsp;
                            {params.autoRenewMonth > 1 ? "months" : "month"}
                          </span>
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                            (item: any) => (
                              <SelectItem
                                className={styles.menuItem}
                                key={item}
                                value={String(item)}
                              >
                                <span className="flex items-center">
                                  {item + " " + (item > 1 ? "months" : "month")}
                                </span>
                              </SelectItem>
                            ),
                          )}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="font-small-console text-[var(--dark-2)] mt-[8px]">
              Scope: This operation will apply to{" "}
              <span className="font-small-medium text-[var(--brand-0)]">
                {instanceIds.length}
              </span>{" "}
              instances. Different expiration dates are supported. The system
              will automatically renew each instance based on its respective
              expiration date.
            </div>
          </div>
          <div>
            <div className="px-[14px] py-[6px] rounded-[4px] bg-[var(--red-7)]">
              <div className="font-small-console text-[var(--dark-1)]">
                Warning: Failed payments due to low balance are retried daily.
                If unresolved by the due date, billing will switch to
                Pay-As-You-Go
              </div>
            </div>
          </div>
          <div style={{ marginTop: "30px", marginBottom: "32px" }}>
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

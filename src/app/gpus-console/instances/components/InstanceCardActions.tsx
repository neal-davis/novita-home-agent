"use client";

import { Button } from "@/components/ui/button";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { message } from "@/components/ui/standard/notify";
import { reqInstanceMountList } from "@/api/gpu-instance/instances";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { showPermissionMessage } from "@/lib/utils/permission";
import { Ellipsis, CirclePause, CirclePlay } from "lucide-react";
import styles from "./section.module.scss";

const commonTips = {
  gpuPriceDot: 2,
};

// react-doctor-disable-next-line react-doctor/no-giant-component -- Encapsulates legacy instance action availability rules; further splitting risks behavior drift without dedicated coverage.
export default function InstanceCardActions({
  item,
  state,
  actions,
  modalActions,
  hasJobPermission,
  checkMarkedInstance,
}: any) {
  const { expandedId, dropdownOpen } = state;
  const { setDropdownOpen, menuClickHandler } = actions;
  const {
    setShowRenewInfo,
    setShowUpgradeInfo,
    setShowSaveImageInfo,
    setShowEditInfo,
    setShowRestartInfo,
    setShowMigrateInstanceInfo,
    setShowAutoMigrateInfo,
    setShowMountNetVolumeInfo,
    setShowTerminateInfo,
    setShowTransToMonthlyInfo,
    setShowSetAutoRenewInfo,
    setShowStartInfo,
    setShowStopInfo,
    setShowLogInfo,
    setShowConnectInfo,
  } = modalActions;

  return (
    <>
      {expandedId === item?.id && (
        <div className="flex justify-end gap-2 p-0">
          <div className={styles.cardFooter}>
            <div className={styles.rightButtonContainer}>
              {item.billingMode === "monthly" &&
                (item?.details?.monthlyPrice?.length || 0) > 0 && (
                  <Button
                    className={`!mr-2 ${styles.logsBtnTxt}`}
                    onClick={() => {
                      if (item?.details?.id) {
                        setShowRenewInfo({
                          showModal: true,
                          instanceInfo: item?.details || {},
                        });
                      }
                    }}
                  >
                    <span className="font-subtle text-[var(--black)]">
                      {"Renew"}
                    </span>
                  </Button>
                )}
              {item && item.details && (
                <DropdownMenu
                  open={dropdownOpen && expandedId === item?.id}
                  onOpenChange={(open) => menuClickHandler(open)}
                >
                  <DropdownMenuTrigger asChild>
                    <Button className={`!mr-2 ${styles.logsBtnTxt}`}>
                      <Ellipsis className="w-4 h-4 mr-1 shrink-0 text-[var(--dark-1)]" />

                      <span className="font-subtle text-[var(--black)]">
                        {"More"}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    side="bottom"
                    align="start"
                    avoidCollisions={false}
                    className={styles.dropdownMenu}
                  >
                    {
                      // item?.status === "running" ||
                      // item?.status === "resetting" ||
                      // item?.status === "exited"
                      item?.status !== "migrating" &&
                      item?.status !== "pending" &&
                      !item.isApiInstance &&
                      (!item.details.jobs || item.details.jobs.length <= 0) ? (
                        <div className={styles.menuItem}>
                          <Tooltip
                            title={
                              "Upgrade Docker Image, Container Registry Credentials, Container Start Command and Environment Variables."
                            }
                            placement="left"
                          >
                            <Button
                              className={styles.buttonContainer}
                              onClick={() => {
                                if (item?.details?.id) {
                                  setShowUpgradeInfo({
                                    showModal: true,
                                    instanceInfo: item?.details || {},
                                  });
                                }
                                setDropdownOpen(false);
                              }}
                            >
                              <span>{"Upgrade"}</span>
                            </Button>
                          </Tooltip>
                        </div>
                      ) : (
                        ""
                      )
                    }
                    {(item?.status === "exited" ||
                      item?.status === "running") &&
                    item?.status !== "resetting" &&
                    (!item.details.jobs || item.details.jobs.length <= 0) ? (
                      <div className={styles.menuItem}>
                        <Button
                          className={styles.buttonContainer}
                          onClick={() => {
                            if (!hasJobPermission) {
                              showPermissionMessage();
                              return;
                            }
                            if (item?.details?.id) {
                              setShowSaveImageInfo({
                                showModal: true,
                                instanceInfo: item?.details || {},
                              });
                            }
                            setDropdownOpen(false);
                          }}
                        >
                          <span>{"Save Image"}</span>
                        </Button>
                      </div>
                    ) : (
                      ""
                    )}
                    {(item?.status === "running" ||
                      item?.status === "exited") &&
                    item?.status !== "resetting" &&
                    (!item.details.jobs || item.details.jobs.length <= 0) ? (
                      <div className={styles.menuItem}>
                        <Tooltip
                          title={
                            "Edit Container Disk, HTTP Ports and TCP Ports."
                          }
                          placement="left"
                        >
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                setShowEditInfo({
                                  showModal: true,
                                  instanceInfo: item?.details || {},
                                });
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Edit"}</span>
                          </Button>
                        </Tooltip>
                      </div>
                    ) : (
                      ""
                    )}
                    {item?.status === "running" &&
                      !item.isApiInstance &&
                      item?.status !== "resetting" &&
                      (!item.details.jobs || item.details.jobs.length <= 0) && (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                setShowRestartInfo({
                                  instanceInfo: item.details,
                                  showModal: true,
                                });
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Restart"}</span>
                          </Button>
                        </div>
                      )}
                    {(item?.status === "exited" ||
                      item?.status === "running") &&
                      !item.isApiInstance &&
                      !["notified", "reclaiming"].includes(item?.spotStatus) &&
                      item?.status !== "resetting" &&
                      (!item.details.jobs || item.details.jobs.length <= 0) && (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                setShowMigrateInstanceInfo({
                                  instanceInfo: item.details,
                                  showModal: true,
                                });
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Migrate"}</span>
                          </Button>
                        </div>
                      )}
                    {(item?.status === "exited" ||
                      item?.status === "running") &&
                      !item.isApiInstance &&
                      !["notified", "reclaiming"].includes(item?.spotStatus) &&
                      item?.status !== "resetting" &&
                      (!item.details.jobs || item.details.jobs.length <= 0) &&
                      (item?.details?.version === "v2" ? (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                setShowAutoMigrateInfo({
                                  instanceInfo: item.details,
                                  showModal: true,
                                });
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Automatic Migration"}</span>
                          </Button>
                        </div>
                      ) : (
                        <div className={styles.menuItem}>
                          <Tooltip
                            title={
                              "The following regions don't support this feature: US-CA-03/US-CA-NAS-01/US-02/US-CA-02"
                            }
                            placement="left"
                          >
                            <Button
                              className={`${styles.buttonContainer} ${styles.disabledBtn} `}
                            >
                              <span>{"Automatic Migration"}</span>
                            </Button>
                          </Tooltip>
                        </div>
                      ))}
                    {(!item.details.jobs || item.details.jobs.length <= 0) &&
                      item?.status !== "resetting" && (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (
                                item?.details?.id &&
                                item?.details?.clusterId
                              ) {
                                reqInstanceMountList({
                                  instanceId: item?.details?.id,
                                  clusterId: item?.details?.clusterId,
                                })
                                  .then((res: any) => {
                                    setShowMountNetVolumeInfo({
                                      showModal: true,
                                      instanceInfo: item.details,
                                      bindList: res.instancebind || [],
                                      allVolumeList: res.listvolume || [],
                                    });
                                  })
                                  .catch(() => {});
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Cloud Storage"}</span>
                          </Button>
                        </div>
                      )}
                    <div
                      className={`${styles.menuItem} ${
                        item?.billingMode === "monthly"
                          ? styles.monthlyDisabledMenuItem
                          : ""
                      }`}
                    >
                      {item?.billingMode === "monthly" ? (
                        <Tooltip
                          title={
                            "Subscription Instance does not support manual release"
                          }
                          placement="left"
                        >
                          <Button
                            className={`${styles.buttonContainer} ${styles.disabledBtn} `}
                          >
                            <span className={styles.disabledMenuLabel}>
                              {"Terminate"}
                            </span>
                          </Button>
                        </Tooltip>
                      ) : (
                        <Button
                          className={styles.buttonContainer}
                          onClick={() => {
                            if (item?.details?.id) {
                              if (checkMarkedInstance(item?.details?.id)) {
                                message.warning(
                                  "Reserved instances cannot be stopped or released before their expiration. If you need to stop or release them, please contact your account manager.",
                                );
                              } else {
                                setShowTerminateInfo({
                                  instanceInfo: item.details,
                                  showModal: true,
                                });
                              }
                            }
                            setDropdownOpen(false);
                          }}
                        >
                          <span>{"Terminate"}</span>
                        </Button>
                      )}
                    </div>
                    {item.billingMode === "onDemand" &&
                      (!item.details.jobs || item.details.jobs.length <= 0) &&
                      (item?.details?.monthlyPrice?.length || 0) > 0 &&
                      item.status !== "exited" &&
                      !item.isApiInstance &&
                      item?.status !== "pending" &&
                      item.status !== "stopping" &&
                      item.status !== "toStop" && (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                if (checkMarkedInstance(item?.details?.id)) {
                                  message.warning(
                                    "Reserved instances cannot be stopped or released before their expiration. If you need to stop or release them, please contact your account manager.",
                                  );
                                } else {
                                  setShowTransToMonthlyInfo({
                                    instanceInfo: item.details,
                                    showModal: true,
                                  });
                                }
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Switch to Subscription"}</span>
                          </Button>
                        </div>
                      )}
                    {(!item.details.jobs || item.details.jobs.length <= 0) &&
                      (item?.details?.monthlyPrice?.length || 0) > 0 &&
                      item.billingMode === "monthly" &&
                      item.status !== "exited" &&
                      item.status !== "stopping" &&
                      item?.status !== "pending" &&
                      item.status !== "toStop" && (
                        <div className={styles.menuItem}>
                          <Button
                            className={styles.buttonContainer}
                            onClick={() => {
                              if (item?.details?.id) {
                                if (checkMarkedInstance(item?.details?.id)) {
                                  message.warning(
                                    "Reserved instances cannot be stopped or released before their expiration. If you need to stop or release them, please contact your account manager.",
                                  );
                                } else {
                                  setShowSetAutoRenewInfo({
                                    instanceIds:
                                      item.details && item.details.id
                                        ? [item?.details?.id]
                                        : [],
                                    instanceInfo: item.details,
                                    showModal: true,
                                  });
                                }
                              }
                              setDropdownOpen(false);
                            }}
                          >
                            <span>{"Set Auto-renew"}</span>
                          </Button>
                        </div>
                      )}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              {item?.status === "exited" &&
              item?.status !== "resetting" &&
              (!item?.details?.jobs || item?.details?.jobs?.length <= 0) ? (
                <Button
                  variant="outline"
                  className={`!mr-2 ${styles.startBtnTxt}`}
                  onClick={() => {
                    if (item?.details?.id) {
                      setShowStartInfo({
                        instanceInfo: item.details,
                        showModal: true,
                      });
                    }
                  }}
                >
                  <CirclePlay className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
                  <span className="font-subtle text-[var(--black)]">
                    {"Start"}
                  </span>
                </Button>
              ) : (
                ""
              )}
              {item?.status === "running" &&
              !item.isApiInstance &&
              item?.status !== "resetting" &&
              (!item?.details?.jobs || item?.details?.jobs?.length <= 0) ? (
                <Button
                  variant="outline"
                  className={`!mr-2 ${styles.stopBtnTxt}`}
                  onClick={() => {
                    if (item?.details?.id) {
                      if (checkMarkedInstance(item?.details?.id)) {
                        message.warning(
                          "Reserved instances cannot be stopped or released before their expiration. If you need to stop or release them, please contact your account manager.",
                        );
                      } else {
                        setShowStopInfo({
                          instanceInfo: item.details,
                          showModal: true,
                        });
                      }
                    }
                  }}
                >
                  <CirclePause className="w-4 h-4 shrink-0 text-[var(--dark-1)]" />
                  <span className="font-subtle text-[var(--black)]">
                    {"Stop"}
                  </span>
                </Button>
              ) : (
                ""
              )}
              {![
                "toCreate",
                "creating",
                "pulling",
                "starting",
                "toStart",
              ].includes(item?.status) ? (
                <Button
                  className={`!mr-2 ${styles.logsBtnTxt}`}
                  id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SHOW_SYSTEM_LOGS}
                  onClick={() => {
                    if (item?.details?.id) {
                      setShowLogInfo({
                        showModal: true,
                        instanceInfo: item?.details || {},
                      });
                    }
                  }}
                >
                  <span className="font-subtle text-[var(--black)]">
                    {"Logs"}
                  </span>
                </Button>
              ) : (
                ""
              )}
              {item?.status === "running" || item?.status === "migrating" ? (
                <Button
                  variant="outline"
                  className={styles.logsBtnTxt}
                  onClick={() => {
                    if (item?.details?.id) {
                      setShowConnectInfo({
                        showModal: true,
                        instanceInfo: item?.details || {},
                      });
                    }
                  }}
                >
                  <span className="font-subtle text-[var(--black)]">
                    {"Connect"}
                  </span>
                </Button>
              ) : (
                ""
              )}
            </div>
            {item.billingMode === "onDemand" || item.billingMode === "spot" ? (
              <span className="font-body-medium text-[var(--brand-1)] mr-[40px]">
                {"$"}
                {(
                  Math.round(
                    Number(item?.details?.instancePrice || 0) *
                      Number(item?.details?.gpuNum || 0),
                  ) / 100000
                ).toFixed(commonTips.gpuPriceDot)}
                /{"hr"}
              </span>
            ) : (
              <div></div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

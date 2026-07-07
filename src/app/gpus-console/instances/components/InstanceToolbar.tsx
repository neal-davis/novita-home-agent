"use client";

import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import TeamMemberSelector from "@/app/components/TeamMemberSelector";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath } from "@/i18n/config";
import { SelectFilter } from "@/components/ui/standard/selectFilter";
import styles from "./section.module.scss";

function createBillingModeOptions() {
  return [
    { value: "0", label: "All Billing Mode" },
    { value: "monthly", label: "Subscription" },
    { value: "onDemand", label: "On Demand" },
    { value: "spot", label: "Spot" },
  ];
}

function createStatusOptions() {
  return [
    { value: "0", label: "All Status" },
    { value: "pulling", label: "Pulling" },
    { value: "running", label: "Running" },
    { value: "starting", label: "Starting" },
    { value: "restarting", label: "Restarting" },
    { value: "migrating", label: "Migrating" },
    { value: "stopping", label: "Stopping" },
    { value: "exited", label: "Exited" },
  ];
}

function createSavingsOptions() {
  return [
    { value: "0", label: "All" },
    { value: "1", label: "Using Savings" },
    { value: "2", label: "Not Using Savings" },
  ];
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- Preserves coupled filter controls and batch actions; deeper toolbar segmentation needs a focused UI refactor.
export default function InstanceToolbar({
  state,
  actions,
  renderSelectValue,
}: any) {
  const {
    params,
    clusterList,
    currentTeam,
    tableData,
    batchMode,
    batSelectedIds,
    showSetAutoRenewBatInfo,
    locale,
  } = state;
  const {
    setParams,
    getTableData,
    setBatchMode,
    setBatSelectedIds,
    setShowSetAutoRenewBatInfo,
  } = actions;
  const billingModeOptions = createBillingModeOptions();
  const statusOptions = createStatusOptions();
  const savingsOptions = createSavingsOptions();

  return (
    <div className={styles.pageTop}>
      <div>
        <div className="flex gap-[8px]">
          <Button
            id={CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_TO_CREATE}
            className={styles.pageTopBtn}
            onClick={() => {
              if (typeof window !== "undefined") {
                window.location.href = getLocalizedPath(
                  NOVITA_URL.GPU_CONSOLE_EXPLORE_COMPATIBLE,
                  locale,
                );
              }
            }}
            variant="outline"
          >
            <span className={styles.addInstancesTxt}>{"+ GPU Instance"}</span>
          </Button>

          <div className="flex flex-col gap-1">
            <SelectFilter<any>
              {...{
                value: String(params.billingMode || 0),
                options: billingModeOptions,
                onValueChange: (value) => {
                  const billingMode = value === "0" ? "" : value;
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    billingMode,
                  }));
                  getTableData(1, params.pageSize, {
                    billingMode,
                  });
                },
                onClear: () => {
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    billingMode: "",
                  }));
                  getTableData(1, params.pageSize, { billingMode: "" });
                },
                allowClear: !!params.billingMode,
                // i18n-disable-next-line
                clearAriaLabel: "Clear billing mode",
                getOptionValue: (item) => item.value,
                getOptionLabel: (item) => item.label,
                renderTrigger: (item) =>
                  renderSelectValue(
                    item?.value || 0,
                    billingModeOptions,
                    "All Billing Mode",
                  ),
                renderOption: (item) => item.label,
                // i18n-disable-next-line
                placeholder: "All Billing Mode",
                triggerClassName: `${styles.topSelectSearch} !w-[150px]`,
                itemClassName: styles.menuItem,
                showSearch: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <SelectFilter<any>
              {...{
                value: String(params.status || 0),
                options: statusOptions,
                onValueChange: (value) => {
                  const status = value === "0" ? "" : value;
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    status,
                  }));
                  getTableData(1, params.pageSize, {
                    status,
                  });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SELECTED_STATUS,
                    {
                      status,
                    },
                  );
                },
                onClear: () => {
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    status: "",
                  }));
                  getTableData(1, params.pageSize, { status: "" });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SELECTED_STATUS,
                    {
                      status: "",
                    },
                  );
                },
                allowClear: !!params.status,
                // i18n-disable-next-line
                clearAriaLabel: "Clear status",
                getOptionValue: (item) => item.value,
                getOptionLabel: (item) => item.label,
                renderTrigger: (item) =>
                  renderSelectValue(
                    item?.value || 0,
                    statusOptions,
                    "All Status",
                  ),
                renderOption: (item) => item.label,
                // i18n-disable-next-line
                placeholder: "All Status",
                triggerClassName: `${styles.topSelectSearch} !w-[128px]`,
                itemClassName: styles.menuItem,
                showSearch: false,
              }}
            />
          </div>

          <div className="flex flex-col gap-1">
            <SelectFilter
              {...{
                value: String(params.clusters),
                options: [{ id: "-1", name: "All Clusters" }, ...clusterList],
                onValueChange: (value) => {
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    clusters: value || "-1",
                  }));
                  getTableData(1, params.pageSize, {
                    clusters: value || "-1",
                  });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SELECTED_CLUSTER,
                    {
                      clusters: value || "-1",
                    },
                  );
                },
                onClear: () => {
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    // pageSize: 10,
                    clusters: "-1",
                  }));
                  getTableData(1, params.pageSize, { clusters: "-1" });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SELECTED_CLUSTER,
                    {
                      clusters: "-1",
                    },
                  );
                },
                allowClear: params.clusters !== "-1",
                // i18n-disable-next-line
                clearAriaLabel: "Clear cluster",
                getOptionValue: (item: any) => String(item.id),
                getOptionLabel: (item: any) => item.name,
                renderTrigger: (item: any) => (
                  <span className={styles.statusTxt}>
                    {item?.name || "All Clusters"}
                  </span>
                ),
                renderOption: (item: any) => item.name,
                // i18n-disable-next-line
                placeholder: "All Clusters",
                triggerClassName: `${styles.topSelectSearch} !w-[140px]`,
                itemClassName: styles.menuItem,
                showSearch: false,
              }}
            />
          </div>

          {false && (
            <div className="flex flex-col gap-1">
              <SelectFilter<any>
                {...{
                  value: String(params.isUseSavingPlan || 0),
                  options: savingsOptions,
                  onValueChange: (value) => {
                    setParams((prev: any) => ({
                      ...prev,
                      pageNum: 1,
                      pageSize: 10,
                      isUseSavingPlan: Number(value),
                    }));
                    getTableData(1, 10, {
                      isUseSavingPlan: Number(value),
                    });
                  },
                  onClear: () => {
                    setParams((prev: any) => ({
                      ...prev,
                      pageNum: 1,
                      pageSize: 10,
                      isUseSavingPlan: 0,
                    }));
                    getTableData(1, 10, { isUseSavingPlan: 0 });
                  },
                  allowClear: !!params.isUseSavingPlan,
                  // i18n-disable-next-line
                  clearAriaLabel: "Clear savings plan filter",
                  getOptionValue: (item) => item.value,
                  getOptionLabel: (item) => item.label,
                  renderTrigger: (item) =>
                    renderSelectValue(item?.value || 0, savingsOptions, "All"),
                  renderOption: (item) => item.label,
                  // i18n-disable-next-line
                  placeholder: "All",
                  triggerClassName: styles.topSelectSearch,
                  itemClassName: styles.menuItem,
                  showSearch: false,
                }}
              />
            </div>
          )}
          <div className="flex flex-col gap-1">
            {currentTeam && (
              <TeamMemberSelector
                className={styles.topSelectSearchNew}
                onSelect={(member: any) => {
                  setParams((prev: any) => ({
                    ...prev,
                    pageNum: 1,
                    creators: member?.ids?.length ? member.ids[0] : "-1",
                  }));
                  getTableData(1, params.pageSize, {
                    creators: member?.ids?.length ? member.ids[0] : "-1",
                  });
                  analytics.trackClick(
                    CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SELECTED_MEMBER,
                  );
                }}
              />
            )}
          </div>
          <Button
            onClick={() => {
              setParams((prev: any) => ({ ...prev, pageNum: 1 }));
              getTableData(1);
              analytics.trackClick(
                CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SEARCH_INSTANCE,
              );
            }}
            className={styles.refreshBtn}
            variant="outline"
          >
            {/* <img
  src="/gpu-instance/instances/icon-refresh.svg"
  className={styles.iconImg}
/> */}
            <span className={`iconfont icon-rotate ${styles.iconImg}`} />
          </Button>
        </div>
      </div>
      <div className="flex gap-[8px]">
        <SearchInput
          className="h-8 w-[220px]"
          placeholder="Instance Name/ID Filter"
          value={params.name}
          onValueChange={(value) => {
            setParams((prev: any) => ({ ...prev, name: value }));
          }}
          onSearch={(value) => {
            setParams((prev: any) => ({ ...prev, name: value, pageNum: 1 }));
            getTableData(1, params.pageSize, { name: value });
            analytics.trackClick(
              CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SEARCH_INSTANCE,
            );
          }}
        />
        <SearchInput
          className="h-8 w-[136px]"
          placeholder="GPU Type"
          value={params.productName}
          onValueChange={(value) => {
            setParams((prev: any) => ({ ...prev, productName: value }));
          }}
          onSearch={(value) => {
            setParams((prev: any) => ({
              ...prev,
              productName: value,
              pageNum: 1,
            }));
            getTableData(1, params.pageSize, { productName: value });
            analytics.trackClick(
              CLICK_BTN_IDs.GPUS_CONSOLE.INSTANCE_SEARCH_INSTANCE,
            );
          }}
        />
      </div>

      {params.billingMode === "monthly" && tableData?.data?.length > 0 ? (
        <div className="flex gap-[8px]">
          {!batchMode &&
            false &&
            params.billingMode === "monthly" &&
            (tableData?.data?.length > 0 ? (
              <Button
                variant="outline"
                className={`!h-[32px] ${styles.batchBtn}`}
                onClick={() => {
                  setBatchMode(true);
                  setParams((prev: any) => ({
                    ...prev,
                    billingMode: "monthly",
                  }));
                  getTableData(1, params.pageSize, {
                    billingMode: "monthly",
                  });
                }}
              >
                <span className={styles.batchBtnTxt}>Batch Operations</span>
              </Button>
            ) : (
              <Tooltip
                placement="bottom"
                title="No instances found, go to create instance"
              >
                <Button
                  variant="outline"
                  className={`!h-[32px] ${styles.disabledOutlineBtn}`}
                  style={{
                    height: "32px !important",
                  }}
                >
                  <span className={styles.disabledOutlineBtnTxt}>
                    Batch Operations
                  </span>
                </Button>
              </Tooltip>
            ))}
          {batchMode &&
            params.billingMode === "monthly" &&
            tableData?.data?.length > 0 && (
              <>
                <Button
                  variant="outline"
                  className={`!h-[32px] ${styles.batchBtn}`}
                  onClick={() => {
                    setBatchMode(false);
                    setBatSelectedIds([]);
                    // setParams({ ...params, billingMode: "" });
                    // getTableData(1, params.pageSize, {
                    //   billingMode: "",
                    // });
                  }}
                >
                  <span className={styles.batchBtnTxt}>
                    Cancel Batch Operations
                  </span>
                </Button>
                <Button
                  variant="outline"
                  className={`!h-[32px] ${styles.batchBtn}`}
                  onClick={() => {
                    if (batSelectedIds.length === 0) {
                      message.error(
                        "Please select the instances to set up auto-renew",
                      );
                      return;
                    } else {
                      const unMonthlyItem = batSelectedIds.find((item: any) => {
                        return (
                          tableData?.data?.find((ele: any) => ele.id === item)
                            ?.billingMode !== "monthly"
                        );
                      });
                      if (unMonthlyItem) {
                        message.error("Please select the monthly instances");
                        return;
                      }
                      setShowSetAutoRenewBatInfo({
                        ...showSetAutoRenewBatInfo,
                        showModal: true,
                        instanceIds: batSelectedIds,
                      });
                    }
                  }}
                >
                  <span className={styles.batchBtnTxt}>
                    Batch Set Auto-renew
                  </span>
                </Button>
              </>
            )}
        </div>
      ) : (
        ""
      )}
    </div>
  );
}

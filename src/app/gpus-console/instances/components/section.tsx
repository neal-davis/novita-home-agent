"use client";
import styles from "./section.module.scss";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import {
  reqGpuInstance,
  reqSingleGpuInstance,
  // reqMetricsGpuInstance,
  reqUpdateGpuInstanceName,
  reqRenewInstance,
  reqTransToMonthlyInstance,
  reqSetAutoRenew,
} from "@/api/gpu-instance/instances";
import { requestInstanceMarkEffect } from "@/api/config";
import moment from "moment";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { useI18n } from "@/i18n/provider";
import { useAppSelector } from "@/store";
import { reqMarketQueryOptions } from "@/api/gpu-instance/explore";
import InstanceToolbar from "./InstanceToolbar";
import InstanceList from "./InstanceList";
import InstanceModals from "./InstanceModals";

const INSTANCE_PAGE_SIZE_KEY = "instance_pageSize";
const DEFAULT_PAGE_SIZE = 10;
const INSTANCE_ROWS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

function getStoredInstancePageSize() {
  if (typeof window === "undefined") {
    return DEFAULT_PAGE_SIZE;
  }

  const savedPageSize = Number(
    window.localStorage.getItem(INSTANCE_PAGE_SIZE_KEY) || DEFAULT_PAGE_SIZE,
  );

  return INSTANCE_ROWS_PER_PAGE_OPTIONS.includes(savedPageSize)
    ? savedPageSize
    : DEFAULT_PAGE_SIZE;
}

export default function Section() {
  const { locale } = useI18n();
  const teamMembers = useAppSelector((state) => state.user.allTeamMembers);
  const members = useMemo(() => teamMembers || [], [teamMembers]);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [clusterList, setClusterList] = useState<any>([]);
  const hasLoadedStoredPageSize = useRef(false);
  const [params, setParams] = useState({
    pageNum: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    name: "",
    productName: "",
    status: "",
    isUseSavingPlan: 0,
    creators: "-1",
    clusters: "-1",
    billingMode: "",
  });
  const paramsRef = useRef(params);
  const updateParams = useCallback((nextParams: any) => {
    paramsRef.current =
      typeof nextParams === "function"
        ? nextParams(paramsRef.current)
        : nextParams;
    setParams(paramsRef.current);
  }, []);
  const [tableData, setTableData] = useState<{
    data: any;
    total: any;
  }>({
    data: [],
    total: 0,
  });
  const [expandedId, setExpandedId] = useState<any>(null);
  const [tableLoading, setTableLoading] = useState<boolean>(false);
  const [markedInstance, setMarkedInstance] = useState<any>([]);
  const hasJobPermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.jobs,
    resource: PERMISSION.RESOURCE.jobs,
    action: PERMISSION.ACTION.read,
  });
  useEffect(() => {
    if (hasLoadedStoredPageSize.current) {
      return;
    }

    hasLoadedStoredPageSize.current = true;
    const pageSize = getStoredInstancePageSize();
    if (pageSize !== paramsRef.current.pageSize) {
      updateParams((prev: any) => ({
        ...prev,
        pageNum: 1,
        pageSize,
      }));
    }
  }, [updateParams]);

  useEffect(() => {
    // getTableData();
    requestInstanceMarkEffect().then((res: any) => {
      setMarkedInstance(res || []);
    });
    reqMarketQueryOptions({ auth: true }).then((res: any) => {
      setClusterList(res?.clusters || []);
    });
  }, []);
  const getTableData = useCallback(
    (pageNum?: any, pageSize?: any, paramObj?: any) => {
      setTableLoading(true);
      const latestParams = { ...paramsRef.current, ...paramObj };
      let menberIdArr = [];
      const creators = latestParams.creators;
      if (creators !== "-1") {
        const currentMember = members.find(
          (item: any) => item.memberId === creators,
        );
        if (currentMember) {
          menberIdArr = members
            .filter((item: any) => item.userId === currentMember.userId)
            .map((ele: any) => ele.memberId);
        }
      }
      reqGpuInstance({
        ...latestParams,
        pageNum: !isNaN(Number(pageNum)) ? pageNum : latestParams.pageNum,
        pageSize: !isNaN(Number(pageSize)) ? pageSize : latestParams.pageSize,
        ...paramObj,
        creators: creators === "-1" ? "" : menberIdArr.toString(),
        clusters: latestParams.clusters === "-1" ? "" : latestParams.clusters,
      })
        .then((res: any) => {
          const tableDataArr: any = [...tableData.data];
          const data: any = res.instances || [];
          let isExpand = false;
          for (let i = 0; i < data.length; i++) {
            // const item = data[i];
            const existItem: any = tableDataArr.find(
              (ele: any) => ele.id === data[i].id,
            );
            if (existItem) {
              if (!isExpand) {
                data[i].expandAccord = existItem.expandAccord || false;
                data[i].details = existItem.details || {};
                if (existItem.expandAccord) {
                  isExpand = true;
                }
              } else {
                data[i].expandAccord = false;
                data[i].details = existItem.details || {};
              }
            } else {
              data[i].expandAccord = false;
              data[i].details = {};
            }
          }
          setTableData({
            data,
            total: Number(res.total),
          });
          setTableLoading(false);
        })
        .catch(() => {
          setTableLoading(false);
        });
    },
    [members, tableData.data],
  );
  const refreshExpandDetail = useCallback(() => {
    let menberIdArr = [];
    const creators = params.creators;
    if (creators !== "-1") {
      const currentMember = members.find(
        (item: any) => item.memberId === creators,
      );
      if (currentMember) {
        menberIdArr = members
          .filter((item: any) => item.userId === currentMember.userId)
          .map((ele: any) => ele.memberId);
      }
    }
    reqGpuInstance({
      ...params,
      creators: creators === "-1" ? "" : menberIdArr.toString(),
      clusters: params.clusters === "-1" ? "" : params.clusters,
    }).then(async (res: any) => {
      const tableDataArr: any = [...tableData.data];
      const data: any = res.instances || [];
      let isExpand = false;
      for (let i = 0; i < data.length; i++) {
        const item: any = data[i];
        const existItem: any = tableDataArr.find(
          (ele: any) => ele.id === item.id,
        );
        if (existItem) {
          if (existItem?.id === expandedId && !isExpand) {
            isExpand = true;
            item.expandAccord = true;
            const thisItem: any = await reqSingleGpuInstance(
              existItem.id,
            ).catch(() => {});
            item.details = thisItem || {};
            item.metrics = existItem.metrics || {};
          } else {
            item.expandAccord = false;
            item.details = existItem.details || {};
          }
        } else {
          item.expandAccord = false;
          item.details = {};
        }
      }
      setTableData({
        data,
        total: Number(res.total),
      });
    });
  }, [expandedId, members, params, tableData.data]);
  async function getTableDataWithDetail({
    pageNum,
    pageSize,
    paramObj,
    id,
  }: {
    pageNum?: any;
    pageSize?: any;
    paramObj?: any;
    id: any;
  }) {
    let menberIdArr = [];
    const creators = paramObj?.creators || params.creators;
    if (creators !== "-1") {
      const currentMember = members.find(
        (item: any) => item.memberId === creators,
      );
      if (currentMember) {
        menberIdArr = members
          .filter((item: any) => item.userId === currentMember.userId)
          .map((ele: any) => ele.memberId);
      }
    }
    reqGpuInstance({
      ...params,
      pageNum: !isNaN(Number(pageNum)) ? pageNum : params.pageNum,
      pageSize: !isNaN(Number(pageSize)) ? pageSize : params.pageSize,
      ...paramObj,
      creators: creators === "-1" ? "" : menberIdArr.toString(),
      clusters:
        { ...params, ...paramObj }.clusters === "-1"
          ? ""
          : { ...params, ...paramObj }.clusters,
    }).then((res: any) => {
      const tableDataArr: any = [...tableData.data];
      const data: any = res.instances || [];
      data.forEach(async (item: any) => {
        if (id && id === item.id) {
          item.expandAccord = true;
          const thisItem: any = await reqSingleGpuInstance(id).catch(() => {});
          item.details = thisItem || {};
          item.metrics = thisItem.metrics || {};
        } else {
          const existItem: any = tableDataArr.find(
            (ele: any) => ele.id === item.id,
          );
          if (existItem) {
            item.expandAccord = existItem.expandAccord || false;
            item.details = existItem.details || {};
          } else {
            item.expandAccord = false;
            item.details = {};
          }
        }
      });
      setTableData({
        data,
        total: Number(res.total),
      });
    });
  }
  const [updateNameInfo, setUpdateNameInfo] = useState<any>({
    showModal: false,
    id: "",
    name: "",
  });
  const [updateNameBtnLoading, setUpdateNameBtnLoading] = useState(false);
  function updateInstanceNameFun() {
    if (updateNameBtnLoading) {
      return;
    }
    if (!updateNameInfo.name || updateNameInfo.name.trim() === "") {
      message.warning(`${"please input valid instance name"}`);
      return;
    }
    setUpdateNameBtnLoading(true);
    reqUpdateGpuInstanceName({
      instanceId: updateNameInfo.id,
      name: updateNameInfo.name,
    })
      .then(() => {
        message.success("success");
        setUpdateNameInfo((prev: any) => ({ ...prev, showModal: false }));
        getTableData();
      })
      .finally(() => {
        setUpdateNameBtnLoading(false);
      });
  }
  const [showCustomerInfo, setShowCustomerInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeUserCompanyInfo() {
    setShowCustomerInfo({ ...showCustomerInfo, showModal: false });
  }
  const [showEditInfo, setShowEditInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeEditInstanceInfo(refresh: any, instanceInfo: any) {
    setShowEditInfo({ ...showEditInfo, showModal: false });
    if (refresh) {
      getTableDataWithDetail({ id: instanceInfo.id });
    }
  }
  const [showSaveImageInfo, setShowSaveImageInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeSaveImageInfo(refresh: any, instanceInfo: any) {
    setShowSaveImageInfo({ ...showSaveImageInfo, showModal: false });
    if (refresh) {
      setShowJobCreateSuccessInfo({
        ...showJobCreateSuccessInfo,
        showModal: true,
        jobInfo: { jobId: instanceInfo.jobId },
      });
      getTableDataWithDetail({ id: instanceInfo.id });
    }
  }
  const [showJobCreateSuccessInfo, setShowJobCreateSuccessInfo] = useState({
    showModal: false,
    jobInfo: {},
  });
  function closeShowJobCreateSuccessInfo() {
    setShowJobCreateSuccessInfo({
      ...showJobCreateSuccessInfo,
      showModal: false,
    });
  }
  const [showMigrateJobCreateSuccessInfo, setShowMigrateJobCreateSuccessInfo] =
    useState({
      showModal: false,
      jobInfo: {},
    });
  function closeShowMigrateJobCreateSuccessInfo() {
    setShowMigrateJobCreateSuccessInfo({
      ...showMigrateJobCreateSuccessInfo,
      showModal: false,
    });
  }
  const [renewBtnLoading, setRenewBtnLoading] = useState(false);
  const [showRenewInfo, setShowRenewInfo] = useState<any>({
    showModal: false,
    instanceInfo: {},
  });
  function closeRenewInstanceInfo(mark: any, params: any) {
    if (!mark) {
      setShowRenewInfo((prev: any) => ({ ...prev, showModal: false }));
    } else {
      setRenewBtnLoading(true);
      reqRenewInstance({ ...params })
        .then(() => {
          message.success("success");
          getTableDataWithDetail({ id: params.instanceId });
          setShowRenewInfo((prev: any) => ({ ...prev, showModal: false }));
        })
        .finally(() => {
          setRenewBtnLoading(false);
        });
    }
  }
  const [transToMonthlyBtnLoading, setTransToMonthlyBtnLoading] =
    useState(false);
  const [showTransToMonthlyInfo, setShowTransToMonthlyInfo] = useState<any>({
    showModal: false,
    instanceInfo: {},
  });
  function closeTransToMonthlyInstanceInfo(mark: any, params: any) {
    if (!mark) {
      setShowTransToMonthlyInfo((prev: any) => ({ ...prev, showModal: false }));
    } else {
      setTransToMonthlyBtnLoading(true);
      reqTransToMonthlyInstance({ ...params })
        .then(() => {
          message.success("success");
          getTableDataWithDetail({ id: params.instanceId });
          setShowTransToMonthlyInfo((prev: any) => ({
            ...prev,
            showModal: false,
          }));
        })
        .finally(() => {
          setTransToMonthlyBtnLoading(false);
        });
    }
  }
  const [setAutoRenewBatBtnLoading, setSetAutoRenewBatBtnLoading] =
    useState(false);
  const [showSetAutoRenewBatInfo, setShowSetAutoRenewBatInfo] = useState<any>({
    showModal: false,
    instanceIds: [] as any,
  });
  function closeSetAutoRenewBatInstanceInfo(mark: any, params: any) {
    if (!mark) {
      setShowSetAutoRenewBatInfo((prev: any) => ({
        ...prev,
        showModal: false,
      }));
    } else {
      setSetAutoRenewBatBtnLoading(true);
      reqSetAutoRenew({ ...params })
        .then(() => {
          message.success("success");
          getTableData();
          setShowSetAutoRenewBatInfo((prev: any) => ({
            ...prev,
            showModal: false,
          }));
        })
        .finally(() => {
          setSetAutoRenewBatBtnLoading(false);
        });
    }
  }
  const [setAutoRenewBtnLoading, setSetAutoRenewBtnLoading] = useState(false);
  const [showSetAutoRenewInfo, setShowSetAutoRenewInfo] = useState<any>({
    showModal: false,
    instanceIds: [] as any,
    instanceInfo: {} as any,
  });
  function closeSetAutoRenewInstanceInfo(mark: any, params: any) {
    if (!mark) {
      setShowSetAutoRenewInfo((prev: any) => ({ ...prev, showModal: false }));
    } else {
      setSetAutoRenewBtnLoading(true);
      reqSetAutoRenew({ ...params })
        .then(() => {
          message.success("success");
          getTableDataWithDetail({ id: params.instanceId });
          setShowSetAutoRenewInfo((prev: any) => ({
            ...prev,
            showModal: false,
          }));
        })
        .finally(() => {
          setSetAutoRenewBtnLoading(false);
        });
    }
  }
  const [showUpgradeInfo, setShowUpgradeInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeUpgradeInstanceInfo(refresh: any, instanceInfo: any) {
    setShowUpgradeInfo({ ...showUpgradeInfo, showModal: false });
    if (refresh) {
      getTableDataWithDetail({ id: instanceInfo.id });
    }
  }
  const [showLogInfo, setShowLogInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeLogInfo() {
    setShowLogInfo({ ...showConnectInfo, showModal: false });
  }
  const [showConnectInfo, setShowConnectInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeConnectInstanceInfo() {
    setShowConnectInfo({ ...showConnectInfo, showModal: false });
  }
  const [showStartInfo, setShowStartInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeStartInstanceInfo(
    success?: boolean,
    showMigrateModal?: boolean,
  ) {
    setShowStartInfo({ ...showStartInfo, showModal: false });
    if (showMigrateModal) {
      setShowUnabledStartInstanceNoSourceInfo({
        ...showUnabledStartInstanceNoSourceInfo,
        showModal: true,
        instanceInfo: showStartInfo.instanceInfo,
      });
    }
  }
  const [showRestartInfo, setShowRestartInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeRestartInstanceInfo() {
    setShowRestartInfo({ ...showRestartInfo, showModal: false });
  }
  const [
    showUnabledStartInstanceNoSourceInfo,
    setShowUnabledStartInstanceNoSourceInfo,
  ] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeShowUnabledStartInstanceNoSourceInfo(
    refresh: any,
    instanceInfo: any,
  ) {
    setShowUnabledStartInstanceNoSourceInfo({
      ...showUnabledStartInstanceNoSourceInfo,
      showModal: false,
    });
    if (refresh) {
      if (instanceInfo?.jobId) {
        setShowMigrateJobCreateSuccessInfo({
          ...showMigrateJobCreateSuccessInfo,
          showModal: true,
          jobInfo: { jobId: instanceInfo.jobId },
        });
      }
      getTableDataWithDetail({ id: instanceInfo.id });
    }
  }
  const [showMigrateInstanceInfo, setShowMigrateInstanceInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeShowMigrateInstanceInfo(refresh: any, instanceInfo: any) {
    setShowMigrateInstanceInfo({
      ...showMigrateInstanceInfo,
      showModal: false,
    });
    if (refresh) {
      if (instanceInfo?.jobId) {
        setShowMigrateJobCreateSuccessInfo({
          ...showMigrateJobCreateSuccessInfo,
          showModal: true,
          jobInfo: { jobId: instanceInfo.jobId },
        });
      }
      getTableDataWithDetail({ id: instanceInfo.id });
    }
  }
  const [showAutoMigrateInfo, setShowAutoMigrateInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeAutoMigrateInstanceInfo(refresh: any, instanceInfo: any) {
    setShowAutoMigrateInfo({ ...showAutoMigrateInfo, showModal: false });
    if (refresh) {
      if (instanceInfo?.id) {
        getTableDataWithDetail({ id: instanceInfo.id });
      }
    }
  }
  const [showStopInfo, setShowStopInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeStopInstanceInfo() {
    setShowStopInfo({ ...showStopInfo, showModal: false });
  }
  const [showTerminateInfo, setShowTerminateInfo] = useState({
    showModal: false,
    instanceInfo: {},
  });
  function closeTerminateInstanceInfo(mark: any) {
    setShowTerminateInfo({ ...showTerminateInfo, showModal: false });
    if (mark) {
      if (tableData.total % (Number(params.pageSize) || 10) === 1) {
        updateParams((prev: any) => ({ ...prev, pageNum: 1 }));
        getTableData(1);
      } else {
        getTableData();
      }
    }
  }
  const [showMountNetVolumeInfo, setShowMountNetVolumeInfo] = useState({
    showModal: false,
    instanceInfo: {},
    bindList: [],
    allVolumeList: [],
  });
  function closeMountNetVolumeInstanceInfo(mark: any) {
    setShowMountNetVolumeInfo({ ...showMountNetVolumeInfo, showModal: false });
    if (mark) {
      if (tableData.total % (Number(params.pageSize) || 10) === 1) {
        updateParams((prev: any) => ({ ...prev, pageNum: 1 }));
        getTableData(1);
      } else {
        getTableData();
      }
    }
  }
  function checkMarkedInstance(instanceId: any) {
    const markedInstanceArr: any = markedInstance || [];
    return markedInstanceArr.some((ele: any) => {
      const startTime = ele.effectiveStartDate + " " + ele.effectiveStartTime;
      const endTime = ele.effectiveEndDate + " " + ele.effectiveEndTime;
      const now = moment();
      const startMoment = moment.utc(startTime);
      const endMoment = moment.utc(endTime);
      const beforeEnd = now.isBefore(endMoment);
      const afterStart = now.isAfter(startMoment);
      return ele.instanceId === instanceId && beforeEnd && afterStart;
    });
  }
  function operaInstance(id: any, index: any, expanded: boolean) {
    setExpandedId(expanded ? id : null);
    if (!expanded) {
      return;
    }
    reqSingleGpuInstance(id)
      .then((res: any) => {
        setTableData((prev: any) => {
          const nextData: any[] = [...prev.data];
          const targetIdx = nextData.findIndex((it: any) => it?.id === id);
          if (targetIdx !== -1) {
            nextData[targetIdx] = {
              ...nextData[targetIdx],
              details: res || {},
            };
          }
          return { ...prev, data: nextData };
        });
      })
      .catch(() => {
        setTableData((prev: any) => {
          const nextData: any[] = [...prev.data];
          const targetIdx = nextData.findIndex((it: any) => it?.id === id);
          if (targetIdx !== -1) {
            nextData[targetIdx] = { ...nextData[targetIdx], details: {} };
          }
          return { ...prev, data: nextData };
        });
      });
  }
  const [time, setTime] = useState(30);
  useEffect(() => {
    let timerHandler: ReturnType<typeof setTimeout> | undefined;
    if (time % 3 !== 0) {
      timerHandler = setTimeout(() => {
        setTime((time) => time - 1);
      }, 3000);
    }
    if (time <= 0) {
      setTime(30);
    }
    if (time % 3 === 0) {
      setTime((time) => time - 1);
      // debugger;
      refreshExpandDetail();
    }
    return () => {
      if (timerHandler) {
        clearTimeout(timerHandler);
      }
    };
  }, [refreshExpandDetail, time]);
  useEffect(() => {
    if (tableData?.data?.length === 0 || params.billingMode !== "monthly") {
      setBatchMode(false);
      setBatSelectedIds([]);
    }
  }, [tableData, params.billingMode]);
  function getBillingStr(item: any) {
    if (item?.billingMode === "onDemand") {
      return "On-Demand-Secure Cloud";
    } else if (item?.billingMode === "spot") {
      return "Spot";
    } else {
      if (item?.billingMode === "monthly") {
        return `Subscription`;
      }
    }
    return "/";
  }
  function handleChangeRowsPerPage(
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSTANCE_PAGE_SIZE_KEY, event.target.value);
    }
    updateParams((prev: any) => ({
      ...prev,
      pageSize: parseInt(event.target.value, 10),
      pageNum: 1,
    }));
    getTableData(1, parseInt(event.target.value, 10));
  }
  function changePage(event: any, page: number) {
    updateParams((prev: any) => ({ ...prev, pageNum: page }));
    getTableData(page);
  }
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  useEffect(() => {
    setDropdownOpen(false);
  }, [expandedId]);
  function menuClickHandler(isOpen: boolean) {
    setDropdownOpen(isOpen);
  }
  function getCreator(creator: any, uuid: any) {
    const targetItem = members.find((item: any) => item.memberId === creator);
    if (targetItem) {
      return targetItem.alias
        ? `${targetItem.email} (${targetItem.alias})`
        : targetItem.email;
    } else {
      const newTargetItem = members.find((item: any) => item.userId === uuid);
      if (newTargetItem) {
        return newTargetItem.alias
          ? `${newTargetItem.email} (${newTargetItem.alias})`
          : newTargetItem.email;
      } else {
        return "";
      }
    }
  }
  const [batchMode, setBatchMode] = useState(false);
  const [batSelectedIds, setBatSelectedIds] = useState<any[]>([]);
  const renderSelectValue = (
    value: any,
    options: Array<{ value: string; label: string }>,
    fallback: string,
  ) => {
    const selected = options.find((item) => item.value === String(value));
    return (
      <span className={styles.statusTxt}>{selected?.label || fallback}</span>
    );
  };
  const toolbarState = {
    params,
    clusterList,
    currentTeam,
    tableData,
    batchMode,
    batSelectedIds,
    showSetAutoRenewBatInfo,
    locale,
  };
  const toolbarActions = {
    setParams: updateParams,
    getTableData,
    setBatchMode,
    setBatSelectedIds,
    setShowSetAutoRenewBatInfo,
  };
  const listState = {
    tableLoading,
    tableData,
    expandedId,
    batchMode,
    batSelectedIds,
    currentTeam,
    dropdownOpen,
    params,
  };
  const listActions = {
    operaInstance,
    setBatSelectedIds,
    getCreator,
    getBillingStr,
    setDropdownOpen,
    menuClickHandler,
    checkMarkedInstance,
    handleChangeRowsPerPage,
    changePage,
  };
  const listModalActions = {
    setUpdateNameInfo,
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
  };
  const modalState = {
    updateNameInfo,
    showCustomerInfo,
    showEditInfo,
    showSaveImageInfo,
    showJobCreateSuccessInfo,
    showMigrateJobCreateSuccessInfo,
    showRenewInfo,
    showTransToMonthlyInfo,
    showSetAutoRenewBatInfo,
    showSetAutoRenewInfo,
    showUpgradeInfo,
    showConnectInfo,
    showLogInfo,
    showStartInfo,
    showRestartInfo,
    showUnabledStartInstanceNoSourceInfo,
    showMigrateInstanceInfo,
    showAutoMigrateInfo,
    showStopInfo,
    showTerminateInfo,
    showMountNetVolumeInfo,
  };
  const modalSetters = {
    setUpdateNameInfo,
    setShowCustomerInfo,
    setShowEditInfo,
    setShowSaveImageInfo,
    setShowJobCreateSuccessInfo,
    setShowMigrateJobCreateSuccessInfo,
    setShowRenewInfo,
    setShowTransToMonthlyInfo,
    setShowSetAutoRenewBatInfo,
    setShowSetAutoRenewInfo,
    setShowUpgradeInfo,
    setShowConnectInfo,
    setShowLogInfo,
    setShowStartInfo,
    setShowRestartInfo,
    setShowUnabledStartInstanceNoSourceInfo,
    setShowMigrateInstanceInfo,
    setShowAutoMigrateInfo,
    setShowStopInfo,
    setShowTerminateInfo,
    setShowMountNetVolumeInfo,
  };
  const modalHandlers = {
    updateInstanceNameFun,
    closeUserCompanyInfo,
    closeEditInstanceInfo,
    closeSaveImageInfo,
    closeShowJobCreateSuccessInfo,
    closeShowMigrateJobCreateSuccessInfo,
    closeRenewInstanceInfo,
    closeTransToMonthlyInstanceInfo,
    closeSetAutoRenewBatInstanceInfo,
    closeSetAutoRenewInstanceInfo,
    closeUpgradeInstanceInfo,
    closeConnectInstanceInfo,
    closeLogInfo,
    closeStartInstanceInfo,
    closeRestartInstanceInfo,
    closeShowUnabledStartInstanceNoSourceInfo,
    closeShowMigrateInstanceInfo,
    closeAutoMigrateInstanceInfo,
    closeStopInstanceInfo,
    closeTerminateInstanceInfo,
    closeMountNetVolumeInstanceInfo,
  };
  const modalLoading = {
    renewBtnLoading,
    transToMonthlyBtnLoading,
    setAutoRenewBatBtnLoading,
    setAutoRenewBtnLoading,
  };
  return (
    <div className={styles.subContainer}>
      <div className={styles.section}>
        <InstanceToolbar
          state={toolbarState}
          actions={toolbarActions}
          renderSelectValue={renderSelectValue}
        />

        <InstanceList
          state={listState}
          actions={listActions}
          modalActions={listModalActions}
          hasJobPermission={hasJobPermission}
        />
      </div>
      <InstanceModals
        state={modalState}
        setters={modalSetters}
        handlers={modalHandlers}
        loading={modalLoading}
      />
    </div>
  );
}

"use client";
import { getDateDisplay } from "@/lib/utils/date";
import styles from "./item.module.scss";
import { useAppSelector } from "@/store";
import CopyButton from "../../components/CopyButton";
import { useServerlessContext } from "./Context";
import {
  ChevronDown,
  CircleQuestionMark,
  Ellipsis,
  Globe,
  Gpu,
  Loader2,
} from "lucide-react";
import {
  Endpoint as EndpointType,
  ENDPOINT_STATE,
  WORKER_STATE,
  Worker as WorkerType,
  ENDPOINT_TYPE,
  deleteEndpoint,
  STORAGE_TYPE,
  updateEndpoint,
  SCALE_POLICY,
} from "@/api/gpu-instance/serverless";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { useCallback, useEffect, useRef, useState } from "react";
import WorkerManager from "./Worker/WorkerManager";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { copyText } from "@/lib/utils/utils";
import { Input } from "@/components/ui/input";
import Logs from "./Logs";
import AddEndpoint, {
  AddEndpointRef,
} from "@/app/gpus-console/serverless-deploy/components/addEndpoint";
import { ConfirmDialog } from "@/components/ui/standard/confirm-dialog";
function createCopy() {
  return {
    manageEndpoints: "Manage Your Endpoints",
    createEndpoint: "Create Endpoint",
    selectCreator: "Select Creator...",
    gpuList: {
      quickCreate: "Quickly Create",
      create: "Create",
    },
    endpoint: {
      image: "Image",
      state: {
        initializing: "Initializing",
        serving: "Serving",
        stopped: "Stopped",
        failed: "Failed",
        terminating: "Terminating",
        unknown: "Unknown",
      },
      creator: "Creator",
      time: "Create Time",
      price: "Price",
      edit: "Edit",
      delete: "Delete",
      metrics: "Metrics",
      logs: "Logs",
      form: {
        createTitle: "Create Endpoint",
        editTitle: "Edit Endpoint",
        emptyError: "This field is required",
        defaultError: "Format error",
        name: "Endpoint Name",
        appName: "App Name",
        appNameHelp:
          "App name is part of the Endpoint URL. You can define an app name as needed. Default to Endpoint ID",
        invalidAppName:
          "App name can only contain lowercase letters, numbers, and hyphens (-), and must start and end with a letter or number",
        appNameTooLong: "App name length cannot exceed 46 characters",
        workerConfig: "Worker Configuration",
        maxWorker: "Workers Max",
        minWorker: "Workers Min",
        minWorkerHelp:
          "Minimum number of workers to keep, helps reducing cold start time",
        maxWorkerHelp:
          "Maximum number of workers to scale up to, helps controlling costs",
        minWorkerZeroWarning: "Setting to 0 may affect cold start time",
        minWorkerExceedsMax:
          "Minimum workers cannot be greater than maximum workers",
        maxWorkerLessThanMin:
          "Maximum workers cannot be less than minimum workers",
        idleTimeout: "Idle Timeout (seconds)",
        idleTimeoutHelp:
          "Idle timeout is the time for idle worker threads to keep running for new requests (in seconds). You will be charged for idle timeout.",
        maxConcurrency: "Max Concurrency",
        maxConcurrencyHelp:
          "Maximum number of concurrent requests per worker, helps handling multi-process issues",
        gpusPerWorker: "GPUs / Worker",
        gpusPerWorkerHelp: "Number of GPUs per worker",
        cudaVersion: "CUDA Version",
        scalePolicy: "Scale Policy",
        scalePolicyHelp:
          "Queue Delay\\nAdjusts the number of workers based on the waiting time of requests in the queue.\\n\\nRequest Count\\nAutomatically adjusts the number of workers based on the number of requests in the queue.",
        scalePolicyDelay: "Queue Delay",
        scalePolicyReq: "Request Count",
        scaleQueueDelayTime: "Queue Delay Time (seconds)",
        scaleQueueReqCount: "Worker Max Request Count",
        imageConfig: "Image Configuration",
        imageAddr: "Container Image",
        imageRepoCredential: "Container Registry Credential",
        addCredentials: "Add Credentials",
        containerStartCmd: "Container Start Command",
        httpPort: "HTTP Port",
        healthCheckPath: "Health Check Path",
        healthCheckPathStartError: "Health check path must start with '/'",
        healthCheckPathInvalidError:
          "Health check path can only contain letters, numbers, hyphens, underscores, period, and slashes",
        storageConfig: "Storage Configuration",
        osSize: "Container Disk",
        localSize: "Volume Disk",
        localMount: "Local Mount",
        free: "Free",
        invalidOsSize: "Container disk size must be between ${0}GB and ${1}GB",
        invalidLocalSize: "Volume disk size must be between ${0}GB and ${1}GB",
        localMountPath: "Volume Mount Path",
        invalidMountPath:
          "Mount path must start with '/' and only contain letters, numbers, underscores, period, and hyphens.",
        cloudStorage: "Network Volume",
        createCloudStorage: "Create Network Volume",
        networkStorageMountPath: "Network Volume Mount Path",
        needMoreStorage: "Need More Storage?",
        contactUs: "Contact us",
        others: "Others",
        env: "Environment Variables",
        addEnv: "Add Environment Variable",
        envName: "Key",
        envValue: "Value",
        serverlessPrice: "Serverless price",
        serverlessStoragePrice: "Storage price",
        diskPrice: "Storage price",
        createOkButton: "Deploy",
        editOkButton: "Save",
        cancelButton: "Cancel",
        createError: "Creating endpoint failed",
        createSuccess: "Endpoint created successfully",
        editError: "Failed to edit the endpoint",
        editSuccess: "Endpoint saved successfully",
        deleteSuccess: "Endpoint deleted successfully",
        deleteError: "Failed to delete the endpoint",
        editConfirmTitle: "Confirm changes",
        editConfirmContent:
          "Are you sure you want to modify? We will use the **enable new instance first, then release old instance** strategy based on your adjustments, which is expected to last about 1 minute. During this process, the number of instances running simultaneously may **exceed the maximum worker number**, if the duration is too long, please click the bottom right corner to contact us for processing!",
      },
      deleteModal: {
        title: "Delete Endpoint",
        description:
          "Deleting your “{{endpoint_name}}” Endpoint. This will delete all worker processes associated with this endpoint. Confirm to permanently delete this endpoint by entering the name of the endpoint below.",
        placeholder: "Your Endpoint Name",
        cancel: "Cancel",
        confirm: "Delete",
        needName: "Please enter the endpoint name",
        wrongName: "Endpoint name is incorrect",
      },
      urlCopied: "URL Copied",
    },
    worker: {
      state: {
        pending: "Pending",
        creating: "Starting",
        running: "Running",
        paused: "Paused",
        unpaused: "Unpaused",
        stopped: "Stopped",
        failed: "Failed",
        unscheduling: "Unscheduling",
        terminating: "Terminating",
        unknown: "Unknown",
      },
      scale: {
        min: "Min",
        max: "Max",
      },
      scaledDueToArrears: "Your account balance is insufficient, scaled to 0",
    },
    billling: {},
    moneyChar: "$",
    unitTxt: "s",
    createEndpointBtnTxt: "Create Endpoint",
    logsModal: {
      title: "Logs",
      sysLogTxt: "System Logs",
      insLogsTxt: "Worker Logs",
      closeBtnTxt: "Close",
    },
    serverlessTopNav: "Serverless",
    fitTip: "Great for running",
    fitAnd: "and",
    fitLatest: "models.",
    fitTip4090: "",
    fitTip409098: "",
    fitTip4090Last: "",
    fitTip3090: "",
    fitTipA100:
      "Powerful GPU, engineered for AI and high-performance computing.",
    noAuth: "No Auth!",
    toolTips: {
      checkWorker: "Click to view Worker",
      checkWorkerLogs: "Click to view Worker Logs",
      priceHelp:
        "The price of each Worker, not per GPU. We charge for workers in running/starting state, and the billing is accurate to the second.",
      editEndpoint: "Edit Endpoint",
      deleteEndpoint: "Delete Endpoint",
      asyncDeleteEndpointTips:
        "Endpoints with workers cannot be deleted. Please modify the Workers Min value to 0, and delete the Endpoint after the Workers are released.",
      endpointMetrics: "Click to view Endpoint Metrics",
      endpointLogs: "Click to view Endpoint Logs",
      workerNotHealthy: "Health check failed",
    },
  };
}
const workerStates = [
  WORKER_STATE.RUNNING,
  WORKER_STATE.PENDING,
  WORKER_STATE.CREATING,
  WORKER_STATE.PAUSED,
  WORKER_STATE.UNPAUSED,
  WORKER_STATE.STOPPED,
  WORKER_STATE.FAILED,
  WORKER_STATE.UNSCHEDULING,
  WORKER_STATE.TERMINATING,
  WORKER_STATE.ERROR,
  WORKER_STATE.EXITED,
  WORKER_STATE.PULLING,
  WORKER_STATE.STOPPING,
  WORKER_STATE.STARTING,
  WORKER_STATE.UNKNOWN,
];

function WorkerStateButton({
  expanded,
  expandedState,
  getWorkerState,
  onExpand,
  state,
  workers,
}: {
  expanded: boolean;
  expandedState: WORKER_STATE | null;
  getWorkerState: (state: WORKER_STATE, copy?: unknown) => string;
  onExpand: (state: WORKER_STATE) => void;
  state: WORKER_STATE;
  workers: WorkerType[];
}) {
  const workersCount = workers.filter(
    (worker) => worker.state === state,
  ).length;

  return (
    <Tooltip title={"Click to view Worker"}>
      <span
        className={`${styles.worker_state} ${styles[state]} ${expanded && expandedState === state ? styles.active : ""} ${workersCount > 0 ? "" : styles.disabled} cursor-pointer`}
        onClick={() => {
          if (workersCount === 0) {
            return;
          }
          onExpand(state);
        }}
      >
        {workersCount} {getWorkerState(state, createCopy())}
      </span>
    </Tooltip>
  );
}

export default function ServerlessItem({
  endpoint,
  refresh,
}: {
  endpoint: any;
  refresh: () => void;
}) {
  const { arrears, clusterList, products, authList, formConstraints } =
    useServerlessContext();
  const [product, setProduct] = useState(
    products.find((p: any) => p.id === endpoint.product.id),
  );
  useEffect(() => {
    setProduct(products.find((p: any) => p.id === endpoint.product.id));
  }, [products, endpoint.product.id]);
  const members = useAppSelector((state) => state.user.allTeamMembers) || [];
  function getCreator(creator: any, uuid: any) {
    const targetItem = members.find((item: any) => item.memberId === creator);
    if (targetItem) {
      return {
        name: targetItem.alias || "",
        email: targetItem.email,
      };
    } else {
      const newTargetItem = members.find((item: any) => item.userId === uuid);
      if (newTargetItem) {
        return {
          name: newTargetItem.alias || "",
          email: newTargetItem.email,
        };
      } else {
        return {
          name: "",
          email: "",
        };
      }
    }
  }
  const creatorInfo: any = getCreator(endpoint.creator, endpoint.uuid);
  const [expanded, setExpanded] = useState<boolean>(false);
  const [expandedState, setExpandedState] = useState<WORKER_STATE | null>(null);
  const getWorkerState = useCallback((state: WORKER_STATE, copy?: unknown) => {
    switch (state) {
      case WORKER_STATE.PENDING:
        return "Pending";
      case WORKER_STATE.CREATING:
        return "Starting";
      case WORKER_STATE.RUNNING:
        return "Running";
      case WORKER_STATE.PAUSED:
        return "Paused";
      case WORKER_STATE.UNPAUSED:
        return "Unpaused";
      case WORKER_STATE.STOPPED:
        return "Stopped";
      case WORKER_STATE.FAILED:
        return "Failed";
      case WORKER_STATE.UNSCHEDULING:
        return "Unscheduling";
      case WORKER_STATE.TERMINATING:
        return "Terminating";
      case WORKER_STATE.ERROR:
        return "Error";
      case WORKER_STATE.EXITED:
        return "Exited";
      case WORKER_STATE.PULLING:
        return "Pulling";
      case WORKER_STATE.STOPPING:
        return "Stopping";
      case WORKER_STATE.STARTING:
        return "Starting";
      case WORKER_STATE.UNKNOWN:
      default:
        return "Unknown";
    }
  }, []);
  const [displayWorkers, setDisplayWorkers] = useState<WorkerType[]>(
    endpoint.workers,
  );
  const expandWithState = useCallback(
    (state: WORKER_STATE | null) => {
      setExpandedState(state);
      if (state) {
        setDisplayWorkers(
          endpoint.workers.filter((w: any) => w.state === state),
        );
      }
      setExpanded(true);
    },
    [endpoint],
  );
  useEffect(() => {
    if (!expanded || expandedState === null) {
      return;
    }
    setDisplayWorkers(
      endpoint.workers.filter((w: WorkerType) => w.state === expandedState),
    );
  }, [endpoint.workers, expanded, expandedState]);
  const [openPopoverId, setOpenPopoverId] = useState<string | null>(null);
  const [deleteModalInfo, setDeleteModalInfo] = useState<{
    show: boolean;
    endpoint: EndpointType | null;
  }>({
    show: false,
    endpoint: null,
  });
  const [deleting, setDeleting] = useState(false);
  const handleDelete = useCallback(async () => {
    setDeleting(true);
    deleteEndpoint(endpoint.id)
      .then(() => {
        message.success("Delete endpoint successfully");
      })
      .finally(() => {
        setDeleting(false);
        setDeleteModalInfo({ ...deleteModalInfo, show: false });
        refresh();
      });
  }, [endpoint.id, deleteModalInfo, setDeleteModalInfo, refresh]);
  const [deleteModalInputValue, setDeleteModalInputValue] = useState("");
  const [showLogsModalInfo, setShowLogsModalInfo] = useState<{
    show: boolean;
    instanceAddress: string;
  }>({ show: false, instanceAddress: "" });
  const [modifyModalInfo, setModifyModalInfo] = useState<{
    show: boolean;
    endpoint: EndpointType | null;
  }>({
    show: false,
    endpoint: null,
  });
  const [createInstanceInfoParams, setCreateInstanceInfoParams] =
    useState<any>(null);
  function getCreateParameter(params: any) {
    setCreateInstanceInfoParams(params);
  }
  const [modifying, setModifying] = useState(false);
  const addEndpointRef = useRef<AddEndpointRef>(null);
  const [modifyConfirmOpen, setModifyConfirmOpen] = useState(false);
  const [modifyConfirmParams, setModifyConfirmParams] = useState<any>(null);
  const handleModify = useCallback(async () => {
    const err = addEndpointRef.current?.checkValid();
    if (err) {
      message.error(err);
      return;
    }
    const values = createInstanceInfoParams;
    const endpointLocalStorage = endpoint?.storage.find(
      (item: any) => item.type === STORAGE_TYPE.LOCAL,
    );
    const params = {
      localDiskSize: endpointLocalStorage?.size,
      localMountPath: endpointLocalStorage?.mountPath,
      cudaVersion: endpoint.workerConfig.cudaVersion,
      ...values,
      clusterIDs: (values?.clusterIDs || []).includes("")
        ? []
        : values?.clusterIDs || [],
    };
    setModifyConfirmParams(params);
    setModifyConfirmOpen(true);
    // setModifying(true);
    // updateEndpoint(endpoint.id, params)
    //   .then(() => {
    //     message.success("Modify endpoint successfully");
    //     setModifyModalInfo({ ...modifyModalInfo, show: false });
    //   })
    //   .finally(() => {
    //     setModifying(false);
    //   });
  }, [
    endpoint?.storage,
    endpoint.workerConfig.cudaVersion,
    createInstanceInfoParams,
  ]);
  const confirmModify = useCallback(() => {
    if (!modifyConfirmParams) {
      return;
    }
    setModifying(true);
    return updateEndpoint(endpoint.id, modifyConfirmParams)
      .then((res) => {
        message.success("Endpoint saved successfully");
        setModifyModalInfo((prev) => ({ ...prev, show: false }));
        setModifying(false);
        setModifyConfirmParams(null);
        refresh();
      })
      .catch((error) => {
        message.error(error.message || "Failed to edit the endpoint");
        setModifying(false);
      });
  }, [
    endpoint.id,
    modifyConfirmParams,
    refresh,
    setModifyModalInfo,
    setModifyConfirmParams,
  ]);
  const [initFormValue, setInitFormValue] = useState<any>(null);
  const genInitFormValue = useCallback(() => {
    if (!endpoint) {
      return {};
    }
    const networkStorage = endpoint?.storage?.find(
      (item: any) => item.type === STORAGE_TYPE.NETWORK,
    );
    const initVals: any = {
      name: endpoint.name,
      clusterID:
        endpoint.clusterIDs?.length === 1 ? endpoint.clusterIDs[0] : "",
      clusterIDs:
        endpoint.clusterIDs?.length === 1 &&
        (product?.clusterIDs as any)?.length > 0 &&
        !product?.clusterIDs.includes(endpoint.clusterIDs[0])
          ? []
          : endpoint.clusterIDs,
      minWorker: endpoint.workerConfig.min,
      maxWorker: endpoint.workerConfig.max,
      idleTimeout: Number(endpoint.workerConfig.freeTimeout || 0),
      maxConcurrency: Number(endpoint.workerConfig.maxConcurrent || 0),
      requestTimeout: endpoint.workerConfig.requestTimeout,
      gpusPerWorker: endpoint.workerConfig.gpuNum,
      scalePolicy: endpoint.scalePolicy.type,
      queueDelayTime:
        endpoint.scalePolicy.type === SCALE_POLICY.QUEUE_DELAY
          ? endpoint.scalePolicy.value
          : undefined,
      maxReqCount:
        endpoint.scalePolicy.type === SCALE_POLICY.REQUEST_COUNT
          ? Number(endpoint.scalePolicy.value || 0)
          : undefined,
      healthCheckPath: endpoint.healthy?.path,
      envs: endpoint.envs,
      httpPort: endpoint.port,
      startCmd: endpoint.image.startCmd,
      imageCredential: endpoint.image.credential,
      imageAddr: endpoint.image.imageAddr,
      type: endpoint.type,
    };
    if (networkStorage) {
      initVals.networkStorageMountPath = networkStorage.mountPath;
      initVals.networkStorageId = networkStorage.id;
    } else {
      initVals.clusterID = "";
    }
    if (!initVals.clusterID && initVals.clusterIDs?.length === 0) {
      initVals.clusterIDs = [""];
    }
    setInitFormValue(initVals);
  }, [endpoint, product]);
  const endpointLogAddress = endpoint.log || endpoint.logs || "";
  return (
    <div className="rounded-[8px] border-[1px] border-[var(--gray-2)]">
      <div className={styles.item_top}>
        <div className="flex items-center gap-[6px]">
          {(endpoint?.state?.length || 0) > 0 && (
            <span className="px-2 py-1 font-small-console rounded-[9999px] bg-[var(--brand-3)] text-[var(--brand-1)]">
              {endpoint.state.charAt(0).toUpperCase() + endpoint.state.slice(1)}
            </span>
          )}
          <span className={styles.item_name}>{endpoint.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-small-console text-[var(--dark-3-1)]">
            {"Created by:"}
          </span>{" "}
          <span className="font-small-console-medium text-[var(--dark-1)]">
            {creatorInfo.name || creatorInfo.email}
          </span>
          <div className="w-[1px] h-[10px] bg-[var(--gray-1)]"></div>
          <span className="font-small-console text-[var(--dark-3-1)]">
            {getDateDisplay(Number.parseInt(endpoint.createdAt), "hour")}
          </span>
        </div>
      </div>
      <div className={styles.item_bottom}>
        <div className="flex flex-row gap-[48px] w-full">
          <div className="flex flex-col items-center justify-start gap-[12px] w-[50%]">
            <div className="flex flex-row items-center justify-start gap-[12px] w-full">
              <div className="w-[80px] font-small-console text-[var(--dark-3)]">
                {"ENDPOINT ID"}
              </div>
              <div
                className="font-subtle text-[var(--dark-1)] flex items-center justify-center
                      px-[7px] py-[3px] rounded-[4px] border-[1px] border-[var(--gray-3)] bg-[var(--gray-4)]"
              >
                {endpoint.id}
              </div>
            </div>
            <div className="flex flex-row items-center justify-start gap-[12px] w-full">
              <div className="w-[80px] shrink-0 font-small-console text-[var(--dark-3)]">
                {"URL"}
              </div>
              <div className="font-subtle text-[var(--dark-1)]">
                {endpoint.url}
                <CopyButton content={endpoint?.url || ""} />
              </div>
            </div>
            <div className="flex flex-row items-center justify-start gap-[12px] w-full">
              <div className="w-[80px] font-small-console text-[var(--dark-3)]">
                {"REGION"}
              </div>
              <div className="font-subtle text-[var(--dark-1)] flex items-center">
                <Globe className="w-[14px] h-[14px] mr-[6px] text-[var(--dark-3-1)]" />
                {endpoint?.clusterIDs
                  ?.map(
                    (id: string) =>
                      clusterList?.find((c: any) => c.id === id)?.name || id,
                  )
                  .join(",") || "/"}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-[12px] w-[50%]">
            <div className="flex flex-row items-center justify-start gap-[12px] w-full">
              <div className="w-[50px] font-small-console text-[var(--dark-3)]">
                {"IMAGE"}
              </div>
              <div className="font-subtle text-[var(--dark-1)]">
                {endpoint?.image?.imageAddr || "/"}
              </div>
            </div>
            <div className="flex flex-row items-center justify-start gap-[12px] w-full">
              <div className="w-[50px] font-small-console text-[var(--dark-3)]">
                {"TYPE"}
              </div>
              <div
                className="font-subtle text-[var(--dark-1)] flex items-center justify-center
                      px-[8px] py-[4px] rounded-[4px] border-[1px] border-[var(--gray-3)] bg-[var(--gray-4)]"
              >
                {endpoint.type.charAt(0).toUpperCase() + endpoint.type.slice(1)}
              </div>
            </div>
          </div>
        </div>
        <div className={styles.inner_bottom}>
          <div className="flex flex-row items-center justify-between gap-[32px] w-full">
            <div className="flex flex-row items-center justify-start gap-[32px]">
              <div className="flex flex-col items-start justify-start gap-[4px]">
                <div className="font-small-console text-[var(--dark-3)]">
                  {"WORKERS RUNNING"}
                </div>
                {arrears && endpoint.workers.length === 0 ? (
                  <span style={{ color: "var(--error-color)" }}>
                    {"Your account balance is insufficient, scaled to 0"}
                  </span>
                ) : (
                  <div
                    className="px-2 py-[1px] rounded-[4px] border-[1px] border-[var(--brand-2)] bg-[var(--brand-3)]
                  flex items-center justify-center gap-[6px]"
                  >
                    <img
                      src="/gpu-instance/serverless/icon-running.svg"
                      alt="running"
                      className="w-[14px] h-[14px]"
                    />
                    <span className="font-subtle-demibold text-[var(--brand-1)] flex flex-row gap-1">
                      {!arrears &&
                        endpoint.workers.length > 0 &&
                        workerStates
                          .filter((s) => {
                            return (
                              endpoint.workers.filter((w: any) => w.state === s)
                                .length > 0
                            );
                          })
                          .map((s) => (
                            <WorkerStateButton
                              key={s}
                              expanded={expanded}
                              expandedState={expandedState}
                              getWorkerState={getWorkerState}
                              onExpand={expandWithState}
                              state={s}
                              workers={endpoint.workers}
                            />
                          ))}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-col items-start justify-start gap-[4px]">
                <div className="font-small-console text-[var(--dark-3)]">
                  {"GPU CONFIG"}
                </div>
                <div className="flex items-center justify-center gap-[6px]">
                  <Gpu className="w-4 h-4 text-[var(--dark-3-1)]" />
                  <span className="font-subtle-demibold text-[var(--dark-1)]">
                    {`${endpoint.workerConfig?.gpuNum} * ${product?.gpu_name}`}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start gap-[4px]">
                <div className="font-small-console text-[var(--dark-3)]">
                  {"WORKERS"}
                </div>
                <div className="flex items-center justify-center gap-[6px]">
                  <span className="font-subtle-demibold text-[var(--dark-1)]">
                    {`Min ${endpoint.workerConfig?.min} - Max ${endpoint.workerConfig?.max}`}
                  </span>
                </div>
              </div>
            </div>
            <ChevronDown
              className={`w-6 h-6 text-[var(--dark-3-1)] cursor-pointer ${expanded ? "rotate-180" : ""}`}
              onClick={() => setExpanded(!expanded)}
            />
          </div>
          {expanded && (
            <>
              <div className="h-[1px] w-full bg-[var(--gray-2)] mb-[2px]"></div>
              {displayWorkers.length > 0 && (
                <div className="w-full flex flex-row items-center justify-start gap-[10px]">
                  <WorkerManager workers={displayWorkers} />
                </div>
              )}
              <div className="w-full flex items-center justify-between">
                <div className="flex flex-row items-center gap-[8px]">
                  <Popover
                    open={openPopoverId === endpoint.id}
                    onOpenChange={(open) =>
                      setOpenPopoverId(open ? endpoint.id : null)
                    }
                  >
                    <PopoverTrigger asChild>
                      <div
                        className="px-2 py-1 h-7 shrink-0 flex items-center justify-center
                      hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px] border-[1px] 
                      border-[var(--gray-1)] bg-[var(--white)]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Ellipsis className="w-4 h-4 mr-1 shrink-0 text-[var(--dark-1)]" />
                        <span className="font-small-console text-[var(--black)]">
                          {"More"}
                        </span>
                      </div>
                    </PopoverTrigger>
                    <PopoverContent
                      side="bottom"
                      className="w-auto px-1 py-2"
                      align="start"
                    >
                      <Tooltip title={"Edit Endpoint"}>
                        <div
                          className="font-subtle text-[var(--dark-1)] rounded-[4px] 
                            px-4 py-[6px] hover:bg-[var(--gray-3)] cursor-pointer"
                          onClick={() => {
                            // modifyTemplate(item.Id);
                            genInitFormValue();
                            setModifyModalInfo({
                              show: true,
                              endpoint: endpoint,
                            });
                          }}
                        >
                          Edit
                        </div>
                      </Tooltip>
                      <Tooltip title={"Delete Endpoint"}>
                        <div
                          className="font-subtle text-[var(--dark-1)] rounded-[4px] 
                              px-4 py-[6px] hover:bg-[var(--gray-3)] cursor-pointer"
                          onClick={() => {
                            // deleteTemplate(item);
                            setDeleteModalInfo({
                              show: true,
                              endpoint: endpoint,
                            });
                          }}
                        >
                          Delete
                        </div>
                      </Tooltip>
                    </PopoverContent>
                  </Popover>
                  {endpointLogAddress && (
                    <Tooltip title={"Click to view Endpoint Logs"}>
                      <div
                        className="px-2 py-1 h-7 shrink-0 flex items-center justify-center
                      hover:cursor-pointer hover:bg-[var(--gray-2)] rounded-[4px] border-[1px]
                      border-[var(--gray-1)] bg-[var(--white)]"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowLogsModalInfo({
                            show: true,
                            instanceAddress: endpointLogAddress,
                          });
                        }}
                      >
                        <span className="font-small-console text-[var(--black)]">
                          {createCopy().endpoint.logs}
                        </span>
                      </div>
                    </Tooltip>
                  )}
                </div>
                <div className="flex flex-row items-center gap-[8px]">
                  <div className="font-body-medium text-[var(--brand-1)]">
                    {`Price: $${
                      (product?.discount || product?.price || 0) *
                      (endpoint.workerConfig?.gpuNum || 1)
                    }/worker/sec`}
                  </div>
                  <Tooltip
                    title={
                      "The price of each Worker, not per GPU. We charge for workers in running/starting state, and the billing is accurate to the second."
                    }
                  >
                    <CircleQuestionMark className="w-4 h-4 text-[var(--dark-3-1)]" />
                  </Tooltip>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      {deleteModalInfo?.show && (
        <Dialog
          open={deleteModalInfo.show}
          onOpenChange={() =>
            setDeleteModalInfo({ ...deleteModalInfo, show: false })
          }
        >
          <DialogContent className="w-[690px]">
            <DialogHeader>
              <DialogTitle>{"Delete Endpoint"}</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-4">
              <div>
                {"Deleting your “{{endpoint_name}}” Endpoint. This will delete all worker processes associated with this endpoint. Confirm to permanently delete this endpoint by entering the name of the endpoint below.".replace(
                  "{{endpoint_name}}",
                  endpoint.name,
                )}
              </div>
              <div>
                <Tooltip title={<div>{"Click to copy"}</div>}>
                  <span
                    onClick={() => copyText(endpoint.name)}
                    className={styles.delete_endpoint_name}
                  >
                    {endpoint.name}
                  </span>
                </Tooltip>
              </div>
              <Input
                placeholder={"Your Endpoint Name"}
                value={deleteModalInputValue}
                onChange={(e) => {
                  setDeleteModalInputValue(e.target.value);
                }}
                className={`${endpoint.name !== deleteModalInputValue ? "!border-[var(--error-color)]" : ""}`}
              />
            </div>
            <DialogFooter className="mt-4">
              <Button
                variant="outline"
                onClick={() =>
                  setDeleteModalInfo({ ...deleteModalInfo, show: false })
                }
                id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_CANCEL}
              >
                {"Cancel"}
              </Button>
              <Button
                variant="default"
                disabled={deleting || endpoint.name !== deleteModalInputValue}
                onClick={handleDelete}
                id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_SAVE}
              >
                {"Delete"}
                {deleting && (
                  <Loader2 size={14} className="ml-2 animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      {showLogsModalInfo.show && (
        <Logs
          showModal={showLogsModalInfo.show}
          instanceLogAddress={showLogsModalInfo.instanceAddress}
          finishForm={() =>
            setShowLogsModalInfo({ ...showLogsModalInfo, show: false })
          }
        />
      )}
      {modifyModalInfo.show && (
        <Dialog
          modal={false}
          open={modifyModalInfo.show}
          onOpenChange={(open) => {
            if (!open && modifyConfirmOpen) return;
            setModifyModalInfo((prev) => ({ ...prev, show: open }));
          }}
        >
          <DialogContent className="flex w-[895px] max-w-[895px] max-h-[80vh] flex-col overflow-hidden p-6">
            <DialogHeader className="shrink-0">
              <DialogTitle>{"Modify Endpoint"}</DialogTitle>
            </DialogHeader>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <AddEndpoint
                ref={addEndpointRef}
                mode="Edit"
                authList={authList}
                clusterList={clusterList}
                formConstraints={formConstraints}
                endpoint={initFormValue}
                onGetCreateParameter={getCreateParameter}
              />
            </div>
            <DialogFooter className="shrink-0 bg-background pt-4">
              <Button
                variant="outline"
                className="mr-1"
                onClick={() =>
                  setModifyModalInfo((prev) => ({ ...prev, show: false }))
                }
                id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_CANCEL}
              >
                {"Cancel"}
              </Button>
              <Button
                variant="default"
                disabled={modifying}
                onClick={handleModify}
                id={CLICK_BTN_IDs.SETTINGS.TEAM_MEMBER_EDIT_SAVE}
              >
                {"Save"}
                {modifying && (
                  <Loader2 size={14} className="ml-2 animate-spin" />
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      <ConfirmDialog
        open={modifyConfirmOpen}
        onOpenChange={(open) => {
          setModifyConfirmOpen(open);
          if (!open) {
            setModifyConfirmParams(null);
          }
        }}
        title="Confirm changes"
        description={
          <div style={{ color: "var(--dark-2)" }}>
            {"Are you sure you want to modify? We will use the **enable new instance first, then release old instance** strategy based on your adjustments, which is expected to last about 1 minute. During this process, the number of instances running simultaneously may **exceed the maximum worker number**, if the duration is too long, please click the bottom right corner to contact us for processing!"
              .split("**")
              .map((text, index) => {
                return index % 2 === 0 ? (
                  <span key={index}>{text}</span>
                ) : (
                  <strong key={index}>{text}</strong>
                );
              })}
          </div>
        }
        confirmClassName={styles.deployBtn}
        cancelClassName={`${styles.delete_modal_cancel_btn} ${styles.cancelBtn}`}
        onConfirm={confirmModify}
      />
    </div>
  );
}

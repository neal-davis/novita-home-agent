import { CircleQuestionMark, Clock4, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { cn } from "@/lib/utils";
import {
  FieldError,
  SelectChevronWithClearIcon,
} from "./addEndpointFormHelpers";
import styles from "./addEndpoint.module.scss";
import AddEndpointStorageFields from "./AddEndpointStorageFields";

function createScalePolicyHelpLines() {
  return [
    { key: "queue-title", text: "Queue Delay" },
    {
      key: "queue-description",
      text: "Adjusts the number of workers based on the waiting time of requests in the queue.",
    },
    { key: "separator", text: "" },
    { key: "concurrency-title", text: "Request Count" },
    {
      key: "concurrency-description",
      text: "Automatically adjusts the number of workers based on the number of requests in the queue.",
    },
  ];
}

// react-doctor-disable-next-line react-doctor/no-giant-component -- Serverless endpoint form fields remain coupled through shared validation; fieldset extraction is follow-up work.
export default function AddEndpointFields({
  state,
  actions,
  options,
  validation,
}: any) {
  const {
    mode,
    endpoint,
    params,
    showAddImageAuth,
    isAuth,
    showAddNetworkStorageAuth,
  } = state;
  const {
    setParams,
    onGpuCountChange,
    setShowAddImageAuth,
    setShowAddNetworkStorageAuth,
  } = actions;
  const {
    gpusPerWorkerOptions,
    cudaVersionList,
    myAuthList,
    storageOptions,
    clusterList,
  } = options;
  const { formConstraints, visibleFieldErrors } = validation;
  const scalePolicyHelpLines = createScalePolicyHelpLines();

  return (
    <>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--dark-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">{"Execution Mode"}</div>
        </div>
        <div className="flex flex-row items-center gap-3 w-full">
          <button
            type="button"
            disabled={mode !== "Create"}
            onClick={() =>
              setParams({ ...params, type: "sync", scalePolicy: "queue" })
            }
            className={`w-[50%] flex flex-row items-center gap-2 p-4 rounded-[8px]
              ${mode === "Create" ? "cursor-pointer" : "cursor-not-allowed"}
            ${
              params.type === "sync"
                ? "border-[1.5px] border-[var(--dark-1)] bg-[var(--gray-3)]"
                : "border-[1px] border-[var(--gray-2)] bg-[var(--white)]"
            } text-left`}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-[8px]
              ${params.type === "sync" ? "bg-[var(--dark-1)]" : "bg-[var(--gray-3)]"}`}
            >
              <Clock4
                className={`w-5 h-5 text-[var(--dark-3-1)]
                ${params.type === "sync" ? "text-[var(--white)]" : "text-[var(--dark-3-1)]"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-h7 text-[var(--dark-1)]">{"Sync"}</div>
              <div className="font-subtle text-[var(--dark-3-1)]">
                {"Synchronous request-response mode"}
              </div>
            </div>
          </button>
          <button
            type="button"
            disabled={mode !== "Create"}
            onClick={() =>
              setParams({
                ...params,
                type: "async",
                scalePolicy: "concurrency",
              })
            }
            className={`w-[50%] flex flex-row items-center gap-2 p-4 rounded-[8px]
              ${mode === "Create" ? "cursor-pointer" : "cursor-not-allowed"}
            ${
              params.type === "async"
                ? "border-[1.5px] border-[var(--dark-1)] bg-[var(--gray-3)]"
                : mode === "Create"
                  ? "border-[1px] border-[var(--gray-2)] bg-[var(--white)]"
                  : "bg-[var(--gray-3)]"
            } text-left`}
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-[8px]
              ${params.type === "async" ? "bg-[var(--dark-1)]" : "bg-[var(--gray-3)]"}`}
            >
              <Menu
                className={`w-5 h-5 text-[var(--dark-3-1)]
                ${params.type === "async" ? "text-[var(--white)]" : "text-[var(--dark-3-1)]"}`}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="font-h7 text-[var(--dark-1)]">{"Async"}</div>
              <div className="font-subtle text-[var(--dark-3-1)]">
                {"Asynchronous queue-based mode"}
              </div>
            </div>
          </button>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--brand-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">
            {"Worker Configuration"}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start gap-3 w-full">
            <div
              className={`${mode === "Create" ? "w-[50%]" : "w-full"} flex flex-col gap-[6px]`}
            >
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Endpoint Name"}
                </div>
              </div>
              <div>
                <Input
                  id="serverless_name"
                  value={params.name}
                  onChange={(e) =>
                    setParams({ ...params, name: e.target.value })
                  }
                  placeholder="Enter endpoint name"
                  className={cn(
                    "h-[40px]",
                    visibleFieldErrors.name && "!border-[var(--error-color)]",
                  )}
                />
                <FieldError message={visibleFieldErrors.name} />
              </div>
            </div>
            {mode === "Create" && (
              <div className="w-[50%] flex flex-col gap-[6px]">
                <div className="flex flex-row items-center gap-1 min-h-[20px]">
                  <div className="font-small-console text-[var(--dark-1)]">
                    {"App Name"}
                  </div>
                  <Tooltip
                    title={
                      "App name is part of the Endpoint URL. You can define an app name as needed. Default to Endpoint ID"
                    }
                  >
                    <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                  </Tooltip>
                </div>
                <div>
                  <Input
                    id="serverless_appName"
                    maxLength={46}
                    value={params.appName}
                    onChange={(e) =>
                      setParams({ ...params, appName: e.target.value })
                    }
                    placeholder="Enter App Name"
                    className={cn(
                      "h-[40px]",
                      visibleFieldErrors.appName &&
                        "!border-[var(--error-color)]",
                    )}
                  />
                  <FieldError message={visibleFieldErrors.appName} />
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-row items-start gap-3 w-full">
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Workers Min"}
                </div>
                <Tooltip
                  title={
                    "Minimum number of workers to keep, helps reducing cold start time"
                  }
                >
                  <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                </Tooltip>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_minWorker",
                    type: "number",
                    min: formConstraints.minWorkerNum,
                    max: formConstraints.maxWorkerNum,
                    step: 1,
                    value: params.minWorker,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        minWorker: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "Enter Workers Min",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.minWorker &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.minWorker} />
              </div>
            </div>
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Workers Max"}
                </div>
                <Tooltip
                  title={
                    "Maximum number of workers to scale up to, helps controlling costs"
                  }
                >
                  <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                </Tooltip>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_maxWorker",
                    type: "number",
                    min: formConstraints.minWorkerNum,
                    max: formConstraints.maxWorkerNum,
                    step: 1,
                    value: params.maxWorker,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        maxWorker: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "Enter Workers Max",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.maxWorker &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.maxWorker} />
              </div>
            </div>
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Idle Timeout(s)"}
                </div>
                <Tooltip
                  title={
                    "Idle timeout is the time for idle worker threads to keep running for new requests (in seconds). You will be charged for idle timeout."
                  }
                >
                  <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                </Tooltip>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_idleTimeout",
                    type: "number",
                    min: formConstraints.minFreeTimeout,
                    max: formConstraints.maxFreeTimeout,
                    step: 1,
                    value: params.idleTimeout,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        idleTimeout: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "Enter Idle Timeout",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.idleTimeout &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.idleTimeout} />
              </div>
            </div>
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Max Concurrency"}
                </div>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_maxConcurrency",
                    type: "number",
                    min: formConstraints.minConcurrencyNum,
                    max: formConstraints.maxConcurrencyNum,
                    step: 1,
                    value: params.maxConcurrency,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        maxConcurrency: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "Enter Max Concurrency",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.maxConcurrency &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.maxConcurrency} />
              </div>
            </div>
          </div>
          <div className="flex flex-row items-start gap-3 w-full">
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"GPUs / Worker"}
                </div>
              </div>
              <Select
                value={params.gpusPerWorker}
                onValueChange={(value) => {
                  setParams({ ...params, gpusPerWorker: Number(value) });
                  onGpuCountChange?.(Number(value));
                }}
              >
                <SelectTrigger
                  id="serverless_gpusPerWorker"
                  className="h-[40px]"
                >
                  <SelectValue placeholder="Select GPUs / Worker" />
                </SelectTrigger>
                <SelectContent>
                  {gpusPerWorkerOptions.map((option: any) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {mode === "Create" && (
              <div className="w-[25%] flex flex-col gap-[6px]">
                <div className="flex flex-row items-center gap-1">
                  <div className={styles.required_text}>{"*"}</div>
                  <div className="font-small-console text-[var(--dark-1)]">
                    {"CUDA Version"}
                  </div>
                </div>
                <div>
                  <Select
                    value={params.cudaVersion}
                    onValueChange={(value) =>
                      setParams({ ...params, cudaVersion: value })
                    }
                  >
                    <SelectTrigger
                      id="serverless_cudaVersion"
                      className={cn(
                        "h-[40px]",
                        visibleFieldErrors.cudaVersion &&
                          "!border-[var(--error-color)]",
                      )}
                    >
                      <SelectValue placeholder="Select CUDA Version" />
                    </SelectTrigger>
                    <SelectContent>
                      {cudaVersionList.map((version: any) => (
                        <SelectItem key={version} value={version}>
                          {version}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldError message={visibleFieldErrors.cudaVersion} />
                </div>
              </div>
            )}
            <div className="w-[25%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Queue Timeout"}
                </div>
                <Tooltip
                  title={
                    "Set the maximum time a task can wait in the queue before being discarded."
                  }
                >
                  <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
                </Tooltip>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_requestTimeout",
                    type: "number",
                    min: formConstraints.minRequestTimeout,
                    max: formConstraints.maxRequestTimeout,
                    step: 1,
                    value: params.requestTimeout,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        requestTimeout: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "Enter Queue Timeout",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.requestTimeout &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.requestTimeout} />
              </div>
            </div>
            <div className="w-[25%] flex flex-col gap-[6px]"></div>
            {mode !== "Create" && (
              <div className="w-[25%] flex flex-col gap-[6px]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--brand-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">{"Scale Policy"}</div>
          <Tooltip
            title={
              <>
                {scalePolicyHelpLines.map((item) => (
                  <p key={item.key}>{item.text}</p>
                ))}
              </>
            }
          >
            <CircleQuestionMark className="w-[14px] h-[14px] text-[var(--dark-3)]" />
          </Tooltip>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start gap-3 w-full">
            <div
              className={`${mode === "Create" ? "w-[25%]" : "w-[50%]"} flex flex-col gap-[6px]`}
            >
              <div className="flex flex-row items-center gap-1 min-h-[20px]"></div>
              <RadioGroup
                value={params.scalePolicy}
                onValueChange={(value) =>
                  setParams({ ...params, scalePolicy: value })
                }
                className="mt-[10px] flex flex-row items-center gap-3"
              >
                {params.type === "sync" && (
                  <div className="w-[50%] flex flex-row items-center gap-2">
                    <RadioGroupItem
                      id="serverless_scalePolicy_queue"
                      value="queue"
                    ></RadioGroupItem>
                    <label
                      htmlFor="serverless_scalePolicy_queue"
                      className={`${styles.radio_text} cursor-pointer`}
                    >
                      Queue Delay
                    </label>
                  </div>
                )}
                <div className="w-[50%] flex flex-row items-center gap-2">
                  <RadioGroupItem
                    id="serverless_scalePolicy_concurrency"
                    value="concurrency"
                  >
                    Request Count
                  </RadioGroupItem>
                  <label
                    htmlFor="serverless_scalePolicy_concurrency"
                    className={`${styles.radio_text} cursor-pointer`}
                  >
                    Request Count
                  </label>
                </div>
              </RadioGroup>
            </div>
            {params.scalePolicy === "queue" && (
              <div
                className={`${mode === "Create" ? "w-[25%]" : "w-[50%]"} flex flex-col gap-[6px]`}
              >
                <div className="flex flex-row items-center gap-1 min-h-[20px]">
                  <div className={styles.required_text}>{"*"}</div>
                  <div className="font-small-console text-[var(--dark-1)]">
                    {"Queue Delay Time(s)"}
                  </div>
                </div>
                <div>
                  <Input
                    {...{
                      id: "serverless_queueDelayTime",
                      type: "number",
                      min: formConstraints.minQueueWaitTime,
                      max: formConstraints.maxQueueWaitTime,
                      step: 1,
                      value: params.queueDelayTime,
                      onChange: (e) =>
                        setParams({
                          ...params,
                          queueDelayTime: Number(e.target.value),
                        }),
                      // i18n-disable-next-line
                      placeholder: "Enter Queue Delay Time",
                      className: cn(
                        "h-[40px]",
                        visibleFieldErrors.queueDelayTime &&
                          "!border-[var(--error-color)]",
                      ),
                    }}
                  />
                  <FieldError message={visibleFieldErrors.queueDelayTime} />
                </div>
              </div>
            )}
            {params.scalePolicy === "concurrency" && (
              <div
                className={`${mode === "Create" ? "w-[25%]" : "w-[50%]"} flex flex-col gap-[6px]`}
              >
                <div className="flex flex-row items-center gap-1 min-h-[20px]">
                  <div className={styles.required_text}>{"*"}</div>
                  <div className="font-small-console text-[var(--dark-1)]">
                    {"Worker Max Request Count"}
                  </div>
                </div>
                <div>
                  <Input
                    {...{
                      id: "serverless_maxReqCount",
                      type: "number",
                      min: formConstraints.minRequestNum,
                      max: formConstraints.maxRequestNum,
                      step: 1,
                      value: params.maxReqCount,
                      onChange: (e) =>
                        setParams({
                          ...params,
                          maxReqCount: Number(e.target.value),
                        }),
                      // i18n-disable-next-line
                      placeholder: "Enter Worker Max Request Count",
                      className: cn(
                        "h-[40px]",
                        visibleFieldErrors.maxReqCount &&
                          "!border-[var(--error-color)]",
                      ),
                    }}
                  />
                  <FieldError message={visibleFieldErrors.maxReqCount} />
                </div>
              </div>
            )}
            {mode === "Create" && (
              <div className="w-[25%] flex flex-col gap-[6px]"></div>
            )}
            {mode === "Create" && (
              <div className="w-[25%] flex flex-col gap-[6px]"></div>
            )}
          </div>
        </div>
      </div>
      <div className="w-full">
        <div className="flex items-center justify-start gap-2 mb-3">
          <div className="w-1 h-[14px] bg-[var(--brand-1)]"></div>
          <div className="font-h6 text-[var(--dark-1)]">
            {"Image Configuration"}
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-row items-start gap-3 w-full">
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Container Image"}
                </div>
              </div>
              <div>
                <Input
                  id="serverless_imageAddr"
                  value={params.imageAddr}
                  onChange={(e) =>
                    setParams({ ...params, imageAddr: e.target.value })
                  }
                  placeholder="e.g. pytorch/pytorch:latest"
                  className={cn(
                    "h-[40px]",
                    visibleFieldErrors.imageAddr &&
                      "!border-[var(--error-color)]",
                  )}
                />
                <FieldError message={visibleFieldErrors.imageAddr} />
              </div>
            </div>
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1 min-h-[20px]">
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Container Registry Credential"}
                </div>
              </div>
              <Select
                key={
                  params.imageCredential
                    ? String(params.imageCredential)
                    : "__image_cred_unselected__"
                }
                value={
                  params.imageCredential
                    ? String(params.imageCredential)
                    : undefined
                }
                onValueChange={(value) => {
                  if (value === "-1") {
                    setParams({ ...params, imageCredential: "" });
                    if (isAuth()) {
                      setShowAddImageAuth({
                        ...showAddImageAuth,
                        showModal: true,
                      });
                    }
                  } else {
                    setParams({ ...params, imageCredential: value });
                  }
                }}
              >
                <SelectTrigger
                  id="serverless_imageCredential"
                  className="relative h-[40px] pr-9"
                  icon={
                    <SelectChevronWithClearIcon
                      // i18n-disable-next-line
                      clearAriaLabel="Clear container registry credential"
                      canClear={Boolean(
                        params.imageCredential &&
                          String(params.imageCredential).trim() !== "",
                      )}
                      onClear={() =>
                        setParams({ ...params, imageCredential: "" })
                      }
                    />
                  }
                >
                  <SelectValue placeholder="Select Container Registry Credential" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem
                    onClick={(e: any) => {
                      e.stopPropagation();
                      setShowAddImageAuth({
                        ...showAddImageAuth,
                        showModal: true,
                      });
                    }}
                    key={"-1"}
                    value={"-1"}
                  >
                    {"Add Credentials"}
                  </SelectItem>
                  {myAuthList?.map((auth: any) => (
                    <SelectItem key={auth.id} value={String(auth.id)}>
                      {auth.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex flex-row items-start gap-3 w-full">
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1">
                <div className={styles.required_text}>{"*"}</div>
                <div className="font-small-console text-[var(--dark-1)]">
                  {"HTTP Port"}
                </div>
              </div>
              <div>
                <Input
                  {...{
                    id: "serverless_httpPort",
                    type: "number",
                    min: 1,
                    max: 65535,
                    step: 1,
                    value: params.httpPort,
                    onChange: (e) =>
                      setParams({
                        ...params,
                        httpPort: Number(e.target.value),
                      }),
                    // i18n-disable-next-line
                    placeholder: "e.g. 8000",
                    className: cn(
                      "h-[40px]",
                      visibleFieldErrors.httpPort &&
                        "!border-[var(--error-color)]",
                    ),
                  }}
                />
                <FieldError message={visibleFieldErrors.httpPort} />
              </div>
            </div>
            <div className="w-[50%] flex flex-col gap-[6px]">
              <div className="flex flex-row items-center gap-1 min-h-[20px]">
                <div className="font-small-console text-[var(--dark-1)]">
                  {"Container Start Command"}
                </div>
              </div>
              <Input
                id="serverless_startCmd"
                value={params.startCmd}
                onChange={(e) =>
                  setParams({ ...params, startCmd: e.target.value })
                }
                placeholder="e.g. python app.py"
                className="h-[40px]"
              />
            </div>
          </div>
        </div>
      </div>
      <AddEndpointStorageFields
        state={{ mode, endpoint, params, isAuth, showAddNetworkStorageAuth }}
        actions={{ setParams, setShowAddNetworkStorageAuth }}
        options={{ storageOptions, clusterList }}
        validation={{ formConstraints, visibleFieldErrors }}
      />
    </>
  );
}

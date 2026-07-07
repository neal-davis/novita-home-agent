"use client";

import { ChevronDown, Trash2 } from "lucide-react";
import { forwardRef } from "react";
import { Button } from "@/components/ui/button";
import { isValidDockerImageAddress } from "@/lib/utils/dockerAddress";
import { cn } from "@/lib/utils";

export function genRandomEndpointName() {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = Math.floor(Math.random() * 6) + 10;
  let result = "";
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}
/** Hover chevron → show delete; click clears without opening the menu. */
export const SelectChevronWithClearIcon = forwardRef<
  HTMLDivElement,
  {
    canClear: boolean;
    onClear: () => void;
    disabled?: boolean;
    clearAriaLabel?: string;
  }
>(function SelectChevronWithClearIcon(
  { canClear, onClear, disabled, clearAriaLabel = "Clear selection" },
  ref,
) {
  return (
    <div
      ref={ref}
      className="group/selclearicon absolute right-3 top-1/2 z-[1] flex h-6 w-6 shrink-0 -translate-y-1/2 items-center justify-center"
    >
      <ChevronDown
        className={cn(
          "h-4 w-4 shrink-0 transition-opacity",
          canClear &&
            !disabled &&
            "group-hover/selclearicon:opacity-0 group-hover/selclearicon:pointer-events-none",
        )}
      />
      {canClear && !disabled ? (
        <Button
          type="button"
          variant="noborderghost"
          size="icon"
          tabIndex={-1}
          className="absolute inset-0 m-auto flex h-6 w-6 cursor-pointer items-center justify-center rounded-sm opacity-0 transition-opacity group-hover/selclearicon:opacity-100 hover:bg-[var(--fill-4)]"
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClear();
          }}
          aria-label={clearAriaLabel}
        >
          <Trash2 className="h-3.5 w-3.5 text-[var(--error-color)]" />
        </Button>
      ) : null}
    </div>
  );
});
SelectChevronWithClearIcon.displayName = "SelectChevronWithClearIcon";
export type FieldErrorKey =
  | "name"
  | "appName"
  | "minWorker"
  | "maxWorker"
  | "idleTimeout"
  | "maxConcurrency"
  | "cudaVersion"
  | "requestTimeout"
  | "queueDelayTime"
  | "maxReqCount"
  | "imageAddr"
  | "httpPort"
  | "osDiskSize"
  | "localDiskSize"
  | "localMountPath"
  | "networkStorageMountPath"
  | "healthCheckPath"
  | "envs";
const FIELD_ERROR_ORDER: FieldErrorKey[] = [
  "name",
  "appName",
  "minWorker",
  "maxWorker",
  "idleTimeout",
  "maxConcurrency",
  "cudaVersion",
  "requestTimeout",
  "queueDelayTime",
  "maxReqCount",
  "imageAddr",
  "httpPort",
  "osDiskSize",
  "localDiskSize",
  "localMountPath",
  "networkStorageMountPath",
  "healthCheckPath",
  "envs",
];
export function computeFieldErrors(
  p: any,
  mode: "Create" | "Edit",
  formConstraints: any,
): Partial<Record<FieldErrorKey, string>> {
  const e: Partial<Record<FieldErrorKey, string>> = {};
  if (!p) return e;
  if (p.name?.trim() === "") e.name = "Endpoint name is required";
  if (p.appName !== "" && !/^[a-z0-9]([-a-z0-9]*[a-z0-9])?$/.test(p.appName)) {
    e.appName =
      "App name can only contain lowercase letters, numbers, and hyphens (-), and must start and end with a letter or number";
  } else if (p.appName?.length > 46) {
    e.appName = "App name length cannot exceed 46 characters";
  }
  if (p.minWorker < formConstraints.minWorkerNum) {
    e.minWorker =
      "Workers Min must be greater than or equal to " +
      formConstraints.minWorkerNum;
  } else if (p.minWorker > p.maxWorker) {
    e.minWorker = "Minimum workers cannot be greater than maximum workers";
  }
  if (p.maxWorker > formConstraints.maxWorkerNum) {
    e.maxWorker =
      "Workers Max must be less than or equal to " +
      formConstraints.maxWorkerNum;
  } else if (p.minWorker > p.maxWorker) {
    e.maxWorker = "Minimum workers cannot be greater than maximum workers";
  }
  if (p.idleTimeout < formConstraints.minFreeTimeout) {
    e.idleTimeout =
      "Idle Timeout must be greater than or equal to " +
      formConstraints.minFreeTimeout;
  } else if (p.idleTimeout > formConstraints.maxFreeTimeout) {
    e.idleTimeout =
      "Idle Timeout must be less than or equal to " +
      formConstraints.maxFreeTimeout;
  }
  if (p.maxConcurrency < formConstraints.minConcurrencyNum) {
    e.maxConcurrency =
      "Max Concurrency must be greater than or equal to " +
      formConstraints.minConcurrencyNum;
  } else if (p.maxConcurrency > formConstraints.maxConcurrencyNum) {
    e.maxConcurrency =
      "Max Concurrency must be less than or equal to " +
      formConstraints.maxConcurrencyNum;
  }
  if (mode === "Create" && !p.cudaVersion?.trim()) {
    e.cudaVersion = "CUDA Version is required";
  }
  if (p.requestTimeout < formConstraints.minRequestTimeout) {
    e.requestTimeout =
      "Queue Timeout must be greater than or equal to " +
      formConstraints.minRequestTimeout;
  } else if (p.requestTimeout > formConstraints.maxRequestTimeout) {
    e.requestTimeout =
      "Queue Timeout must be less than or equal to " +
      formConstraints.maxRequestTimeout;
  }
  if (p.scalePolicy === "queue") {
    if (p.queueDelayTime < formConstraints.minQueueWaitTime) {
      e.queueDelayTime =
        "Queue Delay Time must be greater than or equal to " +
        formConstraints.minQueueWaitTime;
    } else if (p.queueDelayTime > formConstraints.maxQueueWaitTime) {
      e.queueDelayTime =
        "Queue Delay Time must be less than or equal to " +
        formConstraints.maxQueueWaitTime;
    }
  }
  if (p.scalePolicy === "concurrency") {
    if (typeof p.maxReqCount !== "number") {
      e.maxReqCount = "Worker Max Request Count must be a number";
    } else if (p.maxReqCount < formConstraints.minRequestNum) {
      e.maxReqCount =
        "Worker Max Request Count must be greater than or equal to " +
        formConstraints.minRequestNum;
    } else if (p.maxReqCount > formConstraints.maxRequestNum) {
      e.maxReqCount =
        "Worker Max Request Count must be less than or equal to " +
        formConstraints.maxRequestNum;
    }
  }
  if (p.imageAddr?.trim() === "") {
    e.imageAddr = "Container Image is required";
  } else if (isValidDockerImageAddress(p.imageAddr)) {
    e.imageAddr = "The container image is not valid";
  }
  if (p.httpPort < 1) {
    e.httpPort = "HTTP Port must be greater than or equal to 1";
  } else if (p.httpPort > 65535) {
    e.httpPort = "HTTP Port must be less than or equal to 65535";
  }
  if (mode === "Create") {
    if (p.osDiskSize < formConstraints.minRootfsSize) {
      e.osDiskSize =
        "Container Disk must be greater than or equal to " +
        formConstraints.minRootfsSize;
    } else if (p.osDiskSize > formConstraints.maxRootfsSize) {
      e.osDiskSize =
        "Container Disk must be less than or equal to " +
        formConstraints.maxRootfsSize;
    }
  }
  if (p.isLocalMount) {
    const rawLocalDisk = p.localDiskSize;
    const localDiskNum =
      rawLocalDisk === "" ||
      rawLocalDisk == null ||
      (typeof rawLocalDisk === "number" && Number.isNaN(rawLocalDisk))
        ? NaN
        : Number(rawLocalDisk);
    if (Number.isNaN(localDiskNum)) {
      e.localDiskSize = "Volume Disk is required";
    } else if (localDiskNum < formConstraints.minLocalVolumeSize) {
      e.localDiskSize =
        "Volume Disk must be greater than or equal to " +
        formConstraints.minLocalVolumeSize;
    } else if (localDiskNum > formConstraints.maxLocalVolumeSize) {
      e.localDiskSize =
        "Volume Disk must be less than or equal to " +
        formConstraints.maxLocalVolumeSize;
    }
    if (p.localMountPath?.trim() === "") {
      e.localMountPath = "Volume Mount Path is required";
    }
  }
  if (
    p.networkStorageId &&
    (!p.networkStorageMountPath || p.networkStorageMountPath?.trim() === "")
  ) {
    e.networkStorageMountPath = "Network Volume Mount Path is required";
  }
  if (p.healthCheckPath?.trim() === "") {
    e.healthCheckPath = "Health Check Path is required";
  }
  if (
    p.envs?.length > 0 &&
    p.envs.some((env: { key?: string }) => env.key?.trim() === "")
  ) {
    e.envs = "Environment Variables key is required";
  }
  return e;
}
export function firstFieldErrorMessage(
  errors: Partial<Record<FieldErrorKey, string>>,
): string {
  for (const key of FIELD_ERROR_ORDER) {
    if (errors[key]) return errors[key]!;
  }
  return "";
}
export function firstFieldErrorKey(
  errors: Partial<Record<FieldErrorKey, string>>,
): FieldErrorKey | null {
  for (const key of FIELD_ERROR_ORDER) {
    if (errors[key]) return key;
  }
  return null;
}
/** Matches `id` on inputs / SelectTrigger in this form (see serverless_* ids). */
const FIELD_ELEMENT_ID: Record<Exclude<FieldErrorKey, "envs">, string> = {
  name: "serverless_name",
  appName: "serverless_appName",
  minWorker: "serverless_minWorker",
  maxWorker: "serverless_maxWorker",
  idleTimeout: "serverless_idleTimeout",
  maxConcurrency: "serverless_maxConcurrency",
  cudaVersion: "serverless_cudaVersion",
  requestTimeout: "serverless_requestTimeout",
  queueDelayTime: "serverless_queueDelayTime",
  maxReqCount: "serverless_maxReqCount",
  imageAddr: "serverless_imageAddr",
  httpPort: "serverless_httpPort",
  osDiskSize: "serverless_osDiskSize",
  localDiskSize: "serverless_localDiskSize",
  localMountPath: "serverless_localMountPath",
  networkStorageMountPath: "serverless_networkStorageMountPath",
  healthCheckPath: "serverless_healthCheckPath",
};
export function scrollToFirstFieldErrorElement(
  key: FieldErrorKey,
  p: any,
): void {
  if (typeof document === "undefined") return;
  let elementId: string;
  if (key === "envs") {
    const idx = p?.envs?.findIndex(
      (env: { key?: string }) => env.key?.trim() === "",
    );
    elementId =
      typeof idx === "number" && idx >= 0
        ? `serverless_key_${idx}`
        : "serverless_key_0";
  } else {
    elementId = FIELD_ELEMENT_ID[key];
  }
  const run = () => {
    const el = document.getElementById(elementId);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "center" });
    if (el instanceof HTMLElement && typeof el.focus === "function") {
      try {
        el.focus({ preventScroll: true });
      } catch {
        /* not focusable */
      }
    }
  };
  requestAnimationFrame(() => requestAnimationFrame(run));
}
export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <div className="text-[var(--error-color)] font-small-console">
      {message}
    </div>
  );
}

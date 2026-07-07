"use client";
import { FuncConstants } from "@/app/models/constants/funcs";

export enum TaskState {
  init = "INIT",
  loading = "TASK_STATUS_QUEUED",
  generating = "TASK_STATUS_PROCESSING",
  finished = "TASK_STATUS_SUCCEED",
  failed = "TASK_STATUS_FAILED",
}

export type DemoProps = {
  apiKey: string;
  funcInfo: FuncConstants;
  rootPage: "playground" | "product";
  onNeedLogin: () => void;
  onLowBalance: () => void;
  onCancel?: () => void;
  onFinish?: () => void;
  onFail?: () => void;
  onParamFocus?: (key: string) => void;
  onParamBlur?: (key: string) => void;
  onParamChange?: (key: string, val: any) => void;
  showCancelConfirm: (confirmHandler: () => void) => void;
};

import dayjs from "dayjs";

export type TimeRange = "5m" | "30m" | "1h" | "1d" | "7d" | "14d";

export function getTimeRangeOptions(): {
  label: string;
  value: TimeRange;
}[] {
  return [
    {
      label: "5 min",
      value: "5m",
    },
    {
      label: "30 min",
      value: "30m",
    },
    {
      label: "1 hour",
      value: "1h",
    },
    {
      label: "1 day",
      value: "1d",
    },
    {
      label: "7 day",
      value: "7d",
    },
    {
      label: "14 day",
      value: "14d",
    },
  ];
}

export const Metrics_Event = {
  Fetch_With_Abort: "fetch-with-abort",
  Fetch_Wait_Previous: "fetch-wait-previous",
  Cancel: "cancel",
  Clear: "clear",
};

function getTimeRange(timeRange: TimeRange): {
  startTime: number;
  endTime: number;
} {
  switch (timeRange) {
    case "5m":
      return {
        startTime: dayjs().subtract(5, "minutes").unix(),
        endTime: dayjs().unix(),
      };
    case "30m":
      return {
        startTime: dayjs().subtract(30, "minutes").unix(),
        endTime: dayjs().unix(),
      };
    case "1h":
      return {
        startTime: dayjs().subtract(1, "hour").unix(),
        endTime: dayjs().unix(),
      };
    case "1d":
      return {
        startTime: dayjs().subtract(1, "day").unix(),
        endTime: dayjs().unix(),
      };
    case "7d":
      return {
        startTime: dayjs().subtract(7, "days").unix(),
        endTime: dayjs().unix(),
      };
    case "14d":
      return {
        startTime: dayjs().subtract(14, "days").unix(),
        endTime: dayjs().unix(),
      };
    default:
      return {
        startTime: dayjs().subtract(5, "minutes").unix(),
        endTime: dayjs().unix(),
      };
  }
}

export type ChartData = {
  date: string;
  rpm?: number;
  tpm?: number;
  request_success_rate?: number;
  average_e2e_latency?: number;
  "95th_e2e_latency"?: number;
  average_ttft?: number;
  "95th_ttft"?: number;
  average_tpot?: number;
  "95th_tpot"?: number;
  RPM?: number;
  TPM_Input_Tokens?: number;
  TPM_Output_Tokens?: number;
  Request_Success_Rate?: number;
  Average_E2E_Latency?: number;
  "95th_E2E_Latency"?: number;
  Average_TTFT?: number;
  "95th_TTFT"?: number;
  Average_TPOT?: number;
  "95th_TPOT"?: number;
};

export type MetricsType = keyof Omit<ChartData, "date">;

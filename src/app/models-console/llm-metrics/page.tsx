"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import MetricsChartWrapper from "./components/CharWrapper";
import { getLLMMetrics, getLLMMetricsModels } from "@/api/metrics";
import styles from "./page.module.scss";
import { Badge } from "@/components/ui/badge";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { PERMISSION } from "@/constants/constants";
import { Metrics_Event } from "./components/types";
import { RangeButton } from "./components/RangeButton";
import EventEmitter from "./EventEmitter";
import { ChartTitle } from "./components/ChartTitle";
import { DateTimePicker } from "./components/DateTimePicker";
import { DateRange } from "react-day-picker";
import dayjs from "dayjs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";

const msFormatter = (value: number) => {
  if (value >= 60000) {
    // Convert to minutes if value is 60,000 ms or more
    return (value / 60000).toString().includes(".")
      ? (value / 60000).toFixed(2) +
          (Number((value / 60000).toFixed(2)) > 1 ? "mins" : "min")
      : value / 60000 +
          (Number((value / 60000).toFixed(2)) > 1 ? "mins" : "min");
  } else if (value >= 1000) {
    // Convert to seconds if value is 1,000 ms or more
    return (value / 1000).toString().includes(".")
      ? (value / 1000).toFixed(2) + "s"
      : value / 1000 + "s";
  }
  return value.toString().includes(".")
    ? value.toFixed(2) + "ms"
    : value + "ms";
};

const injectEmptyData = (
  res: any,
  nowRange: {
    startTime: number;
    endTime: number;
  },
) => {
  if (res.data && res.data.length > 0) {
    const dataFirst = res.data[0];
    const dataSecond = res.data[1];
    if (dataFirst?.date && dataSecond?.date) {
      const diffUnix = Number(dataSecond.date) - Number(dataFirst.date);

      let startTime = Number(dataFirst.date) - diffUnix;
      let endTime = Number(res.data.slice(-1)[0].date) + diffUnix;

      while (startTime > Number(nowRange.startTime)) {
        res.data.unshift({
          date: String(startTime),
          value: undefined,
        });
        startTime -= diffUnix;
      }

      while (endTime < Number(nowRange.endTime)) {
        res.data.push({
          date: String(endTime),
          value: undefined,
        });
        endTime += diffUnix;
      }
    } else {
      // handle one data
      // set default range
      // 0 ~ 1H 1min
      // 1 ~ 1Day 2min
      // 1Day ~ 1Week 15min
      // 1week ~ 2week 30min

      const getRange = (range: {
        startTime: number; //unix timestamp
        endTime: number; //unix timestamp
      }) => {
        if (range.endTime - range.startTime < 60 * 60) {
          return 60;
        } else if (range.endTime - range.startTime < 60 * 60 * 24) {
          return 120;
        } else if (range.endTime - range.startTime < 60 * 60 * 24 * 7) {
          return 900;
        } else if (range.endTime - range.startTime < 60 * 60 * 24 * 14) {
          return 1800;
        }
        return 1800;
      };

      const diffUnix = getRange(nowRange);

      let startTime = Number(dataFirst.date) - diffUnix;
      let endTime = Number(dataFirst.date) + diffUnix;

      while (startTime > Number(nowRange.startTime)) {
        res.data.unshift({
          date: String(startTime),
          value: undefined,
        });
        startTime -= diffUnix;
      }

      while (endTime < Number(nowRange.endTime)) {
        res.data.push({
          date: String(endTime),
          value: undefined,
        });
        endTime += diffUnix;
      }
    }
  }
};

function createRefreshRanges() {
  return [
    { label: "off", value: 0 },
    { label: "5 s", value: 5 },
    { label: "10 s", value: 10 },
    { label: "30 s", value: 30 },
    { label: "1 min", value: 60 },
  ];
}

export default function Page() {
  const range = createRefreshRanges();
  const [modelList, setModelList] = useState<any[]>([]);
  const [selectedModel, setSelectedModel] = useState<string | undefined>(
    undefined,
  );
  const [refresh, setRefresh] = useState(0);
  const [isFetchModel, setIsFetchModel] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const abortControllerRef = useRef<AbortController | null>(null);

  const successRateMinValue = (data: any[]) => {
    const minDataValue = data.reduce((min, item) => {
      if (item.value == 0 || item.value == undefined || item.value == null) {
        return min;
      }
      return Math.min(min, item.value);
    }, Infinity);
    const butter = 100 - minDataValue > 0 ? (100 - minDataValue) / 100 / 2 : 0;
    return butter > 0 ? Number((minDataValue * (1 - butter)).toFixed(2)) : 0;
  };

  const rangeToUnix = (range: DateRange | undefined) => {
    return {
      startTime: dayjs(range?.from ?? new Date()).unix(),
      endTime: dayjs(range?.to ?? new Date()).unix(),
    };
  };

  const fetchUsageModels = useCallback(async () => {
    try {
      setIsFetchModel(true);
      // if previous request is not aborted, abort it
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const res = await getLLMMetricsModels({
        ...rangeToUnix(dateRange),
        signal: abortControllerRef.current?.signal,
      });
      if (res.models) {
        setModelList(
          res.models.map((res: any) => ({
            id: res,
            title: res,
          })),
        );
        if (res.models.length > 0) {
          EventEmitter.emit(Metrics_Event.Fetch_With_Abort, {
            model: res.models[0] ?? "",
          });
          setSelectedModel(res.models[0]);
        } else {
          EventEmitter.emit(Metrics_Event.Clear, {});
          setSelectedModel(undefined);
        }
      }
    } catch (error) {
      return null;
    } finally {
      setIsFetchModel(false);
    }
  }, [dateRange]);

  useEffect(() => {
    fetchUsageModels();
  }, [fetchUsageModels]);

  useEffect(() => {
    setDateRange({
      from: dayjs().utc().subtract(1, "day").toDate(),
      to: dayjs().utc().toDate(),
    });
  }, []);

  // handle refresh
  useEffect(() => {
    let timer: any;
    if (refresh > 0) {
      timer = setInterval(() => {
        EventEmitter.emit(Metrics_Event.Fetch_Wait_Previous, {
          model: selectedModel ?? "",
        });
      }, 1000 * refresh);
    }
    return () => {
      clearTimeout(timer);
      EventEmitter.emit(Metrics_Event.Cancel, {});
    };
  }, [refresh, selectedModel]);

  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
      resource={PERMISSION.RESOURCE.llm_metrics}
      action={PERMISSION.ACTION.all}
    >
      <div className={styles.page_wrapper}>
        <div className={styles.operate}>
          <div>
            <Select
              value={selectedModel}
              onValueChange={(value) => {
                analytics.trackClick(
                  CLICK_BTN_IDs.MODELS_CONSOLE.LLM_METRICS_SELECT_MODEL,
                  {
                    model: value,
                  },
                );
                setSelectedModel(value);
                EventEmitter.emit(Metrics_Event.Fetch_With_Abort, {
                  model: value,
                });
              }}
            >
              <SelectTrigger
                className="min-w-[180px] border-common-gray-2"
                disabled={modelList.length === 0}
              >
                {isFetchModel ? (
                  <div className="w-full text-sm text-left">Loading...</div>
                ) : modelList.length > 0 ? (
                  <div className="pr-2">
                    <SelectValue />
                  </div>
                ) : (
                  <div className="w-full text-sm text-left">
                    No LLM api calls
                  </div>
                )}
              </SelectTrigger>
              <SelectContent>
                {modelList.map((model) => (
                  <SelectItem key={model.id} value={model.id}>
                    {model.id}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <DateTimePicker
              range={dateRange}
              onChange={(dateRange) => {
                if (
                  dateRange?.from &&
                  dayjs().diff(dateRange.from, "day") <= 14
                ) {
                  analytics.trackClick(
                    CLICK_BTN_IDs.MODELS_CONSOLE.LLM_METRICS_SELECT_TIME_RANGE,
                    {
                      dateRange: dateRange,
                    },
                  );
                  setDateRange(dateRange);
                }
              }}
            />
          </div>
          <div>
            <RangeButton
              value={refresh}
              onChange={(value) => {
                setRefresh(value);
                analytics.trackClick(
                  CLICK_BTN_IDs.MODELS_CONSOLE.LLM_METRICS_SELECT_REFRESH_RATE,
                  {
                    refresh: value,
                  },
                );
              }}
              range={range}
            />
          </div>
        </div>
        <div className={`${styles.chat_wrapper} scrollBar_container`}>
          <MetricsChartWrapper
            title="Request Per Minute (RPM)"
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return getLLMMetrics({
                metricsType: "RPM",
                ...nowRange,
                model,
                signal,
              }).then((res) => {
                injectEmptyData(res, nowRange);
                return res;
              });
            }}
            refresh={refresh}
          />
          <MetricsChartWrapper
            title={
              <ChartTitle
                title="Request Success Rate"
                help="Percentage of non-5xx status code responses during a specified time period."
              />
            }
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return getLLMMetrics({
                metricsType: "Request_Success_Rate",
                ...nowRange,
                model,
                signal,
              }).then((res) => {
                if (res.metricsType) {
                  res.metricsType = "Success Rate";
                }
                injectEmptyData(res, nowRange);
                return res;
              });
            }}
            color={["lime"]}
            refresh={refresh}
            valueFormatter={(value) => {
              return value + "%";
            }}
            minValue={successRateMinValue}
            maxValue={() => 100}
          />
          <MetricsChartWrapper
            title={
              <ChartTitle
                title="Average Token Count Per Request"
                help="The average number of input or output tokens per request during a specified time period."
              />
            }
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return Promise.all([
                getLLMMetrics({
                  metricsType: "TPM_Input_Tokens",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "TPM_Output_Tokens",
                  ...nowRange,
                  model,
                  signal,
                }),
              ]).then((res) => {
                if (Array.isArray(res) && res.length > 0) {
                  if (res[0]?.metricsType) {
                    res[0].metricsType = "Input Tokens";
                    injectEmptyData(res[0], nowRange);
                  }
                  if (res[1]?.metricsType) {
                    res[1].metricsType = "Output Tokens";
                    injectEmptyData(res[1], nowRange);
                  }
                }
                return res;
              });
            }}
            color={["blue", "sky"]}
            refresh={refresh}
            valueFormatter={(value) => {
              if (String(value ?? "").includes(".")) {
                return value.toFixed(2);
              }
              return String(value);
            }}
          />
          <MetricsChartWrapper
            title={
              <ChartTitle
                title="End-to-end (E2E) Latency"
                help="The overall time it takes for the model to generate the full response for an LLM request."
              />
            }
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return Promise.all([
                getLLMMetrics({
                  metricsType: "95th_E2E_Latency",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "99th_E2E_Latency",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "Average_E2E_Latency",
                  ...nowRange,
                  model,
                  signal,
                }),
              ]).then((res) => {
                if (res[0]?.metricsType) {
                  res[0].metricsType = "95th";
                  injectEmptyData(res[0], nowRange);
                }
                if (res[1]?.metricsType) {
                  res[1].metricsType = "99th";
                  injectEmptyData(res[1], nowRange);
                }
                if (res[2]?.metricsType) {
                  res[2].metricsType = "Average";
                  injectEmptyData(res[2], nowRange);
                }
                return res;
              });
            }}
            refresh={refresh}
            valueFormatter={msFormatter}
          />
          <MetricsChartWrapper
            title={
              <ChartTitle
                title="Time to First Token (TTFT)"
                help={
                  <span>
                    The time required to process the prompt and generate the
                    first output token, tracked only when the request parameter{" "}
                    <Badge variant="outline">stream=true</Badge> is set.
                  </span>
                }
              />
            }
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return Promise.all([
                getLLMMetrics({
                  metricsType: "95th_TTFT",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "99th_TTFT",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "Average_TTFT",
                  ...nowRange,
                  model,
                  signal,
                }),
              ]).then((res) => {
                if (res[0]?.metricsType) {
                  res[0].metricsType = "95th";
                  injectEmptyData(res[0], nowRange);
                }
                if (res[1]?.metricsType) {
                  res[1].metricsType = "99th";
                  injectEmptyData(res[1], nowRange);
                }
                if (res[2]?.metricsType) {
                  res[2].metricsType = "Average";
                  injectEmptyData(res[2], nowRange);
                }
                return res;
              });
            }}
            refresh={refresh}
            valueFormatter={msFormatter}
          />
          <MetricsChartWrapper
            title={
              <ChartTitle
                title="Time Per Output Token (TPOT)"
                help={
                  <span>
                    The average time taken to generate an output token, tracked
                    only when the request parameter{" "}
                    <Badge variant="outline">stream=true</Badge> is set.
                  </span>
                }
              />
            }
            range={dateRange}
            fetchMetrics={({ signal, model }) => {
              const nowRange = rangeToUnix(dateRange);
              return Promise.all([
                getLLMMetrics({
                  metricsType: "95th_TPOT",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "99th_TPOT",
                  ...nowRange,
                  model,
                  signal,
                }),
                getLLMMetrics({
                  metricsType: "Average_TPOT",
                  ...nowRange,
                  model,
                  signal,
                }),
              ]).then((res) => {
                if (res[0]?.metricsType) {
                  res[0].metricsType = "95th";
                  injectEmptyData(res[0], nowRange);
                }
                if (res[1]?.metricsType) {
                  res[1].metricsType = "99th";
                  injectEmptyData(res[1], nowRange);
                }
                if (res[2]?.metricsType) {
                  res[2].metricsType = "Average";
                  injectEmptyData(res[2], nowRange);
                }
                return res;
              });
            }}
            refresh={refresh}
            valueFormatter={msFormatter}
          />
        </div>
      </div>
    </PermissionWrapper>
  );
}

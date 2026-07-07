"use client";
import { RefObject, useEffect, useState, useCallback, useRef } from "react";
import * as eCharts from "echarts";
import { balanceFormat } from "@/lib/utils/money";
import { queryUserQueryConsumeMonthly } from "@/api/user";
import ConsumeMonthlyChartSkeleton from "./ConsumeMonthlyChartSkeleton";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import { mockConsumeMonthlyData } from "./mockConsumeMonthlyData";

const COLORS = {
  GPU_INSTANCE: "#A78BFA",
  MODEL_API: "#18BFFF",
  SERVERLESS: "#F56060",
  STORAGE: "#FBBF24",
  AGENT_SANDBOX: "#1A8245",
  LLM_DEDICATED_ENDPOINT: "#57DE8F",
};

const LABELS = {
  GPU_INSTANCE: "GPU Instance",
  MODEL_API: "Model API",
  SERVERLESS: "Serverless",
  STORAGE: "Storage",
  AGENT_SANDBOX: "Agent Sandbox",
  LLM_DEDICATED_ENDPOINT: "LLM Dedicated Endpoint",
};

const BAR_WIDTH = 60;

export default function ConsumeMonthlyChart() {
  const echartRef: RefObject<any> = useRef();
  const [chart, setChart] = useState<eCharts.ECharts | null>(null);
  const [data, setData] = useState<consumeMonthlySchema>();
  const [loading, setLoading] = useState(true);
  const [legendSelected, setLegendSelected] = useState<Record<
    string,
    boolean
  > | null>(null);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const isBasicRole = currentTeam?.role === TeamRole.basic;

  const initData = useCallback(async () => {
    setLoading(true);
    try {
      if (isBasicRole) {
        // Basic role use fake data
        setData(mockConsumeMonthlyData);
      } else {
        const res = await queryUserQueryConsumeMonthly();
        const data = res.consume_list;
        if (Array.isArray(data)) {
          setData(data);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [isBasicRole]);

  useEffect(() => {
    initData();
  }, [initData]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (chart) {
        chart.resize();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [chart]);

  useEffect(() => {
    if (loading || !data) return;

    let chart = eCharts.getInstanceByDom(echartRef.current);

    if (!chart) {
      chart = eCharts.init(echartRef.current, "dark");
      chart.on("legendselectchanged", (params: any) => {
        setLegendSelected(params.selected);
      });
    }

    setChart(chart);

    const option = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
        formatter: function (params: any) {
          let result =
            "<div style='margin-bottom: 5px'>" + params[0].name + "</div>";
          params.forEach(function (item: any) {
            result +=
              item.marker +
              item.seriesName +
              " : " +
              `&nbsp&nbsp$${item.value}<br/>`;
          });
          return result;
        },
        textStyle: {
          fontSize: 12,
          fontFamily: "var(--font-miletus)",
        },
      },
      legend: {
        left: "left",
        itemGap: 20,
        textStyle: {
          fontFamily: "var(--font-miletus)",
          color: "#9E9C98",
        },
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
      },
      grid: {
        left: "1%",
        right: "1%",
        bottom: "1%",
        top: "20%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: data?.map((one) => one.month),
        axisLabel: {
          fontFamily: "var(--font-miletus)",
          color: "#9E9C98",
        },
      },
      yAxis: {
        type: "value",
        axisLabel: {
          formatter: "$" + "{value}",
          fontFamily: "var(--font-miletus)",
          color: "#9E9C98",
        },
        splitLine: {
          lineStyle: {
            color: "#f5f5f5",
          },
        },
      },
      series: [
        {
          name: LABELS.GPU_INSTANCE,
          data: data?.map((one) => balanceFormat(one.gpu_instance)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.GPU_INSTANCE,
          },
          barMaxWidth: BAR_WIDTH,
        },
        {
          name: LABELS.MODEL_API,
          data: data?.map((one) => balanceFormat(one.model_api)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.MODEL_API,
          },
          barMaxWidth: BAR_WIDTH,
        },
        {
          name: LABELS.SERVERLESS,
          data: data?.map((one) => balanceFormat(one.serverless)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.SERVERLESS,
          },
          barMaxWidth: BAR_WIDTH,
        },
        {
          name: LABELS.STORAGE,
          data: data?.map((one) => balanceFormat(one.storage)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.STORAGE,
          },
          barMaxWidth: BAR_WIDTH,
        },
        {
          name: LABELS.AGENT_SANDBOX,
          data: data?.map((one) => balanceFormat(one.cloud_sandbox)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.AGENT_SANDBOX,
          },
          barMaxWidth: BAR_WIDTH,
        },
        {
          name: LABELS.LLM_DEDICATED_ENDPOINT,
          data: data?.map((one) => balanceFormat(one.llm_dedicated_endpoint)),
          type: "bar",
          stack: "consume",
          itemStyle: {
            color: COLORS.LLM_DEDICATED_ENDPOINT,
          },
          barMaxWidth: BAR_WIDTH,
        },
      ],
      backgroundColor: "transparent",
    };
    chart.setOption(option);
  }, [echartRef, data, legendSelected, loading]);

  if (loading) {
    return <ConsumeMonthlyChartSkeleton />;
  }

  return (
    <div
      ref={echartRef}
      style={{
        width: "100%",
        height: 200,
      }}
    ></div>
  );
}

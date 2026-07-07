"use client";
import { useCallback, useEffect, useState } from "react";
import ApiCreditUsageChart, { getWeekDate } from "./apiCreditUsage";
import APIUsageChart from "./apiUsage";
import APIUsagePieChart from "./apiUsagePie";
import styles from "./style.module.css";
import { queryApiUsageByTime } from "@/api/user";
import dayjs from "dayjs";
import { PERMISSION } from "@/constants/constants";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
const dates = getWeekDate();
export default function Wrapper({ copy = {} }: { copy?: any }) {
  const [data, setData] = useState([] as any[]);
  const [data2, setData2] = useState([] as any[]);
  const fetchData = useCallback(() => {
    queryApiUsageByTime({
      start: dayjs(dates[dates.length - 1]).format("YYYY-MM-DD 00:00:00"),
      end: dayjs(dates[0]).format("YYYY-MM-DD 23:59:59"),
    }).then((res) => {
      if (Array.isArray(res.data)) {
        setData(res.data);
      } else {
        setData([]);
      }
      if (Array.isArray(res.taskData)) {
        setData2(res.taskData);
      } else {
        setData2([]);
      }
    });
  }, []);
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  return (
    <div className={styles.wrapper}>
      <PermissionWrapper
        resourceGroup={PERMISSION.RESOURCE_GROUP.model_api}
        resource={PERMISSION.RESOURCE.usage}
        action={PERMISSION.ACTION.all}
      >
        <div className={styles.left_wrap}>
          <APIUsageChart copy={copy} data={data2} />
          <ApiCreditUsageChart copy={copy} data={data} />
        </div>
        <div className={styles.right_wrap}>
          <APIUsagePieChart copy={copy} data={data2} />
        </div>
      </PermissionWrapper>
    </div>
  );
}

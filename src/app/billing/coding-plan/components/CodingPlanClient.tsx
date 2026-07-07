"use client";

import { useState, useEffect, useCallback } from "react";
import CycleUsageCard from "./CycleUsageCard";
import TodayUsageCard from "./TodayUsageCard";
import DailyUsageSection from "./DailyUsageSection";
import ModelUsageRanking from "./ModelUsageRanking";
import UsageDetailsTable from "./UsageDetailsTable";
import {
  getDailyUsage,
  getTopModels,
  getDeductionDetail,
  cancelSubscription,
  resubscribe,
  divideBy10000,
  calculateDayOfCycle,
  calculateTotalDays,
  calculateChangePercent,
  fillDailyUsageForCycle,
  getEmptyDailyUsageForCurrentMonth,
  type DailyUsageResponse,
  type TopModelsResponse,
  type DeductionDetailResponse,
} from "@/api/coding-plan";
import {
  CycleUsage,
  TodayUsage,
  DailyUsage,
  ModelRanking,
  UsageDetail,
} from "../types";
import PlanList from "@/app/coding-plan/components/planList";
import { NOVITA_URL } from "@/constants/urls";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface PaginationState {
  lastId?: string;
  lastStartTime?: string;
}

export default function CodingPlanClient() {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailsLoading, setIsDetailsLoading] = useState(false);

  // Data states
  const [cycleUsage, setCycleUsage] = useState<CycleUsage | null>(null);
  const [todayUsage, setTodayUsage] = useState<TodayUsage | null>(null);
  const [dailyUsageData, setDailyUsageData] = useState<DailyUsage[]>(() =>
    getEmptyDailyUsageForCurrentMonth(),
  );
  const [modelRanking, setModelRanking] = useState<ModelRanking[]>([]);
  const [usageDetails, setUsageDetails] = useState<UsageDetail[]>([]);

  // Pagination states for cursor-based pagination
  const [hasNextPage, setHasNextPage] = useState(false);
  const [paginationHistory, setPaginationHistory] = useState<PaginationState[]>(
    [{}],
  );
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  const pageSize = 10;

  // Transform API response to UI data
  const transformDailyUsageResponse = useCallback(
    (response: DailyUsageResponse) => {
      const { packSummary, dailyUsageList } = response;

      if (!packSummary) {
        setCycleUsage(null);
        setTodayUsage(null);
        setDailyUsageData(getEmptyDailyUsageForCurrentMonth());
        setModelRanking([]);
        setUsageDetails([]);
        return;
      }

      // Transform cycle usage (using natural month rules)
      const cycleData: CycleUsage = {
        used: Math.round(divideBy10000(packSummary.usedQuota)),
        total: Math.round(divideBy10000(packSummary.quota)),
        dayOfCycle: calculateDayOfCycle(packSummary.effectiveTime),
        totalDays: calculateTotalDays(packSummary.effectiveTime),
        packageName: `${packSummary.pkgName} - ${packSummary.tier}`,
        instanceId: packSummary.instanceId,
        isCanceled: packSummary.isCancel === true,
        expiryTime: packSummary.expiryTime,
      };
      setCycleUsage(cycleData);

      // Transform today's usage (last item in daily list, calculate change from yesterday)
      if (dailyUsageList.length > 0) {
        const sortedList = [...dailyUsageList].sort(
          (a, b) => Number(b.timestamp) - Number(a.timestamp),
        );
        const todayData: TodayUsage = {
          tokens: Math.round(divideBy10000(sortedList[0].deductAmount)),
          changePercent: calculateChangePercent(dailyUsageList),
        };
        setTodayUsage(todayData);
      } else {
        setTodayUsage({
          tokens: 0,
          changePercent: 0,
        });
      }

      // Transform daily usage for chart - fill missing days with 0
      const dailyData = fillDailyUsageForCycle(
        dailyUsageList,
        packSummary.effectiveTime,
      );
      setDailyUsageData(dailyData);
    },
    [],
  );

  const transformTopModelsResponse = useCallback(
    (response: TopModelsResponse) => {
      const modelData: ModelRanking[] = response.modelUsageList.map((item) => ({
        rank: item.rank,
        modelId: item.modelName,
        tokens: Number(item.tokens),
      }));
      setModelRanking(modelData);
    },
    [],
  );

  const transformDeductionDetailResponse = useCallback(
    (response: DeductionDetailResponse) => {
      const details: UsageDetail[] = response.detaillist.map((item) => ({
        id: item.id || `${item.reductStartTime}-${item.productName}`,
        startTime: item.reductStartTime,
        endTime: item.reductEndTime,
        modelId: item.productName,
        deductAmount: Math.round(divideBy10000(item.deductAmount)),
        rawUsage: {
          inputTokens: Number(item.inputTokens),
          outputTokens: Number(item.outputTokens),
          cacheReadTokens: Number(item.cacheReadTokens),
          cacheWriteTokens: Number(item.cacheWriteTokens),
          cacheWrite1hourTokens: Number(item.cacheWrite1hourTokens),
        },
        billingMultiplier: {
          input: divideBy10000(item.inputTokensCoefficient),
          output: divideBy10000(item.outputTokensCoefficient),
          cacheRead: divideBy10000(item.cacheReadTokensCoefficient),
          cacheWrite: divideBy10000(item.cacheWriteTokensCoefficient),
          cacheWrite1hour: divideBy10000(item.cacheWrite1hourTokensCoefficient),
        },
      }));
      setUsageDetails(details);
      setHasNextPage(response.hasNext);

      return {
        lastId: String(response.lastId),
        lastStartTime: String(response.lastStartTime),
      };
    },
    [],
  );

  // Core data fetching logic
  const doFetchData = useCallback(async () => {
    const [dailyUsageRes, topModelsRes, detailRes] = await Promise.all([
      getDailyUsage(),
      getTopModels(),
      getDeductionDetail({ page: 1, size: pageSize }),
    ]);

    transformDailyUsageResponse(dailyUsageRes);
    transformTopModelsResponse(topModelsRes);
    const cursor = transformDeductionDetailResponse(detailRes);

    setPaginationHistory([{}, cursor]);
    setCurrentPageIndex(0);
  }, [
    transformDailyUsageResponse,
    transformTopModelsResponse,
    transformDeductionDetailResponse,
  ]);

  // Initial fetch - shows skeleton
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      await doFetchData();
    } catch (error) {
      console.error("Failed to fetch coding plan data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [doFetchData]);

  // Fetch usage details for a specific page
  const fetchUsageDetails = useCallback(
    async (cursor: PaginationState) => {
      setIsDetailsLoading(true);
      try {
        const params: {
          page: number;
          size: number;
          lastId?: string;
          lastStartTime?: string;
        } = {
          page: 1,
          size: pageSize,
        };
        if (cursor.lastId) {
          params.lastId = cursor.lastId;
          params.lastStartTime = cursor.lastStartTime;
        }
        const response = await getDeductionDetail(params);
        const newCursor = transformDeductionDetailResponse(response);
        return newCursor;
      } catch (error) {
        console.error("Failed to fetch usage details:", error);
        return null;
      } finally {
        setIsDetailsLoading(false);
      }
    },
    [transformDeductionDetailResponse],
  );

  // Refresh handler - only triggers button animation, not skeleton
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await doFetchData();
    } catch (error) {
      console.error("Failed to refresh coding plan data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Cancel subscription handler
  const handleCancelSubscription = async (instanceId: string) => {
    await cancelSubscription(instanceId);
    await handleRefresh();
  };

  // Resubscribe handler
  const handleResubscribe = async (instanceId: string) => {
    await resubscribe(instanceId);
    await handleRefresh();
  };

  // Pagination handlers
  const handleNextPage = async () => {
    const nextIndex = currentPageIndex + 1;
    const cursor = paginationHistory[nextIndex];

    if (cursor) {
      const newCursor = await fetchUsageDetails(cursor);
      if (newCursor) {
        setCurrentPageIndex(nextIndex);
        // Add the new cursor for the next page
        if (hasNextPage) {
          setPaginationHistory((prev) => {
            const updated = [...prev];
            updated[nextIndex + 1] = newCursor;
            return updated;
          });
        }
      }
    }
  };

  const handlePrevPage = async () => {
    if (currentPageIndex > 0) {
      const prevIndex = currentPageIndex - 1;
      const cursor = paginationHistory[prevIndex];
      await fetchUsageDetails(cursor);
      setCurrentPageIndex(prevIndex);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (cycleUsage === null && !isLoading) {
    const redirectUrl =
      process.env.NEXT_PUBLIC_ENV === "dev"
        ? `http://localhost:3000${NOVITA_URL.BILLING_CODING_PLAN}`
        : `${process.env.NEXT_PUBLIC_SITE_URL}${NOVITA_URL.BILLING_CODING_PLAN}`;
    return (
      <div className="flex flex-col gap-6 pt-5 justify-center items-center min-h-full">
        <h4 className="font-h4-large">Choose your plan</h4>
        <PlanList showTitle={false} targetUrl={redirectUrl} />
        <Button
          variant="outline"
          size="lg"
          className="font-p-button"
          style={{ fontFamily: "var(--font-tt-mono)" }}
          asChild
        >
          <Link href={NOVITA_URL.CODING_PLAN} target="_blank">
            View all details
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center max-md:flex-col max-md:items-start max-md:gap-3">
        <h1 className="font-h6">Usage Dashboard</h1>
      </div>

      {/* Top Section: Cycle Usage + Today Usage */}
      <div className="flex flex-col lg:flex-row gap-4 items-stretch">
        <CycleUsageCard
          className="flex-1"
          data={cycleUsage}
          isRefreshing={isRefreshing}
          isLoading={isLoading}
          handleRefresh={handleRefresh}
          onCancelSubscription={handleCancelSubscription}
          onResubscribe={handleResubscribe}
        />
        <TodayUsageCard
          className="grow-0 shrink-0 basis-[174px] lg:basis-[342px]"
          data={todayUsage}
          isLoading={isLoading}
        />
      </div>

      {/* Middle Section: Daily Usage + Model Ranking */}
      <div className="flex flex-col lg:flex-row gap-4 lg:h-[244px] items-stretch">
        <DailyUsageSection
          className="flex-1"
          data={dailyUsageData}
          isLoading={isLoading}
        />
        <ModelUsageRanking
          className="grow-0 shrink-0 basis-[174px] lg:basis-[342px]"
          data={modelRanking}
          isLoading={isLoading}
        />
      </div>

      {/* Bottom Section: Usage Details Table */}
      <div className="flex flex-col gap-3">
        <h2 className="font-h6 text-[var(--dark-1)]">Details</h2>
        <UsageDetailsTable
          data={usageDetails}
          hasNext={hasNextPage}
          hasPrev={currentPageIndex > 0}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
          isLoading={isLoading || isDetailsLoading}
        />
      </div>
    </div>
  );
}

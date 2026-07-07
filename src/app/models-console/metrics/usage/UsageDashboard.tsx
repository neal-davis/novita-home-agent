"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  Circle,
  Infinity as InfinityIcon,
  Info,
  KeyRound,
  Search,
  Users,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import DateRangePicker from "@/components/ui/standard/date-range-picker-utc";
import { cn } from "@/lib/utils";
import {
  UsageBudget,
  UsageScopeOption,
  UsageScopeState,
  UsageSortState,
  UsageTimeRange,
  UsageTooltip,
} from "./types";
import {
  KeySortColumn,
  ModelSortColumn,
  TEAM_SCOPE,
  TIME_RANGE_OPTIONS,
  formatCurrency,
  formatUsageNumber,
} from "./usageData";
import { StackedCostChart, UsageTooltipLayer } from "./UsageCharts";
import {
  useModelAPIUsage,
  useModelAPIUsageScopes,
  useUsageQuota,
} from "./useModelAPIUsage";
import styles from "./page.module.scss";

const USAGE_LOG_MIN_QUERY_DATE = "2026-04-01";
const USAGE_LOG_MIN_CALENDAR_DATE = new Date(2026, 3, 1);

function SortLabel({
  active,
  direction,
  children,
}: {
  active: boolean;
  direction: "asc" | "desc" | null;
  children: React.ReactNode;
}) {
  return (
    <>
      {children}
      {active && direction && (
        <span className="ml-1 inline-flex items-center text-[var(--usage-brand-hover)]">
          {direction === "desc" ? (
            <ArrowDown className="h-3 w-3" />
          ) : (
            <ArrowUp className="h-3 w-3" />
          )}
        </span>
      )}
    </>
  );
}

function LiveTag({ children = "Live" }: { children?: React.ReactNode }) {
  return (
    <span className={styles.liveTag}>
      <span className={styles.liveDot} />
      {children}
    </span>
  );
}

function ScopeDropdown({
  scope,
  scopeOptions,
  loading,
  onChange,
}: {
  scope: UsageScopeState;
  scopeOptions: UsageScopeOption;
  loading: boolean;
  onChange: (scope: UsageScopeState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectScope = (nextScope: UsageScopeState) => {
    onChange(nextScope);
    setOpen(false);
  };

  const totalScopeItems = useMemo(
    () =>
      scopeOptions.members.reduce(
        (sum, member) => sum + 1 + member.keys.length,
        0,
      ),
    [scopeOptions.members],
  );
  const showSearch = totalScopeItems > 3;

  const filteredMembers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return scopeOptions.members;

    return scopeOptions.members.flatMap((member) => {
      const memberMatches = member.label.toLowerCase().includes(query);
      if (memberMatches) return [member];

      const matchingKeys = member.keys.filter((key) =>
        key.label.toLowerCase().includes(query),
      );
      if (matchingKeys.length === 0) return [];

      return [{ ...member, keys: matchingKeys }];
    });
  }, [scopeOptions.members, searchQuery]);

  useEffect(() => {
    if (!open) setSearchQuery("");
  }, [open]);

  return (
    <div
      ref={wrapRef}
      className={styles.scopeWrap}
      onBlur={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={styles.scopeButton}
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        disabled={loading}
      >
        <span>{loading ? "Loading scopes" : scope.label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className={styles.scopeMenu}>
          <div className={styles.scopeMenuHeader}>
            <button
              type="button"
              className={cn(
                styles.scopeTeamItem,
                scope.type === "team" && styles.selected,
              )}
              onClick={() => selectScope(scopeOptions.team)}
            >
              <Users size={13} />
              <span
                className={styles.scopeItemLabel}
                title={scopeOptions.team.label}
              >
                {scopeOptions.team.label}
              </span>
              <span className={styles.scopeMeta}>All members</span>
            </button>
            {showSearch && (
              <div className={styles.scopeSearch}>
                <Search size={13} className={styles.scopeSearchIcon} />
                <input
                  type="text"
                  className={styles.scopeSearchInput}
                  placeholder="Search member or key"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            )}
            <div className={styles.scopeDivider} />
            <div className={styles.scopeGroupLabel}>Members</div>
          </div>
          <div className={styles.scopeMenuBody}>
            {scopeOptions.members.length === 0 ? (
              <div className={styles.scopeEmpty}>No members</div>
            ) : filteredMembers.length === 0 ? (
              <div className={styles.scopeEmpty}>No matches</div>
            ) : (
              filteredMembers.map((member) => (
                <div key={member.memberId || member.label}>
                  <button
                    type="button"
                    className={cn(
                      styles.scopeMemberItem,
                      scope.type === "member" &&
                        scope.memberId === member.memberId &&
                        styles.selected,
                    )}
                    onClick={() => selectScope(member)}
                  >
                    <span
                      className={cn(styles.scopeAvatar, styles.avatarGreen)}
                    >
                      {(member.memberName || member.label)
                        .slice(0, 1)
                        .toUpperCase()}
                    </span>
                    <span
                      className={styles.scopeItemLabel}
                      title={member.label}
                    >
                      {member.label}
                    </span>
                    <span className={styles.scopeMeta}>
                      {member.keyCount ?? member.keys.length}
                      <span className="ml-[4px]">keys</span>
                    </span>
                  </button>
                  {member.keys.map((key) => (
                    <button
                      key={key.keyId || key.label}
                      type="button"
                      className={cn(
                        styles.scopeKeyItem,
                        scope.type === "key" &&
                          scope.keyId === key.keyId &&
                          styles.selected,
                      )}
                      onClick={() => selectScope(key)}
                    >
                      <KeyRound size={11} />
                      <span className={styles.scopeItemLabel} title={key.label}>
                        {key.label}
                      </span>
                      <span className={styles.keyBadge}>key</span>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState({ children }: { children: React.ReactNode }) {
  return <div className={styles.emptyState}>{children}</div>;
}

function formatDateForQuery(date: Date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function dateFromQuery(value: string) {
  if (!value) return undefined;

  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return undefined;

  return new Date(Date.UTC(year, month - 1, day));
}

function clampUsageLogQueryDate(value: string) {
  if (!value) return "";
  return value < USAGE_LOG_MIN_QUERY_DATE ? USAGE_LOG_MIN_QUERY_DATE : value;
}

function TimeFilter({
  timeRange,
  customStart,
  customEnd,
  onTimeRangeChange,
  onCustomRangeChange,
  className,
}: {
  timeRange: UsageTimeRange;
  customStart: string;
  customEnd: string;
  onTimeRangeChange: (timeRange: UsageTimeRange) => void;
  onCustomRangeChange: (date?: { from?: Date; to?: Date }) => void;
  className?: string;
}) {
  return (
    <div className={cn(styles.timeFilterBar, className)}>
      <span className={styles.controlLabel}>Time</span>
      <div className={styles.timeControl}>
        <div className={styles.pills}>
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                styles.pill,
                timeRange === option.value && styles.pillActive,
              )}
              onClick={() => onTimeRangeChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
        <DateRangePicker
          className={styles.datePicker}
          style={{ maxWidth: 277 }}
          startTime={dateFromQuery(customStart)}
          endTime={dateFromQuery(customEnd)}
          disabled={{ before: USAGE_LOG_MIN_CALENDAR_DATE }}
          onChange={onCustomRangeChange}
        />
      </div>
    </div>
  );
}

function getPresetDateRange(timeRange: Exclude<UsageTimeRange, "custom">) {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);

  if (timeRange === "7d") {
    start.setUTCDate(end.getUTCDate() - 6);
  } else if (timeRange === "30d") {
    start.setUTCDate(end.getUTCDate() - 29);
  }

  return {
    start: formatDateForQuery(start),
    end: formatDateForQuery(end),
  };
}

function QuotaCard({
  quota,
  loading,
  currency,
}: {
  quota: UsageBudget | null;
  loading: boolean;
  currency: string;
}) {
  const percent =
    quota?.limit && quota.limit > 0
      ? Math.min((quota.used / quota.limit) * 100, 100)
      : 0;
  const percentLabel = `${percent.toFixed(1)}%`;

  return (
    <section className={cn(styles.budgetCard, loading && styles.loadingArea)}>
      <div className={styles.budgetTitle}>
        <div>
          <div>Current Period Quota</div>
          <div className="text-xs font-normal text-[var(--usage-gray-1)]">
            Across all Novita products
          </div>
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={200}>
            <TooltipTrigger asChild>
              <span className="cursor-default">
                <Info size={15} />
              </span>
            </TooltipTrigger>
            <TooltipContent>
              <p>Real-time status, not affected by time filter</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!quota ? (
        <div className={styles.quotaEmpty}>No quota configured</div>
      ) : quota.type === "Unlimited" ? (
        <div className={styles.budgetUnlimited}>
          <div className={styles.unlimitedCost}>
            <div className={styles.unlimitedLabel}>Cost this period</div>
            <div className={styles.unlimitedValue}>
              {formatCurrency(quota.used, currency)}
            </div>
          </div>
          <div className={styles.unlimitedDivider} />
          <div className={styles.unlimitedIcon}>
            <InfinityIcon size={14} />
          </div>
          <div className={styles.unlimitedNote}>
            No spending limit set.
            <br />
            Usage is tracked for visibility only.
          </div>
        </div>
      ) : (
        <div className={styles.budgetBarRow}>
          <div className={styles.budgetAmounts}>
            <span className={styles.budgetUsed}>
              {formatCurrency(quota.used, currency)}
            </span>
            <span className={styles.budgetSep}>/</span>
            <span className={styles.budgetTotal}>
              {formatCurrency(quota.limit ?? 0, currency)}
            </span>
          </div>
          <div className={styles.budgetBarWrap}>
            <div
              className={cn(
                styles.budgetBar,
                percent >= 90 && styles.budgetDanger,
                percent >= 70 && percent < 90 && styles.budgetWarn,
              )}
              style={{ width: percentLabel }}
            />
          </div>
          <span className={styles.budgetPercent}>{percentLabel}</span>
        </div>
      )}

      {quota && (
        <div className={styles.budgetTags}>
          <span
            className={cn(
              styles.budgetTag,
              quota.type === "Recurring" && styles.recurringTag,
              quota.type === "One Time" && styles.oneTimeTag,
              quota.type === "Unlimited" && styles.unlimitedTag,
            )}
          >
            {quota.type}
          </span>
          {quota.period && (
            <span className={cn(styles.budgetTag, styles.periodTag)}>
              {quota.period}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default function UsageDashboard() {
  const initialRange = getPresetDateRange("7d");
  const [scope, setScope] = useState<UsageScopeState>(TEAM_SCOPE);
  const [timeRange, setTimeRange] = useState<UsageTimeRange>("7d");
  const [customStart, setCustomStart] = useState(initialRange.start);
  const [customEnd, setCustomEnd] = useState(initialRange.end);
  const [tooltip, setTooltip] = useState<UsageTooltip>(null);
  const [modelSort, setModelSort] =
    useState<UsageSortState<ModelSortColumn> | null>(null);
  const [keySort, setKeySort] = useState<UsageSortState<KeySortColumn> | null>(
    null,
  );

  const {
    scopeOptions,
    loading: scopesLoading,
    error: scopesError,
  } = useModelAPIUsageScopes();
  const showTopKeys = scope.type !== "key";
  const showQuota = scope.type !== "team";
  const {
    metrics,
    costLabels,
    costDatasets,
    modelRows,
    keyRows,
    meta,
    loading,
    error,
  } = useModelAPIUsage({
    scope,
    timeRange,
    customStart,
    customEnd,
    modelSort,
    keySort,
    includeKeyRanks: showTopKeys,
  });
  const {
    quota,
    loading: quotaLoading,
    error: quotaError,
  } = useUsageQuota(scope);

  useEffect(() => {
    setScope((current) => {
      if (current.type !== "team") return current;
      return scopeOptions.team;
    });
  }, [scopeOptions.team]);

  const currency = meta?.currency || "USD";
  const live = Boolean(meta?.isLive);
  const granularity =
    meta?.granularity || (timeRange === "today" ? "Hourly" : "Daily");
  const delayMinutes = meta?.delayMinutes ?? 5;

  const updateTimeRange = (nextRange: UsageTimeRange) => {
    if (nextRange !== "custom") {
      const nextDateRange = getPresetDateRange(nextRange);
      setCustomStart(nextDateRange.start);
      setCustomEnd(nextDateRange.end);
    }

    setTimeRange(nextRange);
  };

  const updateCustomRange = (date?: { from?: Date; to?: Date }) => {
    const nextStart = clampUsageLogQueryDate(
      date?.from ? formatDateForQuery(date.from) : "",
    );
    const nextEnd = clampUsageLogQueryDate(
      date?.to ? formatDateForQuery(date.to) : "",
    );

    setCustomStart(nextStart);
    setCustomEnd(nextEnd);
    setTimeRange("custom");
  };

  const toggleModelSort = (column: ModelSortColumn) => {
    setModelSort((current) => {
      if (current?.column !== column) return { column, direction: "desc" };
      if (current.direction === "desc") return { column, direction: "asc" };
      return null;
    });
  };

  const toggleKeySort = (column: KeySortColumn) => {
    setKeySort((current) => {
      if (current?.column !== column) return { column, direction: "desc" };
      if (current.direction === "desc") return { column, direction: "asc" };
      return null;
    });
  };

  return (
    <main className={styles.usagePage}>
      <UsageTooltipLayer tooltip={tooltip} />
      <div className={styles.controlBar}>
        <span className={styles.controlLabel}>Scope</span>
        <ScopeDropdown
          scope={scope}
          scopeOptions={scopeOptions}
          loading={scopesLoading}
          onChange={setScope}
        />
        {!showQuota && (
          <TimeFilter
            className={styles.timeFilterInline}
            timeRange={timeRange}
            customStart={customStart}
            customEnd={customEnd}
            onTimeRangeChange={updateTimeRange}
            onCustomRangeChange={updateCustomRange}
          />
        )}
      </div>

      {(error || scopesError || (showQuota ? quotaError : null)) && (
        <div className={styles.errorBanner}>
          {error || scopesError || (showQuota ? quotaError : null)}
        </div>
      )}

      {showQuota && (
        <>
          <QuotaCard quota={quota} loading={quotaLoading} currency={currency} />
          <TimeFilter
            timeRange={timeRange}
            customStart={customStart}
            customEnd={customEnd}
            onTimeRangeChange={updateTimeRange}
            onCustomRangeChange={updateCustomRange}
          />
        </>
      )}

      <section
        className={cn(styles.metricsGrid, loading && styles.loadingArea)}
      >
        {(
          [
            {
              label: "Total Requests",
              value: formatUsageNumber(metrics.requests),
            },
            {
              label: "Input Tokens",
              value: formatUsageNumber(
                metrics.inputTokens + metrics.cacheTokens,
              ),
              sub: "incl. cache",
            },
            {
              label: "Cache Tokens",
              value: formatUsageNumber(metrics.cacheTokens),
            },
            {
              label: "Output Tokens",
              value: formatUsageNumber(metrics.outputTokens),
            },
          ] as Array<{ label: string; value: string; sub?: string }>
        ).map(({ label, value, sub }) => (
          <div key={label} className={styles.metricCard}>
            <div className={styles.metricLabel}>
              {label}
              {sub && (
                <span className="ml-1 text-xs font-normal text-[var(--usage-gray-1)]">
                  ({sub})
                </span>
              )}
              {live && <LiveTag />}
            </div>
            <div className={styles.metricValue}>{value}</div>
          </div>
        ))}
      </section>

      <section className={styles.trendRow}>
        <article className={cn(styles.card, loading && styles.loadingArea)}>
          <div className={styles.cardHeader}>
            <span>Cost Trend</span>
            <span className={styles.cardHint}>
              {live ? (
                <LiveTag>
                  {granularity} · ~{delayMinutes} min delay
                </LiveTag>
              ) : (
                `${granularity} by model (${currency})`
              )}
            </span>
          </div>
          <div className={styles.chartArea}>
            {costLabels.length > 0 && costDatasets.length > 0 ? (
              <StackedCostChart
                datasets={costDatasets}
                labels={costLabels}
                tooltip={tooltip}
                currency={currency}
                onTooltipChange={setTooltip}
              />
            ) : (
              <EmptyState>No cost data in this period</EmptyState>
            )}
          </div>
          <div className={styles.legend}>
            {costDatasets.map((dataset) => (
              <span key={dataset.id} className={styles.legendItem}>
                <Circle
                  size={8}
                  strokeWidth={0}
                  fill={dataset.color}
                  className={styles.legendIcon}
                  aria-hidden="true"
                />
                {dataset.name}
              </span>
            ))}
          </div>
        </article>
      </section>

      <section
        className={cn(styles.rankGrid, !showTopKeys && styles.rankGridSingle)}
      >
        <article className={cn(styles.card, loading && styles.loadingArea)}>
          <div className={styles.cardHeader}>
            <span>Top Models by Cost</span>
            <span className={styles.cardHint}>
              {modelRows.length}
              <span className="ml-[4px]">models</span>
            </span>
          </div>
          <div className={styles.tableScroll}>
            <table className={styles.table}>
              <colgroup>
                <col className={styles.modelNameCol} />
                <col className={styles.numberCol} />
                <col className={styles.numberCol} />
                <col className={styles.numberCol} />
                <col className={styles.numberCol} />
                <col className={styles.numberCol} />
              </colgroup>
              <thead>
                <tr>
                  <th>Model</th>
                  {[
                    ["requests", "Requests"],
                    ["inputTokens", "Input Tokens"],
                    ["cacheTokens", "Cache Tokens"],
                    ["outputTokens", "Output Tokens"],
                    ["cost", `Cost (${currency})`],
                  ].map(([column, label]) => (
                    <th key={column} className={styles.alignRight}>
                      <button
                        type="button"
                        className={styles.sortButton}
                        onClick={() =>
                          toggleModelSort(column as ModelSortColumn)
                        }
                      >
                        <SortLabel
                          active={modelSort?.column === column}
                          direction={modelSort?.direction ?? null}
                        >
                          {label}
                        </SortLabel>
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modelRows.map((row) => (
                  <tr key={row.id || row.model}>
                    <td>
                      <span className={styles.monoTag}>{row.model}</span>
                    </td>
                    <td className={styles.alignRight}>
                      {formatUsageNumber(row.requests)}
                    </td>
                    <td className={styles.alignRight}>
                      {formatUsageNumber(row.inputTokens)}
                    </td>
                    <td
                      className={cn(
                        styles.alignRight,
                        "text-[var(--usage-brand-hover)]",
                      )}
                    >
                      {formatUsageNumber(row.cacheTokens)}
                    </td>
                    <td className={styles.alignRight}>
                      {formatUsageNumber(row.outputTokens)}
                    </td>
                    <td className={styles.alignRight}>
                      {formatCurrency(row.cost, currency)}
                    </td>
                  </tr>
                ))}
                {!loading && modelRows.length === 0 && (
                  <tr>
                    <td colSpan={6}>
                      <EmptyState>No model usage in this period</EmptyState>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        {showTopKeys && (
          <article className={cn(styles.card, loading && styles.loadingArea)}>
            <div className={styles.cardHeader}>
              <span>Top Keys by Cost</span>
              <span className={styles.cardHint}>
                {keyRows.length}
                <span className="ml-[4px]">keys</span>
              </span>
            </div>
            <div className={styles.tableScroll}>
              <table className={styles.table}>
                <colgroup>
                  <col className={styles.keyNameCol} />
                  <col className={styles.memberCol} />
                  <col className={styles.numberCol} />
                  <col className={styles.wideNumberCol} />
                  <col className={styles.numberCol} />
                </colgroup>
                <thead>
                  <tr>
                    <th>Key Name</th>
                    <th className={styles.alignRight}>Member</th>
                    {[
                      ["requests", "Requests"],
                      ["totalTokens", "Total Tokens"],
                      ["cost", `Cost (${currency})`],
                    ].map(([column, label]) => (
                      <th key={column} className={styles.alignRight}>
                        <button
                          type="button"
                          className={styles.sortButton}
                          onClick={() => toggleKeySort(column as KeySortColumn)}
                        >
                          <SortLabel
                            active={keySort?.column === column}
                            direction={keySort?.direction ?? null}
                          >
                            {label}
                          </SortLabel>
                        </button>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {keyRows.map((row) => (
                    <tr key={row.id || row.name}>
                      <td>
                        <span className={styles.monoTag}>{row.name}</span>
                      </td>
                      <td className={styles.alignRight}>
                        <span className={styles.memberName}>{row.member}</span>
                      </td>
                      <td className={styles.alignRight}>
                        {formatUsageNumber(row.requests)}
                      </td>
                      <td className={styles.alignRight}>
                        {formatUsageNumber(row.totalTokens)}
                      </td>
                      <td className={styles.alignRight}>
                        {formatCurrency(row.cost, currency)}
                      </td>
                    </tr>
                  ))}
                  {!loading && keyRows.length === 0 && (
                    <tr>
                      <td colSpan={5}>
                        <EmptyState>No key usage in this period</EmptyState>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </article>
        )}
      </section>
    </main>
  );
}

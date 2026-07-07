"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import {
  CalendarDays,
  ChevronDown,
  Info,
  KeyRound,
  RefreshCw,
  Search,
  Users,
  X,
} from "lucide-react";
import Button from "@/app/components/button/Button";
import { ModelAPIRequestLogItem } from "@/api/model-api-logs";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { NoData } from "@/components/ui/standard/no-data";
import { cn } from "@/lib/utils";
import {
  REQUEST_LOGS_PAGE_SIZE,
  getTeamScope,
  TIME_RANGE_OPTIONS,
  displayMetric,
  formatDateInput,
  formatFullNumber,
  formatTimestamp,
  getDefaultCustomRange,
  getRequestLogKey,
  getStatusKind,
  getStatusText,
  toNumber,
} from "./logsData";
import {
  useModelAPIRequestLogs,
  useRequestLogScopes,
} from "./useModelAPIRequestLogs";
import { LogsScopeOption, LogsScopeState, LogsTimeRange } from "./types";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import { useI18nSubscription } from "@/i18n/provider";
import styles from "./page.module.scss";

function ScopeDropdown({
  scope,
  scopeOptions,
  loading,
  restrictToSelf,
  onChange,
}: {
  scope: LogsScopeState;
  scopeOptions: LogsScopeOption;
  loading: boolean;
  restrictToSelf: boolean;
  onChange: (scope: LogsScopeState) => void;
}) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

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

  const selectScope = (nextScope: LogsScopeState) => {
    onChange(nextScope);
    setOpen(false);
  };

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
        disabled={loading}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{loading ? "Loading scopes" : scope.label}</span>
        <ChevronDown size={14} />
      </button>
      {open && (
        <div className={styles.scopeMenu}>
          <div className={styles.scopeMenuHeader}>
            {!restrictToSelf && (
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
                <span className={styles.scopeMeta}>All</span>
              </button>
            )}
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
                    <span className={styles.scopeAvatar}>
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

function TimeRangeDropdown({
  value,
  onChange,
}: {
  value: LogsTimeRange;
  onChange: (value: LogsTimeRange) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const selectTimeRange = (nextValue: LogsTimeRange) => {
    onChange(nextValue);
    setOpen(false);
  };

  return (
    <div
      ref={wrapRef}
      className={styles.timeWrap}
      onBlur={(event) => {
        if (!wrapRef.current?.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        type="button"
        className={styles.timeButton}
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <CalendarDays size={14} />
        <span>
          <TimeRangeLabel value={value} />
        </span>
        <ChevronDown size={12} />
      </button>
      {open && (
        <div className={styles.timeMenu}>
          {TIME_RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className={cn(
                styles.timeOption,
                value === option.value && styles.selected,
              )}
              onClick={() => selectTimeRange(option.value)}
            >
              <TimeRangeLabel value={option.value} />
            </button>
          ))}
          <button
            type="button"
            className={cn(
              styles.timeOption,
              value === "custom" && styles.selected,
            )}
            onClick={() => selectTimeRange("custom")}
          >
            Custom Range
          </button>
        </div>
      )}
    </div>
  );
}

function TimeRangeLabel({ value }: { value: LogsTimeRange }) {
  switch (value) {
    case "15m":
      return <>Last 15 Minutes</>;
    case "1h":
      return <>Last Hour</>;
    case "4h":
      return <>Last 4 Hours</>;
    case "7d":
      return <>Last 7 Days</>;
    case "custom":
      return <>Custom Range</>;
    case "24h":
    default:
      return <>Last 24 Hours</>;
  }
}

function StatusBadge({ item }: { item: ModelAPIRequestLogItem }) {
  const kind = getStatusKind(item.status_code);

  return (
    <span className={cn(styles.statusBadge, styles[kind])}>
      {getStatusText(item)}
    </span>
  );
}

function DetailField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <>
      <div className={styles.drawerKey}>{label}</div>
      <div className={styles.drawerValue}>{children || "-"}</div>
    </>
  );
}

function formatErrorResponse(value?: string) {
  if (!value) return "";

  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

function RequestLogDrawer({
  item,
  keyName,
  memberName,
  onOpenChange,
}: {
  item: ModelAPIRequestLogItem | null;
  keyName: string;
  memberName: string;
  onOpenChange: (open: boolean) => void;
}) {
  const isOpen = Boolean(item);
  const statusKind = item ? getStatusKind(item.status_code) : "unknown";
  const errorResponse = formatErrorResponse(item?.err_response);

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        className={styles.drawerContent}
        overlayClassname={styles.drawerOverlay}
        showCloseButton={false}
        side="right"
      >
        <div className={styles.drawerHeader}>
          <SheetTitle className={styles.drawerTitle}>Request Detail</SheetTitle>
          <SheetClose asChild>
            <button type="button" className={styles.drawerClose}>
              <X size={16} />
              <span className="sr-only">Close</span>
            </button>
          </SheetClose>
        </div>
        {item && (
          <div className={styles.drawerBody}>
            <section className={styles.drawerSection}>
              <div className={styles.drawerSectionTitle}>Overview</div>
              <div className={styles.drawerGrid}>
                <DetailField label="Status">
                  <StatusBadge item={item} />
                </DetailField>
                <DetailField label="Request ID">
                  <span className={styles.linkMono}>
                    {item.request_id || "-"}
                  </span>
                </DetailField>
                <DetailField label="Trace ID">
                  <span className={styles.mono}>{item.trace_id || "-"}</span>
                </DetailField>
                <DetailField label="Session ID">
                  <span className={styles.mono}>{item.session_id || "-"}</span>
                </DetailField>
                <DetailField label="Timestamp (UTC)">
                  {formatTimestamp(item.record_at)}
                </DetailField>
                <DetailField label="Model">
                  <span className={styles.tag}>{item.model_name || "-"}</span>
                </DetailField>
                <DetailField label="Key">
                  <span className={styles.tag}>{keyName || "-"}</span>
                </DetailField>
                <DetailField label="Member">{memberName || "-"}</DetailField>
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div className={styles.drawerSectionTitle}>Performance</div>
              <div className={styles.drawerGrid}>
                <DetailField label="TTFT">
                  {toNumber(item.ttft_ms)
                    ? `${formatFullNumber(item.ttft_ms)} ms`
                    : "-"}
                </DetailField>
                <DetailField label="Duration">
                  {toNumber(item.duration_ms)
                    ? `${formatFullNumber(item.duration_ms)} ms`
                    : "-"}
                </DetailField>
              </div>
            </section>
            <section className={styles.drawerSection}>
              <div className={styles.drawerSectionTitle}>Token Usage</div>
              <div className={styles.drawerGrid}>
                <DetailField label="Input Tokens">
                  {formatFullNumber(item.input_tokens)}
                  {toNumber(item.cache_tokens) > 0 && (
                    <span className={styles.cacheHint}>
                      {" "}
                      ({formatFullNumber(item.cache_tokens)} cached)
                    </span>
                  )}
                </DetailField>
                <DetailField label="Output Tokens">
                  {toNumber(item.output_tokens)
                    ? formatFullNumber(item.output_tokens)
                    : "-"}
                </DetailField>
              </div>
            </section>
            {statusKind !== "success" &&
              (errorResponse || item.status_reason) && (
                <section className={styles.drawerSection}>
                  <div
                    className={cn(styles.drawerSectionTitle, styles.errorTitle)}
                  >
                    Response Body - Error
                  </div>
                  <pre className={styles.errorCode}>
                    {errorResponse || item.status_reason}
                  </pre>
                </section>
              )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

export default function LogsClient() {
  // Re-render this client subtree when the locale changes at runtime; without
  // it the page renders once and its __t() calls stay frozen on whichever
  // locale was active at mount (it stays mounted across the locale switch).
  useI18nSubscription();

  const defaultCustomRange = useMemo(() => getDefaultCustomRange(), []);
  const {
    scopeOptions: rawScopeOptions,
    loading: scopesLoading,
    error: scopesError,
  } = useRequestLogScopes();

  // Billing role (non-admin) may only inspect their own logs and their own
  // keys, so we filter the scope dropdown down to the current member on the
  // client and never expose the team-wide ("All") option to them.
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const restrictToSelf = currentTeam?.role === TeamRole.billing;
  const selfMemberId = currentTeam?.memberId || null;

  const scopeOptions = useMemo<LogsScopeOption>(() => {
    if (!restrictToSelf) return rawScopeOptions;

    const ownMember =
      (selfMemberId &&
        rawScopeOptions.members.find(
          (member) => member.memberId === selfMemberId,
        )) ||
      null;

    if (!ownMember) return { team: getTeamScope(), members: [] };

    const ownScope: LogsScopeState = {
      type: "member",
      memberId: ownMember.memberId,
      memberName: ownMember.memberName,
      keyId: null,
      label: ownMember.label,
      keyCount: ownMember.keyCount,
    };

    return { team: ownScope, members: [ownMember] };
  }, [restrictToSelf, selfMemberId, rawScopeOptions]);

  const [scope, setScope] = useState<LogsScopeState>(getTeamScope);
  const [timeRange, setTimeRange] = useState<LogsTimeRange>("24h");
  const [customStart, setCustomStart] = useState(defaultCustomRange.start);
  const [customEnd, setCustomEnd] = useState(defaultCustomRange.end);
  const [searchInput, setSearchInput] = useState("");
  const [searchText, setSearchText] = useState("");
  const [liveTail, setLiveTail] = useState(false);
  const [selectedLog, setSelectedLog] = useState<ModelAPIRequestLogItem | null>(
    null,
  );

  useEffect(() => {
    setScope((current) =>
      current.type === "team" ? scopeOptions.team : current,
    );
  }, [scopeOptions.team]);

  useEffect(() => {
    if (timeRange !== "custom") return;

    setCustomStart((current) => current || formatDateInput(new Date()));
    setCustomEnd((current) => current || formatDateInput(new Date()));
  }, [timeRange]);

  const {
    items,
    loading,
    loadingMore,
    error,
    hasMore,
    lastFetchedAt,
    refresh,
    loadMore,
  } = useModelAPIRequestLogs({
    scope,
    timeRange,
    customStart,
    customEnd,
    searchText,
    liveTail,
  });

  const memberLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    scopeOptions.members.forEach((member) => {
      if (member.memberId) map.set(member.memberId, member.label);
    });
    return map;
  }, [scopeOptions.members]);

  const keyLabelMap = useMemo(() => {
    const map = new Map<string, string>();
    scopeOptions.members.forEach((member) => {
      member.keys.forEach((key) => {
        if (key.keyId) map.set(key.keyId, key.label);
      });
    });
    return map;
  }, [scopeOptions.members]);

  const showMemberColumn =
    scope.type !== "key" && scopeOptions.members.length > 0;
  const visibleError = error || scopesError;
  const selectedKeyName =
    (selectedLog?.user_key_id && keyLabelMap.get(selectedLog.user_key_id)) ||
    selectedLog?.user_key_id ||
    "";
  const selectedMemberName =
    (selectedLog?.member_id && memberLabelMap.get(selectedLog.member_id)) ||
    selectedLog?.member_id ||
    "";

  const applySearch = () => {
    const nextSearchText = searchInput.trim();
    if (nextSearchText === searchText) {
      refresh();
    } else {
      setSearchText(nextSearchText);
    }
  };

  const handleSearchKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") applySearch();
  };

  return (
    <main className={styles.logsPage}>
      <div className={styles.tabs}>
        <button type="button" className={cn(styles.tab, styles.activeTab)}>
          Request Logs
        </button>
      </div>

      <div className={styles.controlRow}>
        <ScopeDropdown
          scope={scope}
          scopeOptions={scopeOptions}
          loading={scopesLoading}
          restrictToSelf={restrictToSelf}
          onChange={setScope}
        />
        <Input
          containerClassName={styles.searchWrap}
          className={styles.searchInput}
          prefixIcon={<Search size={15} className={styles.searchIcon} />}
          placeholder="Search by Request ID, Trace ID, Session ID or Model"
          value={searchInput}
          allowClear
          onClear={() => {
            setSearchInput("");
            setSearchText("");
          }}
          onChange={(event) => setSearchInput(event.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <TimeRangeDropdown value={timeRange} onChange={setTimeRange} />
        {timeRange === "custom" && (
          <div className={styles.customRange}>
            <input
              type="date"
              value={customStart}
              max={customEnd}
              onChange={(event) => setCustomStart(event.target.value)}
            />
            <span>to</span>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              onChange={(event) => setCustomEnd(event.target.value)}
            />
          </div>
        )}
        <label className={styles.liveToggle}>
          <span>Live Tail</span>
          <Switch
            size="sm"
            checked={liveTail}
            onCheckedChange={setLiveTail}
            aria-label="Toggle live tail"
          />
        </label>
        <Button
          type="normal"
          size="medium"
          className={styles.fetchButton}
          loading={loading && items.length > 0}
          onClick={applySearch}
        >
          <RefreshCw size={14} />
          <span>Fetch</span>
        </Button>
      </div>

      <div className={styles.noticeRow}>
        <div className={cn(styles.liveBar, liveTail && styles.liveBarVisible)}>
          <span className={styles.liveDot} />
          Auto-refreshing every 15s · {items.length} rows
        </div>
        <div className={styles.retentionNote}>
          <Info size={13} />
          Logs retained for 1 month
        </div>
      </div>

      {visibleError && <div className={styles.errorBanner}>{visibleError}</div>}

      <section className={cn(styles.tableCard, loading && styles.loadingArea)}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Timestamp (UTC)</th>
                <th>Request ID</th>
                <th>Session ID</th>
                <th>Trace ID</th>
                <th>Key Name</th>
                {showMemberColumn && <th>Member</th>}
                <th>Model</th>
                <th className={styles.alignRight}>Input</th>
                <th className={cn(styles.alignRight, styles.cacheColumn)}>
                  Cache
                </th>
                <th className={styles.alignRight}>Output</th>
                <th className={styles.alignRight}>TTFT (ms)</th>
                <th className={styles.alignRight}>Duration (ms)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, index) => {
                const keyName =
                  (item.user_key_id && keyLabelMap.get(item.user_key_id)) ||
                  item.user_key_id ||
                  "-";
                const memberName =
                  (item.member_id && memberLabelMap.get(item.member_id)) ||
                  item.member_id ||
                  "-";

                return (
                  <tr
                    key={getRequestLogKey(item, index)}
                    className={styles.logRow}
                    tabIndex={0}
                    role="button"
                    onClick={() => setSelectedLog(item)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedLog(item);
                      }
                    }}
                  >
                    <td className={styles.timestamp}>
                      {formatTimestamp(item.record_at)}
                    </td>
                    <td>
                      <span className={styles.linkMono}>
                        {item.request_id || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.mono}>
                        {item.session_id || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.mono}>
                        {item.trace_id || "-"}
                      </span>
                    </td>
                    <td>
                      <span className={styles.tag}>{keyName}</span>
                    </td>
                    {showMemberColumn && (
                      <td className={styles.memberCell}>{memberName}</td>
                    )}
                    <td>
                      <span className={styles.tag}>
                        {item.model_name || "-"}
                      </span>
                    </td>
                    <td className={cn(styles.alignRight, styles.mono)}>
                      {displayMetric(item.input_tokens)}
                    </td>
                    <td
                      className={cn(
                        styles.alignRight,
                        styles.mono,
                        styles.cacheColumn,
                      )}
                    >
                      {displayMetric(item.cache_tokens, { dashWhenZero: true })}
                    </td>
                    <td className={cn(styles.alignRight, styles.mono)}>
                      {displayMetric(item.output_tokens, {
                        dashWhenZero: true,
                      })}
                    </td>
                    <td className={cn(styles.alignRight, styles.mono)}>
                      {displayMetric(item.ttft_ms, { dashWhenZero: true })}
                    </td>
                    <td className={cn(styles.alignRight, styles.mono)}>
                      {displayMetric(item.duration_ms, { dashWhenZero: true })}
                    </td>
                    <td>
                      <StatusBadge item={item} />
                    </td>
                  </tr>
                );
              })}
              {!loading && items.length === 0 && (
                <tr>
                  <td colSpan={showMemberColumn ? 13 : 12}>
                    <NoData
                      className={styles.noData}
                      title="No request logs"
                      description="Try a wider time range or a different filter."
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className={styles.tableFooter}>
          <span>
            {items.length > 0
              ? `Showing ${items.length}${hasMore ? "+" : ""} rows`
              : "No rows"}
            {lastFetchedAt
              ? ` · Updated ${formatTimestamp(lastFetchedAt)}`
              : ""}
          </span>
          {hasMore && (
            <Button
              type="normal"
              size="medium"
              className={styles.loadMoreButton}
              loading={loadingMore}
              disabled={loading || loadingMore}
              onClick={loadMore}
            >
              <span>Load</span>
              <span className="mx-[4px]">{REQUEST_LOGS_PAGE_SIZE}</span>
              <span>more</span>
            </Button>
          )}
        </div>
      </section>

      <RequestLogDrawer
        item={selectedLog}
        keyName={selectedKeyName}
        memberName={selectedMemberName}
        onOpenChange={(open) => {
          if (!open) setSelectedLog(null);
        }}
      />
    </main>
  );
}

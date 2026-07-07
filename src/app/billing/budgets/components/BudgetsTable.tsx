"use client";

import Big from "big.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import {
  Fragment,
  forwardRef,
  useState,
  useMemo,
  useEffect,
  useCallback,
  useImperativeHandle,
} from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import { HelpCircle, ChevronRight } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import StandardPagination from "@/components/ui/standard/pagination";
import BudgetEditModal from "./BudgetEditModal";
import ApiKeyEditModal from "./ApiKeyEditModal";
import {
  getBudgetList,
  getKeyBudgetList,
  updateKeyBudget,
  updateMemberBudget,
} from "@/api/team";
import type { KeyBudgetInfo } from "@/api/team";
import { Skeleton } from "@/components/ui/skeleton";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import {
  USE_MOCK_DATA,
  mockBudgets,
  ApiKey,
  BUDGET_TYPES,
  BUDGET_TYPE_DESCRIPTIONS,
} from "./mockData";
import styles from "./BudgetsTable.module.scss";

dayjs.extend(utc);

// Budget data interface
export interface Budget {
  id: string;
  member: string;
  phone?: string;
  role: string;
  remarkName: string;
  status: string;
  budgetLimit: number;
  used: number;
  remaining: number;
  nextReset: string;
  budgetType: string;
  apiKeys?: ApiKey[];
}

// API response interface
interface BudgetAPIResponse {
  email: string;
  role: string;
  status: string;
  member_id: string;
  phone: string;
  user_id: string;
  remark_name: string;
  budget_type: string;
  budget_limit: string;
  used: string;
  remaining: string;
  cycle?: string;
  period_start?: string;
  period_end?: string;
}

const formatAmountWithPrecision = (amount: number) => {
  let amountText = "0.00";

  try {
    const fixedAmount = new Big(amount || 0).div(10000).round(4).toFixed(4);
    const [integerPart, decimalPart = ""] = fixedAmount.split(".");
    let trimmedDecimal = decimalPart;
    while (trimmedDecimal.length > 2 && trimmedDecimal.endsWith("0")) {
      trimmedDecimal = trimmedDecimal.slice(0, -1);
    }
    amountText = `${integerPart}.${trimmedDecimal.padEnd(2, "0")}`;
  } catch {
    amountText = "0.00";
  }

  const [integerPart, decimalPart] = amountText.split(".");
  const formattedInteger = Number(integerPart).toLocaleString("en-US");
  const formattedAmount = decimalPart
    ? `${formattedInteger}.${decimalPart}`
    : formattedInteger;

  return `$${formattedAmount}`;
};

const formatBudgetAmount = (amount: number, budgetType?: string) => {
  if (budgetType === BUDGET_TYPES.UNLIMITED) {
    return "Unlimited";
  }
  return formatAmountWithPrecision(amount);
};

const formatResetTime = (value?: string) => {
  if (!value) return "";

  const formattedTime = dayjs.utc(value);
  if (!formattedTime.isValid()) {
    return value;
  }

  return formattedTime.format("YYYY-MM-DD HH:mm:ss");
};

// Map API response to component data format
export const mapBudgetData = (apiData: BudgetAPIResponse[]): Budget[] => {
  return apiData.map((item) => ({
    id: item.member_id,
    member: item.email,
    phone: item.phone,
    role: item.role,
    remarkName: item.remark_name,
    status: item.status || "-",
    budgetLimit: parseFloat(item.budget_limit) || 0,
    used: parseFloat(item.used) || 0,
    remaining: parseFloat(item.remaining) || 0,
    nextReset: item.period_end || "",
    budgetType: item.budget_type || BUDGET_TYPES.UNLIMITED,
  }));
};

// Progress bar component
function UsageProgressBar({
  used,
  limit,
  budgetType,
}: {
  used: number;
  limit: number;
  budgetType: string;
}) {
  if (budgetType === BUDGET_TYPES.UNLIMITED) {
    return null;
  }

  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0;
  const statusClass =
    percentage >= 90 ? "danger" : percentage >= 70 ? "warning" : "normal";

  return (
    <div className={styles.progress_bar_container}>
      <div
        className={`${styles.progress_bar} ${styles[statusClass]}`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
}

interface BudgetsTableProps {
  searchValue: string;
}

export interface BudgetsTableRef {
  refresh: () => void;
}

function BudgetsTable(
  { searchValue }: BudgetsTableProps,
  ref: React.Ref<BudgetsTableRef>,
) {
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(false);
  const pageSize = 10;

  // Modal states
  const [memberModalOpen, setMemberModalOpen] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState<Budget | null>(null);
  const [selectedApiKey, setSelectedApiKey] = useState<ApiKey | null>(null);

  // API Key budget state
  const [keyBudgetMap, setKeyBudgetMap] = useState<
    Record<string, KeyBudgetInfo[]>
  >({});
  const [keyBudgetLoading, setKeyBudgetLoading] = useState<
    Record<string, boolean>
  >({});

  // Get current user info
  const currentTeam = useAppSelector((state) => state.user.currentTeam);

  const canEditBudget =
    currentTeam?.role === TeamRole.admin ||
    currentTeam?.role === TeamRole.owner ||
    currentTeam?.role === TeamRole.billing;

  // Fetch budget data
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      if (USE_MOCK_DATA) {
        // Use mock data for development
        setBudgets(mockBudgets as Budget[]);
      } else {
        const response = await getBudgetList();
        if (response && response.budgets) {
          const mappedData = mapBudgetData(response.budgets);
          setBudgets(mappedData);
        }
      }
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  useImperativeHandle(
    ref,
    () => ({
      refresh: fetchBudgets,
    }),
    [fetchBudgets],
  );

  // Filter and sort budgets
  const filteredBudgets = useMemo(() => {
    let result = budgets;

    // Filter by search
    if (searchValue) {
      result = result.filter(
        (budget) =>
          budget.member.toLowerCase().includes(searchValue.toLowerCase()) ||
          budget.phone?.toLowerCase().includes(searchValue.toLowerCase()) ||
          (budget.remarkName &&
            budget.remarkName
              .toLowerCase()
              .includes(searchValue.toLowerCase())),
      );
    }

    return result;
  }, [searchValue, budgets]);

  // Pagination
  const totalItems = filteredBudgets.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const currentPageData = filteredBudgets.slice(
    startIndex,
    startIndex + pageSize,
  );

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setExpandedMemberId(null);
  };

  const loadKeyBudgets = useCallback(async (memberId: string) => {
    setKeyBudgetLoading((prev) => ({ ...prev, [memberId]: true }));
    try {
      const keyBudgets = await getKeyBudgetList(memberId);
      setKeyBudgetMap((prev) => ({ ...prev, [memberId]: keyBudgets }));
    } catch {
      setKeyBudgetMap((prev) => ({ ...prev, [memberId]: [] }));
    } finally {
      setKeyBudgetLoading((prev) => ({ ...prev, [memberId]: false }));
    }
  }, []);

  const handleRowClick = async (budget: Budget) => {
    if (expandedMemberId === budget.id) {
      setExpandedMemberId(null);
      return;
    }
    setExpandedMemberId(budget.id);
    if (!keyBudgetMap[budget.id]) {
      await loadKeyBudgets(budget.id);
    }
  };

  const handleEditMember = (budget: Budget, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBudget(budget);
    setMemberModalOpen(true);
  };

  const handleEditApiKey = (apiKey: ApiKey, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedApiKey(apiKey);
    setApiKeyModalOpen(true);
  };

  const handleSaveMemberBudget = async (data: {
    budgetType: string;
    budgetAmount: number;
    memberName: string;
  }) => {
    if (!selectedBudget) return;
    const budgetLimit =
      data.budgetType === BUDGET_TYPES.UNLIMITED
        ? 0
        : Math.round(data.budgetAmount);
    await updateMemberBudget(
      selectedBudget.id,
      data.budgetType,
      budgetLimit,
      data.budgetType === "Recurring" ? "Monthly" : "",
    );
    await fetchBudgets();
  };

  const handleSaveApiKeyBudget = async (data: {
    budgetType: string;
    budgetAmount: number;
    apiKeyId: string;
  }) => {
    const memberId = expandedMemberId;
    if (!memberId || !data.apiKeyId) return;
    const budgetLimit =
      data.budgetType === BUDGET_TYPES.UNLIMITED
        ? 0
        : Math.round(data.budgetAmount);
    await updateKeyBudget(
      memberId,
      data.apiKeyId,
      data.budgetType,
      budgetLimit,
    );
    await loadKeyBudgets(memberId);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Active":
        return styles.active;
      case "Invite Pending":
        return styles.invite_pending;
      case "Invite Canceled":
        return styles.invite_canceled;
      case "Invite Expired":
        return styles.invite_expired;
      case "Left Team":
        return styles.left_team;
      default:
        return styles.active;
    }
  };

  const getRoleClass = (role: string) => {
    switch (role.toLowerCase()) {
      case "owner":
        return styles.owner;
      case "admin":
        return styles.admin;
      default:
        return styles.default;
    }
  };

  const renderBudgetType = (budgetType: string) => {
    if (budgetType === BUDGET_TYPES.UNLIMITED) {
      return (
        <span className={`${styles.budget_type_badge} ${styles.admin}`}>
          {budgetType}
        </span>
      );
    }

    if (budgetType.toLowerCase() === "unset") {
      return (
        <span className={`${styles.budget_type_badge} ${styles.default}`}>
          {budgetType}
        </span>
      );
    }

    if (budgetType !== BUDGET_TYPES.UNLIMITED) {
      return budgetType;
    }
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1">
        <Table className={styles.budgets_table}>
          <TableHeader>
            <TableRow className="bg-[var(--gray-3)]">
              <TableHead className="text-left w-[25%]">Member</TableHead>
              <TableHead className="text-left w-[12%]">Status</TableHead>
              <TableHead className="text-left w-[15%]">
                <div className="flex items-center gap-1">
                  Budget Type
                  <Popover>
                    <PopoverTrigger asChild>
                      <HelpCircle
                        size={14}
                        className="text-[var(--dark-3)] cursor-pointer hover:text-[var(--dark-2)]"
                      />
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[320px] p-3 relative"
                      side="top"
                      align="center"
                    >
                      <PopoverPrimitive.Arrow className="fill-[var(--white)]" />
                      <div className="space-y-2 text-sm text-[var(--dark-2)]">
                        {Object.entries(BUDGET_TYPE_DESCRIPTIONS).map(
                          ([type, desc]) => (
                            <p key={type}>
                              <strong>{type}:</strong> {desc}
                            </p>
                          ),
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </TableHead>
              <TableHead className="text-left w-[12%]">Budget</TableHead>
              <TableHead className="text-left w-[26%]">Usage</TableHead>
              <TableHead className="text-right w-[10%]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="[&_tr:last-child]:border-b [&_tr:last-child]:border-[var(--gray-2)]">
            {loading
              ? Array.from({ length: pageSize }).map((_, index) => (
                  <TableRow key={`loading-${index}`}>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-6 w-16 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-24" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-20" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-12" />
                    </TableCell>
                  </TableRow>
                ))
              : currentPageData.map((budget) => (
                  <Fragment key={budget.id}>
                    {/* Main row */}
                    <TableRow
                      className={`${styles.expandable_row} ${expandedMemberId === budget.id ? styles.expanded_row : ""}`}
                      onClick={() => handleRowClick(budget)}
                    >
                      <TableCell className="font-table-item text-[var(--dark-2)]">
                        <div className="flex flex-col gap-1 py-2">
                          <div className="flex items-center flex-wrap">
                            <span>{budget.phone || budget.member}</span>
                            <span
                              className={`${styles.role_badge} ${getRoleClass(budget.role)}`}
                            >
                              {budget.role.charAt(0).toUpperCase() +
                                budget.role.slice(1)}
                            </span>
                          </div>
                          {budget.remarkName && (
                            <span className="font-small-console text-[var(--dark-3)]">
                              {budget.remarkName}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`${styles.status_badge} ${getStatusClass(budget.status)}`}
                        >
                          {budget.status}
                        </span>
                      </TableCell>
                      <TableCell className="font-table-item text-[var(--dark-2)]">
                        {renderBudgetType(budget.budgetType)}
                      </TableCell>
                      <TableCell className="font-table-item text-[var(--dark-2)]">
                        {formatBudgetAmount(
                          budget.budgetLimit,
                          budget.budgetType,
                        )}
                      </TableCell>
                      <TableCell>
                        <div className={styles.usage_cell}>
                          <span className={styles.usage_text}>
                            {formatAmountWithPrecision(budget.used)}
                            {budget.budgetType !== BUDGET_TYPES.UNLIMITED && (
                              <span className="text-[var(--dark-3)]">
                                {" / "}
                                {formatAmountWithPrecision(budget.budgetLimit)}
                              </span>
                            )}
                          </span>
                          <UsageProgressBar
                            used={budget.used}
                            limit={budget.budgetLimit}
                            budgetType={budget.budgetType}
                          />
                          {budget.budgetType === BUDGET_TYPES.MONTHLY &&
                            budget.nextReset && (
                              <span className={styles.reset_time}>
                                Reset at {formatResetTime(budget.nextReset)}
                              </span>
                            )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={(e) =>
                              canEditBudget && handleEditMember(budget, e)
                            }
                            disabled={!canEditBudget}
                            className={`${styles.edit_button} ${!canEditBudget ? styles.edit_button_disabled : ""}`}
                          >
                            Edit
                          </button>
                          <span
                            className={`${styles.expand_icon} ${
                              expandedMemberId === budget.id
                                ? styles.expanded
                                : ""
                            }`}
                          >
                            <ChevronRight size={16} />
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>

                    {/* Expanded API Keys row */}
                    {expandedMemberId === budget.id && (
                      <TableRow key={`${budget.id}-expanded`}>
                        <TableCell colSpan={6} className="p-0">
                          <div className={styles.api_keys_container}>
                            {keyBudgetLoading[budget.id] ? (
                              <div className="p-4 text-sm text-[var(--dark-3)]">
                                Loading...
                              </div>
                            ) : (keyBudgetMap[budget.id] || []).length > 0 ? (
                              <table className={styles.api_keys_table}>
                                <thead>
                                  <tr>
                                    <th className={styles.col_name}>
                                      API Key Name
                                    </th>
                                    <th className={styles.col_status}></th>
                                    <th className={styles.col_budget_type}>
                                      Budget Type
                                    </th>
                                    <th className={styles.col_budget}>
                                      Budget
                                    </th>
                                    <th className={styles.col_usage}>Usage</th>
                                    <th className={styles.col_actions}>
                                      Actions
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {(keyBudgetMap[budget.id] || []).map((kb) => (
                                    <tr key={kb.key_id}>
                                      <td className={styles.col_name}>
                                        {kb.key_name || kb.key_id}
                                      </td>
                                      <td className={styles.col_status}></td>
                                      <td className={styles.col_budget_type}>
                                        {renderBudgetType(kb.budget_type)}
                                      </td>
                                      <td className={styles.col_budget}>
                                        {formatBudgetAmount(
                                          kb.budget_limit,
                                          kb.budget_type,
                                        )}
                                      </td>
                                      <td className={styles.col_usage}>
                                        <div className={styles.usage_cell}>
                                          <span>
                                            {formatAmountWithPrecision(kb.used)}
                                            {kb.budget_type !==
                                              BUDGET_TYPES.UNLIMITED && (
                                              <span className="text-[var(--dark-3)]">
                                                {" / "}
                                                {formatAmountWithPrecision(
                                                  kb.budget_limit,
                                                )}
                                              </span>
                                            )}
                                          </span>
                                          <UsageProgressBar
                                            used={kb.used}
                                            limit={kb.budget_limit}
                                            budgetType={kb.budget_type}
                                          />
                                          {kb.budget_type ===
                                            BUDGET_TYPES.MONTHLY &&
                                            kb.period_end && (
                                              <span
                                                className={styles.reset_time}
                                              >
                                                Reset at{" "}
                                                {formatResetTime(kb.period_end)}
                                              </span>
                                            )}
                                        </div>
                                      </td>
                                      <td className={styles.col_actions}>
                                        <button
                                          onClick={(e) => {
                                            if (!canEditBudget) return;
                                            e.stopPropagation();
                                            handleEditApiKey(
                                              {
                                                id: kb.key_id,
                                                name: kb.key_name,
                                                createdAt: "",
                                                budget: kb.budget_limit,
                                                used: kb.used,
                                                budget_type: kb.budget_type,
                                              },
                                              e,
                                            );
                                          }}
                                          disabled={!canEditBudget}
                                          className={`${styles.edit_button} ${!canEditBudget ? styles.edit_button_disabled : ""}`}
                                        >
                                          Edit
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            ) : (
                              <div className="p-4 text-sm text-[var(--dark-3)]">
                                No API Key budgets
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-end">
          <StandardPagination
            total={totalItems}
            pageSize={pageSize}
            defaultCurrent={currentPage}
            onChange={handlePageChange}
            align="end"
            customButtonStyle={true}
          />
        </div>
      )}

      {/* Member Budget Edit Modal */}
      {canEditBudget && (
        <BudgetEditModal
          isOpen={memberModalOpen}
          onClose={() => setMemberModalOpen(false)}
          memberData={
            selectedBudget
              ? {
                  id: selectedBudget.id,
                  name: selectedBudget.member,
                  phone: selectedBudget.phone,
                  budget: selectedBudget.budgetLimit,
                  budget_type: selectedBudget.budgetType,
                }
              : null
          }
          onSave={handleSaveMemberBudget}
        />
      )}

      {/* API Key Budget Edit Modal */}
      {canEditBudget && (
        <ApiKeyEditModal
          isOpen={apiKeyModalOpen}
          onClose={() => setApiKeyModalOpen(false)}
          apiKeyData={selectedApiKey}
          onSave={handleSaveApiKeyBudget}
        />
      )}
    </div>
  );
}

export default forwardRef<BudgetsTableRef, BudgetsTableProps>(BudgetsTable);

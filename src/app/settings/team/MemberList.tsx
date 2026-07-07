"use client";
import { useState, useCallback, useEffect, useRef } from "react";
import {
  Ellipsis,
  Loader2,
  Check,
  PencilLine,
  X,
  RefreshCw,
  ChevronRight,
  Info,
} from "lucide-react";
import { message } from "@/components/ui/standard/notify";
import { AppTooltip as Tooltip } from "@/components/ui/standard/tooltip";
import { Button } from "@/components/ui/button";
import { SearchInput } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
} from "@/components/ui/table";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import {
  getTeamMembers,
  resendInvite,
  editMemberAlias,
  getBudgetList,
} from "@/api/team";
import { TeamRole, TeamMemberStatus } from "@/store/slice/userSlice";
import Invite from "./Invite";
import Edit from "./Edit";
import Remove from "./Remove";
import Resend from "./Resend";
import Cancel from "./Cancel";
import { getDateDisplay } from "@/lib/utils/date";
import { useAppSelector } from "@/store";
import { Input } from "@/components/ui/input";
import analytics from "@/app/components/analytics/analytics";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import { NOVITA_URL } from "@/constants/urls";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  Budget,
  mapBudgetData,
} from "@/app/billing/budgets/components/BudgetsTable";
import BudgetEditModal from "@/app/billing/budgets/components/BudgetEditModal";
import { updateMemberBudget } from "@/api/team";
import { BUDGET_TYPES } from "@/app/billing/budgets/components/mockData";
import StandardPagination from "@/components/ui/standard/pagination-control";
import CopyBtn from "@/components/ui/standard/code-copy-btn";
type Member = {
  uuid: string;
  memID: string;
  email: string;
  role: TeamRole;
  status: TeamMemberStatus;
  joinDate: string;
  inviteID: string;
  sendingEmail: boolean;
  emailSent: boolean;
  menuOpen: boolean;
  phone: string;
  inviteLink: string;
  alias: string;
  editingAlias: boolean;
  tempAlias: string;
  updatingAlias: boolean;
  budgetType: string;
  budgetLimit: number;
};
const getMemberList = async (): Promise<Member[]> => {
  const res = await getTeamMembers();
  return res.members.map((m: any) => ({
    uuid: m.user_id,
    memID: m.member_id,
    email: m.email,
    role: m.role,
    status: m.status,
    joinDate: parseInt(m.joined_at)
      ? getDateDisplay(parseInt(m.joined_at), "day")
      : "-",
    inviteID: m.invite_id,
    sendingEmail: false,
    emailSent: false,
    menuOpen: false,
    phone: m.phone,
    inviteLink: m.invite_url,
    alias: m.remark_name || "",
    editingAlias: false,
    tempAlias: "",
    updatingAlias: false,
    budgetType: m.budget_type || "-",
    budgetLimit: parseFloat(m.budget_limit) || 0,
  }));
};
// Format budget limit with proper precision and currency formatting
export const formatBudgetLimit = (amount: number) => {
  const processedAmount = dealMoneyWithPrecision(amount, 1, 4);
  if (processedAmount === "-") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  }
  // Format with proper precision instead of forcing 2 decimal places
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 4, // Allow up to 4 decimal places
  }).format(processedAmount);
};
export function getStatusLabel(status: TeamMemberStatus, copy?: unknown) {
  switch (status) {
    case TeamMemberStatus.all:
      return "All Status";
    case TeamMemberStatus.active:
      return "Active";
    case TeamMemberStatus.invitePending:
      return "Invite Pending";
    case TeamMemberStatus.inviteCanceled:
      return "Invite Canceled";
    case TeamMemberStatus.inviteExpired:
      return "Invite Expired";
    case TeamMemberStatus.leftTeam:
      return "Left Team";
  }
  return "";
}
export function getRoleLabel(role: TeamRole, copy?: unknown) {
  switch (role) {
    case TeamRole.owner:
      return "Owner";
    case TeamRole.admin:
      return "Admin";
    case TeamRole.developer:
      return "Developer";
    case TeamRole.basic:
      return "Basic";
    case TeamRole.billing:
      return "Billing";
  }
  return "All";
}
export function getRoleColor(role: TeamRole): string {
  switch (role) {
    case TeamRole.owner:
      return "!text-[var(--brand-1)]";
    case TeamRole.admin:
      return "!text-[var(--cyan-2)]";
    default:
      return "!text-[var(--black)]";
  }
}
function getSortedMemberList(
  memberList: Member[],
  readNewMemberList: string[],
): Member[] {
  // Create array with indices to preserve original order
  const membersWithIndex = memberList.map((member, index) => ({
    member,
    originalIndex: index,
  }));
  return membersWithIndex
    .sort((a, b) => {
      const { member: memberA } = a;
      const { member: memberB } = b;
      // Priority 0: readNewMemberList
      const isReadNewMemberA = readNewMemberList.includes(memberA.memID);
      const isReadNewMemberB = readNewMemberList.includes(memberB.memID);
      if (isReadNewMemberA && !isReadNewMemberB) return -1;
      if (!isReadNewMemberA && isReadNewMemberB) return 1;
      // Priority 1: owner role
      const isOwnerA = memberA.role === TeamRole.owner;
      const isOwnerB = memberB.role === TeamRole.owner;
      if (isOwnerA && !isOwnerB) return -1;
      if (!isOwnerA && isOwnerB) return 1;
      // Priority 2: invitePending status (but not owner, as owner already handled)
      if (!isOwnerA && !isOwnerB) {
        const isInvitePendingA =
          memberA.status === TeamMemberStatus.invitePending;
        const isInvitePendingB =
          memberB.status === TeamMemberStatus.invitePending;
        if (isInvitePendingA && !isInvitePendingB) return -1;
        if (!isInvitePendingA && isInvitePendingB) return 1;
      }
      // Priority 3: Keep original order for remaining items
      return a.originalIndex - b.originalIndex;
    })
    .map(({ member }) => member);
}
export default function MemberList({
  setMemberCount,
  copy,
}: {
  setMemberCount: (count: number) => void;
  copy?: unknown;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [rawMemberList, setRawMemberList] = useState<Member[]>([]);
  const [memberList, setMemberList] = useState<Member[]>([]);
  const [filterSearch, setFilterSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<TeamMemberStatus>(
    TeamMemberStatus.all,
  );
  const [editingMemberAlias, setEditingMemberAlias] = useState("");
  const [isUpdatingMemberAlias, setIsUpdatingMemberAlias] = useState(false);
  const [isEditingMemberAlias, setIsEditingMemberAlias] = useState(false);
  const [inviteDrawerOpen, setInviteDrawerOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [removeOpen, setRemoveOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [resendOpen, setResendOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const uuid = useAppSelector((state) => state.user.uuid);
  const email = useAppSelector((state) => state.user.email);
  const curTeam = useAppSelector((state) => state.user.currentTeam);
  const canEditBudget =
    curTeam?.role === TeamRole.admin ||
    curTeam?.role === TeamRole.owner ||
    curTeam?.role === TeamRole.billing;
  const canEditAlias =
    curTeam?.role === TeamRole.owner || curTeam?.role === TeamRole.admin;
  const [detailsOpenInfo, setDetailsOpenInfo] = useState<{
    open: boolean;
    member: Member | null;
  }>({
    open: false,
    member: null,
  });
  const [editBudget, setEditBudget] = useState<{
    open: boolean;
    budget: Budget | null;
  }>({
    open: false,
    budget: null as Budget | null,
  });
  const [readNewMember, setReadNewMember] = useState<string[]>([]);
  const [readNewMemberList, setReadNewMemberList] = useState<string[]>([]);
  // Use refs to store latest values for cleanup function
  const readNewMemberRef = useRef<string[]>([]);
  const readNewMemberListRef = useRef<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const tableWrapperRef = useRef<HTMLDivElement>(null);
  // Ref to track if filtering is triggered by data refresh (should preserve page)
  const isDataRefreshRef = useRef(false);
  // Ref to store the page to preserve during data refresh
  const preservedPageRef = useRef<number | null>(null);
  // Guard against concurrent/duplicate fetches without putting `loading` in
  // fillMemberList's dependency array (which would recreate the callback on
  // every toggle and re-trigger the mount effect — infinite refresh loop).
  const isFetchingRef = useRef(false);
  // Read volatile values inside fillMemberList via refs so the callback stays
  // stable and the mount effect runs exactly once.
  const currentPageRef = useRef(currentPage);
  const detailsOpenInfoRef = useRef(detailsOpenInfo);

  useEffect(() => {
    currentPageRef.current = currentPage;
  }, [currentPage]);
  useEffect(() => {
    detailsOpenInfoRef.current = detailsOpenInfo;
  }, [detailsOpenInfo]);
  // Fix table header sticky positioning by removing overflow from Table wrapper
  useEffect(() => {
    const updateTableOverflow = () => {
      if (tableWrapperRef.current) {
        const tableWrapper = tableWrapperRef.current.querySelector(
          'div[class*="scrollBar_container"]',
        ) as HTMLElement;
        if (tableWrapper) {
          tableWrapper.style.overflow = "visible";
        }
      }
    };
    updateTableOverflow();
    // Use MutationObserver to handle dynamic updates
    const observer = new MutationObserver(updateTableOverflow);
    if (tableWrapperRef.current) {
      observer.observe(tableWrapperRef.current, {
        childList: true,
        subtree: true,
      });
    }
    return () => observer.disconnect();
  }, [memberList, loading]);
  useEffect(() => {
    // Use sorted list to match what's actually displayed
    const sortedList = getSortedMemberList(
      memberList || [],
      readNewMemberList || [],
    );
    const currentMemberList = sortedList.slice(
      (currentPage - 1) * pageSize,
      currentPage * pageSize,
    );
    if (
      detailsOpenInfo.open &&
      detailsOpenInfo.member &&
      !currentMemberList.find((m) => m.memID === detailsOpenInfo.member?.memID)
    ) {
      setDetailsOpenInfo({ open: false, member: null });
    }
  }, [memberList, readNewMemberList, currentPage, pageSize, detailsOpenInfo]);
  const filterMemberList = useCallback(
    (
      search: string,
      status: TeamMemberStatus,
      preservePage: boolean = false,
      sourceList?: Member[],
    ) => {
      const listToFilter = sourceList || rawMemberList;
      const newList = listToFilter.filter((m) => {
        let matchSearch = true;
        let matchStatus = true;
        if (search !== "") {
          matchSearch = false;
          if (m.email.toLowerCase().includes(search.toLowerCase())) {
            matchSearch = true;
          }
          if (m.alias && m.alias.includes(search)) {
            matchSearch = true;
          }
        }
        if (status !== TeamMemberStatus.all) {
          matchStatus = false;
          if (m.status === status) {
            matchStatus = true;
          }
        }
        return matchSearch && matchStatus;
      });
      if (!preservePage) {
        setCurrentPage(1);
      } else {
        // If preserving page, use the preserved page or current page, and check if it's still valid
        const maxPage = Math.ceil(newList.length / pageSize) || 1;
        setCurrentPage((prevPage) => {
          const pageToUse =
            preservedPageRef.current !== null
              ? preservedPageRef.current
              : prevPage;
          const finalPage = pageToUse > maxPage ? maxPage : pageToUse;
          // Reset preserved page after using it
          preservedPageRef.current = null;
          return finalPage;
        });
      }
      setMemberList(newList);
    },
    [rawMemberList, pageSize],
  );
  const fillMemberList = useCallback(async () => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;
    setLoading(true);
    // Mark that this is a data refresh, so we should preserve page
    isDataRefreshRef.current = true;
    // Save current page to preserve it during data refresh
    preservedPageRef.current = currentPageRef.current;
    getMemberList()
      .then((list) => {
        setMemberCount(
          (list || []).filter(
            (m: Member) => m.status === TeamMemberStatus.active,
          ).length,
        );
        setLoading(false);
        // Update rawMemberList, which will trigger useEffect to filter with preserved page
        setRawMemberList(list);
        if (detailsOpenInfoRef.current.open) {
          const currentMember = list.find(
            (m) => m.memID === detailsOpenInfoRef.current.member?.memID,
          );
          setDetailsOpenInfo({
            open: currentMember ? true : false,
            member: currentMember || null,
          });
        }
        const parseJoinDate = (dateStr: string): Date | null => {
          if (!dateStr) return null;
          try {
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) {
              return null;
            }
            return date;
          } catch {
            return null;
          }
        };
        let readNewMemberListTmp: string[] = [];
        if (typeof window !== "undefined") {
          const stored = localStorage.getItem("readNewMember");
          readNewMemberListTmp = stored ? stored.split(",") : [];
        }
        // Update readNewMember ref with the value from localStorage
        readNewMemberRef.current = readNewMemberListTmp;
        console.log("readNewMemberListTmp:", readNewMemberListTmp);
        console.log("list", list);
        const cutoffDate = new Date("2026-01-01");
        const newActiveMembers = (list || [])
          .filter((m: Member) => {
            if (m.status !== TeamMemberStatus.active) return false;
            if (readNewMemberListTmp.includes(m.memID)) return false;
            const joinDate = parseJoinDate(m.joinDate);
            if (!joinDate) return false;
            return joinDate >= cutoffDate;
          })
          .map((m: Member) => m.memID);
        setReadNewMemberList(newActiveMembers || []);
        // Update readNewMemberList ref
        readNewMemberListRef.current = newActiveMembers || [];
      })
      .catch(() => {
        // message.error("Failed to retrieve team members");
        setLoading(false);
      })
      .finally(() => {
        isFetchingRef.current = false;
      });
  }, [setMemberCount]);
  // Initialize readNewMember from localStorage on client side
  // useEffect(() => {
  //   if (typeof window !== "undefined") {
  //     const stored = localStorage.getItem("readNewMember");
  //     setReadNewMember(stored ? stored.split(",") : []);
  //   }
  // }, []);
  useEffect(() => {
    fillMemberList();
  }, [fillMemberList]);
  // Sync refs with state changes
  useEffect(() => {
    readNewMemberRef.current = readNewMember;
  }, [readNewMember]);
  useEffect(() => {
    readNewMemberListRef.current = readNewMemberList;
  }, [readNewMemberList]);
  // Save to localStorage on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && localStorage) {
        // Use ref values to get the latest state
        const mergedList = Array.from(
          new Set([
            ...readNewMemberRef.current,
            ...readNewMemberListRef.current,
          ]),
        );
        if (mergedList.length > 0) {
          localStorage.setItem("readNewMember", mergedList.join(","));
        }
      }
    };
  }, []);
  useEffect(() => {
    // If this is triggered by data refresh, preserve page; otherwise reset to page 1
    const preservePage = isDataRefreshRef.current;
    if (isDataRefreshRef.current) {
      isDataRefreshRef.current = false; // Reset the flag
    }
    filterMemberList(filterSearch, filterStatus, preservePage);
  }, [filterSearch, filterStatus, filterMemberList]);
  const [budgetList, setBudgetList] = useState<Budget[]>([]);
  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getBudgetList();
      console.log("Budget API response:", response); // For debugging
      if (response && response.budgets) {
        const mappedData = mapBudgetData(response.budgets);
        setBudgetList(mappedData);
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
  return (
    <div
      className="flex flex-col"
      style={{
        width: "100%",
        minWidth: "0",
        overflowX: "hidden",
        overflowY: "hidden",
        maxHeight: "calc(100vh - 306px)",
      }}
    >
      <div
        className="flex flex-row flex-1"
        style={{ minHeight: 0, overflow: "hidden" }}
      >
        <div
          className="transition-all duration-300 ease-in-out flex flex-col"
          style={{
            width: detailsOpenInfo.open ? "calc(100% - 284px)" : "100%",
            minHeight: 0,
            overflow: "hidden",
          }}
        >
          <div className="flex gap-4 mb-4 justify-between flex-wrap items-center flex-shrink-0">
            <div className="flex flex-row items-center gap-3">
              <h6 className="font-h6 text-[var(--black)]">{"Members"}</h6>
              <div className="flex gap-2 items-center">
                <SearchInput
                  placeholder={"Search members..."}
                  className="w-60 h-8 border-[0.5px] border-[var(--gray-1)]"
                  debounceTime={50}
                  onSearch={(value) => {
                    setFilterSearch(value);
                    analytics.trackClick(
                      CLICK_BTN_IDs.SETTINGS.TEAM_SEARCH_MEMBERS,
                    );
                  }}
                />
                <Select
                  value={filterStatus}
                  onValueChange={(value) => {
                    setFilterStatus(value as TeamMemberStatus);
                    analytics.trackClick(
                      CLICK_BTN_IDs.SETTINGS.TEAM_SELECT_STATUS,
                      {
                        status: value,
                      },
                    );
                  }}
                >
                  <SelectTrigger className="w-40 h-8 border-[0.5px] border-[var(--gray-1)]">
                    {getStatusLabel(filterStatus, copy)}
                  </SelectTrigger>
                  <SelectContent>
                    {Object.values(TeamMemberStatus)
                      .filter((s) => s !== TeamMemberStatus.inviteCanceled)
                      .map((s) => (
                        <SelectItem value={s} key={s}>
                          {getStatusLabel(s, copy)}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  variant="text"
                  size="sl"
                  className="h-8 bg-white flex items-center gap-2 no-underline rounded-[6px]"
                  style={{ border: "0.5px solid var(--gray-1)" }}
                  onClick={fillMemberList}
                  disabled={loading}
                  id={CLICK_BTN_IDs.SETTINGS.TEAM_REFRESH}
                >
                  Refresh
                  <RefreshCw
                    size={14}
                    className={loading ? "animate-spin" : ""}
                  />
                </Button>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                size="default"
                className="py-1 px-3 h-8 border-[var(--gray-2)] text-[var(--black)] cursor-pointer font-[var(--font-miletus)] font-subtle"
                onClick={() => router.push(NOVITA_URL.BILLING_BUDGETS)}
              >
                Go to Budgets
              </Button>
              {/* Only show Invite Members button for admin, owner, and billing roles */}
              {(curTeam?.role === TeamRole.admin ||
                curTeam?.role === TeamRole.owner) && (
                <Button
                  variant="default"
                  className="h-8"
                  onClick={() => setInviteDrawerOpen(true)}
                >
                  <span className="flex items-center font-subtle text-white">
                    <Plus size={16} className="mr-2" />
                    {"Invite Members"}
                  </span>
                </Button>
              )}
            </div>
          </div>
          <div
            className="flex flex-col flex-1"
            style={{ minHeight: 0, overflow: "hidden" }}
          >
            <div
              className="flex-1 flex flex-col overflow-hidden"
              style={{
                minHeight: 0,
                maxHeight: "100%",
              }}
            >
              <div
                ref={tableWrapperRef}
                className="flex-1 overflow-hidden flex flex-col"
                style={{
                  position: "relative",
                  minHeight: 0,
                }}
              >
                <div
                  className="flex-1 overflow-hidden flex flex-col"
                  style={{
                    minHeight: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    className="flex-1 overflow-y-auto overflow-x-auto"
                    style={{
                      minHeight: 0,
                      position: "relative",
                    }}
                  >
                    {loading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-20">
                        <div
                          className="iconfont icon-loader inline-block animate-spin"
                          style={{
                            fontSize: 24,
                            color: "var(--dark-3)",
                            animationDuration: "1.6s",
                          }}
                        ></div>
                      </div>
                    )}
                    <table
                      style={{
                        minWidth: "750px",
                        width: "100%",
                        tableLayout: "fixed",
                      }}
                    >
                      <TableHeader
                        className="sticky top-0 z-10"
                        style={{
                          position: "sticky",
                          top: 0,
                          backgroundColor: "white",
                          zIndex: 10,
                        }}
                      >
                        <TableRow>
                          <TableHead className="w-[200px] min-w-[200px]">
                            {"Member"}
                          </TableHead>
                          <TableHead className="w-[70px] min-w-[70px]">
                            {"Role"}
                          </TableHead>
                          <TableHead className="w-[70px] min-w-[70px]">
                            {"Status"}
                          </TableHead>
                          <TableHead className="w-[100px] min-w-[100px]">
                            <div className="flex flex-row items-center gap-[2px]">
                              <span>Budget</span>
                              <Tooltip
                                title={
                                  'Change the budget on the "Budgets" page after invitees join your team.'
                                }
                              >
                                <Info
                                  size={12}
                                  className="text-[var(--black)] cursor-pointer"
                                />
                              </Tooltip>
                            </div>
                          </TableHead>
                          <TableHead className="w-[90px] min-w-[90px]">
                            {"Join Date"}
                          </TableHead>
                          <TableHead className="w-[80px] min-w-[80px]">
                            <div className="flex flex-row items-center justify-end">
                              {"Operation"}
                            </div>
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {getSortedMemberList(
                          memberList || [],
                          readNewMemberList || [],
                        )
                          .slice(
                            (currentPage - 1) * pageSize,
                            currentPage * pageSize,
                          )
                          .map((m, index) => (
                            <TableRow key={m.memID}>
                              <TableCell className="flex flex-col justify-center w-[200px] min-w-[200px]">
                                <div className="truncate flex flex-row items-center gap-1">
                                  {readNewMemberList.includes(m.memID) && (
                                    <span className="h-[5px] w-[5px] bg-[var(--brand-0)] rounded-full inline-block"></span>
                                  )}
                                  <span
                                    className={`font-subtle-demibold ${m.status === TeamMemberStatus.invitePending ? "text-[var(--dark-3)]" : "text-[var(--black)]"}`}
                                    style={{
                                      fontWeight: 400,
                                    }}
                                  >
                                    {m.alias || "-"}
                                  </span>
                                </div>
                                <div className="flex flex-row items-center gap-2">
                                  <span
                                    className={`font-small truncate ${m.status === TeamMemberStatus.invitePending ? "text-[var(--dark-3)]" : "text-[var(--dark-2)]"}`}
                                  >
                                    {m.email}
                                  </span>
                                  {m.role === TeamRole.owner && (
                                    <span className="border rounded-[4px] px-[4px] py-[2px] bg-[var(--gray-3)] font-small-console-medium text-[var(--black)] inline-block align-middle leading-tight">
                                      {"Owner"}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell
                                className={`truncate w-[70px] min-w-[70px] ${m.status === TeamMemberStatus.invitePending ? "!text-[var(--dark-3)]" : getRoleColor(m.role)}`}
                              >
                                {getRoleLabel(m.role, copy)}
                              </TableCell>
                              <TableCell
                                className={`truncate w-[70px] min-w-[70px] ${m.status === TeamMemberStatus.invitePending ? "!text-[var(--dark-3)]" : "text-[var(--black)]"}`}
                              >
                                {getStatusLabel(m.status, copy)}
                              </TableCell>
                              <TableCell
                                className={`truncate w-[100px] min-w-[100px] ${m.status === TeamMemberStatus.invitePending ? "!text-[var(--dark-3)]" : "text-[var(--black)]"}`}
                              >
                                {m.budgetType === "Unlimited"
                                  ? "Unlimited"
                                  : m.budgetType === "One-time"
                                    ? `${formatBudgetLimit(m.budgetLimit)} (One-time)`
                                    : formatBudgetLimit(m.budgetLimit)}
                              </TableCell>
                              <TableCell
                                className={`truncate w-[90px] min-w-[90px] ${m.status === TeamMemberStatus.invitePending ? "!text-[var(--dark-3)]" : "text-[var(--black)]"}`}
                              >
                                {m.joinDate}
                              </TableCell>
                              <TableCell className="h-[57px] w-[80px] min-w-[80px]">
                                <div className="flex flex-row items-center justify-end">
                                  {m.role !== TeamRole.owner &&
                                    m.uuid !== uuid &&
                                    m.status !== TeamMemberStatus.leftTeam && (
                                      <DropdownMenu
                                        onOpenChange={() => {
                                          setMemberList((prev) => {
                                            const newList = [...prev];
                                            newList[index].emailSent = false;
                                            newList[index].sendingEmail = false;
                                            return newList;
                                          });
                                        }}
                                      >
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="text" size="icon">
                                            <Ellipsis size={16} />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent>
                                          {m.status ===
                                            TeamMemberStatus.active && (
                                            <DropdownMenuItem
                                              onSelect={() => {
                                                setTimeout(() => {
                                                  setEditingMember(m);
                                                  setEditOpen(true);
                                                  analytics.trackClick(
                                                    CLICK_BTN_IDs.SETTINGS
                                                      .TEAM_MEMBER_EDIT,
                                                  );
                                                }, 0);
                                              }}
                                            >
                                              {"Edit"}
                                            </DropdownMenuItem>
                                          )}
                                          {m.status ===
                                            TeamMemberStatus.invitePending &&
                                            m.inviteLink && (
                                              <DropdownMenuItem
                                                onSelect={() => {
                                                  navigator.clipboard.writeText(
                                                    m.inviteLink,
                                                  );
                                                  message.success(
                                                    "Invite link copied",
                                                  );
                                                  analytics.trackClick(
                                                    CLICK_BTN_IDs.SETTINGS
                                                      .TEAM_MEMBER_COPY_INVITE_LINK,
                                                  );
                                                }}
                                              >
                                                {"Copy Invite Link"}
                                              </DropdownMenuItem>
                                            )}
                                          {(m.status ===
                                            TeamMemberStatus.inviteExpired ||
                                            m.status ===
                                              TeamMemberStatus.inviteCanceled ||
                                            m.status ===
                                              TeamMemberStatus.invitePending) && (
                                            <DropdownMenuItem
                                              onSelect={(e) => {
                                                if (
                                                  m.status ===
                                                  TeamMemberStatus.invitePending
                                                ) {
                                                  setTimeout(() => {
                                                    setEditingMember(m);
                                                    setResendOpen(true);
                                                    analytics.trackClick(
                                                      CLICK_BTN_IDs.SETTINGS
                                                        .TEAM_MEMBER_RESEND_EMAIL,
                                                    );
                                                  }, 0);
                                                  return;
                                                }
                                                e.preventDefault();
                                                setMemberList((prev) => {
                                                  const newList = [...prev];
                                                  newList[index].sendingEmail =
                                                    true;
                                                  return newList;
                                                });
                                                resendInvite(m.inviteID)
                                                  .then((res) => {
                                                    setMemberList((prev) => {
                                                      const newList = [...prev];
                                                      newList[index].emailSent =
                                                        true;
                                                      return newList;
                                                    });
                                                    if (res.invite_url) {
                                                      navigator.clipboard.writeText(
                                                        res.invite_url,
                                                      );
                                                    }
                                                    message.success(
                                                      "Invitation email sent successfully!",
                                                    );
                                                    fillMemberList();
                                                  })
                                                  .catch(() => {
                                                    message.error(
                                                      "Failed to resend invitation",
                                                    );
                                                  })
                                                  .finally(() => {
                                                    setMemberList((prev) => {
                                                      const newList = [...prev];
                                                      newList[
                                                        index
                                                      ].sendingEmail = false;
                                                      return newList;
                                                    });
                                                  });
                                              }}
                                            >
                                              {"Resend Email"}
                                              {m.sendingEmail && (
                                                <Loader2
                                                  size={14}
                                                  className="ml-2 animate-spin"
                                                />
                                              )}
                                              {m.emailSent && (
                                                <Check
                                                  size={14}
                                                  className="ml-2 text-green-500"
                                                />
                                              )}
                                            </DropdownMenuItem>
                                          )}
                                          {m.status ===
                                            TeamMemberStatus.invitePending && (
                                            <DropdownMenuItem
                                              onSelect={() => {
                                                setTimeout(() => {
                                                  setEditingMember(m);
                                                  setCancelOpen(true);
                                                  analytics.trackClick(
                                                    CLICK_BTN_IDs.SETTINGS
                                                      .TEAM_MEMBER_CANCEL_INVITE,
                                                  );
                                                }, 0);
                                              }}
                                            >
                                              {"Cancel Invitation"}
                                            </DropdownMenuItem>
                                          )}
                                          {m.status ===
                                            TeamMemberStatus.active && (
                                            <DropdownMenuItem
                                              onSelect={() => {
                                                setTimeout(() => {
                                                  setEditingMember(m);
                                                  setRemoveOpen(true);
                                                  analytics.trackClick(
                                                    CLICK_BTN_IDs.SETTINGS
                                                      .TEAM_MEMBER_REMOVE,
                                                  );
                                                }, 0);
                                              }}
                                            >
                                              {"Remove"}
                                            </DropdownMenuItem>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    )}
                                  {filterStatus !==
                                    TeamMemberStatus.invitePending &&
                                    (m.status ===
                                    TeamMemberStatus.invitePending ? (
                                      <ChevronRight
                                        className="text-[var(--dark-4)] cursor-not-allowed"
                                        size={16}
                                      />
                                    ) : (
                                      <ChevronRight
                                        onClick={() => {
                                          setDetailsOpenInfo({
                                            open: true,
                                            member: m as Member,
                                          });
                                        }}
                                        className="text-[var(--black)] cursor-pointer"
                                        size={16}
                                      />
                                    ))}
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </table>
                  </div>
                </div>
              </div>
              {!loading && memberList.length !== 0 && (
                <StandardPagination
                  className="mt-8 flex-shrink-0"
                  total={memberList.length}
                  pageSize={pageSize}
                  defaultCurrent={currentPage}
                  onChange={(page) => setCurrentPage(page)}
                />
              )}
            </div>
          </div>
        </div>
        {detailsOpenInfo.open && (
          <div
            className="overflow-hidden transition-all ml-[20px] duration-300 ease-in-out max-w-[254px] opacity-100 flex flex-col"
            style={{
              borderLeft: "1px solid var(--gray-2)",
              alignSelf: "stretch",
              overflowY: "hidden",
            }}
          >
            <div
              className="w-[254px] py-4 px-3 flex flex-col gap-4 transition-all duration-300 ease-in-out"
              style={{
                transform: "translateX(0)",
              }}
            >
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="font-body-medium text-[var(--dark-1)]">
                  {detailsOpenInfo.member?.alias || "-"}
                </span>
                <X
                  className="text-[var(--dark-1)] hover:text-[var(--gray-2)] cursor-pointer"
                  size={20}
                  onClick={() => {
                    setDetailsOpenInfo({ open: false, member: null });
                    setIsEditingMemberAlias(false);
                    setEditingMemberAlias("");
                  }}
                />
              </div>
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="font-subtle text-[var(--dark-2)]">
                  {"Alias"}
                </span>
                <span className="flex flex-row items-center gap-2">
                  {isEditingMemberAlias ? (
                    <div className="flex gap-2 items-center">
                      <Input
                        type="text"
                        className="h-9 w-[80px]"
                        value={editingMemberAlias}
                        maxLength={15}
                        onChange={(e) => {
                          setEditingMemberAlias(e.target.value);
                        }}
                      />
                      <Button
                        variant="secondary"
                        disabled={isUpdatingMemberAlias}
                        size="sm"
                        onClick={async () => {
                          analytics.trackClick(
                            CLICK_BTN_IDs.SETTINGS.TEAM_EDIT_MEMBER_ALIAS_SAVE,
                          );
                          try {
                            setIsUpdatingMemberAlias(true);
                            await editMemberAlias(
                              detailsOpenInfo.member?.memID || "",
                              editingMemberAlias,
                            );
                            fillMemberList();
                            setIsUpdatingMemberAlias(false);
                            setIsEditingMemberAlias(false);
                          } catch (error) {
                            message.error("Failed to update alias");
                            setIsUpdatingMemberAlias(false);
                            setIsEditingMemberAlias(false);
                          }
                        }}
                      >
                        {isUpdatingMemberAlias ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Check size={14} />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setIsEditingMemberAlias(false);
                          analytics.trackClick(
                            CLICK_BTN_IDs.SETTINGS
                              .TEAM_EDIT_MEMBER_ALIAS_CANCEL,
                          );
                        }}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <span className="font-subtle-demibold max-w-[190px] break-words text-[var(--dark-2)]">
                        {detailsOpenInfo.member?.alias || "-"}
                      </span>
                      {(canEditAlias ||
                        detailsOpenInfo?.member?.email === email) &&
                        detailsOpenInfo?.member?.status !==
                          TeamMemberStatus.inviteCanceled &&
                        detailsOpenInfo?.member?.status !==
                          TeamMemberStatus.inviteExpired && (
                          <PencilLine
                            className="text-[var(--black)] hover:text-[var(--dark-2)] cursor-pointer"
                            size={16}
                            onClick={() => {
                              setIsEditingMemberAlias(true);
                              setEditingMemberAlias(
                                detailsOpenInfo.member?.alias || "",
                              );
                            }}
                          />
                        )}
                    </>
                  )}
                </span>
              </div>
              <div className="h-[1px] w-full bg-[var(--gray-2)]"></div>
              <div className="flex flex-row items-center justify-between gap-2">
                <span className="font-subtle text-[var(--dark-2)]">
                  {"Role"}
                </span>
                <span
                  className={`font-subtle-demibold  ${getRoleColor(detailsOpenInfo.member?.role || TeamRole.basic)}`}
                  style={{
                    fontWeight: 400,
                  }}
                >
                  {getRoleLabel(
                    detailsOpenInfo.member?.role || TeamRole.basic,
                    copy,
                  )}
                </span>
              </div>
              <div className="h-[1px] w-full bg-[var(--gray-2)]"></div>
              <div>
                <div className="font-subtle text-[var(--dark-2)] mb-2">
                  Email
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <span
                    className="font-subtle-medium max-w-[190px] break-words text-[var(--black)]"
                    style={{
                      fontWeight: 400,
                    }}
                  >
                    {detailsOpenInfo.member?.email || "-"}
                  </span>
                  <CopyBtn
                    onCopySuccess={() => message.success("Email copied")}
                    content={detailsOpenInfo.member?.email || ""}
                    size={16}
                    className="h-4 !text-[var(--dark-2)]"
                  />
                  {/* <Copy className="text-[var(--dark-1)] cursor-pointer" size={16}
        onClick={() => {
          navigator.clipboard.writeText(detailsOpenInfo.member?.email || "");
          message.success("Email copied");
        }} /> */}
                </div>
              </div>
              <div className="h-[1px] w-full bg-[var(--gray-2)]"></div>
              <div>
                <div className="font-subtle text-[var(--dark-2)] mb-2">
                  Member ID
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <div
                    title={detailsOpenInfo.member?.memID || "-"}
                    className="font-subtle-medium max-w-[190px] break-words text-[var(--black)]"
                    style={{
                      fontWeight: 400,
                    }}
                  >
                    {detailsOpenInfo.member?.memID || "-"}
                  </div>
                  <CopyBtn
                    onCopySuccess={() => message.success("Member ID copied")}
                    content={detailsOpenInfo.member?.memID || ""}
                    size={16}
                    className="h-4 !text-[var(--dark-2)]"
                  />
                  {/* <Copy className="text-[var(--dark-1)] cursor-pointer" size={16}
        onClick={() => {
          navigator.clipboard.writeText(detailsOpenInfo.member?.memID || "");
          message.success("Member ID copied");
          }} /> */}
                </div>
              </div>
              <div className="h-[1px] w-full bg-[var(--gray-2)]"></div>
              <div>
                <div className="font-subtle text-[var(--dark-2)] mb-2">
                  Budget
                </div>
                <div className="flex flex-row items-center justify-between gap-2">
                  <span
                    title={detailsOpenInfo.member?.memID || "-"}
                    className="font-subtle-medium max-w-[190px] truncate text-[var(--black)]"
                    style={{
                      fontWeight: 400,
                    }}
                  >
                    {detailsOpenInfo.member?.budgetType === "Unlimited"
                      ? "Unlimited"
                      : detailsOpenInfo.member?.budgetType === "One-time"
                        ? `${formatBudgetLimit(detailsOpenInfo.member?.budgetLimit)} (One-time)`
                        : formatBudgetLimit(
                            detailsOpenInfo.member?.budgetLimit || 0,
                          )}
                  </span>
                  {[
                    TeamMemberStatus.active,
                    TeamMemberStatus.invitePending,
                  ].includes(
                    detailsOpenInfo.member?.status || TeamMemberStatus.leftTeam,
                  ) &&
                    (currentTeam?.role === TeamRole.admin ||
                      currentTeam?.role === TeamRole.owner ||
                      currentTeam?.role === TeamRole.billing) && (
                      <PencilLine
                        className="text-[var(--black)] hover:text-[var(--dark-2)] cursor-pointer"
                        size={16}
                        onClick={() => {
                          setEditBudget({
                            open: true,
                            budget:
                              budgetList.find(
                                (b) => b.id === detailsOpenInfo.member?.memID,
                              ) || null,
                          });
                        }}
                      />
                    )}
                </div>
              </div>
              <div className="h-[1px] w-full bg-[var(--gray-2)]"></div>
            </div>
          </div>
        )}
      </div>
      {canEditBudget && (
        <BudgetEditModal
          isOpen={editBudget.open}
          onClose={() =>
            setEditBudget({ open: false, budget: editBudget.budget })
          }
          memberData={
            editBudget.budget
              ? {
                  id: editBudget.budget.id,
                  name: editBudget.budget.member,
                  phone: editBudget.budget.phone,
                  budget: editBudget.budget.budgetLimit,
                  budget_type: editBudget.budget.budgetType,
                }
              : null
          }
          onSave={async (data) => {
            const budgetLimit =
              data.budgetType === BUDGET_TYPES.UNLIMITED
                ? 0
                : Math.round(data.budgetAmount);
            await updateMemberBudget(
              editBudget.budget?.id || "",
              data.budgetType,
              budgetLimit,
              data.budgetType === "Recurring" ? "Monthly" : "",
            );
            fetchBudgets();
            fillMemberList();
          }}
        />
      )}
      <Sheet open={inviteDrawerOpen} onOpenChange={setInviteDrawerOpen}>
        <SheetContent
          side="right"
          className="w-full max-w-full overflow-hidden p-0 sm:max-w-[658px]"
          showCloseButton={false}
          onInteractOutside={(event) => event.preventDefault()}
        >
          <SheetTitle className="sr-only">Invite team member</SheetTitle>
          <Invite
            allMembers={memberList}
            copy={copy}
            onClose={() => setInviteDrawerOpen(false)}
            onSuccess={fillMemberList}
          />
        </SheetContent>
      </Sheet>
      <Edit
        copy={copy}
        open={editOpen}
        memID={editingMember?.memID || ""}
        oriRole={editingMember?.role || TeamRole.basic}
        onOpenChange={(open) => setEditOpen(open)}
        onSuccess={fillMemberList}
      />
      <Remove
        copy={copy}
        open={removeOpen}
        memID={editingMember?.memID || ""}
        onOpenChange={(open) => setRemoveOpen(open)}
        onSuccess={fillMemberList}
      />
      <Resend
        copy={copy}
        open={resendOpen}
        inviteID={editingMember?.inviteID || ""}
        onOpenChange={(open) => setResendOpen(open)}
        onSuccess={fillMemberList}
      />
      <Cancel
        copy={copy}
        open={cancelOpen}
        inviteID={editingMember?.inviteID || ""}
        onOpenChange={(open) => setCancelOpen(open)}
        onSuccess={fillMemberList}
      />
    </div>
  );
}

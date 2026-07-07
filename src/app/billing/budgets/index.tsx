"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Users } from "lucide-react";
import { SearchInput } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import BudgetsTable, { type BudgetsTableRef } from "./components/BudgetsTable";
import TeamMemberInfo from "./components/TeamMemberInfo";
import PermissionWrapper from "@/app/components/Permission/PermissionWrapper";
import { RolePermission } from "@/app/components/Permission";
import { PERMISSION } from "@/constants/constants";
import { useAppSelector } from "@/store";
import { TeamRole } from "@/store/slice/userSlice";
import Link from "next/link";
import styles from "./budgets.module.scss";

export default function BudgetsPage() {
  const [searchValue, setSearchValue] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerTopOffset, setDrawerTopOffset] = useState(0);
  const budgetsTableRef = useRef<BudgetsTableRef>(null);

  const currentTeam = useAppSelector((state) => state.user.currentTeam);

  // Calculate drawer position based on notice bar height
  useEffect(() => {
    const calculateOffset = () => {
      const noticeBar = document.querySelector("[data-notice-bar]");
      const headerHeight = 54; // console header height
      const noticeHeight = noticeBar
        ? noticeBar.getBoundingClientRect().height
        : 0;
      setDrawerTopOffset(headerHeight + noticeHeight);
    };

    calculateOffset();
    window.addEventListener("resize", calculateOffset);

    // Observer for notice bar changes
    const observer = new MutationObserver(calculateOffset);
    const body = document.body;
    observer.observe(body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", calculateOffset);
      observer.disconnect();
    };
  }, []);

  const handleSearch = (value: string) => {
    setSearchValue(value);
  };

  const handleRefresh = () => {
    budgetsTableRef.current?.refresh();
  };

  // If not a team account, show fallback page
  if (!currentTeam) {
    return (
      <div className="console-card flex flex-col items-center justify-center h-screen">
        <div className="text-center">
          <div className="mb-6">
            <img
              src="/team.png"
              alt="Team Account Required"
              className="w-32 h-32 mx-auto object-contain"
            />
          </div>
          <div className="text-base text-[var(--dark-1)] mb-4 whitespace-nowrap">
            This feature is only available for team accounts. Please join or
            create a team to use it.
          </div>
          <Link
            href="/settings/team"
            className="text-[var(--brand-1)] underline text-sm font-normal hover:opacity-80"
          >
            Upgrade To Team Account
          </Link>
        </div>
      </div>
    );
  }

  return (
    <PermissionWrapper
      resourceGroup={PERMISSION.RESOURCE_GROUP.billing}
      resource={PERMISSION.RESOURCE.budget}
      action={PERMISSION.ACTION.read}
    >
      <div className="flex flex-col gap-5 pb-4">
        <div
          className={`console-card min-h-screen ${styles.budgets_container}`}
        >
          <div className="flex flex-col h-full">
            {/* Top section with title, team info button, search and refresh */}
            <div className="flex gap-4 justify-between items-center mb-6">
              <div className="flex items-center gap-4">
                <h6 className="font-tt-interfaces font-semibold text-lg leading-6 text-[var(--dark-1)]">
                  {currentTeam?.role === TeamRole.developer
                    ? "My Budget"
                    : "Members"}
                </h6>

                {/* Team Info Button - only for admin, owner, billing roles */}
                <RolePermission
                  roles={[TeamRole.admin, TeamRole.owner, TeamRole.billing]}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 px-3 bg-white border border-[var(--gray-2)] flex items-center gap-2 rounded-[6px] text-[var(--dark-2)] hover:text-[var(--dark-1)] hover:border-[var(--gray-1)]"
                    onClick={() => setIsDrawerOpen(true)}
                  >
                    <Users size={14} />
                    Team Info
                  </Button>
                </RolePermission>
              </div>

              <div className="flex gap-4 items-center">
                {/* Hide search functionality for developer role */}
                <RolePermission
                  roles={[
                    TeamRole.admin,
                    TeamRole.owner,
                    TeamRole.billing,
                    TeamRole.basic,
                  ]}
                >
                  <SearchInput
                    placeholder="Search Member"
                    className="w-60 h-8 rounded-[6px]"
                    debounceTime={300}
                    onSearch={handleSearch}
                  />
                </RolePermission>
                <Button
                  variant="text"
                  size="sl"
                  className="h-8 bg-white border border-[var(--gray-2)] flex items-center gap-2 no-underline rounded-[6px]"
                  onClick={handleRefresh}
                >
                  Refresh
                  <RefreshCw size={14} />
                </Button>
              </div>
            </div>

            {/* Table - full width */}
            <div className="flex-1">
              <BudgetsTable ref={budgetsTableRef} searchValue={searchValue} />
            </div>
          </div>
        </div>
      </div>

      {/* Team Info Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent
          side="right"
          className="w-[360px] p-0"
          style={{
            top: `${drawerTopOffset}px`,
            height: `calc(100vh - ${drawerTopOffset}px)`,
          }}
        >
          <SheetHeader className="px-6 py-4 border-b border-[var(--gray-2)]">
            <SheetTitle className="text-left text-lg font-semibold text-[var(--dark-1)]">
              Team Member Budgets
            </SheetTitle>
          </SheetHeader>
          <div className="p-6 overflow-y-auto h-[calc(100%-60px)]">
            <TeamMemberInfo />
          </div>
        </SheetContent>
      </Sheet>
    </PermissionWrapper>
  );
}

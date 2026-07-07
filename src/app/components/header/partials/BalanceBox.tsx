"use client";

import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { NOVITA_URL } from "@/constants/urls";
import analytics from "../../analytics/analytics";
import { CLICK_BTN_IDs } from "../../analytics/constants";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import commonStyles from "../Header.module.scss";
import styles from "./BalanceBox.module.scss";
import { useVoucherModal } from "@/hooks/useVoucherModal";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

const { HEADER_LINK_IDs } = CLICK_BTN_IDs;

export default function BalanceBox({
  balance,
  balanceStatus,
}: {
  balance: string | number;
  balanceStatus: null | "success" | "error";
}) {
  const { locale } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const balancePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.balance,
    action: PERMISSION.ACTION.read,
  });

  const { handleVoucherModalOpen, InjectModalElement, voucherNum } =
    useVoucherModal();

  if (!balancePermission) return null;

  return (
    <div className="flex items-center">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center text-ellipsis cursor-pointer border-solid border-[1px] border-[var(--gray-2)] rounded-sm px-[8px] py-[6px] font-subtle whitespace-nowrap font-subtle text-[var(--dark-1)]">
            <Gift size={16} className="mr-2" />
            <span className="mr-1">Credits Remaining:</span>
            {balanceStatus === "success" ? (
              <span className="font-subtle-medium mr-2 text-[var(--brand-1)]">
                ${String(balance)}
              </span>
            ) : (
              <Skeleton className="h-5 w-[50px] rounded-sm mr-1" />
            )}
            <ChevronDown size={16} />
          </div>
        </PopoverTrigger>
        <PopoverContent
          className="w-[270px] p-2 pb-0 overflow-hidden z-1000"
          align="end"
        >
          <div className={cn(commonStyles.header_dropdown, "pb-4 pt-2")}>
            <p className={styles.module_title}>Account Balance</p>

            <Link
              href={getLocalizedPath(NOVITA_URL.BILLING_OVERVIEW, locale)}
              className={cn(commonStyles.dropdown_item, styles.nav_item)}
              id={HEADER_LINK_IDs.USERBOX_BALANCE}
            >
              <span>Available Credit</span>
              <div className="flex items-center gap-[6px]">
                <span className="font-subtle-medium -mt-[2px] text-[var(--brand-0)]">
                  ${String(balance)}
                </span>
                <ChevronRight size={14} />
              </div>
            </Link>

            <Link
              href={getLocalizedPath(NOVITA_URL.VOUCHER, locale)}
              className={cn(commonStyles.dropdown_item, styles.nav_item)}
              id={HEADER_LINK_IDs.USERBOX_VOUCHER}
              onClick={(e) => {
                e.preventDefault();
                handleVoucherModalOpen();
                analytics.trackClick(HEADER_LINK_IDs.USERBOX_VOUCHER);
              }}
            >
              <span>Vouchers</span>
              <div className="flex items-center gap-[6px]">
                <span className="font-subtle-medium -mt-[2px]">
                  {voucherNum?.num || 0}
                </span>
                <ChevronRight size={14} />
              </div>
            </Link>

            <Button
              asChild
              variant="secondary"
              className="h-7 mx-2 mt-3"
              size="sl"
            >
              <Link
                href={getLocalizedPath(NOVITA_URL.BILLING_OVERVIEW, locale)}
              >
                Top Up
              </Link>
            </Button>

            <Link
              href={getLocalizedPath(NOVITA_URL.BILLING_DETAILS, locale)}
              className={`flex flex-row justify-between items-center ${styles.go_link}`}
            >
              <span>Go to Billing</span>
              <span className="iconfont icon-right-arrow ml-2"></span>
            </Link>
          </div>
        </PopoverContent>
      </Popover>
      {InjectModalElement}
    </div>
  );
}

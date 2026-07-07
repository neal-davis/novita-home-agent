"use client";
import Link from "next/link";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { message } from "@/components/ui/standard/notify";
import CopyToClipboard from "react-copy-to-clipboard";
import styles from "../Header.module.scss";
import { getSanitizedUserId } from "@/lib/utils/user";
import { CLICK_BTN_IDs } from "../../analytics/constants";
import { NOVITA_URL } from "@/constants/urls";
import Avatar from "./Avatar";
import { useAppSelector } from "@/store";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { ChevronRight, Copy } from "lucide-react";
import { usePermission } from "@/lib/hooks/usePermission";
import { PERMISSION } from "@/constants/constants";
import { getLocalizedPath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
const { HEADER_LINK_IDs } = CLICK_BTN_IDs;
const createLinkMenuItems = (
  locale: Locale,
): Record<
  string,
  {
    key: string;
    label: ReactNode;
  }
> => ({
  manageAPIKey: {
    key: "keys",
    label: (
      <Link
        href={getLocalizedPath(NOVITA_URL.KEYS, locale)}
        className={styles.dropdown_item}
        id={HEADER_LINK_IDs.USERBOX_KEYS}
      >
        <div>{"API Keys"}</div>
      </Link>
    ),
  },
  billing: {
    key: "billing",
    label: (
      <Link
        href={getLocalizedPath(NOVITA_URL.BILLING_OVERVIEW, locale)}
        className={styles.dropdown_item}
        id={HEADER_LINK_IDs.USERBOX_BILLING}
      >
        <div>{"Billing"}</div>
      </Link>
    ),
  },
  settings: {
    key: "settings",
    label: (
      <Link
        href={getLocalizedPath(NOVITA_URL.SETTINGS, locale)}
        className={styles.dropdown_item}
        id={HEADER_LINK_IDs.USERBOX_SETTINGS}
      >
        <div>Account Settings</div>
      </Link>
    ),
  },
  quotaLimits: {
    key: "quota limits",
    label: (
      <Link
        href={getLocalizedPath(NOVITA_URL.QUOTA_LIMITS, locale)}
        className={styles.dropdown_item}
        id={HEADER_LINK_IDs.USERBOX_QUOTA_LIMITS}
      >
        <div>Quotas & Limits</div>
      </Link>
    ),
  },
  enterprise: {
    key: "dedicated endpoints",
    label: (
      <Link
        href={getLocalizedPath(NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE, locale)}
        className={styles.dropdown_item}
        id={HEADER_LINK_IDs.USERBOX_ENTERPRISE}
      >
        <div>{"Dedicated Endpoints"}</div>
      </Link>
    ),
  },
});
export default function UserInfoBox({
  style,
  balance,
  enterprise,
  uuid,
  email,
  page,
  username,
  logout,
  isMobile,
}: {
  style?: React.CSSProperties;
  balance: string | number;
  enterprise: boolean;
  username: string;
  uuid: string;
  email: string;
  page?: "playground" | "console";
  logout: () => void;
  isMobile?: boolean;
}) {
  const { locale } = useI18n();
  const linkMenuItem = useMemo(() => {
    return createLinkMenuItems(locale);
  }, [locale]);
  const routerItem: {
    key: string;
    label: ReactNode;
  }[] = useMemo(() => {
    const items = [
      linkMenuItem.settings,
      linkMenuItem.manageAPIKey,
      linkMenuItem.quotaLimits,
    ];
    return items;
  }, [linkMenuItem]);
  const balancePermission = usePermission({
    resource_group: PERMISSION.RESOURCE_GROUP.billing,
    resource: PERMISSION.RESOURCE.balance,
    action: PERMISSION.ACTION.read,
  });
  const currentTeam = useAppSelector((state) => state.user.currentTeam);
  const [isOpen, setIsOpen] = useState(false);
  const items: {
    key: string;
    label: ReactNode;
  }[] = [
    {
      key: "userinfo",
      label: (
        <div
          className={styles.drop_user_box}
          id={HEADER_LINK_IDs.USERBOX_COPY_UUID}
        >
          <div
            className={`${styles.username_wrap} flex items-center gap-[8px] mb-[4px] font-subtle-medium whitespace-nowrap`}
          >
            <span className={`${styles.username}`}>{email}</span>
            <CopyToClipboard
              text={email}
              onCopy={() => {
                message.success("Email copied");
              }}
            >
              <Copy
                className="shrink-0 cursor-pointer hover:text-[var(--brand-0)] mr-1"
                size={12}
              />
            </CopyToClipboard>
            {currentTeam && (
              <span className="px-2 bg-[var(--gray-3)] rounded-sm font-small-console ml-[auto]">
                {currentTeam.role}
              </span>
            )}
          </div>
          <div
            className={`${styles.uid} flex items-center gap-[8px] font-small-console`}
          >
            <span className={`${styles.uid_label} text-[var(--dark-3)]`}>
              {"User ID"}
              :&nbsp;
            </span>
            <span className={`${styles.uid_uid} text-[var(--dark-3)]`}>
              {getSanitizedUserId(uuid)}
            </span>
            <CopyToClipboard
              text={uuid}
              onCopy={() => {
                message.success("User ID copied");
              }}
            >
              <Copy
                className="shrink-0 cursor-pointer hover:text-[var(--brand-0)]"
                size={12}
              />
            </CopyToClipboard>
          </div>
        </div>
      ),
    },
    {
      key: "home",
      label: (
        <div className="border-b border-[var(--gray-2)] my-1">
          <Link
            href={getLocalizedPath(NOVITA_URL.CONSOLE, locale)}
            className={styles.dropdown_item}
          >
            Home
          </Link>
        </div>
      ),
    },
    ...routerItem,
    {
      key: "logout",
      label: (
        <Link
          href="#"
          className={styles.dropdown_item}
          onClick={logout}
          id={HEADER_LINK_IDs.USERBOX_LOGOUT}
        >
          <span>{"Log Out"}</span>
        </Link>
      ),
    },
  ];
  useEffect(() => {
    try {
      if (window.__reporter__) {
        window.__reporter__.identify({
          email,
          uuid,
        });
      }
    } catch (error) {
      console.error(error);
    }
  }, [email, uuid]);
  if (isMobile) {
    return (
      <div className="flex flex-col items-stretch gap-8">
        <div className="cursor-pointer flex items-center gap-4">
          <Avatar size={32} />
          {isMobile && <span className="font-body">{username}</span>}
        </div>
        {balancePermission && (
          <div className={`border-t border-b border-[var(--gray-2)]`}>
            <Link
              className={`flex items-center justify-between py-6 font-subtle`}
              href={getLocalizedPath(NOVITA_URL.BILLING_OVERVIEW, locale)}
              id={HEADER_LINK_IDs.USERBOX_BALANCE}
            >
              <span>{"Balance"}:</span>
              <div className={`flex items-center gap-[6px]`}>
                <span className={`font-subtle-medium -mt-[2px]`}>
                  {"$"}
                  {String(balance)}
                </span>
                <ChevronRight size={14} />
              </div>
            </Link>
          </div>
        )}
      </div>
    );
  }
  return (
    <div className="flex items-center font-subtle">
      <div className={styles.user_info} style={style}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <div className="cursor-pointer flex items-center gap-4">
              <Avatar size={32} />
              {isMobile && <span className="font-body">{username}</span>}
            </div>
          </PopoverTrigger>
          <PopoverContent
            className="min-w-[270px] w-auto p-2 overflow-hidden z-1000"
            align="end"
          >
            <div className={`${styles.header_dropdown}`}>
              {items.map((i) => {
                return <div key={i.key}>{i.label}</div>;
              })}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}

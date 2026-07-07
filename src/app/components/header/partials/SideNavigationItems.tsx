import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { NavMenuItem } from "@/types/header";
import { Logo } from "./Logo";
import ConsoleNavSwitcher from "./ConsoleNavSwitcher";
import { cn } from "@/lib/utils";
import { NOVITA_URL, DISCORD_ANNOUNCEMENTS_URL } from "@/constants/urls";
import { ConsoleProduct } from "@/types/header";
import { ChevronLeft, Sparkles, SquareArrowOutUpRight } from "lucide-react";
import { getPreviousMainPagePath } from "@/lib/navigationStack";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import styles from "./SideNavigationItems.module.scss";
import Button from "@/app/components/button/Button";
import { useAppSelector } from "@/store";

// Must stay functions: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getDiscordNavItem(): NavMenuItem {
  return {
    key: "discord",
    path: DISCORD_ANNOUNCEMENTS_URL,
    title: "Discord",
    openInNewTab: true,
  };
}

function getBottomConsoleNavItem(): NavMenuItem {
  return {
    key: "bottom-console",
    path: NOVITA_URL.CONSOLE,
    title: (
      <div className="flex flex-row items-center gap-2">
        <Sparkles className="text-white" size={16} />
        <span className="text-paragraph-14 text-white">
          Get $101 Free Credits
        </span>
      </div>
    ),
  };
}

const DE_PATHS = [
  NOVITA_URL.MODEL_API_CONSOLE_LLM_DE,
  NOVITA_URL.MODEL_API_CONSOLE_IMAGE_DE,
];

interface SideNavigationItemsProps {
  items: NavMenuItem[];
  product: ConsoleProduct;
}

const NavItem = ({
  item,
  className,
  icon,
  suffix,
}: {
  item: NavMenuItem;
  className?: string;
  icon?: React.ReactNode;
  suffix?: React.ReactNode;
}) => {
  const pathname = usePathname();
  const { locale } = useI18n();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const isActive = item.path
    ? businessPathname === item.path ||
      item.altPaths?.includes(businessPathname)
    : false;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (item.onClick) item.onClick();
    }
  };

  const linkProps = {
    href: getLocalizedPath(item.path || "#", locale),
    target: item.openInNewTab ? "_blank" : item.linkTarget,
    className: cn(
      styles.navItem,
      "flex items-center min-h-[32px] rounded-md px-3",
      isActive ? styles.active : "",
      item.disabled ? styles.disabled : "",
      className,
    ),
    onClick: item.onClick,
    tabIndex: item.disabled ? -1 : 0,
    "aria-label": typeof item.title === "string" ? item.title : undefined,
    "aria-disabled": item.disabled,
    onKeyDown: handleKeyDown,
  };

  return (
    <Link {...linkProps}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {item.title}
      {suffix && <div className="ml-auto">{suffix}</div>}
    </Link>
  );
};

const SideNavigationItems = ({ items, product }: SideNavigationItemsProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { locale } = useI18n();
  const isQuestionnaire = useAppSelector((state) => state.user.isQuestionnaire);
  const businessPathname = getPathnameWithoutLocale(pathname);
  const docsItem = items.find((item) => item.key === "docs");
  const isDePage = DE_PATHS.some((p) => businessPathname.startsWith(p));

  const handleBack = () => {
    // Find the previous path from a different main page section
    const previousMainPagePath = getPreviousMainPagePath(businessPathname);

    if (!previousMainPagePath) {
      router.push(getLocalizedPath(NOVITA_URL.CONSOLE, locale));
      return;
    }

    router.push(getLocalizedPath(previousMainPagePath, locale));
  };

  const regularItems = items
    .filter((item) => item.key !== "docs")
    .map((item) => {
      if (item.key === "sandbox" && product === "main") {
        return {
          ...item,
          title: (
            <div className="flex items-center justify-between flex-1 gap-2">
              <span>{item.title}</span>
              <span
                className="px-1 py-1 rounded-[2px] bg-[var(--orange-100)] text-[var(--text-warning)] text-[12px] leading-[12px] font-mono uppercase"
                style={{ letterSpacing: 0 }}
              >
                Update
              </span>
            </div>
          ),
        };
      } else {
        return item;
      }
    });

  return (
    <div className={styles.container}>
      <div className="px-4">
        <Logo href={NOVITA_URL.CONSOLE} className="mb-7" />
      </div>
      {product !== "main" && (
        <div className="px-4">
          <ConsoleNavSwitcher className="mb-4" />
        </div>
      )}
      <div className={cn(styles.navItems, "px-4")}>
        {regularItems.map((item) =>
          item.isCategory ? (
            <div key={item.key} className={styles.category}>
              {item.title}
            </div>
          ) : item.isBack ? (
            <div key={item.key} className={styles.backContainer}>
              <div className={styles.backItem} onClick={handleBack}>
                <ChevronLeft className="w-4 h-4" />
                <span>Back</span>
              </div>
            </div>
          ) : item.key === "sandbox" && product === "main" ? (
            <HoverCard key={item.key} openDelay={150} closeDelay={100}>
              <HoverCardTrigger asChild>
                <div>
                  <NavItem item={item} />
                </div>
              </HoverCardTrigger>
              <HoverCardContent
                side="right"
                align="start"
                sideOffset={8}
                className="w-[208px] p-0 rounded-[8px] border-[var(--border-2)] shadow-[0_4px_10px_0_rgba(0,0,0,0.1)] overflow-hidden"
              >
                <div className="px-3 py-2 border-b border-[var(--border-3)]">
                  <p className="text-[14px] leading-[20px] font-medium text-[var(--text-1)]">
                    Check Your Sandbox Quotas
                  </p>
                </div>
                <div className="px-3 py-2">
                  <p className="text-[14px] leading-[20px] text-[var(--text-2)]">
                    View your current quotas and limits before scaling sandbox
                    workloads.
                  </p>
                </div>
                <div className="flex items-center justify-end gap-2 px-3 py-2 border-t border-[var(--border-3)]">
                  <Button
                    renderTag="link"
                    link={getLocalizedPath(
                      NOVITA_URL.SANDBOX_CONSOLE_QUOTA_LIMITS,
                      locale,
                    )}
                    className="h-6 px-2 rounded-full text-[12px] leading-[16px] transition-colors"
                  >
                    View Details
                  </Button>
                </div>
              </HoverCardContent>
            </HoverCard>
          ) : (
            <NavItem key={item.key} item={item} />
          ),
        )}
      </div>
      {docsItem && (
        <div
          className={cn(styles.navItems, styles.docsContainer, "px-4")}
          style={
            isDePage || (isQuestionnaire === false && product === "sandbox")
              ? { flexBasis: "auto" }
              : undefined
          }
        >
          {isQuestionnaire === false && product === "sandbox" && (
            <NavItem className="bg-black" item={getBottomConsoleNavItem()} />
          )}
          {isDePage && (
            <NavItem
              item={getDiscordNavItem()}
              icon={
                <span className="iconfont icon-discord w-6 h-6 mr-3 flex items-center justify-center text-[18px] text-[#5865F2]" />
              }
              suffix={<SquareArrowOutUpRight size={16} />}
            />
          )}
          <NavItem
            item={docsItem}
            icon={
              <img
                src="/console/docs-icon.svg"
                alt="docs"
                className="w-6 h-6 mr-3"
              />
            }
            suffix={<SquareArrowOutUpRight size={16} />}
          />
        </div>
      )}
    </div>
  );
};

export default SideNavigationItems;

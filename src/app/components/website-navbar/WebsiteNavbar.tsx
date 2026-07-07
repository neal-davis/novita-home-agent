"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { Moonshot as MoonshotIcon, OpenAI as OpenAIIcon } from "@lobehub/icons";
import {
  ChevronDown,
  Menu,
  X,
  Route,
  Monitor,
  Sparkles,
  ArrowUpRight,
  MessageCircleCode,
  FileImage,
  AudioLines,
  Video,
  SquareSigma,
} from "lucide-react";
import Cookies from "js-cookie";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { cn } from "@/lib/utils";
import Notice from "@/app/components/Notice/Notice";
import {
  getCustomNoticeHeight,
  useHeaderHeight,
} from "@/hooks/useHeaderHeight";
import Button from "@/app/components/button/Button";
import { useHeaderAuth } from "@/hooks/useHeaderAuth";
import { DOCS_URL, JOBS_URL, NOVITA_URL } from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { useAppSelector } from "@/store";
import { ModelType } from "@/types/models";
import { getLocalizedPath, type Locale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import { LanguageSwitcher } from "../header/partials/LanguageSwitcher";
const { HEADER_LINK_IDs } = CLICK_BTN_IDs;
/* ------------------------------------------------------------------ */
/*  Navigation data                                                    */
/* ------------------------------------------------------------------ */
interface NavItem {
  key: string;
  label: string;
  href?: string;
  elmId?: string;
  target?: "_blank" | "_self";
  megaMenu?: boolean;
  dropdown?: {
    key: string;
    label: string;
    href: string;
    elmId?: string;
    target?: "_blank" | "_self";
  }[];
}
interface ModelTypeNavItem {
  key: string;
  label: string;
  href: string;
  Icon: ComponentType<{
    className?: string;
    strokeWidth?: string | number;
  }>;
}
function createModelTypes(): ModelTypeNavItem[] {
  return [
    {
      key: "featured",
      label: "Featured",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Featured}`,
      Icon: Sparkles,
    },
    {
      key: "serverless",
      label: "Serverless",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Serverless}`,
      Icon: ServerlessIcon,
    },
    {
      key: "dedicated",
      label: "Dedicated",
      href: NOVITA_URL.DEDICATED_ENDPOINT,
      Icon: Route,
    },
    {
      key: "llm",
      label: "LLM",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Chat}`,
      Icon: MessageCircleCode,
    },
    {
      key: "image",
      label: "Image",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Images}`,
      Icon: FileImage,
    },
    {
      key: "audio",
      label: "Audio",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Audio}`,
      Icon: AudioLines,
    },
    {
      key: "video",
      label: "Video",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Video}`,
      Icon: Video,
    },
    {
      key: "embedding",
      label: "Embedding",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?type=${ModelType.Embedding}`,
      Icon: SquareSigma,
    },
  ];
}
function ServerlessIcon({
  className,
  strokeWidth = 1.2,
}: {
  className?: string;
  strokeWidth?: string | number;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="-1 -1 18 18"
      fill="none"
      className={className}
      aria-hidden="true"
      strokeWidth={strokeWidth}
    >
      <path
        d="M14 2.66668H9.33333M6.66667 2.66668H2M14 8.00001H8M5.33333 8.00001H2M14 13.3333H10.6667M8 13.3333H2M9.33333 1.33334V4.00001M5.33333 6.66668V9.33334M10.6667 12V14.6667"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
// Must stay a function: the i18n loader wraps these literals in __t(), and a
// module-level const would freeze the strings in the locale active at load time.
function getFeaturedProviders() {
  return [
    {
      key: "openai",
      label: "OpenAI",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=OpenAI`,
      LogoComponent: OpenAIIcon,
    },
    {
      key: "google",
      label: "Google",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=Gemma`,
      logoPath: "/models/logo/svg/google-logo.svg",
    },
    {
      key: "moonshot",
      label: "Moonshot AI",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=MoonshotAI`,
      LogoComponent: MoonshotIcon,
    },
    {
      key: "minimax",
      label: "MiniMax",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=MiniMax`,
      logoPath: "/models/logo/svg/minimax-logo.svg",
    },
    {
      key: "deepseek",
      label: "DeepSeek",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=DeepSeek`,
      logoPath: "/models/logo/svg/deepseek-logo.svg",
    },
    {
      key: "zai",
      label: "Z.ai",
      href: `${NOVITA_URL.MODEL_LIBRARY_INDEX}?provider=Zai-org`,
      logoPath: "/models/logo/svg/glm-logo.svg",
    },
  ];
}
const NAV_PANEL_ENTER_CLASS =
  "origin-top-left motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:slide-in-from-top-1 motion-safe:duration-150";
const NAV_HEIGHT_PX = 52;
const NAV_BORDER_WIDTH_PX = 1;
const MOBILE_NAV_TOP_GAP_PX = 12;
const MOBILE_PANEL_GAP_PX = 12;
function createNavItems(): NavItem[] {
  return [
    {
      key: "model_apis",
      label: "Model APIs",
      elmId: HEADER_LINK_IDs.MODEL_LIBRARY,
      megaMenu: true,
    },
    {
      key: "agent_sandbox",
      label: "Agent Sandbox",
      href: NOVITA_URL.SANDBOX_INDEX,
      elmId: HEADER_LINK_IDs.SANDBOX,
    },
    {
      key: "gpus",
      label: "GPUs",
      elmId: HEADER_LINK_IDs.GPUS_MAINMENU,
      dropdown: [
        {
          key: "gpu_instance",
          label: "GPU Instance",
          href: NOVITA_URL.GPU_INDEX,
          elmId: HEADER_LINK_IDs.GPU_INSTANCE,
        },
        {
          key: "gpu_baremetal",
          label: "GPU Bare Metal",
          href: NOVITA_URL.GPU_BAREMETAL_INDEX,
          elmId: HEADER_LINK_IDs.GPU_BAREMETAL,
        },
      ],
    },
    {
      key: "resources",
      label: "Resources",
      dropdown: [
        {
          key: "docs",
          label: "Docs",
          href: DOCS_URL.HOME,
          elmId: HEADER_LINK_IDs.API,
          target: "_blank",
        },
        {
          key: "blog",
          label: "Blog",
          href: "https://blogs.novita.ai",
          elmId: HEADER_LINK_IDs.BLOG,
          target: "_blank",
        },
        {
          key: "careers",
          label: "Careers",
          href: JOBS_URL,
          elmId: HEADER_LINK_IDs.CAREERS,
          target: "_blank",
        },
      ],
    },
    {
      key: "pricing",
      label: "Pricing",
      href: NOVITA_URL.PRICING,
      elmId: HEADER_LINK_IDs.PRICING,
    },
  ];
}
/* ------------------------------------------------------------------ */
/*  Model APIs mega panel                                              */
/* ------------------------------------------------------------------ */
function ModelApisMegaPanel({
  locale,
  modelTypes,
  onMouseEnter,
  onMouseLeave,
  onClose,
}: {
  locale: Locale;
  modelTypes: ModelTypeNavItem[];
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onClose: () => void;
}) {
  const featuredProviders = getFeaturedProviders();
  return (
    <div
      className="absolute top-full left-0 z-10 mt-1 translate-x-28"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="nav-mega-panel-enter relative flex overflow-hidden rounded-[8px] border-[0.5px] border-subtle bg-[var(--fill-white)] shadow-[0px_25px_50px_-33px_rgba(0,0,0,0.25)]">
        <div className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit] shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.5)]" />
        {/* Left column */}
        <div className="flex w-[720px] flex-col gap-8 p-7">
          {/* Model Types */}
          <div className="flex flex-col gap-6">
            <div>
              <p className="font-miletus text-[17px] font-medium leading-[23px] text-[var(--text-1)] mb-2">
                Model Types
              </p>
              <p className="font-paragraph-14 text-[var(--element-mid-em)]">
                Browse models by category to find the right fit for your use
                case
              </p>
            </div>
            <div className="grid grid-cols-4 gap-x-6 gap-y-7">
              {modelTypes.map(({ key, label, href, Icon }) => (
                <Link
                  key={key}
                  href={getLocalizedPath(href, locale)}
                  onClick={() => onClose()}
                  className="group flex h-7 min-w-0 items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gray-950)]/15"
                >
                  <Icon
                    className="size-5 shrink-0 text-[var(--element-high-em)]"
                    strokeWidth={1.2}
                  />
                  <span className="min-w-0 whitespace-nowrap font-paragraph-16 text-[var(--element-high-em)]">
                    {label}
                  </span>
                  <ArrowUpRight
                    className="-ml-1 size-4 shrink-0 text-[var(--text-1)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                    strokeWidth={1.5}
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-200" />

          {/* Featured Providers */}
          <div className="flex flex-col gap-[22px]">
            <div>
              <p className="font-miletus text-[17px] font-medium leading-[23px] text-[var(--text-1)] mb-2">
                Featured Providers
              </p>
              <p className="font-paragraph-14 text-[var(--element-mid-em)]">
                Discover top model providers powering Novita.AI
              </p>
            </div>
            <div className="grid grid-cols-3 gap-x-7 gap-y-[22px]">
              {featuredProviders.map(
                ({ key, label, href, LogoComponent, logoPath }) => (
                  <Link
                    key={key}
                    href={getLocalizedPath(href, locale)}
                    onClick={() => onClose()}
                    className="group flex h-7 items-center gap-3"
                  >
                    {LogoComponent ? (
                      <LogoComponent size={22} className="shrink-0" />
                    ) : (
                      <Image
                        src={logoPath}
                        alt={label}
                        width={22}
                        height={22}
                        className="size-[22px] shrink-0 object-contain"
                      />
                    )}
                    <span className="whitespace-nowrap font-paragraph-16 text-[var(--element-high-em)]">
                      {label}
                    </span>
                    <ArrowUpRight
                      className="-ml-1 size-4 shrink-0 text-[var(--text-1)] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100"
                      strokeWidth={1.5}
                    />
                  </Link>
                ),
              )}
            </div>
          </div>

          <Link
            href={getLocalizedPath(NOVITA_URL.MODEL_LIBRARY_INDEX, locale)}
            onClick={() => onClose()}
            className={cn(
              "h-[42px] flex items-center justify-center",
              "bg-white border border-[var(--element-high-em)]",
              "shadow-[0px_1px_3px_0px_var(--alpha-dark-10),0px_1px_2px_0px_var(--alpha-dark-7)]",
              "font-miletus text-[16px] font-normal leading-[22px] text-[var(--text-1)]",
              "hover:bg-gray-50 transition-colors",
            )}
          >
            View All Models
          </Link>
        </div>
      </div>
    </div>
  );
}
/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function WebsiteNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const { uuid } = useHeaderAuth();
  const noticeConfig = useAppSelector((state) => state.config.notice);
  const { isNoticeShowing } = useHeaderHeight(undefined, undefined, false);
  /** `isLogin` 依赖 uuid，晚于 cookie；与 useHeaderAuth 内一致，有 token 即视为已登录态 */
  const [hasTokenCookie, setHasTokenCookie] = useState(false);
  useLayoutEffect(() => {
    setHasTokenCookie(Boolean(Cookies.get("token")));
  }, [pathname, uuid]);
  const showSessionChrome = Boolean(uuid) || hasTokenCookie;
  const showStartBuilding = !uuid && !hasTokenCookie;
  const modelTypes = useMemo(() => {
    void locale;
    return createModelTypes();
  }, [locale]);
  const navItems = useMemo(() => {
    void locale;
    return createNavItems();
  }, [locale]);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileExpanded, setMobileExpanded] = useState<string | null>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const handleMouseEnter = useCallback((key: string) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setOpenDropdown(key);
  }, []);
  const handleMouseLeave = useCallback(() => {
    closeTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
      closeTimeoutRef.current = null;
    }, 150);
  }, []);
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  const handleStartBuilding = useCallback(() => {
    const consoleHref = getLocalizedPath(NOVITA_URL.CONSOLE, locale);
    if (showSessionChrome) {
      router.push(consoleHref);
      return;
    }
    localStorage.setItem("redirect", consoleHref);
    router.push(
      getLocalizedPath(
        `${NOVITA_URL.USER_LOGIN}?redirect=${encodeURIComponent(consoleHref)}`,
        locale,
      ),
    );
  }, [locale, router, showSessionChrome]);
  const customNoticeHeight = getCustomNoticeHeight(
    undefined,
    noticeConfig.height,
  );
  const navTopOffset = isNoticeShowing
    ? customNoticeHeight
      ? `${customNoticeHeight}px`
      : "var(--notice-height)"
    : "0px";
  const mobilePanelBaseTopPx =
    NAV_HEIGHT_PX + MOBILE_NAV_TOP_GAP_PX + MOBILE_PANEL_GAP_PX;
  const mobilePanelTop = isNoticeShowing
    ? customNoticeHeight
      ? mobilePanelBaseTopPx + customNoticeHeight
      : `calc(${mobilePanelBaseTopPx}px + var(--notice-height))`
    : mobilePanelBaseTopPx;
  return (
    <>
      {isNoticeShowing ? <Notice /> : null}
      {/* Radix Select/Popover uses react-remove-scroll, which hides the body
            scrollbar and shifts fixed right-aligned elements unless they opt in
            to this scrollbar compensation class. Keep the centered nav stable
            when model-library filters open their provider dropdown. */}
      <header
        className="right-scroll-bar-position fixed left-0 right-0 z-[999] flex justify-center px-3 pt-3 lg:px-5 lg:pt-5 pointer-events-none"
        style={{ top: navTopOffset }}
      >
        <nav
          className={cn(
            "pointer-events-auto relative w-full max-w-layout-nav",
            "rounded-[100px] border border-subtle",
            "bg-white/50 backdrop-blur-[20px]",
            "overflow-visible",
          )}
        >
          {/* Inner glow overlay */}
          <div className="absolute inset-[-1px] rounded-[inherit] shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.5)] pointer-events-none" />

          <div className="relative flex min-h-0 h-[52px] flex-row items-center justify-between pl-8 pr-3 lg:gap-[40px] lg:pl-5 lg:pr-[6px]">
            <a
              href={getLocalizedPath("/", locale)}
              id={HEADER_LINK_IDs.LOGO}
              className="hidden h-full w-[88px] shrink-0 items-center justify-center lg:flex"
              aria-label="Novita AI"
            >
              <img
                src="/logo/logo.svg"
                alt="Novita AI"
                width={88}
                height={24}
                className="block h-6 w-[88px] select-none"
              />
            </a>
            <a
              href={getLocalizedPath("/", locale)}
              className="flex h-full shrink-0 items-center lg:hidden"
              aria-label="Novita AI"
            >
              <img
                width={28}
                height={28}
                src="/logo/logo_small.svg"
                alt="Novita AI"
                className="size-7"
              />
            </a>

            {/* Desktop navigation */}
            <div className="hidden h-full flex-1 items-center justify-center gap-[var(--space-16)] lg:flex">
              {navItems.map((item) => {
                /* Mega menu (Model APIs) */
                if (item.megaMenu) {
                  return (
                    <div
                      key={item.key}
                      className="flex h-full items-center"
                      onMouseEnter={() => handleMouseEnter(item.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        id={item.elmId}
                        className={cn(
                          "font-paragraph-15 text-element-high-em",
                          "flex items-center gap-1 rounded-[100px] px-[10px] py-[5px]",
                          "cursor-pointer transition-colors hover:bg-black/[0.04]",
                          openDropdown === item.key && "bg-black/[0.04]",
                        )}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            openDropdown === item.key && "rotate-180",
                          )}
                        />
                      </button>
                      {openDropdown === item.key && (
                        <ModelApisMegaPanel
                          locale={locale}
                          modelTypes={modelTypes}
                          onMouseEnter={() => handleMouseEnter(item.key)}
                          onMouseLeave={handleMouseLeave}
                          onClose={() => setOpenDropdown(null)}
                        />
                      )}
                    </div>
                  );
                }
                /* Regular dropdown */
                if (item.dropdown) {
                  return (
                    <div
                      key={item.key}
                      className="relative flex h-full items-center"
                      onMouseEnter={() => handleMouseEnter(item.key)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className={cn(
                          "font-paragraph-15 text-element-high-em",
                          "flex items-center gap-1 rounded-[100px] px-[10px] py-[5px]",
                          "cursor-pointer transition-colors hover:bg-black/[0.04]",
                        )}
                        id={item.elmId}
                      >
                        {item.label}
                        <ChevronDown
                          className={cn(
                            "h-4 w-4 transition-transform duration-200",
                            openDropdown === item.key && "rotate-180",
                          )}
                        />
                      </button>
                      {openDropdown === item.key && (
                        <div
                          className={cn(
                            "absolute top-full left-0 mt-1 w-[172px] overflow-hidden",
                            "rounded-[8px] border-[0.5px] border-subtle",
                            "bg-[var(--fill-white)]",
                            "p-3",
                            NAV_PANEL_ENTER_CLASS,
                          )}
                          onMouseEnter={() => handleMouseEnter(item.key)}
                          onMouseLeave={handleMouseLeave}
                        >
                          <div className="pointer-events-none absolute inset-[-0.5px] rounded-[inherit] shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.5)]" />
                          <div className="relative flex flex-col gap-3">
                            {item.dropdown.map((sub) => (
                              <Link
                                key={sub.key}
                                href={getLocalizedPath(sub.href, locale)}
                                id={sub.elmId}
                                target={sub.target}
                                className={cn(
                                  "font-paragraph-15 text-[var(--text-1)] whitespace-nowrap",
                                  "flex items-center px-[10px] py-[5px] rounded-[100px]",
                                  "transition-colors hover:bg-black/[0.04]",
                                )}
                              >
                                {sub.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }
                /* Plain link */
                return (
                  <Link
                    key={item.key}
                    href={getLocalizedPath(item.href ?? "", locale)}
                    id={item.elmId}
                    className={cn(
                      "font-paragraph-15 text-element-high-em",
                      "flex items-center rounded-[100px] px-[10px] py-[5px]",
                      "whitespace-nowrap transition-colors hover:bg-black/[0.04]",
                    )}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>

            {/* Desktop：已登录 = Dashboard；未登录 = Start Building */}
            <div className="hidden h-full min-h-0 shrink-0 items-center lg:flex">
              <div className="flex flex-row items-center gap-2">
                <LanguageSwitcher variant="pill" />
                {showSessionChrome ? (
                  <Link
                    href={getLocalizedPath(NOVITA_URL.CONSOLE, locale)}
                    id={HEADER_LINK_IDs.CONSOLE}
                    className={cn(
                      "font-paragraph-15 leading-none text-[var(--brand-1)]",
                      "box-border flex h-[44px] items-center justify-center gap-2",
                      "rounded-[999px] px-5 whitespace-nowrap",
                      "transition-colors hover:bg-black/[0.04]",
                    )}
                  >
                    <Monitor className="size-4" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                ) : null}
                {showStartBuilding ? (
                  <Button
                    type="primary"
                    id={HEADER_LINK_IDs.GET_STARTED}
                    onClick={handleStartBuilding}
                    className={cn(
                      "font-paragraph-15 leading-none",
                      "box-border flex h-[44px] items-center justify-center",
                      "min-w-[130px] rounded-full px-5 whitespace-nowrap",
                    )}
                  >
                    Start Building
                  </Button>
                ) : null}
              </div>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={cn(
                "lg:hidden shrink-0 flex items-center justify-center",
                "size-[40px] sm:size-[44px] rounded-full",
                "bg-element-high-em text-element-inverse",
                "cursor-pointer transition-opacity hover:opacity-90",
              )}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="size-4" />
              ) : (
                <Menu className="size-4" />
              )}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile / Tablet dropdown panel */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-[998] lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="absolute right-3 w-[369px] max-w-[calc(100vw-24px)]"
            style={{ top: mobilePanelTop }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={cn(
                "relative rounded-[24px] border border-subtle overflow-hidden",
                "bg-white/50 backdrop-blur-[20px]",
                NAV_PANEL_ENTER_CLASS,
              )}
            >
              {/* Inner glow — matches navbar pill */}
              <div className="absolute inset-[-1px] rounded-[inherit] shadow-[inset_0px_0px_12px_0px_rgba(255,255,255,0.5)] pointer-events-none z-10" />

              <div className="relative p-3 flex flex-col gap-3 max-h-[calc(100vh-112px)] overflow-y-auto">
                {showSessionChrome ? (
                  <Link
                    href={getLocalizedPath(NOVITA_URL.CONSOLE, locale)}
                    className={cn(
                      "font-paragraph-15 text-[var(--brand-1)]",
                      "flex h-[44px] items-center gap-2 px-5 rounded-[999px]",
                      "transition-colors hover:bg-black/[0.04]",
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Monitor className="size-4" strokeWidth={1.5} />
                    Dashboard
                  </Link>
                ) : null}
                <LanguageSwitcher
                  className="mb-1"
                  mode="mobile"
                  variant="pill"
                />
                {/* Nav list */}
                <div className="flex flex-col">
                  {navItems.map((item) => {
                    const subItems = item.megaMenu
                      ? modelTypes.map((t) => ({
                          key: t.key,
                          label: t.label,
                          href: t.href,
                        }))
                      : item.dropdown;
                    const isExpanded = mobileExpanded === item.key;
                    if (subItems) {
                      return (
                        <div key={item.key}>
                          <button
                            className={cn(
                              "w-full flex items-center justify-between gap-1",
                              "px-[10px] py-[5px] rounded-[100px]",
                              "font-paragraph-15 text-element-high-em",
                              "cursor-pointer transition-colors hover:bg-black/[0.04]",
                              isExpanded && "bg-black/[0.04]",
                            )}
                            onClick={() =>
                              setMobileExpanded(isExpanded ? null : item.key)
                            }
                          >
                            {item.label}
                            <ChevronDown
                              className={cn(
                                "size-4 shrink-0 transition-transform duration-200",
                                isExpanded && "rotate-180",
                              )}
                            />
                          </button>
                          {isExpanded && (
                            <div
                              className={cn(
                                "flex flex-col pl-3 mt-1",
                                NAV_PANEL_ENTER_CLASS,
                              )}
                            >
                              {subItems.map((sub) => (
                                <Link
                                  key={sub.key}
                                  href={getLocalizedPath(sub.href, locale)}
                                  className={cn(
                                    "font-paragraph-15 text-[var(--element-mid-em)]",
                                    "px-[10px] py-[5px] rounded-[100px]",
                                    "transition-colors hover:bg-black/[0.04]",
                                  )}
                                  onClick={() => setMobileMenuOpen(false)}
                                >
                                  {sub.label}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    }
                    return (
                      <Link
                        key={item.key}
                        href={getLocalizedPath(item.href ?? "", locale)}
                        id={item.elmId}
                        className={cn(
                          "font-paragraph-15 text-element-high-em",
                          "px-[10px] py-[5px] rounded-[100px]",
                          "transition-colors hover:bg-black/[0.04]",
                        )}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>

                {/* CTA — 与旧 Header 一致：仅未登录展示 */}
                {showStartBuilding ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleStartBuilding();
                    }}
                    className={cn(
                      "font-paragraph-15 w-full shrink-0",
                      "h-[44px] rounded-full",
                      "cursor-pointer",
                    )}
                  >
                    Start Building
                  </Button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

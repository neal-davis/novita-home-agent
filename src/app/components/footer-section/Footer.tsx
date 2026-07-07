"use client";

import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/app/components/header/partials/Logo";
import {
  NOVITA_URL,
  DOCS_URL,
  X_URL,
  LINKEDIN_URL,
  SUPPLY_GPU_LINK,
  SUPPORT_EMAIL_LINK,
  JOBS_URL,
  TRUST_CENTER_LINK,
  BREVO_BOOK_LINK,
} from "@/constants/urls";
import { CLICK_BTN_IDs } from "@/app/components/analytics/constants";
import { getLocalizedPath } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";
import CookieSettingsLink from "@/app/components/consent/CookieSettingsLink";

const { FOOTER_LINK_IDs } = CLICK_BTN_IDs;

interface FooterLink {
  label: string;
  href: string;
  target?: "_blank" | "_self";
  elmId?: string;
}

interface FooterColumn {
  title: string;
  links: FooterLink[];
}

function createFooterColumns(): FooterColumn[] {
  return [
    {
      title: "Product",
      links: [
        {
          label: "Model APIs",
          href: NOVITA_URL.MODEL_LIBRARY_INDEX,
          elmId: FOOTER_LINK_IDs.MODEL_API,
        },
        { label: "Agent Sandbox", href: NOVITA_URL.SANDBOX_INDEX },
        {
          label: "GPU Instance",
          href: NOVITA_URL.GPU_INDEX,
          elmId: FOOTER_LINK_IDs.GPU_INSTANCE,
        },
        { label: "GPU Bare Metal", href: NOVITA_URL.GPU_BAREMETAL_INDEX },
      ],
    },
    {
      title: "Resource",
      links: [
        {
          label: "Talk to Sales",
          href: BREVO_BOOK_LINK,
          target: "_blank",
          elmId: FOOTER_LINK_IDs.BOOK_DEMO,
        },
        {
          label: "Contact Support",
          href: `mailto:${SUPPORT_EMAIL_LINK}`,
          target: "_blank",
          elmId: FOOTER_LINK_IDs.SUPPORT,
        },
        { label: "Pricing", href: NOVITA_URL.PRICING },
        { label: "Docs", href: DOCS_URL.HOME, elmId: FOOTER_LINK_IDs.DOCS },
      ],
    },
    {
      title: "Partners",
      links: [
        {
          label: "Refer to Earn",
          href: NOVITA_URL.AFFILIATE,
          elmId: FOOTER_LINK_IDs.AFFILIATE,
        },
        {
          label: "Supply GPUs",
          href: `mailto:${SUPPLY_GPU_LINK}`,
          target: "_blank",
          elmId: FOOTER_LINK_IDs.SUPPLY_GPU,
        },
      ],
    },
    {
      title: "Company",
      links: [
        {
          label: "Careers",
          href: JOBS_URL,
          target: "_blank",
          elmId: FOOTER_LINK_IDs.CAREERS,
        },
        {
          label: "Blog",
          href: "https://blogs.novita.ai",
          target: "_blank",
          elmId: FOOTER_LINK_IDs.BLOG,
        },
        {
          label: "Trust Center",
          href: TRUST_CENTER_LINK,
          target: "_blank",
          elmId: FOOTER_LINK_IDs.TRUST_CENTER,
        },
      ],
    },
  ];
}

export default function Footer() {
  const { locale } = useI18n();
  const footerColumns = createFooterColumns();

  return (
    <footer className="flex w-full flex-col items-center bg-[var(--bg-inverse)] [box-shadow:0_100vh_0_100vh_var(--bg-inverse)]">
      <div className="w-full max-w-[1360px] flex flex-col gap-[72px]">
        {/*
          Figma 1:7985 / 1:8534：窄屏 px-32 py-64、区块 gap-80；链接每项 overflow-clip + truncate（仅 max-lg）。
          lg+：Logo 与链接区一行 justify-between。
        */}
        <div className="flex min-w-0 flex-col gap-20 overflow-x-hidden px-8 py-16 lg:flex-row lg:items-start lg:justify-between lg:gap-0 lg:overflow-visible lg:px-8 lg:py-16">
          {/* Logo column */}
          <div className="flex w-full min-w-0 shrink-0 flex-col gap-space-32 overflow-x-hidden lg:max-w-none lg:flex-1 lg:overflow-visible">
            <div className="flex flex-col gap-space-16">
              <Logo theme="dark" />
              <p className="max-w-[268px] min-w-0 font-paragraph-15 text-[var(--text-4)]">
                {
                  "Power your AI applications with Novita AI's model APIs, GPU instances, and agent sandbox."
                }
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-space-16">
              <Image
                src="/footer/v5/gtrp.png"
                alt="AICPA SOC 2 Certified"
                width={64}
                height={64}
                className="opacity-70"
              />
            </div>
          </div>

          {/* Nav columns — max-lg: 四列等分 + 每项 overflow 防撑版（Figma Menu Item overflow-clip） */}
          <div className="flex w-full min-w-0 flex-row items-stretch overflow-x-hidden lg:grid lg:w-[888px] lg:grid-cols-4 lg:flex-none lg:gap-y-10 lg:overflow-visible">
            {footerColumns.map((column) => (
              <div
                key={column.title}
                className="flex min-w-0 flex-1 flex-col gap-space-24 overflow-hidden border-l border-[var(--alpha-light-7)] pl-5 lg:flex-none lg:overflow-visible lg:pl-5"
              >
                <span className="min-w-0 font-paragraph-14 text-[var(--text-4)] max-lg:truncate">
                  {column.title}
                </span>
                <div className="flex min-w-0 flex-col gap-space-12">
                  {column.links.map((link) => (
                    <div
                      key={link.label}
                      className="flex min-w-0 w-full items-center overflow-hidden lg:overflow-visible"
                    >
                      <Link
                        href={getLocalizedPath(link.href, locale)}
                        id={link.elmId}
                        target={link.target}
                        rel={
                          link.target === "_blank"
                            ? "noopener noreferrer"
                            : undefined
                        }
                        className={[
                          "min-w-0 font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white",
                          "max-lg:truncate",
                          "lg:whitespace-nowrap",
                        ].join(" ")}
                        title={link.label}
                      >
                        {link.label}
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar — copyright + social links */}
        <div className="flex min-w-0 flex-col gap-space-24 overflow-x-hidden border-t border-[var(--alpha-light-20)] px-8 py-6 lg:flex-row lg:items-center lg:justify-between lg:gap-0 lg:overflow-visible lg:p-8">
          <p className="min-w-0 font-paragraph-14 text-[var(--text-4)] max-lg:truncate lg:shrink-0">
            {"\u00a9"} {new Date().getFullYear()} Novita AI. All rights reserved
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-x-space-32 gap-y-space-12">
            <div className="flex items-center gap-space-32">
              <Link
                href={X_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={FOOTER_LINK_IDs.SOCIAL_X}
                className="flex size-space-24 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
                aria-label="X"
              >
                <Image
                  src="/footer/v5t/x.svg"
                  alt=""
                  width={22}
                  height={20}
                  className="h-5 w-[22px]"
                />
              </Link>
              <Link
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                id={FOOTER_LINK_IDs.SOCIAL_LINKEDIN}
                className="flex size-space-24 items-center justify-center opacity-70 transition-opacity hover:opacity-100"
                aria-label="LinkedIn"
              >
                <Image
                  src="/footer/v5t/linkedin.svg"
                  alt=""
                  width={25}
                  height={24}
                  className="size-space-24"
                />
              </Link>
            </div>
            <div className="flex items-center gap-space-32">
              <Link
                href={getLocalizedPath(NOVITA_URL.TERMS_OF_SERVICE, locale)}
                id={FOOTER_LINK_IDs.TERMS}
                className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white"
              >
                Terms of Service
              </Link>
              <Link
                href={getLocalizedPath(NOVITA_URL.PRIVACY_POLICY, locale)}
                id={FOOTER_LINK_IDs.PRIVACY}
                className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white"
              >
                Privacy Policy
              </Link>
              <Link
                href={getLocalizedPath(NOVITA_URL.COOKIE_POLICY, locale)}
                id={FOOTER_LINK_IDs.COOKIE_POLICY}
                className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white"
              >
                Cookie Policy
              </Link>
              <CookieSettingsLink
                id={FOOTER_LINK_IDs.COOKIE_SETTINGS}
                className="font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white"
              >
                Cookie Settings
              </CookieSettingsLink>
              <CookieSettingsLink
                id={FOOTER_LINK_IDs.DO_NOT_SELL}
                className="max-w-[220px] text-left font-paragraph-14 text-[var(--text-4)] transition-colors hover:text-white"
              >
                Do Not Sell or Share My Personal Information
              </CookieSettingsLink>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import styles from "./Footer.module.scss";
import { COOKIEBOT_ENABLED_HEADER } from "@/constants/consent";
import {
  DISCORD_INVITE_LINK,
  LINKEDIN_URL,
  NOVITA_URL,
  SUPPLY_GPU_LINK,
  SUPPORT_EMAIL_LINK,
  X_URL,
  YTB_URL,
  JOBS_URL,
  TRUST_CENTER_LINK,
} from "@/constants/urls";
import Link from "next/link";
import { headers } from "next/headers";
import SocialIcon from "./SocialIcon";
import { CLICK_BTN_IDs } from "../analytics/constants";
import { DOCS_URL } from "@/constants/urls";
import { Suspense } from "react";
import SystemStatus from "./SystemStatus";
import MenuGroup from "./MenuGroup";
import { BookDemo } from "@/app/mainpage/components/BookDemo";
import Copyright from "./Copyright";
import ArenaDemo from "./ArenaDemo";
import CookieSettingsLink from "@/app/components/consent/CookieSettingsLink";

export type FooterMenu = {
  label: string;
  items: FooterMenuItemWithEl[];
};
export type FooterMenuItem = {
  link: string;
  label: string;
  linkTarget?: string;
  elmID?: string;
};
type FooterMenuItemWithEl =
  | FooterMenuItem
  | {
      el: React.ReactNode;
    };

export default async function Footer({ className }: { className?: string }) {
  const cookiebotEnabled = headers().get(COOKIEBOT_ENABLED_HEADER) !== "0";
  const contactMenu: FooterMenu = {
    label: "Contact Us",
    items: [
      {
        link: `mailto:${SUPPORT_EMAIL_LINK}`,
        label: "Contact Support",
        linkTarget: "_blank",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.SUPPORT,
      },
      {
        el: (
          <BookDemo
            asChild
            className="font-subtle py-[8px] hover:underline !text-black !px-0 !w-auto !ml-0 !justify-start"
            variant="link"
            elmID={CLICK_BTN_IDs.FOOTER_LINK_IDs.BOOK_DEMO}
          />
        ),
      },
      {
        link: `mailto:${SUPPLY_GPU_LINK}`,
        label: "Supply GPUs",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.SUPPLY_GPU,
      },
    ],
  };

  const partnerMenu: FooterMenu = {
    label: "Partners",
    items: [
      {
        link: NOVITA_URL.AFFILIATE,
        label: "Affiliate",
        linkTarget: "_self",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.AFFILIATE,
      },
    ],
  };
  const resourcesMenu: FooterMenu = {
    label: "Resources",
    items: [
      {
        link: DOCS_URL.HOME,
        label: "Docs",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.DOCS,
      },
      {
        link: DOCS_URL.FAQ,
        label: "FAQ",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.FAQ,
      },
      {
        link: "https://blogs.novita.ai",
        label: "Blog",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.BLOG,
        linkTarget: "_blank",
      },
      {
        link: NOVITA_URL.GPU_CONSOLE_TEMPLATE_LIBRARY,
        label: "Templates",
        linkTarget: "_self",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.TEMPLATES_LIBRARY,
      },
      {
        el: <ArenaDemo key="arena-demo" />,
      },
    ],
  };
  const companyMenu: FooterMenu = {
    label: "Company",
    items: [
      // {
      //   link: "/about",
      //   label: "About Us",
      //   elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.ABOUT,
      // },
      {
        link: NOVITA_URL.TERMS_OF_SERVICE,
        label: "Terms of Service",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.TERMS,
      },
      {
        link: NOVITA_URL.PRIVACY_POLICY,
        label: "Privacy Policy",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.PRIVACY,
      },
      {
        link: NOVITA_URL.COOKIE_POLICY,
        label: "Cookie Policy",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.COOKIE_POLICY,
      },
      ...(cookiebotEnabled
        ? [
            {
              el: (
                <CookieSettingsLink
                  key="cookie-settings"
                  className="font-subtle py-[8px] text-left hover:underline"
                  id={CLICK_BTN_IDs.FOOTER_LINK_IDs.COOKIE_SETTINGS}
                >
                  Cookie Settings
                </CookieSettingsLink>
              ),
            },
            {
              el: (
                <CookieSettingsLink
                  key="do-not-sell"
                  className="font-subtle py-[8px] text-left hover:underline"
                  id={CLICK_BTN_IDs.FOOTER_LINK_IDs.DO_NOT_SELL}
                >
                  Do Not Sell or Share My Personal Information
                </CookieSettingsLink>
              ),
            },
          ]
        : []),
      {
        link: JOBS_URL,
        label: "Careers",
        linkTarget: "_blank",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.CAREERS,
      },
      {
        link: TRUST_CENTER_LINK,
        label: "Trust Center",
        linkTarget: "_blank",
        elmID: CLICK_BTN_IDs.FOOTER_LINK_IDs.TRUST_CENTER,
      },
    ],
  };

  return (
    <footer className={`${styles.footer} ${className || ""}`}>
      <div className="max_width_container">
        <div className={`px-web ${styles.container}`}>
          <div className={styles.info_box}>
            <div>
              <Link
                className={styles.logo}
                id={CLICK_BTN_IDs.FOOTER_LINK_IDs.INDEX}
                href={"/"}
              ></Link>
              <Suspense fallback={null}>
                <SystemStatus />
              </Suspense>
            </div>
            <div
              className={`flex flex-row align-center ${styles.social_wrapper}`}
            >
              <SocialIcon
                id={CLICK_BTN_IDs.FOOTER_LINK_IDs.SOCIAL_X}
                name="x"
                url={X_URL}
              />
              <SocialIcon
                id={CLICK_BTN_IDs.FOOTER_LINK_IDs.SOCIAL_YOUTUBE}
                name="youtube"
                url={YTB_URL}
              />
              <SocialIcon
                id={CLICK_BTN_IDs.FOOTER_LINK_IDs.SOCIAL_LINKEDIN}
                name="linkedin"
                url={LINKEDIN_URL}
              />
              <SocialIcon
                id={CLICK_BTN_IDs.FOOTER_LINK_IDs.SOCIAL_DISCORD}
                name="discord"
                url={DISCORD_INVITE_LINK}
              />
            </div>
          </div>
          <div className={styles.menu}>
            <div className={styles.menu_wrapper}>
              <MenuGroup menu={contactMenu} />
              <MenuGroup menu={resourcesMenu} />
              <MenuGroup menu={companyMenu} />
              <MenuGroup menu={partnerMenu} />
            </div>
            <Copyright copyrightText="© 2025 Novita AI" />
          </div>
        </div>
      </div>
    </footer>
  );
}

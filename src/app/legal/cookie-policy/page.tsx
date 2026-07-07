/* eslint-disable react/no-unescaped-entities */

import Link from "next/link";
import { Metadata } from "next";
import { CANONICAL_URL } from "@/constants/canonical";
import { LEGAL_ENTITY } from "@/constants/legal";
import { SUPPORT_EMAIL_LINK } from "@/constants/urls";
import CookieSettingsLink from "@/app/components/consent/CookieSettingsLink";
import styles from "../common.module.scss";
import CookieDeclaration from "./CookieDeclaration";

export const metadata: Metadata = {
  alternates: {
    canonical: CANONICAL_URL.LEGAL_COOKIE_POLICY,
  },
  title: "Novita AI Cookie Policy",
};

function createCookieCategories() {
  return [
    {
      title: "Strictly necessary cookies",
      text: "These cookies are required for the website and Services to work, including authentication, security, fraud prevention, load balancing, language selection, and consent storage.",
    },
    {
      title: "Preference cookies",
      text: "These cookies remember choices you make, such as language, interface preferences, or recently visited console areas, so we can provide a more useful experience.",
    },
    {
      title: "Statistics cookies",
      text: "These cookies help us understand how visitors use our website and Services, measure page performance, and improve product flows.",
    },
    {
      title: "Marketing cookies",
      text: "These cookies help us measure campaigns, attribute referrals, personalize marketing, and understand the effectiveness of advertising and partner programs.",
    },
  ];
}

export default function Page() {
  const cookieCategories = createCookieCategories();

  return (
    <div>
      <h1 className={styles.h1}>Cookie Policy</h1>
      <p className={styles.update_date}>Policy date: March 4, 2026</p>

      <h2 className={styles.h2}>About This Cookie Policy</h2>
      <p className={styles.p}>
        This Cookie Policy explains how {LEGAL_ENTITY.name} uses cookies and
        similar technologies when you visit novita.ai or use our website and
        Services. This page is intended for visitors and users in the European
        Economic Area, the United Kingdom, and Switzerland.
      </p>

      <h2 className={styles.h2}>1. What Are Cookies</h2>
      <p className={styles.p}>
        Cookies are small text files placed on your device by websites you
        visit. Similar technologies include pixels, local storage, SDKs, and
        scripts that help websites remember information, provide functionality,
        measure usage, and support advertising or referral attribution.
      </p>

      <h2 className={styles.h2}>2. Cookie Categories</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {cookieCategories.map((category) => (
          <section
            key={category.title}
            className="rounded border border-[var(--border)] bg-[var(--fill-4)] p-4"
          >
            <h3 className="font-subtle-medium text-[var(--dark-1)]">
              {category.title}
            </h3>
            <p className={styles.p}>{category.text}</p>
          </section>
        ))}
      </div>

      <h2 className={styles.h2}>3. Specific Cookies and Providers</h2>
      <p className={styles.p}>
        The declaration below is provided by Cookiebot and is generated from
        Cookiebot's scan and categorization of cookies and tracking technologies
        used on this website.
      </p>
      <CookieDeclaration />

      <h2 className={styles.h2}>4. Legal Bases</h2>
      <p className={styles.p}>
        We use strictly necessary cookies to provide the website and Services.
        For preference, statistics, marketing, and other non-essential cookies,
        we rely on your consent before those cookies are set.
      </p>

      <h2 className={styles.h2}>5. International Data Transfers</h2>
      <p className={styles.p}>
        Some cookie providers may process information outside Europe. See our{" "}
        <Link href="/legal/privacy-policy">Privacy Policy</Link> for more
        information about international data transfers.
      </p>

      <h2 className={styles.h2}>6. Your Choices</h2>
      <p className={styles.p}>
        You can accept, reject, or customize optional cookies in the Cookie
        Preference Center. You can also reopen it at any time to change or
        withdraw your consent.
      </p>
      <CookieSettingsLink className="mt-3 inline-flex rounded border border-[var(--border)] px-4 py-2 font-subtle-medium text-[var(--dark-1)] hover:bg-[var(--fill-4)]">
        Open Cookie Settings
      </CookieSettingsLink>

      <h2 className={styles.h2}>7. Browser Controls</h2>
      <p className={styles.p}>
        You can also manage cookies through your browser. These browser-level
        settings may not affect all tracking technologies.
      </p>
      <ul className={styles.ul}>
        <li>
          <a href="https://support.google.com/chrome/answer/95647">Chrome</a>
        </li>
        <li>
          <a href="https://support.mozilla.org/kb/enhanced-tracking-protection-firefox-desktop">
            Firefox
          </a>
        </li>
        <li>
          <a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac">
            Safari
          </a>
        </li>
        <li>
          <a href="https://support.microsoft.com/windows/manage-cookies-in-microsoft-edge-view-allow-block-delete-and-use-168dab11-0753-043d-7c16-ede5947fc64d">
            Microsoft Edge
          </a>
        </li>
      </ul>

      <h2 className={styles.h2}>8. Changes</h2>
      <p className={styles.p}>
        We may update this Cookie Policy from time to time. If we make material
        changes that affect your rights or our use of non-essential cookies, we
        may ask for consent again or provide additional notice.
      </p>

      <h2 className={styles.h2}>9. Contact Us</h2>
      <p className={styles.p}>
        For questions about this Cookie Policy, contact{" "}
        <a href={`mailto:${SUPPORT_EMAIL_LINK}`}>{SUPPORT_EMAIL_LINK}</a>.
      </p>
    </div>
  );
}

"use client";

import styles from "../common.module.scss";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NOVITA_URL } from "@/constants/urls";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export default function Nav() {
  const path = getPathnameWithoutLocale(usePathname());
  const { locale } = useI18n();
  const navList = [
    {
      url: NOVITA_URL.PRIVACY_POLICY,
      text: "Privacy Policy",
      activePaths: ["/legal", NOVITA_URL.PRIVACY_POLICY],
    },
    {
      url: NOVITA_URL.COOKIE_POLICY,
      text: "Cookie Policy",
      activePaths: [NOVITA_URL.COOKIE_POLICY],
    },
    {
      url: NOVITA_URL.TERMS_OF_SERVICE,
      text: "Terms of Service",
      activePaths: [NOVITA_URL.TERMS_OF_SERVICE],
    },
    {
      url: NOVITA_URL.DEDICATED_ENDPOINTS_SLA,
      text: "Dedicated Endpoints SLA",
      activePaths: [NOVITA_URL.DEDICATED_ENDPOINTS_SLA],
    },
  ];
  return (
    <nav className={styles.nav}>
      <ul className={styles.links}>
        {navList.map((one) => (
          <li key={one.url}>
            <Link
              href={getLocalizedPath(one.url, locale)}
              className={
                one.activePaths.includes(path)
                  ? `${styles.link} ${styles.active}`
                  : `${styles.link}`
              }
            >
              {one.text}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

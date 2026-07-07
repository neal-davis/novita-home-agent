"use client";

import { useEffect, useState } from "react";
import styles from "./Nav.module.scss";
import { usePathname, useRouter } from "next/navigation";
import { getLocalizedPath, getPathnameWithoutLocale } from "@/i18n/config";
import { useI18n } from "@/i18n/provider";

export function NavItem({
  text,
  isSelect,
  onClick,
}: {
  text: string;
  icon?: string | null;
  isSelect?: boolean;
  onClick?: (text: string) => void;
}) {
  return (
    <div
      className={`${styles.nav_item} ${
        isSelect ? styles.nav_item_selected : ""
      }`}
      onClick={() => {
        onClick && onClick(text);
      }}
    >
      <span className={styles.text}>{text}</span>
    </div>
  );
}

export function NavBar({
  options = [],
}: {
  options: {
    text: string;
    isSelect: boolean;
    url: string;
    match: string[];
  }[];
  title: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const { locale } = useI18n();
  const businessPathname = getPathnameWithoutLocale(pathname);
  const [selected, setSelected] = useState("Overview");

  useEffect(() => {
    const machOption = options.find((item) => {
      return item.match.includes(businessPathname);
    });
    if (machOption) {
      setSelected(machOption.text);
    }
  }, [businessPathname, options]);

  return (
    <nav className={styles.nav_container}>
      {/* <h3 className={styles.nav_title}>{title}</h3> */}
      <div className={styles.nav_content}>
        {options.map((item) => (
          <NavItem
            key={item.text}
            text={item.text}
            isSelect={selected === item.text}
            onClick={() => {
              router.push(getLocalizedPath(item.url, locale));
            }}
          />
        ))}
      </div>
    </nav>
  );
}

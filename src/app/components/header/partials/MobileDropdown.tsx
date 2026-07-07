"use client";

import { useState, useCallback } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import styles from "./Header.module.scss";

type MobileDropdownProps = {
  children: React.ReactNode;
  dropdownRender: () => React.ReactNode;
};

export default function MobileDropdown({
  children,
  dropdownRender,
}: MobileDropdownProps) {
  const [open, setOpen] = useState(false);

  const handleClick = useCallback(() => {
    setOpen(!open);
  }, [open]);

  return (
    <div className={styles.dropdown_mobile}>
      <div
        className={`${styles.dropdown_mobile_label} ${styles.link_btn}`}
        onClick={handleClick}
      >
        {children}
        {open ? <ChevronUp size={30} /> : <ChevronDown size={30} />}
      </div>
      {open && (
        <div className={styles.dropdown_mobile_content}>{dropdownRender()}</div>
      )}
    </div>
  );
}

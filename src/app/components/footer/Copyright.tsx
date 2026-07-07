"use client";

import { useAppSelector } from "@/store";
import styles from "./Footer.module.scss";

interface CopyrightProps {
  copyrightText: string;
}

export default function Copyright({ copyrightText }: CopyrightProps) {
  const serverTimestamp = useAppSelector(
    (state) => state.config.serverTimestamp,
  );

  // Get current year from server timestamp, fallback to client time if not available
  const currentYear =
    serverTimestamp > 0
      ? new Date(serverTimestamp).getFullYear()
      : new Date().getFullYear();

  // Replace the year in copyright text (assuming format: "© 2025 Novita AI...")
  // Match "© " followed by 4 digits and replace with current year
  const copyrightWithYear = copyrightText.replace(
    /©\s+\d{4}/,
    `© ${currentYear}`,
  );

  return (
    <div className={`${styles.copyright} font-small-console`}>
      <p>{copyrightWithYear.toUpperCase()}</p>
    </div>
  );
}

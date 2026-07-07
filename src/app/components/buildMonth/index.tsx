import { cn } from "@/lib/utils";
import styles from "./index.module.scss";

const smallTag = (text: string, className?: string) => (
  <>
    <span
      className={cn(
        styles.smallTag,
        "px-[8px] py-[3px] font-small-console text-[var(--white)] flex items-center justify-center rounded-[2px]",
        className,
      )}
    >
      <span className={styles.smallTagTxt}>{text}</span>
    </span>
  </>
);

const commonTag = (text: string, className?: string) => (
  <>
    <span className={cn(styles.commonTag, className)}>
      <span className={styles.commonTagTxt}>{text}</span>
    </span>
  </>
);

export default function BuildMonthTag({
  type = "common",
  text = "",
  className,
}: {
  type: "small" | "common";
  text: string;
  className?: string;
}): React.ReactNode {
  return type === "small"
    ? smallTag(text, className)
    : commonTag(text, className);
}

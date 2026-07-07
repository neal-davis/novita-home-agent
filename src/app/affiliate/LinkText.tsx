import CopyToClipboard from "react-copy-to-clipboard";
import styles from "./link.module.scss";
import { message } from "@/components/ui/standard/notify";

export function LinkText({
  children,
  className,
  text,
}: {
  children: React.ReactNode;
  className?: string;
  text: string;
}) {
  return (
    <CopyToClipboard
      text={text ?? ""}
      onCopy={() => {
        message.success("Copied success");
      }}
    >
      <div className={`${styles.link} ${className}`}>
        <span>{children}</span>
        <span className={styles.icon}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
          >
            <g opacity="0.5" stroke="var(--black)">
              <path d="M9 5.5V4C9 2.89543 8.10457 2 7 2H4C2.89543 2 2 2.89543 2 4V7C2 8.10457 2.89543 9 4 9H5.5" />
              <rect x="5" y="5" width="7" height="7" rx="2" />
            </g>
          </svg>
        </span>
      </div>
    </CopyToClipboard>
  );
}

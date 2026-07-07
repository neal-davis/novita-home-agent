import React from "react";
import styles from "./no-data.module.scss";
import { cn } from "@/lib/utils";

const NoData = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title?: string;
    description?: string;
  }
>(({ title = "No Data", description, className, ...props }) => (
  <div
    className={cn("flex flex-col items-center justify-center", className)}
    {...props}
  >
    <p className={styles.no_data_text}>{title}</p>
    {description && <p className={styles.no_data_description}>{description}</p>}
    <img
      src="/billing/no-data.svg"
      alt="no data"
      className={styles.no_data_img}
    />
  </div>
));
NoData.displayName = "NoData";

export { NoData };

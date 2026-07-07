import React from "react";
import styles from "./no-data.module.scss";

const SandboxNoData = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    tips?: string | React.ReactNode;
    description?: string;
  }
>(({ tips }) => (
  <div className="flex flex-col items-center justify-center">
    <p>{tips || "No Data"}</p>
    <img
      src="/billing/no-data.svg"
      alt="no data"
      className={styles.no_data_img}
    />
  </div>
));
SandboxNoData.displayName = "SandboxNoData";

export { SandboxNoData };

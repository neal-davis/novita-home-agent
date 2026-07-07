"use client";

import { useState } from "react";
import ServerlessBillingTable from "./serverlessBillingTable";
import CommonBillingTable from "./commonBillingTable";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import styles from "./billingTable.module.scss";
import { DATA_TYPE } from "./baseEnum";

const BillingTable = () => {
  const [alignment, setAlignment] = useState(DATA_TYPE.GPUINSTANCE);

  return (
    <div className={styles.card}>
      <div style={{ borderBottom: "1px solid var(--gray-2)" }}>
        <div className={styles.title}>
          <span className={styles.titleTxt}>{"Billing Explore"}</span>
          <span className={styles.toggleBtnGroup}>
            <ToggleGroup
              type="single"
              value={alignment}
              onValueChange={(value) =>
                value && setAlignment(value as DATA_TYPE)
              }
              style={{ height: "100%", width: "100%" }}
              aria-label="Large sizes"
            >
              <ToggleGroupItem
                className={styles.toggleBtn}
                style={{
                  marginRight: "8px",
                  background:
                    alignment === DATA_TYPE.GPUINSTANCE ? "var(--gray-2)" : "",
                }}
                value={DATA_TYPE.GPUINSTANCE}
              >
                <span
                  className={
                    alignment === DATA_TYPE.GPUINSTANCE
                      ? styles.selectedTabTxt
                      : styles.unSelectedTabTxt
                  }
                >
                  {"GPU Instance"}
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                className={styles.toggleBtn}
                style={{
                  marginRight: "8px",
                  background:
                    alignment === DATA_TYPE.SERVERLESS ? "var(--gray-2)" : "",
                }}
                value={DATA_TYPE.SERVERLESS}
              >
                <span
                  className={
                    alignment === DATA_TYPE.SERVERLESS
                      ? styles.selectedTabTxt
                      : styles.unSelectedTabTxt
                  }
                >
                  {"Serverless"}
                </span>
              </ToggleGroupItem>
              <ToggleGroupItem
                className={styles.toggleBtn}
                style={{
                  marginRight: "0",
                  background:
                    alignment === DATA_TYPE.NETSTORAGE ? "var(--gray-2)" : "",
                }}
                value={DATA_TYPE.NETSTORAGE}
              >
                <span
                  className={
                    alignment === DATA_TYPE.NETSTORAGE
                      ? styles.selectedTabTxt
                      : styles.unSelectedTabTxt
                  }
                >
                  {"Network Storage"}
                </span>
              </ToggleGroupItem>
            </ToggleGroup>
          </span>
        </div>
      </div>
      <div>
        {alignment === DATA_TYPE.GPUINSTANCE && (
          <CommonBillingTable type={alignment} key={DATA_TYPE.GPUINSTANCE} />
        )}
        {alignment === DATA_TYPE.NETSTORAGE && (
          <CommonBillingTable type={alignment} key={DATA_TYPE.NETSTORAGE} />
        )}
        {alignment === DATA_TYPE.SERVERLESS && <ServerlessBillingTable />}
      </div>
    </div>
  );
};

export default BillingTable;

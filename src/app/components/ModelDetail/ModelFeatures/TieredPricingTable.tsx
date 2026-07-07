import React from "react";
import { TieredBillingConfig } from "@/types/models";
import { formatTokenRange, formatTablePrice } from "./utils";
import styles from "./index.module.scss";

interface TieredPricingTableProps {
  configs: TieredBillingConfig[];
}

const TieredPricingTable: React.FC<TieredPricingTableProps> = ({ configs }) => {
  const hasOutputLength = configs.some(
    (config) => config.output_min_tokens || config.output_max_tokens,
  );
  const hasCacheWrite5m = configs.some(
    (config) =>
      config.cache_creation_input_pricing?.pricePerM &&
      config.cache_creation_input_pricing.pricePerM !== 0,
  );
  const hasCacheWrite1h = configs.some(
    (config) =>
      config.cache_creation_1_hour_input_pricing?.pricePerM &&
      config.cache_creation_1_hour_input_pricing.pricePerM !== 0,
  );
  const hasCacheRead = configs.some(
    (config) =>
      config.cache_read_input_pricing?.pricePerM &&
      config.cache_read_input_pricing.pricePerM !== 0,
  );

  return (
    <div className={styles.tieredSection}>
      <h3 className={styles.tieredTitle}>Tiered pricing</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Input length</th>
              {hasOutputLength && <th>Output length</th>}
              <th>Input price (M tokens)</th>
              <th>Output Price (M tokens)</th>
              {/* Keep cache labels aligned with the non-tiered model detail pricing cards. */}
              {hasCacheWrite5m && <th>Cache Write(5m)</th>}
              {hasCacheWrite1h && <th>Cache Write(1h)</th>}
              {hasCacheRead && <th>Cache Read</th>}
            </tr>
          </thead>
          <tbody>
            {configs.map((config, index) => (
              <tr key={index}>
                <td>
                  {formatTokenRange(config.min_tokens, config.max_tokens)}
                </td>
                {hasOutputLength && (
                  <td>
                    {formatTokenRange(
                      config.output_min_tokens,
                      config.output_max_tokens || 0,
                    )}
                  </td>
                )}
                <td>{formatTablePrice(config.input_pricing.pricePerM)}</td>
                <td>{formatTablePrice(config.output_pricing.pricePerM)}</td>
                {hasCacheWrite5m && (
                  <td>
                    {config.cache_creation_input_pricing?.pricePerM
                      ? formatTablePrice(
                          config.cache_creation_input_pricing.pricePerM,
                        )
                      : "-"}
                  </td>
                )}
                {hasCacheWrite1h && (
                  <td>
                    {config.cache_creation_1_hour_input_pricing?.pricePerM
                      ? formatTablePrice(
                          config.cache_creation_1_hour_input_pricing.pricePerM,
                        )
                      : "-"}
                  </td>
                )}
                {hasCacheRead && (
                  <td>
                    {config.cache_read_input_pricing?.pricePerM
                      ? formatTablePrice(
                          config.cache_read_input_pricing.pricePerM,
                        )
                      : "-"}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TieredPricingTable;

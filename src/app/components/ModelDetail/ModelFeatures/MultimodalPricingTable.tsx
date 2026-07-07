import React from "react";
import { MultimodalPricing } from "@/types/models";
import Big from "big.js";
import styles from "./index.module.scss";

interface MultimodalPricingTableProps {
  pricing: MultimodalPricing;
  currencySymbol?: string;
  unit?: string;
}

const MultimodalPricingTable: React.FC<MultimodalPricingTableProps> = ({
  pricing,
  currencySymbol = "$",
  unit = "M tokens",
}) => {
  const inputPricingItems = pricing.input_price ?? [];
  const outputPricingItems = pricing.output_price ?? [];

  const getModalDisplayName = (modal: string): string => {
    const modalMap: Record<string, string> = {
      text: "Text",
      audio: "Audio",
      image: "Image",
      video: "Video",
    };
    return (
      modalMap[modal.toLowerCase()] ||
      modal.charAt(0).toUpperCase() + modal.slice(1).toLowerCase()
    );
  };

  type ModalCombination = {
    key: string;
    modals: string[];
    displayName: string;
  };

  const getAllModalCombinations = () => {
    const combinations = new Map<string, ModalCombination>();

    const collectCombination = (modals: string[]) => {
      if (!modals || modals.length === 0) return;

      const normalizedModals = modals.map((modal) => modal.toLowerCase());
      const key = normalizedModals.join(", ");

      if (combinations.has(key)) return;

      combinations.set(key, {
        key,
        modals: normalizedModals,
        displayName: normalizedModals.map(getModalDisplayName).join(", "),
      });
    };

    inputPricingItems.forEach((item) => {
      collectCombination(item.modals);
    });

    outputPricingItems.forEach((item) => {
      collectCombination(item.modals);
    });

    return Array.from(combinations.values());
  };

  const modalCombinations = getAllModalCombinations();

  // Format price display with original price (strikethrough)
  const formatPriceWithOriginal = (
    currentPrice: number,
    originalPrice: number,
  ) => {
    const currentPriceStr = Big(currentPrice || 0)
      .div(10000)
      .toString();
    const originalPriceStr = Big(originalPrice || 0)
      .div(10000)
      .toString();

    if (originalPrice === currentPrice || !originalPrice) {
      return <span>{`${currencySymbol}${currentPriceStr} /${unit}`}</span>;
    }

    return (
      <span className="flex flex-wrap gap-1">
        <span className="text-[var(--brand-1)]">
          {`${currencySymbol}${currentPriceStr} /${unit}`}
        </span>
        <span className="text-[var(--gray-1)] line-through">
          {`${currencySymbol}${originalPriceStr} /${unit}`}
        </span>
      </span>
    );
  };

  const getInputPrice = (modalKey: string) => {
    const inputItem = inputPricingItems.find(
      (item) => item.modals.join(", ").toLowerCase() === modalKey,
    );

    if (!inputItem) return null;

    return {
      input:
        Number(
          inputItem.input_token_discount_price ??
            inputItem.inputTokenDiscountPrice,
        ) || 0,
      inputOriginal:
        Number(
          inputItem.input_token_base_price ?? inputItem.inputTokenBasePrice,
        ) || 0,
      cacheRead:
        Number(
          inputItem.cache_read_input_discount_price ??
            inputItem.cacheReadInputDiscountPrice,
        ) || 0,
      cacheReadOriginal:
        Number(
          inputItem.cache_read_input_base_price ??
            inputItem.cacheReadInputBasePrice,
        ) || 0,
      cacheCreation:
        Number(
          inputItem.cache_creation_input_discount_price ??
            inputItem.cacheCreationInputDiscountPrice,
        ) || 0,
      cacheCreationOriginal:
        Number(
          inputItem.cache_creation_input_base_price ??
            inputItem.cacheCreationInputBasePrice,
        ) || 0,
    };
  };

  const getOutputPrice = (modalKey: string) => {
    const outputItem = outputPricingItems.find(
      (item) => item.modals.join(", ").toLowerCase() === modalKey,
    );

    if (!outputItem) return null;

    return {
      output:
        Number(
          outputItem.output_token_discount_price ??
            outputItem.outputTokenDiscountPrice,
        ) || 0,
      outputOriginal:
        Number(
          outputItem.output_token_base_price ?? outputItem.outputTokenBasePrice,
        ) || 0,
    };
  };

  return (
    <div className={styles.multimodalSection}>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>/</th>
              {modalCombinations.map((combination) => (
                <th key={combination.key}>{combination.displayName}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* Input Row */}
            <tr>
              <td>Input</td>
              {modalCombinations.map((combination) => {
                const inputPrice = getInputPrice(combination.key);

                if (!inputPrice) {
                  return <td key={combination.key}>/</td>;
                }

                return (
                  <td key={combination.key}>
                    {formatPriceWithOriginal(
                      inputPrice.input,
                      inputPrice.inputOriginal,
                    )}
                  </td>
                );
              })}
            </tr>

            {/* Output Row */}
            <tr>
              <td>Output</td>
              {modalCombinations.map((combination) => {
                const outputPrice = getOutputPrice(combination.key);

                if (!outputPrice) {
                  return <td key={combination.key}>/</td>;
                }

                return (
                  <td key={combination.key}>
                    {formatPriceWithOriginal(
                      outputPrice.output,
                      outputPrice.outputOriginal,
                    )}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MultimodalPricingTable;

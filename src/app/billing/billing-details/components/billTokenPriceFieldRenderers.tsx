import type { ReactNode } from "react";
import {
  balanceFormat,
  formatBillingPrice,
  formatDecimalAmount,
} from "@/lib/utils/money";
import BillingFieldDetails, {
  BillingFieldDetailsOutput,
} from "./BillingFieldDetails";
import {
  renderFullMultimodalDetails,
  renderFullMultimodalPriceDetails,
} from "./multimodalBillingFields";

const ModelSupportPromptCache: Record<string, string[]> = {
  OpenAI: ["OpenAI", "DeepSeek", "Google", "Zai-org"],
  Anthropic: ["Anthropic"],
};

export const isModelSupportPromptCache = ({
  discountPrice2,
  discountPrice3,
}: {
  discountPrice2?: number;
  discountPrice3?: number;
}) => {
  return (
    (discountPrice2 && discountPrice2 > 0) ||
    (discountPrice3 && discountPrice3 > 0)
  );
};

export const isMultimodalModel = (billingMethod: number) => billingMethod === 7;

export const capitalizeModal = (modal: string): string => {
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

export const renderInputToken = (row: any): ReactNode => {
  if (isMultimodalModel(row.billingMethod)) {
    return renderFullMultimodalDetails(row, "input", "$");
  }

  if (isModelSupportPromptCache(row)) {
    const totalValue =
      (Number(row.billNum0) || 0) +
      (Number(row.billNum2) || 0) +
      (Number(row.billNum3) || 0) +
      (Number(row.billNum5) || 0);
    const details = [
      { label: "Uncached input", value: String(row.billNum0) },
      { label: "Cached (reads) input", value: String(row.billNum2) },
      { label: "Cached (writes:5m) input", value: String(row.billNum3) },
      { label: "Cached (writes:1h) input", value: String(row.billNum5) },
    ];
    return (
      <BillingFieldDetails
        displayValue={String(totalValue)}
        details={details}
      />
    );
  }

  return row.billNum0;
};

export const renderOutputToken = (row: any): ReactNode => {
  if (isMultimodalModel(row.billingMethod)) {
    return renderFullMultimodalDetails(row, "output", "$");
  }
  return row.billNum1;
};

export const renderInputUnitPrice = (
  row: any,
  moneySymbol: string,
): ReactNode => {
  if (
    isMultimodalModel(row.billingMethod) &&
    (row.multimodalPricing?.inputPrice || row.multimodalPricing?.input_price)
  ) {
    return renderFullMultimodalPriceDetails(row, "input", moneySymbol);
  }

  if (isModelSupportPromptCache(row) || row.tieredConfig) {
    const labelDesc = row.tieredConfig
      ? `([${row.tieredConfig.minTokens} ~ ${row.tieredConfig.maxTokens}) tokens)`
      : undefined;

    const details = [
      {
        label: "Uncached input",
        ...(labelDesc && { labelDesc }),
        value:
          row.discountPrice0 === row.basePrice0 ? (
            `${moneySymbol}${formatBillingPrice(row.discountPrice0, row.pricePrecision)}`
          ) : (
            <span className="flex items-center gap-1">
              <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice0, row.pricePrecision)}`}</span>
              <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice0, row.pricePrecision)}`}</span>
            </span>
          ),
      },
      {
        label: "Cached (reads) input",
        ...(labelDesc && { labelDesc }),
        value:
          row.discountPrice2 && row.discountPrice2 > 0 ? (
            row.discountPrice2 === row.basePrice2 ? (
              `${moneySymbol}${formatBillingPrice(row.discountPrice2, row.pricePrecision)}`
            ) : (
              <span className="flex items-center gap-1">
                <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice2, row.pricePrecision)}`}</span>
                <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice2, row.pricePrecision)}`}</span>
              </span>
            )
          ) : (
            "-"
          ),
      },
      {
        label: "Cached (writes:5m) input",
        ...(labelDesc && { labelDesc }),
        value:
          row.discountPrice3 && row.discountPrice3 > 0 ? (
            row.discountPrice3 === row.basePrice3 ? (
              `${moneySymbol}${formatBillingPrice(row.discountPrice3, row.pricePrecision)}`
            ) : (
              <span className="flex items-center gap-1">
                <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice3, row.pricePrecision)}`}</span>
                <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice3, row.pricePrecision)}`}</span>
              </span>
            )
          ) : (
            "-"
          ),
      },
      {
        label: "Cached (writes:1h) input",
        ...(labelDesc && { labelDesc }),
        value:
          row.discountPrice5 && row.discountPrice5 > 0 ? (
            row.discountPrice5 === row.basePrice5 ? (
              `${moneySymbol}${formatBillingPrice(row.discountPrice5, row.pricePrecision)}`
            ) : (
              <span className="flex items-center gap-1">
                <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice5, row.pricePrecision)}`}</span>
                <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice5, row.pricePrecision)}`}</span>
              </span>
            )
          ) : (
            "-"
          ),
      },
    ];
    return <BillingFieldDetails displayValue="Detail" details={details} />;
  }

  return row.discountPrice0 === row.basePrice0 ? (
    `${moneySymbol}${formatBillingPrice(row.discountPrice0, row.pricePrecision)}`
  ) : (
    <span className="flex items-center gap-1">
      <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice0, row.pricePrecision)}`}</span>
      <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice0, row.pricePrecision)}`}</span>
    </span>
  );
};

export const renderOutputUnitPrice = (
  row: any,
  moneySymbol: string,
): ReactNode => {
  if (
    isMultimodalModel(row.billingMethod) &&
    (row.multimodalPricing?.outputPrice || row.multimodalPricing?.output_price)
  ) {
    return renderFullMultimodalPriceDetails(row, "output", moneySymbol);
  }

  if (
    row.tieredConfig &&
    Number(row.tieredConfig?.outputMinTokens || 0) &&
    Number(row.tieredConfig?.outputMaxTokens || 0)
  ) {
    const details = [
      {
        label: "Output",
        labelDesc: `([${row.tieredConfig.outputMinTokens} ~ ${row.tieredConfig.outputMaxTokens}) tokens)`,
        value:
          row.discountPrice1 === row.basePrice1 ? (
            `${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`
          ) : (
            <span className="flex items-center gap-1">
              <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`}</span>
              <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice1, row.pricePrecision)}`}</span>
            </span>
          ),
      },
    ];
    return (
      <BillingFieldDetailsOutput
        displayValue={
          row.discountPrice1 === row.basePrice1 ? (
            `${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`
          ) : (
            <span className="flex items-center gap-1">
              <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`}</span>
              <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice1, row.pricePrecision)}`}</span>
            </span>
          )
        }
        details={details}
      />
    );
  }

  return row.discountPrice1 === row.basePrice1 ? (
    `${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`
  ) : (
    <span className="flex items-center gap-1">
      <span>{`${moneySymbol}${formatBillingPrice(row.discountPrice1, row.pricePrecision)}`}</span>
      <span className="line-through">{`${moneySymbol}${formatBillingPrice(row.basePrice1, row.pricePrecision)}`}</span>
    </span>
  );
};

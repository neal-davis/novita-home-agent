import type { ReactNode } from "react";
import { formatBillingPrice } from "@/lib/utils/money";
import BillingFieldDetails from "./BillingFieldDetails";

type PriceSide = "input" | "output";

type MultimodalPrice = {
  modals?: string[];
  inputTokenBasePrice?: number;
  input_token_base_price?: number;
  inputTokenDiscountPrice?: number;
  input_token_discount_price?: number;
  cacheReadInputBasePrice?: number;
  cache_read_input_base_price?: number;
  cacheReadInputDiscountPrice?: number;
  cache_read_input_discount_price?: number;
  cacheCreationInputBasePrice?: number;
  cache_creation_input_base_price?: number;
  cacheCreationInputDiscountPrice?: number;
  cache_creation_input_discount_price?: number;
  cacheCreation1HourInputBasePrice?: number;
  cache_creation_1_hour_input_base_price?: number;
  cacheCreation1HourInputDiscountPrice?: number;
  cache_creation_1_hour_input_discount_price?: number;
  outputTokenBasePrice?: number;
  output_token_base_price?: number;
  outputTokenDiscountPrice?: number;
  output_token_discount_price?: number;
};

export type BillingDimension = {
  key: string;
  side: PriceSide;
  label: string;
  usageKey: string;
  usage: (row: any) => number;
  price: (row: any) => { base: number; discount: number };
};

const numberValue = (value: unknown) => Number(value ?? 0) || 0;

const normalizeModal = (modal: string) => modal.toLowerCase();

const findModalPrice = (
  row: any,
  side: PriceSide,
  modal: string,
): MultimodalPrice | undefined => {
  const prices =
    side === "input"
      ? row.multimodalPricing?.inputPrice || row.multimodalPricing?.input_price
      : row.multimodalPricing?.outputPrice ||
        row.multimodalPricing?.output_price;

  return (prices || []).find((item: MultimodalPrice) =>
    (item.modals || []).map(normalizeModal).includes(modal),
  );
};

const inputTokenPrice = (modal: string) => (row: any) => {
  const price = findModalPrice(row, "input", modal);
  return {
    base: numberValue(
      price?.inputTokenBasePrice ?? price?.input_token_base_price,
    ),
    discount: numberValue(
      price?.inputTokenDiscountPrice ?? price?.input_token_discount_price,
    ),
  };
};

const outputTokenPrice = (modal: string) => (row: any) => {
  const price = findModalPrice(row, "output", modal);
  return {
    base: numberValue(
      price?.outputTokenBasePrice ?? price?.output_token_base_price,
    ),
    discount: numberValue(
      price?.outputTokenDiscountPrice ?? price?.output_token_discount_price,
    ),
  };
};

const textInputPrice =
  (
    baseKey:
      | "inputTokenBasePrice"
      | "cacheReadInputBasePrice"
      | "cacheCreationInputBasePrice"
      | "cacheCreation1HourInputBasePrice",
    snakeBaseKey:
      | "input_token_base_price"
      | "cache_read_input_base_price"
      | "cache_creation_input_base_price"
      | "cache_creation_1_hour_input_base_price",
    discountKey:
      | "inputTokenDiscountPrice"
      | "cacheReadInputDiscountPrice"
      | "cacheCreationInputDiscountPrice"
      | "cacheCreation1HourInputDiscountPrice",
    snakeDiscountKey:
      | "input_token_discount_price"
      | "cache_read_input_discount_price"
      | "cache_creation_input_discount_price"
      | "cache_creation_1_hour_input_discount_price",
  ) =>
  (row: any) => {
    const price = findModalPrice(row, "input", "text");
    return {
      base: numberValue(price?.[baseKey] ?? price?.[snakeBaseKey]),
      discount: numberValue(price?.[discountKey] ?? price?.[snakeDiscountKey]),
    };
  };

export const getFullMultimodalBillingDimensions = (): BillingDimension[] => [
  {
    key: "textInputUncached",
    side: "input",
    label: "Text input uncached",
    usageKey: "billNum15",
    usage: (row) => numberValue(row.billNum15),
    price: textInputPrice(
      "inputTokenBasePrice",
      "input_token_base_price",
      "inputTokenDiscountPrice",
      "input_token_discount_price",
    ),
  },
  {
    key: "textInputCachedRead",
    side: "input",
    label: "Text input cached read",
    usageKey: "billNum2",
    usage: (row) => numberValue(row.billNum2),
    price: textInputPrice(
      "cacheReadInputBasePrice",
      "cache_read_input_base_price",
      "cacheReadInputDiscountPrice",
      "cache_read_input_discount_price",
    ),
  },
  {
    key: "textInputCachedWrite5m",
    side: "input",
    label: "Text input cached write(5m)",
    usageKey: "billNum3",
    usage: (row) => numberValue(row.billNum3),
    price: textInputPrice(
      "cacheCreationInputBasePrice",
      "cache_creation_input_base_price",
      "cacheCreationInputDiscountPrice",
      "cache_creation_input_discount_price",
    ),
  },
  {
    key: "textInputCachedWrite1h",
    side: "input",
    label: "Text input cached write(1h)",
    usageKey: "billNum5",
    usage: (row) => numberValue(row.billNum5),
    price: textInputPrice(
      "cacheCreation1HourInputBasePrice",
      "cache_creation_1_hour_input_base_price",
      "cacheCreation1HourInputDiscountPrice",
      "cache_creation_1_hour_input_discount_price",
    ),
  },
  {
    key: "imageInput",
    side: "input",
    label: "Image input",
    usageKey: "billNum7",
    usage: (row) => numberValue(row.billNum7),
    price: inputTokenPrice("image"),
  },
  {
    key: "audioInput",
    side: "input",
    label: "Audio input",
    usageKey: "billNum9",
    usage: (row) => numberValue(row.billNum9),
    price: inputTokenPrice("audio"),
  },
  {
    key: "videoInput",
    side: "input",
    label: "Video input",
    usageKey: "billNum11",
    usage: (row) => numberValue(row.billNum11),
    price: inputTokenPrice("video"),
  },
  {
    key: "textOutput",
    side: "output",
    label: "Text output",
    usageKey: "billNum6",
    usage: (row) => numberValue(row.billNum6),
    price: outputTokenPrice("text"),
  },
  {
    key: "imageOutput",
    side: "output",
    label: "Image output",
    usageKey: "billNum8",
    usage: (row) => numberValue(row.billNum8),
    price: outputTokenPrice("image"),
  },
  {
    key: "audioOutput",
    side: "output",
    label: "Audio output",
    usageKey: "billNum10",
    usage: (row) => numberValue(row.billNum10),
    price: outputTokenPrice("audio"),
  },
  {
    key: "videoOutput",
    side: "output",
    label: "Video output",
    usageKey: "billNum12",
    usage: (row) => numberValue(row.billNum12),
    price: outputTokenPrice("video"),
  },
];

export const getFullMultimodalTotal = (row: any, side: PriceSide) =>
  getFullMultimodalBillingDimensions()
    .filter((dimension) => dimension.side === side)
    .reduce((total, dimension) => total + dimension.usage(row), 0);

const formatPrice = (price: number, precision: number, moneySymbol: string) =>
  `${moneySymbol}${formatBillingPrice(price, precision)}`;

const renderPrice = (
  price: { base: number; discount: number },
  precision: number,
  moneySymbol: string,
): ReactNode => {
  const discountPrice = formatPrice(price.discount, precision, moneySymbol);
  const basePrice = formatPrice(price.base, precision, moneySymbol);

  if (!price.base || price.base === price.discount) {
    return discountPrice;
  }

  return (
    <span className="flex items-center gap-1">
      <span>{discountPrice}</span>
      <span className="line-through">{basePrice}</span>
    </span>
  );
};

const getTierLabelDesc = (row: any, side: PriceSide) => {
  if (!row.tieredConfig) {
    return undefined;
  }

  const minTokens =
    side === "input"
      ? row.tieredConfig.minTokens
      : row.tieredConfig.outputMinTokens;
  const maxTokens =
    side === "input"
      ? row.tieredConfig.maxTokens
      : row.tieredConfig.outputMaxTokens;

  if (minTokens === undefined || maxTokens === undefined) {
    return undefined;
  }

  return `([${minTokens} ~ ${maxTokens}) tokens)`;
};

const hasUsageKey = (row: any, dimension: BillingDimension) =>
  row[dimension.usageKey] !== undefined && row[dimension.usageKey] !== null;

const getVisibleDimensions = (row: any, side: PriceSide) =>
  getFullMultimodalBillingDimensions().filter(
    (dimension) => dimension.side === side && hasUsageKey(row, dimension),
  );

export const renderFullMultimodalDetails = (
  row: any,
  side: PriceSide,
  moneySymbol: string,
): ReactNode => {
  const details = getVisibleDimensions(row, side).map((dimension) => ({
    label: dimension.label,
    value: dimension.usage(row),
  }));

  return (
    <BillingFieldDetails
      displayValue={String(getFullMultimodalTotal(row, side))}
      details={details}
    />
  );
};

export const renderFullMultimodalPriceDetails = (
  row: any,
  side: PriceSide,
  moneySymbol: string,
  displayValue: string = "Detail",
): ReactNode => {
  const labelDesc = getTierLabelDesc(row, side);
  const details = getVisibleDimensions(row, side).map((dimension) => {
    const price = dimension.price(row);
    return {
      label: dimension.label,
      ...(labelDesc && { labelDesc }),
      value: renderPrice(price, row.pricePrecision, moneySymbol),
    };
  });

  return <BillingFieldDetails displayValue={displayValue} details={details} />;
};

export const addFullMultimodalExportFields = (
  row: any,
  target: Record<string, string | number>,
) => {
  getFullMultimodalBillingDimensions().forEach((dimension) => {
    const price = dimension.price(row);
    target[`${dimension.key}.usage`] = dimension.usage(row);
    target[`${dimension.key}.base`] = formatBillingPrice(
      price.base,
      row.pricePrecision,
    );
    target[`${dimension.key}.discount`] = formatBillingPrice(
      price.discount,
      row.pricePrecision,
    );
  });
};

const setExportDimension = (
  target: Record<string, string | number>,
  key: string,
  usage: unknown,
  basePrice: unknown,
  discountPrice: unknown,
  pricePrecision: number,
) => {
  target[`${key}.usage`] = numberValue(usage);
  target[`${key}.base`] = formatBillingPrice(
    numberValue(basePrice),
    pricePrecision,
  );
  target[`${key}.discount`] = formatBillingPrice(
    numberValue(discountPrice),
    pricePrecision,
  );
};

export const addLlmCompatibleMultimodalExportFields = (
  row: any,
  target: Record<string, string | number>,
  isMultimodal: boolean,
  supportsPromptCache: boolean,
) => {
  if (isMultimodal) {
    addFullMultimodalExportFields(row, target);
    return;
  }

  const pricePrecision = row.pricePrecision || 1;
  setExportDimension(
    target,
    "textInputUncached",
    row.billNum0,
    row.basePrice0,
    row.discountPrice0,
    pricePrecision,
  );

  if (supportsPromptCache) {
    setExportDimension(
      target,
      "textInputCachedRead",
      row.billNum2,
      row.basePrice2,
      row.discountPrice2,
      pricePrecision,
    );
    setExportDimension(
      target,
      "textInputCachedWrite5m",
      row.billNum3,
      row.basePrice3,
      row.discountPrice3,
      pricePrecision,
    );
    setExportDimension(
      target,
      "textInputCachedWrite1h",
      row.billNum5,
      row.basePrice5,
      row.discountPrice5,
      pricePrecision,
    );
  }

  setExportDimension(
    target,
    "textOutput",
    row.billNum1,
    row.basePrice1,
    row.discountPrice1,
    pricePrecision,
  );
};

export const createFullMultimodalHeaderRows = (
  fixedHeaders: string[],
): {
  headerKeys: string[];
  rows: string[][];
  merges: { s: { r: number; c: number }; e: { r: number; c: number } }[];
} => {
  const dimensions = getFullMultimodalBillingDimensions();
  const headerKeys = [
    ...fixedHeaders,
    ...dimensions.flatMap((dimension) => [
      `${dimension.key}.usage`,
      `${dimension.key}.base`,
      `${dimension.key}.discount`,
    ]),
  ];

  const topRow = [...fixedHeaders];
  const secondRow = fixedHeaders.map(() => "");
  const merges = fixedHeaders.map((_, columnIndex) => ({
    s: { r: 0, c: columnIndex },
    e: { r: 1, c: columnIndex },
  }));

  dimensions.forEach((dimension) => {
    const startColumn = topRow.length;
    topRow.push(dimension.label, "", "");
    secondRow.push(
      "Usage(token)",
      "List price($/M token)",
      "Discount price($/M token)",
    );
    merges.push({
      s: { r: 0, c: startColumn },
      e: { r: 0, c: startColumn + 2 },
    });
  });

  return {
    headerKeys,
    rows: [topRow, secondRow],
    merges,
  };
};

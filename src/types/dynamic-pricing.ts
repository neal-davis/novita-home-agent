/**
 * Dynamic pricing configuration type definitions
 */

// Price factor display config (when values is set, table rows are generated from these values, e.g. duration table shows 1s)
export interface PriceFactorDisplayConfig {
  column: {
    title: string; // Column title
    dataIndex: string; // Data field name (matches fieldMapping key)
    render?: "duration" | "resolution" | "mode" | "size" | "default"; // Render type
    order?: number; // Column order
  };
  valueTransform?: (value: any) => any; // Value transform function
  valueFilter?: (value: any) => boolean; // Value filter function
  /** Optional: explicit values for this factor; table only generates rows for these (e.g. duration [1] shows only 1s) */
  values?: any[];
  /** Optional: default value, used together with values */
  defaultValue?: any;
}

// Pricing configuration
export interface PricingConfig {
  // Field mapping: CEL expression field name -> actual request param path
  fieldMapping: Record<string, string>;
  // Price factor config (optional; if empty, derived from openapiSchema)
  priceFactors?: Record<string, PriceFactorDisplayConfig>;
  // Table display config
  table?: {
    /**
     * Explicitly specify row generation mode (higher priority than auto-inference):
     * - "per-sku": one row per SKU, column values derived from skuCode via columnValueDerivers
     * - "cartesian": Cartesian product of price factor values, each combination matches one SKU
     * When not set, the system auto-infers based on fieldMapping / priceFactors etc.
     */
    rowMode?: "per-sku" | "cartesian";
    priceUnit?: string; // Price unit, e.g. "per second video", "per 10k chars", "per call"
    /**
     * Optional price note: displayed below the model name, clicking opens a new tab
     * e.g. { text: "Minimum charge details", link: "https://docs.example.com/pricing#min-charge" }
     */
    priceNote?: {
      text: string;
      link: string;
    };
    columnOrder?: string[]; // Column order (by dataIndex)
    // Column combiner: how to combine when multiple price factors map to the same column
    // key: dataIndex (column name), value: combiner config
    columnCombiners?: Record<
      string,
      {
        fields: string[]; // Price factor field names to combine (in order)
        separator?: string; // Separator, default "/"
        order?: "asc" | "desc"; // Field order, default is config order
      }
    >;
    /**
     * Column value derivers: derive display column values from params/sku/row (config-only)
     * - key: target column name (e.g. "mode")
     * - value: function string (evaluated to function at runtime) or function
     *
     * ctx shape:
     * - skuCode: matched SKU
     * - params: param set used for SKU match (fieldMapping key -> value)
     * - row: current row data for display (includes transforms/combiner result before derivation)
     * - celExpr: CEL expression string (only in generateRowsFromSKUs mode)
     */
    columnValueDerivers?: Record<
      string,
      | string
      | ((ctx: {
          skuCode?: string | null;
          params: Record<string, any>;
          row: Record<string, any>;
          celExpr?: string;
        }) => any)
    >;
  };
  // Billing formula config (when billingExpr is present)
  billing?: {
    multiplier?: string; // Multiplier field name, e.g. "duration"
    /**
     * Param constructors: build params required for billingExpr execution from table params
     * key: param path used in billingExpr (e.g. "body.image_settings")
     * value: function string or function, builds that param from params
     *
     * Example: if billingExpr uses body.image_settings.map(...).sum(), configure:
     * {
     *   "body.image_settings": "function(params) { return [{ duration: params.duration || 5 }]; }"
     * }
     */
    paramConstructors?: Record<
      string,
      string | ((params: Record<string, any>) => any)
    >;
    /**
     * Default param values for billing/table display when not extracted from CEL (e.g. body.duration)
     * Example: { "body.duration": "1" } means duration column and billing formula default to 1 second
     */
    paramDefaults?: Record<string, string | number>;
  };
}

// Price factor
export interface PriceFactor {
  name: string; // Factor name, matches fieldMapping key
  type: "enum" | "number" | "boolean" | "string";
  values: any[]; // Possible values
  defaultValue?: any;
  displayConfig?: PriceFactorDisplayConfig;
}

// SKU match rule
export interface SKUMatchRule {
  skuCode: string;
  conditions: Array<{
    field: string; // Field name (fieldMapping key)
    operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "has" | "size";
    value?: any; // Compare value
    path?: string; // Full path for has/size ops
  }>;
  logicalOperator?: "AND" | "OR"; // Logic between conditions
}

/** Backend label config: numeric string value = featured sort; non-numeric = card top-right label */
export interface FusionConfigLabel {
  key: string;
  value: string;
}

// Model config (extends backend response shape)
export interface DynamicModelConfig {
  fusionConfig: {
    id: number;
    name: string;
    displayName: string;
    series: string;
    description: string;
    defaultParams?: string;
    /** Backend config: display=top-right badges, features=bottom tags, filter=filter options */
    labels?: FusionConfigLabel[] | string[];
    /** Sort weight, smaller = higher priority */
    rank?: number;
    modelReleasedAt?: string | number | null;
    platformReleaseAt?: string | number | null;
    status: string;
    visibility: boolean;
    whitelistUsers?: string[];
    createdAt?: string;
    updatedAt?: string;
  };
  modelConfig: {
    config: {
      id: number;
      name: string;
      openapiSchema: string; // JSON string
      category: string; // video_gen, image_gen, audio_gen
      realnameVerify: boolean;
      async: boolean;
      billingExpr: string; // Billing expression, e.g. "sku * int(body.duration)"
      status: number;
      priceConfig?: string; // JSON string, pricing config
    };
    skuMappings: Array<{
      id: number;
      modelConfigId: number;
      skuCode: string;
      celExpr: string; // CEL expression
      createdAt: string;
      updatedAt: string;
    }>;
  };
  // Pricing config (frontend)
  pricingConfig?: PricingConfig;
}

// Table row data
export interface DynamicPriceTableRow {
  [key: string]: any; // Price factor values
  skuCode?: string;
  price?: number | string; // Kept for backward compat; prefer originalPrice and discountPrice
  originalPrice?: number | string;
  discountPrice?: number | string;
}

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { getEnabledFusionProductConfigs } from "@/api/fusion-product";
import { getBatchPrice } from "@/api/price";
import { DynamicModelConfig } from "@/types/dynamic-pricing";
import { processValueTransformsBatch } from "@/lib/utils/dynamic-pricing/transform-processor";
import { dealMoneyWithPrecision } from "@/lib/utils/money";
import { MODEL_API_PRODUCT_IDS } from "@/constants/price";
import { processPriceResponse, setModelProductPrice } from "./configSlice";

const CACHE_DURATION = 5 * 60 * 1000;

interface MultimodalState {
  configs: DynamicModelConfig[];
  priceMap: Record<
    string,
    number | string | { originalPrice: number; discountPrice: number }
  >;
  loading: boolean;
  error: string | null;
  lastUpdated: number | null;
  isFetching: boolean;
}

const initialState: MultimodalState = {
  configs: [],
  priceMap: {},
  loading: false,
  error: null,
  lastUpdated: null,
  isFetching: false,
};

export const fetchMultimodalConfigs = createAsyncThunk(
  "multimodal/fetchConfigs",
  async (
    forceRefresh: boolean = false,
    { getState, rejectWithValue, dispatch },
  ) => {
    const state = (getState() as { multimodal: MultimodalState }).multimodal;

    if (!forceRefresh && state.configs.length > 0 && state.lastUpdated) {
      const cacheAge = Date.now() - state.lastUpdated;
      if (cacheAge < CACHE_DURATION) {
        return {
          configs: state.configs,
          priceMap: state.priceMap,
        };
      }
    }

    try {
      const configs = await getEnabledFusionProductConfigs();
      const processedConfigs = processValueTransformsBatch(configs);

      const dynamicSKUCodes: string[] = [];
      processedConfigs.forEach((config) => {
        if (
          config.modelConfig.skuMappings &&
          config.modelConfig.skuMappings.length > 0
        ) {
          config.modelConfig.skuMappings.forEach((mapping) => {
            if (mapping.skuCode && !dynamicSKUCodes.includes(mapping.skuCode)) {
              dynamicSKUCodes.push(mapping.skuCode);
            }
          });
        }
      });

      const allSKUCodes = [
        ...(MODEL_API_PRODUCT_IDS as unknown as string[]),
        ...dynamicSKUCodes,
      ];

      const dynamicPriceMap: Record<
        string,
        number | string | { originalPrice: number; discountPrice: number }
      > = {};

      if (allSKUCodes.length > 0) {
        try {
          const priceResponse = await getBatchPrice({
            businessType: "model_api",
            productIds: allSKUCodes,
          });

          priceResponse.forEach((priceItem: any) => {
            if (dynamicSKUCodes.includes(priceItem.productId)) {
              const basePrice0Num = Number(priceItem.basePrice0);
              const discountPrice0Num =
                priceItem.discountPrice0 !== undefined &&
                priceItem.discountPrice0 !== null &&
                priceItem.discountPrice0 !== ""
                  ? Number(priceItem.discountPrice0)
                  : undefined;
              const precisionNum = Number(priceItem.pricePrecision);

              const originalPrice = dealMoneyWithPrecision(
                basePrice0Num,
                precisionNum,
                4,
              );
              const discountPrice =
                discountPrice0Num !== undefined && !isNaN(discountPrice0Num)
                  ? dealMoneyWithPrecision(discountPrice0Num, precisionNum, 4)
                  : undefined;

              if (
                discountPrice !== undefined &&
                discountPrice !== "-" &&
                typeof discountPrice === "number" &&
                typeof originalPrice === "number" &&
                discountPrice < originalPrice
              ) {
                dynamicPriceMap[priceItem.productId] = {
                  originalPrice,
                  discountPrice,
                };
              } else {
                dynamicPriceMap[priceItem.productId] = originalPrice;
              }
            }
          });

          const processedPrices = processPriceResponse(priceResponse);
          dispatch(setModelProductPrice(processedPrices));

          priceResponse.forEach((priceItem: any) => {
            const basePrice0Num = Number(priceItem.basePrice0);
            const discountPrice0Num =
              priceItem.discountPrice0 !== undefined &&
              priceItem.discountPrice0 !== null &&
              priceItem.discountPrice0 !== ""
                ? Number(priceItem.discountPrice0)
                : undefined;
            const precisionNum = Number(priceItem.pricePrecision);

            const originalPrice = dealMoneyWithPrecision(
              basePrice0Num,
              precisionNum,
              4,
            );
            const discountPrice =
              discountPrice0Num !== undefined && !isNaN(discountPrice0Num)
                ? dealMoneyWithPrecision(discountPrice0Num, precisionNum, 4)
                : undefined;

            if (
              discountPrice !== undefined &&
              discountPrice !== "-" &&
              typeof discountPrice === "number" &&
              typeof originalPrice === "number" &&
              discountPrice < originalPrice
            ) {
              dynamicPriceMap[priceItem.productId] = {
                originalPrice,
                discountPrice,
              };
            } else {
              dynamicPriceMap[priceItem.productId] = originalPrice;
            }
          });
        } catch (priceError) {
          console.warn("Failed to fetch prices:", priceError);
        }
      }

      // Sort by fusionConfig.rank ascending (smaller = higher priority), models without rank go last
      const sortedConfigs = [...processedConfigs].sort((a, b) => {
        const rankA = a.fusionConfig?.rank ?? Number.MAX_SAFE_INTEGER;
        const rankB = b.fusionConfig?.rank ?? Number.MAX_SAFE_INTEGER;
        return rankA - rankB;
      });

      return {
        configs: sortedConfigs,
        priceMap: dynamicPriceMap,
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error
          ? error.message
          : "Failed to fetch multimodal configs",
      );
    }
  },
  {
    condition: (forceRefresh = false, { getState }) => {
      const state = (getState() as any).multimodal;
      if (state?.isFetching) return false;
      if (!forceRefresh && state?.configs?.length > 0 && state?.lastUpdated) {
        const cacheAge = Date.now() - state.lastUpdated;
        if (cacheAge < CACHE_DURATION) return false;
      }
      return true;
    },
  },
);

export const multimodalSlice = createSlice({
  name: "multimodal",
  initialState,
  reducers: {
    clearMultimodalConfigs(state) {
      state.configs = [];
      state.priceMap = {};
      state.lastUpdated = null;
      state.error = null;
    },
    setMultimodalConfigs(
      state,
      action: PayloadAction<{
        configs: DynamicModelConfig[];
        priceMap?: Record<
          string,
          number | string | { originalPrice: number; discountPrice: number }
        >;
      }>,
    ) {
      state.configs = action.payload.configs;
      if (action.payload.priceMap) {
        state.priceMap = action.payload.priceMap;
      }
      state.lastUpdated = Date.now();
      state.error = null;
    },
    setMultimodalPriceMap(
      state,
      action: PayloadAction<
        Record<
          string,
          number | string | { originalPrice: number; discountPrice: number }
        >
      >,
    ) {
      state.priceMap = {
        ...state.priceMap,
        ...action.payload,
      };
    },
    clearError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMultimodalConfigs.pending, (state) => {
        if (state.configs.length === 0 || !state.lastUpdated) {
          state.loading = true;
        }
        state.isFetching = true;
        state.error = null;
      })
      .addCase(fetchMultimodalConfigs.fulfilled, (state, action) => {
        state.loading = false;
        state.isFetching = false;
        if (action.payload.configs.length > 0) {
          state.configs = action.payload.configs;
          state.priceMap = action.payload.priceMap;
          state.lastUpdated = Date.now();
        } else if (state.configs.length === 0) {
          state.configs = [];
          state.priceMap = {};
          state.lastUpdated = Date.now();
        }
        state.error = null;
      })
      .addCase(fetchMultimodalConfigs.rejected, (state, action) => {
        state.loading = false;
        state.isFetching = false;
        state.error =
          (action.payload as string) || "Failed to fetch multimodal configs";
      });
  },
});

export const {
  clearMultimodalConfigs,
  setMultimodalConfigs,
  setMultimodalPriceMap,
  clearError,
} = multimodalSlice.actions;

export const selectMultimodalConfigs = (state: {
  multimodal: MultimodalState;
}): DynamicModelConfig[] => state.multimodal.configs;

export const selectMultimodalConfigsByCategory =
  (category: "image_gen" | "video_gen" | "audio_gen") =>
  (state: { multimodal: MultimodalState }): DynamicModelConfig[] => {
    return state.multimodal.configs.filter(
      (config) => config.modelConfig.config.category === category,
    );
  };

export const selectMultimodalPriceMap = (state: {
  multimodal: MultimodalState;
}): Record<
  string,
  number | string | { originalPrice: number; discountPrice: number }
> => state.multimodal.priceMap;

export const selectMultimodalLoading = (state: {
  multimodal: MultimodalState;
}): boolean => state.multimodal.loading;

export const selectMultimodalError = (state: {
  multimodal: MultimodalState;
}): string | null => state.multimodal.error;

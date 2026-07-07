export interface ProductPriceObj {
  businessType: string;
  productCategory: string;
  productId: string;
  basePrice0: number;
  basePrice1: number;
  basePrice2: number;
  basePrice3: number;
  basePrice4: number;
  discountPrice0: number;
  discountPrice1: number;
  discountPrice2: number;
  discountPrice3: number;
  discountPrice4: number;
  priceUnit: number;
  pricePrecision: number;
  displayPriceUnit: string;
}

/** Dynamic model price result (SKU match) */
export interface CalculatePriceDynamicResult {
  skuCode: string;
  price: number;
  unit?: string;
}

/** Static model price result */
export interface CalculatePriceStaticResult {
  originalPrice: number;
  discountPrice: number;
  unit?: string;
}

/** Price result from getModelPriceFromConfigsAndMap / calculatePlaygroundPrice */
export type CalculatePriceResult =
  | CalculatePriceDynamicResult
  | CalculatePriceStaticResult;

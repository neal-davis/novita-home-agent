import { request } from "./api";
import { ProductPriceObj } from "@/types/price";

export function getBatchPrice(params: {
  businessType: string;
  productIds: string[];
}): Promise<ProductPriceObj[]> {
  return request({
    url: "/v1/product/batch-price",
    method: "POST",
    data: params,
  }).then((res) => {
    return res.products;
  });
}

import { request } from "./api";
import { convertRawModelToLLMModelClient } from "@/lib/utils/models";

export async function getBuildMonthModelList(params: { signal?: AbortSignal }) {
  const response = await request({
    url: "/v1/product/build-month/model/list",
    signal: params.signal,
  });

  if (response?.data && Array.isArray(response.data)) {
    response.data = response.data.map(convertRawModelToLLMModelClient);
  }

  return response;
}

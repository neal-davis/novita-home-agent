import { BASE_API_URL } from "@/api/api";
import { MODEL_LIST_PAGE_SIZE } from "@/constants/constants";
import { sanitizePromptByLenght } from "@/lib/utils/playground";
import { SAMPLER_OPTIONS } from "@/app/models/constants/funcs";
import {
  LLMModelStatus,
  ModelLabelMap,
  LLMModelWithStatus,
  LLMModel,
} from "@/types/models";
import Cookies from "js-cookie";
import { convertRawModelToLLMModelClient } from "@/lib/utils/models";

function getAuthToken(providedToken?: string): string {
  if (providedToken) {
    return providedToken;
  }

  if (typeof window !== "undefined") {
    return Cookies.get("token") || "";
  }

  return "";
}

function filterNonDeprecatedModels(models: any[]) {
  return models.filter((one: any) => one.status !== LLMModelStatus.Deprecated);
}

function buildModelRequestHeaders(token: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function getModels(queryParams?: {
  pageIndex?: number;
  pageSize?: number;
  type?: string;
  visibility?: string;
  filter?: {
    is_nsfw?: boolean;
    source?: string;
    tags?: string;
    is_sdxl?: boolean | undefined;
    is_inpainting?: boolean;
    query?: string;
    base_model?: string;
    model_version_id?: number;
    in_whitelist?: boolean;
  };
  cursor?: string;
  fetchId?: number;
}): Promise<{
  models: any[];
  nextCursor: string;
  fetchId?: number | undefined;
}> {
  const pageIndex = queryParams?.pageIndex || 0;
  const pageSize = queryParams?.pageSize || MODEL_LIST_PAGE_SIZE;
  const queryObj: { [key: string]: any } = {
    "pagination.limit": queryParams?.pageSize?.toString() || "100",
    "pagination.cursor": `c_${pageIndex * pageSize}`,
    "filter.source":
      queryParams?.filter?.source === undefined
        ? "civitai"
        : queryParams.filter.source,
    "filter.tags":
      queryParams?.filter?.tags == "ALL"
        ? ""
        : (queryParams?.filter?.tags ?? ""),
    "filter.query": queryParams?.filter?.query || "",
    "filter.base_model":
      queryParams?.filter?.base_model == "ALL"
        ? ""
        : encodeURIComponent(
            queryParams?.filter?.base_model?.replace(" ", "_") ?? "",
          ),
  };
  if (queryParams && queryParams.filter) {
    if (queryParams.filter.is_sdxl !== undefined) {
      queryObj["filter.is_sdxl"] = queryParams.filter.is_sdxl ? 1 : 0;
    }
    if (queryParams.filter.is_inpainting !== undefined) {
      queryObj["filter.is_inpainting"] = queryParams.filter.is_inpainting
        ? 1
        : 0;
    }
    if (queryParams.filter.model_version_id !== undefined) {
      queryObj["filter.model_version_id"] = queryParams.filter.model_version_id;
    }
    if (queryParams.filter.in_whitelist !== undefined) {
      queryObj["filter.in_whitelist"] = queryParams.filter.in_whitelist;
    }
  }
  if (queryParams && queryParams.type) {
    queryObj["filter.types"] = queryParams.type;
  }
  if (queryParams && queryParams.visibility) {
    queryObj["filter.visibility"] = queryParams.visibility;
  }
  const queryUrl = new URLSearchParams(queryObj).toString();
  const result = await fetch(`${BASE_API_URL}/v3/model?` + queryUrl, {
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });

  const res = await result.json();

  if (res.models && Array.isArray(res.models)) {
    const modelsToUse = res.models.filter((item: any) => {
      return item.status === 1;
    });
    return {
      models: modelsToUse,
      nextCursor: res?.pagination?.next_cursor,
      fetchId: queryParams?.fetchId,
    };
  }
  return {
    models: [],
    nextCursor: res?.pagination?.next_cursor,
    fetchId: queryParams?.fetchId,
  };
}

export async function getModelDetail(
  modelId: number,
  model?: Model,
): Promise<ModelDetails | null> {
  const { models } = await getModels({
    filter: {
      model_version_id: modelId,
    },
  });
  if (models.length === 0) {
    return null;
  }
  const modelInfo = models[0];
  const modelDetail = modelInfo.model_details?.[0] || {};

  const details: ModelDetails = {
    model_id: modelInfo.id,
    is_nsfw: modelInfo.is_nsfw,
    cover_url: modelInfo.cover_url,
    prompt: sanitizePromptByLenght(modelDetail.prompt || ""),
    negative_prompt: sanitizePromptByLenght(modelDetail.negative_prompt || ""),
    model_name: modelInfo.sd_name,
    width: Math.min(modelDetail.width || 0, 2048),
    height: Math.min(modelDetail.height || 0, 2048),
    sampler_name: modelDetail.sampler_name,
    cfg_scale: modelDetail.cfg_scale,
    steps: modelDetail.steps || 20,
    tags: modelInfo.tags || [],
    seed: modelDetail.seed,
    name: modelInfo.sd_name_in_api,
    type: modelInfo.type?.name || "",
    hash_sha256: modelInfo.hash_sha256,
    is_sdxl:
      modelInfo.is_sdxl !== undefined
        ? modelInfo.is_sdxl
        : model
          ? model.is_sdxl
          : undefined,
    is_sd3:
      modelInfo.is_sd3 !== undefined
        ? modelInfo.is_sd3
        : model
          ? model.is_sd3
          : undefined,
    base_model: modelInfo.base_model || (model ? model.base_model : undefined),
    in_whitelist: modelInfo.in_whitelist,
  };
  if (modelDetail.sampler_name) {
    const d = SAMPLER_OPTIONS.find((s) => s === modelDetail.sampler_name);
    if (d) {
      details.sampler_name = d;
    } else {
      details.sampler_name = "DPM++ 2M Karras";
    }
  }
  return details;
}

export async function getCivitaiModelDetails(modelId: string) {
  const result = await fetch(`https://civitai.com/api/v1/models/${modelId}`, {
    method: "GET",
    mode: "cors",
    headers: {
      "Content-Type": "application/json",
    },
    cache: "no-cache",
  });
  const res = await result.json();
  if (res.id) {
    return res;
  }
  return null;
}

export async function searchCivitaiModel(
  civitaiModelVersions: any[],
  maxCount = 5,
) {
  const result: Model[] = [];
  let totalFetched = 0;

  // Loop until the specified count is met or the list is traversed
  while (
    result.length < maxCount &&
    totalFetched < civitaiModelVersions.length
  ) {
    const batch = civitaiModelVersions.slice(
      totalFetched,
      totalFetched + maxCount,
    );

    // Call another interface to batch retrieve data, assume fetchBatchFromAPI, returns a Promise
    const batchPromises = batch.map(async (item) => {
      try {
        const data = await getModelDetail(item.id);
        // Check if valid data is retrieved
        return data;
      } catch (error) {
        // Handle errors, you can process them according to actual situations
        console.error(
          `Error fetching data for item with ID ${item.id}: ${error}`,
        );
        return null;
      }
    });

    // Wait for all parallel requests to complete
    const batchResults = await Promise.all(batchPromises);
    const modelResults: Model[] = [];
    batchResults.map((nDetails, idx) => {
      if (nDetails === null) {
        return;
      }
      const modelVersion = civitaiModelVersions[totalFetched + idx];
      modelResults.push({
        base_model: modelVersion.baseModel,
        base_model_type: modelVersion.baseModelType,
        categories: [],
        cover_url: nDetails.cover_url || "",
        hash_sha256: nDetails.hash_sha256,
        id: nDetails.model_id,
        name: nDetails.name,
        sd_name: nDetails.model_name,
        sd_name_in_api: nDetails.model_name,
        source: "civitai",
        status: nDetails.status || 1,
        tags: nDetails.tags,
        type: {
          name: nDetails.type,
          display_name: nDetails.type,
        },
        is_nsfw: nDetails.is_nsfw || false,
        is_sdxl: nDetails.is_sdxl || false,
        is_sd3: nDetails.is_sd3 || false,
      });
    });
    result.push(...modelResults);
    totalFetched += batchResults.length;
  }

  return result;
}

export async function getModelList(
  providedToken?: string,
): Promise<LLMModelWithStatus[]> {
  try {
    const token = getAuthToken(providedToken);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/model/list?include_de=true`;
    const result = await fetch(url, {
      mode: "cors",
      headers: buildModelRequestHeaders(token),
      cache: "no-store",
    });
    const res = await result.json();
    return Array.isArray(res.data)
      ? filterNonDeprecatedModels(res.data).map((one: any) =>
          convertRawModelToLLMModelClient(one, "chat"),
        )
      : [];
  } catch (error) {
    console.error("getModelList API error:", error);
    return [];
  }
}

export async function getLLMOnDemandModels(
  limit: number = 6,
  providedToken?: string,
): Promise<
  Array<
    LLMModel & {
      id: string;
      title: string;
      displayName: string;
    }
  >
> {
  try {
    const token = getAuthToken(providedToken);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/model/list?include_de=true`;
    const result = await fetch(url, {
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });
    const res = await result.json();
    if (!Array.isArray(res.data)) {
      return [];
    }
    const onDemandModels = res.data.filter((one: any) => {
      const displayLabels = (one.labels ?? [])
        .filter((one: any) => one.key === ModelLabelMap.Display)
        .map((one: any) => one.value);
      const hasOnDemandLabel = displayLabels.includes(ModelLabelMap.Dedicated);
      return hasOnDemandLabel;
    });
    return onDemandModels.slice(0, limit).map((one: any) => ({
      ...one,
      id: one.id,
      title: one.title,
      displayName: one.display_name,
    }));
  } catch (error) {
    return [];
  }
}

export async function getEmbeddingModelList(
  providedToken?: string,
): Promise<LLMModelWithStatus[]> {
  try {
    const token = getAuthToken(providedToken);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/model/list?model_type=embedding&include_de=true`;
    const result = await fetch(url, {
      mode: "cors",
      headers: buildModelRequestHeaders(token),
      cache: "no-store",
    });
    const res = await result.json();
    return Array.isArray(res.data)
      ? filterNonDeprecatedModels(res.data).map((one: any) =>
          convertRawModelToLLMModelClient(one, "embedding"),
        )
      : [];
  } catch (error) {
    return [];
  }
}

export async function getRerankerModelList(
  providedToken?: string,
): Promise<LLMModelWithStatus[]> {
  try {
    const token = getAuthToken(providedToken);
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/v1/product/model/list?model_type=reranker&include_de=true`;
    const result = await fetch(url, {
      mode: "cors",
      headers: buildModelRequestHeaders(token),
      cache: "no-store",
    });
    const res = await result.json();
    return Array.isArray(res.data)
      ? filterNonDeprecatedModels(res.data).map((one: any) =>
          convertRawModelToLLMModelClient(one, "reranker"),
        )
      : [];
  } catch (error) {
    return [];
  }
}

export async function getFullLLMModels(
  filter: Array<"chat" | "embedding" | "reranker"> = [
    "chat",
    "embedding",
    "reranker",
  ],
  providedToken?: string,
) {
  try {
    const hasChatFilter = filter.includes("chat");
    const hasEmbeddingFilter = filter.includes("embedding");
    const hasRerankerFilter = filter.includes("reranker");
    const [llmModelList, embeddingModelList, rerankerModelList] =
      await Promise.all([
        hasChatFilter ? getModelList(providedToken) : Promise.resolve([]),
        hasEmbeddingFilter
          ? getEmbeddingModelList(providedToken)
          : Promise.resolve([]),
        hasRerankerFilter
          ? getRerankerModelList(providedToken)
          : Promise.resolve([]),
      ]);

    return llmModelList.concat(embeddingModelList).concat(rerankerModelList);
  } catch (error) {
    console.error("Error fetching LLM models:", error);
    return [];
  }
}

/**
 * @param filter
 * @param providedToken
 */
export async function getFullLLMModelsWithCache(
  filter: Array<"chat" | "embedding" | "reranker"> = ["chat"],
  providedToken?: string,
): Promise<LLMModelWithStatus[]> {
  try {
    const token = getAuthToken(providedToken);
    const filterParam = filter.join(",");

    const result = await fetch(`/api/llm-models?filter=${filterParam}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      cache: "default",
    });

    if (!result.ok) {
      throw new Error(`Failed to fetch models: ${result.status}`);
    }

    const res = await result.json();
    return Array.isArray(res.data) ? res.data : [];
  } catch (error) {
    console.error("Error fetching LLM models with cache:", error);
    console.log("Falling back to direct API call...");
    return getFullLLMModels(filter, providedToken);
  }
}

import { BASE_API_URL } from "@/api/api";
import { SAMPLER_OPTIONS } from "@/app/models/constants/funcs";

export type Model = {
  base_model: string;
  base_model_type: string;
  categories: string[];
  cover_url: string;
  hash_sha256: string;
  id: number;
  name: string;
  sd_name: string;
  sd_name_in_api: string;
  source: string;
  status: number;
  tags: string[];
  type: {
    name: string;
    display_name: string;
  };
  is_nsfw: boolean;
};

export type ModelDetails = {
  model_id: number;
  name: string;
  type: string;
  model_name: string;
  is_nsfw?: boolean;
  cover_url?: string;
  status?: number;
  hash_sha256: string;
  cfg_scale: number;
  width: number;
  height: number;
  prompt: string;
  negative_prompt: string;
  sampler_name: string;
  steps: number;
  seed: number;
  tags: string[];
};

export async function getModels(queryParams?: {
  pageIndex?: number;
  pageSize?: number;
  type?: string;
  tag?: string;
  nsfw?: boolean;
  source?: string;
  visibility?: string;
}): Promise<any[]> {
  console.log("getting models!!!");
  const pageIndex = queryParams?.pageIndex || 0;
  const pageSize = queryParams?.pageSize || 100;
  const queryObj: { [key: string]: any } = {
    "pagination.limit": queryParams?.pageSize?.toString() || "100",
    "pagination.cursor": `c_${pageIndex * pageSize}`,
    "filter.is_nsfw": queryParams?.nsfw ? "true" : "false",
    "filter.source": queryParams?.source || "civitai",
    "filter.tags": queryParams?.tag == "ALL" ? "" : queryParams?.tag ?? "",
  };
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
  console.log(result);

  const res = await result.json();

  if (res.models && Array.isArray(res.models)) {
    const modelsToUse = res.models.filter((item: any) => {
      return item.status === 1;
    });
    return modelsToUse;
  }
  return [];
}

export async function getModelDetail(modelId: number) {
  const result = await fetch(
    `${BASE_API_URL}/v2/model/civitai_version_id/${modelId}`,
    {
      method: "GET",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-cache",
    },
  );
  const res = await result.json();
  if (res.code === 0 && res.data?.model) {
    const mDetails = res.data.model;
    const details: ModelDetails = {
      model_id: mDetails.civitai_version_id,
      cover_url: mDetails.civitai_image_url,
      prompt: mDetails.civitai_image_prompt,
      negative_prompt: mDetails.civitai_image_negative_prompt,
      model_name: mDetails.sd_name,
      width: mDetails.civitai_image_width,
      height: mDetails.civitai_image_height,
      sampler_name: mDetails.civitai_image_sampler_name,
      cfg_scale: mDetails.civitai_image_cfg_scale,
      steps: mDetails.civitai_image_steps,
      tags: mDetails.civitai_tags.split(","),
      seed: mDetails.seed,
      name: mDetails.name,
      type: mDetails.type,
      hash_sha256: mDetails.hash,
    };
    if (mDetails.civitai_image_sampler_name) {
      const d = SAMPLER_OPTIONS.find(
        (s) => s === res.civitai_image_sampler_name,
      );
      if (d) {
        details.sampler_name = d;
      } else {
        details.sampler_name = "DPM++ 2M Karras";
      }
    }
    return details;
  }
  return null;
}

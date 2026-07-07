"use client";

import { useMemo } from "react";
import ModelItem from "./modelItem";
import styles from "./Detail.module.css";

// type V2Model = {
//   type: string;
//   model_id: string;
//   hash: string;
//   name: string;
//   sd_name: string;
//   civitai_favorite_count: number;
//   civitai_image_url: string;
//   civitai_image_prompt: string;
//   civitai_image_negative_prompt: string;
//   civitai_image_sampler_name: string;
//   civitai_image_height: number;
//   civitai_image_width: number;
//   civitai_image_steps: number;
//   civitai_image_cfg_scale: number;
//   civitai_nsfw: boolean;
// };

export default function Detail(data: ModelDetails) {
  const memoData = useMemo(
    () => ({
      base_model: data.model_name,
      base_model_type: data.type,
      cover_url: data.cover_url || "",
      hash_sha256: data.hash_sha256,
      id: data.model_id,
      name: data.name,
      sd_name: data.model_name,
      sd_name_in_api: data.name,
      source: "",
      status: 1,
      tags: [],
      type: {
        name: data.type,
        display_name: data.type,
      },
      is_nsfw: !!data.is_nsfw,
      categories: [],
    }),
    [data],
  );
  return (
    <div className={styles.detail_page}>
      <h1 className={styles.title}>Stable Diffusion {data.name}</h1>
      <div className={styles.model_info}>
        {data.cover_url && (
          <div className={styles.img_wrap}>
            <ModelItem {...memoData} />
          </div>
        )}
        <table className={styles.table}>
          <tbody>
            <tr>
              <td className={styles.left}>Type</td>
              <td>{data.type}</td>
            </tr>
            <tr>
              <td className={styles.left}>Model Name</td>
              <td>{data.model_name}</td>
            </tr>
            <tr>
              <td className={styles.left}>Prompt</td>
              <td>
                <div className={styles.prompt_input}>{data.prompt}</div>
              </td>
            </tr>
            <tr>
              <td className={styles.left}>Negative Prompt</td>
              <td>
                <div className={styles.prompt_input}>
                  {data.negative_prompt}
                </div>
              </td>
            </tr>
            <tr>
              <td className={styles.left}>Cfg Scale</td>
              <td>{data.cfg_scale}</td>
            </tr>
            <tr>
              <td className={styles.left}>Steps</td>
              <td>{data.steps}</td>
            </tr>
            <tr>
              <td className={styles.left}>Size</td>
              <td>
                W: {data.width} / H: {data.height}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

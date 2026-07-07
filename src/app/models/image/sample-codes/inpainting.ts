export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  model_name: "{{model_name}}",
  image_base64: "{{image_base64}}",
  mask_image_base64: "{{mask_image_base64}}",
  prompt: "{{prompt}}",
  negative_prompt: "{{negative_prompt}}",
  sd_vae: "{{sd_vae}}",
  loras: {{loras}},
  embeddings: {{embeddings}},
  image_num: 1,
  mask_blur: {{mask_blur}},
  sampler_name: "{{sampler_name}}",
  clip_skip: {{clip_skip}},
  guidance_scale: {{guidance_scale}},
  steps: {{steps}},
  strength: {{strength}},
  seed: {{seed}},
  inpainting_full_res: {{inpainting_full_res}},
  inpainting_full_res_padding: {{inpainting_full_res_padding}},
  inpainting_mask_invert: {{inpainting_mask_invert}},
  initial_noise_multiplier: {{initial_noise_multiplier}},
};
novitaClient.inpainting({ request: params })
  .then((res) => {
    if (res && res.task_id) {
      const timer = setInterval(() => {
        novitaClient.progress({
          task_id: res.task_id,
        })
          .then((res) => {
            if (res.status === 2) {
              console.log("finished!", res.imgs);
              clearInterval(timer);
            }
            if (res.status === 3 || res.status === 4) {
              console.warn("failed!", res.failed_reason);
              clearInterval(timer);
            }
            if (res.status === 1) {
              console.log("progress", res.current_images);
            }
          })
          .catch((err) => {
            console.error("progress error:", err);
          })
      }, 1000);
    }
  })
  .catch((err) => {
    console.error("img2img error:", err);
  })`;

const python = `import os
import base64
from novita_client import NovitaClient
from novita_client.utils import base64_to_image

client = NovitaClient("your_api_key")
res = client.inpainting(
    model_name = "{{model_name}}",
    image="{{image_base64}}",
    mask="{{mask_image_base64}}",
    seed={{seed}},
    guidance_scale={{guidance_scale}},
    steps={{steps}},
    image_num={{image_num}},
    prompt="{{prompt}}",
    negative_prompt="{{negative_prompt}}",
    sampler_name="{{sampler_name}}",
    inpainting_full_res={{inpainting_full_res}},
    inpainting_full_res_padding={{inpainting_full_res_padding}},
    inpainting_mask_invert={{inpainting_mask_invert}},
    initial_noise_multiplier={{initial_noise_multiplier}},
    mask_blur={{mask_blur}},
    clip_skip={{clip_skip}},
    strength={{strength}},
)
with open("result/result_image/inpaintingsdk.jpeg", "wb") as image_file:
    image_file.write(base64.b64decode(res.images_encoded[0]))`;

export const bash = `curl \\
 -X POST https://api.novita.ai/v3/async/inpainting \\
 -H "Authorization: Bearer $your_api_key" \\
 -H "Content-Type: application/json" \\
 -d '{
  "model_name": "{{model_name}}",
  "image_base64": "{{image_base64}}",
  "mask_image_base64": "{{mask_image_base64}}",
  "prompt": "{{prompt}}",
  "negative_prompt": "{{negative_prompt}}",
  "sd_vae": "{{sd_vae}}",
  "loras": {{loras}},
  "embeddings": {{embeddings}},
  "image_num": 1,
  "mask_blur": {{mask_blur}},
  "sampler_name": "{{sampler_name}}",
  "clip_skip": {{clip_skip}},
  "guidance_scale": {{guidance_scale}},
  "steps": {{steps}},
  "strength": {{strength}},
  "seed": {{seed}},
  "inpainting_full_res": {{inpainting_full_res}},
  "inpainting_full_res_padding": {{inpainting_full_res_padding}},
  "inpainting_mask_invert": {{inpainting_mask_invert}},
  "initial_noise_multiplier": {{initial_noise_multiplier}},
 }'
 
 curl \\
 -X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
 -H "Authorization: Bearer $your_api_key"
`;

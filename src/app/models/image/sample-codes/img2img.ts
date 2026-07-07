import { DOCS_URL } from "@/constants/urls";

export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  request: {
    model_name: "{{model_name}}",
    image_base64: "{{init_image}}",
    prompt: "{{prompt}}",
    negative_prompt: "{{negative_prompt}}",
    width: {{width}},
    height: {{height}},
    sampler_name: "{{sampler_name}}",
    guidance_scale: {{guidance_scale}},
    steps: {{steps}},
    image_num: {{batch_size}},
    clip_skip: {{clip_skip}},
    seed: {{seed}},
    strength: {{strength}},
    loras: {{loras}},
    controlnet: {{controlnet}},
    ip_adapters: {{ip_adapters}}
  }
};
novitaClient.img2ImgV3(params)
  .then((res) => {
    if (res && res.task_id) {
      const timer = setInterval(() => {
        novitaClient.progress({
          task_id: res.task_id,
        })
          .then((progressRes) => {
            if (progressRes.task.status === TaskStatus.SUCCEED) {
              console.log("finished!", progressRes.images);
              clearInterval(timer);
            }
            if (progressRes.task.status === TaskStatus.FAILED) {
              console.warn("failed!", progressRes.task.reason);
              clearInterval(timer);
            }
            if (progressRes.task.status === TaskStatus.QUEUED) {
              console.log("queueing");
            }
          })
          .catch((err) => {
            console.error("progress error:", err);
          })
      }, 1000);
    }
  })
  .catch((err) => {
    console.error("img2Img error:", err);
  })`;

const golang = `package main

import (
  "context"
  "fmt"
  "time"

  "github.com/novitalabs/golang-sdk/request"
  "github.com/novitalabs/golang-sdk/types"
  "github.com/novitalabs/golang-sdk/util"
)

func main() {
  // get your api key refer to ${DOCS_URL.HOME}
  const apiKey = "your_api_key"
  client, err := request.NewClient(apiKey)
  if err != nil {
    fmt.Println("new client failed, %v", err)
    return
  }
  img2ImgReq := &types.Img2ImgRequest{
    ModelName:   "{{model_name}}",
    InitImages:  {{init_images}},
    Prompt:      "{{prompt}}",
    NegativePrompt: "{{negative_prompt}}",
    Width:       {{width}},
    Height:      {{height}},
    SamplerName: "{{sampler_name}}",
    CfgScale:    {{cfg_scale}},
    Steps:       {{steps}},
    BatchSize:   {{batch_size}},
    NIter:       {{n_iter}},
    Seed:        {{seed}},
  }
  ctx, cancel := context.WithTimeout(context.Background(), time.Minute*5)
  defer cancel()
  res, err := client.SyncImg2img(ctx, img2ImgReq)
  if err != nil {
    fmt.Println("failed to process img2img, %v", err)
    return
  }
  for _, imgURL := range res.Data.Imgs {
    fmt.Println("generate image url: %v", imgURL)
  }
}`;

export const python = `import os

from novita_client import NovitaClient, Img2ImgV3ControlNetUnit, ControlNetPreprocessor, Img2ImgV3Embedding
from novita_client.utils import base64_to_image, input_image_to_pil

client = NovitaClient("your_api_key")
res = client.img2img_v3(
    model_name="{{model_name}}",
    steps={{steps}},
    height={{height}},
    width={{width}},
    input_image="{{input_image}}",
    prompt="{{prompt}}",
    image_num={{batch_size}},
    strength={{strength}},
    guidance_scale={{guidance_scale}},
    seed={{seed}},
    sampler_name="{{sampler_name}}",
    clip_skip={{clip_skip}},
)

base64_to_image(res.images_encoded[0]).save("./img2img.png")`;

export const bash = `curl \\
 -X POST https://api.novita.ai/v3/async/img2img \\
 -H "Authorization: Bearer $your_api_key" \\
 -H "Content-Type: application/json" \\
 -d '{
  "request": {
    "model_name":"{{model_name}}",
    "image_base64":"{{init_image}}",
    "prompt":"{{prompt}}",
    "negative_prompt":"{{negative_prompt}}",
    "width":{{width}},
    "height":{{height}},
    "sampler_name":"{{sampler_name}}",
    "guidance_scale":{{guidance_scale}},
    "steps":{{steps}},
    "image_num":{{batch_size}},
    "clip_skip":{{clip_skip}},
    "seed":{{seed}},
    "strength":{{strength}},
    "controlnet":{{controlnet}},
    "ip_adapters":{{ip_adapters}}
  }
 }'
 
 curl \\
 -X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
 -H "Authorization: Bearer $your_api_key"
`;

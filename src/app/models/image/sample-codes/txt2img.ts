import { DOCS_URL } from "@/constants/urls";

export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  request: {
    model_name: "{{model_name}}",
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
    loras: {{loras}},
  },
};
novitaClient.txt2ImgV3(params)
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
    console.error("txt2Img error:", err);
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
  txt2ImgReq := &types.Txt2ImgRequest{
    ModelName:   "{{model_name}}",
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
  res, err := client.SyncTxt2img(ctx, txt2ImgReq)
  if err != nil {
    fmt.Println("failed to process txt2img, %v", err)
    return
  }
  for _, imgURL := range res.Data.Imgs {
    fmt.Println("generate image url: %v", imgURL)
  }
}`;

export const python = `import os
from novita_client import NovitaClient, Samplers, Txt2ImgV3HiresFix
from novita_client.utils import base64_to_image

from PIL import Image

client = NovitaClient("your_api_key")
res = client.txt2img_v3(
    model_name='{{model_name}}',
    prompt='{{prompt}}',
    width={{width}},
    height={{height}},
    image_num={{batch_size}},
    guidance_scale={{guidance_scale}},
    seed={{seed}},
    sampler_name='{{sampler_name}}',
)

base64_to_image(res.images_encoded[0]).save("./txt2img.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/txt2img \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "request": {
    "model_name":"{{model_name}}",
    "prompt":"{{prompt}}",
    "negative_prompt":"{{negative_prompt}}",
    "width":{{width}},
    "height":{{height}},
    "sampler_name":"{{sampler_name}}",
    "guidance_scale":{{guidance_scale}},
    "steps":{{steps}},
    "image_num":{{batch_size}},
    "clip_skip":{{clip_skip}},
    "seed":{{seed}}
  }
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  prompt: "{{prompt}}",
  width: 512,
  height: 512,
  image_num: {{image_num}},
  steps: 8,
  guidance_scale: 2,
};
novitaClient.lcmTxt2Img(params)
  .then((res) => {
    console.log("finished!", res.images);
  })
  .catch((err) => {
    console.error("error:", err);
  })`;

const golang = ``;

export const python = `import os

from novita_client import *
from novita_client.utils import save_image, read_image_to_base64, base64_to_image

client = NovitaClient("your_api_key")
res = client.lcm_txt2img(
    prompt="{{prompt}}",
    width=512,
    height=512,
    steps=8,
    image_num={{image_num}},
)

images = [base64_to_image(img.image_file) for img in res.images]`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/lcm-txt2img \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"prompt":"{{prompt}}",
"width":512,
"height":512,
"image_num":{{image_num}},
"steps":8,
"guidance_scale":2
}'
`;

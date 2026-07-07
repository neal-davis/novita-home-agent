export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  prompt: "{{prompt}}",
  negative_prompt: "{{negative_prompt}}",
  width: {{width}},
  height: {{height}},
};
novitaClient.createTile(params)
  .then((res) => {
    console.log("finished!", res);
  })
  .catch((err) => {
    console.error("error:", err);
  })`;

const golang = ``;

export const python = `import os

from novita_client import NovitaClient
from novita_client.utils import base64_to_image

client = NovitaClient("your_api_key")
res = client.create_tile(
    prompt="{{prompt}}",
    negative_prompt="{{negative_prompt}}",
    width={{width}},
    height={{height}},
)

base64_to_image(res.image_file).save("./tile.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/create-tile \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"prompt": "{{prompt}}",
"negative_prompt": "{{negative_prompt}}",
"width": "{{width}}",
"height": "{{height}}",
}'
`;

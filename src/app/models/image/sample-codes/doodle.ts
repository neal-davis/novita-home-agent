export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  image_file: "{{image_file}}",
  prompt: "{{prompt}}",
  similarity: {{similarity}},
};
novitaClient.doodle(params)
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
res = client.doodle(
     image="{{image_file}}",
     prompt="{{prompt}}",
     similarity={{similarity}},
)

base64_to_image(res.image_file).save("./doodle.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/doodle \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"image_file": "{{image_file}}",
"prompt": "{{prompt}}",
"similarity": "{{similarity}}"
}'
`;

export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  image_file: "{{image_file}}",
};
novitaClient.removeText(params)
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
res = client.remove_text(
    image="{{image_file}}"
)

base64_to_image(res.image_file).save("./remove_text.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/remove-text \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"image_file": "{{image_file}}"
}'
`;

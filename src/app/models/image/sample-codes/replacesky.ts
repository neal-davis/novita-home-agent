export const js = `import { NovitaSDK } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  image_file: "{{image_file}}",
  sky: "{{sky}}",
};
novitaClient.replaceSky(params)
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
res = client.replace_sky(
    image_file="{{image_file}}",
    sky="{{sky}}",
)

base64_to_image(res.image_file).save("./replace_sky.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/replace-sky \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"image_file": "{{image_file}}",
"sky": "{{sky}}"
}'
`;

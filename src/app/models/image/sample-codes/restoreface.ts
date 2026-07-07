export const js = `import { NovitaSDK } from "novita-sdk"

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  image_file: "{{image_file}}",
  fidelity: {{fidelity}},
};
novitaClient.restoreFace(params)
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
res = client.restore_face(
    image="{{image_file}}"
    fidelity={{fidelity}}
)

base64_to_image(res.image_file).save("./restore_face.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/restore_face \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"image_file": "{{image_file}}",
"fidelity": {{fidelity}}
}'
`;

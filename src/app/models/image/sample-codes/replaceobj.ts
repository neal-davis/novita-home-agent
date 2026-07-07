export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  image_file: "{{image_file}}",
  object_prompt: "{{object_prompt}}",
  prompt: "{{prompt}}",
  negative_prompt: "{{negative_prompt}}",
};
novitaClient.replaceObject(params)
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
    console.error("error:", err)
  })`;

const golang = ``;

export const python = `import os

from novita_client import NovitaClient
from novita_client.utils import base64_to_image

client = NovitaClient("your_api_key")
res = client.replace_object(
    image_file="{{image_file}}",
    object_prompt="{{object_prompt}}",
    prompt="{{prompt}}",
    negative_prompt="{{negative_prompt}}",
)
base64_to_image(res.image_file).save("./replace_object.png")`;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/replace-object \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
"image_file": "{{image_file}}",
"object_prompt": "{{object_prompt}}",
"prompt": "{{prompt}}",
"negative_prompt": "{{negative_prompt}}"
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

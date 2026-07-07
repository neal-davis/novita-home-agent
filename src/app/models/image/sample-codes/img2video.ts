export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  model_name: "{{model_name}}",
  image_file: "{{image_file}}",
  frames_num: {{frames_num}},
  frames_per_second: {{frames_per_second}},
  seed: {{seed}},
  image_file_resize_mode: "{{image_file_resize_mode}}",
  steps: {{steps}},
};
novitaClient.img2Video(params)
  .then((res) => {
    if (res && res.task_id) {
      const timer = setInterval(() => {
        novitaClient.progress({
          task_id: res.task_id,
        })
          .then((progressRes) => {
            if (progressRes.task.status === TaskStatus.SUCCEED) {
              console.log("finished!", progressRes.videos);
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
    console.error("img2video error:", err);
  })`;

const golang = ``;

export const python = `import os
from novita_client import NovitaClient
from novita_client.utils import base64_to_image

client = NovitaClient("your_api_key")

res = client.img2video(
  model_name="{{model_name}}",
  image="{{image_file}}",
  frames_num={{frames_num}},
  frames_per_second={{frames_per_second}},
  seed={{seed}},
  image_file_resize_mode="{{image_file_resize_mode}}",
  steps={{steps}}
)
with open("test.mp4", "wb") as f:
  f.write(res.video_bytes[0])`;

export const bash = `curl \\
--location "https://api.novita.ai/v3/async/img2video" \
-H "Authorization: Bearer $your_api_key" \
-H "Content-Type: application/json" \
--data "{
  "model_name": "{{model_name}}",
  "image_file": "{{image_file}}",
  "frames_num": {{frames_num}},
  "frames_per_second": {{frames_per_second}},
  "seed": {{seed}},
  "image_file_resize_mode": "{{image_file_resize_mode}}",
  "steps": {{steps}}
}"

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

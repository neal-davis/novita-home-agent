export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  request: {
    model_name: "{{model_name}}",
    image_base64: "{{image_base64}}",
    scale_factor: "{{scale_factor}}",
  }
};
novitaClient.upscaleV3(params)
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
    console.error("error:", err);
  })`;

const golang = ``;

export const python = ``;
// export const python = `import os

// from novita_client import NovitaClient
// from novita_client.utils import base64_to_image

// client = NovitaClient("your_api_key")
// res = client.upscale(
//     image="{{image}}",
//     resize_mode={{resize_mode}},
//     upscaling_resize_w={{upscaling_resize_w}},
//     upscaling_resize_h={{upscaling_resize_h}},
//     upscaling_resize={{upscaling_resize}},
//     upscaling_crop={{upscaling_crop}},
//     upscaler_1="{{upscaler_1}}",
//     upscaler_2="{{upscaler_2}}",
//     extras_upscaler_2_visibility={{extras_upscaler_2_visibility}},
//     gfpgan_visibility={{gfpgan_visibility}},
//     codeformer_visibility={{codeformer_visibility}},
//     codeformer_weight={{codeformer_weight}},
// )
// base64_to_image(res.images).save("./replace_object.png")`

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/upscale \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "request": {
    "model_name":"{{model_name}}",
    "image_base64":"{{image_base64}}",
    "scale_factor": "{{scale_factor}}"
  }
 }'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

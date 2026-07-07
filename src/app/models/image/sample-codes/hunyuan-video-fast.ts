const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");
const params = {
  model_name: "{{model_name}}",
  width: {{width}},
  height: {{height}},
  steps: {{steps}},
  seed: {{seed}},
  prompt: "{{prompt}}",
  frames: {{frames}},
};
novitaClient.hunyuanVideoFast(params)
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
    console.error("hunyuanVideoFast request error:", err);
  })`;

const golang = ``;

const python = ``;

export const bash = `curl \\
-X POST https://api.novita.ai/v3/async/hunyuan-video-fast \\
-H "Authorization: Bearer $your_api_key" \\
-H "Content-Type: application/json" \\
-d '{
  "model_name": "{{model_name}}",
  "width": {{width}},
  "height": {{height}},
  "steps": {{steps}},
  "seed": {{seed}},
  "prompt": "{{prompt}}"
}'

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

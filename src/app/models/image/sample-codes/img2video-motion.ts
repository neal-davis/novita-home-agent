export const js = `import { NovitaSDK, TaskStatus } from "novita-sdk";

const novitaClient = new NovitaSDK("your_api_key");

Promise.all([
  novitaClient.upload({
    data: [Blob],
    type: "image",
  }).then((res) => res.assets_id),
  novitaClient.upload({
    data: [Blob],
    type: "video",
  }).then((res) => res.assets_id),
]).then((assetIds) => {
  const params = {
    image_assets_id: assetIds[0],
    motion_video_assets_id: assetIds[1],
    seed: {{seed}},
  };
  novitaClient.img2VideoMotion(params)
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
              if (progressRes.task.status === TaskStatus.PROCESSING) {
                console.log("processing");
              }
            })
            .catch((err) => {
              console.error("progress error:", err);
            })
        }, 1000);
      }
    })
    .catch((err) => {
      console.error("img2video-motion error:", err);
    })
})
`;

const golang = ``;

export const python = ``;

export const bash = `
img_assets_id=$(curl \\
-X PUT --data-binary "@/path/to/your/image/file" https://assets.novitai.com/image \\
| jq -r '.assets_id')

video_assets_id=$(curl \\
-X PUT --data-binary "@/path/to/your/video/file" https://assets.novitai.com/video \\
| jq -r '.assets_id')

task_id=$(curl \\
--location "https://api.novita.ai/v3/async/img2video" \\
--header "Authorization: Bearer $your_api_key" \\
--header "Content-Type: application/json" \\
--data "{
  \\"image_assets_id\\": $img_assets_id,
  \\"motion_video_assets_id\\": $video_assets_id,
  \\"seed\\": {{seed}}
}" | jq -r '.task_id')

curl \\
-X GET https://api.novita.ai/v3/async/task-result?task_id=$task_id \\
-H "Authorization: Bearer $your_api_key"
`;

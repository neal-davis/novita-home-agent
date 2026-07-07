const { NovitaSDK, TaskStatus } = require("novita-sdk");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");
const params = {
  model_name: "darkSushiMixMix_225D_64380.safetensors",
  width: 640,
  height: 480,
  guidance_scale: 7.5,
  seed: -1,
  steps: 20,
  prompts: [
    {
      prompt: "A girl, baby, portrait, 5 years old",
      frames: 16,
    },
    {
      prompt: "A girl, child, portrait, 10 years old",
      frames: 16,
    },
    {
      prompt: "A girl, teen, portrait, 20 years old",
      frames: 16,
    },
  ],
  negative_prompt: "(worst quality, low quality:2)",
};
novitaClient
  .txt2Video(params)
  .then((res) => {
    if (res && res.task_id) {
      const timer = setInterval(() => {
        novitaClient
          .progressV3({
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
          });
      }, 1000);
    }
  })
  .catch((err) => {
    console.error("txt2video error:", err);
  });

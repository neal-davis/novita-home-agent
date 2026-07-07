const { NovitaSDK, TaskStatus } = require("novita-sdk");
const path = require("path");
const { convertImageToBase64 } = require("./utils.js");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");

async function img2video(onFinish) {
  const baseImg = await convertImageToBase64(path.join(__dirname, "test.png"));
  const params = {
    model_name: "SVD",
    image_file: baseImg,
    frames_num: 14,
    frames_per_second: 6,
    seed: -1,
    image_file_resize_mode: "ORIGINAL_RESOLUTION",
    steps: 20,
  };
  novitaClient
    .img2Video(params)
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
                onFinish(progressRes.videos);
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
      console.error("error:", err);
    });
}

img2video((videos) => {
  console.log(videos);
});

const { NovitaSDK, TaskStatus } = require("novita-sdk");
const path = require("path");
const { convertImageToBase64 } = require("./utils.js");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");

async function img2img(onFinish) {
  const baseImg = await convertImageToBase64(path.join(__dirname, "test.png"));
  const params = {
    request: {
      model_name: "sd_xl_base_1.0.safetensors",
      image_base64: baseImg,
      prompt: "Glowing jellyfish floating through a foggy forest at twilight",
      negative_prompt:
        "3d render, smooth,plastic, blurry, grainy, low-resolution,anime, deep-fried, oversaturated",
      width: 1024,
      height: 1024,
      sampler_name: "DPM++ 2M Karras",
      guidance_scale: 7.5,
      steps: 20,
      image_num: 4,
      clip_skip: 1,
      seed: -1,
      strength: 0.7,
    },
  };
  novitaClient
    .img2ImgV3(params)
    .then((res) => {
      if (res && res.task_id) {
        const timer = setInterval(() => {
          novitaClient
            .progressV3({
              task_id: res.task_id,
            })
            .then((progressRes) => {
              if (progressRes.task.status === TaskStatus.SUCCEED) {
                console.log("finished!", progressRes.images);
                clearInterval(timer);
                onFinish(progressRes.images);
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
      console.error("img2Img error:", err);
    });
}

img2img((imgs) => {
  console.log(imgs);
});

const { NovitaSDK } = require("novita-sdk");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");

async function lora(onFinish) {
  const params = {
    model_name: "majicmixRealistic_v7_134792.safetensors",
    prompt: "1girl,sweater,white background,",
    negative_prompt:
      "(worst quality:2),(low quality:2),(normal quality:2),lowres,watermark,",
    width: 512,
    height: 768,
    sampler_name: "Euler a",
    cfg_scale: 7,
    steps: 20,
    batch_size: 1,
    n_iter: 1,
    seed: -1,
    lora: [{ sd_name: "hyperdetailer_v095_177226", weight: 0.52 }],
  };
  novitaClient
    .txt2img(params)
    .then((res) => {
      if (res && res.task_id) {
        const timer = setInterval(() => {
          novitaClient
            .progress({
              task_id: res.task_id,
            })
            .then((progressRes) => {
              if (progressRes.status === 2) {
                console.log("finished!", progressRes.imgs);
                clearInterval(timer);
                onFinish(progressRes.imgs);
              }
              if (progressRes.status === 3 || progressRes.status === 4) {
                console.warn("failed!", progressRes.failed_reason);
                clearInterval(timer);
              }
              if (progressRes.status === 1) {
                console.log("progress", progressRes.current_images);
              }
            })
            .catch((err) => {
              console.error("progress error:", err);
            });
        }, 1000);
      }
    })
    .catch((err) => {
      console.error("txt2Img with lora error:", err);
    });
}

lora((imgs) => {
  console.log(imgs);
});

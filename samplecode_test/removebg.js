const { NovitaSDK } = require("novita-sdk");
const path = require("path");
const { convertImageToBase64 } = require("./utils.js");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");

async function removebg(onFinish) {
  const baseImg = await convertImageToBase64(path.join(__dirname, "test.png"));
  const params = {
    image_file: baseImg,
  };
  novitaClient
    .removeBackground(params)
    .then((res) => {
      console.log("finished!", res);
      onFinish(res);
    })
    .catch((err) => {
      console.error("error:", err);
    });
}

removebg((imgs) => {
  console.log(imgs);
});

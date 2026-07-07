const { NovitaSDK } = require("novita-sdk");

const novitaClient = new NovitaSDK("fa9af392-da31-4d34-b38c-ef285b8fe5d2");

async function createTile(onFinish) {
  const params = {
    prompt: "a bird",
    negative_prompt: "",
    width: 128,
    height: 128,
  };
  novitaClient
    .createTile(params)
    .then((res) => {
      console.log("finished!", res);
      onFinish(res);
    })
    .catch((err) => {
      console.error("error:", err);
    });
}

createTile((imgs) => {
  console.log(imgs);
});

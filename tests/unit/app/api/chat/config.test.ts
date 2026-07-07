import {
  ModelAttributesConfig,
  CustomModelUIConfig,
} from "@/app/api/chat/config";

describe("chat config", () => {
  it("lists omni modalities and audio-output models", () => {
    expect(ModelAttributesConfig.modalities).toContain(
      "qwen/qwen3-omni-30b-a3b-instruct",
    );
    expect(CustomModelUIConfig.AudioOutput).toEqual(
      ModelAttributesConfig.modalities,
    );
  });
});

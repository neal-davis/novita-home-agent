import {
  getDefaultModelParams,
  sanitizePromptByLenght,
} from "@/lib/utils/playground";

describe("playground utilities", () => {
  it("builds default model params with bounded steps and LoRA prompt cleanup", () => {
    expect(
      getDefaultModelParams({
        cfg_scale: 0,
        height: 768,
        model_id: "model-1",
        model_name: "demo-model",
        negative_prompt: "low quality",
        prompt: "portrait <lora:style:1>, sharp",
        sampler_name: "",
        seed: 123,
        steps: 5,
        width: 1024,
      } as any),
    ).toEqual({
      cfg_scale: 7,
      guidance_scale: 7,
      height: 768,
      model_id: "model-1",
      model_name: "demo-model",
      negative_prompt: "low quality",
      prompt: "portrait , sharp",
      sampler_name: "DPM++ 2M Karras",
      seed: 123,
      steps: 20,
      width: 1024,
    });

    expect(
      getDefaultModelParams({
        model_id: "model-2",
        model_name: "large-steps",
        steps: 99,
      } as any).steps,
    ).toBe(50);
  });

  it("uses the SD3 preset when model details request it", () => {
    const params = getDefaultModelParams({
      is_sd3: true,
      model_id: "sd3",
      model_name: "sd3",
      steps: 1,
    } as any);

    expect(params).toMatchObject({
      guidance_scale: 4,
      height: 1024,
      negative_prompt: "",
      sampler_name: "FlowMatchEuler",
      steps: 28,
      width: 1024,
    });
    expect(params.prompt).toContain("cinematic scene");
  });

  it("sanitizes prompts by type, limit, sentence boundary and hard cutoff", () => {
    expect(sanitizePromptByLenght(123 as any)).toBe("");
    expect(sanitizePromptByLenght("short prompt", 20)).toBe("short prompt");
    expect(sanitizePromptByLenght("alpha, beta gamma delta", 12)).toBe(
      "alpha,",
    );
    expect(sanitizePromptByLenght("abcdefghijk", 5)).toBe("abcde");
  });
});

export function getDefaultModelParams(modelDetails: ModelDetails) {
  const params = {
    model_id: modelDetails.model_id,
    model_name: modelDetails.model_name,
    guidance_scale: modelDetails.cfg_scale || 7,
    cfg_scale: modelDetails.cfg_scale || 7,
    width: modelDetails.width || 512,
    height: modelDetails.height || 512,
    prompt: modelDetails.prompt?.replace(/<lora:.*>/g, "") || "",
    negative_prompt: modelDetails.negative_prompt || "",
    sampler_name: modelDetails.sampler_name || "DPM++ 2M Karras",
    steps: Math.min(50, Math.max(20, modelDetails.steps)),
    seed: modelDetails.seed || -1,
  };
  if (modelDetails.is_sd3) {
    params.width = 1024;
    params.height = 1024;
    params.prompt =
      "A cinematic scene featuring a soldier standing amidst the ruins of a city. The landscape is devastated, with buildings reduced to rubble and flames erupting from the debris. Thick smoke billows into the sky, casting a gloomy, eerie atmosphere over the scene. The soldier, clad in worn, battle-worn gear, stands resolute with a determined expression, surveying the destruction around him. The scene is bathed in a muted, grim light, enhancing the sense of war and destruction. Shadows and flickering flames create a haunting contrast, capturing the bleakness and intensity of the battlefield.";
    params.guidance_scale = 4;
    params.negative_prompt = "";
    params.sampler_name = "FlowMatchEuler";
    params.steps = 28;
  }
  return params;
}

export function sanitizePromptByLenght(prompt: string, limit = 1024) {
  if (typeof prompt !== "string") {
    return "";
  }
  if (prompt.length <= limit) {
    return prompt;
  }
  const regex = /[,.|](?=\s|$)/g;
  let truncated = prompt.slice(0, limit + 1);
  let lastMatchIndex = -1;

  let match;
  while ((match = regex.exec(truncated)) !== null) {
    if (match.index <= limit) {
      lastMatchIndex = match.index;
    }
  }

  if (lastMatchIndex !== -1) {
    truncated = truncated.slice(0, lastMatchIndex + 1);
  } else {
    truncated = truncated.slice(0, limit);
  }

  return truncated.trim();
}

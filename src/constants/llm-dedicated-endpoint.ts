export const ENGINE_ARGS_MAP = {
  vllm: {
    maxModelLen: {
      displayName: "--max-model-len",
      description:
        "Model context length. If unspecified, will be automatically derived from the model config.",
      placeholder: "Enter model context length",
    },
    maxNumSeqs: {
      displayName: "Max Concurrency per Replica",
      description:
        "Maximum number of concurrent requests that can be processed by a single replica. Backend recommends optimal value based on model and GPU configuration.",
      placeholder: "Enter max concurrency",
      hints: {
        belowRecommended:
          "Value is below recommended. May result in underutilization of GPU resources.",
        aboveRecommended:
          "Value exceeds recommended. May cause memory issues or degraded performance.",
        optimal: "Optimal value for your model and GPU configuration.",
      },
    },
    suffixDecoding: {
      displayName: "Suffix Decoding",
      description:
        "Enabling this feature accelerates model output speed in coding scenarios by 30%+ (130% of baseline performance)",
      placeholder: "Enter suffix decoding value",
    },
  },
  sglang: {
    maxModelLen: {
      displayName: "--context-length",
      description:
        "The model's maximum context length. Defaults to None (will use the value from the model's config.json instead).",
      placeholder: "Enter model's maximum context length",
    },
    maxNumSeqs: {
      displayName: "Max Concurrency per Replica",
      description:
        "Maximum number of concurrent requests that can be processed by a single replica. Backend recommends optimal value based on model and GPU configuration.",
      placeholder: "Enter max concurrency",
      hints: {
        belowRecommended:
          "Value is below recommended. May result in underutilization of GPU resources.",
        aboveRecommended:
          "Value exceeds recommended. May cause memory issues or degraded performance.",
        optimal: "Optimal value for your model and GPU configuration.",
      },
    },
    suffixDecoding: {
      displayName: "Suffix Decoding",
      description:
        "Enabling this feature accelerates model output speed in coding scenarios by 30%+ (130% of baseline performance)",
      placeholder: "Enter suffix decoding value",
    },
  },
};

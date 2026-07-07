export type DedicatedEndpointFaqItem = {
  id: string;
  question: string;
  answer: string;
};

/**
 * Default FAQ copy for the Dedicated Endpoint page (FAQ section).
 * Override by passing `items` into `DedicatedEndpointFaq`.
 */
export function createDedicatedEndpointFaqItems(): DedicatedEndpointFaqItem[] {
  return [
    {
      id: "billing",
      question: "How is billing calculated?",
      answer:
        "Per-second on running replicas only. When your endpoint is scaled to zero or stopped, you pay nothing. No minimum commitments, no idle charges. ",
    },
    {
      id: "models",
      question: "What models can I deploy?",
      answer:
        "You can choose from 50,000+ open-source models on Hugging Face, or connect your private repository. The catalog covers popular LLM families; pick the checkpoint that matches your use case in the console.",
    },
    {
      id: "deploy-time",
      question: "How long does deployment take?",
      answer:
        "End-to-end setup is usually under a few minutes: select a model, size GPU, and your OpenAI-compatible endpoint is provisioned. Typical warm paths complete in about two minutes or less.",
    },
    {
      id: "openai-api",
      question: "Is the API OpenAI-compatible?",
      answer:
        "Yes. We expose a standard OpenAI-style HTTP API; point your client at our base URL and use familiar paths like /v1/chat/completions with your existing request bodies and headers.",
    },
    {
      id: "fail-oom",
      question: "What if my deployment fails or OOMs?",
      answer:
        "You can change GPU type, memory, or replica count in the product UI. Logs surface runtime errors. If a model exceeds GPU memory, pick a larger tier or a quantized variant, then redeploy — no extra setup fee for retries on the same project.",
    },
    {
      id: "vllm-migration",
      question: "Can I migrate from self-hosted vLLM?",
      answer:
        "In most cases you only need to change the client base URL and any auth headers. Request and response shapes stay aligned with the OpenAI chat pattern you already use with vLLM, so code churn stays minimal.",
    },
  ];
}

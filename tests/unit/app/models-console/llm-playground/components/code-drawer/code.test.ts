import {
  curlChatCompletions,
  curlCompletions,
  curlResponse,
  jsChatCompletions,
  jsCompletions,
  jsResponse,
  pythonChatCompletions,
  pythonCompletions,
  pythonResponse,
} from "@/app/models-console/llm-playground/components/code-drawer/code";

const chatParams = {
  model: "meta-llama/llama-3",
  max_tokens: 512,
  system_content: '"You are helpful"',
  temperature: 0.7,
  top_p: 0.9,
  min_p: 0.05,
  top_k: 40,
  presence_penalty: 0.1,
  frequency_penalty: 0.2,
  repetition_penalty: 1.1,
  max_output_tokens: 1024,
  parallel_tool_calls: true,
  max_tool_calls: 3,
};

const KEY = "sk-test-123";

describe("chat completions snippets", () => {
  it("python embeds model, key and params", () => {
    const out = pythonChatCompletions(chatParams, KEY);
    expect(out).toContain(`api_key="${KEY}"`);
    expect(out).toContain(`model = "${chatParams.model}"`);
    expect(out).toContain(`max_tokens = ${chatParams.max_tokens}`);
    expect(out).toContain("client.chat.completions.create");
  });

  it("python omits response_format when not set", () => {
    const out = pythonChatCompletions(chatParams, KEY);
    expect(out).not.toContain("response_format");
  });

  it("python includes response_format when provided", () => {
    const out = pythonChatCompletions(
      { ...chatParams, response_format: { type: "json_object" } },
      KEY,
    );
    expect(out).toContain('response_format = { "type": "json_object" }');
    expect(out).toContain("response_format=response_format,");
  });

  it("curl embeds bearer key and json body", () => {
    const out = curlChatCompletions(chatParams, KEY);
    expect(out).toContain(`Authorization: Bearer ${KEY}`);
    expect(out).toContain("/openai/v1/chat/completions");
    expect(out).toContain(`"model": "${chatParams.model}"`);
  });

  it("curl includes response_format block when provided", () => {
    const out = curlChatCompletions(
      { ...chatParams, response_format: { type: "json_object" } },
      KEY,
    );
    expect(out).toContain('"response_format": { "type": "json_object" }');
  });

  it("js embeds key and response_format branch", () => {
    const base = jsChatCompletions(chatParams, KEY);
    expect(base).toContain(`apiKey: "${KEY}"`);
    expect(base).not.toContain("response_format:");

    const withRf = jsChatCompletions(
      { ...chatParams, response_format: { type: "text" } },
      KEY,
    );
    expect(withRf).toContain('response_format: { type: "text" }');
  });
});

describe("completions snippets", () => {
  it("python completions targets the completions endpoint", () => {
    const out = pythonCompletions(chatParams, KEY);
    expect(out).toContain("client.completions.create");
    expect(out).toContain(`model = "${chatParams.model}"`);
  });

  it("curl completions hits /v1/completions", () => {
    const out = curlCompletions(chatParams, KEY);
    expect(out).toContain("/openai/v1/completions");
    expect(out).toContain('"prompt": "Say hello!"');
  });

  it("js completions uses openai.completions.create", () => {
    const out = jsCompletions(chatParams, KEY);
    expect(out).toContain("openai.completions.create");
    expect(out).toContain(`apiKey: "${KEY}"`);
  });
});

describe("response-mode snippets", () => {
  it("python response renders parallel_tool_calls as True/False", () => {
    expect(pythonResponse(chatParams, KEY)).toContain(
      "parallel_tool_calls = True",
    );
    expect(
      pythonResponse({ ...chatParams, parallel_tool_calls: false }, KEY),
    ).toContain("parallel_tool_calls = False");
  });

  it("curl response targets /v1/responses", () => {
    const out = curlResponse(chatParams, KEY);
    expect(out).toContain("/openai/v1/responses");
    expect(out).toContain(
      `"max_output_tokens": ${chatParams.max_output_tokens}`,
    );
  });

  it("js response uses openai.responses.create", () => {
    const out = jsResponse(chatParams, KEY);
    expect(out).toContain("openai.responses.create");
    expect(out).toContain(`model: "${chatParams.model}"`);
  });
});

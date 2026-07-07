import {
  handleMcpRequest,
  getMcpTools,
} from "@/lib/agent-discovery/mcpProtocol";

describe("MCP protocol adapter", () => {
  it("exposes Novita tools", () => {
    expect(getMcpTools().map((tool) => tool.name)).toEqual([
      "open_novita_console",
      "open_model_api_workflow",
      "open_gpu_workflow",
      "open_sandbox_workflow",
      "open_novita_docs",
      "open_novita_auth",
    ]);
  });

  it("handles tools/list", () => {
    expect(
      handleMcpRequest({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
      }),
    ).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        tools: expect.arrayContaining([
          expect.objectContaining({
            name: "open_novita_console",
          }),
        ]),
      },
    });
  });

  it("handles tools/call without server-side side effects", () => {
    expect(
      handleMcpRequest({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "open_novita_docs",
          arguments: {
            topic: "llm_api",
          },
        },
      }),
    ).toMatchObject({
      jsonrpc: "2.0",
      id: 2,
      result: {
        structuredContent: {
          topic: "llm_api",
        },
      },
    });
  });
});

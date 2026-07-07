import { handleMcpRequest } from "@/lib/agent-discovery/mcpProtocol";

// jsdom does not provide the WHATWG Response global the adapter uses for the
// 202 acknowledgement; provide a minimal stand-in.
if (typeof (globalThis as { Response?: unknown }).Response === "undefined") {
  (globalThis as { Response: unknown }).Response = class {
    body: unknown;
    status: number;
    constructor(body: unknown, init?: { status?: number }) {
      this.body = body;
      this.status = init?.status ?? 200;
    }
  };
}

describe("handleMcpRequest extra branches", () => {
  it("handles initialize with server info and capabilities", () => {
    const res = handleMcpRequest({
      jsonrpc: "2.0",
      id: 1,
      method: "initialize",
    } as never);
    expect(res).toMatchObject({
      jsonrpc: "2.0",
      id: 1,
      result: {
        protocolVersion: expect.any(String),
        serverInfo: { name: "Novita MCP Server" },
      },
    });
  });

  it("returns a 202 Response for notifications/initialized", () => {
    const res = handleMcpRequest({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    } as never);
    expect(res).toBeInstanceOf(Response);
    expect((res as Response).status).toBe(202);
  });

  it("returns a JSON-RPC error for an invalid tools/call", () => {
    const res = handleMcpRequest({
      jsonrpc: "2.0",
      id: 5,
      method: "tools/call",
      params: { name: "nonexistent_tool", arguments: {} },
    } as never);
    expect(res).toMatchObject({
      jsonrpc: "2.0",
      id: 5,
      error: { code: -32602 },
    });
  });

  it("returns -32601 for an unsupported method", () => {
    const res = handleMcpRequest({
      jsonrpc: "2.0",
      id: 6,
      method: "made/up",
    } as never);
    expect(res).toMatchObject({
      jsonrpc: "2.0",
      id: 6,
      error: { code: -32601 },
    });
  });

  it("includes 'unknown' in the error for a missing method name", () => {
    const res = handleMcpRequest({ jsonrpc: "2.0", id: 7 } as never);
    expect((res as { error: { message: string } }).error.message).toContain(
      "unknown",
    );
  });
});

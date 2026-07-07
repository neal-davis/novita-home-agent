import {
  NOVITA_WEBMCP_TOOL_CONFIGS,
  createInputSchema,
} from "../webmcp/novitaTools";

type JsonRpcRequest = {
  jsonrpc?: string;
  id?: string | number | null;
  method?: string;
  params?: unknown;
};

function jsonRpcResult(id: JsonRpcRequest["id"], result: unknown) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    result,
  };
}

function jsonRpcError(id: JsonRpcRequest["id"], code: number, message: string) {
  return {
    jsonrpc: "2.0",
    id: id ?? null,
    error: {
      code,
      message,
    },
  };
}

export function getMcpTools() {
  return NOVITA_WEBMCP_TOOL_CONFIGS.map((config) => ({
    name: config.name,
    description: config.description,
    inputSchema: createInputSchema(config),
  }));
}

function getToolCallResult(params: unknown) {
  if (!params || typeof params !== "object") {
    throw new Error("tools/call params must be an object.");
  }

  const { name, arguments: args } = params as {
    name?: unknown;
    arguments?: unknown;
  };

  if (typeof name !== "string") {
    throw new Error("tools/call params.name must be a string.");
  }

  const config = NOVITA_WEBMCP_TOOL_CONFIGS.find((tool) => tool.name === name);
  if (!config) {
    throw new Error(`Unknown tool: ${name}`);
  }

  if (!args || typeof args !== "object") {
    throw new Error(`Tool ${name} requires object arguments.`);
  }

  const value = (args as Record<string, unknown>)[config.parameterName];
  if (typeof value !== "string") {
    throw new Error(
      `Tool ${name} requires a string "${config.parameterName}" argument.`,
    );
  }

  const url = config.routes[value];
  if (!url) {
    throw new Error(
      `Tool ${name} received unsupported ${config.parameterName}: ${value}.`,
    );
  }

  return {
    content: [
      {
        type: "text",
        // i18n-disable-next-line
        text: `Open ${url}`,
      },
    ],
    structuredContent: {
      url,
      [config.parameterName]: value,
    },
  };
}

export function handleMcpRequest(request: JsonRpcRequest) {
  switch (request.method) {
    case "initialize":
      return jsonRpcResult(request.id, {
        protocolVersion: "2025-06-18",
        capabilities: {
          tools: {
            listChanged: false,
          },
        },
        serverInfo: {
          name: "Novita MCP Server",
          title: "Novita MCP Server",
          version: "1.0.0",
        },
      });
    case "notifications/initialized":
      return new Response(null, { status: 202 });
    case "tools/list":
      return jsonRpcResult(request.id, {
        tools: getMcpTools(),
      });
    case "tools/call":
      try {
        return jsonRpcResult(request.id, getToolCallResult(request.params));
      } catch (error) {
        return jsonRpcError(
          request.id,
          -32602,
          error instanceof Error ? error.message : "Invalid tool call.",
        );
      }
    default:
      return jsonRpcError(
        request.id,
        -32601,
        `Unsupported MCP method: ${request.method || "unknown"}`,
      );
  }
}

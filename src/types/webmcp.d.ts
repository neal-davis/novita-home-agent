export {};

declare global {
  type WebMCPToolResult = {
    content: Array<{
      type: "text";
      text: string;
    }>;
  };

  type WebMCPTool = {
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
    execute: (input: unknown) => WebMCPToolResult | Promise<WebMCPToolResult>;
  };

  interface Navigator {
    modelContext?: {
      provideContext?: (context: {
        tools: WebMCPTool[];
      }) => void | Promise<void>;
      registerTool?: (
        tool: WebMCPTool,
        options?: { signal?: AbortSignal },
      ) => void | Promise<void>;
    };
  }
}

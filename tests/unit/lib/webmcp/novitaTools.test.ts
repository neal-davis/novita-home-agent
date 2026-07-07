import { DOCS_URL, NOVITA_URL } from "@/constants/urls";
import {
  createNovitaWebMCPTools,
  WEBMCP_ROUTE_MAPS,
} from "@/lib/webmcp/novitaTools";

describe("Novita WebMCP tools", () => {
  const assign = jest.fn();
  const originalLocation = window.location;

  beforeAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: { assign },
    });
  });

  beforeEach(() => {
    assign.mockClear();
  });

  afterAll(() => {
    Object.defineProperty(window, "location", {
      configurable: true,
      value: originalLocation,
    });
  });

  it("defines the expected navigation tools", () => {
    const tools = createNovitaWebMCPTools();

    expect(tools.map((tool) => tool.name)).toEqual([
      "open_novita_console",
      "open_model_api_workflow",
      "open_gpu_workflow",
      "open_sandbox_workflow",
      "open_novita_docs",
      "open_novita_auth",
    ]);
  });

  it("keeps route maps aligned with existing Novita URL constants", () => {
    expect(WEBMCP_ROUTE_MAPS.console.api_keys).toBe(NOVITA_URL.SETTINGS_KEYS);
    expect(WEBMCP_ROUTE_MAPS.modelApi.llm_playground).toBe(
      NOVITA_URL.LLM_CONSOLE_PLAYGROUND,
    );
    expect(WEBMCP_ROUTE_MAPS.gpu.serverless).toBe(
      NOVITA_URL.GPU_CONSOLE_SERVERLESS,
    );
    expect(WEBMCP_ROUTE_MAPS.sandbox.docs).toBe(DOCS_URL.SANDBOX_INTRODUCTION);
    expect(WEBMCP_ROUTE_MAPS.docs.quick_start).toBe(DOCS_URL.QUICK_START);
    expect(WEBMCP_ROUTE_MAPS.auth.register).toBe(NOVITA_URL.USER_REGISTER);
  });

  it("navigates and returns structured content for valid input", async () => {
    const tool = createNovitaWebMCPTools().find(
      (item) => item.name === "open_gpu_workflow",
    );

    expect(tool).toBeDefined();

    const result = await tool?.execute({ workflow: "serverless" });

    expect(assign).toHaveBeenCalledWith(NOVITA_URL.GPU_CONSOLE_SERVERLESS);
    expect(result).toEqual({
      content: [
        {
          type: "text",
          text: `Opened Novita GPU workflow: serverless (${NOVITA_URL.GPU_CONSOLE_SERVERLESS})`,
        },
      ],
    });
  });

  it("rejects unsupported enum values", () => {
    const tool = createNovitaWebMCPTools().find(
      (item) => item.name === "open_novita_docs",
    );

    expect(() => tool?.execute({ topic: "private_account_data" })).toThrow(
      "unsupported topic",
    );
    expect(assign).not.toHaveBeenCalled();
  });
});

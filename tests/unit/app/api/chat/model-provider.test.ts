jest.mock("@/app/api/chat/provider", () => ({ createProvider: jest.fn() }));

import { createModelProvider } from "@/app/api/chat/model-provider";
import { createProvider } from "@/app/api/chat/provider";

const mockCreateProvider = createProvider as jest.Mock;

describe("createModelProvider", () => {
  beforeEach(() => jest.clearAllMocks());

  it("forwards apiKey and uses the default base url", () => {
    createModelProvider({ apiKey: "k" });
    expect(mockCreateProvider).toHaveBeenCalledWith({
      name: "provider",
      baseURL: "https://api.novita.ai/openai/v1",
      apiKey: "k",
      includeUsage: true,
    });
  });

  it("allows overriding the base url", () => {
    createModelProvider({ apiKey: "k", baseURL: "https://x/openai/v1" });
    expect(mockCreateProvider).toHaveBeenCalledWith(
      expect.objectContaining({ baseURL: "https://x/openai/v1" }),
    );
  });
});

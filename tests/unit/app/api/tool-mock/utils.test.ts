import { createMockGenerationPrompt } from "@/app/api/tool-mock/utils";

describe("tool-mock createMockGenerationPrompt", () => {
  it("embeds function name, description, schema, and parameters", () => {
    const prompt = createMockGenerationPrompt(
      {
        name: "getWeather",
        description: "Returns weather",
        parameters: {
          type: "object",
          properties: { city: { type: "string" } },
        },
        required: ["city"],
      },
      { city: "Paris" },
    );
    expect(prompt).toContain("Name: getWeather");
    expect(prompt).toContain("Description: Returns weather");
    expect(prompt).toContain('"city"');
    expect(prompt).toContain("Paris");
    expect(prompt).toContain("Only return the JSON object");
  });
});

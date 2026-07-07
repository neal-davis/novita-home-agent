import { generateText } from "ai";
import { createMockGenerationPrompt } from "./utils";
import { createModelProvider } from "../chat/model-provider";

const JSON_SCHEMA_MODELS = [
  "qwen/qwen3-coder-480b-a35b-instruct",
  "moonshotai/kimi-k2-instruct",
  "openai/gpt-oss-120b",
];

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function extractAndParseJSON(text: string): any {
  let cleanText = text.trim();

  console.log("Mock Raw response:", cleanText);

  cleanText = cleanText.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");

  try {
    return JSON.parse(cleanText);
  } catch (error) {
    return null;
  }
}

async function generateMockData(
  provider: any,
  modelId: string,
  prompt: string,
  maxRetries: number = 2,
): Promise<any> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const result = await generateText({
        model: provider(modelId),
        prompt,
        temperature: 0,
      });

      console.log("result", result.text);

      const mockData = extractAndParseJSON(result.text);

      if (mockData === null || mockData === undefined) {
        throw new Error("Generated mock data is null or undefined");
      }

      return mockData;
    } catch (error) {
      lastError = error as Error;
      console.error(
        `Attempt ${attempt + 1} failed for model ${modelId}:`,
        error,
      );

      if (error instanceof SyntaxError && attempt < maxRetries - 1) {
        continue;
      }

      throw error;
    }
  }

  throw lastError || new Error("All attempts failed");
}

export async function POST(req: Request) {
  try {
    const { functionDefinition, parameters, apiKey } = await req.json();

    if (!apiKey) {
      return new Response(JSON.stringify({ error: "API key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!functionDefinition || !parameters) {
      return new Response(
        JSON.stringify({
          error: "Function definition and parameters are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const prompt = createMockGenerationPrompt(functionDefinition, parameters);

    const modelProvider = createModelProvider({
      apiKey,
      baseURL: `${BASE_URL}/openai/v1`,
    });

    let mockData = null;
    let lastError: Error | null = null;

    for (const modelId of JSON_SCHEMA_MODELS) {
      try {
        console.log(`Trying model: ${modelId}`);
        mockData = await generateMockData(modelProvider, modelId, prompt, 2);

        if (mockData) {
          console.log(
            `Successfully generated mock data with model: ${modelId}`,
          );
          return new Response(
            JSON.stringify({
              success: true,
              data: mockData,
              model: modelId,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }
      } catch (error) {
        lastError = error as Error;
        console.error(`Model ${modelId} failed:`, error);
        continue;
      }
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: "Failed to generate mock data with all available models",
        details: lastError?.message || "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: "Internal server error",
        details: (error as Error).message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}

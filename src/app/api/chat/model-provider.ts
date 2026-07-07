import { createProvider } from "./provider";

export const createModelProvider = ({
  apiKey,
  baseURL = "https://api.novita.ai/openai/v1",
}: {
  apiKey: string;
  baseURL?: string;
}) =>
  createProvider({
    name: "provider",
    baseURL,
    apiKey,
    includeUsage: true,
  });

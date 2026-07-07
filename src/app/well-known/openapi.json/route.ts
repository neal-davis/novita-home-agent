import { NextResponse } from "next/server";

const openApiDescription = {
  openapi: "3.1.0",
  info: {
    title: "Novita API",
    version: "1.0.0",
    description:
      "Discovery document for Novita's OpenAI-compatible model APIs and platform APIs.",
  },
  servers: [
    {
      url: "https://api.novita.ai",
      description: "Novita API",
    },
  ],
  paths: {
    "/openai/v1/models": {
      get: {
        summary: "List models",
        description: "List available OpenAI-compatible models.",
        responses: {
          "200": {
            description: "Model list",
          },
        },
      },
    },
    "/openai/v1/chat/completions": {
      post: {
        summary: "Create chat completion",
        description: "Create an OpenAI-compatible chat completion.",
        responses: {
          "200": {
            description: "Chat completion response",
          },
        },
      },
    },
    "/openai/v1/completions": {
      post: {
        summary: "Create completion",
        description: "Create an OpenAI-compatible text completion.",
        responses: {
          "200": {
            description: "Completion response",
          },
        },
      },
    },
    "/openai/v1/embeddings": {
      post: {
        summary: "Create embeddings",
        description: "Create OpenAI-compatible embeddings.",
        responses: {
          "200": {
            description: "Embedding response",
          },
        },
      },
    },
  },
};

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json(openApiDescription, {
    headers: {
      "Content-Type": "application/openapi+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

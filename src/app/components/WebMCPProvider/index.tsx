"use client";

import { useEffect } from "react";
import { createNovitaWebMCPTools } from "@/lib/webmcp/novitaTools";

const isDevelopment = process.env.NODE_ENV !== "production";

function logWebMCP(message: string, details?: unknown) {
  if (!isDevelopment) return;
  if (details === undefined) {
    console.info(`[WebMCP] ${message}`);
    return;
  }
  console.info(`[WebMCP] ${message}`, details);
}

export default function WebMCPProvider() {
  useEffect(() => {
    const modelContext = navigator.modelContext;

    if (!modelContext) {
      logWebMCP("navigator.modelContext unavailable");
      return;
    }

    const tools = createNovitaWebMCPTools();

    if (typeof modelContext.provideContext === "function") {
      void Promise.resolve(modelContext.provideContext({ tools })).then(() => {
        logWebMCP(
          "Registered Novita tools with provideContext",
          tools.map((tool) => tool.name),
        );
      });
      return;
    }

    if (typeof modelContext.registerTool === "function") {
      const controller = new AbortController();
      tools.forEach((tool) => {
        void modelContext.registerTool?.(tool, { signal: controller.signal });
      });
      logWebMCP(
        "Registered Novita tools with registerTool",
        tools.map((tool) => tool.name),
      );

      return () => {
        controller.abort();
      };
    }

    logWebMCP("navigator.modelContext has no supported registration method");
  }, []);

  return null;
}

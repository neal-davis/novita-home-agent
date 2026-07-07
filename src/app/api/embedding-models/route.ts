import { NextResponse } from "next/server";
import { z } from "zod";
import { reportError } from "@/lib/utils/reporter";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const fetchCache = "force-no-store";
export const revalidate = 0;
export const dynamic = "force-dynamic";

const schema = z.object({
  data: z.array(
    z.object({
      context_size: z.number(),
      created: z.number(),
      description: z.string(),
      id: z.string(),
      input_token_price_per_m: z.number(),
      object: z.string(),
      output_token_price_per_m: z.number(),
      owned_by: z.string(),
      status: z.number(),
      title: z.string(),
    }),
  ),
});

export async function GET(req: Request) {
  const auth = req.headers.get("Authorization");
  console.log("Authorization", auth, BASE_URL);
  try {
    const result = await fetch(
      `${BASE_URL}/openai/v1/models?model_type=embedding`,
      {
        mode: "cors",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
          Authorization: auth ?? "",
        },
        cache: "no-store",
      },
    );
    const res = await result.json();
    if (!schema.safeParse(res).success) {
      reportError({
        errorNo: "api_chat-models_schema_error",
        errorInfo: `res: ${JSON.stringify(res)}`,
        level: 0,
        type: "request",
      });
    }
    return NextResponse.json(res);
  } catch (error: any) {
    reportError({
      errorNo: "api_chat-models_fetch_failed",
      errorInfo: error,
      level: 0,
      type: "request",
    });
    return new Response(error.message, { status: error.status });
  }
}

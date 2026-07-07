import { NextRequest, NextResponse } from "next/server";
import {
  countApproxMarkdownTokens,
  htmlToMarkdown,
} from "@/lib/markdown/htmlToMarkdown";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const sourcePath = url.searchParams.get("path") || "/";
  const sourceSearch = url.searchParams.get("search") || "";

  if (!sourcePath.startsWith("/") || sourcePath.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Invalid markdown source" },
      { status: 400 },
    );
  }

  const sourceUrl = new URL(sourcePath + sourceSearch, url.origin);
  const htmlResponse = await fetch(sourceUrl, {
    headers: {
      Accept: "text/html",
      "x-markdown-bypass": "1",
    },
    cache: "no-store",
  });

  if (!htmlResponse.ok) {
    return new NextResponse(await htmlResponse.text(), {
      status: htmlResponse.status,
      headers: {
        "Content-Type":
          htmlResponse.headers.get("Content-Type") || "text/plain",
      },
    });
  }

  const html = await htmlResponse.text();
  const markdown = htmlToMarkdown(html, sourcePath);
  const response = new NextResponse(markdown, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      Vary: "Accept",
      "x-markdown-tokens": String(countApproxMarkdownTokens(markdown)),
    },
  });
  const linkHeader = htmlResponse.headers.get("Link");

  if (linkHeader) {
    response.headers.set("Link", linkHeader);
  }

  return response;
}

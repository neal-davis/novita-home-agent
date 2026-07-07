import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BLOG_CACHE_TAG } from "@/lib/blog";
import { resetBlogContentRefCache } from "@/lib/blog/source";
import { isBlogRevalidateAuthorized } from "./auth";

/**
 * On-demand revalidation for blog content. Purges the `blog-posts` cache tag so
 * `/blog` and `/blog/[slug]` re-fetch from the source repo on their next
 * request. Wired to a Vercel Cron (GET) and usable as a publish webhook (POST).
 * See `./auth` for the accepted credentials / required env vars.
 */
function handle(request: NextRequest): NextResponse {
  const authorized = isBlogRevalidateAuthorized(
    request.headers.get("authorization"),
    request.nextUrl.searchParams.get("secret"),
  );
  if (!authorized) {
    return NextResponse.json({ message: "Invalid secret" }, { status: 401 });
  }

  resetBlogContentRefCache();
  revalidateTag(BLOG_CACHE_TAG);
  return NextResponse.json({
    revalidated: true,
    tag: BLOG_CACHE_TAG,
    contentRefReset: true,
  });
}

export async function GET(request: NextRequest) {
  return handle(request);
}

export async function POST(request: NextRequest) {
  return handle(request);
}

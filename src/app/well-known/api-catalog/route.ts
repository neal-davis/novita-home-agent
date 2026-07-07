import { NextResponse } from "next/server";

const SITE_ORIGIN = "https://novita.ai";
const API_ORIGIN = "https://api.novita.ai";

const apiCatalog = {
  linkset: [
    {
      anchor: API_ORIGIN,
      "service-desc": [
        {
          href: `${SITE_ORIGIN}/.well-known/openapi.json`,
          type: "application/openapi+json",
          title: "Novita API OpenAPI description",
        },
      ],
      "service-doc": [
        {
          href: `${SITE_ORIGIN}/docs/api-reference/model-apis-introduction`,
          type: "text/html",
          title: "Novita API documentation",
        },
      ],
      status: [
        {
          href: `${SITE_ORIGIN}/api/health`,
          type: "application/json",
          title: "Novita API health",
        },
      ],
    },
  ],
};

export const dynamic = "force-static";

export async function GET() {
  return new NextResponse(JSON.stringify(apiCatalog, null, 2), {
    headers: {
      "Content-Type": "application/linkset+json; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}

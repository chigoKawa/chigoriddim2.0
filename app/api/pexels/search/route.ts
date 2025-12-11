import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_BASE = "https://api.pexels.com/v1";

/**
 * Proxy endpoint for Pexels API search requests.
 * This avoids CORS issues by making the request server-side.
 *
 * Required header: x-pexels-api-key (the Pexels API key)
 *
 * Query parameters are forwarded directly to the Pexels API:
 * - query: Search term (required)
 * - per_page: Number of results (default: 15, max: 80)
 * - page: Page number (default: 1)
 * - orientation: landscape, portrait, or square (optional)
 */
export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-pexels-api-key");

  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing x-pexels-api-key header" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query");

  if (!query) {
    return NextResponse.json(
      { error: "Missing required 'query' parameter" },
      { status: 400 }
    );
  }

  // Build the Pexels API URL with all query params
  const pexelsUrl = new URL(`${PEXELS_API_BASE}/search`);
  searchParams.forEach((value, key) => {
    pexelsUrl.searchParams.set(key, value);
  });

  try {
    const response = await fetch(pexelsUrl.toString(), {
      headers: {
        Authorization: apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("[Pexels Proxy] API error:", response.status, errorText);
      return NextResponse.json(
        { error: `Pexels API error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("[Pexels Proxy] Request failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch from Pexels API" },
      { status: 500 }
    );
  }
}

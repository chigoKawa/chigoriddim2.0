import { NextRequest, NextResponse } from "next/server";
import { draftMode, cookies } from "next/headers";

// Draft mode toggle route, secured with CONTENTFUL_PREVIEW_SECRET.
// Usage examples:
//   /api/draft?enable=1&secret=MY_SECRET&redirect=/en/home
//   /api/draft?disable=1&redirect=/en/home
//   /api/draft?enable=1&secret=MY_SECRET&redirect=/en/home&timeline=TOKEN (for Timeline preview)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  const shouldEnable = searchParams.has("enable");
  const shouldDisable = searchParams.has("disable");
  // Normalize redirect path (remove double slashes)
  const rawRedirect = searchParams.get("redirect") || "/";
  const redirectTo = rawRedirect.replace(/\/+/g, "/");
  const secret =
    searchParams.get("secret") ?? searchParams.get("previewSecret");
  const timelineToken = searchParams.get("timeline");

  // Build target URL for redirect
  const target = new URL(redirectTo, url.origin);

  const dm = await draftMode();

  if (shouldEnable) {
    const expected = process.env.CONTENTFUL_PREVIEW_SECRET;
    if (!expected || secret !== expected) {
      return new Response(
        JSON.stringify({ message: "Invalid preview secret" }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    dm.enable();

    // Ensure the draft-mode cookie works inside the Contentful Live Preview iframe.
    // Re-set __prerender_bypass with SameSite=None; Secure so it is sent in the iframe.
    const cookieStore = await cookies();
    const bypass = cookieStore.get("__prerender_bypass");
    const draftValue = bypass?.value;
    if (draftValue) {
      cookieStore.set({
        name: "__prerender_bypass",
        value: draftValue,
        httpOnly: true,
        path: "/",
        secure: true,
        sameSite: "none",
      });
    }

    // Store timeline token in cookie (survives redirects in iframe context)
    if (timelineToken) {
      cookieStore.set({
        name: "__contentful_timeline_token",
        value: timelineToken,
        httpOnly: false, // Allow JS access if needed
        path: "/",
        secure: true,
        sameSite: "none",
        maxAge: 60 * 60, // 1 hour
      });
    } else {
      // Clear timeline cookie when switching back to Current version
      // Use set with maxAge: 0 to properly expire the cookie (more reliable than delete)
      cookieStore.set({
        name: "__contentful_timeline_token",
        value: "",
        path: "/",
        secure: true,
        sameSite: "none",
        maxAge: 0, // Expire immediately
      });
    }
  }

  if (shouldDisable) {
    dm.disable();
  }

  // Redirect back to the site
  return NextResponse.redirect(target);
}

import { NextRequest, NextResponse } from "next/server";
import { draftMode } from "next/headers";
import { getEntries } from "@/lib/contentful";
import { ILandingPage, LandingPageSkeleton } from "@/features/contentful/type";

const INCLUDES_COUNT = 6;

// Returns the landing page entry for a given locale & slug.
// Uses the Contentful Preview API when draft mode is enabled.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en-US";
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json(
      { error: "Missing required 'slug' query parameter" },
      { status: 400 }
    );
  }

  const { isEnabled: isDraft } = await draftMode();

  let pageEntry: ILandingPage | undefined;
  try {
    const entries = await getEntries<LandingPageSkeleton>(
      {
        content_type: "landingPage",
        "fields.slug": slug,
        include: INCLUDES_COUNT,
        locale,
      },
      isDraft
    );
    pageEntry = entries[0] as ILandingPage | undefined;
  } catch (err) {
    console.error("[api/contentful/landing] getEntries error", {
      slug,
      locale,
      err,
    });
  }

  if (!pageEntry) {
    return NextResponse.json({ entry: null }, { status: 404 });
  }

  // Convert the SDK entry into a plain JSON structure and defensively
  // strip any circular references that might still be present.
  const asPlainObject = pageEntry as { toPlainObject?: () => unknown };
  const raw = asPlainObject.toPlainObject
    ? (asPlainObject.toPlainObject() as ILandingPage)
    : (pageEntry as ILandingPage);

  const seen = new WeakSet<object>();
  const decycle = (value: unknown): unknown => {
    if (value && typeof value === "object") {
      if (seen.has(value as object)) {
        return undefined;
      }
      seen.add(value as object);

      if (Array.isArray(value)) {
        return value.map((item) => decycle(item));
      }

      const out: Record<string, unknown> = {};
      for (const key of Object.keys(value as Record<string, unknown>)) {
        const current = (value as Record<string, unknown>)[key];
        out[key] = decycle(current);
      }
      return out;
    }
    return value;
  };

  const pageData = decycle(raw) as ILandingPage;

  return NextResponse.json({ entry: pageData, isDraft }, { status: 200 });
}

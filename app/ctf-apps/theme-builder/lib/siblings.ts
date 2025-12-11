import slugify from "slugify";
import type { SidebarAppSDK } from "@contentful/app-sdk";
import { CONTENT_TYPE_ID } from "../constants";
import { getContentTypeId, getContentTypeIds } from "./params";
import type { SlugFields } from "../types";

type CMAEntryLite = {
  sys: { id: string };
  fields?: Record<string, Record<string, unknown>>;
};

export async function ensureSiblingUniqueSegment(
  sdk: SidebarAppSDK,
  fields: SlugFields
): Promise<string> {
  const base =
    fields.slugSegment && fields.slugSegment.trim().length > 0
      ? fields.slugSegment
      : slugify(fields.title || "", { lower: true, strict: true });

  const parentId = fields.parent?.sys.id;
  const configured = getContentTypeIds(sdk, [getContentTypeId(sdk, CONTENT_TYPE_ID)]);
  const currentCt = sdk.entry.getSys()?.contentType?.sys?.id as string | undefined;
  const ctIds = (configured && configured.length > 0
    ? configured
    : (currentCt ? [currentCt] : [])) as string[];

  const q: Record<string, unknown> = {
    limit: 500,
    select: "sys.id,fields.slugSegment,fields.parent",
  };
  if (ctIds.length === 1) q["content_type"] = ctIds[0];
  else if (ctIds.length > 1) q["content_type[in]"] = ctIds.join(",");
  if (parentId) q["fields.parent.sys.id"] = parentId;
  else q["fields.parent[exists]"] = false;

  const res = await sdk.cma.entry.getMany({ query: q });
  const currentId = sdk.entry.getSys().id;
  const taken = new Set(
    (res.items as CMAEntryLite[])
      .filter((it) => it.sys.id !== currentId)
      .map((it) => {
        const f = it.fields?.slugSegment as Record<string, unknown> | undefined;
        const v = f ? (f[sdk.locales.default] as string | undefined) : undefined;
        return v || "";
      })
  );

  if (!taken.has(base)) return base;

  let i = 2;
  while (i < 1000) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
    i++;
  }
  throw new Error("Could not generate a unique segment among siblings.");
}

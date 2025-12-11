/* eslint-disable @typescript-eslint/no-explicit-any */
import type { SidebarAppSDK } from "@contentful/app-sdk";
import { CONTENT_TYPE_ID } from "../constants";
import { getContentTypeId, getContentTypeIds } from "./params";

export async function findFullPathConflict(
  sdk: SidebarAppSDK,
  fullPath: string
) {
  const configured = getContentTypeIds(sdk, [
    getContentTypeId(sdk, CONTENT_TYPE_ID),
  ]);
  const currentCt = sdk.entry.getSys()?.contentType?.sys?.id as
    | string
    | undefined;
  const ctIds = (
    configured && configured.length > 0
      ? configured
      : currentCt
      ? [currentCt]
      : []
  ) as string[];

  const query: Record<string, any> = {
    "fields.fullPath": fullPath,
    select: "sys.id",
    limit: 2,
  };
  // Always restrict to a content type per CMA requirements
  if (Array.isArray(ctIds) && ctIds.length > 1)
    query["content_type[in]"] = ctIds.join(",");
  else if (ctIds.length === 1) query["content_type"] = ctIds[0];

  const res = await sdk.cma.entry.getMany({ query });
  return res.items[0]?.sys?.id as string | undefined;
}

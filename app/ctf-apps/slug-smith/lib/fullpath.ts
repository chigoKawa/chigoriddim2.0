import type { SidebarAppSDK } from "@contentful/app-sdk";
import type { SlugFields } from "../types";
import { normalizePath } from "./path-utils";

export async function buildFullPath(
  sdk: SidebarAppSDK,
  parent: SlugFields["parent"],
  childSegment: string
): Promise<{ fullPath: string; pathChain: string[] }> {
  const chainIds: string[] = [];
  let cursor = parent?.sys.id || null;
  let prefix = "";

  const selfId = sdk.entry.getSys().id;
  if (cursor === selfId) throw new Error("Parent cannot be this entry (cycle).");

  while (cursor) {
    if (chainIds.includes(cursor)) throw new Error("Cycle detected in parent chain.");
    chainIds.push(cursor);

    const ancestor = await sdk.cma.entry.get({ entryId: cursor });
    const ancestorPath = (ancestor.fields?.fullPath?.[sdk.locales.default] || "") as string;
    const ancestorParent = ancestor.fields?.parent?.[sdk.locales.default]?.sys?.id as string | undefined;

    if (ancestorPath) {
      prefix = ancestorPath;
      break;
    } else {
      const seg = (ancestor.fields?.slugSegment?.[sdk.locales.default] || "") as string;
      prefix = prefix ? `/${seg}${prefix}` : `/${seg}`;
      cursor = ancestorParent || null;
    }
  }

  const fullPath = normalizePath(`${prefix}/${childSegment}`);
  return { fullPath, pathChain: chainIds };
}

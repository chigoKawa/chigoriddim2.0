import type { SidebarAppSDK } from "@contentful/app-sdk";

export function getContentTypeId(sdk: SidebarAppSDK, fallback: string): string {
  const fromInstall = (sdk.parameters?.installation as { contentTypeId?: string } | undefined)?.contentTypeId;
  return fromInstall && fromInstall.trim().length > 0 ? fromInstall : fallback;
}

export function getLocaleMode(sdk: SidebarAppSDK, fallback: "single" | "per-locale") {
  const fromInstall = (sdk.parameters?.installation as { localeMode?: "single" | "per-locale" } | undefined)?.localeMode;
  return fromInstall === "per-locale" ? "per-locale" : fallback;
}

export function getContentTypeIds(
  sdk: SidebarAppSDK,
  fallback: string[]
): string[] {
  const params = sdk.parameters?.installation as { contentTypeIds?: string[]; contentTypeId?: string } | undefined;
  if (Array.isArray(params?.contentTypeIds) && params!.contentTypeIds.length > 0) return params!.contentTypeIds;
  if (params?.contentTypeId && params.contentTypeId.trim()) return [params.contentTypeId.trim()];
  return fallback;
}

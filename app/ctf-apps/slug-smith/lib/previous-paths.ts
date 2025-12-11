import type { SidebarAppSDK } from "@contentful/app-sdk";

export async function appendPreviousPath(sdk: SidebarAppSDK, prev: string) {
  const field = (sdk.entry.fields as any)["previousPaths"];
  if (!field) return;
  const current = (field.getValue() as string[] | undefined) ?? [];
  if (!current.includes(prev)) {
    await field.setValue([...current, prev]);
  }
}

import { Entry, EntrySkeletonType } from "contentful";
import { getEntries } from "@/lib/contentful";
import type { Locale } from "@/i18n-config";

interface NavigationMenuSkeleton extends EntrySkeletonType {
  contentTypeId: "navigationMenu";
}

interface ExternalLinkSkeleton extends EntrySkeletonType {
  contentTypeId: "externalLink";
}

export type SocialLink = {
  label: string;
  href: string;
};

export async function getSocialLinks(
  locale: Locale,
  isPreviewEnabled: boolean
): Promise<SocialLink[]> {
  const menus = await getEntries<NavigationMenuSkeleton>(
    {
      content_type: "navigationMenu",
      include: 2,
      limit: 1,
      locale,
    },
    isPreviewEnabled
  );

  const menu = menus[0] as Entry<NavigationMenuSkeleton> | undefined;
  if (!menu) return [];

  const links = (menu.fields as any).socialLinks as
    | Entry<ExternalLinkSkeleton>[]
    | undefined;

  if (!links || links.length === 0) return [];

  const social: SocialLink[] = [];

  for (const link of links) {
    const fields = link.fields as any;
    const url = fields.url as string | undefined;
    if (!url) continue;

    const title =
      (fields.optionalIcon as string | undefined) ||
      (fields.title as string | undefined) ||
      (fields.internalTitle as string | undefined) ||
      url;

    social.push({ label: title, href: url });
  }

  return social;
}

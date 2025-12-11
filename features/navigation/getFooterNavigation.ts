import { EntrySkeletonType, Entry } from "contentful";
import { getEntries } from "@/lib/contentful";
import { getI18nConfig, Locale } from "@/i18n-config";
import { NavItem } from "@/features/layout/responsive-nav";

export type FooterSection = {
  label: string;
  items: NavItem[];
};

interface NavigationMenuSkeleton extends EntrySkeletonType {
  contentTypeId: "navigationMenu";
}

interface NavigationItemSkeleton extends EntrySkeletonType {
  contentTypeId: "navigationItem";
}

interface LandingPageSkeleton extends EntrySkeletonType {
  contentTypeId: "landingPage";
}

interface ExternalLinkSkeleton extends EntrySkeletonType {
  contentTypeId: "externalLink";
}

interface BlogPostSkeleton extends EntrySkeletonType {
  contentTypeId: "blogPost";
}

export async function getFooterNavigation(
  locale: Locale,
  isPreviewEnabled: boolean
): Promise<{ sections: FooterSection[]; siteName?: string }> {
  const menus = await getEntries<NavigationMenuSkeleton>(
    {
      content_type: "navigationMenu",
      include: 3,
      limit: 1,
      locale,
    },
    isPreviewEnabled
  );

  const menu = menus[0] as Entry<NavigationMenuSkeleton> | undefined;
  if (!menu) return { sections: [] };

  const { defaultLocale } = await getI18nConfig();

  // Extract site name from navigation menu entry
  const siteName = (menu.fields as any).siteName as string | undefined;

  const sections = (menu.fields as any).footerSections as
    | Entry<NavigationItemSkeleton>[]
    | undefined;

  if (!sections || sections.length === 0) return { sections: [], siteName };

  const toHref = (entry: Entry<EntrySkeletonType>): string | null => {
    const ctId = (entry.sys.contentType as any)?.sys?.id as string | undefined;

    if (ctId === "landingPage") {
      const lp = entry as Entry<LandingPageSkeleton>;
      const fullPath = (lp.fields as any).fullPath as string | undefined;
      if (!fullPath) return null;
      const cleanPath = fullPath.startsWith("/") ? fullPath : `/${fullPath}`;
      return locale === defaultLocale ? cleanPath : `/${locale}${cleanPath}`;
    }

    if (ctId === "blogPost") {
      const post = entry as Entry<BlogPostSkeleton>;
      const slug = (post.fields as any).slug as string | undefined;
      if (!slug) return null;
      const blogPath = `blog/${slug}`;
      return locale === defaultLocale
        ? `/${blogPath}`
        : `/${locale}/${blogPath}`;
    }

    if (ctId === "externalLink") {
      const ext = entry as Entry<ExternalLinkSkeleton>;
      const url = (ext.fields as any).url as string | undefined;
      if (!url) return null;
      return url;
    }

    return null;
  };

  const footerSections: FooterSection[] = [];

  for (const section of sections) {
    const sectionLabel = (section.fields as any).label as string | undefined;
    const subItems = (section.fields as any).subNavigationItems as
      | Entry<NavigationItemSkeleton>[]
      | undefined;

    if (!sectionLabel) continue;

    const items: NavItem[] = [];

    if (subItems && subItems.length > 0) {
      for (const item of subItems) {
        const label = (item.fields as any).label as string | undefined;
        const target = (item.fields as any).target as
          | Entry<EntrySkeletonType>
          | undefined;

        if (!label || !target) continue;

        const href = toHref(target);
        if (!href) continue;

        const targetCtId = (target.sys.contentType as any)?.sys?.id as
          | string
          | undefined;
        const external = targetCtId === "externalLink";

        items.push({
          label,
          href,
          external,
          openInNewTab: external,
        });
      }
    }

    footerSections.push({
      label: sectionLabel,
      items,
    });
  }

  return { sections: footerSections, siteName };
}

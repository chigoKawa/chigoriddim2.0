import { EntrySkeletonType, Entry } from "contentful";
import { getEntries } from "@/lib/contentful";
import { getI18nConfig, Locale } from "@/i18n-config";
import { NavItem } from "@/features/layout/responsive-nav";

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

export async function getMainNavigation(
  locale: Locale,
  isPreviewEnabled: boolean
): Promise<{ items: NavItem[]; siteName?: string }> {
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
  if (!menu) return { items: [] };

  const { defaultLocale } = await getI18nConfig();

  // Extract site name from navigation menu entry
  const siteName = (menu.fields as any).siteName as string | undefined;

  const items = (menu.fields as any).content as
    | Entry<NavigationItemSkeleton>[]
    | undefined;

  if (!items || items.length === 0) return { items: [], siteName };

  const toHref = (entry: Entry<EntrySkeletonType>): string | null => {
    const ctId = (entry.sys.contentType as any)?.sys?.id as string | undefined;

    if (ctId === "landingPage") {
      const lp = entry as Entry<LandingPageSkeleton>;
      const fullPath = (lp.fields as any).fullPath as string | undefined;
      if (!fullPath) return null;
      // Ensure we only ever have a single leading slash. Some entries store fullPath like "/blog".
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

  const navItems: NavItem[] = [];

  for (const item of items) {
    const label = (item.fields as any).label as string | undefined;
    const target = (item.fields as any).target as
      | Entry<EntrySkeletonType>
      | undefined;
    const subItems = (item.fields as any).subNavigationItems as
      | Entry<NavigationItemSkeleton>[]
      | undefined;

    if (!label) continue;

    let href: string | null = null;
    let external = false;

    if (target) {
      href = toHref(target);
      const targetCtId = (target.sys.contentType as any)?.sys?.id as
        | string
        | undefined;
      external = targetCtId === "externalLink";
    }

    const children: NavItem[] | undefined = subItems
      ? subItems
          .map((child) => {
            const childLabel = (child.fields as any).label as
              | string
              | undefined;
            const childTarget = (child.fields as any).target as
              | Entry<EntrySkeletonType>
              | undefined;
            if (!childLabel || !childTarget) return null;
            const childHref = toHref(childTarget);
            if (!childHref) return null;
            const childCtId = (childTarget.sys.contentType as any)?.sys?.id as
              | string
              | undefined;
            const childExternal = childCtId === "externalLink";
            return {
              label: childLabel,
              href: childHref,
              external: childExternal,
              openInNewTab: childExternal,
            } as NavItem;
          })
          .filter((c): c is NavItem => c !== null)
      : undefined;

    // If no direct target but we have children, treat parent as a non-clickable group.
    if (!href && (!children || children.length === 0)) {
      continue;
    }

    navItems.push({
      label,
      href: href || "#",
      external,
      openInNewTab: external,
      children,
    });
  }

  return { items: navItems, siteName };
}

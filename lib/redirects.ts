import redirectSnapshot from "./redirects-data.json";

export type RedirectRuleSource = "Manual" | "System" | "Migration" | string;

export type RedirectRule = {
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  preserveQuery?: boolean;
  active?: boolean; // default true when undefined
  startsAt?: string | Date; // optional start of validity window
  endsAt?: string | Date; // optional end of validity window
  source?: RedirectRuleSource;
};

// Static hand-authored rules that always apply.
const STATIC_REDIRECTS: RedirectRule[] = [
  {
    fromPath: "/home",
    toPath: "/",
    statusCode: 301,
    active: true,
    preserveQuery: true,
  },
];

// Snapshot generated at build/CI time from Contentful `redirect` entries.
const SNAPSHOT_REDIRECTS: RedirectRule[] = (redirectSnapshot ||
  []) as RedirectRule[];

function isWithinWindow(rule: RedirectRule, now: Date): boolean {
  const { startsAt, endsAt } = rule;

  if (startsAt) {
    const startDate =
      typeof startsAt === "string" ? new Date(startsAt) : startsAt;
    if (Number.isNaN(startDate.getTime()) || now < startDate) {
      return false;
    }
  }

  if (endsAt) {
    const endDate = typeof endsAt === "string" ? new Date(endsAt) : endsAt;
    if (Number.isNaN(endDate.getTime()) || now > endDate) {
      return false;
    }
  }

  return true;
}

export function findRedirect(pathname: string): RedirectRule | undefined {
  if (!pathname.startsWith("/")) return undefined;

  const normalized = pathname.replace(/\/+$/, "") || "/";
  const now = new Date();

  const allRules: RedirectRule[] = [...STATIC_REDIRECTS, ...SNAPSHOT_REDIRECTS];

  return allRules.find((rule) => {
    const from = rule.fromPath.replace(/\/+$/, "") || "/";
    if (from !== normalized) return false;

    const isActive = rule.active ?? true;
    if (!isActive) return false;

    return isWithinWindow(rule, now);
  });
}

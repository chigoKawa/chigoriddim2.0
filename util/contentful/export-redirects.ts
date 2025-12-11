/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient } from "contentful";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables for scripts (supports .env and .env.local)
dotenv.config();
dotenv.config({ path: ".env.local" });

// Local type mirroring lib/redirects.ts to avoid import-time coupling.
type RedirectRuleForExport = {
  fromPath: string;
  toPath: string;
  statusCode: 301 | 302 | 307 | 308;
  preserveQuery?: boolean;
  active?: boolean;
  startsAt?: string;
  endsAt?: string;
  source?: string;
};

async function main() {
  const spaceId =
    process.env.NEXT_PUBLIC_CTF_SPACE_ID || process.env.CONTENTFUL_SPACE_ID;
  const environment =
    process.env.NEXT_PUBLIC_CTF_ENVIRONMENT ||
    process.env.CONTENTFUL_ENVIRONMENT ||
    "master";
  const accessToken =
    process.env.NEXT_PUBLIC_CTF_DELIVERY_TOKEN ||
    process.env.CONTENTFUL_DELIVERY_TOKEN;

  if (!spaceId || !accessToken) {
    throw new Error(
      "Missing Contentful credentials. Ensure NEXT_PUBLIC_CTF_SPACE_ID (or CONTENTFUL_SPACE_ID) and NEXT_PUBLIC_CTF_CDA_TOKEN (or CONTENTFUL_DELIVERY_TOKEN) are set in your environment or .env/.env.local."
    );
  }

  const client = createClient({
    space: spaceId,
    accessToken,
    environment,
  } as any);

  const locale = process.env.NEXT_PUBLIC_DEFAULT_LOCALE || "en-US";

  console.log(
    `Exporting redirects from Contentful space=${spaceId}, env=${environment}, locale=${locale}`
  );

  const res = await client.getEntries({
    content_type: "redirect",
    limit: 1000,
    include: 1,
    locale,
  });

  const rules: RedirectRuleForExport[] = res.items
    .map((entry: any) => {
      const fields = entry.fields || {};
      const fromPath = fields.fromPath as string | undefined;
      const toEntry = fields.toEntry as any | undefined;
      const toPath = toEntry?.fields?.fullPath as string | undefined;

      if (!fromPath || !toPath) {
        return null;
      }

      const httpStatus = (fields.httpStatus as string | undefined) || "301";
      const numericStatus = parseInt(httpStatus, 10) as 301 | 302 | 307 | 308;

      const preserveQuery = fields.preserveQuery as boolean | undefined;

      const rule: RedirectRuleForExport = {
        fromPath,
        toPath,
        statusCode:
          numericStatus === 301 ||
          numericStatus === 302 ||
          numericStatus === 307 ||
          numericStatus === 308
            ? numericStatus
            : 301,
        preserveQuery,
        active: fields.active as boolean | undefined,
        startsAt: (fields.startsAt as string | undefined) || undefined,
        endsAt: (fields.endsAt as string | undefined) || undefined,
        source: (fields.source as string | undefined) || undefined,
      };

      return rule;
    })
    .filter((r): r is RedirectRuleForExport => r !== null);

  const targetPath = path.resolve(process.cwd(), "lib/redirects-data.json");
  await fs.promises.writeFile(
    targetPath,
    JSON.stringify(rules, null, 2),
    "utf8"
  );

  console.log(`Wrote ${rules.length} redirect rule(s) to ${targetPath}`);
}

main().catch((err) => {
  console.error("Error exporting redirects", err);
  process.exit(1);
});

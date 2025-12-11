import contentfulManagement from "contentful-management";
import fs from "fs";
import path from "path";

const { createClient } = contentfulManagement as {
  createClient: typeof import("contentful-management")["createClient"];
};

interface SeedFaqItem {
  id: string;
  contentTypeId: string;
  fields: {
    internalTitle: string;
    question: string;
    answer: string[];
  };
}

interface SeedFaqGroup {
  id: string;
  contentTypeId: string;
  fields: {
    internalTitle: string;
    title: string;
    description?: string;
    items: string[]; // references to faq item ids in this JSON
  };
}

interface SeedData {
  spaceId: string;
  environmentId: string;
  locale: string;
  faqItems: SeedFaqItem[];
  faqGroups: SeedFaqGroup[];
  frames?: {
    id: string;
    contentTypeId: string; // "frame"
    fields: {
      internalTitle: string;
      layout:
        | "single"
        | "duplex"
        | "hero"
        | "grid"
        | "carousel"
        | "list"
        | "timeline";
      theme: "light" | "dark" | "brand";
      backgroundColor:
        | "primary"
        | "secondary"
        | "accent"
        | "neutral"
        | "transparent";
      alignment: "left" | "right" | "center";
      things: string[]; // faqGroup ids
    };
  }[];
  landingPages?: {
    id: string;
    contentTypeId: string; // "landingPage"
    fields: {
      internalTitle: string;
      title: string;
      slugSegment: string;
      searchSummary: string;
      parent?: string; // landing page id from this JSON
      frames: string[]; // frame ids from this JSON
    };
  }[];
}

async function main() {
  const token = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
  if (!token) {
    throw new Error(
      "Set CONTENTFUL_MANAGEMENT_TOKEN in your environment before running this script."
    );
  }

  const dataPath = path.resolve(
    process.cwd(),
    "util/contentful/seed-data.json"
  );
  const raw = fs.readFileSync(dataPath, "utf-8");
  const seed = JSON.parse(raw) as SeedData;

  const client = createClient({ accessToken: token });
  const space = await client.getSpace(seed.spaceId);
  const env = await space.getEnvironment(seed.environmentId);
  const locale = seed.locale;

  const createdFaqItems: Record<string, string> = {};
  const createdFaqGroups: Record<string, string> = {};
  const createdFrames: Record<string, string> = {};
  const createdLandingPages: Record<string, string> = {};

  async function upsertEntryWithId(
    contentTypeId: string,
    entryId: string,
    fields: Record<string, unknown>
  ) {
    try {
      const existing = await env.getEntry(entryId);
      existing.fields = fields as any;
      const updated = await existing.update();
      const published = await updated.publish();
      return published;
    } catch (err: any) {
      if (err?.name === "NotFound" || err?.response?.status === 404) {
        const created = await env.createEntryWithId(contentTypeId, entryId, {
          fields,
        } as any);
        const published = await created.publish();
        return published;
      }
      throw err;
    }
  }

  // Create / update FAQ items
  for (const item of seed.faqItems) {
    const richText = {
      nodeType: "document",
      data: {},
      content: item.fields.answer.map((paragraph) => ({
        nodeType: "paragraph",
        data: {},
        content: [
          {
            nodeType: "text",
            value: paragraph,
            marks: [],
            data: {},
          },
        ],
      })),
    };

    const entry = await upsertEntryWithId(item.contentTypeId, item.id, {
      internalTitle: { [locale]: item.fields.internalTitle },
      question: { [locale]: item.fields.question },
      answer: { [locale]: richText },
    });
    createdFaqItems[item.id] = entry.sys.id;
    console.log("Created FAQ Item", item.id, "→", entry.sys.id);
  }

  // Create / update FAQ groups
  for (const group of seed.faqGroups) {
    const descriptionRichText = group.fields.description
      ? {
          nodeType: "document",
          data: {},
          content: [
            {
              nodeType: "paragraph",
              data: {},
              content: [
                {
                  nodeType: "text",
                  value: group.fields.description,
                  marks: [],
                  data: {},
                },
              ],
            },
          ],
        }
      : undefined;

    const items = group.fields.items.map((itemId) => ({
      sys: {
        type: "Link",
        linkType: "Entry",
        id: createdFaqItems[itemId],
      },
    }));

    const fields: any = {
      internalTitle: { [locale]: group.fields.internalTitle },
      title: { [locale]: group.fields.title },
      items: { [locale]: items },
    };

    if (descriptionRichText) {
      fields.description = { [locale]: descriptionRichText };
    }

    const entry = await upsertEntryWithId(
      group.contentTypeId,
      group.id,
      fields
    );
    console.log("Created FAQ Group", group.id, "→", entry.sys.id);
    createdFaqGroups[group.id] = entry.sys.id;
  }

  // Create / update Frames for FAQ pages (if present)
  if (seed.frames) {
    for (const frame of seed.frames) {
      const things = frame.fields.things.map((groupId) => ({
        sys: {
          type: "Link",
          linkType: "Entry",
          id: createdFaqGroups[groupId],
        },
      }));

      const fields: any = {
        internalTitle: { [locale]: frame.fields.internalTitle },
        layout: { [locale]: frame.fields.layout },
        theme: { [locale]: frame.fields.theme },
        backgroundColor: { [locale]: frame.fields.backgroundColor },
        alignment: { [locale]: frame.fields.alignment },
      };

      if (things.length > 0) {
        fields.things = { [locale]: things };
      }

      const entry = await upsertEntryWithId(
        frame.contentTypeId,
        frame.id,
        fields
      );
      createdFrames[frame.id] = entry.sys.id;
      console.log("Created Frame", frame.id, "→", entry.sys.id);
    }
  }

  // Create / update landing pages wired to frames and hierarchy (if present)
  if (seed.landingPages) {
    for (const lp of seed.landingPages) {
      const frameLinks = lp.fields.frames.map((frameId) => ({
        sys: {
          type: "Link",
          linkType: "Entry",
          id: createdFrames[frameId],
        },
      }));

      const fields: any = {
        internalTitle: { [locale]: lp.fields.internalTitle },
        title: { [locale]: lp.fields.title },
        slugSegment: { [locale]: lp.fields.slugSegment },
        searchSummary: { [locale]: lp.fields.searchSummary },
        frames: { [locale]: frameLinks },
      };

      if (lp.fields.parent) {
        const parentId = createdLandingPages[lp.fields.parent];
        if (parentId) {
          fields.parent = {
            [locale]: {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: parentId,
              },
            },
          };
        }
      }

      const entry = await upsertEntryWithId(lp.contentTypeId, lp.id, fields);
      createdLandingPages[lp.id] = entry.sys.id;
      console.log("Created Landing Page", lp.id, "→", entry.sys.id);
    }
  }

  console.log("Seeding complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

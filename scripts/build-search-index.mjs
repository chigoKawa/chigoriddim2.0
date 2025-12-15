/**
 * Build-time script to generate search index from Contentful entries.
 * Run with: node scripts/build-search-index.mjs
 *
 * This fetches all landingPage and blogPost entries and creates a JSON index
 * that Flexsearch can load on the client side.
 */

import { createClient } from "contentful";
import { writeFileSync, readFileSync, existsSync, mkdirSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_PATH = join(__dirname, "../public/search-index.json");

// Ensure public directory exists
mkdirSync(dirname(OUTPUT_PATH), { recursive: true });

const client = createClient({
  space: process.env.NEXT_PUBLIC_CTF_SPACE_ID,
  accessToken: process.env.NEXT_PUBLIC_CTF_DELIVERY_TOKEN,
  environment: process.env.NEXT_PUBLIC_CTF_ENVIRONMENT || "master",
});

/**
 * Extract plain text from Contentful rich text document
 */
function extractPlainText(richText) {
  if (!richText || !richText.content) return "";

  const extractFromNode = (node) => {
    if (node.nodeType === "text") {
      return node.value || "";
    }
    if (node.content && Array.isArray(node.content)) {
      return node.content.map(extractFromNode).join(" ");
    }
    return "";
  };

  return richText.content.map(extractFromNode).join(" ").trim();
}

/**
 * Fetch all entries of a content type with pagination
 */
async function fetchAllEntries(contentType, locale = "en-US") {
  const entries = [];
  let skip = 0;
  const limit = 100;
  let total = 0;

  do {
    const response = await client.getEntries({
      content_type: contentType,
      locale,
      skip,
      limit,
      include: 1,
    });

    entries.push(...response.items);
    total = response.total;
    skip += limit;
  } while (skip < total);

  return entries;
}

/**
 * Process landing pages into search documents
 */
function processLandingPages(entries) {
  return entries
    .filter((entry) => entry.fields.title && entry.fields.fullPath)
    .map((entry) => {
      // Normalize path - remove leading slash from fullPath if present
      const fullPath = entry.fields.fullPath.replace(/^\/+/, "");
      return {
        id: entry.sys.id,
        type: "page",
        title: entry.fields.title || entry.fields.internalTitle || "",
        path: `/${fullPath}`,
        excerpt: entry.fields.searchSummary || "",
        updatedAt: entry.sys.updatedAt,
      };
    });
}

/**
 * Process blog posts into search documents
 */
function processBlogPosts(entries) {
  return entries
    .filter((entry) => entry.fields.title && entry.fields.slug)
    .map((entry) => {
      // Extract excerpt from summary or body
      let excerpt = "";
      if (entry.fields.summary) {
        excerpt = extractPlainText(entry.fields.summary);
      } else if (entry.fields.body) {
        excerpt = extractPlainText(entry.fields.body).slice(0, 200);
      }

      return {
        id: entry.sys.id,
        type: "blog",
        title: entry.fields.title || "",
        path: `/blog/${entry.fields.slug}`,
        excerpt: excerpt.slice(0, 200) + (excerpt.length > 200 ? "..." : ""),
        publishedDate: entry.fields.publishedDate || null,
        updatedAt: entry.sys.updatedAt,
      };
    });
}

/**
 * Load existing search index to compare for removed pages
 */
function loadExistingIndex() {
  if (!existsSync(OUTPUT_PATH)) {
    return null;
  }
  try {
    const content = readFileSync(OUTPUT_PATH, "utf-8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Compare old and new documents to find removed pages
 */
function findRemovedPages(oldDocs, newDocs) {
  if (!oldDocs || !Array.isArray(oldDocs)) return [];

  const newIds = new Set(newDocs.map((doc) => doc.id));
  return oldDocs.filter((doc) => !newIds.has(doc.id));
}

/**
 * Compare old and new documents to find added pages
 */
function findAddedPages(oldDocs, newDocs) {
  if (!oldDocs || !Array.isArray(oldDocs)) return newDocs;

  const oldIds = new Set(oldDocs.map((doc) => doc.id));
  return newDocs.filter((doc) => !oldIds.has(doc.id));
}

async function buildSearchIndex() {
  console.log("🔍 Building search index...");

  try {
    // Load existing index for comparison
    const existingIndex = loadExistingIndex();
    const existingDocs = existingIndex?.documents || [];

    // Fetch all content types
    console.log("  Fetching landing pages...");
    const landingPages = await fetchAllEntries("landingPage");
    console.log(`    Found ${landingPages.length} landing pages`);

    console.log("  Fetching blog posts...");
    const blogPosts = await fetchAllEntries("blogPost");
    console.log(`    Found ${blogPosts.length} blog posts`);

    // Process into search documents
    const documents = [
      ...processLandingPages(landingPages),
      ...processBlogPosts(blogPosts),
    ];

    // Find removed and added pages
    const removedPages = findRemovedPages(existingDocs, documents);
    const addedPages = findAddedPages(existingDocs, documents);

    // Log changes
    if (removedPages.length > 0) {
      console.log(`  🗑️  Removed ${removedPages.length} page(s):`);
      removedPages.forEach((page) => {
        console.log(`      - ${page.title} (${page.path})`);
      });
    }

    if (addedPages.length > 0) {
      console.log(`  ➕ Added ${addedPages.length} page(s):`);
      addedPages.forEach((page) => {
        console.log(`      + ${page.title} (${page.path})`);
      });
    }

    if (
      removedPages.length === 0 &&
      addedPages.length === 0 &&
      existingDocs.length > 0
    ) {
      console.log("  ℹ️  No pages added or removed");
    }

    // Create the index data structure
    const searchIndex = {
      version: 1,
      generatedAt: new Date().toISOString(),
      documents,
    };

    // Write to file
    writeFileSync(OUTPUT_PATH, JSON.stringify(searchIndex, null, 2));

    console.log(`✅ Search index built successfully!`);
    console.log(`   Total documents: ${documents.length}`);
    console.log(`   Output: ${OUTPUT_PATH}`);
  } catch (error) {
    console.error("❌ Error building search index:", error.message);
    process.exit(1);
  }
}

buildSearchIndex();

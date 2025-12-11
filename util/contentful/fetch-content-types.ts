#!/usr/bin/env ts-node

import contentfulManagement from "contentful-management";

const SPACE_ID = process.env.NEXT_PUBLIC_CTF_SPACE_ID || "skzlea4w0ev5";
const MANAGEMENT_TOKEN = process.env.CONTENTFUL_MANAGEMENT_TOKEN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_CTF_ENVIRONMENT || "master";

if (!MANAGEMENT_TOKEN) {
  console.error(
    "ERROR: CONTENTFUL_MANAGEMENT_TOKEN environment variable is required"
  );
  process.exit(1);
}

async function fetchContentTypes() {
  const client = contentfulManagement.createClient({
    accessToken: MANAGEMENT_TOKEN!,
  });

  try {
    const space = await client.getSpace(SPACE_ID);
    const environment = await space.getEnvironment(ENVIRONMENT);

    const contentTypes = await environment.getContentTypes();

    console.log("=== CURRENT CONTENT TYPES ===");
    contentTypes.items.forEach((ct) => {
      console.log(`ID: ${ct.sys.id}`);
      console.log(`Name: ${ct.name}`);
      console.log(`Description: ${ct.description || "No description"}`);
      console.log("---");
    });

    // Look for specific content types
    const blurbType = contentTypes.items.find(
      (ct) =>
        ct.sys.id.toLowerCase().includes("blurb") ||
        ct.name.toLowerCase().includes("blurb")
    );

    const pdfType = contentTypes.items.find(
      (ct) =>
        ct.sys.id.toLowerCase().includes("pdf") ||
        ct.name.toLowerCase().includes("pdf")
    );

    console.log("\n=== SEARCH RESULTS ===");
    if (blurbType) {
      console.log("FOUND BLURB TYPE:");
      console.log(JSON.stringify(blurbType, null, 2));
    } else {
      console.log("No Blurb content type found");
    }

    if (pdfType) {
      console.log("FOUND PDF TYPE:");
      console.log(JSON.stringify(pdfType, null, 2));
    } else {
      console.log("No PDF content type found");
    }
  } catch (error) {
    console.error("Error fetching content types:", error);
  }
}

fetchContentTypes();

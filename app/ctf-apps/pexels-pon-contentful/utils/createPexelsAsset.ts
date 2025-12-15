import type { FieldAppSDK } from "@contentful/app-sdk";
import type { PexelsImage } from "../types";

interface CreateAssetResult {
  success: boolean;
  assetId?: string;
  error?: string;
}

export async function createPexelsAsset(
  sdk: FieldAppSDK,
  image: PexelsImage
): Promise<CreateAssetResult> {
  try {
    const locale = sdk.field.locale;
    const environmentId = sdk.ids.environment;

    // Download the image through our proxy to avoid CORS
    const imageUrl = image.src.original || image.src.large2x || image.src.large;
    if (!imageUrl) {
      throw new Error("No valid image URL found");
    }
    const downloadUrl = `/api/pexels/download?url=${encodeURIComponent(
      imageUrl
    )}`;

    const imageResponse = await fetch(downloadUrl);
    if (!imageResponse.ok) {
      throw new Error("Failed to download image from Pexels");
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // Determine file extension from content type
    const extension = contentType.split("/")[1] || "jpg";
    const fileName = `pexels-${image.photoId}.${extension}`;

    // Create the asset title from image metadata
    const title = image.alt || `Photo by ${image.photographer.name} on Pexels`;
    const description = `${image.attribution.text}\nSource: ${image.attribution.url}\nPhotographer: ${image.photographer.name} (${image.photographer.url})`;

    // Upload to Contentful using the CMA
    const upload = await sdk.cma.upload.create(
      { environmentId },
      {
        file: imageBuffer,
      }
    );

    // Create the asset with the uploaded file
    const asset = await sdk.cma.asset.create(
      { environmentId },
      {
        fields: {
          title: {
            [locale]: title,
          },
          description: {
            [locale]: description,
          },
          file: {
            [locale]: {
              contentType,
              fileName,
              uploadFrom: {
                sys: {
                  type: "Link",
                  linkType: "Upload",
                  id: upload.sys.id,
                },
              },
            },
          },
        },
      }
    );

    // Process the asset for all locales
    const processedAsset = await sdk.cma.asset.processForAllLocales(
      { environmentId },
      asset
    );

    // Optionally publish the asset
    const publishedAsset = await sdk.cma.asset.publish(
      { environmentId, assetId: processedAsset.sys.id },
      processedAsset
    );

    const assetId = publishedAsset?.sys?.id;
    if (!assetId) {
      throw new Error("Contentful did not return an asset ID");
    }

    return {
      success: true,
      assetId,
    };
  } catch (error) {
    console.error("Error creating Contentful asset from Pexels image:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}

"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import Image from "next/image";
import { Asset } from "contentful";
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode,
} from "@contentful/live-preview/react";
import {
  IBlurb,
  IImageWrapper,
  IPexelsImageWrapper,
  IPexelsPhotoData,
  IPexelsPhotoDataLegacy,
} from "../../type";
import { extractContentfulAssetUrl } from "@/lib/utils";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { baseRichTextOptions } from "@/features/contentful/richtext";

/** Get URL from pexels data (handles both new and legacy formats) */
function getPexelsImageUrl(
  data: IPexelsPhotoData | IPexelsPhotoDataLegacy | undefined
): string | undefined {
  if (!data?.src) return undefined;
  const s = data.src;
  return s.large || s.medium || s.original;
}

const BlurbWrapper = ({ entry }: { entry: IBlurb }) => {
  // Live preview hooks
  const liveEntry = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({
    entryId: entry?.sys?.id,
  });

  const internalTitle = liveEntry?.fields?.internalTitle as string;
  const body = liveEntry?.fields?.body;
  const images = liveEntry?.fields?.images;
  const backgroundColor = liveEntry?.fields?.backgroundColor || "Default";

  const extractedImageUrls = images?.map((image) => {
    const imageEntry = image as unknown as IImageWrapper | IPexelsImageWrapper;
    const fields = imageEntry?.fields as Partial<
      IImageWrapper["fields"] & IPexelsImageWrapper["fields"]
    >;

    // Handle Contentful Asset
    const asset = (fields?.asset ||
      (fields as unknown as { image?: Asset })?.image) as Asset | undefined;

    // Handle Pexels image (both new and legacy formats)
    const pexelsData = fields?.pexelsImage as
      | IPexelsPhotoData
      | IPexelsPhotoDataLegacy
      | undefined;
    const pexelsUrl = getPexelsImageUrl(pexelsData);

    // Use the appropriate URL and convert protocol-relative to absolute
    const url = extractContentfulAssetUrl(asset || null) || pexelsUrl;
    return url?.replace(/^\/\//, "https://");
  });

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
        staggerChildren: 0.2,
      },
    },
  } as Variants;

  const contentVariants = {
    hidden: { opacity: 0, x: -30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as Variants;

  const imageVariants = {
    hidden: { opacity: 0, x: 30 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  } as Variants;

  const centeredVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  } as Variants;

  // Map Contentful background colors to modern gradient classes
  const getBackgroundClass = () => {
    switch (backgroundColor) {
      case "Primary":
        return "bg-gradient-to-br from-primary via-primary/90 to-primary/80";
      case "Secondary":
        return "bg-gradient-to-br from-secondary via-secondary/90 to-secondary/80";
      case "None":
        return "bg-gradient-to-br from-transparent via-background/50 to-background/30";
      default:
        return "bg-gradient-to-br from-background via-background/95 to-background/90";
    }
  };

  const getTextClass = () => {
    switch (backgroundColor) {
      case "Primary":
        return "text-primary-foreground";
      case "Secondary":
        return "text-secondary-foreground";
      case "None":
        return "text-foreground";
      default:
        return "text-foreground";
    }
  };

  const hasImages = extractedImageUrls && extractedImageUrls.length > 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={`p-8 rounded-2xl shadow-lg backdrop-blur-sm border border-border/40 ${getBackgroundClass()}`}
      whileHover={{
        scale: 1.02,
        boxShadow:
          "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
      }}
      transition={{ duration: 0.3 }}
    >
      {hasImages ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Content Column */}
          <motion.div
            variants={contentVariants}
            className={`prose prose-lg max-w-none ${getTextClass()} prose-headings:text-current prose-p:text-current prose-strong:text-current prose-em:text-current prose-headings:font-bold prose-p:leading-relaxed`}
            {...inspectorProps({ fieldId: "body" })}
          >
            {body && documentToReactComponents(body, baseRichTextOptions)}
          </motion.div>

          {/* Images Column */}
          <motion.div
            variants={imageVariants}
            className="space-y-6"
            {...inspectorProps({ fieldId: "images" })}
          >
            {extractedImageUrls.map((imageUrl, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
              >
                <div className="aspect-video relative">
                  <Image
                    src={imageUrl || ""}
                    alt={`${internalTitle} image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      ) : (
        /* No images - render content with better readability */
        <motion.div
          variants={centeredVariants}
          className={`prose prose-lg max-w-none ${getTextClass()} prose-headings:text-current prose-p:text-current prose-strong:text-current prose-em:text-current prose-headings:font-bold prose-p:leading-relaxed`}
          {...inspectorProps({ fieldId: "body" })}
        >
          {body && documentToReactComponents(body, baseRichTextOptions)}
        </motion.div>
      )}
    </motion.div>
  );
};

export default BlurbWrapper;

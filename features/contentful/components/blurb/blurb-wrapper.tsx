"use client";

import React from "react";
import { motion, type Variants } from "framer-motion";
import {
  useContentfulLiveUpdates,
  useContentfulInspectorMode,
} from "@contentful/live-preview/react";
import { IBlurb } from "../../type";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { baseRichTextOptions } from "@/features/contentful/richtext";

const BlurbWrapper = ({ entry }: { entry: IBlurb }) => {
  // Live preview hooks
  const liveEntry = useContentfulLiveUpdates(entry);
  const inspectorProps = useContentfulInspectorMode({
    entryId: entry?.sys?.id,
  });

  const body = liveEntry?.fields?.body;
  const backgroundColor = liveEntry?.fields?.backgroundColor || "Default";

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
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
      <div
        className={`prose prose-lg max-w-none ${getTextClass()} prose-headings:text-current prose-p:text-current prose-strong:text-current prose-em:text-current prose-headings:font-bold prose-p:leading-relaxed`}
        {...inspectorProps({ fieldId: "body" })}
      >
        {body && documentToReactComponents(body, baseRichTextOptions)}
      </div>
    </motion.div>
  );
};

export default BlurbWrapper;

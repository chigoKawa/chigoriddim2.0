"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import type { IFaqGroup, IFaqItem } from "@/features/contentful/type";
import { usePreviewMode } from "@/features/contentful/preview-context";
import { usePreviewWarnings } from "@/features/contentful/preview-warnings-context";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import type { Document } from "@contentful/rich-text-types";

interface Props {
  entry: IFaqGroup;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
} as Variants;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
} as Variants;

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
} as Variants;

export default function FaqGroup({ entry }: Props) {
  const isPreview = usePreviewMode();
  const { showWarnings } = usePreviewWarnings();

  const { title, description, items } = entry.fields;
  const faqItems = (items ?? []) as unknown as IFaqItem[];
  const hasItems = Array.isArray(faqItems) && faqItems.length > 0;

  return (
    <motion.div
      className="w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {isPreview && showWarnings && !hasItems ? (
        <motion.div
          className="mb-3 rounded-md border border-dashed border-amber-500/70 bg-gradient-to-r from-amber-500/10 to-amber-500/5 px-3 py-2 text-xs text-amber-900 dark:text-amber-100"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <span className="font-medium">FAQ group guidance</span>
          <div className="mt-0.5">
            This FAQ Group does not have any FAQ items linked yet. Add one or
            more FAQ Items to make this section useful.
          </div>
        </motion.div>
      ) : null}
      <div className="space-y-6">
        {/* Modern Header Section */}
        <motion.div className="text-center space-y-4" variants={headerVariants}>
          <motion.h3
            className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-primary/80 bg-clip-text text-transparent"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            {title}
          </motion.h3>

          {description ? (
            <motion.div
              className="text-base text-muted-foreground/80 prose prose-base max-w-none mx-auto leading-relaxed"
              variants={itemVariants}
            >
              {documentToReactComponents(description as Document)}
            </motion.div>
          ) : null}
        </motion.div>
        {/* Modern FAQ Accordion */}
        <AnimatePresence>
          {hasItems ? (
            <motion.div variants={containerVariants} className="mt-8">
              <div className="p-4 border border-border/40 rounded-lg bg-gradient-to-br from-background via-background/95 to-background/90 shadow-lg backdrop-blur-sm overflow-hidden">
                <Accordion
                  type="single"
                  collapsible
                  className="w-full border-0 bg-transparent"
                >
                  {faqItems.map((item, index) => (
                    <motion.div
                      key={item.sys.id ?? index}
                      variants={itemVariants}
                      whileHover={{ scale: 1.01 }}
                      transition={{ duration: 0.2 }}
                      className="mb-2"
                    >
                      <AccordionItem
                        value={item.sys.id ?? String(index)}
                        className="border border-border/30 rounded-lg mb-2 last:mb-0 bg-gradient-to-r from-background/50 to-background/30 backdrop-blur-sm overflow-hidden"
                      >
                        <AccordionTrigger className="px-6 py-4 text-left hover:no-underline group transition-all duration-300 hover:bg-gradient-to-r hover:from-primary/5 hover:to-primary/2 text-base font-semibold text-foreground group-hover:text-primary">
                          {item.fields.question}
                        </AccordionTrigger>
                        <AccordionContent className="px-6 pb-4 text-base text-muted-foreground/90 prose prose-base max-w-none leading-relaxed">
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                          >
                            {documentToReactComponents(
                              item.fields.answer as Document
                            )}
                          </motion.div>
                        </AccordionContent>
                      </AccordionItem>
                    </motion.div>
                  ))}
                </Accordion>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

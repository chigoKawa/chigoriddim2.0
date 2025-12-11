import React from "react";
import type { Options } from "@contentful/rich-text-react-renderer";
import { BLOCKS, INLINES } from "@contentful/rich-text-types";
import { MergeTag } from "@ninetailed/experience.js-react";
import type {
  IImageWrapper,
  IPexelsImageWrapper,
  ICodeSnippet,
  IAnnouncement,
  IContentfulForm,
  IExternalUrl,
  IPerson,
} from "./type";
import { extractContentfulAssetUrl } from "@/lib/utils";
import dynamic from "next/dynamic";
import type { Asset } from "contentful";

// Dynamically import components to avoid circular dependencies
const CodeSnippet = dynamic(
  () => import("./components/code-snippet/code-snippet")
);
const Announcement = dynamic(
  () => import("./components/frame/things/Announcement")
);
const ContentfulForm = dynamic(
  () => import("./components/frame/things/ContentfulForm")
);
const InlinePerson = dynamic(() => import("./components/person/inline-person"));

export const baseRichTextOptions: Options = {
  renderNode: {
    [BLOCKS.PARAGRAPH]: (_node, children) => <p className="mb-4">{children}</p>,
    [BLOCKS.HEADING_1]: (_node, children) => (
      <h1 className="text-4xl font-bold mb-6">{children}</h1>
    ),
    [BLOCKS.HEADING_2]: (_node, children) => (
      <h2 className="text-3xl font-semibold mb-5">{children}</h2>
    ),
    [BLOCKS.HEADING_3]: (_node, children) => (
      <h3 className="text-2xl font-medium mb-4">{children}</h3>
    ),
    [BLOCKS.UL_LIST]: (_node, children) => (
      <ul className="my-6 ml-6 list-disc [&>li]:mt-2 [&>li]:ml-4">
        {children}
      </ul>
    ),
    [BLOCKS.OL_LIST]: (_node, children) => (
      <ol className="list-outside px-4 ml-4">{children}</ol>
    ),
    [BLOCKS.LIST_ITEM]: (_node, children) => (
      <li className="mb-2">{children}</li>
    ),
    [BLOCKS.QUOTE]: (_node, children) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 mb-4 italic">
        {children}
      </blockquote>
    ),
    [BLOCKS.EMBEDDED_ASSET]: (node) => {
      const fileUrl = node?.data?.target?.fields?.file?.url as
        | string
        | undefined;
      const title =
        (node?.data?.target?.fields?.title as string) || "Embedded Image";
      if (!fileUrl) return null;
      return (
        <div className="my-6">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`https:${fileUrl}`}
            alt={title}
            className="rounded-md w-full object-cover"
          />
          <p className="text-sm mt-2 text-center">{title}</p>
        </div>
      );
    },
    [BLOCKS.EMBEDDED_ENTRY]: (node) => {
      const target = node?.data?.target;
      const contentTypeId = target?.sys?.contentType?.sys?.id;
      switch (contentTypeId) {
        case "imageWrapper": {
          // Render Contentful image wrapper - uses 'image' field (not 'asset')
          const imageEntry = target as IImageWrapper;
          // The imageWrapper content type has 'image' field, not 'asset'
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const imageAsset = (imageEntry?.fields as any)?.image;
          const imageUrl = imageAsset?.fields?.file?.url;
          if (!imageUrl) return null;
          const altText =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (imageEntry?.fields as any)?.altText ||
            imageEntry?.fields?.internalTitle ||
            imageAsset?.fields?.title ||
            "Embedded image";
          return (
            <figure className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl}
                alt={altText}
                className="rounded-lg shadow-sm max-w-full sm:max-w-md max-h-[400px] w-auto h-auto object-contain"
              />
              {altText && altText !== "Embedded image" && (
                <figcaption className="text-sm text-muted-foreground mt-2 italic">
                  {altText}
                </figcaption>
              )}
            </figure>
          );
        }
        case "pexelsImageWrapper": {
          // Render Pexels image wrapper - uses 'pexelsImage' field
          const pexelsEntry = target as IPexelsImageWrapper;
          const pexelsData = pexelsEntry?.fields?.pexelsImage;
          const imageUrl =
            pexelsData?.src?.large ||
            pexelsData?.src?.medium ||
            pexelsData?.src?.original;
          if (!imageUrl) return null;
          const altText = pexelsData?.alt || "Pexels image";
          return (
            <figure className="my-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl.startsWith("//") ? `https:${imageUrl}` : imageUrl}
                alt={altText}
                className="rounded-lg shadow-sm max-w-full sm:max-w-md max-h-[400px] w-auto h-auto object-contain"
              />
              {altText && altText !== "Pexels image" && (
                <figcaption className="text-sm text-muted-foreground mt-2 italic">
                  {altText}
                </figcaption>
              )}
            </figure>
          );
        }
        case "videoWrapper": {
          // Video wrapper - extract video asset URL
          const videoAsset = target?.fields?.video as Asset | undefined;
          const videoUrl = extractContentfulAssetUrl(videoAsset || null);
          if (!videoUrl) return null;
          return (
            <div className="my-6">
              <video
                src={videoUrl.startsWith("//") ? `https:${videoUrl}` : videoUrl}
                controls
                className="rounded-md w-full"
              />
            </div>
          );
        }
        case "codeSnippet": {
          const codeEntry = target as ICodeSnippet;
          return (
            <div className="my-6">
              <CodeSnippet {...codeEntry} />
            </div>
          );
        }
        case "announcement": {
          const announcementEntry = target as IAnnouncement;
          return (
            <div className="my-6">
              <Announcement entry={announcementEntry} />
            </div>
          );
        }
        case "contentfulForm": {
          const formEntry = target as IContentfulForm;
          return (
            <div className="my-6">
              <ContentfulForm entry={formEntry} />
            </div>
          );
        }
        default:
          return null;
      }
    },
    [INLINES.HYPERLINK]: (node, children) => (
      <a
        href={node.data.uri as string}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
      >
        {children}
      </a>
    ),
    [INLINES.EMBEDDED_ENTRY]: (node) => {
      const target = node?.data?.target;
      const ctid = target?.sys?.contentType?.sys?.id;

      switch (ctid) {
        case "nt_mergetag": {
          const id = target?.fields?.nt_mergetag_id ?? "";
          const fallback = target?.fields?.nt_fallback ?? "";
          if (id) {
            return <MergeTag id={id} fallback={fallback} />;
          }
          if (fallback) {
            return <span>{fallback}</span>;
          }
          return null;
        }
        case "externalLink": {
          // Render external link inline
          const linkEntry = target as IExternalUrl;
          const url = linkEntry?.fields?.url;
          const title = linkEntry?.fields?.title || url;
          if (!url) return null;
          return (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline"
            >
              {title}
            </a>
          );
        }
        case "person": {
          // Render person inline
          const personEntry = target as IPerson;
          const firstName = personEntry?.fields?.firstName || "";
          const lastName = personEntry?.fields?.lastName || "";
          const name = `${firstName} ${lastName}`.trim() || "Unknown";
          const website =
            (personEntry?.fields?.website as IExternalUrl)?.fields?.url || "#";
          return <InlinePerson name={name} website={website} />;
        }
        default:
          return null;
      }
    },
  },
  renderText: (text) => text,
};

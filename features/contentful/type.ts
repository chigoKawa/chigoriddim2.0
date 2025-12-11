/* eslint-disable @typescript-eslint/no-explicit-any */
import { Entry, EntryFields, Asset, EntrySkeletonType } from "contentful";

export interface IExternalUrl extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title: EntryFields.Symbol;
    url: EntryFields.Symbol;
    optionalIcon?: EntryFields.Symbol<
      "Twitter" | "Instagram" | "Facebook" | "TikTok" | "LinkedIn" | "Github"
    >;
  };
}

export type CtaSkeleton = {
  contentTypeId: "cta";
  fields: ICta["fields"];
};

export interface IBaseButton extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    label: EntryFields.Symbol;
    target: IExternalUrl | IPdfWrapper;
    openInNewTab?: EntryFields.Boolean;
    color: EntryFields.Symbol<
      "Default" | "Primary" | "Secondary" | "Success" | "Danger" | "Warning"
    >;
    size: EntryFields.Symbol<"Small" | "Medium" | "Large">;
    variant: EntryFields.Symbol<
      "Primary" | "Secondary" | "Destructive" | "Ghost" | "Outline"
    >;
  };
}

export interface ISeo extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title: EntryFields.Symbol;
    description: EntryFields.Symbol;
    ogImage: Asset;
    noIndex: EntryFields.Boolean;
    noFollow: EntryFields.Boolean;
  };
}

export interface ICta extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title?: EntryFields.Symbol;
    images: EntryFields.Array<Asset>;
    body?: EntryFields.Text;
    actionButtons: EntryFields.Array<IBaseButton>;
    backgroundColor: EntryFields.Symbol<
      "Primary" | "Secondary" | "Default" | "None"
    >;
    variant: EntryFields.Symbol<"Simple" | "Smooth">;
  };
}

export interface IHeroBanner extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    headline?: EntryFields.Symbol;
    heroImage: Asset;
    body?: EntryFields.Text;
    variant: EntryFields.Symbol<
      "Primary" | "Centered" | "With Background Image" | "Right Aligned"
    >;
    actionButtons: EntryFields.Array<IBaseButton>;
    nt_experiences: Entry<EntrySkeletonType>[];
  };
}
export type HeroBannerSkeleton = {
  contentTypeId: "heroBanner";
  fields: IHeroBanner["fields"];
};

// 🔹 Landing Page: matches Contentful `landingPage` model
export interface ILandingPage extends Entry {
  fields: {
    // Editor-facing name
    internalTitle: EntryFields.Symbol;

    // User-facing page title (localized in Contentful)
    title: EntryFields.Symbol;

    // Slug fields managed by SlugSmith
    slugSegment?: EntryFields.Symbol;
    slug?: EntryFields.Symbol;

    // Hierarchy
    parent?: EntryFields.EntryLink<LandingPageSkeleton>;

    // Page composition
    frames: EntryFields.Array<EntryFields.EntryLink<FrameSkeleton>>;

    // Search & governance
    searchSummary: EntryFields.Symbol;
    effectiveFrom?: EntryFields.Date;
    expiresAt?: EntryFields.Date;
    lastReviewedAt?: EntryFields.Date;

    // SEO & routing
    seoMetadata?: ISeo;
    fullPath?: EntryFields.Symbol;
    pathMeta?: EntryFields.Object<any>;
  };
}

export type LandingPageSkeleton = {
  contentTypeId: "landingPage";
  fields: ILandingPage["fields"];
};

export interface IPerson extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    firstName: EntryFields.Symbol;
    lastName?: EntryFields.Symbol;
    avatar?: Asset;
    bio?: EntryFields.Text;
    website?: IExternalUrl;
    twitterProfileUrl?: IExternalUrl;
    linkedinProfileUrl?: IExternalUrl;
  };
  isInline?: boolean; // This is a custom flag, not part of the content model
}
export interface ICodeSnippet extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    codeBlock: EntryFields.Text;
    language: EntryFields.Symbol;
  };
}
export interface IBlogPostPage extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title: EntryFields.Symbol;
    slug: EntryFields.Symbol;
    publishedDate?: EntryFields.Date;
    summary?: EntryFields.RichText;
    body: EntryFields.RichText;
    featuredImage: Asset;
    author?: IPerson;
    seoMetadata?: ISeo;
  };
}

export type BlogPostPageSkeleton = {
  contentTypeId: "blogPost";
  fields: IBlogPostPage["fields"];
};

// Events & Event Groups
export interface IEvent extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title: EntryFields.Symbol;
    category: EntryFields.Symbol<"Public Holiday" | "Cultural" | "Company">;
    startDate?: EntryFields.Date;
    endDate?: EntryFields.Date;
    description?: EntryFields.RichText;
  };
}

export type EventSkeleton = {
  contentTypeId: "event";
  fields: IEvent["fields"];
};

export interface IEventGroup extends Entry {
  fields: {
    title: EntryFields.Symbol;
    events?: EntryFields.Array<EntryFields.EntryLink<EventSkeleton>>;
  };
}

export type EventGroupSkeleton = {
  contentTypeId: "eventGroup";
  fields: IEventGroup["fields"];
};

// Announcements
export interface IAnnouncement extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    body: EntryFields.RichText;
    startDate?: EntryFields.Date;
    endDate?: EntryFields.Date;
  };
}

export type AnnouncementSkeleton = {
  contentTypeId: "announcement";
  fields: IAnnouncement["fields"];
};

// FAQ
export interface IFaqItem extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    question: EntryFields.Symbol;
    answer: EntryFields.RichText;
    category?: EntryFields.Symbol;
  };
}

export type FaqItemSkeleton = {
  contentTypeId: "faqItem";
  fields: IFaqItem["fields"];
};

export interface IFaqGroup extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title: EntryFields.Symbol;
    description?: EntryFields.RichText;
    items?: EntryFields.Array<EntryFields.EntryLink<FaqItemSkeleton>>;
  };
}

export type FaqGroupSkeleton = {
  contentTypeId: "faqGroup";
  fields: IFaqGroup["fields"];
};

// -----------------------------
// New content types: Frame model
// -----------------------------

export interface IFrameHeader extends Entry {
  fields: {
    internalTitle?: EntryFields.Symbol;
    headline: EntryFields.RichText;
    subline?: EntryFields.RichText;
    eyebrow?: EntryFields.Symbol;
    nt_experiences?: Entry<EntrySkeletonType>[];
  };
}

export type FrameHeaderSkeleton = {
  contentTypeId: "frameHeader";
  fields: IFrameHeader["fields"];
};

// Minimal placeholders for image wrappers used in Frame.things
export interface IImageWrapper extends Entry {
  fields: {
    internalTitle?: EntryFields.Symbol;
    asset?: Asset;
  };
}

export type ImageWrapperSkeleton = {
  contentTypeId: "imageWrapper";
  fields: IImageWrapper["fields"];
};

/**
 * New Pexels image structure from pexels-pon-contentful app.
 * This replaces the legacy IPexelsPhotoData structure.
 */
export interface IPexelsPhotoData {
  [key: string]: unknown; // Index signature for Contentful JsonObject compatibility
  provider: "pexels";
  photoId: number;
  url: string;
  width: number;
  height: number;
  alt?: string;
  avgColor?: string;

  src: {
    original: string;
    large?: string;
    large2x?: string;
    medium?: string;
    small?: string;
    portrait?: string;
    landscape?: string;
    tiny?: string;
  };

  photographer: {
    id: number;
    name: string;
    url: string;
  };

  attribution: {
    text: string;
    url: string;
  };

  meta?: {
    selectedAt?: string;
    locale?: string;
    source?: "search" | "curated" | "other";
  };

  display?: {
    preferredVariant?: keyof IPexelsPhotoData["src"];
    focalUsage?: "thumbnail" | "card" | "hero" | "background";
  };
}

/**
 * @deprecated Use IPexelsPhotoData instead. This is kept for backward compatibility
 * with existing content that uses the legacy flat structure.
 */
export interface IPexelsPhotoDataLegacy {
  photographer: string;
  photographer_url: string;
  image: string;
  src: {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
  };
  alt: string;
  avg_color: string;
  url: string;
  attribution: string;
  photographer_attribution: string;
  width: number;
  height?: number;
}

export interface IPexelsImageWrapper extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    /** The Pexels image data stored as JSON object */
    pexelsImage: EntryFields.Object<any>;
    enableZoom?: EntryFields.Boolean;
    enableBlur?: EntryFields.Boolean;
    radius?: EntryFields.Symbol<"None" | "Small" | "Medium" | "Large" | "Full">;
  };
}

/**
 * Helper type to cast the pexelsImage field to the proper type.
 * Use this when accessing the field: `entry.fields.pexelsImage as PexelsImageData`
 */
export type PexelsImageData = IPexelsPhotoData | IPexelsPhotoDataLegacy;

export type PexelsImageWrapperSkeleton = {
  contentTypeId: "pexelsImageWrapper";
  fields: IPexelsImageWrapper["fields"];
};

export interface ICallout extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    title?: EntryFields.RichText;
    subtitle?: EntryFields.RichText;
    button?: IBaseButton;
    media?: Asset;
  };
}

export type CalloutSkeleton = {
  contentTypeId: "callout";
  fields: ICallout["fields"];
};

export interface IFrame extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    frameHeader?: EntryFields.EntryLink<FrameHeaderSkeleton>;
    layout: EntryFields.Symbol<
      "single" | "duplex" | "hero" | "grid" | "carousel" | "list" | "timeline"
    >;
    theme: EntryFields.Symbol<"light" | "dark" | "brand">;
    backgroundColor: EntryFields.Symbol<
      "primary" | "secondary" | "accent" | "neutral" | "transparent"
    >;
    backgroundMedia?: Asset;
    things?: EntryFields.Array<
      EntryFields.EntryLink<
        | ImageWrapperSkeleton
        | PexelsImageWrapperSkeleton
        | CalloutSkeleton
        | BlogPostPageSkeleton
        | EventGroupSkeleton
        | EventSkeleton
        | AnnouncementSkeleton
        | FaqGroupSkeleton
        | BlurbSkeleton
        | PdfWrapperSkeleton
        | ContentfulFormSkeleton
      >
    >;
    gap?: EntryFields.Symbol<"sm" | "md" | "lg" | "xl">;
    padding?: EntryFields.Symbol<"none" | "sm" | "md" | "lg" | "xl" | "xxl">;
    alignment: EntryFields.Symbol<"left" | "right" | "center">;
    dimBackground?: EntryFields.Symbol<"10" | "20" | "30" | "40" | "50">;
    tintColor?: EntryFields.Symbol<
      "none" | "primary" | "secondary" | "accent" | "black"
    >;
  };
}

export type FrameSkeleton = {
  contentTypeId: "frame";
  fields: IFrame["fields"];
};

// New content types: Blurb and PDF Wrapper
export interface IBlurb extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    body: EntryFields.RichText;
    images?: EntryFields.Array<
      EntryFields.EntryLink<ImageWrapperSkeleton | PexelsImageWrapperSkeleton>
    >;
    backgroundColor?: EntryFields.Symbol<
      "Default" | "Primary" | "Secondary" | "None"
    >;
  };
}

export type BlurbSkeleton = {
  contentTypeId: "blurb";
  fields: IBlurb["fields"];
};

export interface IPdfWrapper extends Entry {
  fields: {
    title?: EntryFields.Symbol;
    file: Asset;
  };
}

export type PdfWrapperSkeleton = {
  contentTypeId: "pdfWrapper";
  fields: IPdfWrapper["fields"];
};

// Contentful Forms - dynamic form content type
export interface IContentfulFormSchema {
  version: 1;
  fields: Array<{
    id: string;
    type:
      | "text"
      | "textarea"
      | "email"
      | "number"
      | "select"
      | "multiselect"
      | "checkbox"
      | "checkbox-group"
      | "radio"
      | "date";
    label: string;
    required?: boolean;
    placeholder?: string;
    helpText?: string;
    defaultValue?: string | number | boolean | string[];
    options?: Array<{ value: string; label: string }>;
    validation?: {
      minLength?: number;
      maxLength?: number;
      pattern?: string;
      min?: number;
      max?: number;
      step?: number;
      isEmail?: boolean;
      minSelected?: number;
      maxSelected?: number;
    };
    condition?: {
      fieldId: string;
      operator: "equals" | "notEquals" | "contains" | "isEmpty" | "isNotEmpty";
      value?: string | number | boolean | string[];
    };
  }>;
  submit?: {
    label?: string;
    method?: "POST";
    action?: string;
  };
  tracking?: {
    eventName?: string;
    meta?: Record<string, unknown>;
  };
  layout?: {
    columns?: 1 | 2;
    sections?: Array<{
      id: string;
      label: string;
      fieldIds: string[];
    }>;
  };
}

export interface IContentfulForm extends Entry {
  fields: {
    internalTitle: EntryFields.Symbol;
    slug: EntryFields.Symbol;
    schema: EntryFields.Object<any>;
    successMessage?: EntryFields.Symbol;
    errorMessage?: EntryFields.Symbol;
  };
}

export type ContentfulFormSkeleton = {
  contentTypeId: "contentfulForm";
  fields: IContentfulForm["fields"];
};

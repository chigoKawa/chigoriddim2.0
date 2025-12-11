/**
 * Analytics utility for tracking events via Google Tag Manager
 * All events are pushed to the dataLayer for GTM to process
 */

type EventParams = Record<string, string | number | boolean | undefined>;

// Use existing dataLayer type from GTM
type DataLayerObject = Record<string, unknown>;

function getDataLayer(): DataLayerObject[] {
  if (typeof window === "undefined") return [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const win = window as any;
  win.dataLayer = win.dataLayer || [];
  return win.dataLayer;
}

/**
 * Push an event to the GTM dataLayer
 */
export function trackEvent(eventName: string, params: EventParams = {}): void {
  const dataLayer = getDataLayer();
  dataLayer.push({
    event: eventName,
    ...params,
  });
}

/**
 * Track a page view
 */
export function trackPageView(path: string, title?: string): void {
  trackEvent("page_view", {
    page_path: path,
    page_title: title,
  });
}

/**
 * Track a search query
 */
export function trackSearch(query: string, resultsCount: number): void {
  trackEvent("search", {
    search_term: query,
    results_count: resultsCount,
  });
}

/**
 * Track a click on a CTA button
 */
export function trackCTAClick(
  ctaLabel: string,
  ctaLocation: string,
  destination?: string
): void {
  trackEvent("cta_click", {
    cta_label: ctaLabel,
    cta_location: ctaLocation,
    cta_destination: destination,
  });
}

/**
 * Track form submission
 */
export function trackFormSubmit(
  formName: string,
  formLocation: string,
  success: boolean
): void {
  trackEvent("form_submit", {
    form_name: formName,
    form_location: formLocation,
    form_success: success,
  });
}

/**
 * Track content engagement (scroll depth, time on page, etc.)
 */
export function trackEngagement(
  contentType: string,
  contentId: string,
  action:
    | "view"
    | "scroll_25"
    | "scroll_50"
    | "scroll_75"
    | "scroll_100"
    | "time_30s"
    | "time_60s"
): void {
  trackEvent("content_engagement", {
    content_type: contentType,
    content_id: contentId,
    engagement_action: action,
  });
}

/**
 * Track external link clicks
 */
export function trackExternalLink(url: string, linkText?: string): void {
  trackEvent("external_link_click", {
    link_url: url,
    link_text: linkText,
  });
}

/**
 * Track file downloads
 */
export function trackDownload(
  fileName: string,
  fileType: string,
  fileUrl: string
): void {
  trackEvent("file_download", {
    file_name: fileName,
    file_type: fileType,
    file_url: fileUrl,
  });
}

/**
 * Track errors
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  errorLocation?: string
): void {
  trackEvent("error", {
    error_type: errorType,
    error_message: errorMessage,
    error_location: errorLocation,
  });
}

/**
 * Track locale/language changes
 */
export function trackLocaleChange(fromLocale: string, toLocale: string): void {
  trackEvent("locale_change", {
    from_locale: fromLocale,
    to_locale: toLocale,
  });
}

/**
 * Track theme changes
 */
export function trackThemeChange(theme: string): void {
  trackEvent("theme_change", {
    theme_name: theme,
  });
}

export const APP_NAME = "Pexels Pon Contentful";

/**
 * Default proxy URL for Pexels API requests.
 * This proxy endpoint handles CORS by making server-side requests to Pexels.
 *
 * Replace this with your own proxy URL in production.
 * The proxy should:
 * 1. Accept a `x-pexels-api-key` header
 * 2. Forward query parameters to the Pexels API
 * 3. Return the Pexels API response
 */
export const DEFAULT_PEXELS_PROXY_URL = "/api/pexels/search";

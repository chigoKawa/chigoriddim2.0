# Slug Smith App

The **Slug Smith** app is a Contentful App Framework application that manages hierarchical URL paths ("slugs") for entries of a specific content type.

It is designed to:

- Generate and normalize slug segments from titles.
- Build a **full path** based on parent/child relationships.
- Track previous paths so you can create redirects when URLs change.
- Keep slug computation idempotent and driven by a single source of truth in Contentful.

---

## Content model expectations

Slug Smith assumes you have a content type (by default `landingPage`) with fields similar to:

- `title` (Symbol / Text)
- `parent` (Link → Entry of same content type, optional)
- `slugSegment` (Symbol) — per‑node slug segment
- `fullPath` (Symbol) — computed full path, e.g. `/products/bikes`
- `pathMeta` (JSON / Object) — used to store auxiliary slug data:
  - `pathMeta.pathChain` — array of path segments from root to this node
  - `pathMeta.previousPaths` — array of historical `fullPath` values

Types for these fields live in:

- `types.ts` → `SlugFields`

You can adapt the app to a different content type by changing `CONTENT_TYPE_ID` in `constants.ts`.

---

## Key constants

`constants.ts` defines:

- `CONTENT_TYPE_ID` — target content type ID (default: `landingPage`).
- `RECOMPUTE_DEBOUNCE_MS` — debounce interval (ms) before recomputing slugs when the editor changes fields.
- `LOCALE_MODE` — how locale is treated:
  - `"single"` — single shared path for all locales (writes only default locale).
  - `"per-locale"` — (future use) would allow per-locale paths.

---

## How it works

The main logic lives in:

- `components/the-app.tsx` — root React component for the app.
- `hooks/` — hooks that read and update slug‑related fields via the Contentful App SDK.
- `lib/` — pure helpers for slug normalization, path resolution, and tree traversal.
- `config/` & `locations/` — app locations (config screen, entry sidebar/field, etc.).

Typical flow when editing an entry:

1. User edits `title`, `parent`, or `slugSegment`.
2. The app listens for field changes via the App SDK.
3. After a short debounce (`RECOMPUTE_DEBOUNCE_MS`), it:
   - Normalizes the slug segment (lowercase, dashes, safe characters).
   - Walks up the `parent` chain to build `pathChain`.
   - Joins `pathChain` into `fullPath` (e.g. `/parent/child/grandchild`).
4. It writes `slugSegment`, `fullPath`, and `pathMeta.pathChain` back to the entry.
5. If `fullPath` changed, it appends the old path to `pathMeta.previousPaths` so you can build redirects externally.

The app is **idempotent**: recomputing will yield the same `fullPath` for the same structure and inputs.

---

## TypeScript and linting

The Slug Smith app uses the same linting baseline as the rest of the project, but to keep the integration code with the Contentful Management/App SDKs practical, the ESLint rule `@typescript-eslint/no-explicit-any` is **disabled only for this folder**:

- See `eslint.config.mjs`:

  ```js
  {
    files: [
      "app/ctf-apps/countries/**/*.{ts,tsx}",
      "app/ctf-apps/slug-smith/**/*.{ts,tsx}",
    ],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  }
  ```

This keeps TypeScript errors from blocking builds while still allowing the rest of the repo to use stricter linting.

---

## Integration notes

- This app is meant to be used on entries of `CONTENT_TYPE_ID` in the current space/environment.
- All reads/writes go through the Contentful App SDK, so no extra API keys are required.
- Because the logic is self-contained under `app/ctf-apps/slug-smith`, you can copy this folder into other Next.js + Contentful setups and register it as an app.

For implementation details, start with:

- `components/the-app.tsx` — entry point for the UI.
- `hooks/` — how the slug fields are wired to the editor.
- `lib/` — the pure slug/path helpers you can reuse elsewhere.

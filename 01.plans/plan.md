# Intranet Portal Example - Contentful

This website uses Contentful as a CMS. All content is stored in Contentful and fetched using the Contentful Delivery API.

---

## Project Summary

A **Next.js 16** intranet portal example demonstrating advanced Contentful CMS integration with features like live preview, personalization, theming, and custom Contentful apps.

### Tech Stack
- **Framework**: Next.js 16 (App Router, Turbopack)
- **CMS**: Contentful (Delivery & Preview APIs)
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Personalization**: Ninetailed
- **Forms**: React Hook Form + Zod
- **Animations**: Framer Motion

---

## Implemented Features

### Core CMS Integration
- **Contentful Delivery API** - Fetches published content
- **Contentful Preview API** - Draft content for editors
- **Live Preview** - Real-time content updates in editor iframe (`@contentful/live-preview`)
- **Timeline Preview** - Preview scheduled releases via timeline token
- **Rich Text Rendering** - Full support with embedded entries/assets

### Content Types (Implemented)
| Content Type | Description | Status |
|--------------|-------------|--------|
| `landingPage` | Composable pages with frames | ✅ Complete |
| `frame` | Layout container (single/duplex/hero/grid/carousel/list/timeline) | ✅ Complete |
| `frameHeader` | Section headers with headline/subline/eyebrow | ✅ Complete |
| `heroBanner` | Hero sections with variants | ✅ Complete |
| `cta` | Call-to-action blocks | ✅ Complete |
| `blogPost` | Blog articles with rich text body | ✅ Complete |
| `person` | Author/team member profiles | ✅ Complete |
| `event` / `eventGroup` | Events calendar | ✅ Complete |
| `announcement` | Site announcements | ✅ Complete |
| `faqItem` / `faqGroup` | FAQ sections | ✅ Complete |
| `callout` | Promotional callout cards | ✅ Complete |
| `blurb` | Rich text content blocks | ✅ Complete |
| `imageWrapper` | Contentful asset wrapper | ✅ Complete |
| `pexelsImageWrapper` | Pexels stock images | ✅ Complete |
| `pdfWrapper` | PDF document links | ✅ Complete |
| `codeSnippet` | Syntax-highlighted code | ✅ Complete |
| `externalUrl` | External links with icons | ✅ Complete |
| `baseButton` | Reusable button component | ✅ Complete |
| `seo` | SEO metadata | ✅ Complete |
| `contentfulForm` | Dynamic JSON-schema forms | ✅ Complete |

### Page Routing
- **Homepage** - `/[locale]` resolves `landingPage` by `fullPath: "home"`
- **Catch-all pages** - `/[locale]/[...slug]` resolves by `fullPath` or `slugSegment`
- **Blog index** - `/[locale]/blog` renders blog landing page
- **Blog posts** - `/[locale]/blog/[blogSlug]` individual posts

### Internationalization (i18n)
- Dynamic locale detection from Contentful
- Locale-prefixed routes (`/en-US/`, `/de-DE/`, etc.)
- Localized content fields

### Theming System
- **Theme content type** in Contentful stores colors, fonts, logos
- **CSS variables** injected at runtime from theme entry
- **Light/Dark mode** support via `next-themes`
- **Live theme updates** in preview mode

### Personalization (Ninetailed)
- Experience variants on content entries
- Audience-based targeting
- Preview plugin for testing experiences
- Insights tracking

### Navigation
- **Main navigation** - Fetched from Contentful, supports nested items
- **Footer navigation** - Configurable sections
- **Social links** - External URL entries with icons
- **Breadcrumbs** - Auto-generated from page hierarchy

### Layout Components
- **Responsive navbar** - Mobile hamburger menu
- **Footer** - Multi-column with social links
- **Frame layouts**: single, duplex, hero, grid, carousel, list, timeline

### UI Components (shadcn/ui)
- Accordion, Alert, Avatar, Badge, Button, Card, Dialog, Form, Input, Label, Select, Sonner (toasts), Switch

---

## Contentful Apps (Custom)

Located in `app/ctf-apps/`:

| App | Description | Status |
|-----|-------------|--------|
| **Theme Builder** | Visual theme editor for colors/fonts/logos | ✅ Complete |
| **Slug Smith** | Hierarchical slug management with parent paths | ✅ Complete |
| **Pexels PON** | Pexels stock image picker | ✅ Complete |
| **Contentful Forms** | JSON-schema form builder | ✅ Complete |
| **Newsletter Preview** | Email newsletter preview | ✅ Complete |
| **Countries** | Country selector field | ✅ Complete |

---

## API Routes

| Route | Purpose |
|-------|---------|
| `/api/draft` | Enable/disable draft mode with secret validation |
| `/api/contentful/*` | Contentful webhook handlers |
| `/api/pexels/*` | Pexels API proxy |

---

## Environment Variables

```env
NEXT_PUBLIC_CTF_SPACE_ID          # Contentful space ID
NEXT_PUBLIC_CTF_DELIVERY_TOKEN    # Delivery API token
NEXT_PUBLIC_CTF_PREVIEW_TOKEN     # Preview API token
CONTENTFUL_PREVIEW_SECRET         # Draft mode secret
NEXT_PUBLIC_CTF_ENVIRONMENT       # Environment (master/staging)
NEXT_PUBLIC_NINETAILED_CLIENT_ID  # Ninetailed personalization
NEXT_PUBLIC_GTM_ID                # Google Tag Manager
```

---

## Gaps / TODO

### High Priority
- [ ] **Search functionality** - No site search implemented
- [ ] **Sitemap generation** - Missing `sitemap.xml` for SEO
- [ ] **404 page customization** - Uses default Next.js 404
- [ ] **Error boundary improvements** - Basic error pages exist but could be enhanced

### Medium Priority
- [ ] **Blog pagination** - Blog index shows all posts without pagination
- [ ] **Blog categories/tags** - No filtering or categorization
- [ ] **Related posts** - No "related articles" feature on blog posts
- [ ] **Content preview URL generation** - Manual URL construction in Contentful
- [ ] **Webhook-based revalidation** - Currently force-dynamic, could use ISR with webhooks
- [ ] **Image optimization** - Using raw Contentful URLs, could leverage `next/image` more

### Low Priority
- [ ] **Locale switcher UI** - i18n config exists but no UI to switch locales
- [ ] **Print styles** - No print-specific CSS
- [ ] **Accessibility audit** - Basic a11y but no formal audit
- [ ] **Performance monitoring** - No Web Vitals tracking beyond GTM
- [ ] **Unit tests** - Jest configured but minimal test coverage
- [ ] **E2E tests** - No Playwright/Cypress tests

### Technical Debt
- [ ] Remove `console.log` statements in `theme-provider.tsx`
- [ ] Type safety improvements - Some `any` casts in Contentful types
- [ ] Consolidate duplicate live preview wrapper usage
- [ ] Clean up commented code in layout files

---

## Scripts

```bash
npm run dev          # Start dev server with Turbopack
npm run build        # Build for production (fetches locales first)
npm run start        # Start production server
npm run lint         # ESLint
npm run test         # Jest tests
npm run seed:contentful    # Seed Contentful space
npm run export:redirects   # Export redirects from Contentful
```

---

## File Structure

```
app/
├── (site)/              # Main site routes
│   ├── [locale]/        # Locale-prefixed pages
│   │   ├── [...slug]/   # Catch-all landing pages
│   │   ├── blog/        # Blog routes
│   │   └── page.tsx     # Homepage
│   └── layout.tsx       # Site layout with nav/footer
├── api/                 # API routes
├── ctf-apps/            # Contentful custom apps
└── setup/               # Setup pages

features/
├── contentful/          # Contentful components & types
│   ├── components/      # Page/Frame/Thing renderers
│   └── type.ts          # TypeScript interfaces
├── layout/              # Nav, footer components
├── navigation/          # Navigation data fetchers
├── personalization/     # Ninetailed integration
└── theme-provider/      # Dynamic theming

components/ui/           # shadcn/ui components
lib/                     # Contentful client, utilities
```
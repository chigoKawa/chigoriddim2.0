# Contentful Global Options

This folder contains the **Contentful Global Options** app. It mirrors the other Contentful apps in this repo and provides a centralized registry of reusable option sets that editors can attach to individual fields.

## Goals

- Let admins define **option sets** (e.g., `buttonVariants`, `toneOfVoice`, `personaTags`) from the App Configuration screen.
- Support two shapes out of the box:
  - String lists (simple chips)
  - Key/label pairs (store a stable key but show a friendly label)
- Allow editors to assign the Field location to any Symbol/Text/JSON field and pick a set via **instance parameters**.
- Keep everything self-contained under `app/ctf-apps/contentful-global-options`.

## Structure

| File/Folder | Purpose |
| ----------- | ------- |
| `manifest.json` | Registers `page`, `app-config`, and `field` locations. |
| `page.tsx` + `components/the-app.tsx` | Entry point + routing between locations. |
| `locations/app-page` | Informational page with assignment instructions. |
| `locations/config` | App configuration screen (option-set CRUD). |
| `locations/field` | Field UI that renders selectors and writes values. |
| `install.ts` | Placeholder for future CMA automation. |
| `types.ts` | Shared TypeScript types for parameters and option sets. |

## Usage notes

1. Install the app and configure at least one option set.
2. Assign the Field location to a Symbol/Text/JSON field and set instance parameters:

```json
{
  "optionSetId": "buttonVariants",
  "allowCustom": false,
  "multiSelect": false
}
```

3. Editors get a guided selector (dropdown, checkboxes, or chips) depending on field type and instance params.

## Next ideas

- Optional CMA installer that seeds option sets as entries for auditing.
- Bulk import/export of sets.
- Rich preview of option usage across content types.

# Contentful Countries App

This folder contains the **Contentful Countries** app. It is a Contentful App Framework application that installs and manages reference data for:

- Countries
- Currencies (optional)
- States / Provinces (optional)

The app is designed to be **idempotent**, safe to re‑run, and easy to uninstall.

---

## What the app does

### 1. Content model

On install, `runInstallation` in `install.ts` ensures the following content types exist in the target environment:

- **Country** (default ID: `country`)
  - `name` (Symbol, localized, required)
  - `code` (Symbol, required, unique) — ISO‑2 country code
  - `status` (Symbol, required, default `active`, in `['active', 'disabled']`)
  - `flagUrl` (Symbol, required) — URL to an SVG flag on FlagCDN
  - `currency` (Link → Entry, optional) — links to `Currency` when currency support is enabled

- **Currency** (default ID: `currency`, optional)
  - `code` (Symbol, required, unique)
  - `symbol` (Symbol, required)
  - `name` (Symbol, required)

- **State / Province** (default ID: `state`, optional)
  - `name` (Symbol, required)
  - `code` (Symbol, required)
  - `country` (Link → Entry, required) — links to `Country`

The installer only **adds missing fields** to existing content types so it can be safely re‑run in environments where some model already exists.

### 2. Editor interface

After the `Country` content type is created/updated, the installer configures the editor interface so:

- `flagUrl` uses the **URL** editor widget (`urlEditor`).

This is done via the CMA editor interface API and is idempotent.

### 3. Data seeding and sync

The app seeds reference entries and can later sync missing entries without touching existing ones.

- **Initial seed (install)**
  - Creates `Currency` entries (if enabled) based on the dataset.
  - Creates `Country` entries with deterministic IDs (`country-XX`) and links them to their currencies.
  - Optionally creates a small sample of `State` entries.

- **Sync missing entries (main app page)**
  - Counts how many `Country` and `Currency` entries exist in the space.
  - Computes which countries/currencies from the dataset are missing.
  - Creates and publishes only the missing currencies first, then the missing countries.
  - Leaves existing entries untouched and treats `409` (already exists) as a no‑op.

All created entries include `flagUrl` pointing at the flag CDN so the content model validation is satisfied.

---

## Where the data comes from

Source data lives in:

- `./countries.json`

This JSON file is derived from the open‑source [annexare/Countries](https://github.com/annexare/Countries) dataset and bundled directly with the app so no external HTTP requests are required at runtime.

`constants.ts` exposes:

- `APP_NAME` — single source of truth for the app name
- `FLAG_CDN_BASE` — base URL for the flag image CDN (e.g. `https://flagcdn.com`)
- `COUNTRIES` — normalized in‑memory array built from `countries.json`:
  - Ensures each item has `{ name, code, status: 'active', currency }`.
  - Normalizes currency strings like `"BOB,BOV"` to a **single primary code** (the first one), so entry IDs remain valid (e.g. `currency-BOB`).

Because the dataset is bundled in the repo, installs and syncs are deterministic and do not depend on third‑party APIs.

---

## App locations and UI

The app uses several locations defined in `manifest.json`:

- **Page / main app** (`page.tsx` → `components/the-app.tsx`)
  - Shows installation options (include currency / states) and a **Populate Contentful** action that runs `runInstallation`.
  - Displays **Data status**: counts of countries and currencies installed vs available in the dataset.
  - Provides a **Sync missing entries** button that only creates missing entries.

- **Config screen** (`locations/config-screen.tsx`)
  - Lets you toggle currency and state support.
  - Allows overriding content type IDs and setting a max number of countries to install.
  - Runs the installer after configuration is saved, with loading indicators and notifications.

- **Entry sidebar** (`locations/entry-sidebar/stats-sidebar.tsx`)
  - Shows quick stats about countries in the current environment using the CMA via the App SDK.

- **Field location** (`locations/field/country-field.tsx`)
  - Provides a dropdown to select a country using the static `COUNTRIES` list.
  - Stores the country ISO‑2 code in a Symbol field and shows an inline flag using `flagUrl` / `FLAG_CDN_BASE`.

- **App page location** (`locations/app-page.tsx`)
  - Simple informational page summarizing what the app manages and how to configure it.

---

## Idempotent install / uninstall

### Install (`runInstallation` in `install.ts`)

- Can be run multiple times safely.
- Uses deterministic entry IDs (`country-XX`, `currency-XXX`, `state-XX-S1`).
- Treats version conflicts / 409s as success by fetching and publishing existing entries.

### Uninstall (`runUninstall` in `install.ts`)

- Deletes entries by content type, then attempts to unpublish and delete the content types.
- Treats 404 / "resource could not be found" responses as success to avoid noisy failures in partially cleaned environments.

---

## Configuration knobs

Installation parameters (set via config screen) control:

- Whether **Currencies** and **States/Provinces** are installed.
- Optional overrides for `countryContentTypeId`, `currencyContentTypeId`, and `stateContentTypeId`.
- Optional `maxCountries` limit (install only the first N countries from `COUNTRIES`).

These parameters are read via the App SDK in both the installer and the main app UI so behaviour stays in sync with configuration.

---

## Integration notes

- The app is intended to be embedded into any Contentful space that needs a canonical list of countries and currencies.
- All CMA operations are scoped to the current environment using the App SDK’s built‑in `cma` client.
- Because the dataset and content model definitions live entirely inside this folder, you can copy `app/ctf-apps/countries` into another Next.js + Contentful project and register it as a Contentful App with minimal additional setup.

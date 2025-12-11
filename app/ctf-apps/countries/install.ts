import { COUNTRIES } from "./constants";
import { FLAG_CDN_BASE } from "./constants";
import { chunkArray } from "./utils";

export type InstallStep =
  | "creating-content-types"
  | "creating-countries"
  | "creating-currencies"
  | "creating-states"
  | "done";

export type UninstallStep =
  | "deleting-country-entries"
  | "deleting-currency-entries"
  | "deleting-state-entries"
  | "deleting-country-content-type"
  | "deleting-currency-content-type"
  | "deleting-state-content-type"
  | "uninstall-done";

/**
 * Run this function to (re)install the Countries model and seed data.
 * It can be safely re-run; entries use deterministic IDs.
 */
export async function runInstallation({
  cma,
  notifier,
  environmentId,
  locale = "en-US",
  includeStates,
  includeCurrency,
  countryContentTypeId = "country",
  currencyContentTypeId = "currency",
  stateContentTypeId = "state",
  maxCountries,
  onProgress,
}: {
  cma: any;
  notifier?: any;
  environmentId: string;
  locale?: string;
  includeStates: boolean;
  includeCurrency: boolean;
  countryContentTypeId?: string;
  currencyContentTypeId?: string;
  stateContentTypeId?: string;
  maxCountries?: number;
  onProgress?: (step: InstallStep) => void;
}) {
  const report = (step: InstallStep) => {
    onProgress?.(step);
    notifier?.info?.(`Countries install: ${step.replace(/-/g, " ")}`);
  };

  // Helper to create and publish a content type. For existing content types, we
  // avoid destructive updates and only append the optional ensureFields if
  // they are missing.
  const createAndPublishContentType = async (
    id: string,
    name: string,
    description: string,
    fields: any[],
    ensureFields: any[] = [],
    displayField?: string
  ) => {
    try {
      const existing = await cma.contentType.get({
        contentTypeId: id,
        environmentId,
      });
      // For existing types, avoid destructive changes. Only append any missing
      // ensureFields so that we can safely evolve the model (e.g. add flagUrl
      // or currency link) while remaining idempotent.
      if (ensureFields.length && Array.isArray(existing.fields)) {
        const missing = ensureFields.filter(
          (fieldToEnsure: any) =>
            !existing.fields.some(
              (field: any) =>
                field.id === fieldToEnsure.id ||
                field.apiName === fieldToEnsure.id
            )
        );

        if (missing.length) {
          const updated = {
            ...existing,
            fields: [...existing.fields, ...missing],
          };
          const updatedCt = await cma.contentType.update(
            { contentTypeId: id, environmentId },
            updated
          );
          const published = await cma.contentType.publish(
            { contentTypeId: id, environmentId },
            updatedCt
          );
          return published;
        }
      }

      return existing;
    } catch (err: any) {
      // If it's a genuine "not found", create + publish it once. Different CMA
      // clients expose this slightly differently, so we check several markers
      // instead of relying solely on `status === 404`.
      const message = (err && err.message) || "";
      const isNotFound =
        err?.status === 404 ||
        err?.sys?.id === "NotFound" ||
        /could not be found/i.test(message);

      if (isNotFound) {
        const payload: any = { name, description, fields };
        if (displayField) {
          payload.displayField = displayField;
        }
        const ct = await cma.contentType.createWithId(
          { contentTypeId: id, environmentId },
          payload
        );
        await cma.contentType.publish({ contentTypeId: id, environmentId }, ct);
        return ct;
      }

      // Any other error (permission issues, validation, etc.) should bubble up.
      throw err;
    }
  };

  // ---------- 1. Create Content Types ----------
  report("creating-content-types");
  // Country – always created
  const countryBaseFields = [
    {
      id: "name",
      name: "Name",
      type: "Symbol",
      localized: true,
      required: true,
    },
    {
      id: "code",
      name: "ISO Code",
      type: "Symbol",
      required: true,
      validations: [{ unique: true }],
    },
    {
      id: "status",
      name: "Status",
      type: "Symbol",
      required: true,
      defaultValue: { [locale]: "active" },
      validations: [{ in: ["active", "disabled"] }],
    },
    {
      id: "flagUrl",
      name: "Flag URL",
      type: "Symbol",
      required: true,
    },
    ...(includeCurrency
      ? [
          {
            id: "currency",
            name: "Currency",
            type: "Link",
            linkType: "Entry",
            validations: [{ linkContentType: [currencyContentTypeId] }],
          },
        ]
      : []),
  ];

  const countryEnsureFields = [
    {
      id: "flagUrl",
      name: "Flag URL",
      type: "Symbol",
      localized: false,
      required: false,
    },
    ...(includeCurrency
      ? [
          {
            id: "currency",
            name: "Currency",
            type: "Link",
            linkType: "Entry",
            validations: [{ linkContentType: [currencyContentTypeId] }],
          },
        ]
      : []),
  ];

  await createAndPublishContentType(
    countryContentTypeId,
    "Country",
    "Country reference with flag URL and optional currency",
    countryBaseFields,
    countryEnsureFields,
    "name"
  );

  // Configure editor interface: use URL editor for flagUrl field.
  try {
    const ei = await (cma as any).editorInterface.get({
      contentTypeId: countryContentTypeId,
      environmentId,
    });
    const controls = Array.isArray((ei as any).controls)
      ? [...(ei as any).controls]
      : [];
    const idx = controls.findIndex((c: any) => c.fieldId === "flagUrl");
    const flagControl = { fieldId: "flagUrl", widgetId: "urlEditor" };

    if (idx >= 0) {
      controls[idx] = { ...controls[idx], widgetId: "urlEditor" };
    } else {
      controls.push(flagControl);
    }

    const updatedEi = { ...ei, controls };
    await (cma as any).editorInterface.update(
      { contentTypeId: countryContentTypeId, environmentId },
      updatedEi
    );
  } catch {
    // If editor interface APIs are unavailable, skip gracefully.
  }

  // Currency – optional
  if (includeCurrency) {
    await createAndPublishContentType(
      currencyContentTypeId,
      "Currency",
      "Currency information for a country",
      [
        {
          id: "code",
          name: "Code",
          type: "Symbol",
          required: true,
          validations: [{ unique: true }],
        },
        { id: "symbol", name: "Symbol", type: "Symbol", required: true },
        { id: "name", name: "Name", type: "Symbol", required: true },
      ],
      [],
      "code"
    );
  }

  // State – optional
  if (includeStates) {
    await createAndPublishContentType(
      stateContentTypeId,
      "State / Province",
      "Administrative subdivision of a country",
      [
        { id: "name", name: "Name", type: "Symbol", required: true },
        { id: "code", name: "Code", type: "Symbol", required: true },
        {
          id: "country",
          name: "Country",
          type: "Link",
          linkType: "Entry",
          validations: [{ linkContentType: [countryContentTypeId] }],
          required: true,
        },
      ],
      [],
      "name"
    );
  }

  // Determine source countries (honouring maxCountries)
  const sourceCountries =
    typeof maxCountries === "number" && maxCountries > 0
      ? COUNTRIES.slice(0, maxCountries)
      : COUNTRIES;

  // ---------- 2. Create Currency Entries (if enabled) ----------
  if (includeCurrency) {
    const uniqueCurrencies = Array.from(
      new Map(
        sourceCountries.map((c) => [c.currency.code, c.currency])
      ).values()
    );
    const currencyEntries = uniqueCurrencies.map((c) => ({
      fields: {
        code: { [locale]: c.code },
        symbol: { [locale]: c.symbol },
        name: { [locale]: c.name },
      },
    }));
    report("creating-currencies");
    const currencyChunks = chunkArray(currencyEntries, 50);
    for (const chunk of currencyChunks) {
      for (const entryData of chunk) {
        const entryId = `currency-${entryData.fields.code[locale]}`;
        try {
          const entry = await cma.entry.createWithId(
            { entryId, contentTypeId: currencyContentTypeId, environmentId },
            entryData
          );
          await cma.entry.publish(
            { entryId: entry.sys.id, environmentId },
            entry
          );
        } catch (err: any) {
          if (
            err?.code === "VersionMismatch" ||
            err?.name === "VersionMismatch" ||
            err?.status === 409
          ) {
            const existing = await cma.entry.get({ entryId, environmentId });
            if (!existing.sys.publishedVersion) {
              await cma.entry.publish(
                { entryId: existing.sys.id, environmentId },
                existing
              );
            }
            continue;
          }
          throw err;
        }
      }
    }
  }

  // ---------- 3. Create Country Entries ----------
  const buildCountryEntry = (c: (typeof COUNTRIES)[0]) => ({
    fields: {
      name: { [locale]: c.name },
      code: { [locale]: c.code },
      status: { [locale]: c.status },
      flagUrl: {
        [locale]: `${FLAG_CDN_BASE}/${c.code.toLowerCase()}.svg`,
      },
    },
  });

  const addCurrencyIfNeeded = (entry: any, c: (typeof COUNTRIES)[0]) => {
    if (includeCurrency) {
      entry.fields.currency = {
        [locale]: {
          sys: {
            type: "Link",
            linkType: "Entry",
            id: `currency-${c.currency.code}`,
          },
        },
      };
    }
    return entry;
  };

  const countryEntries = sourceCountries.map((c) =>
    addCurrencyIfNeeded(buildCountryEntry(c), c)
  );
  report("creating-countries");
  const countryChunks = chunkArray(countryEntries, 50);
  for (const chunk of countryChunks) {
    for (const entryData of chunk) {
      const entryId = `country-${entryData.fields.code[locale]}`;
      try {
        const entry = await cma.entry.createWithId(
          { entryId, contentTypeId: countryContentTypeId, environmentId },
          entryData
        );
        await cma.entry.publish(
          { entryId: entry.sys.id, environmentId },
          entry
        );
      } catch (err: any) {
        if (
          err?.code === "VersionMismatch" ||
          err?.name === "VersionMismatch" ||
          err?.status === 409
        ) {
          const existing = await cma.entry.get({ entryId, environmentId });
          if (!existing.sys.publishedVersion) {
            await cma.entry.publish(
              { entryId: existing.sys.id, environmentId },
              existing
            );
          }
          continue;
        }
        throw err;
      }
    }
  }

  // ---------- 4. Create State Entries (if enabled) ----------
  if (includeStates) {
    const stateSource =
      sourceCountries.length > 0 ? sourceCountries : COUNTRIES;
    const stateEntries = stateSource.slice(0, 20).map((c) => ({
      fields: {
        name: { [locale]: `${c.name} State 1` },
        code: { [locale]: `${c.code}-S1` },
        country: {
          [locale]: {
            sys: { type: "Link", linkType: "Entry", id: `country-${c.code}` },
          },
        },
      },
    }));
    report("creating-states");
    const stateChunks = chunkArray(stateEntries, 50);
    for (const chunk of stateChunks) {
      for (const entryData of chunk) {
        const entryId = `state-${entryData.fields.code[locale]}`;
        try {
          const entry = await cma.entry.createWithId(
            { entryId, contentTypeId: stateContentTypeId, environmentId },
            entryData
          );
          await cma.entry.publish(
            { entryId: entry.sys.id, environmentId },
            entry
          );
        } catch (err: any) {
          if (
            err?.code === "VersionMismatch" ||
            err?.name === "VersionMismatch" ||
            err?.status === 409
          ) {
            const existing = await cma.entry.get({ entryId, environmentId });
            if (!existing.sys.publishedVersion) {
              await cma.entry.publish(
                { entryId: existing.sys.id, environmentId },
                existing
              );
            }
            continue;
          }
          throw err;
        }
      }
    }
  }
  report("done");
}

export async function runUninstall({
  cma,
  notifier,
  environmentId,
  countryContentTypeId = "country",
  currencyContentTypeId = "currency",
  stateContentTypeId = "state",
  onProgress,
}: {
  cma: any;
  notifier?: any;
  environmentId: string;
  countryContentTypeId?: string;
  currencyContentTypeId?: string;
  stateContentTypeId?: string;
  onProgress?: (step: UninstallStep) => void;
}) {
  const report = (step: UninstallStep) => {
    onProgress?.(step);
    notifier?.info?.(`Countries uninstall: ${step.replace(/-/g, " ")}`);
  };

  const deleteEntriesForContentType = async (
    contentTypeId: string,
    step: UninstallStep
  ) => {
    report(step);
    let skip = 0;
    const limit = 100;
    // Paginate through all entries for this content type
    // We deliberately keep this simple; environments are small for this app.

    while (true) {
      const res = await cma.entry.getMany({
        environmentId,
        query: {
          // CMA uses `content_type` as the filter for content type ID
          content_type: contentTypeId,
          limit,
          skip,
        },
      });
      const items = res.items ?? res;
      if (!items.length) break;
      for (const entry of items) {
        try {
          if (entry.sys.publishedVersion) {
            await cma.entry.unpublish(
              { entryId: entry.sys.id, environmentId },
              entry
            );
          }
        } catch {
          // ignore unpublish errors and attempt delete anyway
        }
        try {
          await cma.entry.delete({ entryId: entry.sys.id, environmentId });
        } catch {
          // ignore delete errors for robustness
        }
      }
      if (items.length < limit) break;
      skip += limit;
    }
  };

  const deleteContentType = async (
    contentTypeId: string,
    step: UninstallStep
  ) => {
    report(step);
    try {
      try {
        // Best-effort unpublish; for the App SDK cma client this should be
        // called without passing the entity body to avoid CORS/header issues.
        await cma.contentType.unpublish({ contentTypeId, environmentId });
      } catch (unpubErr: any) {
        if (unpubErr?.status !== 404) {
          // Ignore 404 (already unpublished/removed); rethrow other errors.
          throw unpubErr;
        }
      }
      try {
        await cma.contentType.delete({ contentTypeId, environmentId });
      } catch (delErr: any) {
        if (delErr?.status === 404) return; // already gone
        throw delErr;
      }
    } catch (err: any) {
      if (err?.status === 404) return; // already gone
      throw err;
    }
  };

  const contentTypeExists = async (id?: string) => {
    if (!id) return false;
    try {
      await cma.contentType.get({ contentTypeId: id, environmentId });
      return true;
    } catch (err: any) {
      if (err?.status === 404) return false;
      throw err;
    }
  };

  try {
    if (await contentTypeExists(countryContentTypeId)) {
      await deleteEntriesForContentType(
        countryContentTypeId as string,
        "deleting-country-entries"
      );
      await deleteContentType(
        countryContentTypeId as string,
        "deleting-country-content-type"
      );
    }

    if (await contentTypeExists(currencyContentTypeId)) {
      await deleteEntriesForContentType(
        currencyContentTypeId as string,
        "deleting-currency-entries"
      );
      await deleteContentType(
        currencyContentTypeId as string,
        "deleting-currency-content-type"
      );
    }

    if (await contentTypeExists(stateContentTypeId)) {
      await deleteEntriesForContentType(
        stateContentTypeId as string,
        "deleting-state-entries"
      );
      await deleteContentType(
        stateContentTypeId as string,
        "deleting-state-content-type"
      );
    }

    report("uninstall-done");
    notifier?.success?.("Contentful Countries data removed.");
  } catch (err) {
    // If all configured content types are already gone, consider this
    // uninstall successful even if intermediate calls returned errors.
    const countryExists = await contentTypeExists(countryContentTypeId);
    const currencyExists = await contentTypeExists(currencyContentTypeId);
    const stateExists = await contentTypeExists(stateContentTypeId);

    if (!countryExists && !currencyExists && !stateExists) {
      report("uninstall-done");
      notifier?.success?.("Countries app data removed.");
      return;
    }

    const message = (err as any)?.message || "";
    if (/could not be found/i.test(message)) {
      // Treat generic "resource could not be found" errors from CMA as a
      // successful best-effort uninstall to avoid noisy failures when the
      // environment is already mostly cleaned up.
      report("uninstall-done");
      notifier?.success?.("Countries app data removed.");
      return;
    }

    notifier?.error?.("Failed to remove Countries app data.");
    throw err;
  }
}

/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable @typescript-eslint/no-unused-vars */
// @ts-nocheck
"use client";

import { useEffect, useState } from "react";
import { init, locations, type ConfigAppSDK } from "@contentful/app-sdk";
import {
  Box,
  Heading,
  Text,
  Form,
  Select,
  Button,
  Note,
  Checkbox,
  Paragraph,
} from "@contentful/f36-components";
import { SDKProvider } from "@contentful/react-apps-toolkit";
/**
 * Configuration screen for SlugSmith
 * - Lets admins set content type and locale policy
 * - Persists installation parameters
 * - Assigns Sidebar location to the chosen content type
 */
export default function ConfigPage() {
  const [sdk, setSdk] = useState<ConfigAppSDK | null>(null);
  const [contentTypeIds, setContentTypeIds] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [localeMode, setLocaleMode] = useState<"single" | "per-locale">(
    "single"
  );
  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [autoAssignSidebar, setAutoAssignSidebar] = useState(true);
  const [installMessage, setInstallMessage] = useState<string | null>(null);
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  useEffect(() => {
    init((s) => {
      if (s.location.is(locations.LOCATION_APP_CONFIG)) {
        const app = s as ConfigAppSDK;
        setSdk(app);

        // Load available content types for selection
        void (async () => {
          try {
            // Note: Content Type CMA 'select' doesn't support selecting 'name' directly; remove select to avoid 400.
            const res = await app.cma.contentType.getMany({
              query: { limit: 1000 },
            });
            const types = (res.items || []).map((ct: any) => ({
              id: ct.sys.id as string,
              name: (ct.name as string) || ct.sys.id,
            }));
            setAvailableTypes(types);
          } catch (err) {
            setErrors([
              "Failed to list content types. Check permissions and network.",
            ]);
          }
        })();

        // Load existing params
        const params = app.parameters.installation as
          | {
              contentTypeIds?: string[];
              localeMode?: string;
              autoAssignSidebar?: boolean;
            }
          | undefined;
        if (
          Array.isArray(params?.contentTypeIds) &&
          params!.contentTypeIds.length > 0
        )
          setContentTypeIds(params!.contentTypeIds);
        if (params?.localeMode === "per-locale") setLocaleMode("per-locale");
        if (typeof params?.autoAssignSidebar === "boolean")
          setAutoAssignSidebar(params.autoAssignSidebar);

        // Initial validation (best effort)
        void performValidation(app, contentTypeIds, setErrors, setValidating);

        // Handle configure/save (loosen typing for the async handler)
        (app.app.onConfigure as any)(async () => {
          try {
            // Validate before installing
            const issues = await performValidation(
              app,
              contentTypeIds,
              setErrors,
              setValidating
            );
            if (issues.length > 0) {
              // Block install by returning false with a console hint
              console.error("SlugSmith install blocked by validation:", issues);
              return false as unknown as Parameters<
                NonNullable<Parameters<typeof app.app.onConfigure>[0]>
              >[0];
            }

            const baseParams = {
              contentTypeIds,
              localeMode,
              autoAssignSidebar,
            } as const;
            const payload = autoAssignSidebar
              ? ({
                  parameters: baseParams,
                  targetState: await computeTargetState(app, contentTypeIds),
                } as const)
              : ({ parameters: baseParams } as const);
            try {
              setLastPayload(JSON.stringify(payload, null, 2));
            } catch {
              /* noop */
            }
            console.info("SlugSmith onConfigure payload:", payload);
            return payload as unknown as Parameters<
              NonNullable<Parameters<typeof app.app.onConfigure>[0]>
            >[0];
          } catch (err) {
            const msg =
              err instanceof Error ? err.message : "Unknown configure error";
            console.error("SlugSmith onConfigure error:", err);
            setErrors([`Install failed in onConfigure: ${msg}`]);
            // Block install
            return false as unknown as Parameters<
              NonNullable<Parameters<typeof app.app.onConfigure>[0]>
            >[0];
          }
        });

        // Log installation outcome to help diagnose failures
        app.app.onConfigurationCompleted((data: unknown) => {
          console.info("SlugSmith onConfigurationCompleted:", data);
          try {
            setLastCompleted(JSON.stringify(data, null, 2));
            const msg =
              (data as { message?: string } | undefined)?.message || null;
            setInstallMessage(msg);
          } catch {
            /* noop */
          }
        });

        app.app.setReady();
      }
    });

    // No explicit cleanup API exposed here; return a no-op to satisfy React.
    return () => {};
  }, [contentTypeIds, localeMode, autoAssignSidebar]);

  if (!sdk) return null;

  return (
    <Box padding="spacingL">
      <Heading as="h2">SlugSmith configuration</Heading>
      <Text>
        Choose one or more Page content types and the locale policy. Hybrid:
        `fullPath` and `slugSegment` as Symbols; `pathMeta` (JSON) holds
        `pathChain` and `previousPaths`.
      </Text>

      <Box marginTop="spacingL" as={Form}>
        <Box marginBottom="spacingM">
          <Text as="label">Select Page content types</Text>
          <Paragraph>
            Tick the content types that represent pages in your model.
          </Paragraph>
          <Box marginTop="spacingS">
            {availableTypes.map((t) => (
              <Box key={t.id} marginBottom="spacingS">
                <Checkbox
                  isChecked={contentTypeIds.includes(t.id)}
                  onChange={(e) => {
                    const checked = (e.target as HTMLInputElement).checked;
                    setContentTypeIds((prev) =>
                      checked
                        ? Array.from(new Set([...prev, t.id]))
                        : prev.filter((id) => id !== t.id)
                    );
                  }}
                >
                  {t.name}{" "}
                  <Text as="span" style={{ opacity: 0.6 }}>
                    ({t.id})
                  </Text>
                </Checkbox>
              </Box>
            ))}
          </Box>
        </Box>

        <Box marginBottom="spacingM">
          <Checkbox
            isChecked={autoAssignSidebar}
            onChange={(e) =>
              setAutoAssignSidebar((e.target as HTMLInputElement).checked)
            }
          >
            Assign sidebar automatically during install
          </Checkbox>
        </Box>

        <Box marginBottom="spacingM">
          <Text as="label" htmlFor="localeMode">
            Locale policy
          </Text>
          <Select
            id="localeMode"
            name="localeMode"
            value={localeMode}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setLocaleMode(e.target.value as "single" | "per-locale")
            }
          >
            <Select.Option value="single">
              Single shared path (default locale only)
            </Select.Option>
            <Select.Option value="per-locale">
              Per-locale segments and paths
            </Select.Option>
          </Select>
        </Box>

        <Note>
          Saving happens via the Contentful Save button in the top-right. This
          screen registers a handler to persist the settings and assign the
          Sidebar location to each selected content type.
        </Note>

        {/* Validation status */}
        <Box marginTop="spacingM">
          {validating ? (
            <Note>
              <Text>Validating content type…</Text>
            </Note>
          ) : errors.length > 0 ? (
            <Note variant="negative">
              <Heading as="h4">Issues found</Heading>
              <ul style={{ marginTop: 8 }}>
                {errors.map((e, i) => (
                  <li key={i}>
                    <Text as="span">{e}</Text>
                  </li>
                ))}
              </ul>
            </Note>
          ) : (
            <Note variant="positive">
              <Text>Selected content type looks good.</Text>
            </Note>
          )}
        </Box>

        {installMessage && (
          <Box marginTop="spacingS">
            <Note variant="negative">
              <Text>{installMessage}</Text>
            </Note>
          </Box>
        )}

        {(lastPayload || lastCompleted) && (
          <Box marginTop="spacingM">
            <Note>
              <Heading as="h4">Debug</Heading>
              {lastPayload && (
                <>
                  <Text as="p" style={{ marginTop: 8 }}>
                    Last onConfigure payload
                  </Text>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {lastPayload}
                  </pre>
                </>
              )}
              {lastCompleted && (
                <>
                  <Text as="p" style={{ marginTop: 8 }}>
                    onConfigurationCompleted data
                  </Text>
                  <pre
                    style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                  >
                    {lastCompleted}
                  </pre>
                </>
              )}
            </Note>
          </Box>
        )}

        <Box marginTop="spacingM">
          <Button isDisabled>
            {"Use the top-right Save button to persist settings"}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}

type SidebarWidget = { widgetId?: string; widgetNamespace?: string };

async function computeTargetState(sdk: ConfigAppSDK, contentTypeIds: string[]) {
  const current = await sdk.app.getCurrentState();

  const EditorInterface: Record<string, { sidebar: SidebarWidget[] }> = {};
  for (const ctId of contentTypeIds) {
    const existing = (current?.EditorInterface?.[ctId]?.sidebar ||
      []) as SidebarWidget[];
    const filtered = Array.isArray(existing)
      ? existing.filter(
          (w) => !(w.widgetNamespace === "app" && w.widgetId === sdk.ids.app)
        )
      : [];
    EditorInterface[ctId] = {
      sidebar: [
        {
          disabled: false,
          position: 1,
          widgetNamespace: "app",
          widgetId: sdk.ids.app,
          settings: {},
        } as unknown as SidebarWidget,
        ...filtered,
      ],
    };
  }
  return { EditorInterface } as unknown as Parameters<
    NonNullable<Parameters<typeof sdk.app.onConfigure>[0]>
  >[0];
}

async function performValidation(
  sdk: ConfigAppSDK,
  ctIds: string[],
  setErrors: (e: string[]) => void,
  setValidating: (v: boolean) => void
) {
  setValidating(true);
  try {
    const issues: string[] = [];
    if (!ctIds || ctIds.length === 0) {
      issues.push("Select at least one Page content type.");
      setErrors(issues);
      return issues;
    }

    // Validate each selected content type
    for (const ctId of ctIds) {
      const ct = await sdk.cma.contentType.get({ contentTypeId: ctId });
      const fields = (ct.fields || []) as Array<{
        id: string;
        name?: string;
        type: string;
        items?: { type?: string };
        linkType?: string;
        validations?: Array<Record<string, unknown>>;
      }>;

      const get = (id: string) => fields.find((f) => f.id === id);
      const hasUnique = (f?: {
        validations?: Array<Record<string, unknown>>;
      }) =>
        !!f?.validations?.some((v) =>
          Object.prototype.hasOwnProperty.call(v, "unique")
        );

      const prefix = `[${ctId}] `;
      const fTitle = get("title");
      if (!fTitle || fTitle.type !== "Symbol")
        issues.push(prefix + "Field 'title' must exist and be type Symbol.");

      const fParent = get("parent");
      if (!fParent || fParent.type !== "Link" || fParent.linkType !== "Entry")
        issues.push(prefix + "Field 'parent' must be a Link to Entry.");

      const fSlug = get("slugSegment");
      if (!fSlug || fSlug.type !== "Symbol")
        issues.push(
          prefix + "Field 'slugSegment' must exist and be type Symbol."
        );

      const fFull = get("fullPath");
      if (!fFull || fFull.type !== "Symbol")
        issues.push(prefix + "Field 'fullPath' must exist and be type Symbol.");
      else if (!hasUnique(fFull))
        issues.push(
          prefix + "Field 'fullPath' should have 'unique' validation enabled."
        );

      const fMeta = get("pathMeta");
      if (!fMeta || fMeta.type !== "Object")
        issues.push(
          prefix + "Field 'pathMeta' must exist and be type JSON/Object."
        );
    }

    setErrors(issues);
    return issues;
  } catch (e) {
    setErrors([
      "Failed to read content type. Check the ID and your permissions.",
    ]);
    return ["Failed to read content type. Check the ID and your permissions."];
  } finally {
    setValidating(false);
  }
}

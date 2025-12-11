import { ConfigAppSDK } from "@contentful/app-sdk";
import {
  Box,
  Button,
  Checkbox,
  Form,
  Heading,
  Note,
  Paragraph,
  Select,
  Text,
} from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useCallback, useEffect, useMemo, useState } from "react";

interface AppInstallationParameters {
  contentTypeIds?: string[];
  localeMode?: "single" | "per-locale";
  autoAssignSidebar?: boolean;
}

type CTItem = { sys: { id: string }; name?: string };

const ConfigScreen: React.FC = () => {
  const sdk = useSDK<ConfigAppSDK>();

  const [availableTypes, setAvailableTypes] = useState<
    Array<{ id: string; name: string }>
  >([]);
  const [contentTypeIds, setContentTypeIds] = useState<string[]>([]);
  const [localeMode, setLocaleMode] = useState<"single" | "per-locale">(
    "single"
  );
  const [autoAssignSidebar, setAutoAssignSidebar] = useState(true);

  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [installMessage, setInstallMessage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  // ========= Bootstrap: load content types + existing parameters =========
  useEffect(() => {
    (async () => {
      try {
        const res = await sdk.cma.contentType.getMany({
          query: { limit: 1000 },
        });
        const types = (res.items || []).map((ct: CTItem) => ({
          id: ct.sys.id,
          name: ct.name || ct.sys.id,
        }));
        setAvailableTypes(types);
      } catch {
        setErrors((prev) => [
          ...prev,
          "Failed to list content types. Check permissions and network.",
        ]);
      }

      try {
        const currentParameters =
          (await sdk.app.getParameters()) as AppInstallationParameters | null;

        if (currentParameters) {
          setContentTypeIds(
            Array.isArray(currentParameters.contentTypeIds)
              ? currentParameters.contentTypeIds
              : []
          );
          setLocaleMode(
            currentParameters.localeMode === "per-locale"
              ? "per-locale"
              : "single"
          );
          if (typeof currentParameters.autoAssignSidebar === "boolean") {
            setAutoAssignSidebar(currentParameters.autoAssignSidebar);
          }
        }
      } finally {
        sdk.app.setReady();
      }
    })();

    // completion callback (register once)
    sdk.app.onConfigurationCompleted((data: unknown) => {
      try {
        setLastCompleted(JSON.stringify(data, null, 2));
        const msg = (data as { message?: string } | undefined)?.message || null;
        setInstallMessage(msg);
      } catch {
        /* noop */
      }
    });
  }, [sdk]);

  // ========= Validate whenever selected content types change =========
  useEffect(() => {
    void performValidation(sdk, contentTypeIds, setErrors, setValidating);
  }, [sdk, contentTypeIds]);

  // ========= Configure handler =========
  const onConfigure = useCallback<
    NonNullable<Parameters<typeof sdk.app.onConfigure>[0]>
  >(async () => {
    try {
      const issues = await performValidation(
        sdk,
        contentTypeIds,
        setErrors,
        setValidating
      );
      if (issues.length > 0) return false;

      const parameters: Required<AppInstallationParameters> = {
        contentTypeIds,
        localeMode,
        autoAssignSidebar,
      };

      if (autoAssignSidebar) {
        const targetState = await computeTargetState(sdk, contentTypeIds);
        const payload = { parameters, targetState } as const;
        console.log("parameters", payload);

        setLastPayload(JSON.stringify(payload, null, 2));
        return payload;
      }

      const payload = { parameters } as const;
      setLastPayload(JSON.stringify(payload, null, 2));

      return payload;
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Unknown configure error";

      console.error("onConfigure error:", err);
      setErrors([`Install failed in onConfigure: ${msg}`]);
      return false;
    }
  }, [sdk, contentTypeIds, localeMode, autoAssignSidebar]);

  // Register install/save callback
  useEffect(() => {
    try {
      sdk.app.onConfigure(onConfigure);
    } catch (error) {
      console.log("error in useEffect", error);
    }
  }, [sdk, onConfigure]);

  const hasSelection = useMemo(
    () => contentTypeIds.length > 0,
    [contentTypeIds]
  );

  return (
    <div className="flex flex-col gap-2">
      <Box padding="spacingL">
        <Heading as="h2">SlugSmith configuration</Heading>
        <Text>
          Choose one or more Page content types and the locale policy. Hybrid:
          <code> fullPath</code> and <code>slugSegment</code> as Symbols;{" "}
          <code>pathMeta</code> (JSON) holds <code>pathChain</code> and{" "}
          <code>previousPaths</code>.
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
                      // clear previous validation errors on interaction
                      setErrors([]);
                    }}
                  >
                    {t.name}{" "}
                    <Text as="span" style={{ opacity: 0.6 }}>
                      ({t.id})
                    </Text>
                  </Checkbox>
                </Box>
              ))}
              {availableTypes.length === 0 && (
                <Note variant="warning">
                  <Text>No content types found.</Text>
                </Note>
              )}
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
            screen registers a handler to persist the settings and optionally
            assign the Sidebar location to each selected content type.
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
            ) : hasSelection ? (
              <Note variant="positive">
                <Text>Selected content type(s) look good.</Text>
              </Note>
            ) : (
              <Note>
                <Text>Select at least one content type to begin.</Text>
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

          <Box marginTop="spacingM">
            <Button isDisabled aria-disabled>
              Use the top-right Save button to persist settings
            </Button>
          </Box>
        </Box>
      </Box>
    </div>
  );
};

export default ConfigScreen;

// ===== Helpers =====

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
      if (!fTitle || fTitle.type !== "Symbol") {
        issues.push(prefix + "Field 'title' must exist and be type Symbol.");
      }

      const fParent = get("parent");
      if (!fParent || fParent.type !== "Link" || fParent.linkType !== "Entry") {
        issues.push(prefix + "Field 'parent' must be a Link to Entry.");
      }

      const fSlug = get("slugSegment");
      if (!fSlug || fSlug.type !== "Symbol") {
        issues.push(
          prefix + "Field 'slugSegment' must exist and be type Symbol."
        );
      }

      const fFull = get("fullPath");
      if (!fFull || fFull.type !== "Symbol") {
        issues.push(prefix + "Field 'fullPath' must exist and be type Symbol.");
      } else if (!hasUnique(fFull)) {
        issues.push(
          prefix + "Field 'fullPath' should have 'unique' validation enabled."
        );
      }

      const fMeta = get("pathMeta");
      if (!fMeta || fMeta.type !== "Object") {
        issues.push(
          prefix + "Field 'pathMeta' must exist and be type JSON/Object."
        );
      }
    }

    setErrors(issues);
    return issues;
  } catch {
    const msg =
      "Failed to read content type. Check the ID and your permissions.";
    setErrors([msg]);
    return [msg];
  } finally {
    setValidating(false);
  }
}

type SidebarLoc = { position: number; settings?: Record<string, any> };
type EditorsLoc = { position: number; settings?: Record<string, any> };
type ControlsLoc = { fieldId: string; settings?: Record<string, any> };

async function computeTargetState(
  sdk: ConfigAppSDK,
  contentTypeIds: string[]
): Promise<{
  EditorInterface: Record<
    string,
    {
      sidebar?: SidebarLoc;
      editors?: EditorsLoc;
      controls?: ControlsLoc[];
    }
  >;
}> {
  // Safe on first install: might be null/empty
  const current = await sdk.app.getCurrentState().catch(() => null);
  const existingEI =
    (current?.EditorInterface as Record<
      string,
      { sidebar?: SidebarLoc; editors?: EditorsLoc; controls?: ControlsLoc[] }
    >) || {};

  const EditorInterface: Record<
    string,
    { sidebar?: SidebarLoc; editors?: EditorsLoc; controls?: ControlsLoc[] }
  > = { ...existingEI };

  // Put this app at the top of the sidebar for each selected CT
  for (const ctId of new Set(contentTypeIds)) {
    const prev = existingEI[ctId] || {};
    EditorInterface[ctId] = {
      ...prev,
      sidebar: { position: 1 },
    };
  }

  return { EditorInterface };
}

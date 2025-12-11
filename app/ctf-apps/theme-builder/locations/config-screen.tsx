import { ConfigAppSDK } from "@contentful/app-sdk";
import {
  Box,
  Button,
  Form,
  Heading,
  Note,
  Paragraph,
  Select,
  Text,
  TextInput,
} from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";
import React, { useCallback, useEffect, useState } from "react";
import { isColorToken } from "../lib/theme-validate";

interface AppInstallationParameters {
  fieldId?: string; // JSON field to attach the Field App, e.g. "themeJson"
  defaultColors?: Partial<{
    background: string;
    foreground: string;
    primary: string;
    "primary-foreground": string;
    secondary: string;
    ring: string;
    border: string;
  }>;
  defaultFonts?: {
    families?: string[]; // e.g. ["Inter","Roboto"]
    fallbacks?: string[]; // e.g. ["ui-sans-serif","system-ui"]
  };
}

type ColorKey =
  | "background"
  | "foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "ring"
  | "border";

const ConfigScreen: React.FC = () => {
  const sdk = useSDK<ConfigAppSDK>();

  const [fieldId, setFieldId] = useState<string>("themeJson");

  const [defaultColors, setDefaultColors] = useState<
    NonNullable<AppInstallationParameters["defaultColors"]>
  >({});
  const [defaultFonts, setDefaultFonts] = useState<
    NonNullable<AppInstallationParameters["defaultFonts"]>
  >({ families: [], fallbacks: [] });

  const [validating, setValidating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  const [installMessage, setInstallMessage] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastPayload, setLastPayload] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lastCompleted, setLastCompleted] = useState<string | null>(null);

  // ========= Bootstrap: load existing parameters =========
  useEffect(() => {
    (async () => {
      try {
        const currentParameters =
          (await sdk.app.getParameters()) as AppInstallationParameters | null;

        if (currentParameters) {
          setFieldId(currentParameters.fieldId || "themeJson");
          if (currentParameters.defaultColors) {
            setDefaultColors(currentParameters.defaultColors);
          }
          if (currentParameters.defaultFonts) {
            setDefaultFonts({
              families: currentParameters.defaultFonts.families || [],
              fallbacks: currentParameters.defaultFonts.fallbacks || [],
            });
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

  // ========= Validate whenever parameters change =========
  useEffect(() => {
    void performValidation(
      sdk,
      fieldId,
      defaultColors,
      setErrors,
      setValidating
    );
  }, [sdk, fieldId, defaultColors]);

  // ========= Configure handler =========
  const onConfigure = useCallback<
    NonNullable<Parameters<typeof sdk.app.onConfigure>[0]>
  >(async () => {
    try {
      const issues = await performValidation(
        sdk,
        fieldId,
        defaultColors,
        setErrors,
        setValidating
      );
      if (issues.length > 0) return false;

      const parameters: AppInstallationParameters = {
        fieldId,
        defaultColors,
        defaultFonts,
      };

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
  }, [sdk, fieldId, defaultColors, defaultFonts]);

  // Register install/save callback
  useEffect(() => {
    try {
      sdk.app.onConfigure(onConfigure);
    } catch (error) {
      console.log("error in useEffect", error);
    }
  }, [sdk, onConfigure]);

  return (
    <div className="flex flex-col gap-2">
      <Box padding="spacingL" style={{ maxWidth: 900, margin: "0 auto" }}>
        <Heading as="h2">Theme Builder configuration</Heading>
        <Text>Set the JSON field ID used for themes, default colors, and default font families. As a Field App, assignment to specific content types can be done later in Contentful settings.</Text>

        <Box marginTop="spacingL" as={Form} style={{ display: "grid", gap: 16 }}>
          <Box marginBottom="spacingM" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <Text as="label" htmlFor="fieldId">Theme JSON field ID</Text>
            <TextInput id="fieldId" value={fieldId} onChange={(e) => setFieldId(e.target.value)} />
          </Box>

          {/* Default colors */}
          <Box marginBottom="spacingL" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <Heading as="h3">Default colors (OKLCH/HEX/HSL)</Heading>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 12 }}>
              {([
                "background",
                "foreground",
                "primary",
                "primary-foreground",
                "secondary",
                "ring",
                "border",
              ] as ColorKey[]).map((key: ColorKey) => (
                <Box key={key} marginTop="spacingS" style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Text as="label" htmlFor={`color-${key}`} style={{ minWidth: 160, textTransform: "capitalize" }}>
                    {key.replace("-", " ")}
                  </Text>
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={(defaultColors as Record<ColorKey, string | undefined>)[key] || "#000000"}
                    onChange={(e) => {
                      const val = e.target.value; // hex string
                      setDefaultColors((prev) => ({ ...prev, [key]: val }));
                    }}
                    style={{ width: 44, height: 28, border: "1px solid #ccc", borderRadius: 6 }}
                  />
                  <Text as="span" style={{ fontFamily: "monospace", opacity: 0.8 }}>
                    {(defaultColors as Record<ColorKey, string | undefined>)[key] || "#000000"}
                  </Text>
                </Box>
              ))}
            </div>
          </Box>

          {/* Default fonts */}
          <Box marginBottom="spacingM" style={{ background: "#fff", border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
            <Heading as="h3">Default fonts</Heading>
            <Paragraph>Choose a primary family and optional fallbacks. Consumers should self-host via @fontsource; CSS2 only as non-production fallback.</Paragraph>
            <Box marginTop="spacingS" style={{ display: "grid", gap: 12 }}>
              <div>
                <Text as="label" htmlFor="font-primary">Primary family</Text>
                <Select
                  id="font-primary"
                  name="font-primary"
                  value={(defaultFonts.families && defaultFonts.families[0]) || "Inter"}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDefaultFonts((prev) => ({
                      ...prev,
                      families: [e.target.value, ...(prev.families?.slice(1) || [])],
                    }))
                  }
                >
                  {FONT_OPTIONS.map((f) => (
                    <Select.Option key={f} value={f}>
                      {f}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div>
                <Text as="label" htmlFor="font-fallbacks">Fallbacks</Text>
                <Select
                  id="font-fallbacks"
                  name="font-fallbacks"
                  value={(defaultFonts.fallbacks && defaultFonts.fallbacks[0]) || FALLBACK_OPTIONS[0]}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                    setDefaultFonts((prev) => ({
                      ...prev,
                      fallbacks: [e.target.value],
                    }))
                  }
                >
                  {FALLBACK_OPTIONS.map((f: string) => (
                    <Select.Option key={f} value={f}>
                      {f}
                    </Select.Option>
                  ))}
                </Select>
              </div>
            </Box>
          </Box>

          <Note>
            Saving happens via the Contentful Save button in the top-right. This screen registers a handler to persist the settings.
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
                <Text>Settings look good.</Text>
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
  fieldId: string,
  defaultColors: NonNullable<AppInstallationParameters["defaultColors"]>,
  setErrors: (e: string[]) => void,
  setValidating: (v: boolean) => void
) {
  setValidating(true);
  try {
    const issues: string[] = [];
    if (!fieldId || fieldId.trim().length === 0) {
      issues.push("Field ID is required.");
    }

    // Validate default colors if provided
    for (const [k, v] of Object.entries(defaultColors || {})) {
      if (v && !isColorToken(v)) {
        issues.push(`defaultColors.${k} is not a valid color token`);
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

// No target-state mutation required for Field App; assignment can be done in Contentful UI.

// Curated font list (common web-safe and popular Google fonts)
const FONT_OPTIONS: string[] = [
  "Inter",
  "Roboto",
  "Open Sans",
  "Source Sans Pro",
  "Poppins",
  "Montserrat",
  "Nunito",
  "Lato",
  "Merriweather",
  "System UI",
];

// Curated fallback stacks
const FALLBACK_OPTIONS: string[] = [
  "ui-sans-serif, system-ui",
  "system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
  "ui-serif, Georgia, Cambria, 'Times New Roman', serif",
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
];


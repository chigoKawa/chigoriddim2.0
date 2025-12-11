/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { Box, Heading, MenuDivider, Text } from "@contentful/f36-components";

import { DEFAULT_THEME } from "../lib/theme-defaults";
import type { Theme } from "../lib/theme-types";
import { ColorScheme } from "../lib/theme-types";
import {
  Collapsible,
  ThemeLogo,
  ColorSchemeSelector,
  PaletteColorPicker,
  TypographySelector,
} from "../components";
import { generatePaletteFromBase } from "../components/palette-color-picker";

function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return !!(
    v["logo"] &&
    v["colorScheme"] &&
    v["palette"] &&
    v["typography"] &&
    v["shape"]
  );
}

export default function Field() {
  const sdk = useSDK<FieldAppSDK>();
  const [value, setValue] = useState<Theme | null>(null);
  const [busy, setBusy] = useState(true);
  const [lastSave, setLastSave] = useState<ReturnType<
    typeof setTimeout
  > | null>(null);

  const scheduleSave = useCallback(
    (next: Theme) => {
      if (lastSave) clearTimeout(lastSave);
      setValue(next);
      const timeout = setTimeout(() => {
        sdk.field.setValue(next);
      }, 1000);
      setLastSave(timeout);
    },
    [sdk.field, lastSave]
  );

  useEffect(() => {
    (async () => {
      try {
        const v = sdk.field.getValue();
        if (isTheme(v)) {
          setValue(v);
        } else {
          const install = (sdk.parameters.installation || {}) as {
            primaryColor?: string;
            secondaryColor?: string;
            fontFamily?: string;
          };

          const seeded = { ...DEFAULT_THEME };

          if (install.primaryColor) {
            const colors = generatePaletteFromBase(install.primaryColor);
            seeded.palette.primary = colors;
            seeded.palette.background = {
              hex: "#FFFFFF",
              rgb: "rgb(255, 255, 255)",
              oklch: "oklch(1 0 0)",
            };
            seeded.palette.foreground = {
              hex: "#000000",
              rgb: "rgb(0, 0, 0)",
              oklch: "oklch(0 0 0)",
            };
            seeded.palette.primaryContrast = {
              hex: "#FFFFFF",
              rgb: "rgb(255, 255, 255)",
              oklch: "oklch(1 0 0)",
            };
          }

          if (install.secondaryColor) {
            const colors = generatePaletteFromBase(install.secondaryColor);
            seeded.palette.secondary = colors;
          }

          if (install.fontFamily) {
            const typography = {
              ...seeded.typography,
              headers: Object.entries(seeded.typography.headers).reduce(
                (acc, [key, value]) => ({
                  ...acc,
                  [key]: { ...value, fontFamily: install.fontFamily },
                }),
                {} as typeof seeded.typography.headers
              ),
              subheader: {
                ...seeded.typography.subheader,
                fontFamily: install.fontFamily,
              },
              body: {
                ...seeded.typography.body,
                fontFamily: install.fontFamily,
              },
            };
            seeded.typography = typography;
          }

          setValue(seeded);
          sdk.field.setValue(seeded);
        }
      } finally {
        setBusy(false);
        sdk.window.startAutoResizer();
      }
    })();
  }, [sdk]);

  const resolveAssetUrl = React.useCallback(
    async (assetId: string): Promise<string | null> => {
      const cma = (sdk as FieldAppSDK).cma;
      const locale: string = (sdk.locales?.default as string) || "en-US";
      const maxAttempts = 30;
      for (let i = 0; i < maxAttempts; i++) {
        try {
          const a = await cma.asset.get({ assetId });
          const f = a?.fields?.file?.[locale];
          if (f?.url) {
            try {
              await cma.asset.publish(
                {
                  spaceId: sdk.ids.space,
                  environmentId: sdk.ids.environment,
                  assetId: a.sys.id,
                },
                {
                  sys: {
                    version: a.sys.version,
                  },
                } as any
              );
              // await cma.asset.publish({
              //   assetId: a.sys.id,
              //   version: a.sys.version,
              // });
            } catch {}
            const raw = String(f.url);
            return raw.startsWith("http") ? raw : `https:${raw}`;
          }
        } catch (err: any) {
          console.debug("resolveAssetUrl attempt error", err?.status || err);
        }

        const wait = 700 + Math.min(i * 100, 800);
        await new Promise((r) => setTimeout(r, wait));
      }
      return null;
    },
    [sdk]
  );

  const uploadLogo = React.useCallback(
    async (file: File): Promise<string | null> => {
      try {
        const cma = (sdk as any).cma;
        const ab = await file.arrayBuffer();
        const blob = new Blob([ab], {
          type: file.type || "application/octet-stream",
        });
        const { upload } = await cma.upload.create({ file: blob });
        const locale: string = (sdk.locales?.default as any) || "en-US";
        if (!upload?.sys?.id) return null;
        const asset: any = await cma.asset.create({
          fields: {
            title: { [locale]: file.name },
            file: {
              [locale]: {
                contentType: file.type || "application/octet-stream",
                fileName: file.name,
                uploadFrom: {
                  sys: { type: "Link", linkType: "Upload", id: upload.sys.id },
                },
              },
            },
          },
        });
        await cma.asset.processForAllLocales({ assetId: asset.sys.id });
        for (let i = 0; i < 15; i++) {
          await new Promise((r) => setTimeout(r, 800));
          const a: any = await cma.asset.get({ assetId: asset.sys.id });
          const f = a?.fields?.file?.[locale];
          if (f?.url) {
            try {
              await cma.asset.publish({
                assetId: a.sys.id,
                version: a.sys.version,
              });
            } catch {}
            const url: string = f.url.startsWith("http")
              ? f.url
              : `https:${f.url}`;
            return url;
          }
        }
        return null;
      } catch (e) {
        console.error("Upload failed", e);
        return null;
      }
    },
    [sdk]
  );

  if (busy || !value) {
    return <Box>Loading...</Box>;
  }

  console.log(value);

  return (
    <Box
      padding="spacingL"
      style={{
        width: "100%",
        boxSizing: "border-box",
        paddingRight: 0,
        paddingLeft: 0,
      }}
    >
      <Heading as="h2" style={{ marginBottom: 4 }}>
        Demo Configuration
      </Heading>
      <Text as="p">Configure your demo properties</Text>

      <Collapsible header="Logos" description="Upload logos" defaultOpen>
        <ThemeLogo
          variant="light"
          sdk={sdk}
          canCreate
          canUpload
          uploadLogo={uploadLogo}
          resolveAssetUrl={resolveAssetUrl}
          scheduleSave={scheduleSave}
          value={value}
        />
        <MenuDivider style={{ margin: "24px 0" }} />
        <ThemeLogo
          variant="dark"
          sdk={sdk}
          canCreate
          canUpload
          uploadLogo={uploadLogo}
          resolveAssetUrl={resolveAssetUrl}
          scheduleSave={scheduleSave}
          value={value}
        />
      </Collapsible>

      <Collapsible
        header="Colors"
        description="Select a color scheme."
        defaultOpen
      >
        <ColorSchemeSelector
          palette={value.palette}
          value={value.colorScheme}
          onChange={(scheme: ColorScheme) => {
            let background = {
              hex: "#FFFFFF",
              rgb: "rgb(255,255,255)",
              oklch: "oklch(1 0 0)",
            };
            let foreground = {
              hex: "#000000",
              rgb: "rgb(0,0,0)",
              oklch: "oklch(0 0 0)",
            };
            let primaryContrast = {
              hex: "#FFFFFF",
              rgb: "rgb(255,255,255)",
              oklch: "oklch(1 0 0)",
            };
            if (scheme === ColorScheme.MonoDark) {
              background = {
                hex: "#383838",
                rgb: "rgb(56,56,56)",
                oklch: "oklch(0.22 0.01 260)",
              };
              foreground = {
                hex: "#FFFFFF",
                rgb: "rgb(255,255,255)",
                oklch: "oklch(1 0 0)",
              };
              primaryContrast = {
                hex: "#383838",
                rgb: "rgb(56,56,56)",
                oklch: "oklch(0.22 0.01 260)",
              };
            } else if (scheme === ColorScheme.Monochromatic) {
              background = {
                hex: "#EBEBEB",
                rgb: "rgb(235,235,235)",
                oklch: "oklch(0.92 0.01 260)",
              };
              foreground = {
                hex: "#1A1A1A",
                rgb: "rgb(26,26,26)",
                oklch: "oklch(0.10 0.01 260)",
              };
              primaryContrast = {
                hex: "#EBEBEB",
                rgb: "rgb(235,235,235)",
                oklch: "oklch(0.92 0.01 260)",
              };
            } else if (scheme === ColorScheme.MonoLight) {
              background = {
                hex: "#F8FAFC",
                rgb: "rgb(248,250,252)",
                oklch: "oklch(0.98 0.01 260)",
              };
              foreground = {
                hex: "#1E293B",
                rgb: "rgb(30,41,59)",
                oklch: "oklch(0.18 0.01 260)",
              };
              primaryContrast = {
                hex: "#F8FAFC",
                rgb: "rgb(248,250,252)",
                oklch: "oklch(0.98 0.01 260)",
              };
            }
            scheduleSave({
              ...value,
              colorScheme: scheme,
              palette: {
                ...value.palette,
                background,
                foreground,
                primaryContrast,
              },
            });
          }}
        />
        <PaletteColorPicker
          palette={value.palette}
          value={value.palette.primary}
          onChange={(colors, primaryContrast) =>
            scheduleSave({
              ...value,
              palette: {
                ...value.palette,
                primary: colors,
                ...(primaryContrast && { primaryContrast }),
              },
            })
          }
        />
      </Collapsible>

      <Collapsible
        header="Typography"
        description="Select a fontset to style your demo."
        defaultOpen
      >
        <TypographySelector
          value={value.typography}
          onChange={(typography) => {
            const headerKeys = ["h1", "h2", "h3", "h4", "h5", "h6"] as const;
            const newHeaders = headerKeys.reduce((acc, key) => {
              acc[key] = {
                ...value.typography.headers[key],
                fontFamily:
                  typography.headers[key]?.fontFamily ||
                  value.typography.headers[key].fontFamily,
              };
              return acc;
            }, {} as typeof value.typography.headers);
            const newSubheader = {
              ...value.typography.subheader,
              fontFamily: typography.subheader.fontFamily,
            };
            const newBody = {
              ...value.typography.body,
              fontFamily: typography.body.fontFamily,
            };
            scheduleSave({
              ...value,
              typography: {
                ...value.typography,
                headers: newHeaders,
                subheader: newSubheader,
                body: newBody,
              },
            });
          }}
        />
      </Collapsible>
    </Box>
  );
}

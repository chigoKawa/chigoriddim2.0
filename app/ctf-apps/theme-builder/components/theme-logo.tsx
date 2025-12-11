/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useRef, useEffect } from "react";
import Image from "next/image";
import {
  Button,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuList,
  Card,
  Flex,
  Text,
} from "@contentful/f36-components";
import { PlusIcon, CaretDownIcon } from "@contentful/f36-icons";
import type { FieldAppSDK } from "@contentful/app-sdk";
import type { Asset, AssetFile } from "contentful";
import { Theme } from "../lib/theme-types";

interface ContentfulFile {
  url: string;
  details: {
    image?: {
      width: number;
      height: number;
    };
  };
}

interface ThemeLogoProps {
  variant: "light" | "dark";
  sdk: FieldAppSDK;
  canCreate?: boolean;
  canUpload?: boolean;
  uploadLogo: (file: File) => Promise<string | null>;
  resolveAssetUrl: (id: string) => Promise<string | null>;
  scheduleSave: (value: Theme) => void;
  value: Theme;
}

export const ThemeLogo = ({
  variant,
  sdk,
  canCreate,
  canUpload,
  uploadLogo,
  resolveAssetUrl,
  scheduleSave,
  value,
}: ThemeLogoProps) => {
  const uploadRef = useRef<HTMLInputElement>(null);

  const handleSelectAsset = async () => {
    try {
      const asset = (await sdk.dialogs.selectSingleAsset({})) as Asset;
      const fileField = asset?.fields?.file as { [key: string]: AssetFile };
      const file = fileField?.[sdk.locales.default];
      if (!file) return;

      const raw = file.url || "";
      const url = raw
        ? String(raw).startsWith("http")
          ? raw
          : `https:${raw}`
        : "";

      if (url) {
        const updatedTheme: Theme = {
          ...value,
          logo: {
            ...value.logo,
            [variant]: {
              url,
              width: file.details?.image?.width || 0,
              height: file.details?.image?.height || 0,
            },
          },
        };
        scheduleSave(updatedTheme);
      }
    } catch {
      /* ignore */
    }
  };

  const handleCreateAsset = async () => {
    try {
      const res = await sdk.navigator.openNewAsset({
        slideIn: true,
      });
      const id = res?.entity?.sys?.id;
      const fileField = res?.entity?.fields?.file as {
        [key: string]: AssetFile;
      };
      const file = fileField?.[sdk.locales.default];

      let url = file?.url
        ? String(file.url).startsWith("http")
          ? file.url
          : `https:${file.url}`
        : null;

      if (!url && id) url = await resolveAssetUrl(id);
      if (url) {
        const updatedTheme: Theme = {
          ...value,
          logo: {
            ...value.logo,
            [variant]: {
              url,
              width: file?.details?.image?.width || 0,
              height: file?.details?.image?.height || 0,
            },
          },
        };
        scheduleSave(updatedTheme);
        return;
      }

      // If we couldn't resolve a CDN URL yet but have an asset id, store the id
      // so we can surface the pending state to the user and/or resolve later.
      if (id) {
        const updatedTheme: Theme = {
          ...value,
          logo: {
            ...value.logo,
            [variant]: {
              url: "",
              width: 0,
              height: 0,
              assetId: id,
            },
          },
        };
        // inform the user that processing is pending
        try {
          sdk.notifier.success(
            "Asset created — processing in progress. It will appear once Contentful finishes processing."
          );
        } catch {}
        scheduleSave(updatedTheme);
      }
    } catch {
      /* ignore */
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await uploadLogo(f);
    if (url) {
      const updatedTheme: Theme = {
        ...value,
        logo: {
          ...value.logo,
          [variant]: {
            url,
            width: 0, // We'll need to load the image to get dimensions
            height: 0,
          },
        },
      };
      scheduleSave(updatedTheme);
    }
    if (uploadRef.current) uploadRef.current.value = "";
  };

  const handleClear = () => {
    const updatedTheme: Theme = {
      ...value,
      logo: {
        ...value.logo,
        [variant]: {
          url: "",
          width: 0,
          height: 0,
        },
      },
    };
    scheduleSave(updatedTheme);
  };

  const logoUrl = value?.logo?.[variant]?.url;

  // If we previously saved an assetId because processing wasn't complete,
  // attempt to resolve it to a CDN URL and update the theme when available.
  const pendingAssetId = value?.logo?.[variant]?.assetId;
  const pendingWidth = value?.logo?.[variant]?.width;
  const pendingHeight = value?.logo?.[variant]?.height;

  useEffect(() => {
    let mounted = true;
    if (!pendingAssetId) return;
    const tryResolve = async () => {
      try {
        const resolved = await resolveAssetUrl(pendingAssetId);
        if (!mounted) return;
        if (resolved) {
          const updatedTheme: Theme = {
            ...value,
            logo: {
              ...value.logo,
              [variant]: {
                url: resolved,
                width: pendingWidth || 0,
                height: pendingHeight || 0,
              },
            },
          };
          scheduleSave(updatedTheme);
        }
      } catch {
        // ignore
      }
    };
    tryResolve();
    return () => {
      mounted = false;
    };
  }, [
    pendingAssetId,
    pendingWidth,
    pendingHeight,
    resolveAssetUrl,
    scheduleSave,
    value,
    variant,
  ]);

  return (
    <Flex flexDirection="column" gap="spacingM">
      <Flex alignItems="center" gap="spacingS">
        <Menu>
          <MenuTrigger>
            <Button
              size="medium"
              variant="secondary"
              startIcon={<PlusIcon />}
              endIcon={<CaretDownIcon />}
            >
              Add Media
            </Button>
          </MenuTrigger>
          <MenuList>
            <MenuItem onClick={handleSelectAsset}>Add from Media</MenuItem>
            {canCreate && (
              <MenuItem onClick={handleCreateAsset}>Create New</MenuItem>
            )}
            {/* {canUpload && (
              <MenuItem onClick={() => uploadRef.current?.click()}>
                Upload File
              </MenuItem>
            )} */}
          </MenuList>
        </Menu>

        {logoUrl && (
          <Button size="medium" variant="negative" onClick={handleClear}>
            Clear
          </Button>
        )}

        <input
          ref={uploadRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleUpload}
        />
      </Flex>
      <Text>
        Choose a logo to appear on {variant} backgrounds. Use SVG or PNG.
      </Text>
      <Card style={{ display: "flex", justifyContent: "center" }}>
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={`${variant} logo`}
            width={value?.logo?.[variant]?.width || 150}
            height={value?.logo?.[variant]?.height || 50}
            style={{
              maxWidth: 150,
              maxHeight: 50,
              objectFit: "contain",
              margin: "0 auto",
            }}
          />
        ) : (
          <Text fontColor="gray600" fontSize="fontSizeS">
            No logo selected
          </Text>
        )}
      </Card>
    </Flex>
  );
};

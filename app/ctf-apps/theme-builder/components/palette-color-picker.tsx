/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback } from "react";
import {
  Box,
  Flex,
  IconButton,
  Text,
  TextInput,
} from "@contentful/f36-components";
import { CopySimpleIcon } from "@contentful/f36-icons";
import { HexColorPicker } from "react-colorful";

import { Color, PaletteColor } from "../lib/theme-types";
import {
  hexToRgb,
  rgbToHsl,
  hslToRgb,
  rgbToHex,
  rgbToOklch,
  isLightColor,
} from "../lib/color-utils";

export function generatePaletteFromBase(baseHex: string): PaletteColor {
  const rgb = hexToRgb(baseHex);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const color200 = hslToRgb(hsl.h, Math.min(hsl.s, 80), 87);
  const color300 = hslToRgb(hsl.h, Math.min(hsl.s + 10, 85), 67);
  const color400 = rgb;
  const color500 = hslToRgb(hsl.h, Math.min(hsl.s + 15, 90), 22);

  return {
    "200": {
      hex: rgbToHex(color200.r, color200.g, color200.b),
      rgb: `rgb(${color200.r}, ${color200.g}, ${color200.b})`,
      oklch: rgbToOklch(color200.r, color200.g, color200.b),
    },
    "300": {
      hex: rgbToHex(color300.r, color300.g, color300.b),
      rgb: `rgb(${color300.r}, ${color300.g}, ${color300.b})`,
      oklch: rgbToOklch(color300.r, color300.g, color300.b),
    },
    "400": {
      hex: rgbToHex(color400.r, color400.g, color400.b),
      rgb: `rgb(${color400.r}, ${color400.g}, ${color400.b})`,
      oklch: rgbToOklch(color400.r, color400.g, color400.b),
    },
    "500": {
      hex: rgbToHex(color500.r, color500.g, color500.b),
      rgb: `rgb(${color500.r}, ${color500.g}, ${color500.b})`,
      oklch: rgbToOklch(color500.r, color500.g, color500.b),
    },
  };
}

interface ColorSwatchProps {
  color: Color;
  primary?: boolean;
  last?: boolean;
}

const ColorSwatch = ({
  color,
  primary = false,
  last = false,
}: ColorSwatchProps) => (
  <div
    style={{
      width: 48,
      height: 48,
      backgroundColor: color.hex,
      borderRadius: primary ? "4px 0 0 4px" : last ? "0 4px 4px 0" : "0",
      border: primary ? "4px solid #000" : "1px solid #ccc",
    }}
  />
);

interface PaletteColorPickerProps {
  palette: any;
  value: PaletteColor;
  onChange: (colors: PaletteColor, primaryContrast?: Color) => void;
}

export const PaletteColorPicker = ({
  palette,
  value,
  onChange,
}: PaletteColorPickerProps) => {
  const handleColorChange = useCallback(
    (baseColor: string) => {
      const colors = generatePaletteFromBase(baseColor);

      // Calculate primaryContrast based on the lightness of the primary color
      // primaryContrast should be a color that provides good contrast when used as text on the primary background
      const isLight = isLightColor(baseColor);
      const primaryContrast = isLight
        ? {
            hex: "#1A1A1A",
            rgb: "rgb(26, 26, 26)",
            oklch: "oklch(0.10 0.01 260)",
          }
        : {
            hex: "#FFFFFF",
            rgb: "rgb(255, 255, 255)",
            oklch: "oklch(1 0 0)",
          };

      onChange(colors, primaryContrast);
    },
    [onChange]
  );

  return (
    <Flex flexDirection="column" gap="spacingM">
      <Text>
        Select <strong>primary</strong> and <strong>background colors</strong>.
        Tints will be generated automatically.{" "}
      </Text>
      <Flex flexDirection="column" gap="spacingL" alignItems="flex-start">
        <HexColorPicker
          color={value["400"].hex}
          onChange={handleColorChange}
          style={{ width: "95%" }}
        />
        <Flex flexDirection="column" justifyContent="center">
          <Text
            fontWeight="fontWeightDemiBold"
            style={{ marginLeft: "60px" }}
            marginBottom="spacingXs"
          >
            Primary Brand Color
          </Text>
          <Flex gap="spacingXs">
            <ColorSwatch color={value["400"]} />
            <Flex gap="spacingXs" style={{ gap: "0" }}>
              <TextInput
                value={value["400"].hex}
                onChange={(e) => handleColorChange(e.target.value)}
                style={{
                  width: 160,
                  height: "48px",
                  maxHeight: "none",
                  borderTopRightRadius: 0,
                  borderBottomRightRadius: 0,
                }}
              />
              <IconButton
                variant="secondary"
                size="small"
                aria-label="Copy color"
                icon={<CopySimpleIcon />}
                style={{
                  width: 40,
                  height: "48px",
                  maxHeight: "none",
                  borderTopLeftRadius: 0,
                  borderBottomLeftRadius: 0,
                  marginLeft: "-1px",
                }}
                onClick={() => navigator.clipboard.writeText(value["400"].hex)}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      <Box
        style={{
          borderRadius: "4px",
          padding: "36px 24px",
          background: palette.background.hex,
          marginTop: "16px",
        }}
      >
        <Flex
          gap="none"
          flexWrap="wrap"
          alignItems="center"
          marginBottom="spacingM"
        >
          <ColorSwatch color={value["400"]} primary />
          <ColorSwatch color={value["200"]} />
          <ColorSwatch color={value["300"]} />
          <ColorSwatch color={value["500"]} last />
        </Flex>
        <Flex gap="none" flexWrap="wrap" alignItems="center">
          <ColorSwatch color={palette.white} />
          <ColorSwatch color={palette.gray[400]} />
          <ColorSwatch color={palette.gray[600]} />
          <ColorSwatch color={palette.black} />
        </Flex>
      </Box>
    </Flex>
  );
};

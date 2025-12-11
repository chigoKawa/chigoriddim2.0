/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Flex, Text, Box } from "@contentful/f36-components";
import { ColorScheme } from "../lib/theme-types";
import { MonochromaticIcon, MonoDarkIcon } from "./color-scheme-icons";

interface ColorSchemeSelectorProps {
  palette: any;
  value: ColorScheme;
  onChange: (
    scheme: ColorScheme,
    paletteUpdates: {
      background: string;
      foreground: string;
      primaryContrast: string;
    }
  ) => void;
}

export const ColorSchemeSelector = ({
  palette,
  value,
  onChange,
}: ColorSchemeSelectorProps) => {
  const handleSelect = (scheme: ColorScheme) => {
    let paletteUpdates = {
      background: "#FFFFFF",
      foreground: "#000000",
      primaryContrast: "#FFFFFF",
    };
    if (scheme === ColorScheme.MonoDark) {
      paletteUpdates = {
        background: "#383838",
        foreground: "#fff",
        primaryContrast: "#383838",
      };
    } else if (scheme === ColorScheme.Monochromatic) {
      paletteUpdates = {
        background: "#EBEBEB",
        foreground: "#1A1A1A",
        primaryContrast: "#EBEBEB",
      };
    }
    onChange(scheme, paletteUpdates);
  };

  return (
    <Flex gap="spacingM" marginBottom="spacingXl">
      {[
        ColorScheme.Monochromatic,
        ColorScheme.MonoDark,
        ColorScheme.MonoTint,
      ].map((scheme) => (
        <button
          key={scheme}
          onClick={() => handleSelect(scheme)}
          style={{
            cursor: "pointer",
            borderRadius: 0,
          }}
        >
          {scheme === ColorScheme.Monochromatic && (
            <Flex
              flexDirection="column"
              style={{ gap: "8px", alignItems: "center" }}
            >
              <Box
                style={{
                  borderRadius: "12px",
                  border: value === scheme ? "4px solid #A259FF" : "none",
                }}
              >
                <MonochromaticIcon color={palette.primary[400].hex} />
              </Box>
              <Text fontWeight="fontWeightDemiBold">{scheme}</Text>
            </Flex>
          )}
          {scheme === ColorScheme.MonoDark && (
            <Flex
              flexDirection="column"
              style={{ gap: "8px", alignItems: "center" }}
            >
              <Box
                style={{
                  borderRadius: "12px",
                  border: value === scheme ? "4px solid #A259FF" : "none",
                }}
              >
                <MonoDarkIcon color={palette.primary[400].hex} />
              </Box>
              <Text fontWeight="fontWeightDemiBold">{scheme}</Text>
            </Flex>
          )}
          {/* ADD ColorScheme.MonoTint */}
        </button>
      ))}
    </Flex>
  );
};

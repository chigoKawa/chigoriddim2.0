"use client";

import React from "react";
import { Box, Flex } from "@contentful/f36-components";
import {
  ModernSimpleIcon,
  ClassyElegantIcon,
  LiteraryPublicationIcon,
  CustomIcon,
} from "./typography-selector-icons";

const TYPOGRAPHY_OPTIONS = [
  {
    label: "Modern & Simple",
    value: "modern",
    fonts: {
      headers:
        "'Geist Sans', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      subheader:
        "'Geist Sans', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      body: "'Geist Sans', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
  },
  {
    label: "Classy & Elegant",
    value: "classy",
    fonts: {
      headers: "'Crimson Pro', 'Georgia', serif",
      subheader:
        "'DM Sans', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      body: "'Crimson Pro', 'Georgia', serif",
    },
  },
  {
    label: "Literary Publication",
    value: "literary",
    fonts: {
      headers: "'Besley', 'Georgia', serif",
      subheader:
        "'DM Sans', 'Helvetica Neue', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      body: "'Besley', 'Georgia', serif",
    },
  },
  {
    label: "Heavy Industries",
    value: "industrial",
    fonts: {
      headers:
        "'Sofia Sans Condensed', 'Arial Narrow', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      subheader:
        "'Sofia Sans', 'Arial', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
      body: "'Sofia Sans', 'Arial', system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    },
  },
];

interface TypographySelectorProps {
  value: {
    headers: { [key: string]: { fontFamily: string } };
    subheader: { fontFamily: string };
    body: { fontFamily: string };
  };
  onChange: (fonts: {
    headers: { [key: string]: { fontFamily: string } };
    subheader: { fontFamily: string };
    body: { fontFamily: string };
  }) => void;
}

export const TypographySelector = ({
  value,
  onChange,
}: TypographySelectorProps) => {
  const selectedValue = React.useMemo(() => {
    const bodyFont = value.body.fontFamily;
    const found = TYPOGRAPHY_OPTIONS.find((opt) => opt.fonts.body === bodyFont);
    return found?.value;
  }, [value]);

  const handleSelect = (option: (typeof TYPOGRAPHY_OPTIONS)[0]) => {
    const headers = Object.keys(value.headers).reduce((acc, key) => {
      acc[key] = { ...value.headers[key], fontFamily: option.fonts.headers };
      return acc;
    }, {} as { [key: string]: { fontFamily: string } });
    onChange({
      headers,
      subheader: { ...value.subheader, fontFamily: option.fonts.subheader },
      body: { ...value.body, fontFamily: option.fonts.body },
    });
  };

  return (
    <Box marginBottom="spacingL">
      <Flex gap="spacingM" flexWrap="wrap">
        {TYPOGRAPHY_OPTIONS.map((option) => {
          const isSelected = option.value === selectedValue;
          return (
            <button
              key={option.value}
              type="button"
              style={{
                cursor: "pointer",
                borderRadius: "8px",
                border: isSelected ? "2px solid #A259FF" : "none",
              }}
              onClick={() => handleSelect(option)}
            >
              {option.value === "modern" && <ModernSimpleIcon />}
              {option.value === "classy" && <ClassyElegantIcon />}
              {option.value === "literary" && <LiteraryPublicationIcon />}
            </button>
          );
        })}
        <CustomIcon />
      </Flex>
    </Box>
  );
};

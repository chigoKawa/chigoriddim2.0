"use client";

import React, { useState, ReactNode } from "react";
import { Flex, Text, IconButton } from "@contentful/f36-components";
import { CaretDownIcon, CaretUpIcon } from "@contentful/f36-icons";

interface CollapsibleProps {
  header: string;
  description?: string;
  defaultOpen?: boolean;
  gap?: string;
  children?: ReactNode;
}

export const Collapsible = ({
  header,
  description,
  defaultOpen = false,
  gap = "spacingM",
  children,
}: CollapsibleProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        borderBottom: "1px solid #eee ",
        marginTop: "24px",
        marginBottom: "24px",
        paddingBottom: "24px",
      }}
    >
      <Flex
        alignItems="center"
        justifyContent="space-between"
        onClick={() => setIsOpen(!isOpen)}
        style={{ cursor: "pointer" }}
      >
        <Flex flexDirection="column" gap="spacing2Xs">
          <Text
            fontWeight="fontWeightDemiBold"
            fontSize="fontSizeL"
            marginBottom="spacingXs"
          >
            {header}
          </Text>
          {description && (
            <Text
              fontColor="gray600"
              fontSize="fontSizeM"
              lineHeight="lineHeightS"
            >
              {description}
            </Text>
          )}
        </Flex>

        <IconButton
          variant="transparent"
          aria-label={isOpen ? "Collapse" : "Expand"}
          icon={isOpen ? <CaretUpIcon /> : <CaretDownIcon />}
        />
      </Flex>
      {isOpen && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: gap,
            width: "100%",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        >
          {children}
        </div>
      )}
    </div>
  );
};

"use client";

import { useCallback } from "react";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useAutoResizer } from "@contentful/react-apps-toolkit";
import { Stack, Button } from "@contentful/f36-components";
import { PlusIcon } from "@contentful/f36-icons";
import { RichTextEditor } from "@contentful/field-editor-rich-text";

interface CustomRichTextFieldProps {
  sdk: FieldAppSDK;
}

interface EntryLink {
  sys: {
    id: string;
    type: string;
    linkType: string;
  };
}

export default function CustomRichTextField({ sdk }: CustomRichTextFieldProps) {
  // Automatically resize the iframe inside Contentful
  useAutoResizer();

  const handleAddEmbed = useCallback(async () => {
    try {
      const entry = await sdk.dialogs.selectSingleEntry({
        contentTypes: ["pexelsImageWrapper"],
      });

      if (entry && "sys" in entry) {
        const typedEntry = entry as EntryLink;

        // Get current rich text value
        const currentValue = sdk.field.getValue() || {
          nodeType: "document",
          data: {},
          content: [],
        };

        // Create the embedded entry node
        const embedNode = {
          nodeType: "embedded-entry-block",
          data: {
            target: {
              sys: {
                id: typedEntry.sys.id,
                type: "Link",
                linkType: "Entry",
              },
            },
          },
          content: [],
        };

        // Add the embedded entry to the document content
        const updatedValue = {
          ...currentValue,
          content: [...(currentValue.content || []), embedNode],
        };

        // Update the field value
        sdk.field.setValue(updatedValue);
      }
    } catch (error) {
      console.error("Error adding embed:", error);
    }
  }, [sdk]);

  return (
    <Stack spacing="spacingM">
      <Stack spacing="spacingS" flexDirection="row"></Stack>

      <div className="flex flex-col gap-4">
        <Button
          variant="secondary"
          size="small"
          startIcon={<PlusIcon />}
          onClick={handleAddEmbed}
        >
          Add Pexels Image Wrapper
        </Button>
        <RichTextEditor sdk={sdk} isInitiallyDisabled={false} />
      </div>
    </Stack>
  );
}

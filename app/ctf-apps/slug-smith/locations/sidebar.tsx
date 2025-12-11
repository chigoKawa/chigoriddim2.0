"use client";
import {
  Box,
  Flex,
  Heading,
  Text,
  Note,
  Badge,
  Spinner,
  Button,
} from "@contentful/f36-components";
import { useSlugSmith } from "../hooks/useSlugSmith";

const SidebarPanel = () => {
  const { sdk, busy, preview, recompute } = useSlugSmith();

  if (!sdk) {
    return (
      <Flex
        alignItems="center"
        justifyContent="center"
        style={{ height: "100%" }}
      >
        <Spinner size="large" />
      </Flex>
    );
  }

  return (
    <Box padding="spacingM">
      <Heading as="h2">SlugSmith</Heading>
      <Text>
        Keeps your page segments and full paths clean and collision-free.
      </Text>

      <Box marginTop="spacingM">
        {preview ? (
          <Note variant="positive">
            <Flex alignItems="center" flexWrap="wrap" style={{ gap: "8px" }}>
              <Badge variant="secondary">segment</Badge>
              <Text as="span" style={{ fontFamily: "monospace" }}>
                {preview.segment || "—"}
              </Text>
              <Badge variant="secondary">fullPath</Badge>
              <Text as="span" style={{ fontFamily: "monospace" }}>
                {preview.fullPath || "—"}
              </Text>
            </Flex>
          </Note>
        ) : (
          <Note>Waiting for title/parent…</Note>
        )}
      </Box>

      {busy && (
        <Box marginTop="spacingS">
          <Spinner /> <Text as="span">Computing…</Text>
        </Box>
      )}

      <Box marginTop="spacingM">
        <Button size="small" onClick={recompute} isDisabled={busy}>
          Recompute now
        </Button>
      </Box>
    </Box>
  );
};

export default SidebarPanel;

"use client";

import { useEffect, useState } from "react";
import { init, locations, type HomeAppSDK } from "@contentful/app-sdk";
import {
  Box,
  Heading,
  Paragraph,
  Note,
  Text,
  List,
  ListItem,
} from "@contentful/f36-components";

export default function HomePage() {
  const [sdk, setSdk] = useState<HomeAppSDK | null>(null);

  useEffect(() => {
    init((s) => {
      if (s.location.is(locations.LOCATION_HOME)) {
        const app = s as HomeAppSDK;
        setSdk(app);
        // `setReady` lives on the underlying app instance; not exposed on HomeAppSDK type
        (app as any).app?.setReady?.();
      }
    });
  }, []);

  return (
    <Box padding="spacingL" style={{ maxWidth: 820 }}>
      <Heading as="h2">SlugSmith</Heading>
      <Paragraph>
        Keep page URL segments and full paths clean, unique, and governed.
        Install this app to your space and enable the Sidebar location for your
        page content type.
      </Paragraph>

      <Box marginTop="spacingM">
        <Note>
          <Text>
            Use App configuration to choose your content type and locale policy.
          </Text>
        </Note>
      </Box>

      <Box marginTop="spacingL">
        <Heading as="h3">What it manages</Heading>
        <List>
          <ListItem>
            <Text as="span">slugSegment</Text>
          </ListItem>
          <ListItem>
            <Text as="span">fullPath</Text>
          </ListItem>
          <ListItem>
            <Text as="span">pathChain</Text>
          </ListItem>
          <ListItem>
            <Text as="span">previousPaths</Text>
          </ListItem>
        </List>
      </Box>

      {sdk && (
        <Box marginTop="spacingL">
          <Heading as="h3">Installation parameters</Heading>
          <Text>
            contentTypeId:{" "}
            {(
              sdk.parameters.installation as
                | { contentTypeId?: string }
                | undefined
            )?.contentTypeId || "landingPage"}
          </Text>
          <br />
          <Text>
            localeMode:{" "}
            {(
              sdk.parameters.installation as
                | { localeMode?: "single" | "per-locale" }
                | undefined
            )?.localeMode || "single"}
          </Text>
        </Box>
      )}
    </Box>
  );
}

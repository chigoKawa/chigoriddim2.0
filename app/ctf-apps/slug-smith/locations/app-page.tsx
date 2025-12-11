"use client";
import {
  Box,
  Heading,
  Paragraph,
  Note,
  Text,
  List,
  ListItem,
} from "@contentful/f36-components";
import { useSDK } from "@contentful/react-apps-toolkit";

const AppPage = () => {
  const sdk = useSDK();
  return (
    <>
      <Box padding="spacingL" style={{ maxWidth: 820 }}>
        <Heading as="h2">SlugSmith</Heading>
        <Paragraph>
          Keep page URL segments and full paths clean, unique, and governed.
          Install this app to your space and enable the Sidebar location for
          your page content type.
        </Paragraph>

        <Box marginTop="spacingM">
          <Note>
            <Text>
              Use App configuration to choose your content type and locale
              policy.
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
              {(sdk.parameters.installation as any)?.contentTypeId ||
                "landingPage"}
            </Text>
            <br />
            <Text>
              localeMode:{" "}
              {(sdk.parameters.installation as any)?.localeMode || "single"}
            </Text>
          </Box>
        )}
      </Box>
    </>
  );
};

export default AppPage;

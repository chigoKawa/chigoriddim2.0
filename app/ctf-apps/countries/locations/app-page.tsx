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
import { APP_NAME } from "../constants";

const AppPage = () => {
  return (
    <Box padding="spacingL" style={{ maxWidth: 820 }}>
      <Heading as="h2">{APP_NAME}</Heading>
      <Paragraph>
        This app creates and manages Country, State/Province, and Currency
        content types, and populates them with bundled data.
      </Paragraph>

      <Box marginTop="spacingM">
        <Note>
          <Text>
            Use the App configuration to select which content types to install
            (Country is always installed; Currency and State are optional
            toggles).
          </Text>
        </Note>
      </Box>

      <Box marginTop="spacingL">
        <Heading as="h3">What it manages</Heading>
        <List>
          <ListItem>
            <Text as="span">Country</Text>
          </ListItem>
          <ListItem>
            <Text as="span">Currency (optional)</Text>
          </ListItem>
          <ListItem>
            <Text as="span">State / Province (optional)</Text>
          </ListItem>
        </List>
      </Box>
    </Box>
  );
};

export default AppPage;

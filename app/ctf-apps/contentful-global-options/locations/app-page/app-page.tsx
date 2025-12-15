"use client";

import {
  Box,
  Card,
  Flex,
  Heading,
  List,
  Note,
  Paragraph,
  Text,
} from "@contentful/f36-components";

export default function AppPage() {
  return (
    <Flex justifyContent="center" padding="spacingXl">
      <Box style={{ width: "min(960px, 100%)" }} className="space-y-6">
        <Heading as="h2">Contentful Global Options</Heading>
        <Paragraph>
          Centralize reusable option sets and attach them to fields with a few
          clicks. Define sets once, reuse them everywhere.
        </Paragraph>

        <Card style={{ padding: "24px" }}>
          <Heading as="h3" marginBottom="spacingM">
            How to use
          </Heading>
          <List>
            <List.Item>
              Configure option sets on the <strong>App configuration</strong>
              screen.
            </List.Item>
            <List.Item>
              Assign the field location to Symbol/Text/JSON fields and provide
              instance parameters (see below).
            </List.Item>
            <List.Item>
              Editors pick values via the field UI. Selections are stored in the
              Contentful field.
            </List.Item>
          </List>
        </Card>

        <Card style={{ padding: "24px" }}>
          <Heading as="h3" marginBottom="spacingM">
            Instance parameter example
          </Heading>
          <pre
            style={{
              background: "#f4f6f8",
              padding: "16px",
              borderRadius: "8px",
              fontSize: 14,
            }}
          >
            {`{
  "optionSetId": "buttonVariants",
  "allowCustom": false,
  "multiSelect": false
}`}
          </pre>
          <Text fontColor="gray600" fontSize="fontSizeS">
            <strong>optionSetId</strong> references an ID defined in the config
            screen. Set <strong>multiSelect</strong> to true for Array fields.
          </Text>
        </Card>

        <Note>
          Need ideas? Use this for CTA variants, personas, brand tones, regions,
          or any taxonomy you want to manage centrally.
        </Note>
      </Box>
    </Flex>
  );
}

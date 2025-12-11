"use client";

import {
  Box,
  Form,
  Heading,
  Paragraph,
  Spinner,
  Text,
  TextInput,
  Note,
} from "@contentful/f36-components";
import type { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useCallback, useEffect, useRef, useState } from "react";
import { APP_NAME } from "../constants";
import { runInstallation } from "../install";

export default function ConfigScreen() {
  const sdk = useSDK<ConfigAppSDK>();

  const [formContentTypeId, setFormContentTypeId] = useState("contentfulForm");
  const [formContentTypeName, setFormContentTypeName] =
    useState("Contentful Form");
  const [installing, setInstalling] = useState(false);
  const lastParametersRef = useRef<{
    formContentTypeId?: string;
    formContentTypeName?: string;
  } | null>(null);

  // Load existing installation params (if any) and mark app as ready
  useEffect(() => {
    const params = sdk.parameters.installation as
      | {
          formContentTypeId?: string;
          formContentTypeName?: string;
        }
      | undefined;

    if (params?.formContentTypeId) {
      setFormContentTypeId(params.formContentTypeId);
    }

    if (params?.formContentTypeName) {
      setFormContentTypeName(params.formContentTypeName);
    }

    sdk.app.setReady();
  }, [sdk]);

  // Called by Contentful when user clicks "Install" / "Save" in app config.
  // We only return parameters here; editor interface wiring happens in
  // runInstallation after the content type exists.
  const onConfigure = useCallback(async () => {
    const ctId = formContentTypeId || "form";

    const parameters = {
      formContentTypeId: ctId,
      formContentTypeName: formContentTypeName || "Form",
    };

    lastParametersRef.current = parameters;

    console.log("Contentful Forms onConfigure", { parameters });

    return { parameters };
  }, [formContentTypeId, formContentTypeName]);

  // Register the configure handler
  useEffect(() => {
    sdk.app.onConfigure(onConfigure);
  }, [sdk, onConfigure]);

  // After configuration is saved/installed, run the installer once.
  // This mirrors the Newsletter Preview app pattern exactly.
  useEffect(() => {
    sdk.app.onConfigurationCompleted(async () => {
      try {
        setInstalling(true);

        // Use the ref we set in onConfigure, or fall back to sdk.parameters.installation
        const params =
          lastParametersRef.current ||
          (sdk.parameters.installation as
            | {
                formContentTypeId?: string;
                formContentTypeName?: string;
              }
            | undefined);

        console.log("Contentful Forms install params", params);

        await runInstallation({
          cma: sdk.cma,
          notifier: sdk.notifier,
          environmentId: sdk.ids.environment,
          formContentTypeId: params?.formContentTypeId || "contentfulForm",
          formContentTypeName: params?.formContentTypeName || "Contentful Form",
          appId: sdk.ids.app,
        });

        sdk.notifier.success("Form model installed or updated.");
      } catch (error) {
        console.error("Contentful Forms install failed", error);
        sdk.notifier.error(
          "Contentful Forms install failed. Check browser console for details."
        );
      } finally {
        setInstalling(false);
      }
    });
  }, [sdk]);

  return (
    <Box padding="spacingL" style={{ maxWidth: 820, margin: "0 auto" }}>
      <Heading as="h2">{APP_NAME} – Configuration</Heading>
      <Paragraph>
        Configure how the Contentful Forms app creates and wires the Form
        content type and schema field editor.
      </Paragraph>

      <Form style={{ marginTop: "1.5rem" }}>
        <Box marginBottom="spacingM">
          <Text as="label">Form content type ID</Text>
          <TextInput
            value={formContentTypeId}
            onChange={(e) => setFormContentTypeId(e.target.value)}
          />
          <Text as="p" fontSize="fontSizeS" style={{ opacity: 0.8 }}>
            ID for the Form content type that will store form definitions.
            Default is <code>form</code>.
          </Text>
        </Box>

        <Box marginBottom="spacingM">
          <Text as="label">Form content type name</Text>
          <TextInput
            value={formContentTypeName}
            onChange={(e) => setFormContentTypeName(e.target.value)}
          />
          <Text as="p" fontSize="fontSizeS" style={{ opacity: 0.8 }}>
            Display name for the Form content type in the Contentful UI. Default
            is <code>Form</code>.
          </Text>
        </Box>

        <Note variant="primary">
          <Text>
            When you click the Contentful <strong>Save</strong> or{" "}
            <strong>Install</strong> button, this app will create or update the
            Form content type with the recommended fields (title, slug,
            description, schema, successMessage, errorMessage).
          </Text>
          {installing && (
            <Box
              marginTop="spacingS"
              style={{ display: "flex", alignItems: "center" }}
            >
              <Spinner size="small" />
              <Text style={{ marginLeft: "0.5rem" }}>
                Installing Contentful Forms model… This can take a little while.
              </Text>
            </Box>
          )}
        </Note>
      </Form>
    </Box>
  );
}

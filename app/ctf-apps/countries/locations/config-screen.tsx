/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";
import {
  Box,
  Button,
  Form,
  Heading,
  Note,
  Paragraph,
  Select,
  Spinner,
  Text,
  TextInput,
} from "@contentful/f36-components";
import type { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useEffect, useState, useCallback } from "react";
import { APP_NAME } from "../constants";
import { runInstallation, runUninstall } from "../install";

export default function ConfigScreen() {
  const sdk = useSDK<ConfigAppSDK>();
  const [includeStates, setIncludeStates] = useState<boolean>(false);
  const [includeCurrency, setIncludeCurrency] = useState<boolean>(true);
  const [countryContentTypeId, setCountryContentTypeId] = useState("country");
  const [currencyContentTypeId, setCurrencyContentTypeId] =
    useState("currency");
  const [stateContentTypeId, setStateContentTypeId] = useState("state");
  const [maxCountries, setMaxCountries] = useState<string>("");
  const [removingData, setRemovingData] = useState(false);
  const [hasCountriesModel, setHasCountriesModel] = useState(false);
  const [checkingModel, setCheckingModel] = useState(true);
  const [installing, setInstalling] = useState(false);

  // Load saved parameters when the config screen mounts
  useEffect(() => {
    const params = sdk.parameters.installation as
      | {
          includeStates?: boolean;
          includeCurrency?: boolean;
          countryContentTypeId?: string;
          currencyContentTypeId?: string;
          stateContentTypeId?: string;
          maxCountries?: number;
        }
      | undefined;
    if (params) {
      setIncludeStates(!!params.includeStates);
      setIncludeCurrency(
        params.includeCurrency !== undefined ? !!params.includeCurrency : true
      );
      if (params.countryContentTypeId) {
        setCountryContentTypeId(params.countryContentTypeId);
      }
      if (params.currencyContentTypeId) {
        setCurrencyContentTypeId(params.currencyContentTypeId);
      }
      if (params.stateContentTypeId) {
        setStateContentTypeId(params.stateContentTypeId);
      }
      if (typeof params.maxCountries === "number") {
        setMaxCountries(String(params.maxCountries));
      }
    }
    // Signal to Contentful that the app config screen is ready
    sdk.app.setReady();
  }, [sdk]);

  const onConfigure = useCallback(async () => {
    const parsedMax = maxCountries.trim()
      ? Number.parseInt(maxCountries.trim(), 10)
      : undefined;
    const parameters = {
      includeStates,
      includeCurrency,
      countryContentTypeId: countryContentTypeId || "country",
      currencyContentTypeId: currencyContentTypeId || "currency",
      stateContentTypeId: stateContentTypeId || "state",
      maxCountries:
        Number.isFinite(parsedMax) && parsedMax! > 0 ? parsedMax : undefined,
    };
    return { parameters };
  }, [
    includeStates,
    includeCurrency,
    countryContentTypeId,
    currencyContentTypeId,
    stateContentTypeId,
    maxCountries,
  ]);

  // Register the configure handler
  useEffect(() => {
    sdk.app.onConfigure(onConfigure);
  }, [sdk, onConfigure]);

  // Check if the primary Country content type exists so we can
  // conditionally show the Danger zone uninstall button.
  useEffect(() => {
    let cancelled = false;

    async function checkModel() {
      setCheckingModel(true);
      try {
        await sdk.cma.contentType.get({
          environmentId: sdk.ids.environment,
          contentTypeId: countryContentTypeId || "country",
        });
        if (!cancelled) setHasCountriesModel(true);
      } catch (err: any) {
        if (!cancelled) setHasCountriesModel(false);
      } finally {
        if (!cancelled) setCheckingModel(false);
      }
    }

    checkModel();
    return () => {
      cancelled = true;
    };
  }, [sdk, countryContentTypeId]);

  const handleRemoveAllData = async () => {
    const confirmed = await sdk.dialogs.openConfirm({
      title: "Remove all Countries data",
      message:
        "This will delete all entries and content types configured for Countries (country, currency, state) in this environment. This cannot be undone.",
      intent: "negative",
      confirmLabel: "Delete all data",
      cancelLabel: "Cancel",
    });
    if (!confirmed) return;
    try {
      setRemovingData(true);
      await runUninstall({
        cma: sdk.cma,
        notifier: sdk.notifier,
        environmentId: sdk.ids.environment,
        countryContentTypeId: countryContentTypeId || "country",
        currencyContentTypeId: currencyContentTypeId || "currency",
        stateContentTypeId: stateContentTypeId || "state",
      });
    } catch (err) {
      console.error("Countries uninstall failed", err);
      sdk.notifier.error(
        "Failed to remove Countries data. Check browser console for details."
      );
    } finally {
      setRemovingData(false);
    }
  };

  // After configuration is saved/installed, run the installer once
  useEffect(() => {
    sdk.app.onConfigurationCompleted(async () => {
      try {
        setInstalling(true);
        const params = sdk.parameters.installation as
          | {
              includeStates?: boolean;
              includeCurrency?: boolean;
              countryContentTypeId?: string;
              currencyContentTypeId?: string;
              stateContentTypeId?: string;
              maxCountries?: number;
            }
          | undefined;

        await runInstallation({
          cma: sdk.cma,
          notifier: sdk.notifier,
          environmentId: sdk.ids.environment,
          locale: sdk.locales.default,
          includeStates: !!params?.includeStates,
          includeCurrency: params?.includeCurrency !== false,
          countryContentTypeId: params?.countryContentTypeId || "country",
          currencyContentTypeId: params?.currencyContentTypeId || "currency",
          stateContentTypeId: params?.stateContentTypeId || "state",
          maxCountries: params?.maxCountries,
        });

        sdk.notifier.success("Countries model and data installed.");
      } catch (err) {
        console.error("Countries install failed", err, {
          message: (err as any)?.message,
          code: (err as any)?.code,
          name: (err as any)?.name,
          status: (err as any)?.status,
          details: (err as any)?.details,
        });
        sdk.notifier.error(
          "Countries install failed. Check browser console for details."
        );
      } finally {
        setInstalling(false);
      }
    });
  }, [sdk]);

  return (
    <Box padding="spacingL" style={{ maxWidth: 820, margin: "0 auto" }}>
      <Heading as="h2">{APP_NAME} – Installation Settings</Heading>
      <Paragraph>
        Choose which optional content types to create when the app runs.
      </Paragraph>

      <Form style={{ marginTop: "1.5rem" }}>
        <Box marginBottom="spacingM">
          <Select
            id="includeCurrency"
            value={includeCurrency ? "yes" : "no"}
            onChange={(e) => setIncludeCurrency(e.target.value === "yes")}
          >
            <Select.Option value="yes">
              Include Currency (default ON)
            </Select.Option>
            <Select.Option value="no">Do not include Currency</Select.Option>
          </Select>
        </Box>
        <Box marginBottom="spacingM">
          <Select
            id="includeStates"
            value={includeStates ? "yes" : "no"}
            onChange={(e) => setIncludeStates(e.target.value === "yes")}
          >
            <Select.Option value="yes">
              Include States / Provinces (default OFF)
            </Select.Option>
            <Select.Option value="no">Do not include States</Select.Option>
          </Select>
        </Box>
        <Box marginBottom="spacingM">
          <Heading as="h3">Content type IDs</Heading>
          <Paragraph>
            Override the default content type IDs if your model uses different
            ones.
          </Paragraph>
          <Box marginTop="spacingS">
            <Text as="label">Country content type ID</Text>
            <TextInput
              value={countryContentTypeId}
              onChange={(e) => setCountryContentTypeId(e.target.value)}
            />
          </Box>
          <Box marginTop="spacingS">
            <Text as="label">Currency content type ID</Text>
            <TextInput
              value={currencyContentTypeId}
              onChange={(e) => setCurrencyContentTypeId(e.target.value)}
              isDisabled={!includeCurrency}
            />
          </Box>
          <Box marginTop="spacingS">
            <Text as="label">State / Province content type ID</Text>
            <TextInput
              value={stateContentTypeId}
              onChange={(e) => setStateContentTypeId(e.target.value)}
              isDisabled={!includeStates}
            />
          </Box>
        </Box>
        <Box marginBottom="spacingM">
          <Heading as="h3">Dataset size</Heading>
          <Paragraph>
            Optionally limit how many countries to create (leave blank for full
            dataset).
          </Paragraph>
          <Box marginTop="spacingS">
            <Text as="label">Maximum number of countries</Text>
            <TextInput
              type="number"
              min={1}
              value={maxCountries}
              onChange={(e) => setMaxCountries(e.target.value)}
            />
          </Box>
        </Box>
        <Note>
          <Text>
            After saving, the app will run on first render and create the
            selected content types.
          </Text>
          {installing && (
            <Box marginTop="spacingS" display="flex" alignItems="center">
              <Spinner size="small" />
              <Text style={{ marginLeft: "0.5rem" }}>
                Installing Countries model and entries… This can take a little
                while.
              </Text>
            </Box>
          )}
        </Note>
        {hasCountriesModel && !checkingModel && (
          <Box marginTop="spacingL">
            <Heading as="h3">Danger zone</Heading>
            <Paragraph>
              Remove all Countries data from this environment. This will delete
              all entries and the configured content types for Country,
              Currency, and State/Province.
            </Paragraph>
            <Box marginTop="spacingS">
              <Button
                variant="negative"
                isDisabled={removingData || installing}
                onClick={handleRemoveAllData}
              >
                {removingData ? "Removing data…" : "Remove all Countries data"}
              </Button>
            </Box>
          </Box>
        )}
      </Form>
    </Box>
  );
}

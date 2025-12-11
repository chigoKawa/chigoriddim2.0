"use client";

import {
  Box,
  Form,
  Heading,
  Note,
  Paragraph,
  Spinner,
  Switch,
  Text,
  TextInput,
} from "@contentful/f36-components";
import type { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import { useCallback, useEffect, useState } from "react";
import { APP_NAME, DEFAULT_PEXELS_PROXY_URL } from "../constants";

export default function ConfigScreen() {
  const sdk = useSDK<ConfigAppSDK>();
  const [saving, setSaving] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [proxyUrl, setProxyUrl] = useState(DEFAULT_PEXELS_PROXY_URL);
  const [proxyHandlesApiKey, setProxyHandlesApiKey] = useState(false);

  useEffect(() => {
    const params = sdk.parameters.installation as
      | {
          pexelsApiKey?: string;
          proxyUrl?: string;
          proxyHandlesApiKey?: boolean;
        }
      | undefined;

    if (params?.pexelsApiKey) {
      setApiKey(params.pexelsApiKey);
    }
    if (params?.proxyUrl) {
      setProxyUrl(params.proxyUrl);
    }
    if (params?.proxyHandlesApiKey) {
      setProxyHandlesApiKey(params.proxyHandlesApiKey);
    }

    sdk.app.setReady();
  }, [sdk]);

  const onConfigure = useCallback(async () => {
    setSaving(true);

    const parameters = {
      pexelsApiKey: proxyHandlesApiKey ? undefined : apiKey.trim() || undefined,
      proxyUrl: proxyUrl.trim() || DEFAULT_PEXELS_PROXY_URL,
      proxyHandlesApiKey,
    };

    setSaving(false);
    return { parameters };
  }, [apiKey, proxyUrl, proxyHandlesApiKey]);

  useEffect(() => {
    sdk.app.onConfigure(onConfigure);
  }, [sdk, onConfigure]);

  return (
    <Box padding="spacingL" style={{ maxWidth: 820, margin: "0 auto" }}>
      <Heading as="h2">{APP_NAME} – Configuration</Heading>
      <Paragraph>
        Connect this app to your Pexels account by providing an API key. You can
        create and manage your key on the{" "}
        <a
          href="https://www.pexels.com/api/"
          target="_blank"
          rel="noreferrer"
          style={{ color: "#0b63ce" }}
        >
          Pexels API page
        </a>
        .
      </Paragraph>

      <Form style={{ marginTop: "1.5rem" }}>
        <Box marginTop="spacingL">
          <Text
            as="label"
            fontWeight="fontWeightDemiBold"
            style={{ display: "block", marginBottom: 4 }}
          >
            Proxy URL
          </Text>
          <TextInput
            value={proxyUrl}
            onChange={(e) => setProxyUrl(e.target.value)}
            placeholder={DEFAULT_PEXELS_PROXY_URL}
          />
          <Text
            fontSize="fontSizeS"
            fontColor="gray600"
            style={{ marginTop: 4 }}
          >
            A server-side proxy is required to avoid CORS issues when calling
            the Pexels API from the browser.
          </Text>
        </Box>

        <Box
          marginTop="spacingM"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <Switch
            id="proxyHandlesApiKey"
            isChecked={proxyHandlesApiKey}
            onChange={() => setProxyHandlesApiKey(!proxyHandlesApiKey)}
          />
          <Text as="label" htmlFor="proxyHandlesApiKey">
            My proxy handles the API key
          </Text>
        </Box>
        <Text fontSize="fontSizeS" fontColor="gray600" style={{ marginTop: 4 }}>
          Enable this if your proxy already has the Pexels API key configured
          server-side. The app will not send an API key header.
        </Text>

        {!proxyHandlesApiKey && (
          <Box marginTop="spacingM">
            <Text as="label" style={{ display: "block", marginBottom: 4 }}>
              Pexels API key
            </Text>
            <TextInput
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </Box>
        )}

        <Box
          marginTop="spacingL"
          padding="spacingM"
          style={{
            background: "#f7f9fc",
            borderRadius: 4,
            border: "1px solid #d3dce0",
          }}
        >
          <Text fontWeight="fontWeightDemiBold" marginBottom="spacingS">
            Why use a proxy?
          </Text>
          <Paragraph style={{ fontSize: 14 }}>
            The Pexels API does not support CORS, which means browser-based
            requests will be blocked. A proxy makes the request from your server
            and forwards the response to the browser.
          </Paragraph>

          <Text
            fontWeight="fontWeightDemiBold"
            marginTop="spacingM"
            marginBottom="spacingS"
          >
            Setting up your own proxy
          </Text>
          <Paragraph style={{ fontSize: 14 }}>
            For production use, we recommend hosting your own proxy. Here&apos;s
            a minimal example using Next.js API routes:
          </Paragraph>

          <Text
            fontWeight="fontWeightDemiBold"
            marginTop="spacingM"
            marginBottom="spacingXs"
          >
            Option 1: Proxy receives API key from app
          </Text>
          <Paragraph style={{ fontSize: 14 }}>
            The app sends the API key via the <code>x-pexels-api-key</code>{" "}
            header. Your proxy forwards it to Pexels:
          </Paragraph>
          <Box
            marginTop="spacingS"
            padding="spacingS"
            style={{
              background: "#1e293b",
              borderRadius: 4,
              overflowX: "auto",
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: 12,
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
              }}
            >
              {`// app/api/pexels/search/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const apiKey = request.headers.get("x-pexels-api-key");
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const pexelsUrl = new URL("https://api.pexels.com/v1/search");
  searchParams.forEach((value, key) => {
    pexelsUrl.searchParams.set(key, value);
  });

  const response = await fetch(pexelsUrl.toString(), {
    headers: { Authorization: apiKey },
  });

  const data = await response.json();
  return NextResponse.json(data);
}`}
            </pre>
          </Box>

          <Text
            fontWeight="fontWeightDemiBold"
            marginTop="spacingM"
            marginBottom="spacingXs"
          >
            Option 2: Proxy handles API key (recommended for security)
          </Text>
          <Paragraph style={{ fontSize: 14 }}>
            Store the API key server-side (e.g., in environment variables).
            Enable &quot;My proxy handles the API key&quot; toggle above:
          </Paragraph>
          <Box
            marginTop="spacingS"
            padding="spacingS"
            style={{
              background: "#1e293b",
              borderRadius: 4,
              overflowX: "auto",
            }}
          >
            <pre
              style={{
                margin: 0,
                fontSize: 12,
                color: "#e2e8f0",
                whiteSpace: "pre-wrap",
              }}
            >
              {`// app/api/pexels/search/route.ts
import { NextRequest, NextResponse } from "next/server";

const PEXELS_API_KEY = process.env.PEXELS_API_KEY!;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const pexelsUrl = new URL("https://api.pexels.com/v1/search");
  searchParams.forEach((value, key) => {
    pexelsUrl.searchParams.set(key, value);
  });

  const response = await fetch(pexelsUrl.toString(), {
    headers: { Authorization: PEXELS_API_KEY },
  });

  const data = await response.json();
  return NextResponse.json(data);
}`}
            </pre>
          </Box>

          <Note variant="primary" style={{ marginTop: 16 }}>
            <Text fontSize="fontSizeS">
              <strong>Tip:</strong> Option 2 is more secure as the API key never
              leaves your server. It also means editors don&apos;t need access
              to the API key.
            </Text>
          </Note>
        </Box>

        {saving && (
          <Box
            marginTop="spacingM"
            style={{ display: "flex", alignItems: "center" }}
          >
            <Spinner size="small" />
            <Text style={{ marginLeft: "0.5rem" }}>Saving configuration…</Text>
          </Box>
        )}
      </Form>
    </Box>
  );
}

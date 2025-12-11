"use client";

import React from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { locations, type AppExtensionSDK } from "@contentful/app-sdk";
import { APP_NAME } from "../constants";
import ConfigScreen from "../locations/config-screen";
import FormSchemaField from "../locations/field/form-schema-field";
import FormBuilderDialog from "../locations/dialog/form-builder-dialog";
import AppPage from "../locations/app-page";

export default function TheApp() {
  const sdk = useSDK<AppExtensionSDK>();

  let content: React.ReactNode;

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    content = <ConfigScreen />;
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    content = <FormSchemaField />;
  } else if (sdk.location.is(locations.LOCATION_DIALOG)) {
    content = <FormBuilderDialog />;
  } else if (sdk.location.is(locations.LOCATION_PAGE)) {
    content = <AppPage />;
  } else {
    content = (
      <div className="p-4">
        <h2 className="text-xl font-semibold">{APP_NAME}</h2>
        <p className="text-sm text-muted-foreground">
          Contentful Forms app page. See the docs here for schema and
          integration examples.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-gray-50 m-auto my-auto">{content}</div>
  );
}

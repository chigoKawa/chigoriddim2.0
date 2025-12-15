"use client";

import React from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { AppExtensionSDK, locations } from "@contentful/app-sdk";
import ConfigScreen from "../locations/config/config-screen";
import AppPage from "../locations/app-page/app-page";
import GlobalOptionsField from "../locations/field/global-options-field";

export default function TheApp() {
  const sdk = useSDK<AppExtensionSDK>();

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    return <ConfigScreen />;
  }

  if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    return <GlobalOptionsField />;
  }

  return <AppPage />;
}

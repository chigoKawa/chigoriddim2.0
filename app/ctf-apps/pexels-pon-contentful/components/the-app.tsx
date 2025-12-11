"use client";

import React from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { locations, type AppExtensionSDK } from "@contentful/app-sdk";
import { APP_NAME } from "../constants";
import ConfigScreen from "../locations/config-screen";
import PexelsField from "../locations/field/pexels-field";
import PexelsSidebarSummary from "../locations/entry-sidebar/sidebar-summary";
import AppPage from "../locations/app-page";
import PexelsSearchDialog from "../locations/dialog/pexels-search-dialog";

export default function TheApp() {
  const sdk = useSDK<AppExtensionSDK>();

  let content: React.ReactNode;

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    content = <ConfigScreen />;
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    content = <PexelsField />;
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    content = <PexelsSidebarSummary />;
  } else if (sdk.location.is(locations.LOCATION_DIALOG)) {
    content = <PexelsSearchDialog />;
  } else {
    content = (
      <div className="p-4">
        <h2 className="text-xl font-semibold">{APP_NAME}</h2>
        <p className="text-sm text-muted-foreground">
          <AppPage />
        </p>
      </div>
    );
  }

  return (
    <div className="flex p-10 flex-col bg-gray-50 m-auto my-auto">
      {content}
    </div>
  );
}

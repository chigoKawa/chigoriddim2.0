"use client";

import { useMemo } from "react";
import { locations, FieldAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import ConfigScreen from "../locations/config-screen";
import Sidebar from "../locations/sidebar";
import Home from "../locations/home";
import AppPage from "../locations/app-page";

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  //   [locations.LOCATION_ENTRY_FIELD]: Field,
  // [locations.LOCATION_ENTRY_EDITOR]: EntryEditor,
  // [locations.LOCATION_DIALOG]: Dialog,
  [locations.LOCATION_ENTRY_SIDEBAR]: Sidebar,
  [locations.LOCATION_PAGE]: AppPage,
  [locations.LOCATION_HOME]: Home,
};

export default function TheApp() {
  const sdk = useSDK<FieldAppSDK>();
  const Component = useMemo(() => {
    for (const [location, component] of Object.entries(
      ComponentLocationSettings
    )) {
      if (sdk.location.is(location)) {
        return component;
      }
    }
  }, [sdk.location]);

  return Component ? <Component /> : null;
}

"use client";

import { useMemo } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import { locations } from "@contentful/app-sdk";
import { FieldAppSDK } from "@contentful/app-sdk";
import ConfigScreen from "../locations/config-screen";
import Field from "../locations/field";

const ComponentLocationSettings = {
  [locations.LOCATION_APP_CONFIG]: ConfigScreen,
  [locations.LOCATION_ENTRY_FIELD]: Field,
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

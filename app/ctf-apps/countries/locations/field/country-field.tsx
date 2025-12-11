/* eslint-disable @typescript-eslint/no-unused-vars */
import { FieldExtensionSDK } from "@contentful/app-sdk";
import { useEffect, useState } from "react";
import { createClient } from "contentful";
import { COUNTRIES } from "../../constants";
import { FLAG_CDN_BASE } from "../../constants";

/**
 * Simple field extension that lets the editor pick a country.
 * It stores the selected country code (ISO‑2) as a Symbol value.
 */
export default function CountryField({ sdk }: { sdk: FieldExtensionSDK }) {
  const [selected, setSelected] = useState<string>(sdk.field.getValue() || "");

  // Sync SDK value when component mounts
  useEffect(() => {
    const detach = sdk.field.onValueChanged((value) =>
      setSelected(value || "")
    );
    return () => detach();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelected(value);
    sdk.field.setValue(value);
  };

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
      <select value={selected} onChange={handleChange} style={{ flex: 1 }}>
        <option value="">Select a country…</option>
        {COUNTRIES.map((c) => (
          <option key={c.code} value={c.code}>
            {c.name}
          </option>
        ))}
      </select>
      {selected && (
        <img
          src={`${FLAG_CDN_BASE}/${selected.toLowerCase()}.svg`}
          alt="flag"
          style={{ width: "24px", height: "auto" }}
        />
      )}
    </div>
  );
}

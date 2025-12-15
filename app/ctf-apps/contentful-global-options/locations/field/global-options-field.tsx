"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK, useAutoResizer } from "@contentful/react-apps-toolkit";
import {
  Box,
  Button,
  Checkbox,
  Flex,
  Note,
  Select,
  Stack,
  Text,
  TextInput,
} from "@contentful/f36-components";
import type {
  InstanceParameters,
  InstallationParameters,
  KeyValueOptionSet,
  OptionSet,
  StringOptionSet,
} from "../../types";

const isArrayField = (sdk: FieldAppSDK) => sdk.field.type === "Array";

const getOptionSets = (sdk: FieldAppSDK): OptionSet[] => {
  const params = (sdk.parameters.installation || {}) as InstallationParameters;
  return params.optionSets || [];
};

const getInstanceParams = (sdk: FieldAppSDK): InstanceParameters => {
  return (sdk.parameters.instance || {}) as InstanceParameters;
};

const emptyStateStyles: React.CSSProperties = {
  padding: "16px",
  borderRadius: "8px",
  background: "#f4f6f8",
  border: "1px dashed #cfd7e0",
};

const renderOptionLabel = (optionSet: OptionSet, value: string) => {
  if (optionSet.type === "string") return value;
  const entry = (optionSet as KeyValueOptionSet).values.find(
    (kv) => kv.key === value
  );
  return entry?.label || entry?.key || value;
};

type StoredJsonEntry =
  | string
  | {
      key?: string;
      label?: string;
    };

type StoredJsonValue = {
  optionSetId?: string;
  multi?: boolean;
  values?: StoredJsonEntry[];
};

const parseStoredValue = (
  rawValue: unknown,
  {
    isJsonField,
    multiSelect,
  }: {
    isJsonField: boolean;
    multiSelect: boolean;
  }
): string | string[] | undefined => {
  if (isJsonField) {
    if (!rawValue || typeof rawValue !== "object") return undefined;
    const stored = rawValue as StoredJsonValue;
    const values = Array.isArray(stored.values) ? stored.values : [];
    const keys = values
      .map((entry) => {
        if (!entry) return undefined;
        if (typeof entry === "string") return entry;
        if (typeof entry.key === "string") return entry.key;
        return undefined;
      })
      .filter((val): val is string => Boolean(val));
    if (!keys.length) return undefined;
    return multiSelect ? keys : keys[0];
  }

  if (multiSelect) {
    if (Array.isArray(rawValue)) {
      return rawValue.filter(
        (item): item is string => typeof item === "string"
      );
    }
    if (typeof rawValue === "string") return [rawValue];
    return undefined;
  }

  if (Array.isArray(rawValue)) {
    return rawValue.find((item): item is string => typeof item === "string");
  }
  if (typeof rawValue === "string") return rawValue;
  return undefined;
};

const sanitizeSelection = (
  value: string | string[] | undefined
): string | string[] | undefined => {
  if (Array.isArray(value)) {
    const cleaned = value.map((item) => item.trim()).filter(Boolean);
    return cleaned.length ? cleaned : undefined;
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || undefined;
  }
  return undefined;
};

export default function GlobalOptionsField() {
  const sdk = useSDK<FieldAppSDK>();
  const optionSets = useMemo(() => getOptionSets(sdk), [sdk]);
  const instanceParams = useMemo(() => getInstanceParams(sdk), [sdk]);
  const isJsonField = sdk.field.type === "Object";
  useAutoResizer();

  const multiSelect =
    instanceParams.multiSelect !== undefined
      ? instanceParams.multiSelect
      : isArrayField(sdk);

  const [selectedValue, setSelectedValue] = useState<
    string | string[] | undefined
  >(() => parseStoredValue(sdk.field.getValue(), { isJsonField, multiSelect }));
  const [allowCustomValue, setAllowCustomValue] = useState("");

  const selectedSet = useMemo(() => {
    if (!optionSets.length) return undefined;
    const targetId = instanceParams.optionSetId;
    if (targetId) {
      return optionSets.find((set) => set.id === targetId) || optionSets[0];
    }
    return optionSets[0];
  }, [optionSets, instanceParams.optionSetId]);

  const persistValue = useCallback(
    (value: string | string[] | undefined) => {
      const sanitized = sanitizeSelection(value);
      if (!sanitized) {
        sdk.field.removeValue();
        return;
      }

      if (isJsonField) {
        const valuesArray = Array.isArray(sanitized) ? sanitized : [sanitized];
        const payload: StoredJsonValue = {
          optionSetId: selectedSet?.id,
          multi: multiSelect,
          values: valuesArray.map((entry) => ({
            key: entry,
            label: selectedSet ? renderOptionLabel(selectedSet, entry) : entry,
          })),
        };
        sdk.field.setValue(payload);
        return;
      }

      if (multiSelect) {
        const asArray = Array.isArray(sanitized) ? sanitized : [sanitized];
        sdk.field.setValue(asArray);
        return;
      }

      sdk.field.setValue(
        Array.isArray(sanitized) ? sanitized[0] ?? "" : sanitized
      );
    },
    [sdk, isJsonField, multiSelect, selectedSet]
  );

  useEffect(() => {
    const detach = sdk.field.onValueChanged((value) => {
      setSelectedValue(parseStoredValue(value, { isJsonField, multiSelect }));
    });
    return () => detach();
  }, [sdk, isJsonField, multiSelect]);

  useEffect(() => {
    if (!isJsonField) return;
    const current = sdk.field.getValue();
    if (!current) return;
    if (typeof current === "object") return;
    let legacyValue: string | string[] | undefined;
    if (Array.isArray(current)) {
      legacyValue = current.filter(
        (item): item is string => typeof item === "string"
      );
    } else if (typeof current === "string") {
      legacyValue = current;
    }
    if (legacyValue) {
      persistValue(legacyValue);
    } else {
      sdk.field.removeValue();
    }
  }, [sdk, isJsonField, persistValue]);

  const handleSingleChange = useCallback(
    (value: string) => {
      setSelectedValue(value);
      persistValue(value);
    },
    [persistValue]
  );

  const handleMultiToggle = useCallback(
    (value: string) => {
      setSelectedValue((prev) => {
        const current = Array.isArray(prev) ? prev : [];
        const exists = current.includes(value);
        const next = exists
          ? current.filter((item) => item !== value)
          : [...current, value];
        persistValue(next);
        return next.length ? next : undefined;
      });
    },
    [persistValue]
  );

  const handleCustomValueCommit = () => {
    if (!instanceParams.allowCustom || !allowCustomValue.trim()) return;
    if (multiSelect) {
      handleMultiToggle(allowCustomValue.trim());
    } else {
      handleSingleChange(allowCustomValue.trim());
    }
    setAllowCustomValue("");
  };

  if (!optionSets.length) {
    return (
      <Box style={emptyStateStyles}>
        <Text>
          No option sets configured yet. Ask an admin to open the configuration
          screen.
        </Text>
      </Box>
    );
  }

  if (!selectedSet) {
    return (
      <Box style={emptyStateStyles}>
        <Text>
          The option set referenced in instance parameters was not found.
          Double-check.
          <code> optionSetId</code>.
        </Text>
      </Box>
    );
  }

  const options =
    selectedSet.type === "string"
      ? (selectedSet as StringOptionSet).values
      : (selectedSet as KeyValueOptionSet).values.map((item) => item.key);

  return (
    <div className="gap-2">
      <div className="flex flex-col gap-2">
        <Text fontWeight="fontWeightDemiBold">{selectedSet.name}</Text>
        {selectedSet.description && (
          <Text fontColor="gray600">{selectedSet.description}</Text>
        )}
        {multiSelect ? (
          <Stack spacing="spacingS">
            {options.map((value) => (
              <Checkbox
                key={value}
                isChecked={
                  Array.isArray(selectedValue) && selectedValue.includes(value)
                }
                onChange={() => handleMultiToggle(value)}
              >
                {renderOptionLabel(selectedSet, value)}
              </Checkbox>
            ))}
          </Stack>
        ) : (
          <Select
            value={typeof selectedValue === "string" ? selectedValue : ""}
            onChange={(e) => handleSingleChange(e.target.value)}
          >
            <Select.Option value="">Select a value…</Select.Option>
            {options.map((value) => (
              <Select.Option key={value} value={value}>
                {renderOptionLabel(selectedSet, value)}
              </Select.Option>
            ))}
          </Select>
        )}
      </div>

      {instanceParams.allowCustom && (
        <Note variant="primary">
          <Stack spacing="spacingS">
            <Text>Need a custom value? Enter it below.</Text>
            <Flex gap="spacingS">
              <TextInput
                value={allowCustomValue}
                onChange={(e) => setAllowCustomValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleCustomValueCommit();
                  }
                }}
              />
              <Button variant="secondary" onClick={handleCustomValueCommit}>
                Add
              </Button>
            </Flex>
          </Stack>
        </Note>
      )}

      <Text fontSize="fontSizeS" fontColor="gray500">
        Stored value:{" "}
        {Array.isArray(selectedValue)
          ? selectedValue.join(", ") || "Not set"
          : selectedValue || "Not set"}
      </Text>
      <br />
      <br />
    </div>
  );
}

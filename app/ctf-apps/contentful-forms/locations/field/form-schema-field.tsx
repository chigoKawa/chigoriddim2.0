"use client";

import React, { useCallback, useState } from "react";
import {
  Box,
  Button,
  Note,
  Paragraph,
  Text,
  TextInput,
  Select,
  Switch,
} from "@contentful/f36-components";
import type { FieldAppSDK } from "@contentful/app-sdk";
import { useSDK, useAutoResizer } from "@contentful/react-apps-toolkit";
import type {
  FormField,
  FormFieldType,
  FormSchema,
  FormOption,
  ValidationConfig,
  ConditionOperator,
  FieldCondition,
} from "../../types";

/** Convert a label string to camelCase ID (e.g., "Full Name" -> "fullName") */
function labelToId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^[0-9]+/, ""); // Remove leading numbers
}

function createEmptySchema(): FormSchema {
  return {
    version: 1,
    fields: [],
  };
}

function createEmptyField(nextIndex: number): FormField {
  const baseId = `field${nextIndex + 1}`;
  return {
    id: baseId,
    type: "text",
    label: "New field",
    required: false,
  };
}

const FIELD_TYPE_LABELS: Record<FormFieldType, string> = {
  text: "Text (single line)",
  textarea: "Text (multi-line)",
  email: "Email",
  number: "Number",
  select: "Dropdown",
  multiselect: "Dropdown (multi-select)",
  checkbox: "Checkbox (yes/no)",
  "checkbox-group": "Checkboxes (multiple choice)",
  radio: "Radio buttons",
  date: "Date",
};

/** Field types that require options */
const FIELD_TYPES_WITH_OPTIONS: FormFieldType[] = [
  "select",
  "multiselect",
  "checkbox-group",
  "radio",
];

/** Field types that support text length validation */
const FIELD_TYPES_WITH_LENGTH: FormFieldType[] = ["text", "textarea", "email"];

/** Field types that support numeric range validation */
const FIELD_TYPES_WITH_RANGE: FormFieldType[] = ["number"];

/** Condition operator labels */
const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "Equals",
  notEquals: "Does not equal",
  contains: "Contains",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty",
};

export default function FormSchemaField() {
  const sdk = useSDK<FieldAppSDK>();
  useAutoResizer();

  const initialSchema: FormSchema = (() => {
    const raw = sdk.field.getValue();
    if (raw && typeof raw === "object") {
      return raw as FormSchema;
    }
    return createEmptySchema();
  })();

  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    schema.fields[0]?.id ?? null
  );

  const persist = useCallback(
    (next: FormSchema) => {
      setSchema(next);
      sdk.field.setValue(next);
    },
    [sdk.field]
  );

  const handleAddField = useCallback(() => {
    const next = createEmptyField(schema.fields.length);
    const updated: FormSchema = {
      ...schema,
      fields: [...schema.fields, next],
    };
    persist(updated);
    setSelectedFieldId(next.id);
  }, [persist, schema]);

  const handleRemoveField = useCallback(
    (id: string) => {
      const filtered = schema.fields.filter((f) => f.id !== id);
      const updated: FormSchema = { ...schema, fields: filtered };
      persist(updated);
      if (selectedFieldId === id) {
        setSelectedFieldId(filtered[0]?.id ?? null);
      }
    },
    [persist, schema, selectedFieldId]
  );

  const handleMoveField = useCallback(
    (id: string, direction: -1 | 1) => {
      const index = schema.fields.findIndex((f) => f.id === id);
      if (index === -1) return;
      const target = index + direction;
      if (target < 0 || target >= schema.fields.length) return;
      const copy = [...schema.fields];
      const [moved] = copy.splice(index, 1);
      copy.splice(target, 0, moved);
      persist({ ...schema, fields: copy });
    },
    [persist, schema]
  );

  const handleFieldChange = useCallback(
    (id: string, patch: Partial<FormField>) => {
      const copy = schema.fields.map((field) => {
        if (field.id !== id) return field;
        return { ...field, ...patch };
      });

      // If ID was explicitly changed, update selection to follow
      if (patch.id && patch.id !== id) {
        setSelectedFieldId(patch.id);
      }

      persist({ ...schema, fields: copy });
    },
    [persist, schema]
  );

  // Derive ID from label on blur (not on every keystroke)
  const handleLabelBlur = useCallback(
    (id: string, label: string) => {
      const field = schema.fields.find((f) => f.id === id);
      if (!field) return;

      // Only auto-derive if the current ID looks like a default/placeholder
      const isDefaultId = /^field\d+$/.test(field.id) || field.id === "";
      if (!isDefaultId) return;

      const derivedId = labelToId(label);
      if (!derivedId || derivedId === field.id) return;

      // Check uniqueness
      const isUnique = !schema.fields.some(
        (f) => f.id !== id && f.id === derivedId
      );
      if (!isUnique) return;

      const copy = schema.fields.map((f) =>
        f.id === id ? { ...f, id: derivedId } : f
      );
      setSelectedFieldId(derivedId);
      persist({ ...schema, fields: copy });
    },
    [persist, schema]
  );

  const selectedField =
    schema.fields.find((f) => f.id === selectedFieldId) ?? null;

  if (!schema.fields.length) {
    return (
      <Box style={{ minHeight: 200 }}>
        <Note>
          <Text>
            This JSON field stores a form definition. Use the button below to
            add your first field.
          </Text>
        </Note>
        <Box marginTop="spacingM">
          <Button variant="primary" onClick={handleAddField}>
            Add field
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box style={{ minHeight: 400 }}>
      <Paragraph marginBottom="spacingS">
        Define the fields for this form. The configuration will be stored as
        JSON in this field.
      </Paragraph>

      <Box
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 280px) minmax(0, 1fr)",
          gap: 16,
        }}
      >
        <Box
          padding="spacingS"
          style={{
            border: "1px solid #dde2eb",
            borderRadius: 4,
            background: "#f7f9fc",
          }}
        >
          <Box
            marginBottom="spacingS"
            style={{ display: "flex", justifyContent: "space-between" }}
          >
            <Text fontWeight="fontWeightDemiBold">Fields</Text>
            <Button size="small" variant="secondary" onClick={handleAddField}>
              Add field
            </Button>
          </Box>

          {schema.fields.map((field, index) => {
            const isSelected = field.id === selectedFieldId;
            return (
              <Box
                key={field.id}
                padding="spacingXs"
                marginBottom="spacingXs"
                style={{
                  borderRadius: 4,
                  border: isSelected
                    ? "1px solid #2563eb"
                    : "1px solid transparent",
                  backgroundColor: isSelected ? "#e0edff" : "transparent",
                  cursor: "pointer",
                }}
                onClick={() => setSelectedFieldId(field.id)}
              >
                <Box
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 8,
                  }}
                >
                  <Box>
                    <Text fontWeight="fontWeightDemiBold">{field.label}</Text>
                    <Paragraph marginBottom="none" style={{ fontSize: 12 }}>
                      {FIELD_TYPE_LABELS[field.type]}
                      {field.required ? " · Required" : ""}
                    </Paragraph>
                  </Box>
                  <Box style={{ display: "flex", gap: 4 }}>
                    <Button
                      size="small"
                      variant="secondary"
                      isDisabled={index === 0}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveField(field.id, -1);
                      }}
                    >
                      ↑
                    </Button>
                    <Button
                      size="small"
                      variant="secondary"
                      isDisabled={index === schema.fields.length - 1}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMoveField(field.id, 1);
                      }}
                    >
                      ↓
                    </Button>
                    <Button
                      size="small"
                      variant="negative"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveField(field.id);
                      }}
                    >
                      Delete
                    </Button>
                  </Box>
                </Box>
              </Box>
            );
          })}
        </Box>

        <Box
          padding="spacingM"
          style={{
            border: "1px solid #dde2eb",
            borderRadius: 4,
          }}
        >
          {selectedField ? (
            <>
              <Paragraph marginBottom="spacingS">Field configuration</Paragraph>
              <Box marginBottom="spacingS">
                <Text as="label">Label</Text>
                <TextInput
                  value={selectedField.label}
                  onChange={(e) =>
                    handleFieldChange(selectedField.id, {
                      label: e.target.value,
                    })
                  }
                  onBlur={(e) =>
                    handleLabelBlur(selectedField.id, e.target.value)
                  }
                />
              </Box>

              <Box marginBottom="spacingS">
                <Text as="label">Field ID</Text>
                <TextInput
                  value={selectedField.id}
                  onChange={(e) =>
                    handleFieldChange(selectedField.id, {
                      id: e.target.value,
                    })
                  }
                />
                <Paragraph marginBottom="none" style={{ fontSize: 12 }}>
                  Used as the key in the JSON schema and form payload.
                </Paragraph>
              </Box>

              <Box marginBottom="spacingS">
                <Select
                  value={selectedField.type}
                  onChange={(e) =>
                    handleFieldChange(selectedField.id, {
                      type: e.target.value as FormFieldType,
                    })
                  }
                  name="fieldType"
                  id="fieldType"
                >
                  {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                    <Select.Option key={value} value={value}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
              </Box>

              <Box marginBottom="spacingS">
                <Text as="label">Placeholder</Text>
                <TextInput
                  value={selectedField.placeholder ?? ""}
                  onChange={(e) =>
                    handleFieldChange(selectedField.id, {
                      placeholder: e.target.value || undefined,
                    })
                  }
                />
              </Box>

              <Box marginBottom="spacingS">
                <Text as="label">Help text</Text>
                <TextInput
                  value={selectedField.helpText ?? ""}
                  onChange={(e) =>
                    handleFieldChange(selectedField.id, {
                      helpText: e.target.value || undefined,
                    })
                  }
                />
              </Box>

              <Box marginBottom="spacingS">
                <Switch
                  id={`required-${selectedField.id}`}
                  isChecked={selectedField.required}
                  onChange={() =>
                    handleFieldChange(selectedField.id, {
                      required: !selectedField.required,
                    })
                  }
                >
                  Required field
                </Switch>
              </Box>

              {/* Options editor for select, multiselect, radio, checkbox-group */}
              {FIELD_TYPES_WITH_OPTIONS.includes(selectedField.type) && (
                <Box
                  marginTop="spacingM"
                  padding="spacingS"
                  style={{
                    border: "1px solid #dde2eb",
                    borderRadius: 4,
                    background: "#f7f9fc",
                  }}
                >
                  <Text
                    fontWeight="fontWeightDemiBold"
                    marginBottom="spacingXs"
                  >
                    Options
                  </Text>
                  <Paragraph
                    marginBottom="spacingS"
                    style={{ fontSize: 12, opacity: 0.8 }}
                  >
                    Add the choices users can select from.
                  </Paragraph>

                  {(selectedField.options || []).map((opt, idx) => (
                    <Box
                      key={idx}
                      marginBottom="spacingXs"
                      style={{ display: "flex", gap: 8, alignItems: "center" }}
                    >
                      <TextInput
                        placeholder="Label"
                        value={opt.label}
                        onChange={(e) => {
                          const newOptions = [...(selectedField.options || [])];
                          newOptions[idx] = {
                            ...newOptions[idx],
                            label: e.target.value,
                            // Auto-derive value from label if value is empty or matches old label
                            value:
                              !opt.value || opt.value === labelToId(opt.label)
                                ? labelToId(e.target.value)
                                : opt.value,
                          };
                          handleFieldChange(selectedField.id, {
                            options: newOptions,
                          });
                        }}
                        style={{ flex: 1 }}
                      />
                      <TextInput
                        placeholder="Value"
                        value={opt.value}
                        onChange={(e) => {
                          const newOptions = [...(selectedField.options || [])];
                          newOptions[idx] = {
                            ...newOptions[idx],
                            value: e.target.value,
                          };
                          handleFieldChange(selectedField.id, {
                            options: newOptions,
                          });
                        }}
                        style={{ flex: 1 }}
                      />
                      <Button
                        size="small"
                        variant="negative"
                        onClick={() => {
                          const newOptions = (
                            selectedField.options || []
                          ).filter((_, i) => i !== idx);
                          handleFieldChange(selectedField.id, {
                            options: newOptions,
                          });
                        }}
                      >
                        ×
                      </Button>
                    </Box>
                  ))}

                  <Button
                    size="small"
                    variant="secondary"
                    onClick={() => {
                      const newOptions = [
                        ...(selectedField.options || []),
                        { label: "", value: "" } as FormOption,
                      ];
                      handleFieldChange(selectedField.id, {
                        options: newOptions,
                      });
                    }}
                  >
                    Add option
                  </Button>
                </Box>
              )}

              {/* Validation for text fields */}
              {FIELD_TYPES_WITH_LENGTH.includes(selectedField.type) && (
                <Box
                  marginTop="spacingM"
                  padding="spacingS"
                  style={{
                    border: "1px solid #dde2eb",
                    borderRadius: 4,
                    background: "#f7f9fc",
                  }}
                >
                  <Text
                    fontWeight="fontWeightDemiBold"
                    marginBottom="spacingXs"
                  >
                    Validation
                  </Text>
                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <Box>
                      <Text as="label" style={{ fontSize: 12 }}>
                        Min length
                      </Text>
                      <TextInput
                        type="number"
                        min={0}
                        value={
                          selectedField.validation?.minLength?.toString() ?? ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined;
                          handleFieldChange(selectedField.id, {
                            validation: {
                              ...selectedField.validation,
                              minLength: val,
                            } as ValidationConfig,
                          });
                        }}
                      />
                    </Box>
                    <Box>
                      <Text as="label" style={{ fontSize: 12 }}>
                        Max length
                      </Text>
                      <TextInput
                        type="number"
                        min={0}
                        value={
                          selectedField.validation?.maxLength?.toString() ?? ""
                        }
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseInt(e.target.value, 10)
                            : undefined;
                          handleFieldChange(selectedField.id, {
                            validation: {
                              ...selectedField.validation,
                              maxLength: val,
                            } as ValidationConfig,
                          });
                        }}
                      />
                    </Box>
                  </Box>
                  <Box marginTop="spacingS">
                    <Text as="label" style={{ fontSize: 12 }}>
                      Pattern (regex)
                    </Text>
                    <TextInput
                      placeholder="e.g. ^[A-Z].*"
                      value={selectedField.validation?.pattern ?? ""}
                      onChange={(e) => {
                        handleFieldChange(selectedField.id, {
                          validation: {
                            ...selectedField.validation,
                            pattern: e.target.value || undefined,
                          } as ValidationConfig,
                        });
                      }}
                    />
                  </Box>
                </Box>
              )}

              {/* Validation for number fields */}
              {FIELD_TYPES_WITH_RANGE.includes(selectedField.type) && (
                <Box
                  marginTop="spacingM"
                  padding="spacingS"
                  style={{
                    border: "1px solid #dde2eb",
                    borderRadius: 4,
                    background: "#f7f9fc",
                  }}
                >
                  <Text
                    fontWeight="fontWeightDemiBold"
                    marginBottom="spacingXs"
                  >
                    Validation
                  </Text>
                  <Box
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 1fr",
                      gap: 8,
                    }}
                  >
                    <Box>
                      <Text as="label" style={{ fontSize: 12 }}>
                        Min value
                      </Text>
                      <TextInput
                        type="number"
                        value={selectedField.validation?.min?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          handleFieldChange(selectedField.id, {
                            validation: {
                              ...selectedField.validation,
                              min: val,
                            } as ValidationConfig,
                          });
                        }}
                      />
                    </Box>
                    <Box>
                      <Text as="label" style={{ fontSize: 12 }}>
                        Max value
                      </Text>
                      <TextInput
                        type="number"
                        value={selectedField.validation?.max?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          handleFieldChange(selectedField.id, {
                            validation: {
                              ...selectedField.validation,
                              max: val,
                            } as ValidationConfig,
                          });
                        }}
                      />
                    </Box>
                    <Box>
                      <Text as="label" style={{ fontSize: 12 }}>
                        Step
                      </Text>
                      <TextInput
                        type="number"
                        min={0}
                        value={selectedField.validation?.step?.toString() ?? ""}
                        onChange={(e) => {
                          const val = e.target.value
                            ? parseFloat(e.target.value)
                            : undefined;
                          handleFieldChange(selectedField.id, {
                            validation: {
                              ...selectedField.validation,
                              step: val,
                            } as ValidationConfig,
                          });
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Conditional visibility */}
              <Box
                marginTop="spacingM"
                padding="spacingS"
                style={{
                  border: "1px solid #dde2eb",
                  borderRadius: 4,
                  background: "#f7f9fc",
                }}
              >
                <Text fontWeight="fontWeightDemiBold" marginBottom="spacingXs">
                  Conditional visibility
                </Text>
                <Paragraph
                  marginBottom="spacingS"
                  style={{ fontSize: 12, opacity: 0.8 }}
                >
                  Only show this field when another field meets a condition.
                </Paragraph>

                <Switch
                  id={`has-condition-${selectedField.id}`}
                  isChecked={!!selectedField.condition}
                  onChange={() => {
                    if (selectedField.condition) {
                      // Remove condition
                      handleFieldChange(selectedField.id, {
                        condition: undefined,
                      });
                    } else {
                      // Add default condition
                      const otherFields = schema.fields.filter(
                        (f) => f.id !== selectedField.id
                      );
                      if (otherFields.length > 0) {
                        handleFieldChange(selectedField.id, {
                          condition: {
                            fieldId: otherFields[0].id,
                            operator: "equals",
                            value: "",
                          } as FieldCondition,
                        });
                      }
                    }
                  }}
                >
                  Enable condition
                </Switch>

                {selectedField.condition && (
                  <Box marginTop="spacingS">
                    <Box marginBottom="spacingXs">
                      <Text as="label" style={{ fontSize: 12 }}>
                        Show this field when
                      </Text>
                      <Select
                        value={selectedField.condition.fieldId}
                        onChange={(e) => {
                          handleFieldChange(selectedField.id, {
                            condition: {
                              ...selectedField.condition,
                              fieldId: e.target.value,
                            } as FieldCondition,
                          });
                        }}
                      >
                        {schema.fields
                          .filter((f) => f.id !== selectedField.id)
                          .map((f) => (
                            <Select.Option key={f.id} value={f.id}>
                              {f.label} ({f.id})
                            </Select.Option>
                          ))}
                      </Select>
                    </Box>

                    <Box marginBottom="spacingXs">
                      <Select
                        value={selectedField.condition.operator}
                        onChange={(e) => {
                          handleFieldChange(selectedField.id, {
                            condition: {
                              ...selectedField.condition,
                              operator: e.target.value as ConditionOperator,
                            } as FieldCondition,
                          });
                        }}
                      >
                        {Object.entries(CONDITION_OPERATOR_LABELS).map(
                          ([value, label]) => (
                            <Select.Option key={value} value={value}>
                              {label}
                            </Select.Option>
                          )
                        )}
                      </Select>
                    </Box>

                    {selectedField.condition.operator !== "isEmpty" &&
                      selectedField.condition.operator !== "isNotEmpty" && (
                        <Box>
                          <Text as="label" style={{ fontSize: 12 }}>
                            Value
                          </Text>
                          <TextInput
                            value={String(selectedField.condition.value ?? "")}
                            onChange={(e) => {
                              handleFieldChange(selectedField.id, {
                                condition: {
                                  ...selectedField.condition,
                                  value: e.target.value,
                                } as FieldCondition,
                              });
                            }}
                            placeholder="Enter value to match"
                          />
                        </Box>
                      )}
                  </Box>
                )}
              </Box>
            </>
          ) : (
            <Text>Select a field from the list to configure it.</Text>
          )}
        </Box>
      </Box>

      {/* Submit Configuration */}
      <Box
        marginTop="spacingL"
        padding="spacingM"
        style={{ background: "var(--color-gray-100)", borderRadius: 4 }}
      >
        <Text fontWeight="fontWeightDemiBold" marginBottom="spacingS">
          Submit Settings
        </Text>
        <Box marginTop="spacingS">
          <Text fontSize="fontSizeS" fontColor="gray600">
            Button Label
          </Text>
          <TextInput
            value={schema.submit?.label ?? ""}
            onChange={(e) =>
              persist({
                ...schema,
                submit: { ...schema.submit, label: e.target.value },
              })
            }
            placeholder="Submit"
          />
        </Box>
        <Box marginTop="spacingS">
          <Text fontSize="fontSizeS" fontColor="gray600">
            Action URL (optional)
          </Text>
          <TextInput
            value={schema.submit?.action ?? ""}
            onChange={(e) =>
              persist({
                ...schema,
                submit: { ...schema.submit, action: e.target.value },
              })
            }
            placeholder="https://example.com/api/submit"
          />
        </Box>
      </Box>

      {/* Enlarge button */}
      <Box
        marginTop="spacingM"
        style={{ display: "flex", justifyContent: "flex-end" }}
      >
        <Button
          variant="secondary"
          size="small"
          onClick={async () => {
            const result = await sdk.dialogs.openCurrentApp({
              title: "Form Builder",
              width: "fullWidth",
              minHeight: 600,
              shouldCloseOnOverlayClick: true,
              shouldCloseOnEscapePress: true,
              parameters: { schema: JSON.parse(JSON.stringify(schema)) },
            });
            if (result && typeof result === "object") {
              persist(result as FormSchema);
            }
          }}
        >
          Enlarge editor
        </Button>
      </Box>
    </Box>
  );
}

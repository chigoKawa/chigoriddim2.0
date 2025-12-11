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
import type { DialogAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import type {
  FormField,
  FormFieldType,
  FormSchema,
  FormOption,
  ValidationConfig,
  ConditionOperator,
  FieldCondition,
} from "../../types";

/** Convert a label string to camelCase ID */
function labelToId(label: string): string {
  return label
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/[^a-zA-Z0-9]/g, "")
    .replace(/^[0-9]+/, "");
}

function createEmptySchema(): FormSchema {
  return { version: 1, fields: [] };
}

function createEmptyField(nextIndex: number): FormField {
  return {
    id: `field${nextIndex + 1}`,
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

const FIELD_TYPES_WITH_OPTIONS: FormFieldType[] = [
  "select",
  "multiselect",
  "checkbox-group",
  "radio",
];

const FIELD_TYPES_WITH_LENGTH: FormFieldType[] = ["text", "textarea", "email"];
const FIELD_TYPES_WITH_RANGE: FormFieldType[] = ["number"];

const CONDITION_OPERATOR_LABELS: Record<ConditionOperator, string> = {
  equals: "Equals",
  notEquals: "Does not equal",
  contains: "Contains",
  isEmpty: "Is empty",
  isNotEmpty: "Is not empty",
};

interface DialogInvocationParams {
  schema?: FormSchema;
}

export default function FormBuilderDialog() {
  const sdk = useSDK<DialogAppSDK>();
  const invocation = sdk.parameters.invocation as
    | DialogInvocationParams
    | undefined;

  const initialSchema: FormSchema =
    invocation?.schema && typeof invocation.schema === "object"
      ? invocation.schema
      : createEmptySchema();

  const [schema, setSchema] = useState<FormSchema>(initialSchema);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(
    initialSchema.fields[0]?.id ?? null
  );

  const handleAddField = useCallback(() => {
    const next = createEmptyField(schema.fields.length);
    setSchema({ ...schema, fields: [...schema.fields, next] });
    setSelectedFieldId(next.id);
  }, [schema]);

  const handleRemoveField = useCallback(
    (id: string) => {
      const filtered = schema.fields.filter((f) => f.id !== id);
      setSchema({ ...schema, fields: filtered });
      if (selectedFieldId === id) {
        setSelectedFieldId(filtered[0]?.id ?? null);
      }
    },
    [schema, selectedFieldId]
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
      setSchema({ ...schema, fields: copy });
    },
    [schema]
  );

  const handleFieldChange = useCallback(
    (id: string, patch: Partial<FormField>) => {
      const copy = schema.fields.map((field) => {
        if (field.id !== id) return field;
        return { ...field, ...patch };
      });
      if (patch.id && patch.id !== id) {
        setSelectedFieldId(patch.id);
      }
      setSchema({ ...schema, fields: copy });
    },
    [schema]
  );

  const handleLabelBlur = useCallback(
    (id: string, label: string) => {
      const field = schema.fields.find((f) => f.id === id);
      if (!field) return;
      const isDefaultId = /^field\d+$/.test(field.id) || field.id === "";
      if (!isDefaultId) return;
      const derivedId = labelToId(label);
      if (!derivedId || derivedId === field.id) return;
      const isUnique = !schema.fields.some(
        (f) => f.id !== id && f.id === derivedId
      );
      if (!isUnique) return;
      const copy = schema.fields.map((f) =>
        f.id === id ? { ...f, id: derivedId } : f
      );
      setSelectedFieldId(derivedId);
      setSchema({ ...schema, fields: copy });
    },
    [schema]
  );

  const selectedField =
    schema.fields.find((f) => f.id === selectedFieldId) ?? null;

  const handleSave = () => {
    sdk.close(schema);
  };

  const handleCancel = () => {
    sdk.close(null);
  };

  return (
    <Box padding="spacingL" style={{ minHeight: "80vh" }}>
      <Box
        marginBottom="spacingM"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text fontWeight="fontWeightDemiBold" fontSize="fontSizeL">
          Form Builder
        </Text>
        <Box style={{ display: "flex", gap: 8 }}>
          <Button variant="secondary" onClick={handleCancel}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave}>
            Save changes
          </Button>
        </Box>
      </Box>

      {!schema.fields.length ? (
        <Box style={{ minHeight: 300 }}>
          <Note>
            <Text>
              This form has no fields yet. Use the button below to add your
              first field.
            </Text>
          </Note>
          <Box marginTop="spacingM">
            <Button variant="primary" onClick={handleAddField}>
              Add field
            </Button>
          </Box>
        </Box>
      ) : (
        <>
          <Box
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(0, 320px) minmax(0, 1fr)",
              gap: 16,
              minHeight: "70vh",
            }}
          >
            {/* Field list */}
            <Box
              padding="spacingS"
              style={{
                border: "1px solid #dde2eb",
                borderRadius: 4,
                background: "#f7f9fc",
                overflowY: "auto",
              }}
            >
              <Box
                marginBottom="spacingS"
                style={{ display: "flex", justifyContent: "space-between" }}
              >
                <Text fontWeight="fontWeightDemiBold">Fields</Text>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={handleAddField}
                >
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
                        <Text fontWeight="fontWeightDemiBold">
                          {field.label}
                        </Text>
                        <Paragraph marginBottom="none" style={{ fontSize: 12 }}>
                          {FIELD_TYPE_LABELS[field.type]}
                          {field.required ? " · Required" : ""}
                          {field.condition ? " · Conditional" : ""}
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

            {/* Field configuration */}
            <Box
              padding="spacingM"
              style={{
                border: "1px solid #dde2eb",
                borderRadius: 4,
                overflowY: "auto",
              }}
            >
              {selectedField ? (
                <>
                  <Paragraph marginBottom="spacingS">
                    Field configuration
                  </Paragraph>

                  {/* Basic fields */}
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
                  </Box>

                  <Box marginBottom="spacingS">
                    <Select
                      value={selectedField.type}
                      onChange={(e) =>
                        handleFieldChange(selectedField.id, {
                          type: e.target.value as FormFieldType,
                        })
                      }
                    >
                      {Object.entries(FIELD_TYPE_LABELS).map(
                        ([value, label]) => (
                          <Select.Option key={value} value={value}>
                            {label}
                          </Select.Option>
                        )
                      )}
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

                  {/* Options */}
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
                      <Text fontWeight="fontWeightDemiBold">Options</Text>
                      {(selectedField.options || []).map((opt, idx) => (
                        <Box
                          key={idx}
                          marginTop="spacingXs"
                          style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                          }}
                        >
                          <TextInput
                            placeholder="Label"
                            value={opt.label}
                            onChange={(e) => {
                              const newOptions = [
                                ...(selectedField.options || []),
                              ];
                              newOptions[idx] = {
                                ...newOptions[idx],
                                label: e.target.value,
                                value:
                                  !opt.value ||
                                  opt.value === labelToId(opt.label)
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
                              const newOptions = [
                                ...(selectedField.options || []),
                              ];
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
                        style={{ marginTop: 8 }}
                      >
                        Add option
                      </Button>
                    </Box>
                  )}

                  {/* Text validation */}
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
                      <Text fontWeight="fontWeightDemiBold">Validation</Text>
                      <Box
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          marginTop: 8,
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
                              selectedField.validation?.minLength?.toString() ??
                              ""
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
                              selectedField.validation?.maxLength?.toString() ??
                              ""
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

                  {/* Number validation */}
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
                      <Text fontWeight="fontWeightDemiBold">Validation</Text>
                      <Box
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr 1fr",
                          gap: 8,
                          marginTop: 8,
                        }}
                      >
                        <Box>
                          <Text as="label" style={{ fontSize: 12 }}>
                            Min
                          </Text>
                          <TextInput
                            type="number"
                            value={
                              selectedField.validation?.min?.toString() ?? ""
                            }
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
                            Max
                          </Text>
                          <TextInput
                            type="number"
                            value={
                              selectedField.validation?.max?.toString() ?? ""
                            }
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
                            value={
                              selectedField.validation?.step?.toString() ?? ""
                            }
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
                    <Text fontWeight="fontWeightDemiBold">
                      Conditional visibility
                    </Text>
                    <Paragraph style={{ fontSize: 12, opacity: 0.8 }}>
                      Only show this field when another field meets a condition.
                    </Paragraph>

                    <Switch
                      id={`has-condition-${selectedField.id}`}
                      isChecked={!!selectedField.condition}
                      onChange={() => {
                        if (selectedField.condition) {
                          handleFieldChange(selectedField.id, {
                            condition: undefined,
                          });
                        } else {
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
                            Show when
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
                                value={String(
                                  selectedField.condition.value ?? ""
                                )}
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
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
              }}
            >
              <Box>
                <Text fontSize="fontSizeS" fontColor="gray600">
                  Button Label
                </Text>
                <TextInput
                  value={schema.submit?.label ?? ""}
                  onChange={(e) =>
                    setSchema({
                      ...schema,
                      submit: { ...schema.submit, label: e.target.value },
                    })
                  }
                  placeholder="Submit"
                />
              </Box>
              <Box>
                <Text fontSize="fontSizeS" fontColor="gray600">
                  Action URL (optional)
                </Text>
                <TextInput
                  value={schema.submit?.action ?? ""}
                  onChange={(e) =>
                    setSchema({
                      ...schema,
                      submit: { ...schema.submit, action: e.target.value },
                    })
                  }
                  placeholder="https://example.com/api/submit"
                />
              </Box>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}

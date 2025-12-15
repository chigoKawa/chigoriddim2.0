"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { ConfigAppSDK } from "@contentful/app-sdk";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  Box,
  Button,
  Card,
  CopyButton,
  Flex,
  Form,
  FormControl,
  Heading,
  Note,
  Paragraph,
  Select,
  Stack,
  Text,
  TextInput,
} from "@contentful/f36-components";
import { PlusIcon } from "@contentful/f36-icons";
import type {
  InstallationParameters,
  KeyValueOptionSet,
  OptionSet,
  StringOptionSet,
} from "../../types";
import { runInstallation, type InstallStep } from "../../install";

const pageShellStyle: CSSProperties = {
  background: "linear-gradient(180deg, #f8fbff 0%, #f3f5fb 55%, #f6f7fc 100%)",
  minHeight: "100vh",
  padding: "48px 32px 64px",
};

const heroStyle: CSSProperties = {
  background:
    "radial-gradient(circle at 0% 0%, rgba(99, 111, 255, 0.15), transparent 60%), #fff",
  borderRadius: 32,
  padding: "36px 40px",
  border: "1px solid #e0e7ff",
  boxShadow: "0 40px 80px rgba(64, 77, 148, 0.12)",
};

const heroStatStyle: CSSProperties = {
  borderRadius: 20,
  padding: "18px 22px",
  background: "rgba(248, 250, 255, 0.9)",
  border: "1px solid rgba(224, 231, 255, 0.9)",
  minWidth: 220,
  flex: 1,
};

const cardStyle: CSSProperties = {
  width: "100%",
  padding: "32px 36px",
  borderRadius: 28,
  border: "1px solid #e4e9f3",
  boxShadow: "0 30px 60px rgba(15, 23, 42, 0.09)",
  display: "flex",
  flexDirection: "column",
  gap: 28,
};

const metadataGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 20,
};

const stringValuesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  gap: 16,
};

const keyValuesGridStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
  gap: 16,
};

const stringValueRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  alignItems: "center",
  padding: "14px 16px",
  borderRadius: 18,
  border: "1px solid #e6ebf4",
  background: "#f9fbff",
};

const keyValueRowStyle: CSSProperties = {
  display: "flex",
  gap: 12,
  flexWrap: "wrap",
  padding: "18px 16px",
  borderRadius: 18,
  border: "1px solid #e0e7f5",
  background: "#fff",
};

const valuesPanelStyle: CSSProperties = {
  background: "linear-gradient(180deg, #f9fbff 0%, #f1f4fb 100%)",
  borderRadius: 26,
  padding: "24px 24px 28px",
  border: "1px solid #dee5f3",
};

const layoutPillStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 600,
  padding: "6px 12px",
  borderRadius: 999,
  textTransform: "uppercase",
  letterSpacing: 0.4,
  background: "#eef2ff",
  color: "#4b55c8",
};

const typeBadgeStyle: CSSProperties = {
  fontSize: 12,
  fontWeight: 500,
  padding: "4px 10px",
  borderRadius: 999,
  background: "#101828",
  color: "#fff",
};

const DEFAULT_OPTION_SETS: OptionSet[] = [
  {
    id: "buttonVariants",
    name: "Button Variants",
    description: "Primary/secondary/ghost buttons for marketing CTAs",
    type: "string",
    values: ["primary", "secondary", "ghost"],
  },
  {
    id: "toneOfVoice",
    name: "Tone of voice",
    description: "Editorial guidance",
    type: "keyValue",
    values: [
      { key: "heroic", label: "Heroic / big campaign" },
      { key: "practical", label: "Practical feature launch" },
      { key: "playful", label: "Playful social copy" },
    ],
  },
];

const sanitizeSet = (set: OptionSet): OptionSet => {
  if (set.type === "string") {
    return {
      ...set,
      values: (set.values as string[])
        .map((value) => value.trim())
        .filter(Boolean),
    } as StringOptionSet;
  }

  return {
    ...set,
    values: (set.values as KeyValueOptionSet["values"])
      .map(({ key, label }) => ({
        key: key.trim(),
        label: (label || key).trim() || key.trim(),
      }))
      .filter(({ key }) => Boolean(key)),
  } as KeyValueOptionSet;
};

const validateSets = (sets: OptionSet[]) => {
  const issues: string[] = [];
  if (!sets.length) {
    issues.push("Add at least one option set.");
  }

  const ids = new Set<string>();
  for (const set of sets) {
    if (!set.id.trim()) issues.push("Each option set needs an ID.");
    if (!set.name.trim())
      issues.push(`Option set "${set.id}" is missing a name.`);
    if (ids.has(set.id)) issues.push(`Duplicate option set ID "${set.id}".`);
    ids.add(set.id);

    if (set.type === "string") {
      if ((set.values as string[]).length === 0) {
        issues.push(`"${set.name}" needs at least one value.`);
      }
    } else {
      if ((set.values as KeyValueOptionSet["values"]).length === 0) {
        issues.push(`"${set.name}" needs at least one key/value pair.`);
      }
    }
  }

  return issues;
};

type EditableOptionSet = OptionSet;

const ConfigScreen = () => {
  const sdk = useSDK<ConfigAppSDK>();
  const [optionSets, setOptionSets] = useState<EditableOptionSet[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [installStep, setInstallStep] = useState<InstallStep | "idle">("idle");
  const lastParametersRef = useRef<InstallationParameters | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const params =
          ((await sdk.app.getParameters()) as InstallationParameters | null) ||
          (sdk.parameters.installation as InstallationParameters | undefined);
        if (params?.optionSets?.length) {
          setOptionSets(params.optionSets);
        } else {
          setOptionSets(DEFAULT_OPTION_SETS);
        }
      } finally {
        sdk.app.setReady();
      }
    })();

    sdk.app.onConfigurationCompleted(async () => {
      const params =
        lastParametersRef.current ||
        ((await sdk.app.getParameters()) as InstallationParameters | null);
      if (!params) return;

      try {
        setInstalling(true);
        await runInstallation({
          cma: sdk.cma,
          notifier: sdk.notifier,
          environmentId: sdk.ids.environment,
          onProgress: (step) => setInstallStep(step),
        });
      } finally {
        setInstalling(false);
      }
    });
  }, [sdk]);

  const addOptionSet = () =>
    setOptionSets((prev) => [
      ...prev,
      {
        id: `set_${Math.random().toString(36).slice(2, 8)}`,
        name: "New option set",
        description: "",
        type: "string",
        values: [""],
      },
    ]);

  const removeOptionSet = (id: string) =>
    setOptionSets((prev) => prev.filter((set) => set.id !== id));

  const updateOptionSet = (
    id: string,
    updater: (draft: EditableOptionSet) => void
  ) => {
    setOptionSets((prev) =>
      prev.map((set) => {
        if (set.id !== id) return set;
        const cloned = structuredClone(set) as EditableOptionSet;
        updater(cloned);
        return cloned;
      })
    );
  };

  const onConfigure = useCallback<
    NonNullable<Parameters<ConfigAppSDK["app"]["onConfigure"]>[0]>
  >(async () => {
    const sanitized = optionSets.map(sanitizeSet);
    const issues = validateSets(sanitized);
    setErrors(issues);
    if (issues.length > 0) return false;

    const parameters: InstallationParameters = { optionSets: sanitized };
    lastParametersRef.current = parameters;
    setSaving(true);
    const currentState = await sdk.app.getCurrentState();
    setSaving(false);
    return {
      parameters,
      targetState: currentState ?? undefined,
    };
  }, [optionSets, sdk.app]);

  useEffect(() => {
    sdk.app.onConfigure(onConfigure);
  }, [sdk, onConfigure]);

  const optionSetCards = useMemo(
    () =>
      optionSets.map((set) => (
        <Card key={set.id} style={cardStyle}>
          <Flex justifyContent="space-between" alignItems="center">
            <Stack spacing="spacing2Xs">
              <span style={layoutPillStyle}>Option set</span>
              <Heading as="h3" marginBottom="none">
                {set.name || set.id}
              </Heading>
              <Paragraph style={{ color: "#5b6474", margin: 0 }}>
                {set.description || "Describe how editors should use this set."}
              </Paragraph>
            </Stack>
            <Flex alignItems="center" gap="spacingS">
              <span style={typeBadgeStyle}>
                {set.type === "string" ? "String list" : "Key & label"}
              </span>
              <Button
                variant="negative"
                size="small"
                onClick={() => removeOptionSet(set.id)}
              >
                Remove
              </Button>
            </Flex>
          </Flex>

          <div style={metadataGridStyle}>
            <FormControl>
              <FormControl.Label>Display name</FormControl.Label>
              <TextInput
                value={set.name}
                onChange={(e) =>
                  updateOptionSet(set.id, (draft) => {
                    draft.name = e.target.value;
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Reference ID</FormControl.Label>
              <Stack spacing="spacing2Xs">
                <Flex gap="spacingXs" alignItems="center">
                  <TextInput
                    value={set.id}
                    onChange={(e) =>
                      setOptionSets((prev) =>
                        prev.map((optionSet) =>
                          optionSet.id === set.id
                            ? { ...optionSet, id: e.target.value }
                            : optionSet
                        )
                      )
                    }
                    placeholder="snake_case"
                    style={{ flex: 1 }}
                  />
                  <CopyButton
                    value={set.id}
                    tooltipCopiedText="Copied!"
                    label="Copy reference ID"
                    variant="secondary"
                    size="small"
                    isDisabled={!set.id.trim()}
                  />
                </Flex>
              </Stack>
            </FormControl>

            <FormControl>
              <FormControl.Label>Description</FormControl.Label>
              <TextInput
                value={set.description || ""}
                onChange={(e) =>
                  updateOptionSet(set.id, (draft) => {
                    draft.description = e.target.value;
                  })
                }
              />
            </FormControl>

            <FormControl>
              <FormControl.Label>Option type</FormControl.Label>
              <Select
                value={set.type}
                onChange={(e) =>
                  updateOptionSet(set.id, (draft) => {
                    const nextType = e.target.value as OptionSet["type"];
                    if (draft.type !== nextType) {
                      draft.type = nextType;
                      draft.values =
                        nextType === "string" ? [""] : [{ key: "", label: "" }];
                    }
                  })
                }
              >
                <Select.Option value="string">String list</Select.Option>
                <Select.Option value="keyValue">Key & label</Select.Option>
              </Select>
            </FormControl>
          </div>

          <Box style={valuesPanelStyle}>
            <Flex justifyContent="space-between" alignItems="center">
              <Stack spacing="spacing2Xs">
                <Text fontWeight="fontWeightDemiBold">Values</Text>
                <Text fontSize="fontSizeS" fontColor="gray500">
                  {set.type === "string"
                    ? "Editors pick from these chips."
                    : "Store a stable key and show a friendly label."}
                </Text>
              </Stack>
              <Button
                variant="primary"
                size="small"
                startIcon={<PlusIcon />}
                onClick={() =>
                  updateOptionSet(set.id, (draft) => {
                    if (draft.type === "string") {
                      (draft.values as string[]).push("");
                    } else {
                      (draft.values as KeyValueOptionSet["values"]).push({
                        key: "",
                        label: "",
                      });
                    }
                  })
                }
              >
                {set.type === "string" ? "Add value" : "Add option"}
              </Button>
            </Flex>

            <div className="flex flex-col ">
              {set.type === "string" ? (
                <div
                  style={stringValuesGridStyle}
                  className="flex flex-col gap-2  "
                >
                  {(set.values as string[]).map((value, index) => (
                    <div key={`${set.id}-${index}`} style={stringValueRowStyle}>
                      <TextInput
                        value={value}
                        onChange={(e) =>
                          updateOptionSet(set.id, (draft) => {
                            (draft.values as string[])[index] = e.target.value;
                          })
                        }
                        placeholder="e.g. primary"
                      />
                      <Button
                        variant="negative"
                        size="small"
                        onClick={() =>
                          updateOptionSet(set.id, (draft) => {
                            (draft.values as string[]).splice(index, 1);
                          })
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={keyValuesGridStyle} className="flex flex-col gap-2">
                  {(set.values as KeyValueOptionSet["values"]).map(
                    (value, index) => (
                      <div
                        key={`${set.id}-kv-${index}`}
                        style={keyValueRowStyle}
                      >
                        <FormControl style={{ flex: 1 }}>
                          <FormControl.Label>Key</FormControl.Label>
                          <TextInput
                            value={value.key}
                            onChange={(e) =>
                              updateOptionSet(set.id, (draft) => {
                                (draft.values as KeyValueOptionSet["values"])[
                                  index
                                ].key = e.target.value;
                              })
                            }
                            placeholder="heroic"
                          />
                        </FormControl>
                        <FormControl style={{ flex: 1 }}>
                          <FormControl.Label>Label</FormControl.Label>
                          <TextInput
                            value={value.label}
                            onChange={(e) =>
                              updateOptionSet(set.id, (draft) => {
                                (draft.values as KeyValueOptionSet["values"])[
                                  index
                                ].label = e.target.value;
                              })
                            }
                            placeholder="Heroic launch"
                          />
                        </FormControl>
                        <Button
                          variant="negative"
                          size="small"
                          onClick={() =>
                            updateOptionSet(set.id, (draft) => {
                              (
                                draft.values as KeyValueOptionSet["values"]
                              ).splice(index, 1);
                            })
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </Box>
        </Card>
      )),
    [optionSets]
  );

  const stats = useMemo(() => {
    const totalSets = optionSets.length;
    const totalValues = optionSets.reduce((acc, set) => {
      if (set.type === "string") {
        return acc + (set.values as string[]).length;
      }
      return acc + (set.values as KeyValueOptionSet["values"]).length;
    }, 0);
    const keyValueSets = optionSets.filter(
      (set) => set.type === "keyValue"
    ).length;
    const stringSets = totalSets - keyValueSets;
    return { totalSets, totalValues, keyValueSets, stringSets };
  }, [optionSets]);

  return (
    <Box style={pageShellStyle}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        <div style={heroStyle}>
          <Stack spacing="spacingL">
            <Stack spacing="spacingXs">
              <Heading as="h2" marginBottom="none">
                Contentful Global Options
              </Heading>
              <Paragraph style={{ color: "#4b5563", margin: 0 }}>
                Define beautiful, reusable option sets and assign them to
                fields.
              </Paragraph>
            </Stack>

            <Flex gap="spacingL" flexWrap="wrap">
              <div style={heroStatStyle}>
                <Text fontSize="fontSizeS" fontColor="gray600">
                  Option sets
                </Text>
                <Heading as="h3" marginBottom="none">
                  {stats.totalSets}
                </Heading>
              </div>
              <div style={heroStatStyle}>
                <Text fontSize="fontSizeS" fontColor="gray600">
                  Total values
                </Text>
                <Heading as="h3" marginBottom="none">
                  {stats.totalValues}
                </Heading>
              </div>
              <div style={heroStatStyle}>
                <Text fontSize="fontSizeS" fontColor="gray600">
                  Formats
                </Text>
                <Heading as="h3" marginBottom="none">
                  {stats.stringSets} list · {stats.keyValueSets} key/value
                </Heading>
              </div>
            </Flex>
          </Stack>
        </div>

        <Form className="space-y-6" style={{ marginTop: 32 }}>
          <Flex justifyContent="flex-end">
            <Button startIcon={<PlusIcon />} onClick={addOptionSet}>
              Add option set
            </Button>
          </Flex>

          <Box style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {optionSetCards}
          </Box>

          <Box>
            {errors.length > 0 ? (
              <Note variant="negative" title="Fix issues before saving">
                <ul>
                  {errors.map((issue) => (
                    <li key={issue}>
                      <Text>{issue}</Text>
                    </li>
                  ))}
                </ul>
              </Note>
            ) : (
              <Note>
                Use the top-right <strong>Save</strong> button in Contentful to
                store these settings. {saving && "Saving..."}
              </Note>
            )}
          </Box>

          <Box>
            <Note variant={installStep === "done" ? "positive" : "primary"}>
              {installing
                ? "Running install hook…"
                : installStep === "done"
                ? "Install hook completed."
                : "Install hook runs automatically after saving."}
            </Note>
          </Box>
        </Form>
      </div>
    </Box>
  );
};

export default ConfigScreen;

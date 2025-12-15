export type OptionSetType = "string" | "keyValue";

export interface BaseOptionSet {
  id: string;
  name: string;
  description?: string;
  type: OptionSetType;
}

export interface StringOptionSet extends BaseOptionSet {
  type: "string";
  values: string[];
}

export interface KeyValueOptionSet extends BaseOptionSet {
  type: "keyValue";
  values: Array<{ key: string; label: string }>;
}

export type OptionSet = StringOptionSet | KeyValueOptionSet;

export interface InstallationParameters {
  optionSets: OptionSet[];
}

export interface InstanceParameters {
  optionSetId?: string;
  allowCustom?: boolean;
  multiSelect?: boolean;
}

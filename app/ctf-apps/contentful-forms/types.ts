export type FormFieldType =
  | "text"
  | "textarea"
  | "email"
  | "number"
  | "select"
  | "multiselect"
  | "checkbox"
  | "checkbox-group"
  | "radio"
  | "date";

export interface FormOption {
  value: string;
  label: string;
}

export interface ValidationConfig {
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  min?: number;
  max?: number;
  step?: number;
  isEmail?: boolean;
  minSelected?: number;
  maxSelected?: number;
}

export type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "isEmpty"
  | "isNotEmpty";

export interface FieldCondition {
  /** The ID of the field to watch */
  fieldId: string;
  /** The comparison operator */
  operator: ConditionOperator;
  /** The value to compare against (not needed for isEmpty/isNotEmpty) */
  value?: string | number | boolean | string[];
}

export interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FormOption[];
  validation?: ValidationConfig;
  /** Condition that must be met for this field to be shown */
  condition?: FieldCondition;
}

export interface SubmitConfig {
  label?: string;
  method?: "POST";
  action?: string;
}

export interface TrackingConfig {
  eventName?: string;
  meta?: Record<string, unknown>;
}

export interface LayoutSection {
  id: string;
  label: string;
  fieldIds: string[];
}

export interface LayoutConfig {
  columns?: 1 | 2;
  sections?: LayoutSection[];
}

export interface FormSchema {
  version: 1;
  fields: FormField[];
  submit?: SubmitConfig;
  tracking?: TrackingConfig;
  layout?: LayoutConfig;
}

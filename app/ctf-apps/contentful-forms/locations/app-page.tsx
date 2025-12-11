"use client";

import React from "react";
import { APP_NAME } from "../constants";

export default function AppPage() {
  return (
    <div className="p-6 space-y-6 max-w-4xl">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">{APP_NAME}</h1>
        <p className="text-sm text-muted-foreground">
          Model and store form definitions in a JSON field, edit them visually
          in Contentful, and render working forms on your frontend.
        </p>
      </header>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">1. Content model</h2>
        <p className="text-sm text-muted-foreground">
          During installation the app creates or updates a <code>Form</code>
          content type (ID configurable in the config screen) with these fields:
        </p>
        <ul className="list-disc ml-5 text-sm text-muted-foreground space-y-1">
          <li>
            <strong>title</strong> – Short text, required
          </li>
          <li>
            <strong>slug</strong> – Short text, unique (recommended for routing)
          </li>
          <li>
            <strong>description</strong> – Long text, optional
          </li>
          <li>
            <strong>schema</strong> – JSON (Object), required, managed by this
            Form content type with the recommended fields (title, slug,
            description, schema, successMessage, errorMessage).
          </li>
          <li>
            <strong>successMessage</strong> – Short text, optional
          </li>
          <li>
            <strong>errorMessage</strong> – Short text, optional
          </li>
        </ul>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">2. Schema JSON shape</h2>
        <p className="text-sm text-muted-foreground">
          The visual editor writes a <code>FormSchema</code> object into the
          <code>schema</code> field. A simplified version of the shape:
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`type FormFieldType =
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

interface FormOption {
  value: string;
  label: string;
}

interface ValidationConfig {
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

type ConditionOperator =
  | "equals"
  | "notEquals"
  | "contains"
  | "isEmpty"
  | "isNotEmpty";

interface FieldCondition {
  fieldId: string;         // field to watch
  operator: ConditionOperator;
  value?: string | number | boolean | string[];
}

interface FormField {
  id: string;              // payload key
  type: FormFieldType;
  label: string;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: string | number | boolean | string[];
  options?: FormOption[];  // select / radio / checkbox-group
  validation?: ValidationConfig;
  condition?: FieldCondition; // conditional visibility
}

interface SubmitConfig {
  label?: string;          // button label
  method?: "POST";        // usually POST
  action?: string;         // /api/forms/contact or full URL
}

interface TrackingConfig {
  eventName?: string;
  meta?: Record<string, unknown>;
}

interface LayoutSection {
  id: string;
  label: string;
  fieldIds: string[];
}

interface LayoutConfig {
  columns?: 1 | 2;
  sections?: LayoutSection[];
}

interface FormSchema {
  version: 1;
  fields: FormField[];
  submit?: SubmitConfig;
  tracking?: TrackingConfig;
  layout?: LayoutConfig;
}`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          3. Fetching a form from Contentful
        </h2>
        <p className="text-sm text-muted-foreground">
          On your frontend you typically fetch a <code>Form</code> entry by
          <code>slug</code> and read the <code>schema</code> field:
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`// Example with Contentful CDA (REST)
import type { FormSchema } from "./types"; // same shape as above

async function fetchFormBySlug(slug: string) {
  const url =
    "https://cdn.contentful.com/spaces/{SPACE_ID}/environments/{ENV_ID}/entries" +
    "?content_type=form&fields.slug=" + encodeURIComponent(slug);

  const res = await fetch(url, {
    headers: {
      Authorization: "Bearer YOUR_CDA_TOKEN_HERE",
    },
  });

  const json = await res.json();
  const item = json.items?.[0];
  if (!item) return null;

  const schema = item.fields.schema as FormSchema;
  return { entry: item, schema };
}`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          4. Rendering with React Hook Form
        </h2>
        <p className="text-sm text-muted-foreground">
          A minimal example using React Hook Form. It loops over
          <code>schema.fields</code> and renders inputs dynamically.
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`import { useForm } from "react-hook-form";
import type { FormSchema, FormField } from "./types";

interface DynamicFormProps {
  schema: FormSchema;
  onSubmit?: (values: Record<string, unknown>) => void;
}

export function DynamicForm({ schema, onSubmit }: DynamicFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const submitConfig = schema.submit || {
    label: "Submit",
    method: "POST" as const,
  };

  const handle = handleSubmit(async (values) => {
    if (onSubmit) {
      onSubmit(values);
      return;
    }

    if (!submitConfig.action) {
      console.warn("No submit.action configured in form schema");
      return;
    }

    await fetch(submitConfig.action, {
      method: submitConfig.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
  });

  const renderField = (field: FormField) => {
    const common = {
      id: field.id,
      ...register(field.id, { required: field.required || false }),
      placeholder: field.placeholder,
    } as const;

    switch (field.type) {
      case "textarea":
        return <textarea {...common} rows={4} />;
      case "email":
        return <input type="email" {...common} />;
      case "number":
        return <input type="number" {...common} />;
      case "select":
        return (
          <select {...common}>
            <option value="" disabled>
              Select…
            </option>
            {(field.options || []).map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        );
      // Add multiselect / checkbox-group / radio as needed
      default:
        return <input type="text" {...common} />;
    }
  };

  return (
    <form onSubmit={handle}>
      {schema.fields.map((field) => (
        <div key={field.id} style={{ marginBottom: 16 }}>
          <label htmlFor={field.id}>
            {field.label}
            {field.required && " *"}
          </label>
          <div>{renderField(field)}</div>
          {field.helpText && (
            <small style={{ display: "block", opacity: 0.7 }}>
              {field.helpText}
            </small>
          )}
          {errors[field.id] && (
            <div style={{ color: "red", fontSize: 12 }}>This field is required</div>
          )}
        </div>
      ))}

      <button type="submit">
        {submitConfig.label || "Submit"}
      </button>
    </form>
  );
}`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">5. Formik example (short)</h2>
        <p className="text-sm text-muted-foreground">
          The same schema works with Formik; you just map
          <code>schema.fields</code> inside a Formik form.
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`import { Formik, Form, Field, ErrorMessage } from "formik";
import type { FormSchema } from "./types";

function FormikDynamicForm({ schema }: { schema: FormSchema }) {
  const initialValues = Object.fromEntries(
    schema.fields.map((f) => [f.id, f.defaultValue ?? ""]),
  );

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={async (values) => {
        const submit = schema.submit;
        if (!submit?.action) return;
        await fetch(submit.action, {
          method: submit.method || "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
      }}
    >
      <Form>
        {schema.fields.map((field) => (
          <div key={field.id} style={{ marginBottom: 16 }}>
            <label htmlFor={field.id}>{field.label}</label>
            <Field id={field.id} name={field.id} />
            <ErrorMessage name={field.id} component="div" />
          </div>
        ))}
        <button type="submit">Submit</button>
      </Form>
    </Formik>
  );
}`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">6. Bare HTML + fetch</h2>
        <p className="text-sm text-muted-foreground">
          If you don&apos;t use a form library, you can still render fields from
          <code>schema.fields</code> and handle submission with
          <code>fetch</code>.
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`function PlainForm({ schema }: { schema: FormSchema }) {
  const submit = schema.submit;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!submit?.action) return;

    const formData = new FormData(event.currentTarget);
    const payload: Record<string, unknown> = {};
    for (const field of schema.fields) {
      payload[field.id] = formData.get(field.id) ?? null;
    }

    await fetch(submit.action, {
      method: submit.method || "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      {schema.fields.map((field) => (
        <div key={field.id}>
          <label htmlFor={field.id}>{field.label}</label>
          <input
            id={field.id}
            name={field.id}
            placeholder={field.placeholder}
            required={field.required}
          />
        </div>
      ))}
      <button type="submit">{submit?.label || "Submit"}</button>
    </form>
  );
}`}
        </pre>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">
          7. Handling conditional fields
        </h2>
        <p className="text-sm text-muted-foreground">
          Fields can have a <code>condition</code> property that determines when
          they should be shown. Here&apos;s how to evaluate conditions in React
          Hook Form:
        </p>
        <pre className="bg-slate-900 text-slate-100 text-xs p-4 rounded-md overflow-x-auto">
          {`import { useForm, useWatch } from "react-hook-form";
import type { FormSchema, FormField, FieldCondition } from "./types";

// Evaluate if a condition is met
function evaluateCondition(
  condition: FieldCondition,
  watchedValue: unknown
): boolean {
  const { operator, value } = condition;

  switch (operator) {
    case "equals":
      return watchedValue === value;
    case "notEquals":
      return watchedValue !== value;
    case "contains":
      if (typeof watchedValue === "string" && typeof value === "string") {
        return watchedValue.includes(value);
      }
      if (Array.isArray(watchedValue)) {
        return watchedValue.includes(value);
      }
      return false;
    case "isEmpty":
      return !watchedValue || watchedValue === "" ||
        (Array.isArray(watchedValue) && watchedValue.length === 0);
    case "isNotEmpty":
      return !!watchedValue && watchedValue !== "" &&
        !(Array.isArray(watchedValue) && watchedValue.length === 0);
    default:
      return true;
  }
}

export function DynamicFormWithConditions({ schema }: { schema: FormSchema }) {
  const { register, handleSubmit, control } = useForm();

  // Watch all field values for condition evaluation
  const watchedValues = useWatch({ control });

  const shouldShowField = (field: FormField): boolean => {
    if (!field.condition) return true;
    const watchedValue = watchedValues[field.condition.fieldId];
    return evaluateCondition(field.condition, watchedValue);
  };

  return (
    <form onSubmit={handleSubmit(console.log)}>
      {schema.fields.map((field) => {
        // Skip rendering if condition is not met
        if (!shouldShowField(field)) return null;

        return (
          <div key={field.id} style={{ marginBottom: 16 }}>
            <label htmlFor={field.id}>{field.label}</label>
            <input {...register(field.id, { required: field.required })} />
          </div>
        );
      })}
      <button type="submit">Submit</button>
    </form>
  );
}`}
        </pre>
        <p className="text-sm text-muted-foreground">
          <strong>Tip:</strong> When a field is hidden due to a condition, you
          may want to exclude it from validation and submission. Use{" "}
          <code>unregister(field.id)</code> when hiding, or filter hidden fields
          before submitting.
        </p>
      </section>
    </div>
  );
}

"use client";

import React, { useCallback, useMemo, useState } from "react";
import {
  useContentfulInspectorMode,
  useContentfulLiveUpdates,
} from "@contentful/live-preview/react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { toast } from "sonner";
import type {
  IContentfulForm,
  IContentfulFormSchema,
} from "@/features/contentful/type";
import { submitForm } from "@/features/contentful/actions/submit-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

type FormFieldDef = IContentfulFormSchema["fields"][number];
type FieldCondition = NonNullable<FormFieldDef["condition"]>;

/** Evaluate if a condition is met */
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
      return (
        !watchedValue ||
        watchedValue === "" ||
        (Array.isArray(watchedValue) && watchedValue.length === 0)
      );
    case "isNotEmpty":
      return (
        !!watchedValue &&
        watchedValue !== "" &&
        !(Array.isArray(watchedValue) && watchedValue.length === 0)
      );
    default:
      return true;
  }
}

interface ContentfulFormProps {
  entry: IContentfulForm;
}

export default function ContentfulFormRenderer({ entry }: ContentfulFormProps) {
  const live = useContentfulLiveUpdates(entry) || entry;
  const inspectorProps = useContentfulInspectorMode({ entryId: live?.sys?.id });

  // Schema may be directly the object or wrapped in a locale key
  const rawSchema = live?.fields?.schema;
  const schema = (
    rawSchema && typeof rawSchema === "object" && "fields" in rawSchema
      ? rawSchema
      : null
  ) as IContentfulFormSchema | null;

  // Debug: log schema to verify structure
  if (process.env.NODE_ENV === "development" && rawSchema) {
    console.log("[ContentfulForm] Schema:", rawSchema);
    console.log("[ContentfulForm] Submit config:", schema?.submit);
  }

  // Build initial values from schema
  const defaultValues = useMemo(() => {
    if (!schema?.fields) return {};
    return Object.fromEntries(
      schema.fields.map((f) => [f.id, f.defaultValue ?? ""])
    );
  }, [schema]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({ defaultValues });

  // Watch all values for conditional fields
  const watchedValues = useWatch({ control });

  const shouldShowField = useCallback(
    (field: FormFieldDef): boolean => {
      if (!field.condition) return true;
      const watchedValue = watchedValues[field.condition.fieldId];
      return evaluateCondition(field.condition, watchedValue);
    },
    [watchedValues]
  );

  const [submitSuccess, setSubmitSuccess] = useState(false);

  const onSubmit = useCallback(
    async (data: Record<string, unknown>) => {
      const formSlug = (live?.fields?.slug as string) || "unknown-form";

      try {
        const result = await submitForm({
          formSlug,
          data,
          tracking: schema?.tracking,
          submitConfig: schema?.submit,
        });

        // Get messages from entry-level fields
        const successMsg =
          (live?.fields?.successMessage as string) ||
          result.message ||
          "Thank you! Your submission has been received.";
        const errorMsgFromEntry =
          (live?.fields?.errorMessage as string) ||
          "Submission failed. Please try again.";

        if (result.success) {
          toast.success(successMsg);
          setSubmitSuccess(true);
          reset();
        } else {
          const errorMsg = result.message || errorMsgFromEntry;
          toast.error(errorMsg);
        }
      } catch (error) {
        console.error("Form submission error:", error);
        const errorMsg =
          (live?.fields?.errorMessage as string) ||
          (error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again.");
        toast.error(errorMsg);
      }
    },
    [schema, live, reset]
  );

  if (!schema?.fields?.length) {
    return (
      <div
        {...inspectorProps({ fieldId: "schema" })}
        className="rounded-lg border border-dashed border-muted-foreground/30 bg-muted/50 p-6 text-center"
      >
        <p className="text-sm text-muted-foreground">
          No form fields configured. Edit this entry to add fields.
        </p>
      </div>
    );
  }

  const successMessage =
    (live?.fields?.successMessage as string) ||
    "Thank you! Your submission has been received.";

  if (submitSuccess) {
    return (
      <div className="rounded-lg border border-primary/30 bg-primary/10 p-6 text-center">
        <p className="text-lg font-medium text-foreground">{successMessage}</p>
        <Button
          type="button"
          variant="link"
          onClick={() => {
            setSubmitSuccess(false);
            reset();
          }}
          className="mt-4"
        >
          Submit another response
        </Button>
      </div>
    );
  }

  const getValidation = (field: FormFieldDef) => {
    const validation: Record<string, unknown> = {};
    if (field.required) validation.required = `${field.label} is required`;
    if (field.validation?.minLength) {
      validation.minLength = {
        value: field.validation.minLength,
        message: `Minimum ${field.validation.minLength} characters`,
      };
    }
    if (field.validation?.maxLength) {
      validation.maxLength = {
        value: field.validation.maxLength,
        message: `Maximum ${field.validation.maxLength} characters`,
      };
    }
    if (field.validation?.pattern) {
      validation.pattern = {
        value: new RegExp(field.validation.pattern),
        message: "Invalid format",
      };
    }
    if (field.validation?.min !== undefined) {
      validation.min = {
        value: field.validation.min,
        message: `Minimum value is ${field.validation.min}`,
      };
    }
    if (field.validation?.max !== undefined) {
      validation.max = {
        value: field.validation.max,
        message: `Maximum value is ${field.validation.max}`,
      };
    }
    if (field.type === "email" || field.validation?.isEmail) {
      validation.pattern = {
        value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        message: "Please enter a valid email address",
      };
    }
    return validation;
  };

  const renderField = (field: FormFieldDef) => {
    const validation = getValidation(field);

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            id={field.id}
            placeholder={field.placeholder}
            className={cn(
              "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
              "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            )}
            {...register(field.id, validation)}
          />
        );

      case "select":
        return (
          <Controller
            name={field.id}
            control={control}
            rules={validation}
            render={({ field: controllerField }) => (
              <Select
                value={controllerField.value as string}
                onValueChange={controllerField.onChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={field.placeholder || "Select..."} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        );

      case "multiselect":
        return (
          <Controller
            name={field.id}
            control={control}
            rules={validation}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                {field.options?.map((opt) => {
                  const values = Array.isArray(controllerField.value)
                    ? controllerField.value
                    : [];
                  const isChecked = values.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            controllerField.onChange([...values, opt.value]);
                          } else {
                            controllerField.onChange(
                              values.filter((v: string) => v !== opt.value)
                            );
                          }
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            )}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={field.id}
              className="h-4 w-4 rounded border-input accent-primary"
              {...register(field.id, validation)}
            />
            <label htmlFor={field.id} className="text-sm cursor-pointer">
              {field.placeholder || field.label}
            </label>
          </div>
        );

      case "checkbox-group":
        return (
          <Controller
            name={field.id}
            control={control}
            rules={validation}
            render={({ field: controllerField }) => (
              <div className="space-y-2">
                {field.options?.map((opt) => {
                  const values = Array.isArray(controllerField.value)
                    ? controllerField.value
                    : [];
                  const isChecked = values.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      className="flex items-center gap-2 text-sm cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-input accent-primary"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            controllerField.onChange([...values, opt.value]);
                          } else {
                            controllerField.onChange(
                              values.filter((v: string) => v !== opt.value)
                            );
                          }
                        }}
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
            )}
          />
        );

      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((opt) => (
              <label
                key={opt.value}
                className="flex items-center gap-2 text-sm cursor-pointer"
              >
                <input
                  type="radio"
                  value={opt.value}
                  className="h-4 w-4 border-input accent-primary"
                  {...register(field.id, validation)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        );

      case "date":
        return (
          <Input
            type="date"
            id={field.id}
            {...register(field.id, validation)}
          />
        );

      case "number":
        return (
          <Input
            type="number"
            id={field.id}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            step={field.validation?.step}
            {...register(field.id, {
              ...validation,
              valueAsNumber: true,
            })}
          />
        );

      case "email":
        return (
          <Input
            type="email"
            id={field.id}
            placeholder={field.placeholder}
            {...register(field.id, validation)}
          />
        );

      case "text":
      default:
        return (
          <Input
            type="text"
            id={field.id}
            placeholder={field.placeholder}
            {...register(field.id, validation)}
          />
        );
    }
  };

  const columns = schema.layout?.columns ?? 1;
  const gridClass =
    columns === 2 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4";

  return (
    <div {...inspectorProps({ fieldId: "schema" })} className="w-full">
      <form onSubmit={handleSubmit(onSubmit)} className={gridClass}>
        {schema.fields.map((field) => {
          if (!shouldShowField(field)) return null;

          const fieldError = errors[field.id];
          // For checkbox type, label is shown inline
          const showLabel = field.type !== "checkbox";

          return (
            <div key={field.id} className="space-y-1.5">
              {showLabel && (
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-destructive">*</span>
                  )}
                </Label>
              )}

              {renderField(field)}

              {field.helpText && (
                <p className="text-xs text-muted-foreground">
                  {field.helpText}
                </p>
              )}

              {fieldError && (
                <p className="text-xs text-destructive">
                  {fieldError.message as string}
                </p>
              )}
            </div>
          );
        })}

        <div className={columns === 2 ? "md:col-span-2" : ""}>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : schema.submit?.label || "Submit"}
          </Button>
        </div>
      </form>
    </div>
  );
}

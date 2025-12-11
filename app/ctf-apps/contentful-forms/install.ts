/* eslint-disable @typescript-eslint/no-explicit-any */
// Installation helpers for the Contentful Forms app.
// Responsible for creating or updating a configurable Form content type
// in an idempotent way.

export type InstallStep =
  | "creating-content-type"
  | "wiring-editor-interface"
  | "done";

type Notifier = {
  info?: (message: string) => void;
  success?: (message: string) => void;
  error?: (message: string) => void;
};

interface RunInstallationOptions {
  cma: unknown;
  notifier?: Notifier;
  environmentId: string;
  locale?: string;
  formContentTypeId?: string;
  formContentTypeName?: string;
  /** The app definition ID (sdk.ids.app) – used to wire the editor interface. */
  appId?: string;
  onProgress?: (step: InstallStep) => void;
}

export async function runInstallation(options: RunInstallationOptions) {
  const {
    cma,
    notifier,
    environmentId,
    locale = "en-US",
    formContentTypeId = "form",
    formContentTypeName = "Form",
    appId,
    onProgress,
  } = options;

  const client = cma as any;

  const report = (step: InstallStep) => {
    onProgress?.(step);
    notifier?.info?.(`Contentful Forms install: ${step.replace(/-/g, " ")}`);
  };

  const createOrUpdateFormContentType = async () => {
    const fields = [
      {
        id: "title",
        name: "Title",
        type: "Symbol",
        localized: true,
        required: true,
      },
      {
        id: "slug",
        name: "Slug",
        type: "Symbol",
        localized: true,
        required: false,
        validations: [
          {
            unique: true,
          },
        ],
      },
      {
        id: "description",
        name: "Description",
        type: "Text",
        localized: true,
        required: false,
      },
      {
        id: "schema",
        name: "Form schema",
        type: "Object",
        localized: false,
        required: true,
      },
      {
        id: "successMessage",
        name: "Success message",
        type: "Symbol",
        localized: true,
        required: false,
      },
      {
        id: "errorMessage",
        name: "Error message",
        type: "Symbol",
        localized: true,
        required: false,
      },
    ];

    try {
      const existing = await client.contentType.get({
        contentTypeId: formContentTypeId,
        environmentId,
      });
      const existingFields: any[] = Array.isArray(existing.fields)
        ? existing.fields
        : [];
      const missingFields = fields.filter(
        (fieldToEnsure: any) =>
          !existingFields.some(
            (field: any) =>
              field.id === fieldToEnsure.id ||
              field.apiName === fieldToEnsure.id
          )
      );

      if (!missingFields.length) {
        return existing;
      }

      const updated = {
        ...existing,
        fields: [...existingFields, ...missingFields],
      };
      const updatedCt = await client.contentType.update(
        { contentTypeId: formContentTypeId, environmentId },
        updated
      );
      const published = await client.contentType.publish(
        { contentTypeId: formContentTypeId, environmentId },
        updatedCt
      );
      return published;
    } catch (err: unknown) {
      const error: any = err;
      const message = (error && error.message) || "";
      const isNotFound =
        error?.status === 404 ||
        error?.sys?.id === "NotFound" ||
        /could not be found/i.test(message);

      if (!isNotFound) {
        throw err;
      }

      const payload: any = {
        name: formContentTypeName || "Form",
        description: `${
          formContentTypeName || "Form"
        } content type created by the Contentful Forms app.`,
        fields,
        displayField: "title",
      };

      const ct = await client.contentType.createWithId(
        { contentTypeId: formContentTypeId, environmentId },
        payload
      );
      await client.contentType.publish(
        { contentTypeId: formContentTypeId, environmentId },
        ct
      );
      return ct;
    }
  };

  report("creating-content-type");
  await createOrUpdateFormContentType();

  // Wire the editor interface:
  // - schema field uses this app as its editor
  // - slug field uses the built-in slugEditor with title as source
  report("wiring-editor-interface");
  try {
    const editorInterface = await client.editorInterface.get({
      contentTypeId: formContentTypeId,
      environmentId,
    });

    // Start with existing controls, filtering out the ones we'll set
    const existingControls: any[] = Array.isArray(editorInterface.controls)
      ? editorInterface.controls
      : [];

    // Filter out schema and slug controls - we'll add them fresh
    const otherControls = existingControls.filter(
      (c: any) => c?.fieldId !== "schema" && c?.fieldId !== "slug"
    );

    // Build the new controls array
    const newControls = [...otherControls];

    // Always add schema control pointing to this app (if appId provided)
    if (appId) {
      newControls.push({
        fieldId: "schema",
        widgetNamespace: "app",
        widgetId: appId,
      });
    }

    // Always add slug control with slugEditor
    newControls.push({
      fieldId: "slug",
      widgetNamespace: "builtin",
      widgetId: "slugEditor",
      settings: {
        trackingFieldId: "title",
      },
    });

    console.log("Contentful Forms: updating editor interface", {
      formContentTypeId,
      controlCount: newControls.length,
      schemaWidgetId: appId,
      controls: newControls,
    });

    const updateResult = await client.editorInterface.update(
      { contentTypeId: formContentTypeId, environmentId },
      { ...editorInterface, controls: newControls }
    );

    console.log("Contentful Forms: editor interface updated", {
      resultControls: updateResult?.controls,
    });
  } catch (err) {
    console.error("Contentful Forms: failed to wire editor interface", err);
    // Non-fatal; content type is still created.
  }

  report("done");
  notifier?.success?.(
    `Form content type "${formContentTypeId}" is ready in environment ${environmentId}.`
  );
}

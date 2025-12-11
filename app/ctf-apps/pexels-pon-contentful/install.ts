// Installation helpers for the Pexels Pon Contentful app.
// For now this is a no-op scaffold; content model can be added later.

export type InstallStep = "initializing" | "done";

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
  onProgress?: (step: InstallStep) => void;
}

export async function runInstallation(options: RunInstallationOptions) {
  const { notifier, environmentId, onProgress } = options;

  onProgress?.("initializing");
  notifier?.info?.(
    `Pexels Pon Contentful install scaffold running in environment ${environmentId}.`
  );

  // No content model changes yet; this is just a scaffold.

  onProgress?.("done");
  notifier?.success?.(
    `Pexels Pon Contentful install scaffold completed in environment ${environmentId}.`
  );
}

export type InstallStep = "validating" | "done";

interface RunInstallationOptions {
  cma: unknown;
  notifier?: {
    info?: (msg: string) => void;
    success?: (msg: string) => void;
  };
  environmentId: string;
  onProgress?: (step: InstallStep) => void;
}

/**
 * Placeholder installer. The MVP only validates config and
 * leaves CMA automation for a future iteration.
 */
export async function runInstallation({
  notifier,
  environmentId,
  onProgress,
}: RunInstallationOptions) {
  onProgress?.("validating");
  notifier?.info?.(
    `Contentful Global Options: no CMA tasks to run in ${environmentId}.`
  );
  onProgress?.("done");
  notifier?.success?.("Contentful Global Options ready to use.");
}

"use client";
import { ReactNode, useEffect, useState, Suspense } from "react";
import {
  NinetailedProvider,
  useNinetailed,
} from "@ninetailed/experience.js-react";
import { usePathname, useSearchParams } from "next/navigation";
import { NinetailedInsightsPlugin } from "@ninetailed/experience.js-plugin-insights";
import { NinetailedPreviewPlugin } from "@ninetailed/experience.js-plugin-preview";
import {
  loadPreviewData,
  type PreviewData,
} from "@/features/personalization/preview-loader";

type Props = { children: ReactNode; preview: boolean };

// Check if Ninetailed is disabled via environment variable
const isNinetailedDisabled =
  process.env.NEXT_PUBLIC_NINETAILED_DISABLED === "true";

function PageEventOnMount() {
  const { page } = useNinetailed();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Skip if Ninetailed is disabled
    if (isNinetailedDisabled) return;
    // fire a page event so the profile is up to date
    // Using schema-less call to avoid validation errors until payload is confirmed
    page?.({ path: pathname });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pathname, searchParams?.toString()]);
  return null;
}

export default function AppProviders({ children, preview }: Props) {
  const [experiences, setExperiences] = useState<unknown[]>([]);
  const [audiences, setAudiences] = useState<unknown[]>([]);
  const [previewLoading, setPreviewLoading] = useState(
    !isNinetailedDisabled && process.env.NODE_ENV !== "production"
  );

  useEffect(() => {
    // Skip Ninetailed data loading if disabled
    if (isNinetailedDisabled) return;
    if (process.env.NODE_ENV === "production") return;
    let mounted = true;

    // In dev/non-production, always enable draft mode for Ninetailed preview loader
    loadPreviewData(true)
      .then((data: PreviewData) => {
        if (!mounted) return;
        setExperiences(data.experiences || []);
        setAudiences(data.audiences || []);
        setPreviewLoading(false);
      })
      .catch(() => {
        // dev-only helper; ignore errors
        setPreviewLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // If Ninetailed is disabled, render children without the provider
  if (isNinetailedDisabled) {
    return <>{children}</>;
  }

  // Avoid tight coupling to provider's internal plugin types; cast at usage site
  const plugins: unknown[] = [new NinetailedInsightsPlugin()];
  if (preview) {
    plugins.push(
      new NinetailedPreviewPlugin({
        experiences: experiences as never,
        audiences: audiences as never,
      })
    );
  }

  // Dev-only: block initial render until preview data is ready to avoid empty sidebar
  if (process.env.NODE_ENV !== "production" && previewLoading) {
    return null;
  }

  return (
    <NinetailedProvider
      key={
        process.env.NODE_ENV !== "production"
          ? `nt-${experiences.length}-${audiences.length}`
          : undefined
      }
      clientId={process.env.NEXT_PUBLIC_NINETAILED_CLIENT_ID as string}
      environment={process.env.NEXT_PUBLIC_NINETAILED_ENVIRONMENT}
      // @ts-expect-error The provider's plugin prop types vary by package version; this array is correct at runtime.
      plugins={plugins}
      componentViewTrackingThreshold={2000}
      useSDKEvaluation={true}
    >
      <Suspense fallback={null}>
        <PageEventOnMount />
      </Suspense>
      {children}
    </NinetailedProvider>
  );
}

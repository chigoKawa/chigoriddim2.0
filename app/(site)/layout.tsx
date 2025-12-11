// import NavBar from "@/features/layout/nav-bar";
import Footer from "@/features/layout/footer";
import AppProviders from "@/features/app-providers";
import ResponsiveNavbar from "@/features/layout/responsive-nav";
import LivePreviewProviderWrapper from "@/features/contentful/live-preview-provider-wrapper";
import { ThemeProvider } from "@/features/theme-provider/theme-provider";
import { getThemeEntry } from "@/features/theme-provider/lib/contentful";
import {
  getThemeJsonFromEntry,
  buildInitialCss,
} from "@/features/theme-provider/lib/theme-utils";
import { draftMode } from "next/headers";
import { PreviewWarningsProvider } from "@/features/contentful/preview-warnings-context";
import PreviewWarningsToggle from "@/features/contentful/preview-warnings-toggle";
import { getMainNavigation } from "@/features/navigation/getMainNavigation";
import { getFooterNavigation } from "@/features/navigation/getFooterNavigation";
import { getSocialLinks } from "@/features/navigation/getSocialLinks";

export default async function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = "en-US";
  const { isEnabled: preview } = await draftMode();
  const entry = await getThemeEntry(preview);
  const initialCss = buildInitialCss(getThemeJsonFromEntry(entry, locale));
  const navItems = await getMainNavigation(locale, preview);
  const footerData = await getFooterNavigation(locale, preview);
  const socialLinks = await getSocialLinks(locale, preview);

  return (
    <AppProviders preview={preview}>
      <style id="theme-vars" dangerouslySetInnerHTML={{ __html: initialCss }} />
      <PreviewWarningsProvider>
        <LivePreviewProviderWrapper locale={locale} isPreviewEnabled={preview}>
          <ThemeProvider initialEntry={entry} preview={preview} locale={locale}>
            {preview ? (
              <div className="w-full bg-amber-500 text-amber-950 dark:text-amber-50 text-xs sm:text-sm py-2 px-4 text-center z-50 flex flex-col items-center gap-1 sm:flex-row sm:justify-center">
                <span>
                  You are in preview mode. Content is loaded from the Contentful
                  Preview API and may include unpublished changes. For frame
                  layout or page composition changes, use the Contentful preview
                  reload button to see updates reflected.
                </span>
                <PreviewWarningsToggle />
              </div>
            ) : null}
            <ResponsiveNavbar items={navItems.items} />
            {/* <NavBar /> */}

            <div style={{ padding: 0 }}>
              {children}
              {/* <ThemePreview /> */}
              {/* <ThemePage /> */}
            </div>
            <Footer
              sections={footerData.sections}
              socialLinks={socialLinks}
              siteName={footerData.siteName}
            />
          </ThemeProvider>
        </LivePreviewProviderWrapper>
      </PreviewWarningsProvider>
    </AppProviders>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import {
  locations,
  type AppExtensionSDK,
  type FieldAppSDK,
} from "@contentful/app-sdk";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { APP_NAME, COUNTRIES, FLAG_CDN_BASE } from "../constants";
import { runInstallation, type InstallStep } from "../install";
import CountryRow from "./country-row";
import ConfigScreen from "../locations/config-screen";
import StatsSidebar from "../locations/entry-sidebar/stats-sidebar";
import CountryField from "../locations/field/country-field";

export default function TheApp() {
  const sdk = useSDK<AppExtensionSDK>();
  const [includeCurrency, setIncludeCurrency] = useState(true);
  const [includeStates, setIncludeStates] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<InstallStep | "idle">("idle");
  const [loadingStats, setLoadingStats] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [countryCount, setCountryCount] = useState(0);
  const [currencyCount, setCurrencyCount] = useState(0);
  const [statsError, setStatsError] = useState<string | null>(null);

  const handleInstall = async () => {
    try {
      setLoading(true);
      const environmentId = sdk.ids.environment;
      const params = sdk.parameters.installation as
        | {
            countryContentTypeId?: string;
            currencyContentTypeId?: string;
            stateContentTypeId?: string;
            maxCountries?: number;
          }
        | undefined;
      await runInstallation({
        cma: sdk.cma,
        notifier: sdk.notifier,
        environmentId,
        locale: sdk.locales.default,
        includeStates,
        includeCurrency,
        countryContentTypeId: params?.countryContentTypeId,
        currencyContentTypeId: params?.currencyContentTypeId,
        stateContentTypeId: params?.stateContentTypeId,
        maxCountries: params?.maxCountries,
        onProgress: (s: InstallStep) => setStep(s),
      });
      sdk.notifier.success("Countries data installed successfully");
    } catch (err) {
      console.error(err);
      sdk.notifier.error("Installation failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStep("idle");
  }, []);

  // Load basic stats for the default view
  useEffect(() => {
    let cancelled = false;

    async function loadStats() {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const params = (sdk.parameters.installation || {}) as {
          countryContentTypeId?: string;
          currencyContentTypeId?: string;
        };
        const countryContentTypeId = params.countryContentTypeId || "country";
        const currencyContentTypeId =
          params.currencyContentTypeId || "currency";
        const environmentId = sdk.ids.environment;

        const [countriesRes, currenciesRes] = await Promise.all([
          sdk.cma.entry.getMany({
            environmentId,
            query: { content_type: countryContentTypeId, limit: 1000 },
          }),
          sdk.cma.entry.getMany({
            environmentId,
            query: { content_type: currencyContentTypeId, limit: 1000 },
          }),
        ]);

        if (cancelled) return;
        const countriesItems =
          (countriesRes as any).items ?? (countriesRes as any);
        const currenciesItems =
          (currenciesRes as any).items ?? (currenciesRes as any);
        setCountryCount(countriesItems?.length || 0);
        setCurrencyCount(currenciesItems?.length || 0);
      } catch (err: any) {
        if (!cancelled) {
          setStatsError(err?.message || "Failed to load stats.");
        }
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    }

    loadStats();
    return () => {
      cancelled = true;
    };
  }, [sdk]);

  const handleSyncMissing = async () => {
    setSyncing(true);
    setStatsError(null);
    try {
      const params = (sdk.parameters.installation || {}) as {
        countryContentTypeId?: string;
        currencyContentTypeId?: string;
      };
      const countryContentTypeId = params.countryContentTypeId || "country";
      const currencyContentTypeId = params.currencyContentTypeId || "currency";
      const environmentId = sdk.ids.environment;
      const locale = sdk.locales.default;

      const [countriesRes, currenciesRes] = await Promise.all([
        sdk.cma.entry.getMany({
          environmentId,
          query: { content_type: countryContentTypeId, limit: 1000 },
        }),
        sdk.cma.entry.getMany({
          environmentId,
          query: { content_type: currencyContentTypeId, limit: 1000 },
        }),
      ]);
      const countriesItems =
        (countriesRes as any).items ?? (countriesRes as any);
      const currenciesItems =
        (currenciesRes as any).items ?? (currenciesRes as any);

      const existingCountryCodes = new Set<string>();
      for (const entry of countriesItems || []) {
        const codeVal = entry.fields?.code?.[locale];
        if (typeof codeVal === "string") existingCountryCodes.add(codeVal);
      }

      const existingCurrencyCodes = new Set<string>();
      for (const entry of currenciesItems || []) {
        const codeVal = entry.fields?.code?.[locale];
        if (typeof codeVal === "string") existingCurrencyCodes.add(codeVal);
      }

      const allCurrencyCodes = Array.from(
        new Set(COUNTRIES.map((c) => c.currency.code).filter(Boolean))
      );
      const missingCurrencies = allCurrencyCodes.filter(
        (code) => !existingCurrencyCodes.has(code)
      );

      const missingCountries = COUNTRIES.filter(
        (c) => !existingCountryCodes.has(c.code)
      );

      // Create missing currencies
      for (const code of missingCurrencies) {
        const entryId = `currency-${code}`;
        try {
          const entry = await sdk.cma.entry.createWithId(
            { entryId, contentTypeId: currencyContentTypeId, environmentId },
            {
              fields: {
                code: { [locale]: code },
                symbol: { [locale]: code },
                name: { [locale]: code },
              },
            }
          );
          await sdk.cma.entry.publish(
            { entryId: entry.sys.id, environmentId },
            entry
          );
        } catch (err: any) {
          if (err?.status !== 409) throw err;
        }
      }

      // Create missing countries
      for (const c of missingCountries) {
        const entryId = `country-${c.code}`;
        const entryData: any = {
          fields: {
            name: { [locale]: c.name },
            code: { [locale]: c.code },
            status: { [locale]: c.status },
            flagUrl: {
              [locale]: `${FLAG_CDN_BASE}/${c.code.toLowerCase()}.svg`,
            },
          },
        };

        if (c.currency?.code) {
          entryData.fields.currency = {
            [locale]: {
              sys: {
                type: "Link",
                linkType: "Entry",
                id: `currency-${c.currency.code}`,
              },
            },
          };
        }

        try {
          const entry = await sdk.cma.entry.createWithId(
            { entryId, contentTypeId: countryContentTypeId, environmentId },
            entryData
          );
          await sdk.cma.entry.publish(
            { entryId: entry.sys.id, environmentId },
            entry
          );
        } catch (err: any) {
          if (err?.status !== 409) throw err;
        }
      }

      sdk.notifier.success(
        `Sync complete. Created ${missingCountries.length} new countries and ${missingCurrencies.length} new currencies.`
      );

      // Refresh stats after sync
      const [newCountriesRes, newCurrenciesRes] = await Promise.all([
        sdk.cma.entry.getMany({
          environmentId,
          query: { content_type: countryContentTypeId, limit: 1000 },
        }),
        sdk.cma.entry.getMany({
          environmentId,
          query: { content_type: currencyContentTypeId, limit: 1000 },
        }),
      ]);
      const newCountriesItems =
        (newCountriesRes as any).items ?? (newCountriesRes as any);
      const newCurrenciesItems =
        (newCurrenciesRes as any).items ?? (newCurrenciesRes as any);
      setCountryCount(newCountriesItems?.length || 0);
      setCurrencyCount(newCurrenciesItems?.length || 0);
    } catch (err: any) {
      setStatsError(err?.message || "Sync failed.");
      sdk.notifier.error("Sync failed. Check browser console for details.");

      console.error("Countries sync failed", err);
    } finally {
      setSyncing(false);
    }
  };

  // ========= Location routing =========
  let content: React.ReactNode;

  if (sdk.location.is(locations.LOCATION_APP_CONFIG)) {
    content = <ConfigScreen />;
  } else if (sdk.location.is(locations.LOCATION_ENTRY_SIDEBAR)) {
    content = <StatsSidebar />;
  } else if (sdk.location.is(locations.LOCATION_ENTRY_FIELD)) {
    const fieldSdk = sdk as unknown as FieldAppSDK;
    content = <CountryField sdk={fieldSdk} />;
  } else {
    content = (
      <div className="p-4 py-10 bg-gray-100 rounded-md shadow h-full space-y-4 max-w-3xl mx-auto text-centerx">
        <div className="my-auto flex flex-col space-y-4 items-centerx justify-center justify-items-center ">
          <div className="">
            <h2 className="text-xl font-semibold">{APP_NAME}</h2>
          </div>
          <div className="">
            <div className="flex  space-x-4">
              <label className="flex items-center space-x-2">
                <Switch
                  checked={includeCurrency}
                  onCheckedChange={setIncludeCurrency}
                />
                <span>Add Currency data</span>
              </label>
              <label className="flex items-center space-x-2">
                <Switch
                  checked={includeStates}
                  onCheckedChange={setIncludeStates}
                />
                <span>Add State/Province data</span>
              </label>
              <Button onClick={handleInstall} disabled={loading}>
                {loading ? "Installing…" : "Populate Contentful"}
              </Button>
            </div>
          </div>
          <div className="">
            <p className="text-sm text-muted-foreground">
              {step === "idle" && "Ready to install countries into this space."}
              {step === "creating-content-types" && "Creating content types..."}
              {step === "creating-countries" && "Creating country entries..."}
              {step === "creating-currencies" && "Creating currency entries..."}
              {step === "creating-states" &&
                "Creating state/province entries..."}
              {step === "done" &&
                "Installation run completed. You can re-run it safely to refresh data."}
            </p>
          </div>
          <div className="">
            {step === "done" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {COUNTRIES.map((c) => (
                  <CountryRow
                    key={c.code}
                    country={c}
                    showCurrency={includeCurrency}
                  />
                ))}
              </div>
            )}
          </div>
          <div className="">
            <div className="mt-10 space-y-2">
              <h3 className="font-semibold">Data status</h3>
              {loadingStats ? (
                <p className="text-sm text-muted-foreground">Loading stats…</p>
              ) : (
                <>
                  {statsError && (
                    <p className="text-sm text-red-600">{statsError}</p>
                  )}
                  <p className="text-sm">
                    Countries in space: {countryCount} / {COUNTRIES.length}
                  </p>
                  <p className="text-sm">
                    Currencies in space: {currencyCount} /{" "}
                    {
                      Array.from(
                        new Set(
                          COUNTRIES.map((c) => c.currency.code).filter(Boolean)
                        )
                      ).length
                    }
                  </p>
                  <Button
                    className="mt-2"
                    onClick={handleSyncMissing}
                    disabled={loadingStats || syncing}
                  >
                    {syncing ? "Syncing…" : "Sync missing entries"}
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex p-10 flex-col bg-gray-50  m-auto my-auto ">
      {content}
    </div>
  );
}

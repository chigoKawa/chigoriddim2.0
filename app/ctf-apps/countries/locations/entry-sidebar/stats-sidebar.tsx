import { useEffect, useState } from "react";
import { useSDK } from "@contentful/react-apps-toolkit";
import type { SidebarAppSDK } from "@contentful/app-sdk";
import { FLAG_CDN_BASE } from "../../constants";

/**
 * Sidebar extension that shows a quick overview of the Country entries.
 */
export default function StatsSidebar() {
  const sdk = useSDK<SidebarAppSDK>();
  const [countries, setCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const params = sdk.parameters.installation as
          | { countryContentTypeId?: string }
          | undefined;
        const countryContentTypeId = params?.countryContentTypeId || "country";
        const res = await sdk.cma.entry.getMany({
          environmentId: sdk.ids.environment,
          query: {
            content_type: countryContentTypeId,
            limit: 500,
          },
        });
        const items = (res as any).items ?? res;
        if (!cancelled) {
          setCountries(items || []);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setCountries([]);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [sdk]);

  if (loading) return <p>Loading stats…</p>;

  const total = countries.length;
  const withCurrency = countries.filter((c) => c.fields.currency).length;

  return (
    <div style={{ padding: "1rem" }}>
      <h3>Country Stats</h3>
      <ul>
        <li>Total countries: {total}</li>
        <li>With currency: {withCurrency}</li>
        <li>Without currency: {total - withCurrency}</li>
      </ul>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "4px",
          marginTop: "1rem",
        }}
      >
        {countries.map((c) => {
          const locale = sdk.locales.default;
          const code = c.fields.code?.[locale] || "";
          const name = c.fields.name?.[locale] || "";
          return (
            <img
              key={c.sys.id}
              src={`${FLAG_CDN_BASE}/${String(code).toLowerCase()}.svg`}
              alt={name}
              style={{ width: "100%", height: "auto" }}
            />
          );
        })}
      </div>
    </div>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Locale, getI18nConfig } from "@/i18n-config";
import { toFlag } from "cf-emoji";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LocaleSwitcher = () => {
  const [locales, setLocales] = useState<Locale[]>([]);
  const [defaultLocale, setDefaultLocale] = useState<Locale>("en-US" as Locale);
  const [selectedLocale, setSelectedLocale] = useState<Locale>(
    "en-US" as Locale
  );

  const pathname = usePathname();
  const router = useRouter();

  const getFlag = (locale: string) => {
    const country = locale.split("-")[1] ?? locale;
    return toFlag(country);
  };

  const redirectedPathname = (nextLocale: Locale) => {
    if (!pathname) return "/";

    const segments = pathname.split("/").filter(Boolean);
    const isPrefixed =
      segments.length > 0 && locales.includes(segments[0] as Locale);

    // Default locale → clean URL (no prefix)
    if (nextLocale === defaultLocale) {
      if (isPrefixed) {
        const rest = segments.slice(1);
        return `/${rest.join("/")}` || "/";
      }
      return pathname;
    }

    // Non-default locale → add or replace prefix
    if (isPrefixed) {
      segments[0] = nextLocale;
    } else {
      segments.unshift(nextLocale);
    }

    return `/${segments.join("/")}`;
  };

  const onSelectionChange = (locale: string) => {
    const next = locale as Locale;
    router.push(redirectedPathname(next));
    setSelectedLocale(next);
  };

  // Fetch i18n config once on mount
  useEffect(() => {
    const init = async () => {
      const config = await getI18nConfig();
      setLocales(config.locales);
      setDefaultLocale(config.defaultLocale);

      if (!pathname) return;

      const seg = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
      const current =
        seg && config.locales.includes(seg) ? seg : config.defaultLocale;

      setSelectedLocale(current);
    };

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally run only on mount

  // Sync selected locale with pathname when navigation occurs
  useEffect(() => {
    if (!pathname || locales.length === 0) return;

    const seg = pathname.split("/").filter(Boolean)[0] as Locale | undefined;
    const current = seg && locales.includes(seg) ? seg : defaultLocale;
    setSelectedLocale(current);
  }, [pathname, locales, defaultLocale]); // These dependencies are correct

  return (
    <div>
      <Select onValueChange={onSelectionChange} value={selectedLocale}>
        <SelectTrigger className="w-full text-white font-bold">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Locale</SelectLabel>

            {locales.map((locale) => (
              <SelectItem key={locale} value={locale}>
                <span className="uppercase flex gap-2 items-center">
                  {locale} <span>{getFlag(locale)}</span>
                </span>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LocaleSwitcher;

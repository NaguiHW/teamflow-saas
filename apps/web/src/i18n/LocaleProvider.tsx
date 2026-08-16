"use client";

import { NextIntlClientProvider } from "next-intl";
import { createContext, useContext, useEffect, useState } from "react";
import { messages, type Locale } from "./messages";

type LocaleContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

const LocaleProvider = ({
  children,
}: Readonly<{ children: React.ReactNode }>) => {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const storedLocale = window.localStorage.getItem("teamflow-locale");
    if (storedLocale === "en" || storedLocale === "es")
      setLocaleState(storedLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = (nextLocale: Locale) => {
    setLocaleState(nextLocale);
    window.localStorage.setItem("teamflow-locale", nextLocale);
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider
        locale={locale}
        messages={messages[locale]}
        timeZone="America/Panama"
      >
        {children}
      </NextIntlClientProvider>
    </LocaleContext.Provider>
  );
};

export const useLocalePreference = () => {
  const value = useContext(LocaleContext);
  if (!value)
    throw new Error("useLocalePreference must be used within LocaleProvider");
  return value;
};

export default LocaleProvider;

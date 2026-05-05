"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Language } from "@/lib/types";

const LANG_STORAGE_KEY = "shopping-cart-language";

interface LocaleContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  toggleLanguage: () => void;
}

const LocaleContext = createContext<LocaleContextValue | undefined>(undefined);

export function LocaleProvider({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  const [language, setLanguageState] = useState<Language>("th");

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (storedLanguage === "en" || storedLanguage === "th") {
      setLanguageState(storedLanguage);
    }
  }, []);

  const setLanguage = (nextLanguage: Language): void => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANG_STORAGE_KEY, nextLanguage);
  };

  const toggleLanguage = (): void => {
    setLanguage(language === "th" ? "en" : "th");
  };

  const value = useMemo(
    () => ({ language, setLanguage, toggleLanguage }),
    [language],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): LocaleContextValue {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TranslationDict, LocaleCode } from './types';
import { translations, baseEn } from './translations';
import { LocalePreset } from '../types';
import { SUPPORTED_LOCALES, getLocaleByCode } from '../utils/localeHelper';

interface I18nContextValue {
  currentLocale: LocaleCode;
  setLocale: (code: LocaleCode) => void;
  t: (key: keyof TranslationDict, fallback?: string) => string;
  dict: TranslationDict;
  currentLocaleInfo: LocalePreset;
  supportedLocales: LocalePreset[];
}

const I18nContext = createContext<I18nContextValue | null>(null);

export const I18nProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLocale, setCurrentLocaleState] = useState<LocaleCode>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('adobe_web_ui_lang');
        if (saved && translations[saved]) {
          return saved;
        }
      }
    } catch {
      // Fallback
    }
    return 'ko_KR';
  });

  const setLocale = (code: LocaleCode) => {
    if (translations[code] || SUPPORTED_LOCALES.some((l) => l.code === code)) {
      setCurrentLocaleState(code);
      try {
        localStorage.setItem('adobe_web_ui_lang', code);
      } catch {
        // Ignore storage error
      }
    }
  };

  const dict: TranslationDict = {
    ...baseEn,
    ...(translations[currentLocale] || translations.ko_KR),
  };

  const t = (key: keyof TranslationDict, fallback?: string): string => {
    return dict[key] || fallback || baseEn[key] || key;
  };

  const currentLocaleInfo = getLocaleByCode(currentLocale);

  return (
    <I18nContext.Provider
      value={{
        currentLocale,
        setLocale,
        t,
        dict,
        currentLocaleInfo,
        supportedLocales: SUPPORTED_LOCALES,
      }}
    >
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = (): I18nContextValue => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};

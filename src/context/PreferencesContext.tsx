import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import i18n from '../i18n';
import { getUserPreferences, updateUserPreferences } from '../services/accountService';

export type CurrencyCode = 'USD' | 'AZN' | 'EUR';
export type LanguageCode = 'en' | 'az' | 'tr' | 'ru';

export const CURRENCY_CONFIG: Record<CurrencyCode, { rate: number; symbol: string; prefix: boolean; displayName: string }> = {
  USD: { rate: 1.0, symbol: '$', prefix: true, displayName: 'USD ($)' },
  AZN: { rate: 1.7, symbol: '₼', prefix: false, displayName: 'AZN (₼)' },
  EUR: { rate: 0.93, symbol: '€', prefix: true, displayName: 'EUR (€)' },
};

export const LANGUAGE_CONFIG: Record<string, { code: LanguageCode; displayName: string }> = {
  en: { code: 'en', displayName: 'English' },
  az: { code: 'az', displayName: 'Azerbaijani' },
  tr: { code: 'tr', displayName: 'Turkish' },
  ru: { code: 'ru', displayName: 'Russian' },
  English: { code: 'en', displayName: 'English' },
  Azerbaijani: { code: 'az', displayName: 'Azerbaijani' },
  Turkish: { code: 'tr', displayName: 'Turkish' },
  Russian: { code: 'ru', displayName: 'Russian' },
};

export const normalizeCurrency = (raw: string): CurrencyCode => {
  if (raw.includes('AZN') || raw.includes('₼')) return 'AZN';
  if (raw.includes('EUR') || raw.includes('€')) return 'EUR';
  return 'USD';
};

export const normalizeLanguage = (raw: string): LanguageCode => {
  const norm = raw.trim().toLowerCase();
  if (norm === 'az' || norm === 'azerbaijani') return 'az';
  if (norm === 'tr' || norm === 'turkish') return 'tr';
  if (norm === 'ru' || norm === 'russian') return 'ru';
  return 'en';
};

interface PreferencesContextValue {
  currency: CurrencyCode;
  currencyDisplayName: string;
  language: LanguageCode;
  languageDisplayName: string;
  symbol: string;
  changeCurrency: (c: string) => void;
  changeLanguage: (l: string) => void;
  formatPrice: (amountInUSD: number) => string;
  convertPrice: (amountInUSD: number) => number;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>(() => {
    const saved = localStorage.getItem('tradehub_currency') || 'USD';
    return normalizeCurrency(saved);
  });

  const [language, setLanguageState] = useState<LanguageCode>(() => {
    const saved = localStorage.getItem('tradehub_language_code') || 'en';
    return normalizeLanguage(saved);
  });

  useEffect(() => {
    getUserPreferences()
      .then((p) => {
        if (p.currency) {
          const normC = normalizeCurrency(p.currency);
          setCurrencyState(normC);
          localStorage.setItem('tradehub_currency', normC);
        }
        if (p.language) {
          const normL = normalizeLanguage(p.language);
          setLanguageState(normL);
          i18n.changeLanguage(normL);
          localStorage.setItem('tradehub_language_code', normL);
        }
      })
      .catch(() => {});
  }, []);

  const changeCurrency = useCallback((raw: string) => {
    const norm = normalizeCurrency(raw);
    setCurrencyState(norm);
    localStorage.setItem('tradehub_currency', norm);
  }, []);

  const changeLanguage = useCallback((raw: string) => {
    const norm = normalizeLanguage(raw);
    setLanguageState(norm);
    i18n.changeLanguage(norm);
    localStorage.setItem('tradehub_language_code', norm);
  }, []);

  const convertPrice = useCallback(
    (amountInUSD: number): number => {
      const numeric = Number(amountInUSD) || 0;
      const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
      return numeric * config.rate;
    },
    [currency]
  );

  const formatPrice = useCallback(
    (amountInUSD: number): string => {
      const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
      const converted = convertPrice(amountInUSD);
      const formattedNum = converted.toFixed(2);
      return config.prefix ? `${config.symbol}${formattedNum}` : `${formattedNum} ${config.symbol}`;
    },
    [currency, convertPrice]
  );

  const config = CURRENCY_CONFIG[currency] || CURRENCY_CONFIG.USD;
  const langConfig = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.en;

  return (
    <PreferencesContext.Provider
      value={{
        currency,
        currencyDisplayName: config.displayName,
        language,
        languageDisplayName: langConfig.displayName,
        symbol: config.symbol,
        changeCurrency,
        changeLanguage,
        formatPrice,
        convertPrice,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = (): PreferencesContextValue => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    return {
      currency: 'USD',
      currencyDisplayName: 'USD ($)',
      language: 'en',
      languageDisplayName: 'English',
      symbol: '$',
      changeCurrency: () => {},
      changeLanguage: () => {},
      formatPrice: (amt) => `$${(Number(amt) || 0).toFixed(2)}`,
      convertPrice: (amt) => Number(amt) || 0,
    };
  }
  return ctx;
};

export const useCurrency = () => {
  const { currency, symbol, formatPrice, convertPrice, changeCurrency } = usePreferences();
  return { currency, symbol, formatPrice, convertPrice, setCurrency: changeCurrency };
};

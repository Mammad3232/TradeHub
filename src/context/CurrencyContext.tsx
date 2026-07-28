import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getUserPreferences } from '../services/accountService';

export type SupportedCurrency = 'USD ($)' | 'AZN (₼)' | 'EUR (€)';
export type SupportedLanguage = 'English' | 'Azerbaijani' | 'Turkish' | 'Russian';

export const EXCHANGE_RATES: Record<SupportedCurrency, { rate: number; symbol: string; prefix: boolean }> = {
  'USD ($)': { rate: 1.0, symbol: '$', prefix: true },
  'AZN (₼)': { rate: 1.7, symbol: '₼', prefix: false },
  'EUR (€)': { rate: 0.93, symbol: '€', prefix: true },
};

// ── Translation Dictionaries ──────────────────────────────────────────────────
export const TRANSLATIONS: Record<SupportedLanguage, Record<string, string>> = {
  English: {
    'nav.home': 'Home',
    'nav.deals': 'Deals',
    'nav.vendors': 'Vendors',
    'nav.newArrivals': 'New Arrivals',
    'nav.becomeVendor': 'Become a Vendor',
    'nav.myOrders': 'My Orders',
    'nav.wishlist': 'Wishlist',
    'nav.cart': 'Cart',
    'nav.login': 'Sign In',
    'nav.logout': 'Sign Out',
    'cart.title': 'Shopping Cart',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    'product.addToCart': 'Add to Cart',
    'product.buyNow': 'Buy Now',
    'common.search': 'Search products, brands, categories...',
    'common.filter': 'Filter',
    'common.categories': 'Categories',
  },
  Azerbaijani: {
    'nav.home': 'Ana Səhifə',
    'nav.deals': 'Endirimlər',
    'nav.vendors': 'Satıcılar',
    'nav.newArrivals': 'Yeniliklər',
    'nav.becomeVendor': 'Satıcı Ol',
    'nav.myOrders': 'Sifarişlərim',
    'nav.wishlist': 'Seçilmişlər',
    'nav.cart': 'Səbət',
    'nav.login': 'Daxil Ol',
    'nav.logout': 'Çıxış',
    'cart.title': 'Alış-veriş Səbəti',
    'cart.total': 'Yekun Məbləğ',
    'cart.checkout': 'Sifarişi Rəsmiləşdir',
    'product.addToCart': 'Səbətə Əlavə Et',
    'product.buyNow': 'İndi Al',
    'common.search': 'Məhsul, brend və ya kateqoriya axtarın...',
    'common.filter': 'Filtrlə',
    'common.categories': 'Kateqoriyalar',
  },
  Turkish: {
    'nav.home': 'Anasayfa',
    'nav.deals': 'Fırsatlar',
    'nav.vendors': 'Satıcılar',
    'nav.newArrivals': 'Yeni Gelenler',
    'nav.becomeVendor': 'Satıcı Ol',
    'nav.myOrders': 'Siparişlerim',
    'nav.wishlist': 'Favorilerim',
    'nav.cart': 'Sepet',
    'nav.login': 'Giriş Yap',
    'nav.logout': 'Çıkış Yap',
    'cart.title': 'Alışveriş Sepeti',
    'cart.total': 'Toplam',
    'cart.checkout': 'Ödemeye Geç',
    'product.addToCart': 'Sepete Ekle',
    'product.buyNow': 'Hemen Satın Al',
    'common.search': 'Ürün, marka veya kategori ara...',
    'common.filter': 'Filtrele',
    'common.categories': 'Kategoriler',
  },
  Russian: {
    'nav.home': 'Главная',
    'nav.deals': 'Скидки',
    'nav.vendors': 'Продавцы',
    'nav.newArrivals': 'Новинки',
    'nav.becomeVendor': 'Стать продавцом',
    'nav.myOrders': 'Мои заказы',
    'nav.wishlist': 'Избранное',
    'nav.cart': 'Корзина',
    'nav.login': 'Войти',
    'nav.logout': 'Выйти',
    'cart.title': 'Корзина покупателя',
    'cart.total': 'Итого',
    'cart.checkout': 'Оформить заказ',
    'product.addToCart': 'В корзину',
    'product.buyNow': 'Купить сейчас',
    'common.search': 'Поиск товаров, брендов, категорий...',
    'common.filter': 'Фильтр',
    'common.categories': 'Категории',
  },
};

interface CurrencyContextValue {
  currency: SupportedCurrency;
  setCurrency: (c: SupportedCurrency) => void;
  language: SupportedLanguage;
  setLanguage: (l: SupportedLanguage) => void;
  formatPrice: (amountInUSD: number) => string;
  t: (key: string) => string;
}

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<SupportedCurrency>(() => {
    return (localStorage.getItem('tradehub_currency') as SupportedCurrency) || 'USD ($)';
  });

  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('tradehub_language') as SupportedLanguage) || 'English';
  });

  useEffect(() => {
    getUserPreferences()
      .then((p) => {
        if (p.currency && EXCHANGE_RATES[p.currency as SupportedCurrency]) {
          setCurrencyState(p.currency as SupportedCurrency);
          localStorage.setItem('tradehub_currency', p.currency);
        }
        if (p.language && TRANSLATIONS[p.language as SupportedLanguage]) {
          setLanguageState(p.language as SupportedLanguage);
          localStorage.setItem('tradehub_language', p.language);
        }
      })
      .catch(() => {});
  }, []);

  const setCurrency = useCallback((c: SupportedCurrency) => {
    setCurrencyState(c);
    localStorage.setItem('tradehub_currency', c);
  }, []);

  const setLanguage = useCallback((l: SupportedLanguage) => {
    setLanguageState(l);
    localStorage.setItem('tradehub_language', l);
  }, []);

  const formatPrice = useCallback(
    (amountInUSD: number): string => {
      const numeric = Number(amountInUSD) || 0;
      const config = EXCHANGE_RATES[currency] || EXCHANGE_RATES['USD ($)'];
      const converted = numeric * config.rate;
      const formattedNum = converted.toFixed(2);

      return config.prefix ? `${config.symbol}${formattedNum}` : `${formattedNum} ${config.symbol}`;
    },
    [currency]
  );

  const t = useCallback(
    (key: string): string => {
      const dict = TRANSLATIONS[language] || TRANSLATIONS.English;
      return dict[key] || TRANSLATIONS.English[key] || key;
    },
    [language]
  );

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, language, setLanguage, formatPrice, t }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = (): CurrencyContextValue => {
  const ctx = useContext(CurrencyContext);
  if (!ctx) {
    return {
      currency: 'USD ($)',
      setCurrency: () => {},
      language: 'English',
      setLanguage: () => {},
      formatPrice: (amt) => `$${(Number(amt) || 0).toFixed(2)}`,
      t: (key) => key,
    };
  }
  return ctx;
};

import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

interface LanguageCurrencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLanguage: string;
  currentCurrency: string;
  onSave: (lang: string, curr: string) => void;
}

export const languages = [
  { code: 'EN', label: 'English',    native: 'English',    flag: '🇺🇸' },
  { code: 'AZ', label: 'Azerbaijani', native: 'Azərbaycan', flag: '🇦🇿' },
  { code: 'TR', label: 'Turkish',     native: 'Türkçe',     flag: '🇹🇷' },
  { code: 'RU', label: 'Russian',     native: 'Русский',    flag: '🇷🇺' },
  { code: 'ES', label: 'Spanish',     native: 'Español',    flag: '🇪🇸' },
  { code: 'DE', label: 'German',      native: 'Deutsch',    flag: '🇩🇪' },
  { code: 'AR', label: 'Arabic',      native: 'العربية',    flag: '🇸🇦' },
];

export const currencies = [
  { code: 'USD', symbol: '$',  label: 'US Dollar' },
  { code: 'AZN', symbol: '₼', label: 'Azerbaijani Manat' },
  { code: 'EUR', symbol: '€',  label: 'Euro' },
  { code: 'TRY', symbol: '₺', label: 'Turkish Lira' },
  { code: 'GBP', symbol: '£',  label: 'British Pound' },
];

export const LanguageCurrencyModal: React.FC<LanguageCurrencyModalProps> = ({
  isOpen,
  onClose,
  currentLanguage,
  currentCurrency,
  onSave,
}) => {
  const [tempLang, setTempLang] = useState(currentLanguage);
  const [tempCurr, setTempCurr] = useState(currentCurrency);

  useEffect(() => {
    if (isOpen) {
      setTempLang(currentLanguage);
      setTempCurr(currentCurrency);
    }
  }, [isOpen, currentLanguage, currentCurrency]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave(tempLang, tempCurr);
    onClose();
  };

  const selectedLang = languages.find((l) => l.code === tempLang);
  const selectedCurr = currencies.find((c) => c.code === tempCurr);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white w-full max-w-lg overflow-hidden shadow-2xl z-10 rounded-2xl animate-in fade-in zoom-in-95 duration-150 text-left">

        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900">Language &amp; Currency</h2>
            <p className="text-xs text-gray-400 mt-0.5">Choose your preferred display settings.</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded-lg hover:bg-gray-200 transition-all"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6 space-y-7 max-h-[75vh] overflow-y-auto">

          {/* ── Language Section ──────────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Language</h3>
              <p className="text-xs text-gray-400 mt-0.5">Select the language you prefer for browsing.</p>
            </div>

            {/* 2-column grid for language radio tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              {languages.map((lang) => {
                const isSelected = tempLang === lang.code;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setTempLang(lang.code)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border-2 transition-all text-left w-full ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl leading-none flex-shrink-0">{lang.flag}</span>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-900 truncate">{lang.native}</p>
                        <p className="text-[10px] text-gray-400">{lang.code}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="bg-amber-500 rounded-full p-0.5 flex-shrink-0 ml-1">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-100" />

          {/* ── Currency Section ──────────────────────────────────── */}
          <div className="space-y-3">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest">Currency</h3>
              <p className="text-xs text-gray-400 mt-0.5">Select the currency you want to shop with.</p>
            </div>

            {/* Currency radio tiles */}
            <div className="grid grid-cols-2 gap-2.5">
              {currencies.map((curr) => {
                const isSelected = tempCurr === curr.code;
                return (
                  <button
                    key={curr.code}
                    type="button"
                    onClick={() => setTempCurr(curr.code)}
                    className={`flex items-center justify-between px-3.5 py-3 rounded-xl border-2 transition-all text-left w-full ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50'
                        : 'border-gray-200 hover:border-gray-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`text-lg font-bold w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isSelected ? 'bg-amber-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {curr.symbol}
                      </span>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{curr.code}</p>
                        <p className="text-[10px] text-gray-400 leading-tight">{curr.label}</p>
                      </div>
                    </div>
                    {isSelected && (
                      <div className="bg-amber-500 rounded-full p-0.5 flex-shrink-0">
                        <Check className="h-3 w-3 text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Live preview badge ────────────────────────────────── */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="text-xs text-gray-500 font-medium">Navbar will display:</span>
            <div className="flex items-center gap-1.5 bg-slate-800 text-white px-3 py-1.5 rounded-lg text-sm font-bold">
              <span>{selectedLang?.flag}</span>
              <span>{selectedLang?.code}</span>
              <span className="text-gray-400 text-xs mx-0.5">·</span>
              <span>{selectedCurr?.symbol}{selectedCurr?.code}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-bold text-slate-900 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 rounded-xl transition-all shadow-sm shadow-amber-500/20"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

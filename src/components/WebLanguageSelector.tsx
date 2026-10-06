import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check, Search } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { POPULAR_LOCALE_CODES } from '../utils/localeHelper';

export const WebLanguageSelector: React.FC = () => {
  const { currentLocale, setLocale, currentLocaleInfo, supportedLocales, t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocales = supportedLocales.filter((loc) => {
    const q = searchQuery.toLowerCase();
    return (
      loc.name.toLowerCase().includes(q) ||
      loc.nativeName.toLowerCase().includes(q) ||
      loc.englishName.toLowerCase().includes(q) ||
      loc.code.toLowerCase().includes(q)
    );
  });

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100/80 border border-indigo-200/80 text-indigo-900 text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
        title={t('pageLanguage')}
      >
        <Globe className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
        <span className="text-sm leading-none">{currentLocaleInfo.flag}</span>
        <span className="hidden sm:inline font-medium">{currentLocaleInfo.nativeName}</span>
        <ChevronDown className={`w-3 h-3 text-indigo-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 pb-2 border-b border-slate-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-600" />
                {t('pageLanguage')} (24)
              </span>
              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.2 rounded font-bold">
                24 Locales
              </span>
            </div>

            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search language / 언어 검색..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500 text-slate-800"
              />
            </div>

            {/* Popular quick chips */}
            {!searchQuery && (
              <div className="flex flex-wrap gap-1 mt-2">
                {POPULAR_LOCALE_CODES.slice(0, 5).map((code) => {
                  const loc = supportedLocales.find((l) => l.code === code);
                  if (!loc) return null;
                  return (
                    <button
                      key={loc.code}
                      type="button"
                      onClick={() => {
                        setLocale(loc.code);
                        setIsOpen(false);
                      }}
                      className={`text-[10px] px-1.5 py-0.5 rounded border transition-colors cursor-pointer ${
                        currentLocale === loc.code
                          ? 'bg-indigo-600 text-white border-indigo-600 font-bold'
                          : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {loc.flag} {loc.nativeName}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="max-h-64 overflow-y-auto px-1 py-1 divide-y divide-slate-50">
            {filteredLocales.length > 0 ? (
              filteredLocales.map((loc) => {
                const isSelected = currentLocale === loc.code;
                return (
                  <button
                    key={loc.code}
                    type="button"
                    onClick={() => {
                      setLocale(loc.code);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between text-xs transition-colors cursor-pointer ${
                      isSelected ? 'bg-indigo-50/80 text-indigo-950 font-bold' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base">{loc.flag}</span>
                      <div className="truncate">
                        <span className="block truncate">{loc.nativeName}</span>
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {loc.englishName} ({loc.code})
                        </span>
                      </div>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
                  </button>
                );
              })
            ) : (
              <div className="px-4 py-3 text-center text-xs text-slate-400">
                일치하는 언어가 없습니다.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

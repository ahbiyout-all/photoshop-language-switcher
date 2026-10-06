import React from 'react';
import { Languages, CheckCircle2 } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { WebLanguageSelector } from './WebLanguageSelector';
import { AdobeAppType } from '../types';
import { getLocaleByCode } from '../utils/localeHelper';
import { APP_VERSION_FULL, APP_GITHUB_PROFILE } from '../version';
import { useI18n } from '../i18n/I18nContext';

interface HeaderProps {
  appType?: AdobeAppType;
  currentLocale?: string;
}

export const Header: React.FC<HeaderProps> = ({ appType = 'photoshop', currentLocale = 'ko_KR' }) => {
  const isIllustrator = appType === 'illustrator';
  const localePreset = getLocaleByCode(currentLocale);
  const { t } = useI18n();

  return (
    <header id="app-header" className="border-b border-slate-200 bg-white/90 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-black shadow-md text-lg tracking-tight transition-colors ${
              isIllustrator
                ? 'bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/20'
                : 'bg-gradient-to-br from-blue-600 to-indigo-700 shadow-blue-500/20'
            }`}
          >
            {isIllustrator ? 'Ai' : 'Ps'}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {isIllustrator ? t('appNameIllustrator') : t('appNamePhotoshop')}
              </h1>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                  isIllustrator
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}
              >
                <span>{localePreset.flag}</span>
                <span>{localePreset.name} ⇄ EN</span>
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-slate-900 text-white shadow-2xs">
                {APP_VERSION_FULL}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isIllustrator ? t('appSubtitleIllustrator') : t('appSubtitlePhotoshop')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Global Webpage UI 24-Language Selector */}
          <WebLanguageSelector />

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium">
            <Languages className={`w-3.5 h-3.5 ${isIllustrator ? 'text-amber-600' : 'text-blue-600'}`} />
            <span>{isIllustrator ? 'AMT XML' : 'tw10428 .dat'}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('badgeLossless')}</span>
          </div>

          <a
            href={APP_GITHUB_PROFILE}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
            title="공식 개발자 GitHub: AhBiYout (ahbiyout-all)"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>개발자: AhBiYout</span>
          </a>

          <PWAInstallButton />
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { AdobeAppType } from '../types';
import { Layers } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';

interface AppSwitcherProps {
  currentApp: AdobeAppType;
  onSelectApp: (app: AdobeAppType) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({
  currentApp,
  onSelectApp,
}) => {
  const { t } = useI18n();

  return (
    <div id="adobe-app-switcher" className="mb-6 bg-white rounded-2xl p-3 border border-slate-200/80 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 tracking-tight">
              {t('selectAppTitle')}
            </span>
            <p className="text-[11px] text-slate-500">
              {t('selectAppSubtitle')}
            </p>
          </div>
        </div>

        {/* 2-way Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 max-w-md w-full sm:w-auto">
          {/* Photoshop Option */}
          <button
            type="button"
            onClick={() => onSelectApp('photoshop')}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
              currentApp === 'photoshop'
                ? 'bg-white text-blue-800 shadow-sm border border-blue-200/60 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-5 h-5 rounded bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
              Ps
            </span>
            <span>{t('selectAppPhotoshopBtn')}</span>
            {currentApp === 'photoshop' && (
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
            )}
          </button>

          {/* Illustrator Option */}
          <button
            type="button"
            onClick={() => onSelectApp('illustrator')}
            className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-150 cursor-pointer ${
              currentApp === 'illustrator'
                ? 'bg-white text-amber-900 shadow-sm border border-amber-300/80 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
            }`}
          >
            <span className="w-5 h-5 rounded bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-[10px] flex items-center justify-center shadow-2xs">
              Ai
            </span>
            <span>{t('selectAppIllustratorBtn')}</span>
            {currentApp === 'illustrator' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Download, Monitor, CheckCircle, HelpCircle, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { useI18n } from '../i18n/I18nContext';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);
  const { t } = useI18n();

  // If already installed in standalone window mode
  if (isInstalled) {
    return (
      <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/30 text-emerald-300 text-xs font-medium">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
        <span className="font-semibold">{t('pwaInstalledRunning')}</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        id="desktop-app-install-btn"
        type="button"
        onClick={handleInstallClick}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer"
        title={t('pwaInstallDesktopBtn')}
      >
        <Monitor className="w-4 h-4 text-blue-200" />
        <span>{t('pwaInstallDesktopBtn')}</span>
      </button>

      {/* Manual Install Instructions Modal */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Monitor className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {t('pwaModalTitle')}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">1</span>
                  <span>Google Chrome / MS Edge</span>
                </div>
                <p className="text-xs text-slate-600 pl-5">
                  {t('pwaModalDescChrome')}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] flex items-center justify-center font-mono">2</span>
                  <span>Safari (macOS / iOS)</span>
                </div>
                <p className="text-xs text-slate-600 pl-5">
                  {t('pwaModalDescSafari')}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
              >
                {t('pwaModalClose')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

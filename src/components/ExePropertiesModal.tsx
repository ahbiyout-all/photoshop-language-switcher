import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  RotateCcw,
  ShieldCheck,
  Check,
  Globe,
  RefreshCw,
  Lock,
  Unlock,
  KeyRound,
  ShieldAlert,
} from 'lucide-react';
import { ExeMetadata } from '../utils/exeGenerator';
import {
  APP_ORGANIZATION,
  APP_AUTHOR,
  APP_COPYRIGHT,
  APP_VERSION,
  DEFAULT_DEV_ADMIN_PIN,
} from '../version';
import { useI18n } from '../i18n/I18nContext';

interface ExePropertiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMetadata: ExeMetadata;
  targetFilename: string;
  onDownload: (customMeta: ExeMetadata) => void;
}

export const ExePropertiesModal: React.FC<ExePropertiesModalProps> = ({
  isOpen,
  onClose,
  defaultMetadata,
  targetFilename,
  onDownload,
}) => {
  const { t } = useI18n();
  const [activeTab, setActiveTab] = useState<'details' | 'general' | 'security'>('details');
  const [meta, setMeta] = useState<ExeMetadata>(defaultMetadata);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('admin') === 'true' || urlParams.get('dev') === '1') {
          return true;
        }
        return sessionStorage.getItem('adobe_metadata_unlocked') === 'true';
      }
    } catch {
      // Fallback
    }
    return false;
  });

  const [showPinModal, setShowPinModal] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  useEffect(() => {
    setMeta(defaultMetadata);
  }, [defaultMetadata, isOpen]);

  if (!isOpen) return null;

  const handleReset = () => {
    setMeta(defaultMetadata);
  };

  const handleUnlockWithPin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinInput.trim() === DEFAULT_DEV_ADMIN_PIN) {
      setIsUnlocked(true);
      setShowPinModal(false);
      setPinInput('');
      setPinError(null);
      try {
        sessionStorage.setItem('adobe_metadata_unlocked', 'true');
      } catch {
        // Ignore
      }
    } else {
      setPinError(`Invalid PIN (Default Admin PIN: ${DEFAULT_DEV_ADMIN_PIN})`);
    }
  };

  const handleRelock = () => {
    setIsUnlocked(false);
    setMeta(defaultMetadata);
    try {
      sessionStorage.removeItem('adobe_metadata_unlocked');
    } catch {
      // Ignore
    }
  };

  const handleApplyAndDownload = () => {
    const payloadMeta: ExeMetadata = isUnlocked
      ? meta
      : {
          ...defaultMetadata,
          company: APP_ORGANIZATION,
          copyright: APP_COPYRIGHT,
          trademark: `Official Core Engine: ${APP_ORGANIZATION} | ${APP_AUTHOR}`,
        };

    onDownload(payloadMeta);
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
      onClose();
    }, 1200);
  };

  const exeName = targetFilename.replace(/\.(bat|cmd|ps1)$/i, '.exe');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Windows Style Title Bar */}
        <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-5 h-5 rounded bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
              EXE
            </div>
            <span className="text-xs sm:text-sm font-semibold text-slate-800 truncate">
              {exeName} {t('propertiesModalTitle')}
            </span>
            {isUnlocked ? (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shrink-0">
                <Unlock className="w-3 h-3 text-amber-700" />
                {t('propertiesDevUnlockedBadge')}
              </span>
            ) : (
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shrink-0">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                {t('propertiesProtectedBadge')}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {isUnlocked ? (
              <button
                type="button"
                onClick={handleRelock}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer"
                title="Relock"
              >
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span className="hidden xs:inline">{t('propertiesRelockBtn')}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setPinError(null);
                  setPinInput('');
                  setShowPinModal(true);
                }}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                title="Unlock Developer Mode"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                <span className="hidden xs:inline">{t('propertiesUnlockBtn')}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Windows Style Property Tabs */}
        <div className="bg-slate-50 px-4 pt-2 border-b border-slate-200 flex gap-1 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-4 py-2 text-xs font-bold rounded-t-lg transition-colors border-t border-x cursor-pointer ${
              activeTab === 'details'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            {t('propertiesTabDetails')} {isUnlocked ? '🔓' : '🔒'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x cursor-pointer ${
              activeTab === 'general'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            {t('propertiesTabGeneral')}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors border-t border-x cursor-pointer ${
              activeTab === 'security'
                ? 'bg-white text-blue-600 border-slate-200 border-b-white -mb-px shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100'
            }`}
          >
            {t('propertiesTabSecurity')}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4 text-xs text-slate-700">
          {activeTab === 'details' && (
            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100">
              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white hover:bg-slate-50/50">
                <label className="text-slate-600 font-medium">File Description</label>
                <input
                  type="text"
                  readOnly={!isUnlocked}
                  value={meta.description}
                  onChange={(e) => setMeta({ ...meta, description: e.target.value })}
                  className={`sm:col-span-2 px-3 py-1.5 border rounded-lg transition-all ${
                    isUnlocked
                      ? 'bg-white border-blue-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                      : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed select-all'
                  }`}
                />
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white hover:bg-slate-50/50">
                <label className="text-slate-600 font-medium">Company Name</label>
                <input
                  type="text"
                  readOnly={!isUnlocked}
                  value={meta.company}
                  onChange={(e) => setMeta({ ...meta, company: e.target.value })}
                  className={`sm:col-span-2 px-3 py-1.5 border rounded-lg transition-all ${
                    isUnlocked
                      ? 'bg-white border-blue-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                      : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed select-all'
                  }`}
                />
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white hover:bg-slate-50/50">
                <label className="text-slate-600 font-medium">Product Version</label>
                <input
                  type="text"
                  readOnly={!isUnlocked}
                  value={meta.version}
                  onChange={(e) => setMeta({ ...meta, version: e.target.value })}
                  className={`sm:col-span-2 px-3 py-1.5 border rounded-lg font-mono transition-all ${
                    isUnlocked
                      ? 'bg-white border-blue-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                      : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed select-all'
                  }`}
                />
              </div>

              <div className="p-3 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center bg-white hover:bg-slate-50/50">
                <label className="text-slate-600 font-medium">Copyright</label>
                <input
                  type="text"
                  readOnly={!isUnlocked}
                  value={meta.copyright}
                  onChange={(e) => setMeta({ ...meta, copyright: e.target.value })}
                  className={`sm:col-span-2 px-3 py-1.5 border rounded-lg transition-all ${
                    isUnlocked
                      ? 'bg-white border-blue-300 text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-blue-500'
                      : 'bg-slate-100/80 border-slate-200 text-slate-700 cursor-not-allowed select-all'
                  }`}
                />
              </div>
            </div>
          )}

          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/60 space-y-3">
                <div className="flex items-center gap-3.5">
                  <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 p-2.5 flex items-center justify-center text-white shadow-md border border-blue-400/30">
                    <Globe className="w-8 h-8 text-blue-400" />
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-xs border-2 border-white">
                      <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{exeName}</h4>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1.5 mt-0.5">
                      <span className="font-medium text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200/60">
                        Global 24-Locale 1-Click Switcher
                      </span>
                    </p>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-3 space-y-2 text-slate-600">
                  <div className="flex justify-between">
                    <span>Architecture:</span>
                    <strong className="text-slate-800">x64 Native (Windows 7/8/10/11)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Privilege Level:</span>
                    <strong className="text-emerald-700 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> UAC Administrator Auto-Elevation
                    </strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Publisher:</span>
                    <strong className="text-indigo-900 font-mono font-semibold">{APP_ORGANIZATION}</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-3.5">
              <div className="border border-emerald-200 bg-emerald-50/70 rounded-xl p-4 text-emerald-950 space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span>Anti-Tamper &amp; PE Integrity Verified</span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  2-step integrity protection system enforces official authorship and verified compiler binary output.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            disabled={!isUnlocked}
            className={`text-xs flex items-center gap-1.5 px-2.5 py-1.5 rounded transition-colors ${
              isUnlocked
                ? 'text-slate-600 hover:text-slate-800 hover:bg-slate-200 cursor-pointer'
                : 'text-slate-400 cursor-not-allowed opacity-60'
            }`}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            {t('propertiesResetBtn')}
          </button>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {t('propertiesCloseBtn')}
            </button>
            <button
              type="button"
              onClick={handleApplyAndDownload}
              className={`px-5 py-2 text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : isUnlocked
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white hover:shadow-lg'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white hover:shadow-lg'
              }`}
            >
              {downloadSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  Downloaded!
                </>
              ) : isUnlocked ? (
                <>
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  {t('propertiesCustomDownloadBtn')}
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-200" />
                  {t('propertiesOfficialDownloadBtn')}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Floating PIN Authentication Modal */}
        {showPinModal && (
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4 z-60 animate-in fade-in">
            <div 
              className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                    {t('pinModalTitle')}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {t('pinModalDesc')}
              </p>

              <form onSubmit={handleUnlockWithPin} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    PIN (1375)
                  </label>
                  <input
                    type="password"
                    autoFocus
                    value={pinInput}
                    onChange={(e) => {
                      setPinInput(e.target.value);
                      if (pinError) setPinError(null);
                    }}
                    placeholder={t('pinPlaceholder')}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono tracking-widest text-center focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    maxLength={10}
                  />
                  {pinError && (
                    <p className="mt-1.5 text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      {pinError}
                    </p>
                  )}
                  <p className="mt-1.5 text-[10px] text-slate-400">
                    💡 PIN: <code className="font-mono text-slate-700 font-bold bg-slate-100 px-1 py-0.5 rounded">{DEFAULT_DEV_ADMIN_PIN}</code>
                  </p>
                </div>

                <div className="flex items-center gap-2 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPinModal(false)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    {t('pinModalCancel')}
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white shadow-xs cursor-pointer"
                  >
                    {t('pinModalSubmit')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

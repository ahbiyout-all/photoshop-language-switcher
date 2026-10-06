import React, { useState, useMemo } from 'react';
import {
  Layers,
  Sparkles,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Zap,
  CheckCircle2,
  ChevronDown,
  Globe,
  ArrowRightLeft,
} from 'lucide-react';
import {
  EXTENDED_ADOBE_APPS,
  generateInDesignScript,
  generateAfterEffectsScript,
  generatePremiereScript,
  generateAuditionScript,
  generateMasterExtendedAdobeScript,
} from '../utils/extendedAppsHelper';
import {
  SUPPORTED_LOCALES,
  POPULAR_LOCALE_CODES,
  getLocaleByCode,
} from '../utils/localeHelper';
import { APP_VERSION, APP_VERSION_FULL } from '../version';
import {
  downloadTextFile,
  downloadCmdFile,
  downloadAutoExeCompilerFile,
} from '../utils/photoshopHelper';
import { ExePropertiesModal } from './ExePropertiesModal';
import { useI18n } from '../i18n/I18nContext';

export const ExtendedAppsSuite: React.FC = () => {
  const { t } = useI18n();
  const [selectedAppId, setSelectedAppId] = useState<string>('all');
  const [targetLocale, setTargetLocale] = useState<string>('ko_KR');
  const [scriptMode, setScriptMode] = useState<'toggle' | 'to_en' | 'to_target'>('toggle');
  const [copied, setCopied] = useState(false);
  const [showCode, setShowCode] = useState(false);
  const [showExeModal, setShowExeModal] = useState(false);

  // Active App & Active Locale
  const activeApp = EXTENDED_ADOBE_APPS.find((a) => a.id === selectedAppId);
  const currentLocaleObj = useMemo(() => getLocaleByCode(targetLocale), [targetLocale]);

  // Generate Current Script Content
  const scriptContent = useMemo(() => {
    if (selectedAppId === 'all') {
      return generateMasterExtendedAdobeScript(scriptMode, targetLocale);
    } else if (selectedAppId === 'indesign' || selectedAppId === 'incopy') {
      return generateInDesignScript(scriptMode, targetLocale, selectedAppId);
    } else if (selectedAppId === 'aftereffects') {
      return generateAfterEffectsScript(scriptMode, targetLocale);
    } else if (selectedAppId === 'premiere') {
      return generatePremiereScript(scriptMode, targetLocale);
    } else if (selectedAppId === 'audition') {
      return generateAuditionScript(scriptMode, targetLocale);
    } else {
      return generateMasterExtendedAdobeScript(scriptMode, targetLocale);
    }
  }, [selectedAppId, scriptMode, targetLocale]);

  // Dynamic Filename
  const scriptFilename = useMemo(() => {
    const prefix = selectedAppId === 'all' ? 'adobe_extended_all_2026' : `${selectedAppId}_2026`;
    const modeSuffix =
      scriptMode === 'toggle'
        ? `toggle_${targetLocale}`
        : scriptMode === 'to_en'
        ? 'en_US'
        : targetLocale;
    return `${prefix}_language_${modeSuffix}.bat`;
  }, [selectedAppId, scriptMode, targetLocale]);

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadBat = () => {
    downloadTextFile(scriptContent, scriptFilename, { isWindowsCrlf: true, withBom: false });
  };

  const handleDownloadCmd = () => {
    const cmdFilename = scriptFilename.replace(/\.bat$/i, '.cmd');
    downloadCmdFile(scriptContent, cmdFilename);
  };

  const handleDownloadExe = () => {
    setShowExeModal(true);
  };

  // EXE Metadata
  const getExeMetadata = () => {
    const title =
      selectedAppId === 'all'
        ? `Adobe Extended Apps Language Switcher (${currentLocaleObj.name} ⇄ English)`
        : `${activeApp?.name || 'Adobe'} Language Switcher (${currentLocaleObj.name} ⇄ English)`;
    const desc =
      selectedAppId === 'all'
        ? `Adobe Extended Apps Language Switcher (${currentLocaleObj.name} / English 1-Click Switcher)`
        : `${activeApp?.name || ''} Language Switcher (${currentLocaleObj.name} ⇄ English)`;

    return {
      title,
      description: desc,
      company: 'cisnet.co.kr',
      product: 'Adobe Extended Multi-Language Switcher Suite',
      copyright: 'Copyright © 2026 AhBiYout. All rights reserved.',
      trademark: '',
      version: `${APP_VERSION}.0`,
      informationalVersion: APP_VERSION,
      originalFilename: scriptFilename.replace(/\.(bat|cmd)$/i, '.exe'),
    };
  };

  return (
    <section
      id="extended-apps-section"
      className="mb-8 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
    >
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-pink-300 border border-pink-500/30">
              Global 24-Locale {APP_VERSION_FULL}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span>1.5s Safe Engine</span>
            </span>
            <span className="text-xs text-slate-400 font-mono">
              InDesign • After Effects • Premiere • InCopy • Audition
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>{t('stepExtendedTitle')}</span>
            <Sparkles className="w-5 h-5 text-amber-400" />
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            {t('stepExtendedDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Supported Locales</div>
            <div className="text-lg font-bold text-amber-300 font-mono">24</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Supported Apps</div>
            <div className="text-lg font-bold text-white font-mono">5+</div>
          </div>
          <div className="px-3 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-center">
            <div className="text-[10px] text-slate-400 font-medium">Safety Guarantee</div>
            <div className="text-lg font-bold text-emerald-400 font-mono">100%</div>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Step 1: Target Language Selection */}
        <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-50/70 via-slate-50 to-purple-50/50 border border-indigo-100/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-indigo-600" />
              <span>{t('targetLocaleLabel')}</span>
            </label>
            <span className="text-xs text-indigo-700 font-medium flex items-center gap-1">
              {currentLocaleObj.flag} {currentLocaleObj.name} ({currentLocaleObj.code})
            </span>
          </div>

          {/* Quick Select Chips */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {POPULAR_LOCALE_CODES.map((code) => {
              const loc = getLocaleByCode(code);
              const isSelected = targetLocale.toLowerCase() === code.toLowerCase();
              return (
                <button
                  key={code}
                  type="button"
                  onClick={() => setTargetLocale(loc.code)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-400/40 scale-102'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 shadow-2xs'
                  }`}
                >
                  <span className="text-sm leading-none">{loc.flag}</span>
                  <span>{loc.name}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {loc.code}
                  </span>
                </button>
              );
            })}
          </div>

          {/* All 24 Locales Dropdown */}
          <div className="relative">
            <select
              value={targetLocale}
              aria-label="Supported Locales"
              onChange={(e) => setTargetLocale(e.target.value)}
              className="w-full pl-3 pr-8 py-2 bg-white border border-indigo-200 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-2xs cursor-pointer appearance-none"
            >
              {SUPPORTED_LOCALES.map((loc) => (
                <option key={loc.code} value={loc.code}>
                  {loc.flag} {loc.name} ({loc.nativeName}) - [{loc.code}]
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-indigo-500">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
        </div>

        {/* Step 2: App Selector Grid */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            {t('extendedAppLabel')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {/* Master All Option */}
            <button
              type="button"
              onClick={() => setSelectedAppId('all')}
              className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                selectedAppId === 'all'
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-indigo-500/30'
                  : 'bg-slate-50 text-slate-700 border-slate-200/80 hover:bg-slate-100/80 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 text-white font-black text-xs flex items-center justify-center shadow-xs">
                  ALL
                </span>
                {selectedAppId === 'all' && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
              </div>
              <div>
                <div className="font-bold text-xs">{t('extendedAllApps')}</div>
                <div className={`text-[10px] truncate ${selectedAppId === 'all' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Id, Ae, Pr, Ic, Au
                </div>
              </div>
            </button>

            {/* Individual Apps */}
            {EXTENDED_ADOBE_APPS.map((app) => {
              const isSelected = selectedAppId === app.id;
              return (
                <button
                  key={app.id}
                  type="button"
                  onClick={() => setSelectedAppId(app.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'bg-white text-slate-900 border-indigo-500 shadow-md ring-2 ring-indigo-500/20'
                      : 'bg-white text-slate-700 border-slate-200/80 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-7 h-7 rounded-lg bg-gradient-to-br ${app.gradient} text-white font-black text-xs flex items-center justify-center shadow-2xs`}
                    >
                      {app.shortCode}
                    </span>
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-xs truncate">{app.name}</div>
                    <div className="text-[10px] text-slate-400 truncate">{app.technique}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected App Mode Selector */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 shrink-0 mt-0.5">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-sm text-slate-900">
                  {selectedAppId === 'all'
                    ? t('extendedAllApps')
                    : `${activeApp?.name}`}
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-mono">
                  {selectedAppId === 'all' ? 'Registry + Config Engine' : activeApp?.technique}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                {t('extendedNoticeDesc')}
              </p>
            </div>
          </div>

          {/* Mode Selector */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs shrink-0 flex-wrap sm:flex-nowrap gap-1">
            <button
              type="button"
              onClick={() => setScriptMode('toggle')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scriptMode === 'toggle'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{t('extendedModeToggle')}</span>
            </button>
            <button
              type="button"
              onClick={() => setScriptMode('to_en')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scriptMode === 'to_en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🇺🇸</span>
              <span>{t('extendedModeToEn')}</span>
            </button>
            <button
              type="button"
              onClick={() => setScriptMode('to_target')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                scriptMode === 'to_target'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{currentLocaleObj.flag}</span>
              <span>{t('extendedModeToTarget')}</span>
            </button>
          </div>
        </div>

        {/* Action Buttons: EXE / BAT / CMD / Copy */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-900 text-white rounded-xl shadow-inner">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-mono text-xs text-slate-300 font-medium">
              Script: <strong className="text-white">{scriptFilename}</strong>
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadExe}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current" />
              <span>{t('downloadExeCompiler')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadBat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-xs transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('downloadBat')}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadCmd}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
            >
              <span>{t('downloadCmd')}</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? t('copiedBtn') : t('copyScriptBtn')}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCode(!showCode)}
              className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg text-slate-400 hover:text-white text-xs font-mono transition-all cursor-pointer"
            >
              <span>{showCode ? t('hideCodePreview') : t('showCodePreview')}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCode ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        {/* Code Preview Accordion */}
        {showCode && (
          <div className="relative rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-300 overflow-x-auto max-h-72">
            <pre className="whitespace-pre">{scriptContent}</pre>
          </div>
        )}
      </div>

      {/* EXE Properties Modal */}
      {showExeModal && (
        <ExePropertiesModal
          isOpen={showExeModal}
          onClose={() => setShowExeModal(false)}
          defaultMetadata={getExeMetadata()}
          targetFilename={scriptFilename}
          onDownload={(customMeta) => {
            downloadAutoExeCompilerFile(
              scriptContent,
              scriptFilename,
              customMeta
            );
          }}
        />
      )}
    </section>
  );
};

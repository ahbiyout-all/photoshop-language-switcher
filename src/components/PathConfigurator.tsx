import React, { useState } from 'react';
import {
  FolderSearch,
  Sliders,
  HardDrive,
  Copy,
  Check,
  Laptop,
  FolderOpen,
  Info,
  Sparkles,
  RotateCcw,
  Globe,
  Languages,
} from 'lucide-react';
import { PathConfig } from '../types';
import {
  PHOTOSHOP_VERSIONS,
  DRIVE_LETTERS,
  resolveFolderPath,
  resolveDatFileName,
} from '../utils/photoshopHelper';
import { ILLUSTRATOR_VERSIONS, getIllustratorDefaultPath } from '../utils/illustratorHelper';
import {
  SUPPORTED_LOCALES,
  POPULAR_LOCALE_CODES,
  getLocaleByCode,
  getDatFileNameForLocale,
} from '../utils/localeHelper';
import { useI18n } from '../i18n/I18nContext';

interface PathConfiguratorProps {
  config: PathConfig;
  onChange: (newConfig: PathConfig) => void;
}

export const PathConfigurator: React.FC<PathConfiguratorProps> = ({
  config,
  onChange,
}) => {
  const { t } = useI18n();
  const isIllustrator = config.appType === 'illustrator';
  const appName = isIllustrator ? (t('appNameIllustrator') || 'Illustrator') : (t('appNamePhotoshop') || 'Photoshop');

  const [copied, setCopied] = useState(false);
  const resolvedPath = resolveFolderPath(config);
  const resolvedFile = resolveDatFileName(config);

  const selectedPsVersion =
    PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) ||
    PHOTOSHOP_VERSIONS[2];

  const selectedAiVersion =
    ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) ||
    ILLUSTRATOR_VERSIONS[2];

  const currentFolderName = isIllustrator ? selectedAiVersion.folderName : selectedPsVersion.folderName;
  const currentLocalePreset = getLocaleByCode(config.locale || 'ko_KR');

  const handleSelectLocale = (newLocale: string) => {
    const isCs6 = selectedPsVersion?.year === 'CS6';
    const newDat = isIllustrator ? 'application.xml' : getDatFileNameForLocale(newLocale, isCs6);
    onChange({
      ...config,
      locale: newLocale,
      customDatFileName: newDat,
    });
  };

  const handleCopyPath = async () => {
    try {
      await navigator.clipboard.writeText(resolvedPath);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePasteCustomPath = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChange({
          ...config,
          isCustomPath: true,
          customPath: text.replace(/^["']|["']$/g, '').trim(),
        });
      }
    } catch (err) {
      console.error('Clipboard read not permitted', err);
    }
  };

  const handlePresetPath = (path: string) => {
    onChange({
      ...config,
      isCustomPath: true,
      customPath: path,
    });
  };

  return (
    <section id="path-configurator-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg ${isIllustrator ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              <FolderSearch className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepPathTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('stepPathDesc')}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-100 p-1 border border-slate-200/80 self-start sm:self-auto">
          <button
            id="tab-auto-detect"
            type="button"
            onClick={() => onChange({ ...config, isCustomPath: false })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              !config.isCustomPath
                ? isIllustrator
                  ? 'bg-white text-amber-800 shadow-sm font-bold'
                  : 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            {t('autoPresetLabel')}
          </button>
          <button
            id="tab-custom-path"
            type="button"
            onClick={() => onChange({ ...config, isCustomPath: true })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              config.isCustomPath
                ? isIllustrator
                  ? 'bg-white text-amber-800 shadow-sm font-bold'
                  : 'bg-white text-blue-700 shadow-sm font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            {t('customPathLabel')}
          </button>
        </div>
      </div>

      {/* Mode A: Version Auto Detection Rules */}
      {!config.isCustomPath ? (
        <div className="py-5 space-y-5">
          {/* OS & Drive Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-2">
                Operating System (OS)
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const newPsVer = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) || PHOTOSHOP_VERSIONS[2];
                    const newAiVer = ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) || ILLUSTRATOR_VERSIONS[2];
                    const newPath = isIllustrator
                      ? getIllustratorDefaultPath(newAiVer, config.drive || 'C', 'windows')
                      : `${config.drive || 'C'}:\\Program Files\\Adobe\\${newPsVer.folderName}\\Locales\\${config.locale || 'ko_KR'}\\Support Files`;
                    onChange({
                      ...config,
                      os: 'windows',
                      isCustomPath: false,
                      customPath: newPath,
                    });
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    config.os === 'windows'
                      ? isIllustrator
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-600'
                        : 'border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  Windows (PC)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const newPsVer = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) || PHOTOSHOP_VERSIONS[2];
                    const newAiVer = ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) || ILLUSTRATOR_VERSIONS[2];
                    const newPath = isIllustrator
                      ? getIllustratorDefaultPath(newAiVer, config.drive || 'C', 'macos')
                      : `/Applications/${newPsVer.folderName}/Locales/${config.locale || 'ko_KR'}/Support Files`;
                    onChange({
                      ...config,
                      os: 'macos',
                      isCustomPath: false,
                      customPath: newPath,
                    });
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                    config.os === 'macos'
                      ? isIllustrator
                        ? 'border-amber-600 bg-amber-50/70 text-amber-900 ring-1 ring-amber-600'
                        : 'border-blue-600 bg-blue-50/70 text-blue-700 ring-1 ring-blue-600'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Laptop className="w-4 h-4" />
                  macOS (Mac)
                </button>
              </div>
            </div>

            {config.os === 'windows' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  {t('installDriveLabel')}
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5 flex-1 overflow-x-auto pb-1">
                    {DRIVE_LETTERS.map((drive) => (
                      <button
                        key={drive}
                        type="button"
                        onClick={() => {
                          const newPsVer = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) || PHOTOSHOP_VERSIONS[2];
                          const newAiVer = ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) || ILLUSTRATOR_VERSIONS[2];
                          const newPath = isIllustrator
                            ? `${drive}:\\Program Files\\Adobe\\${newAiVer.folderName}\\${newAiVer.subPath}`
                            : `${drive}:\\Program Files\\Adobe\\${newPsVer.folderName}\\Locales\\${config.locale || 'ko_KR'}\\Support Files`;
                          onChange({
                            ...config,
                            drive,
                            isCustomPath: false,
                            customPath: newPath,
                          });
                        }}
                        className={`flex-1 min-w-[44px] py-2 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1 cursor-pointer ${
                          config.drive === drive
                            ? isIllustrator
                              ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                              : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <HardDrive className="w-3 h-3" />
                        {drive}:
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Version Selection Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-700">
                {appName} Version Mapping
              </label>
              <span className="text-[11px] text-slate-400">
                Folder: {currentFolderName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
              {isIllustrator
                ? ILLUSTRATOR_VERSIONS.map((v) => {
                    const isSelected = config.versionId === v.id;
                    const computedAiPath = getIllustratorDefaultPath(v, config.drive || 'C', config.os || 'windows');
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...config,
                            versionId: v.id,
                            isCustomPath: false,
                            customPath: computedAiPath,
                            customDatFileName: 'application.xml',
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50/60 shadow-sm ring-1 ring-amber-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-amber-900' : 'text-slate-800'
                            }`}
                          >
                            {v.name}
                          </span>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-amber-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          {v.year === 'CS6' ? (v.id.includes('32') ? 'CS6 32-bit' : 'CS6 64-bit') : `${v.year}`}
                        </p>
                      </button>
                    );
                  })
                : PHOTOSHOP_VERSIONS.map((v) => {
                    const isSelected = config.versionId === v.id;
                    const isCs6 = v.year === 'CS6';
                    const computedDat = getDatFileNameForLocale(config.locale || 'ko_KR', isCs6);
                    const computedPsPath = config.os === 'macos'
                      ? `/Applications/${v.folderName}/Locales/${config.locale || 'ko_KR'}/Support Files`
                      : `${config.drive || 'C'}:\\Program Files\\Adobe\\${v.folderName}\\Locales\\${config.locale || 'ko_KR'}\\Support Files`;
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() =>
                          onChange({
                            ...config,
                            versionId: v.id,
                            isCustomPath: false,
                            customPath: computedPsPath,
                            customDatFileName: computedDat,
                          })
                        }
                        className={`p-3 rounded-xl border text-left transition-all relative cursor-pointer ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/60 shadow-sm ring-1 ring-blue-500'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/70'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs font-bold ${
                              isSelected ? 'text-blue-900' : 'text-slate-800'
                            }`}
                          >
                            {v.name}
                          </span>
                          {isSelected && (
                            <div className="w-2 h-2 rounded-full bg-blue-600" />
                          )}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1 truncate">
                          {v.year === 'CS6' ? (v.id.includes('32') ? 'CS6 32-bit' : 'CS6 64-bit') : `${v.year}`}
                        </p>
                      </button>
                    );
                  })}
            </div>
          </div>

          {/* Target Language Selection Section */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 mb-2.5">
              <div className="flex items-center gap-1.5">
                <div className={`p-1 rounded-md ${isIllustrator ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                  <Globe className="w-3.5 h-3.5" />
                </div>
                <label className="text-xs font-bold text-slate-800">
                  {t('targetLocaleLabel')}
                </label>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                  {currentLocalePreset.flag} {currentLocalePreset.name} [{currentLocalePreset.code}]
                </span>
              </div>
            </div>

            {/* Quick Access Badges for Popular Locales */}
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 mb-3">
              {POPULAR_LOCALE_CODES.map((code) => {
                const lp = getLocaleByCode(code);
                const isSelected = (config.locale || 'ko_KR') === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectLocale(code)}
                    className={`py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? isIllustrator
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs font-bold ring-1 ring-amber-600'
                          : 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold ring-1 ring-blue-600'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">{lp.flag}</span>
                    <span className="truncate">{lp.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Dropdown for All 24 Supported Locales */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/80">
              <label htmlFor="all-locales-select" className="text-xs font-semibold text-slate-600 flex items-center gap-1 whitespace-nowrap">
                <Languages className="w-3.5 h-3.5 text-slate-500" />
                24 Supported Locales:
              </label>
              <select
                id="all-locales-select"
                value={config.locale || 'ko_KR'}
                onChange={(e) => handleSelectLocale(e.target.value)}
                className="flex-1 text-xs border border-slate-300 rounded-lg px-3 py-1.5 bg-white text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
              >
                {SUPPORTED_LOCALES.map((l) => (
                  <option key={l.code} value={l.code}>
                    {l.flag} {l.name} ({l.nativeName}) - [{l.code}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      ) : (
        /* Mode B: Custom Path Direct Input */
        <div className="py-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="custom-path-input"
                className="block text-xs font-semibold text-slate-700"
              >
                {appName}{' '}
                <span className={isIllustrator ? 'text-amber-700 font-bold' : 'text-blue-600 font-bold'}>
                  {isIllustrator ? 'AMT' : 'Support Files'}
                </span>{' '}
                Folder Path
              </label>
              <button
                type="button"
                onClick={handlePasteCustomPath}
                className={`text-xs font-medium flex items-center gap-1 cursor-pointer ${
                  isIllustrator ? 'text-amber-700 hover:text-amber-800' : 'text-blue-600 hover:text-blue-700'
                }`}
              >
                <FolderOpen className="w-3.5 h-3.5" />
                {t('pasteClipboardBtn')}
              </button>
            </div>

            <div className="relative">
              <input
                id="custom-path-input"
                type="text"
                value={config.customPath}
                onChange={(e) =>
                  onChange({ ...config, customPath: e.target.value })
                }
                placeholder={t('customPathInputPlaceholder')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-slate-800 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              {config.customPath && (
                <button
                  type="button"
                  onClick={() => onChange({ ...config, customPath: '' })}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                  title="Clear"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Preset Buttons */}
          <div>
            <span className="text-xs font-semibold text-slate-600 block mb-2">
              Quick Path Presets:
            </span>
            <div className="flex flex-wrap gap-2">
              {isIllustrator ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetPath(
                        'C:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\AMT'
                      )
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono transition-colors cursor-pointer"
                  >
                    C:\ Default (2024)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetPath(
                        'D:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\AMT'
                      )
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono transition-colors cursor-pointer"
                  >
                    D:\ Drive (2024)
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetPath(
                        'D:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Locales\\ko_KR\\Support Files'
                      )
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono transition-colors cursor-pointer"
                  >
                    D:\ Drive (2024)
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handlePresetPath(
                        'C:\\Program Files (x86)\\Adobe\\Adobe Photoshop 2022\\Locales\\ko_KR\\Support Files'
                      )
                    }
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 font-mono transition-colors cursor-pointer"
                  >
                    Program Files (x86) (2022)
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Custom DAT or XML File Name */}
          <div className="pt-2 border-t border-slate-100">
            <label
              htmlFor="custom-dat-file"
              className="block text-xs font-semibold text-slate-700 mb-1"
            >
              {t('customDatFileLabel')}
            </label>
            <div className="flex items-center gap-2">
              <input
                id="custom-dat-file"
                type="text"
                value={config.customDatFileName}
                onChange={(e) =>
                  onChange({ ...config, customDatFileName: e.target.value })
                }
                placeholder={isIllustrator ? 'application.xml' : 'tw10428_Photoshop_ko_KR.dat'}
                className="flex-1 max-w-sm px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...config,
                    customDatFileName: isIllustrator
                      ? 'application.xml'
                      : 'tw10428_Photoshop_ko_KR.dat',
                  })
                }
                className="text-xs text-slate-500 hover:text-slate-800 underline cursor-pointer"
              >
                {t('resetDefaultBtn')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Resolved Path Summary Card */}
      <div className="mt-2 p-4 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            {t('activeTargetPreview')}
          </div>
          <p className="text-xs sm:text-sm font-mono text-slate-900 break-all bg-white px-3 py-2 rounded-lg border border-slate-200 select-all">
            {resolvedPath}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            {isIllustrator ? (
              <>
                Target: <strong className="text-slate-700 font-mono">{resolvedFile}</strong> (<code className="text-amber-800 bg-amber-50 px-1 py-0.2 rounded">&lt;Data key=&quot;installedLanguages&quot;&gt;ko_KR&lt;/Data&gt;</code> ⇄ <code className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded">en_US</code>)
              </>
            ) : (
              <>
                Target: <strong className="text-slate-700 font-mono">{resolvedFile}</strong> ⇄ <strong className="text-slate-700 font-mono">old_{resolvedFile}</strong>
              </>
            )}
          </p>
        </div>

        <button
          id="copy-path-btn"
          type="button"
          onClick={handleCopyPath}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:border-blue-400 hover:text-blue-600 text-slate-700 text-xs font-semibold shadow-2xs transition-all shrink-0 active:scale-95 cursor-pointer"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">{t('copiedBtn')}</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-500" />
              <span>{t('copyPathBtn')}</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};

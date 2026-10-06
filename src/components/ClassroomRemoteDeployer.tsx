import React, { useState } from 'react';
import {
  Network,
  Download,
  Copy,
  Check,
  ShieldCheck,
  Terminal,
  Layers,
  Sparkles,
  Info,
  CheckCircle2,
  Cpu,
  MonitorPlay,
  FileCode,
  Zap,
  Globe,
} from 'lucide-react';
import {
  generatePhotoshopClassroomSilentBat,
  downloadTextFile,
  downloadCmdFile,
  downloadAutoExeCompilerFile,
  type ExeMetadata,
} from '../utils/photoshopHelper';
import {
  generateIllustratorClassroomSilentBat,
  generateAllAdobeClassroomSilentBat,
} from '../utils/illustratorHelper';
import {
  SUPPORTED_LOCALES,
  POPULAR_LOCALE_CODES,
  getLocaleByCode,
} from '../utils/localeHelper';
import { ExePropertiesModal } from './ExePropertiesModal';
import { useI18n } from '../i18n/I18nContext';
import {
  APP_VERSION,
  APP_ORGANIZATION,
  APP_AUTHOR,
  APP_COPYRIGHT,
} from '../version';

type TargetApp = 'both' | 'photoshop' | 'illustrator';
type DeployMode = 'to_en' | 'to_ko' | 'toggle';

export const ClassroomRemoteDeployer: React.FC = () => {
  const { t } = useI18n();
  const [targetApp, setTargetApp] = useState<TargetApp>('both');
  const [deployMode, setDeployMode] = useState<DeployMode>('to_en');
  const [selectedLocale, setSelectedLocale] = useState<string>('ko_KR');
  const [copied, setCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [isExeModalOpen, setIsExeModalOpen] = useState(false);

  const currentLocale = getLocaleByCode(selectedLocale);

  // Generate script code
  const scriptContent = React.useMemo(() => {
    if (targetApp === 'both') {
      return generateAllAdobeClassroomSilentBat(deployMode, selectedLocale);
    } else if (targetApp === 'photoshop') {
      return generatePhotoshopClassroomSilentBat(deployMode, selectedLocale);
    } else {
      return generateIllustratorClassroomSilentBat(deployMode, selectedLocale);
    }
  }, [targetApp, deployMode, selectedLocale]);

  // Dynamic Filename
  const filename = React.useMemo(() => {
    const appPrefix = targetApp === 'both' ? 'adobe_all' : targetApp;
    const modeSuffix =
      deployMode === 'to_en'
        ? 'en_US'
        : deployMode === 'to_ko'
        ? selectedLocale
        : `toggle_${selectedLocale}`;
    return `classroom_${appPrefix}_${modeSuffix}_silent.bat`;
  }, [targetApp, deployMode, selectedLocale]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(scriptContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const getDefaultExeMetadata = (): ExeMetadata => {
    const title = targetApp === 'both'
      ? 'Adobe Photoshop & Illustrator Classroom Silent Switcher'
      : targetApp === 'photoshop'
      ? 'Adobe Photoshop Classroom Silent Switcher'
      : 'Adobe Illustrator Classroom Silent Switcher';
    const desc = targetApp === 'both'
      ? 'Adobe Photoshop & Illustrator Classroom Silent Language Switcher'
      : targetApp === 'photoshop'
      ? 'Adobe Photoshop Classroom Silent Language Switcher'
      : 'Adobe Illustrator Classroom Silent Language Switcher';

    const modeText =
      deployMode === 'to_en'
        ? 'English (en_US) Batch'
        : deployMode === 'to_ko'
        ? `${currentLocale.name} Batch`
        : `${currentLocale.name} ⇄ English Smart Toggle`;

    return {
      title: `${title} [${currentLocale.code}]`,
      description: `${desc} (${modeText})`,
      company: APP_ORGANIZATION,
      product: 'Adobe Classroom Language Switcher Suite',
      copyright: APP_COPYRIGHT,
      trademark: `Official Core Engine: ${APP_ORGANIZATION} | ${APP_AUTHOR}`,
      version: `${APP_VERSION}.0`,
      informationalVersion: APP_VERSION,
      originalFilename: filename.replace(/\.(bat|cmd|ps1)$/i, '.exe'),
    };
  };

  const handleDownload = () => {
    downloadTextFile(scriptContent, filename, { isWindowsCrlf: true, withBom: false });
  };

  const handleDownloadCmd = () => {
    downloadCmdFile(scriptContent, filename);
  };

  const handleDownloadExeCompiler = (customMeta?: ExeMetadata) => {
    downloadAutoExeCompilerFile(scriptContent, filename, customMeta || getDefaultExeMetadata());
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-5 sm:p-6 mb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 shrink-0">
            <Network className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-800">
                {t('stepClassroomTitle')}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                {t('classroomSilentBadge')}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {t('stepClassroomDesc')}
            </p>
          </div>
        </div>
      </div>

      {/* 4 Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-5">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700 shrink-0 mt-0.5">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">UAC Pre-Check &amp; Anti-Loop</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Built-in loop prevention guard (<code className="text-slate-700 font-mono">am_admin</code>) and UTF-8 encoding.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-700 shrink-0 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Auto Summary &amp; 5s Auto-Close</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Displays modified version count and exits automatically in 5s without blocking remote runners.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Process Conflict Prevention</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Pre-terminates running instances safely with <code className="text-slate-700 font-mono">taskkill</code> to prevent file lock errors.
            </p>
          </div>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
            <Terminal className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800">Audit Logging</h4>
            <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">
              Writes execution logs to <code className="text-slate-700 font-mono">%TEMP%\adobe_*_deploy.log</code> on each target machine.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration Grid */}
      <div className="space-y-4 mb-5">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Target App */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
            <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-indigo-600" />
                {t('classroomTargetAppLabel')}
              </span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTargetApp('both')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  targetApp === 'both'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs flex items-center gap-1">
                  <span>{t('classroomTargetBoth')}</span>
                  {targetApp === 'both' && <Sparkles className="w-3.5 h-3.5 ml-auto text-amber-300" />}
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTargetApp('photoshop')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  targetApp === 'photoshop'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{t('classroomTargetPsOnly')}</div>
              </button>

              <button
                type="button"
                onClick={() => setTargetApp('illustrator')}
                className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                  targetApp === 'illustrator'
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-bold text-xs">{t('classroomTargetAiOnly')}</div>
              </button>
            </div>
          </div>

          {/* Target Language */}
          <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-indigo-600" />
                {t('targetLocaleLabel')}
              </label>
              <span className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {currentLocale.flag} {currentLocale.name} ({currentLocale.code})
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 mb-2.5">
              {POPULAR_LOCALE_CODES.map((code) => {
                const loc = getLocaleByCode(code);
                const isSelected = selectedLocale === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setSelectedLocale(code)}
                    className={`px-2 py-1 rounded-md text-[11px] font-medium transition-all flex items-center gap-1 border cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <span>{loc.flag}</span>
                    <span>{loc.name}</span>
                  </button>
                );
              })}
            </div>

            <div className="relative">
              <select
                value={selectedLocale}
                onChange={(e) => setSelectedLocale(e.target.value)}
                className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 font-medium focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              >
                {SUPPORTED_LOCALES.map((loc) => (
                  <option key={loc.code} value={loc.code}>
                    {loc.flag} {loc.name} ({loc.nativeName}) - [{loc.code}]
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Deploy Mode */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-4">
          <label className="block text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <MonitorPlay className="w-4 h-4 text-indigo-600" />
              {t('classroomDeployModeLabel')}
            </span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <button
              type="button"
              onClick={() => setDeployMode('to_en')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                deployMode === 'to_en'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1">
                <span>{t('classroomModeToEn')}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeployMode('to_ko')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                deployMode === 'to_ko'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1">
                <span>{t('classroomModeToKo')}</span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDeployMode('toggle')}
              className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                deployMode === 'toggle'
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-bold text-xs flex items-center gap-1">
                <span>{t('classroomModeToggle')}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 bg-indigo-50/60 border border-indigo-100 rounded-xl mb-4">
        <div className="flex items-center gap-2">
          <FileCode className="w-5 h-5 text-indigo-600 shrink-0" />
          <div className="min-w-0">
            <span className="text-xs font-mono font-bold text-indigo-950 truncate block">
              {filename}
            </span>
            <span className="text-[11px] text-indigo-700">
              Windows CRLF &amp; UTF-8 BOM Safe
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            {showPreview ? t('hideCodePreview') : t('showCodePreview')}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? t('copiedBtn') : t('copyScriptBtn')}
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-3 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-100 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            {t('downloadBat')}
          </button>
          <button
            type="button"
            onClick={handleDownloadCmd}
            className="px-3.5 py-2 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            {t('downloadCmd')}
          </button>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleDownloadExeCompiler()}
              className="px-3.5 py-2 text-xs font-bold rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md flex items-center gap-1.5 transition-all cursor-pointer border border-blue-400/30"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {t('downloadExeCompiler')}
            </button>
            <button
              type="button"
              onClick={() => setIsExeModalOpen(true)}
              className="px-2.5 py-2 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white shadow-2xs flex items-center gap-1 transition-all cursor-pointer border border-blue-400/30"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t('propertiesModalBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Preview */}
      {showPreview && (
        <div className="mt-4 mb-5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 p-4 font-mono text-xs overflow-x-auto max-h-72">
          <pre className="whitespace-pre">{scriptContent}</pre>
        </div>
      )}

      {/* Notice & Remote execution tip */}
      <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/70 text-xs text-slate-600 space-y-2">
        <div className="font-bold text-slate-800 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-indigo-600" />
          {t('classroomNoticeTitle')}
        </div>
        <p className="text-[11px] leading-relaxed text-slate-600">
          {t('classroomNoticeDesc')}
        </p>
      </div>

      {/* Windows PE Properties Modal */}
      <ExePropertiesModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        defaultMetadata={getDefaultExeMetadata()}
        targetFilename={filename}
        onDownload={(customMeta) => {
          handleDownloadExeCompiler(customMeta);
        }}
      />
    </div>
  );
};

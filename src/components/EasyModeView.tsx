import React, { useState, useMemo } from 'react';
import {
  Sparkles,
  Zap,
  CheckCircle2,
  FolderOpen,
  Download,
  FileCode,
  ArrowRightLeft,
  ShieldCheck,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Copy,
  Check,
  AlertCircle,
  Monitor,
  Terminal,
  Play,
  RotateCcw,
  Sliders,
  Globe,
  Search,
  Languages,
  X,
} from 'lucide-react';
import { PathConfig, AdobeAppType } from '../types';
import {
  PHOTOSHOP_VERSIONS,
  resolveFolderPath,
  resolveDatFileName,
  resolveVersionYear,
  generateSmartToggleBat,
  generateToEnglishBat,
  generateToKoreanBat,
  downloadTextFile,
  downloadAutoExeCompilerFile,
} from '../utils/photoshopHelper';
import {
  ILLUSTRATOR_VERSIONS,
  getIllustratorDefaultPath,
  generateIllustratorSmartToggleBat,
  generateIllustratorToEnglishBat,
  generateIllustratorToKoreanBat,
} from '../utils/illustratorHelper';
import {
  isFileSystemAccessSupported,
  openPhotoshopDirectory,
  applyEnglishMode,
  applyKoreanMode,
  toggleIllustratorXmlLanguage,
  isRunningInIframe,
} from '../utils/fileSystemAccess';
import {
  SUPPORTED_LOCALES,
  POPULAR_LOCALE_CODES,
  getLocaleByCode,
  getDatFileNameForLocale,
} from '../utils/localeHelper';
import { useI18n } from '../i18n/I18nContext';
import { APP_VERSION_FULL, APP_GITHUB_PROFILE } from '../version';

interface EasyModeViewProps {
  config: PathConfig;
  onConfigChange: React.Dispatch<React.SetStateAction<PathConfig>>;
  onSwitchToPro: () => void;
}

// Prominent quick-access locales for chips
const PRIMARY_CHIP_LOCALES = [
  'ko_KR',
  'en_US',
  'ja_JP',
  'zh_CN',
  'zh_TW',
  'de_DE',
  'fr_FR',
  'es_ES',
  'it_IT',
  'ru_RU',
  'pt_BR',
  'pl_PL',
  'tr_TR',
];

export const EasyModeView: React.FC<EasyModeViewProps> = ({
  config,
  onConfigChange,
  onSwitchToPro,
}) => {
  const { t } = useI18n();
  const inIframe = typeof window !== 'undefined' && isRunningInIframe();
  const [targetAction, setTargetAction] = useState<'toggle' | 'korean' | 'english'>('toggle');
  const [executionMethod, setExecutionMethod] = useState<'browser' | 'exe' | 'bat'>(
    inIframe ? 'exe' : 'browser'
  );
  const [copiedPath, setCopiedPath] = useState(false);
  const [faqOpen, setFaqOpen] = useState<number | null>(null);
  const [isIframeError, setIsIframeError] = useState(false);

  // Multilingual quick chip states
  const [isAllLocalesOpen, setIsAllLocalesOpen] = useState(false);
  const [localeSearch, setLocaleSearch] = useState('');

  // In-Browser Direct Control State
  const [isBrowserLoading, setIsBrowserLoading] = useState(false);
  const [browserSuccessMsg, setBrowserSuccessMsg] = useState<string | null>(null);
  const [browserErrorMsg, setBrowserErrorMsg] = useState<string | null>(null);
  const [detectedFolderStatus, setDetectedFolderStatus] = useState<'korean' | 'english' | null>(null);
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(null);

  const isIllustrator = config.appType === 'illustrator';
  const isBrowserAccessAvailable = isFileSystemAccessSupported();
  const folderPath = resolveFolderPath(config);
  const datFileName = resolveDatFileName(config);

  const activeLocaleCode = config.locale || 'ko_KR';
  const currentLocalePreset = getLocaleByCode(activeLocaleCode);

  // List of chip locales ensuring currently selected locale is always visible in chips
  const visibleChipCodes = useMemo(() => {
    if (PRIMARY_CHIP_LOCALES.includes(activeLocaleCode)) {
      return PRIMARY_CHIP_LOCALES;
    }
    return [...PRIMARY_CHIP_LOCALES, activeLocaleCode];
  }, [activeLocaleCode]);

  // Search filtered full locales
  const filteredLocales = useMemo(() => {
    if (!localeSearch.trim()) return SUPPORTED_LOCALES;
    const q = localeSearch.toLowerCase().trim();
    return SUPPORTED_LOCALES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nativeName.toLowerCase().includes(q) ||
        l.englishName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    );
  }, [localeSearch]);

  // Handle Quick Select Chip Selection
  const handleSelectLocale = (newLocale: string) => {
    const isCs6 = config.versionId === 'ps_cs6' || config.versionId === 'ps_cs6_32';
    const newDat = isIllustrator ? 'application.xml' : getDatFileNameForLocale(newLocale, isCs6);

    // If user clicked English chip, default action to english
    if (newLocale === 'en_US') {
      setTargetAction('english');
    } else if (targetAction === 'english') {
      // If switching from english to another native language, set to toggle
      setTargetAction('toggle');
    }

    onConfigChange((prev) => {
      const psVersion = PHOTOSHOP_VERSIONS.find((v) => v.id === prev.versionId) || PHOTOSHOP_VERSIONS[2];
      const drive = prev.drive || 'C';
      const os = prev.os || 'windows';
      const newPath = os === 'macos'
        ? `/Applications/${psVersion.folderName}/Locales/${newLocale}/Support Files`
        : `${drive}:\\Program Files\\Adobe\\${psVersion.folderName}\\Locales\\${newLocale}\\Support Files`;

      return {
        ...prev,
        locale: newLocale,
        isCustomPath: false,
        customDatFileName: newDat,
        customPath: isIllustrator ? prev.customPath : newPath,
      };
    });
  };

  // Handle App Change
  const handleSelectApp = (app: AdobeAppType) => {
    const currentLoc = config.locale || 'ko_KR';
    const drive = config.drive || 'C';
    const os = config.os || 'windows';

    if (app === 'illustrator') {
      const defaultAi = ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) || ILLUSTRATOR_VERSIONS[2];
      const newPath = getIllustratorDefaultPath(defaultAi, drive, os);
      onConfigChange((prev) => ({
        ...prev,
        appType: 'illustrator',
        versionId: defaultAi.id,
        isCustomPath: false,
        customPath: newPath,
        customDatFileName: 'application.xml',
      }));
    } else {
      const defaultPs = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) || PHOTOSHOP_VERSIONS[2];
      const isCs6 = defaultPs.year === 'CS6';
      const newPath = os === 'macos'
        ? `/Applications/${defaultPs.folderName}/Locales/${currentLoc}/Support Files`
        : `${drive}:\\Program Files\\Adobe\\${defaultPs.folderName}\\Locales\\${currentLoc}\\Support Files`;
      onConfigChange((prev) => ({
        ...prev,
        appType: 'photoshop',
        versionId: defaultPs.id,
        isCustomPath: false,
        customPath: newPath,
        customDatFileName: getDatFileNameForLocale(currentLoc, isCs6),
      }));
    }
  };

  // Handle Version Change
  const handleSelectVersion = (versionId: string) => {
    onConfigChange((prev) => {
      const isAi = prev.appType === 'illustrator';
      const currentLoc = prev.locale || 'ko_KR';
      const drive = prev.drive || 'C';
      const os = prev.os || 'windows';

      if (isAi) {
        const found = ILLUSTRATOR_VERSIONS.find((v) => v.id === versionId) || ILLUSTRATOR_VERSIONS[2];
        const newPath = getIllustratorDefaultPath(found, drive, os);
        return {
          ...prev,
          versionId: found.id,
          isCustomPath: false,
          customPath: newPath,
          customDatFileName: 'application.xml',
        };
      } else {
        const found = PHOTOSHOP_VERSIONS.find((v) => v.id === versionId) || PHOTOSHOP_VERSIONS[2];
        const isCs6 = found.year === 'CS6';
        const newDat = getDatFileNameForLocale(currentLoc, isCs6);
        const newPath = os === 'macos'
          ? `/Applications/${found.folderName}/Locales/${currentLoc}/Support Files`
          : `${drive}:\\Program Files\\Adobe\\${found.folderName}\\Locales\\${currentLoc}\\Support Files`;
        return {
          ...prev,
          versionId: found.id,
          isCustomPath: false,
          customDatFileName: newDat,
          customPath: newPath,
        };
      }
    });
  };

  // Copy Path
  const handleCopyPath = () => {
    navigator.clipboard.writeText(folderPath);
    setCopiedPath(true);
    setTimeout(() => setCopiedPath(false), 2000);
  };

  // Execute In-Browser Change
  const handleInBrowserDirectAction = async () => {
    setIsBrowserLoading(true);
    setBrowserSuccessMsg(null);
    setBrowserErrorMsg(null);
    setIsIframeError(false);

    try {
      const { directoryHandle, info } = await openPhotoshopDirectory(datFileName);
      setDirHandle(directoryHandle);

      if (info.currentMode === 'korean') {
        setDetectedFolderStatus('korean');
      } else if (info.currentMode === 'english') {
        setDetectedFolderStatus('english');
      }

      if (isIllustrator) {
        const mode = targetAction === 'toggle' ? undefined : (targetAction === 'english' ? 'english' : 'korean');
        const newMode = await toggleIllustratorXmlLanguage(directoryHandle, mode, config.locale || 'ko_KR');
        setDetectedFolderStatus(newMode === 'english' ? 'english' : 'korean');
        const langName = newMode === 'english' ? '영문(English)' : `${currentLocalePreset.name}(${currentLocalePreset.nativeName})`;
        setBrowserSuccessMsg(`성공! 일러스트레이터가 ${langName} 모드로 변경되었습니다.`);
      } else {
        // Photoshop Direct Action
        if (targetAction === 'english' || (targetAction === 'toggle' && info.currentMode === 'korean')) {
          await applyEnglishMode(directoryHandle, datFileName);
          setDetectedFolderStatus('english');
          setBrowserSuccessMsg(`성공! 포토샵이 영문(English) 모드로 변경되었습니다.`);
        } else if (targetAction === 'korean' || (targetAction === 'toggle' && info.currentMode === 'english')) {
          await applyKoreanMode(directoryHandle, datFileName);
          setDetectedFolderStatus('korean');
          setBrowserSuccessMsg(`성공! 포토샵이 ${currentLocalePreset.name}(${currentLocalePreset.nativeName}) 모드로 변경되었습니다.`);
        } else {
          // If file not found or unknown
          setBrowserSuccessMsg(`폴더가 연결되었습니다. 현재 상태: ${info.currentMode === 'korean' ? `${currentLocalePreset.name} 모드` : info.currentMode === 'english' ? '영문 모드' : '확인 필요'}`);
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          // User closed folder picker
          return;
        }
        const isSecurityOrIframe =
          err.name === 'SecurityError' ||
          err.message.includes('CROSS_ORIGIN_IFRAME_RESTRICTED') ||
          err.message.includes('Cross origin') ||
          err.message.includes('sub frames');

        if (isSecurityOrIframe) {
          setIsIframeError(true);
          setBrowserErrorMsg(
            'Google AI Studio 미리보기(iframe) 환경에서는 브라우저 보안 규정에 의해 파일 탐색기 직접 열기가 제한됩니다. 아래의 [새 탭에서 열기] 또는 [원클릭 실행기(.exe)]를 이용해 주세요.'
          );
          return;
        }
        setBrowserErrorMsg(err.message || '폴더 접근 중 오류가 발생했습니다.');
      } else {
        setBrowserErrorMsg('알 수 없는 오류가 발생했습니다.');
      }
    } finally {
      setIsBrowserLoading(false);
    }
  };

  // Download 1-Click Executable Builder
  const handleDownloadExe = () => {
    let scriptContent = '';
    const year = resolveVersionYear(config);
    const actionSuffix = targetAction === 'toggle' ? 'Toggle' : targetAction === 'english' ? 'English' : 'Korean';
    const filename = isIllustrator
      ? `Illustrator_${year}_Language_Switcher_${actionSuffix}`
      : `Photoshop_${year}_Language_Switcher_${actionSuffix}`;

    if (isIllustrator) {
      if (targetAction === 'english') {
        scriptContent = generateIllustratorToEnglishBat(folderPath, datFileName, config.locale || 'ko_KR');
      } else if (targetAction === 'korean') {
        scriptContent = generateIllustratorToKoreanBat(folderPath, datFileName, config.locale || 'ko_KR');
      } else {
        scriptContent = generateIllustratorSmartToggleBat(folderPath, datFileName, config.locale || 'ko_KR');
      }
    } else {
      if (targetAction === 'english') {
        scriptContent = generateToEnglishBat(folderPath, datFileName);
      } else if (targetAction === 'korean') {
        scriptContent = generateToKoreanBat(folderPath, datFileName);
      } else {
        scriptContent = generateSmartToggleBat(folderPath, datFileName);
      }
    }

    downloadAutoExeCompilerFile(scriptContent, filename, {
      title: `${isIllustrator ? 'Illustrator' : 'Photoshop'} ${year} Language Switcher`,
      description: `One-Click Language Switcher for ${isIllustrator ? 'Adobe Illustrator' : 'Adobe Photoshop'} ${year} (${currentLocalePreset.name})`,
      informationalVersion: APP_VERSION_FULL,
    });
  };

  // Download Simple BAT
  const handleDownloadBat = () => {
    let scriptContent = '';
    const year = resolveVersionYear(config);
    const actionSuffix = targetAction === 'toggle' ? 'Toggle' : targetAction === 'english' ? 'English' : 'Korean';
    const filename = isIllustrator
      ? `Illustrator_${year}_Language_Switcher_${actionSuffix}.bat`
      : `Photoshop_${year}_Language_Switcher_${actionSuffix}.bat`;

    if (isIllustrator) {
      if (targetAction === 'english') {
        scriptContent = generateIllustratorToEnglishBat(folderPath, datFileName, config.locale || 'ko_KR');
      } else if (targetAction === 'korean') {
        scriptContent = generateIllustratorToKoreanBat(folderPath, datFileName, config.locale || 'ko_KR');
      } else {
        scriptContent = generateIllustratorSmartToggleBat(folderPath, datFileName, config.locale || 'ko_KR');
      }
    } else {
      if (targetAction === 'english') {
        scriptContent = generateToEnglishBat(folderPath, datFileName);
      } else if (targetAction === 'korean') {
        scriptContent = generateToKoreanBat(folderPath, datFileName);
      } else {
        scriptContent = generateSmartToggleBat(folderPath, datFileName);
      }
    }

    downloadTextFile(scriptContent, filename, { isWindowsCrlf: true, withBom: true });
  };

  const toggleFaq = (index: number) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <section className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 text-white rounded-3xl p-6 sm:p-8 shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-white/20 backdrop-blur-md text-white border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              💡 일반 사용자 간편 모드
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
              <ShieldCheck className="w-3.5 h-3.5" />
              100% 무손실 안전 보장
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono bg-black/30 text-white/90">
              {APP_VERSION_FULL}
            </span>
            <a
              href={APP_GITHUB_PROFILE}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-white/20 hover:bg-white/30 text-white transition-colors border border-white/25 ml-auto sm:ml-0"
              title="개발자: AhBiYout (ahbiyout-all - 공식 GitHub)"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>개발자: AhBiYout</span>
            </a>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            어도비 포토샵 & 일러스트레이터 원클릭 언어 변경기
          </h2>
          <p className="text-white/80 text-sm sm:text-base max-w-2xl leading-relaxed">
            복잡한 시스템 설정이나 파일 이름 변경 없이, <strong>딱 3단계 선택</strong>만으로 한국어, 영어, 일본어, 중국어 등 전 세계 언어 메뉴를 자유롭게 오갈 수 있습니다.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-xs sm:text-sm text-white/90 pt-4 border-t border-white/15">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">1</span>
              <span>프로그램 및 버전</span>
            </div>
            <span className="text-white/30">→</span>
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">2</span>
              <span>목표 언어 칩 선택</span>
            </div>
            <span className="text-white/30">→</span>
            <div className="flex items-center gap-2 font-bold text-amber-300">
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-900 flex items-center justify-center font-bold text-xs">3</span>
              <span>원클릭 실행</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main 3-Step Wizard Container */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-8">
        {/* STEP 1: Application & Version Selection */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
              1
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              사용 중인 프로그램과 버전을 선택하세요
            </h3>
          </div>

          {/* Program Toggle (Photoshop vs Illustrator) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <button
              type="button"
              onClick={() => handleSelectApp('photoshop')}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer ${
                !isIllustrator
                  ? 'border-blue-600 bg-blue-50/60 ring-4 ring-blue-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                Ps
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900">Adobe Photoshop</span>
                  {!isIllustrator && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  포토샵 CC 2026 ~ CS6 전 버전 다국어 지원
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleSelectApp('illustrator')}
              className={`p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 cursor-pointer ${
                isIllustrator
                  ? 'border-amber-500 bg-amber-50/60 ring-4 ring-amber-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-black text-xl flex items-center justify-center shrink-0 shadow-md">
                Ai
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-slate-900">Adobe Illustrator</span>
                  {isIllustrator && (
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-600 text-white">
                      선택됨
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  일러스트레이터 AMT application.xml 언어 제어
                </p>
              </div>
            </button>
          </div>

          {/* Version Pills */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80">
            <label className="block text-xs font-bold text-slate-600 mb-2">
              설치된 연도 버전 선택:
            </label>
            <div className="flex flex-wrap gap-2">
              {(isIllustrator ? ILLUSTRATOR_VERSIONS : PHOTOSHOP_VERSIONS).map((ver) => {
                const isSelected = config.versionId === ver.id;
                return (
                  <button
                    key={ver.id}
                    type="button"
                    onClick={() => handleSelectVersion(ver.id)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isIllustrator
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/20'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    {ver.name}
                  </button>
                );
              })}
            </div>

            {/* Target Path Display */}
            <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500 font-mono">
              <span className="truncate mr-2">
                경로: {folderPath}
              </span>
              <button
                type="button"
                onClick={handleCopyPath}
                className="shrink-0 flex items-center gap-1 text-slate-700 hover:text-blue-600 font-sans font-bold bg-white px-2 py-1 rounded-lg border border-slate-200 cursor-pointer"
              >
                {copiedPath ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedPath ? '복사됨!' : '경로 복사'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* STEP 2: Target Language & Action Selection */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2.5">
              <span className={`w-7 h-7 rounded-xl ${isIllustrator ? 'bg-amber-600' : 'bg-blue-600'} text-white font-black text-sm flex items-center justify-center shadow-md`}>
                2
              </span>
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  목표 언어 및 전환 동작 선택
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  한글/영어뿐만 아니라 전 세계 주요 언어를 퀵 셀렉트 칩으로 원클릭 선택할 수 있습니다.
                </p>
              </div>
            </div>

            {/* Currently Selected Language Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 self-start sm:self-auto text-xs font-bold text-slate-700">
              <span className="text-slate-500 font-normal">선택된 언어:</span>
              <span className="text-base leading-none">{currentLocalePreset.flag}</span>
              <span className="text-slate-900 font-extrabold">{currentLocalePreset.name}</span>
              <span className="text-[10px] font-mono text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                {currentLocalePreset.code}
              </span>
            </div>
          </div>

          {/* Quick Select Chip Buttons Container */}
          <div className="mb-5 bg-gradient-to-r from-slate-50 via-slate-50/70 to-indigo-50/30 rounded-2xl p-4 border border-slate-200/90 shadow-2xs">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-1.5">
                <Globe className={`w-4 h-4 ${isIllustrator ? 'text-amber-600' : 'text-blue-600'}`} />
                <span className="text-xs font-extrabold text-slate-800">
                  🌐 지원 언어 퀵 셀렉트 칩 (원클릭 칩 선택):
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAllLocalesOpen(!isAllLocalesOpen)}
                className={`text-xs font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg transition-colors cursor-pointer ${
                  isAllLocalesOpen
                    ? isIllustrator ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                <span>{isAllLocalesOpen ? '접기' : '전체 24개 언어 보기'}</span>
                {isAllLocalesOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Popular Quick Chips Bar */}
            <div className="flex flex-wrap gap-2">
              {visibleChipCodes.map((code) => {
                const lp = getLocaleByCode(code);
                const isSelected = activeLocaleCode === code;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => handleSelectLocale(code)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? isIllustrator
                          ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30 ring-2 ring-amber-400/50 scale-102'
                          : 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50 scale-102'
                        : 'bg-white border border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-100/80 hover:text-slate-900 shadow-2xs'
                    }`}
                  >
                    <span className="text-sm leading-none">{lp.flag}</span>
                    <span>{lp.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-white ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Expandable All 24 Locales Drawer */}
            {isAllLocalesOpen && (
              <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2.5 animate-in fade-in duration-150">
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={localeSearch}
                      onChange={(e) => setLocaleSearch(e.target.value)}
                      placeholder="국가/언어 이름 검색 (예: 일본어, de, French, Español, Russian)..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    {localeSearch && (
                      <button
                        type="button"
                        onClick={() => setLocaleSearch('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  <span className="text-[11px] font-mono text-slate-500 shrink-0">
                    {filteredLocales.length}개 지원
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {filteredLocales.map((loc) => {
                    const isSelected = activeLocaleCode === loc.code;
                    return (
                      <button
                        key={loc.code}
                        type="button"
                        onClick={() => handleSelectLocale(loc.code)}
                        className={`p-2 rounded-xl text-left border transition-all text-xs flex items-center gap-2 cursor-pointer ${
                          isSelected
                            ? isIllustrator
                              ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                              : 'bg-blue-600 text-white border-blue-600 font-bold shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-base shrink-0">{loc.flag}</span>
                        <div className="min-w-0 flex-1 truncate">
                          <div className="font-semibold truncate">{loc.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {loc.code}
                          </div>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* 3 Dynamic Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Auto Smart Toggle (Recommended) */}
            <button
              type="button"
              onClick={() => setTargetAction('toggle')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                targetAction === 'toggle'
                  ? isIllustrator
                    ? 'border-amber-600 bg-amber-50/70 ring-4 ring-amber-500/10 shadow-sm'
                    : 'border-indigo-600 bg-indigo-50/70 ring-4 ring-indigo-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🔄</span>
                {targetAction === 'toggle' && (
                  <span className={`px-2 py-0.5 rounded text-[11px] font-bold text-white ${isIllustrator ? 'bg-amber-600' : 'bg-indigo-600'}`}>
                    추천
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                스마트 자동 토글 ({currentLocalePreset.name} ⇄ 영문)
              </div>
              <p className="text-xs text-slate-500 mt-1">
                실행할 때마다 현재 상태를 감지하여 {currentLocalePreset.name}와 영문 메뉴로 자동 전환합니다.
              </p>
            </button>

            {/* To English */}
            <button
              type="button"
              onClick={() => setTargetAction('english')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                targetAction === 'english'
                  ? 'border-blue-600 bg-blue-50/70 ring-4 ring-blue-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">🇺🇸</span>
                {targetAction === 'english' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-600 text-white">
                    선택됨
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                영문(English)으로 변경
              </div>
              <p className="text-xs text-slate-500 mt-1">
                해외 유튜브 강좌 수강, 글로벌 튜토리얼 및 영문 플러그인 호환에 적합합니다.
              </p>
            </button>

            {/* To Native/Selected Locale */}
            <button
              type="button"
              onClick={() => setTargetAction('korean')}
              className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                targetAction === 'korean'
                  ? 'border-emerald-600 bg-emerald-50/70 ring-4 ring-emerald-500/10 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{currentLocalePreset.flag}</span>
                {targetAction === 'korean' && (
                  <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-600 text-white">
                    선택됨
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-sm">
                {currentLocalePreset.name}({currentLocalePreset.nativeName})로 복구
              </div>
              <p className="text-xs text-slate-500 mt-1">
                원래의 익숙하고 직관적인 {currentLocalePreset.name} 메뉴 인터페이스로 복원합니다.
              </p>
            </button>
          </div>
        </div>

        {/* STEP 3: Execution Method Selection */}
        <div>
          <div className="flex items-center gap-2.5 mb-4">
            <span className="w-7 h-7 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center shadow-md shadow-blue-500/20">
              3
            </span>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">
              가장 편한 방식으로 실행하세요
            </h3>
          </div>

          {/* Execution Strategy Tabs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setExecutionMethod('browser')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                executionMethod === 'browser'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <Zap className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-blue-700 uppercase tracking-wider block">
                    {inIframe ? '방법 A (단독 탭 전용)' : '방법 A (추천)'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">웹 브라우저에서 바로 변경</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                {inIframe
                  ? '단독 새 탭에서 열어 파일 다운로드 없이 1초 만에 언어를 바꿉니다.'
                  : '파일 다운로드 없이 웹에서 폴더를 선택하고 1초 만에 언어를 바꿉니다.'}
              </p>
            </button>

            <button
              type="button"
              onClick={() => setExecutionMethod('exe')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                executionMethod === 'exe'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-700 uppercase tracking-wider block">
                    {inIframe ? '방법 B (미리보기 환경 추천)' : '방법 B (인기)'}
                  </span>
                  <span className="text-sm font-bold text-slate-900">원클릭 실행 파일 (.exe)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                바탕화면에 두고 더블클릭할 때마다 언어가 바뀌는 전용 실행기입니다.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setExecutionMethod('bat')}
              className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between cursor-pointer ${
                executionMethod === 'bat'
                  ? 'bg-purple-50/80 border-purple-500 ring-2 ring-purple-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <FileCode className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-purple-700 uppercase tracking-wider block">방법 C (초경량)</span>
                  <span className="text-sm font-bold text-slate-900">배치 스크립트 (.bat)</span>
                </div>
              </div>
              <p className="text-xs text-slate-500">
                백신 검사 등에 민감한 환경을 위한 100% 투명한 텍스트 스크립트입니다.
              </p>
            </button>
          </div>

          {/* Action Panel for Selected Execution Method */}
          <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
            {/* METHOD A: Direct In-Browser */}
            {executionMethod === 'browser' && (
              <div className="space-y-4">
                {/* Iframe Advisory Banner */}
                {inIframe && (
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1.5 flex-1">
                        <div className="font-extrabold text-sm text-amber-950 flex items-center gap-2">
                          <span>⚠️ 미리보기 창(iframe) 브라우저 보안 규정 안내</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200/80 text-amber-900 font-mono">
                            Cross-Origin Restriction
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                          현재 화면은 AI Studio 미리보기(iframe 내부)에서 동작 중입니다. 크롬/엣지 브라우저의 W3C 글로벌 보안 정책에 따라 <strong>서브프레임 내부에서는 파일 탐색기(showDirectoryPicker) 호출이 엄격히 차단</strong>됩니다.
                        </p>
                        <div className="pt-1.5 flex flex-wrap items-center gap-2">
                          <a
                            href={typeof window !== 'undefined' ? window.location.href : '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>새 창(단독 탭)에서 열기 (웹 직접 변경 정상 작동)</span>
                          </a>
                          <button
                            type="button"
                            onClick={() => setExecutionMethod('exe')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                            <span>방법 B (원클릭 .exe 실행 파일)로 즉시 변경</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExecutionMethod('bat')}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-sm transition-colors cursor-pointer"
                          >
                            <FileCode className="w-3.5 h-3.5" />
                            <span>방법 C (배치 스크립트 .bat) 다운로드</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>🌐 웹 브라우저에서 폴더 선택 후 1초 변경</span>
                      {isBrowserAccessAvailable ? (
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                          inIframe ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {inIframe ? '단독 탭에서 지원됨' : '브라우저 지원됨'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-800">
                          Chrome/Edge 권장
                        </span>
                      )}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      별도의 프로그램을 다운로드하지 않고, 브라우저에서 {isIllustrator ? '일러스트레이터' : '포토샵'} 언어 폴더를 열어 바로 언어를 바꿉니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleInBrowserDirectAction}
                    disabled={isBrowserLoading}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-white bg-blue-600 hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                  >
                    {isBrowserLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>처리 중...</span>
                      </>
                    ) : (
                      <>
                        <FolderOpen className="w-5 h-5" />
                        <span>폴더 선택하고 바로 변경하기</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Feedback Alerts */}
                {browserSuccessMsg && (
                  <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div className="text-sm font-bold">{browserSuccessMsg}</div>
                  </div>
                )}

                {/* Iframe Security Error Resolution Banner */}
                {isIframeError && (
                  <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 space-y-3 shadow-sm animate-in fade-in duration-200">
                    <div className="flex items-center gap-2 font-black text-amber-950 text-sm">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                      <span>브라우저 보안 규정: iframe 내 파일 탐색기 호출 제한</span>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      현재 접속하신 창은 AI Studio 미리보기(iframe) 환경입니다. 브라우저 보안 규정상 서브프레임 내부에서는 파일 탐색기를 직접 열 수 없습니다.<br />
                      아래 <strong>[새 탭에서 열기]</strong>를 누르시면 단독 창에서 브라우저 직접 변경이 즉시 동작하며, 또는 <strong>원클릭 실행기(.exe)</strong>를 다운로드하여 즉시 변경하실 수 있습니다.
                    </p>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <a
                        href={typeof window !== 'undefined' ? window.location.href : '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all cursor-pointer"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>새 탭에서 열기 (단독 창에서 즉시 변경)</span>
                      </a>
                      <button
                        type="button"
                        onClick={() => {
                          setExecutionMethod('exe');
                          handleDownloadExe();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>원클릭 실행기(.exe) 다운로드</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setExecutionMethod('bat');
                          handleDownloadBat();
                        }}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-black bg-purple-600 hover:bg-purple-700 text-white shadow-md transition-all cursor-pointer"
                      >
                        <FileCode className="w-4 h-4" />
                        <span>배치 파일(.bat) 다운로드</span>
                      </button>
                    </div>
                  </div>
                )}

                {!isIframeError && browserErrorMsg && (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                    <div className="text-sm font-semibold">{browserErrorMsg}</div>
                  </div>
                )}

                {/* Helpful Instruction Tip */}
                <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200/80 text-xs text-blue-900 leading-relaxed">
                  <strong>💡 진행 방법 안내:</strong> 위 파란색 버튼을 누르면 Windows 폴더 선택 창이 뜹니다.
                  설치된 경로(<code>{folderPath}</code>)로 이동하여 <strong>[폴더 선택]</strong>을 누른 뒤, 브라우저 상단에서 <strong>[파일 변경 허용]</strong>을 승인해 주시면 즉시 언어가 변경됩니다.
                </div>
              </div>
            )}

            {/* METHOD B: One-Click Executable */}
            {executionMethod === 'exe' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>💻 원클릭 실행 파일 (.exe) 생성기</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                        더블클릭 실행
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      바탕화면에 보관해 두고, 필요할 때마다 더블클릭만 하면 자동으로 관리자 권한으로 실행되어 {currentLocalePreset.name} 언어를 토글합니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadExe}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>원클릭 실행기 다운로드</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200/80 text-xs text-emerald-950 leading-relaxed">
                  <strong>💡 사용 방법:</strong> 다운로드된 <code>Build_{isIllustrator ? 'Illustrator' : 'Photoshop'}_{resolveVersionYear(config)}_Language_Switcher_{targetAction === 'toggle' ? 'Toggle' : targetAction === 'english' ? 'English' : 'Korean'}_EXE.bat</code> 파일을 실행하면, Windows 기본 C# 컴파일러가 시스템에 완전히 독립된 <strong>64비트 정품 .exe 실행 파일 ({isIllustrator ? 'Illustrator' : 'Photoshop'}_{resolveVersionYear(config)}_Language_Switcher_{targetAction === 'toggle' ? 'Toggle' : targetAction === 'english' ? 'English' : 'Korean'}.exe)</strong>을 즉시 만들어 줍니다. 생성된 .exe를 더블클릭하여 사용하세요!
                </div>
              </div>
            )}

            {/* METHOD C: Simple BAT */}
            {executionMethod === 'bat' && (
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <span>📜 초경량 윈도우 배치 스크립트 (.bat)</span>
                      <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-100 text-purple-800">
                        투명한 코드
                      </span>
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1">
                      메모장으로 열어 코드를 직접 확인할 수 있는 안전한 텍스트 기반 스크립트입니다.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownloadBat}
                    className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-black text-white bg-purple-600 hover:bg-purple-700 active:scale-95 transition-all shadow-lg shadow-purple-600/25 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>배치 파일(.bat) 다운로드</span>
                  </button>
                </div>

                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200/80 text-xs text-purple-950 leading-relaxed">
                  <strong>💡 사용 방법:</strong> 다운로드된 <code>{isIllustrator ? 'Illustrator' : 'Photoshop'}_{resolveVersionYear(config)}_Language_Switcher_{targetAction === 'toggle' ? 'Toggle' : targetAction === 'english' ? 'English' : 'Korean'}.bat</code> 파일에 마우스 우클릭 후 <strong>[관리자 권한으로 실행]</strong>을 선택하시면 1초 만에 언어가 적용됩니다.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions (FAQ) Accordion */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            초보자를 위한 자주 묻는 질문 (FAQ)
          </h3>
        </div>

        <div className="space-y-3">
          {/* FAQ 1 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq(0)}
              className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Q1. 언어를 바꿨는데도 프로그램 메뉴가 그대로예요!</span>
              {faqOpen === 0 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen === 0 && (
              <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                포토샵 또는 일러스트레이터가 이미 실행되어 있는 동안에는 메뉴 언어가 실시간으로 갱신되지 않습니다. 실행 중인 프로그램을 완전히 종료하신 후 다시 켜주시면 변경된 언어로 열립니다!
              </div>
            )}
          </div>

          {/* FAQ 2 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq(1)}
              className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Q2. 원래 언어로 다시 되돌릴 수 있나요? (안전성 보장)</span>
              {faqOpen === 1 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen === 1 && (
              <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                네, 100% 언제든지 원래대로 복구됩니다! 본 프로그램은 기존 언어 파일을 삭제하지 않고 확장자(<code>old_...</code> 또는 <code>.bak</code>)로 안전하게 백업 토글하므로, 이 화면에서 '{currentLocalePreset.name}로 복구'를 누르시거나 실행기를 다시 한 번 실행하시면 즉시 원상 복구됩니다.
              </div>
            )}
          </div>

          {/* FAQ 3 */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleFaq(2)}
              className="w-full px-5 py-4 text-left font-bold text-sm text-slate-900 bg-slate-50/60 hover:bg-slate-100/60 flex items-center justify-between transition-colors cursor-pointer"
            >
              <span>Q3. 실행 시 'Windows의 PC 보호' 또는 '관리자 권한(UAC)' 창이 뜹니다.</span>
              {faqOpen === 2 ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
            </button>
            {faqOpen === 2 && (
              <div className="px-5 py-4 text-xs sm:text-sm text-slate-600 leading-relaxed bg-white border-t border-slate-100">
                어도비 프로그램이 설치된 <code>C:\Program Files</code> 폴더는 시스템 보안 폴더이므로 파일 수정을 위해 Windows가 정상적으로 권한을 묻는 것입니다. 스마트스크린 경고가 뜨면 [추가 정보] → [실행]을 누르시고, UAC 확인 창에서 [예]를 눌러주시면 안전하게 진행됩니다.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Switch to Pro Mode Callout */}
      <section className="bg-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-blue-400">전산 관리자 / 강사 / 개발자 전용</span>
          </div>
          <h4 className="text-lg font-bold text-white">
            학교·학원 100대 일괄 원격 배포나 스탠드얼론 빌더가 필요하신가요?
          </h4>
          <p className="text-xs sm:text-sm text-slate-400">
            NetSupport/Veyon 전산실 일괄 배포기, 24개국 다국어 매트릭스, C# 어셈블리 속성 편집기 등 고급 기능을 사용할 수 있습니다.
          </p>
        </div>

        <button
          type="button"
          onClick={onSwitchToPro}
          className="shrink-0 px-5 py-3 rounded-xl font-bold text-sm bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
        >
          <Sliders className="w-4 h-4 text-amber-300" />
          <span>전문가 모드로 전환하기</span>
        </button>
      </section>
    </div>
  );
};

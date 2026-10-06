import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  FolderSearch,
  Sparkles,
  ArrowRightLeft,
  Check,
  AlertCircle,
  HardDrive,
  RefreshCw,
  Info,
  ChevronRight,
  Download,
} from 'lucide-react';
import { DetectedPhotoshopInstallation, PathConfig } from '../types';
import {
  isFileSystemAccessSupported,
  openAndScanAllPhotoshopVersions,
  scanDirectoryForIllustratorInstallations,
  toggleSingleDetectedInstallation,
  batchApplyLanguageMode,
} from '../utils/fileSystemAccess';
import { PHOTOSHOP_VERSIONS, downloadTextFile, generateAutoDetectMultiVersionBat } from '../utils/photoshopHelper';
import {
  ILLUSTRATOR_VERSIONS,
  getIllustratorDefaultPath,
  generateIllustratorAutoDetectMultiVersionBat,
} from '../utils/illustratorHelper';
import { useI18n } from '../i18n/I18nContext';

interface MultiVersionDetectorProps {
  config: PathConfig;
  onSelectVersion: (selected: PathConfig) => void;
}

export const MultiVersionDetector: React.FC<MultiVersionDetectorProps> = ({
  config,
  onSelectVersion,
}) => {
  const { t } = useI18n();
  const isIllustrator = config.appType === 'illustrator';
  const appName = isIllustrator ? (t('appNameIllustrator') || 'Illustrator') : (t('appNamePhotoshop') || 'Photoshop');
  const appCode = isIllustrator ? 'Ai' : 'Ps';

  const [installations, setInstallations] = useState<DetectedPhotoshopInstallation[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const handleScanDirectory = async () => {
    setIsScanning(true);
    setFeedback(null);
    try {
      let detectedList: DetectedPhotoshopInstallation[] = [];

      if (isIllustrator) {
        // @ts-expect-error window.showDirectoryPicker is experimental but standard in Chromium
        const parentHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker({
          mode: 'readwrite',
          startIn: 'desktop',
        });
        detectedList = await scanDirectoryForIllustratorInstallations(parentHandle);
      } else {
        const { installations: list } = await openAndScanAllPhotoshopVersions();
        detectedList = list;
      }

      if (detectedList.length === 0) {
        setFeedback({
          type: 'error',
          message: t('scanErrorMsg'),
        });
      } else {
        setInstallations(detectedList);
        setFeedback({
          type: 'success',
          message: `${t('scanSuccessMsg')} (${detectedList.length})`,
        });

        // Auto sync first detected version
        const first = detectedList[0];
        if (isIllustrator) {
          const matchedAi = ILLUSTRATOR_VERSIONS.find((v) => v.id === first.id);
          const computedPath = first.supportFilesPath || (matchedAi ? getIllustratorDefaultPath(matchedAi, config.drive || 'C', config.os || 'windows') : '');
          if (matchedAi) {
            onSelectVersion({
              ...config,
              versionId: matchedAi.id,
              isCustomPath: false,
              customPath: computedPath,
              customDatFileName: 'application.xml',
            });
          }
        } else {
          const matchedPs = PHOTOSHOP_VERSIONS.find((v) => v.id === first.id);
          const computedPath = first.supportFilesPath || (matchedPs ? (config.os === 'macos' ? `/Applications/${matchedPs.folderName}/Locales/${config.locale || 'ko_KR'}/Support Files` : `${config.drive || 'C'}:\\Program Files\\Adobe\\${matchedPs.folderName}\\Locales\\${config.locale || 'ko_KR'}\\Support Files`) : '');
          if (matchedPs) {
            onSelectVersion({
              ...config,
              versionId: matchedPs.id,
              isCustomPath: false,
              customPath: computedPath,
              customDatFileName: first.datFileName,
            });
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const isIframeSec =
          err.name === 'SecurityError' ||
          err.message?.includes('CROSS_ORIGIN_IFRAME_RESTRICTED') ||
          err.message?.includes('Cross origin') ||
          err.message?.includes('sub frames');
        setFeedback({
          type: 'error',
          message: isIframeSec
            ? '현재 화면은 AI Studio 미리보기(iframe) 환경이므로 브라우저 보안 규정에 의해 자동 검색 탐색기를 열 수 없습니다. 상단 [단독 새 탭 열기]로 단독 창에서 실행하시거나, 아래의 실행 파일(.exe) 또는 배치 파일(.bat)을 이용해 주세요.'
            : (err.message || t('scanErrorMsg')),
        });
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleApplySingleToggle = async (inst: DetectedPhotoshopInstallation) => {
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await toggleSingleDetectedInstallation(inst);
      setInstallations((prev) =>
        prev.map((item) => (item.id === inst.id ? updated : item))
      );
      setFeedback({
        type: 'success',
        message: `[${inst.versionName}] ${
          updated.currentMode === 'english' ? t('singleToggleSuccessEn') : t('singleToggleSuccessKo')
        }`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Toggle failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBatchToggle = async (targetMode: 'toggle' | 'korean' | 'english') => {
    if (installations.length === 0) return;
    setIsProcessing(true);
    setFeedback(null);
    try {
      const updated = await batchApplyLanguageMode(installations, targetMode);
      setInstallations(updated);
      setFeedback({
        type: 'success',
        message: `${t('batchToggleSuccess')} (${updated.length})`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Batch failed',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectToActiveConfig = (inst: DetectedPhotoshopInstallation) => {
    if (isIllustrator) {
      const matchedAi = ILLUSTRATOR_VERSIONS.find((v) => v.id === inst.id);
      const computedPath = inst.supportFilesPath || (matchedAi ? getIllustratorDefaultPath(matchedAi, config.drive || 'C', config.os || 'windows') : '');
      if (matchedAi) {
        onSelectVersion({
          ...config,
          versionId: matchedAi.id,
          isCustomPath: false,
          customPath: computedPath,
          customDatFileName: 'application.xml',
        });
      } else {
        onSelectVersion({
          ...config,
          isCustomPath: true,
          customPath: inst.supportFilesPath || '',
          customDatFileName: 'application.xml',
        });
      }
    } else {
      const matchedPreset = PHOTOSHOP_VERSIONS.find((v) => v.id === inst.id);
      const computedPath = inst.supportFilesPath || (matchedPreset ? (config.os === 'macos' ? `/Applications/${matchedPreset.folderName}/Locales/${config.locale || 'ko_KR'}/Support Files` : `${config.drive || 'C'}:\\Program Files\\Adobe\\${matchedPreset.folderName}\\Locales\\${config.locale || 'ko_KR'}\\Support Files`) : '');
      if (matchedPreset) {
        onSelectVersion({
          ...config,
          versionId: matchedPreset.id,
          isCustomPath: false,
          customPath: computedPath,
          customDatFileName: inst.datFileName,
        });
      } else {
        onSelectVersion({
          ...config,
          isCustomPath: true,
          customPath: inst.supportFilesPath || '',
          customDatFileName: inst.datFileName,
        });
      }
    }
    setFeedback({
      type: 'info',
      message: `[${inst.versionName}] ${t('selectedTarget')}`,
    });
  };

  const handleDownloadAutoScannerBat = () => {
    if (isIllustrator) {
      const batContent = generateIllustratorAutoDetectMultiVersionBat();
      downloadTextFile(batContent, 'illustrator_multi_version_auto_scanner.bat');
    } else {
      const batContent = generateAutoDetectMultiVersionBat();
      downloadTextFile(batContent, 'photoshop_multi_version_auto_scanner.bat');
    }
  };

  return (
    <div className={`rounded-2xl border p-5 sm:p-6 mb-6 shadow-xs transition-all ${
      isIllustrator
        ? 'bg-gradient-to-br from-amber-50/70 via-orange-50/30 to-slate-50 border-amber-200/80'
        : 'bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 border-blue-200/80'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg text-white shadow-xs ${
              isIllustrator ? 'bg-amber-600' : 'bg-blue-600'
            }`}>
              <Search className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepDetectorTitle')}
            </h2>
            <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold border ${
              isIllustrator
                ? 'bg-amber-100 text-amber-900 border-amber-200'
                : 'bg-blue-100 text-blue-800 border-blue-200'
            }`}>
              Multi-Version Auto Scan
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            {t('stepDetectorDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadAutoScannerBat}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
            title={`${appName} .bat`}
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>{t('scanBatDownload')}</span>
          </button>

          <button
            type="button"
            onClick={handleScanDirectory}
            disabled={isScanning || isProcessing}
            className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl disabled:opacity-50 text-white text-xs sm:text-sm font-bold shadow-sm transition-all cursor-pointer active:scale-95 ${
              isIllustrator
                ? 'bg-amber-600 hover:bg-amber-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isScanning ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{t('scanning')}</span>
              </>
            ) : (
              <>
                <FolderSearch className="w-4 h-4" />
                <span>{t('scanBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Guide Note */}
      <div className="mt-3 flex items-start gap-2 text-xs text-slate-600 bg-white/70 p-3 rounded-xl border border-slate-200/60">
        <Info className={`w-4 h-4 shrink-0 mt-0.5 ${isIllustrator ? 'text-amber-600' : 'text-blue-600'}`} />
        <div>
          <span className="font-semibold text-slate-800">{t('scanRecommendFolder')} </span>
          <code className={`px-1 py-0.5 rounded font-mono font-bold ${
            isIllustrator ? 'text-amber-800 bg-amber-50' : 'text-blue-700 bg-blue-50'
          }`}>
            C:\Program Files\Adobe
          </code>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`mt-4 p-3.5 rounded-xl text-xs sm:text-sm font-medium flex items-center gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : feedback.type === 'error'
              ? 'bg-rose-50 text-rose-800 border border-rose-200'
              : 'bg-blue-50 text-blue-800 border border-blue-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : feedback.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Detected Versions Section */}
      {installations.length > 0 && (
        <div className="mt-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {t('detectedCountLabel')} ({installations.length})
              </span>
            </div>

            {/* Batch Action Buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <button
                type="button"
                onClick={() => handleBatchToggle('toggle')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{t('batchToggleAll')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleBatchToggle('english')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>{t('batchAllEn')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleBatchToggle('korean')}
                disabled={isProcessing}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 hover:border-slate-400 text-slate-700 text-xs font-semibold transition-all shadow-xs cursor-pointer"
              >
                <span>{t('batchAllKo')}</span>
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {installations.map((inst) => {
              const isCurrentActive =
                config.versionId === inst.id ||
                (config.isCustomPath && config.customPath === inst.supportFilesPath);

              return (
                <div
                  key={inst.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrentActive
                      ? isIllustrator
                        ? 'bg-white border-amber-500 ring-2 ring-amber-400/30 shadow-sm'
                        : 'bg-white border-blue-500 ring-2 ring-blue-400/30 shadow-sm'
                      : 'bg-white/90 border-slate-200 hover:border-slate-300 hover:bg-white'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg text-white flex items-center justify-center font-bold text-xs ${
                          isIllustrator ? 'bg-amber-600' : 'bg-blue-600'
                        }`}>
                          {appCode}
                        </div>
                        <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {inst.versionName}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold border shrink-0 ${
                          inst.currentMode === 'korean'
                            ? 'bg-blue-50 text-blue-700 border-blue-200'
                            : inst.currentMode === 'english'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-600 border-slate-200'
                        }`}
                      >
                        {inst.currentMode === 'korean'
                          ? t('statusKoActive')
                          : inst.currentMode === 'english'
                          ? t('statusEnActive')
                          : t('statusNotFound')}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono truncate mb-3" title={inst.supportFilesPath}>
                      📁 {inst.folderName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleSelectToActiveConfig(inst)}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${
                        isCurrentActive
                          ? isIllustrator
                            ? 'bg-amber-100 text-amber-900 border border-amber-200 cursor-default'
                            : 'bg-blue-100 text-blue-800 border border-blue-200 cursor-default'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer'
                      }`}
                    >
                      {isCurrentActive ? (
                        <>
                          <Check className={`w-3.5 h-3.5 ${isIllustrator ? 'text-amber-700' : 'text-blue-600'}`} />
                          <span>{t('selectedTarget')}</span>
                        </>
                      ) : (
                        <>
                          <span>{t('selectThisVersion')}</span>
                          <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </button>

                    {inst.supportDirHandle && (
                      <button
                        type="button"
                        onClick={() => handleApplySingleToggle(inst)}
                        disabled={isProcessing}
                        className={`py-1.5 px-2.5 rounded-lg text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1 cursor-pointer ${
                          isIllustrator
                            ? 'bg-amber-600 hover:bg-amber-700'
                            : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>{t('toggleBtn')}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

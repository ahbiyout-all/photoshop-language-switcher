import React, { useState } from 'react';
import {
  FolderUp,
  RefreshCw,
  ArrowRightLeft,
  CheckCircle,
  AlertCircle,
  FolderCheck,
  Zap,
  HelpCircle,
} from 'lucide-react';
import { DetectedFileInfo, PathConfig } from '../types';
import {
  isFileSystemAccessSupported,
  openPhotoshopDirectory,
  applyEnglishMode,
  applyKoreanMode,
  scanDirectoryForLanguageFiles,
} from '../utils/fileSystemAccess';
import { resolveDatFileName } from '../utils/photoshopHelper';
import { useI18n } from '../i18n/I18nContext';

interface DirectFolderControllerProps {
  config: PathConfig;
}

export const DirectFolderController: React.FC<DirectFolderControllerProps> = ({
  config,
}) => {
  const { t } = useI18n();
  const [dirHandle, setDirHandle] = useState<FileSystemDirectoryHandle | null>(
    null
  );
  const [fileInfo, setFileInfo] = useState<DetectedFileInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
  } | null>(null);

  const isSupported = isFileSystemAccessSupported();
  const targetFileName = resolveDatFileName(config);

  const handleSelectFolder = async () => {
    setIsLoading(true);
    setFeedback(null);
    try {
      const { directoryHandle, info } = await openPhotoshopDirectory(
        targetFileName
      );
      setDirHandle(directoryHandle);
      setFileInfo(info);

      if (info.currentMode === 'korean') {
        setFeedback({
          type: 'info',
          message: `${t('directStatusCurrent')} ${t('directStatusKo')} (${info.koreanFileName})`,
        });
      } else if (info.currentMode === 'english') {
        setFeedback({
          type: 'info',
          message: `${t('directStatusCurrent')} ${t('directStatusEn')} (${info.englishFileName})`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: `${t('scanErrorMsg')} (${info.folderName})`,
        });
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
            ? '현재 화면은 AI Studio 미리보기(iframe) 환경이므로 브라우저 보안 규정에 의해 폴더 탐색기를 직접 열 수 없습니다. 상단 [단독 새 탭 열기]로 단독 창에서 실행하시거나, 아래의 실행 파일(.exe) 또는 배치 파일(.bat)을 이용해 주세요.'
            : (err.message || t('scanErrorMsg')),
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyEnglish = async () => {
    if (!dirHandle) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const updatedInfo = await applyEnglishMode(dirHandle, targetFileName);
      setFileInfo(updatedInfo);
      setFeedback({
        type: 'success',
        message: `${t('singleToggleSuccessEn')} (${updatedInfo.englishFileName})`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error occurred while changing filename.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyKorean = async () => {
    if (!dirHandle) return;
    setIsLoading(true);
    setFeedback(null);
    try {
      const updatedInfo = await applyKoreanMode(dirHandle, targetFileName);
      setFileInfo(updatedInfo);
      setFeedback({
        type: 'success',
        message: `${t('singleToggleSuccessKo')} (${updatedInfo.koreanFileName})`,
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err.message || 'Error occurred while restoring filename.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = async () => {
    if (!dirHandle || !fileInfo) return;
    if (fileInfo.currentMode === 'korean') {
      await handleApplyEnglish();
    } else if (fileInfo.currentMode === 'english') {
      await handleApplyKorean();
    } else {
      setFeedback({
        type: 'error',
        message: t('statusNotFound'),
      });
    }
  };

  const handleRefresh = async () => {
    if (!dirHandle) return;
    setIsLoading(true);
    try {
      const updated = await scanDirectoryForLanguageFiles(
        dirHandle,
        targetFileName
      );
      setFileInfo(updated);
      setFeedback({
        type: 'info',
        message: 'Folder status refreshed.',
      });
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: 'Refresh failed: ' + err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="direct-folder-controller" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <Zap className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepDirectTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('stepDirectDesc')}
          </p>
        </div>

        <div>
          <button
            id="btn-select-folder"
            type="button"
            onClick={handleSelectFolder}
            disabled={isLoading || !isSupported}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            <FolderUp className="w-4 h-4" />
            {dirHandle ? t('directSelectFolder') : t('directSelectFolder')}
          </button>
        </div>
      </div>

      {/* Browser Support Check */}
      {!isSupported && (
        <div className="mt-4 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5">
          <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Chromium Required</p>
            <p className="mt-0.5 text-amber-700 leading-relaxed">
              {t('directBrowserSupportNotice')}
            </p>
          </div>
        </div>
      )}

      {/* When Folder is Connected */}
      {dirHandle && fileInfo && (
        <div className="mt-5 space-y-4">
          {/* Status Badge Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <FolderCheck className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-500">
                    {t('directFolderSelectedLabel')}
                  </span>
                  <span className="text-xs font-bold text-slate-900 font-mono bg-white px-2 py-0.5 rounded border border-slate-200">
                    {dirHandle.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-slate-500 font-medium">{t('directStatusCurrent')}</span>
                  {fileInfo.currentMode === 'korean' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
                      {t('statusKoActive')}
                    </span>
                  )}
                  {fileInfo.currentMode === 'english' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      {t('statusEnActive')}
                    </span>
                  )}
                  {fileInfo.currentMode === 'not_found' && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      ⚠️ {t('statusNotFound')}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleApplyEnglish}
                disabled={isLoading || fileInfo.currentMode === 'english'}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                  fileInfo.currentMode === 'english'
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white active:scale-95'
                }`}
              >
                {t('batchAllEn')}
              </button>

              <button
                type="button"
                onClick={handleApplyKorean}
                disabled={isLoading || fileInfo.currentMode === 'korean'}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer ${
                  fileInfo.currentMode === 'korean'
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white active:scale-95'
                }`}
              >
                {t('batchAllKo')}
              </button>

              <button
                type="button"
                onClick={handleToggle}
                disabled={isLoading || fileInfo.currentMode === 'not_found'}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 active:scale-95 cursor-pointer"
                title={t('toggleBtn')}
              >
                <ArrowRightLeft className="w-3.5 h-3.5" />
                {t('toggleBtn')}
              </button>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={isLoading}
                className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
                title="Refresh"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`}
                />
              </button>
            </div>
          </div>

          {/* Detailed File Status List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div
              className={`p-3 rounded-xl border ${
                fileInfo.koreanFileExists
                  ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-semibold">
                <span>{fileInfo.koreanFileName}</span>
                {fileInfo.koreanFileExists ? (
                  <span className="text-[11px] bg-emerald-200/60 text-emerald-800 px-2 py-0.5 rounded-full font-sans">
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-sans">
                    -
                  </span>
                )}
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border ${
                fileInfo.englishFileExists
                  ? 'bg-blue-50/50 border-blue-200 text-blue-900'
                  : 'bg-slate-50 border-slate-200 text-slate-500'
              }`}
            >
              <div className="flex items-center justify-between font-mono font-semibold">
                <span>{fileInfo.englishFileName}</span>
                {fileInfo.englishFileExists ? (
                  <span className="text-[11px] bg-blue-200/60 text-blue-800 px-2 py-0.5 rounded-full font-sans">
                    Active
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400 font-sans">
                    -
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Alert */}
      {feedback && (
        <div
          className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : feedback.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-blue-50 border-blue-200 text-blue-900'
          }`}
        >
          {feedback.type === 'success' && (
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          )}
          {feedback.type === 'error' && (
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          )}
          {feedback.type === 'info' && (
            <Zap className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          )}
          <div className="leading-relaxed font-medium">{feedback.message}</div>
        </div>
      )}
    </section>
  );
};

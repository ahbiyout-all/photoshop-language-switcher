import React, { useState } from 'react';
import {
  AppWindow,
  Download,
  Package,
  Laptop,
  FolderArchive,
  RefreshCw,
  Check,
  Monitor,
} from 'lucide-react';
import { PathConfig } from '../types';
import { resolveFolderPath, resolveDatFileName, downloadTextFile } from '../utils/photoshopHelper';
import { generateWindowsHtaApp, generatePowerShellWpfApp } from '../utils/photoshopHelper';
import { downloadReleaseDistributionZip } from '../utils/zipDistributor';
import { APP_VERSION_FULL } from '../version';
import { useI18n } from '../i18n/I18nContext';

interface GuiDistributorProps {
  config: PathConfig;
}

export const GuiDistributor: React.FC<GuiDistributorProps> = ({ config }) => {
  const { t } = useI18n();
  const [activePreview, setActivePreview] = useState<'hta' | 'wpf'>('hta');
  const [isZipping, setIsZipping] = useState(false);
  const [zipSuccess, setZipSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const folderPath = resolveFolderPath(config);
  const datFile = resolveDatFileName(config);

  const htaCode = generateWindowsHtaApp(folderPath, datFile);
  const wpfCode = generatePowerShellWpfApp(folderPath, datFile);

  const handleDownloadHta = () => {
    downloadTextFile(htaCode, 'Photoshop_Language_Switcher_GUI.hta', {
      isWindowsCrlf: true,
      withBom: true,
    });
  };

  const handleDownloadWpf = () => {
    downloadTextFile(wpfCode, 'Photoshop_Switcher_WPF_GUI.ps1', {
      isWindowsCrlf: true,
      withBom: true,
    });
  };

  const handleDownloadZipBundle = async () => {
    try {
      setIsZipping(true);
      await downloadReleaseDistributionZip(folderPath, datFile, APP_VERSION_FULL);
      setZipSuccess(true);
      setTimeout(() => setZipSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to create zip bundle:', err);
    } finally {
      setIsZipping(false);
    }
  };

  const handleCopyCode = () => {
    const code = activePreview === 'hta' ? htaCode : wpfCode;
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <section
      id="gui-app-distributor-section"
      className="bg-white rounded-2xl border border-blue-200 shadow-sm p-5 sm:p-6 mb-6 relative overflow-hidden"
    >
      {/* Top Gradient Ribbon */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500" />

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-blue-600 text-white shadow-xs">
              <AppWindow className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepDistributorTitle')}
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
              Standalone Desktop GUI
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 mt-1.5">
            {t('stepDistributorDesc')}
          </p>
        </div>

        {/* Big Action: Distribution ZIP Bundle */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            id="download-distribution-zip-btn"
            type="button"
            onClick={handleDownloadZipBundle}
            disabled={isZipping}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white text-xs font-bold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isZipping ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>ZIP...</span>
              </>
            ) : zipSuccess ? (
              <>
                <Check className="w-4 h-4 text-emerald-300" />
                <span className="text-emerald-200">✓ Downloaded!</span>
              </>
            ) : (
              <>
                <FolderArchive className="w-4 h-4 text-blue-200" />
                <span>{t('downloadZipBtn')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid: 2 Types of GUI Apps */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: HTML Application (.hta) */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            activePreview === 'hta'
              ? 'border-blue-500 bg-blue-50/40 ring-2 ring-blue-500/20'
              : 'border-slate-200 bg-slate-50/60 hover:bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-blue-600 text-white">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  HTML Application GUI (.hta)
                </h3>
                <span className="text-[11px] font-semibold text-blue-700">
                  Native Windows (No Runtime Needed)
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
              Recommended
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            {t('guiDistributorFeature2')}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActivePreview('hta')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePreview === 'hta'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-200/70'
              }`}
            >
              {activePreview === 'hta' ? t('hideCodePreview') : t('showCodePreview')}
            </button>
            <button
              id="download-hta-app-btn"
              type="button"
              onClick={handleDownloadHta}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.HTA GUI Download</span>
            </button>
          </div>
        </div>

        {/* Card 2: PowerShell WPF GUI (.ps1) */}
        <div
          className={`p-5 rounded-xl border transition-all ${
            activePreview === 'wpf'
              ? 'border-indigo-500 bg-indigo-50/40 ring-2 ring-indigo-500/20'
              : 'border-slate-200 bg-slate-50/60 hover:bg-white'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-indigo-600 text-white">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  PowerShell WPF Modern Dark GUI (.ps1)
                </h3>
                <span className="text-[11px] font-semibold text-indigo-700">
                  High-DPI Vector Windows Form
                </span>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200 shrink-0">
              Modern UI
            </span>
          </div>

          <p className="mt-3 text-xs text-slate-600 leading-relaxed">
            {t('guiDistributorFeature1')}
          </p>

          <div className="mt-4 pt-3 border-t border-slate-200/80 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setActivePreview('wpf')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                activePreview === 'wpf'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-200/70'
              }`}
            >
              {activePreview === 'wpf' ? t('hideCodePreview') : t('showCodePreview')}
            </button>
            <button
              id="download-wpf-app-btn"
              type="button"
              onClick={handleDownloadWpf}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>.PS1 WPF GUI Download</span>
            </button>
          </div>
        </div>
      </div>

      {/* Code Inspector & Live Preview */}
      <div className="mt-5 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="font-mono text-slate-300 ml-2 font-bold">
              {activePreview === 'hta'
                ? 'Photoshop_Language_Switcher_GUI.hta'
                : 'Photoshop_Switcher_WPF_GUI.ps1'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyCode}
              className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors cursor-pointer"
            >
              {copiedCode ? t('copiedBtn') : t('copyScriptBtn')}
            </button>
          </div>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-64 select-all">
          {activePreview === 'hta' ? htaCode : wpfCode}
        </pre>
      </div>

      {/* Distribution Features Checklist */}
      <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Package className="w-4 h-4 text-blue-600" />
            <span>{t('guiDistributorNoticeTitle')}</span>
          </div>
          <p className="text-slate-600 leading-relaxed">
            {t('guiDistributorNoticeBody')}
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadZipBundle}
          disabled={isZipping}
          className="shrink-0 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-xs transition-colors cursor-pointer"
        >
          {isZipping ? '...' : t('downloadZipBtn')}
        </button>
      </div>
    </section>
  );
};

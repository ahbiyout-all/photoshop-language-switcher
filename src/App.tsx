import React, { useState } from 'react';
import { Sparkles, Sliders } from 'lucide-react';
import { PathConfig, AdobeAppType } from './types';
import { I18nProvider } from './i18n/I18nContext';
import { DesktopWindowBar } from './components/DesktopWindowBar';
import { Header } from './components/Header';
import { EasyModeView } from './components/EasyModeView';
import { AppSwitcher } from './components/AppSwitcher';
import { MultiVersionDetector } from './components/MultiVersionDetector';
import { PathConfigurator } from './components/PathConfigurator';
import { GuiDistributor } from './components/GuiDistributor';
import { DirectFolderController } from './components/DirectFolderController';
import { ScriptGenerator } from './components/ScriptGenerator';
import { ClassroomRemoteDeployer } from './components/ClassroomRemoteDeployer';
import { ExtendedAppsSuite } from './components/ExtendedAppsSuite';
import { PhotoshopGuide } from './components/PhotoshopGuide';
import { DocsViewer } from './components/DocsViewer';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Footer } from './components/Footer';

function AppContent() {
  const [viewMode, setViewMode] = useState<'easy' | 'pro'>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const modeParam = params.get('mode');
      if (modeParam === 'pro' || modeParam === 'expert') return 'pro';
      if (modeParam === 'easy') return 'easy';
      const saved = localStorage.getItem('adobe_switcher_view_mode');
      if (saved === 'pro') return 'pro';
    }
    return 'easy';
  });

  const [config, setConfig] = useState<PathConfig>({
    appType: 'photoshop',
    os: 'windows',
    drive: 'C',
    versionId: 'ps2024',
    locale: 'ko_KR',
    isCustomPath: false,
    customPath: 'C:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Locales\\ko_KR\\Support Files',
    customDatFileName: 'tw10428_Photoshop_ko_KR.dat',
  });

  const handleViewModeChange = (newMode: 'easy' | 'pro') => {
    setViewMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('adobe_switcher_view_mode', newMode);
      const url = new URL(window.location.href);
      url.searchParams.set('mode', newMode);
      window.history.replaceState({}, '', url.toString());
    }
  };

  const handleSelectApp = (newApp: AdobeAppType) => {
    if (newApp === 'illustrator') {
      setConfig((prev) => ({
        ...prev,
        appType: 'illustrator',
        versionId: 'ai2024',
        isCustomPath: false,
        customPath: `${prev.drive}:\\Program Files\\Adobe\\Adobe Illustrator 2024\\Support Files\\Contents\\Windows\\AMT`,
        customDatFileName: 'application.xml',
      }));
    } else {
      setConfig((prev) => ({
        ...prev,
        appType: 'photoshop',
        versionId: 'ps2024',
        isCustomPath: false,
        customPath: `${prev.drive}:\\Program Files\\Adobe\\Adobe Photoshop 2024\\Locales\\ko_KR\\Support Files`,
        customDatFileName: 'tw10428_Photoshop_ko_KR.dat',
      }));
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-sans antialiased selection:bg-blue-100 selection:text-blue-900">
      {/* Desktop Window Titlebar & Quick Install */}
      <DesktopWindowBar />

      <Header appType={config.appType || 'photoshop'} currentLocale={config.locale || 'ko_KR'} />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* Mode Switcher Navigation */}
        <div className="mb-6 p-1.5 bg-slate-200/90 rounded-2xl flex items-center justify-between gap-2 max-w-xl mx-auto shadow-inner border border-slate-300/60">
          <button
            type="button"
            onClick={() => handleViewModeChange('easy')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === 'easy'
                ? 'bg-white text-blue-600 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>💡 일반 사용자 간편 모드</span>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] bg-amber-100 text-amber-800 font-bold">
              추천
            </span>
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('pro')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-3 sm:px-4 rounded-xl text-xs sm:text-sm font-black transition-all ${
              viewMode === 'pro'
                ? 'bg-white text-slate-900 shadow-md ring-1 ring-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-slate-500 shrink-0" />
            <span>⚙️ 전문가 & 관리자 모드</span>
          </button>
        </div>

        {/* View Mode Switching: Easy Mode vs Pro Mode */}
        {viewMode === 'easy' ? (
          <EasyModeView
            config={config}
            onConfigChange={setConfig}
            onSwitchToPro={() => handleViewModeChange('pro')}
          />
        ) : (
          <div className="space-y-6">
            {/* Step 0: Adobe Application Switcher (Photoshop ⇄ Illustrator) */}
            <AppSwitcher
              currentApp={config.appType || 'photoshop'}
              onSelectApp={handleSelectApp}
            />

            {/* Step 1: Automatic Multi-Version Scanner & Selector */}
            <MultiVersionDetector config={config} onSelectVersion={setConfig} />

            {/* Step 2: Version Auto Rule & Custom Location Configurator */}
            <PathConfigurator config={config} onChange={setConfig} />

            {/* Step 3: Standalone Native Desktop GUI App Builder & Release Distribution Suite */}
            <GuiDistributor config={config} />

            {/* Step 4: One-Click Executables & Script Generator Suite (EXE / VBS / Bat / Shortcut) */}
            <ScriptGenerator config={config} />

            {/* Step 4-1: Classroom Remote Bulk Deployment Suite (NetSupport / Veyon / NetOp) */}
            <ClassroomRemoteDeployer />

            {/* Step 4-2: Extended Adobe Apps Language Switcher Suite (InDesign, After Effects, Premiere Pro, InCopy) */}
            <ExtendedAppsSuite />

            {/* Step 5: Direct In-Browser Folder Access Controller */}
            <DirectFolderController config={config} />

            {/* Step 6: Visual Guide, Mechanism & FAQ */}
            <PhotoshopGuide appType={config.appType || 'photoshop'} />

            {/* Step 7: Official Documentation Hub & SemVer Changelog */}
            <DocsViewer />
          </div>
        )}
      </main>

      <OfflineIndicator />

      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <I18nProvider>
      <AppContent />
    </I18nProvider>
  );
}

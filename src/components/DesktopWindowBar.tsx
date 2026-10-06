import React from 'react';
import { Monitor, Minus, Square, X, Shield, Sparkles, ExternalLink } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { APP_VERSION_FULL, APP_GITHUB_PROFILE } from '../version';
import { useI18n } from '../i18n/I18nContext';
import { isRunningInIframe } from '../utils/fileSystemAccess';

export const DesktopWindowBar: React.FC = () => {
  const { t } = useI18n();
  const inIframe = typeof window !== 'undefined' && isRunningInIframe();

  return (
    <div className="w-full bg-slate-950 text-slate-300 px-4 py-2 flex items-center justify-between text-xs border-b border-slate-800 select-none">
      {/* Left: Window controls & app branding */}
      <div className="flex items-center gap-3">
        {/* Mac / Windows style window dots */}
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-rose-500/80 hover:bg-rose-500 transition-colors inline-block cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-amber-500/80 hover:bg-amber-500 transition-colors inline-block cursor-pointer" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/80 hover:bg-emerald-500 transition-colors inline-block cursor-pointer" />
        </div>

        <div className="h-3.5 w-px bg-slate-800" />

        <div className="flex items-center gap-2">
          <Monitor className="w-3.5 h-3.5 text-blue-400" />
          <span className="font-semibold text-slate-200 tracking-tight hidden sm:inline">
            Photoshop & Illustrator Language Switcher
          </span>
          <span className="font-semibold text-slate-200 tracking-tight sm:hidden">
            Ps / Ai Desktop
          </span>
          <span className="px-1.5 py-0.2 rounded bg-blue-900/60 border border-blue-700/50 text-[10px] font-mono text-blue-300">
            {APP_VERSION_FULL} Desktop
          </span>
        </div>
      </div>

      {/* Right: Actions and PWA Install */}
      <div className="flex items-center gap-2 sm:gap-3">
        {inIframe && (
          <a
            href={typeof window !== 'undefined' ? window.location.href : '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600/80 hover:bg-blue-600 text-white text-[11px] font-bold transition-all shadow-xs"
            title="AI Studio 미리보기 iframe을 벗어나 단독 새 창에서 실행합니다"
          >
            <ExternalLink className="w-3 h-3" />
            <span>단독 새 탭 열기</span>
          </a>
        )}

        <div className="hidden md:flex items-center gap-1.5 text-[11px] text-slate-400">
          <Sparkles className="w-3 h-3 text-amber-400" />
          <span>{t('desktopSuiteSupport')}</span>
        </div>

        <div className="h-3 w-px bg-slate-800 hidden sm:block" />

        <a
          href={APP_GITHUB_PROFILE}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1 text-[11px] text-slate-400 hover:text-white transition-colors"
          title="공식 개발자 GitHub: AhBiYout (ahbiyout-all)"
        >
          <span className="text-slate-500">개발자:</span>
          <span className="font-bold text-slate-200">AhBiYout</span>
        </a>

        <PWAInstallButton />
      </div>
    </div>
  );
};

import React from 'react';
import { Globe, ShieldCheck, Github, ExternalLink } from 'lucide-react';
import { OFFICIAL_DEVELOPER_INFO } from '../types/developer';
import { useI18n } from '../i18n/I18nContext';
import { APP_VERSION_FULL } from '../version';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer id="app-footer" className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-100">
          {/* Col 1: App Info */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white font-black text-xs">
                Ps
              </div>
              <span className="font-bold text-slate-800 text-sm">{t('appNamePhotoshop')}</span>
              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Desktop Suite {APP_VERSION_FULL}
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              {t('footerAppDesc')}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('safeNativeDesc')}</span>
            </div>
          </div>

          {/* Col 2: Official Channels & Quick Links */}
          <div className="space-y-2.5 md:text-right flex flex-col md:items-end justify-center">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              {t('footerOfficialBlog')}
            </h4>
            <p className="text-xs text-slate-500 max-w-sm">
              {t('stepDocsDesc')}
            </p>
            <div className="flex items-center gap-2 pt-1 flex-wrap md:justify-end">
              <a
                href={OFFICIAL_DEVELOPER_INFO.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition-all group"
              >
                <Github className="w-3.5 h-3.5 text-slate-700 group-hover:scale-110 transition-transform" />
                <span>GitHub Repository</span>
                <ExternalLink className="w-3 h-3 text-slate-400" />
              </a>
              <a
                href={OFFICIAL_DEVELOPER_INFO.officialBlogUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-slate-800 hover:text-blue-700 text-xs font-semibold transition-all group"
              >
                <Globe className="w-3.5 h-3.5 text-blue-600 group-hover:scale-110 transition-transform" />
                <span>{t('footerVisitBlog')}</span>
                <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-blue-600" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="pt-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>
            © {new Date().getFullYear()} Adobe Photoshop &amp; Illustrator Language Switcher Suite. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            <a
              href={OFFICIAL_DEVELOPER_INFO.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 hover:underline"
            >
              GitHub (ahbiyout-all)
            </a>
            <span>·</span>
            <a
              href={OFFICIAL_DEVELOPER_INFO.officialBlogUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-600 hover:underline"
            >
              AhBiYout Vibe Blog
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

import React, { useState } from 'react';
import { BookOpen, FileText, CheckCircle, ChevronRight, X } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { APP_VERSION_FULL } from '../version';

interface DocItem {
  id: string;
  titleKey: 'docPatchNotesTitle' | 'docArchitectureTitle' | 'docUserGuideTitle' | 'docClassroomGuideTitle' | 'docExtendedAppsTitle' | 'docTroubleshootingTitle' | 'docGithubPublishingTitle';
  filename: string;
  badge: string;
  badgeColor: string;
  summaryKey: 'docPatchNotesSummary' | 'docArchitectureSummary' | 'docUserGuideSummary' | 'docClassroomGuideSummary' | 'docExtendedAppsSummary' | 'docTroubleshootingSummary' | 'docGithubPublishingSummary';
}

const DOCS_LIST: DocItem[] = [
  {
    id: 'patch_notes',
    titleKey: 'docPatchNotesTitle',
    filename: 'docs/PATCH_NOTES.md',
    badge: 'SemVer 2.0.0',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    summaryKey: 'docPatchNotesSummary',
  },
  {
    id: 'architecture',
    titleKey: 'docArchitectureTitle',
    filename: 'docs/ARCHITECTURE.md',
    badge: 'Technical Spec',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    summaryKey: 'docArchitectureSummary',
  },
  {
    id: 'user_guide',
    titleKey: 'docUserGuideTitle',
    filename: 'docs/USER_GUIDE.md',
    badge: 'Guide',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    summaryKey: 'docUserGuideSummary',
  },
  {
    id: 'github_publishing',
    titleKey: 'docGithubPublishingTitle',
    filename: 'docs/GITHUB_PUBLISHING_GUIDE.md',
    badge: 'GitHub Pages / CI',
    badgeColor: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    summaryKey: 'docGithubPublishingSummary',
  },
  {
    id: 'classroom_guide',
    titleKey: 'docClassroomGuideTitle',
    filename: 'docs/REMOTE_CLASSROOM_GUIDE.md',
    badge: 'Classroom / Lab',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    summaryKey: 'docClassroomGuideSummary',
  },
  {
    id: 'extended_apps_guide',
    titleKey: 'docExtendedAppsTitle',
    filename: 'docs/EXTENDED_ADOBE_APPS_GUIDE.md',
    badge: 'Id • Ae • Pr • Ic',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    summaryKey: 'docExtendedAppsSummary',
  },
  {
    id: 'troubleshooting',
    titleKey: 'docTroubleshootingTitle',
    filename: 'docs/TROUBLESHOOTING.md',
    badge: 'Support',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    summaryKey: 'docTroubleshootingSummary',
  },
];

export const DocsViewer: React.FC = () => {
  const { t } = useI18n();

  return (
    <section id="docs-hub-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepDocsTitle')}
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('stepDocsDesc')}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5" />
            {t('docsSemVerBadge')}
          </span>
        </div>
      </div>

      {/* Docs Grid */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        {DOCS_LIST.map((doc) => (
          <div
            key={doc.id}
            className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white hover:border-blue-300 hover:shadow-2xs transition-all flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono text-xs text-slate-400 group-hover:text-blue-600 transition-colors">
                  {doc.filename}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${doc.badgeColor}`}
                >
                  {doc.badge}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-slate-400 group-hover:text-blue-500" />
                {t(doc.titleKey)}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                {t(doc.summaryKey)}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-[11px] text-slate-400">
                {t('docsAutoSyncNotice')}
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold text-xs">
                {t('docsVerifiedStatus')}
                <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* SemVer Rules Banner */}
      <div className="mt-5 p-4 rounded-xl bg-slate-900 text-slate-200 text-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-white mb-1">
            <span className="px-2 py-0.5 rounded bg-blue-600 text-[10px] uppercase tracking-wider font-mono">
              Semantic Versioning Rules
            </span>
            <span>{t('semVerPolicyTitle')}</span>
          </div>
          <p className="text-slate-400 text-xs leading-relaxed">
            {t('semVerPolicyDesc')}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-lg bg-slate-800 border border-slate-700 font-mono text-emerald-400 font-bold text-xs">
            {t('semVerCurrentBadge')}: {APP_VERSION_FULL}
          </span>
        </div>
      </div>
    </section>
  );
};

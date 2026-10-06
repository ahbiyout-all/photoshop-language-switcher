import React from 'react';
import {
  HelpCircle,
  CheckCircle2,
  Lightbulb,
  FileCheck,
  ShieldCheck,
  Power,
} from 'lucide-react';
import { AdobeAppType } from '../types';
import { useI18n } from '../i18n/I18nContext';

interface GuideProps {
  appType?: AdobeAppType;
}

export const PhotoshopGuide: React.FC<GuideProps> = ({ appType = 'photoshop' }) => {
  const { t } = useI18n();
  const isIllustrator = appType === 'illustrator';
  const appName = isIllustrator ? (t('appNameIllustrator') || 'Illustrator') : (t('appNamePhotoshop') || 'Photoshop');

  return (
    <section id="photoshop-guide-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex items-center gap-2 pb-4 border-b border-slate-100">
        <div className={`p-1.5 rounded-lg ${isIllustrator ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
          <Lightbulb className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900">
            {t('stepGuideTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('stepGuideDesc')}
          </p>
        </div>
      </div>

      {/* 3 Step Workflow */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${isIllustrator ? 'bg-amber-600' : 'bg-blue-600'}`}>
                1
              </span>
              <Power className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {t('guideStep1Title')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('guideStep1Desc')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className={`w-6 h-6 rounded-full text-white font-bold text-xs flex items-center justify-center ${isIllustrator ? 'bg-amber-600' : 'bg-blue-600'}`}>
                2
              </span>
              <FileCheck className="w-4 h-4 text-slate-400" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {t('guideStep2Title')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('guideStep2Desc')}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                3
              </span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              {t('guideStep3Title')}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {t('guideStep3Desc')}
            </p>
          </div>
        </div>
      </div>

      {/* Mechanism Deep Dive */}
      <div className={`mt-5 p-4 rounded-xl text-xs text-slate-700 leading-relaxed ${isIllustrator ? 'bg-amber-50/50 border border-amber-200/80' : 'bg-blue-50/50 border border-blue-100'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 mb-1.5 ${isIllustrator ? 'text-amber-950' : 'text-blue-900'}`}>
          <ShieldCheck className={`w-4 h-4 ${isIllustrator ? 'text-amber-700' : 'text-blue-600'}`} />
          {t('guideMechTitle')} ({appName})
        </h4>
        <p className="text-slate-600">
          {isIllustrator ? t('guideMechAiDesc') : t('guideMechPsDesc')}
        </p>
      </div>

      {/* FAQ Section */}
      <div className="mt-5 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-900 mb-3 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-500" />
          {t('faqTitle')}
        </h4>

        <div className="space-y-3">
          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
            <span className="font-bold text-slate-900 block mb-1">
              {t('faq1Question')}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {t('faq1Answer')}
            </p>
          </div>

          <div className="p-3 rounded-xl bg-slate-50/70 border border-slate-200/70 text-xs">
            <span className="font-bold text-slate-900 block mb-1">
              {t('faq2Question')}
            </span>
            <p className="text-slate-600 leading-relaxed">
              {t('faq2Answer')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

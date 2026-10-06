import { LocalePreset, OperatingSystem } from '../types';

export const SUPPORTED_LOCALES: LocalePreset[] = [
  {
    code: 'ko_KR',
    name: '한국어',
    nativeName: '한국어',
    flag: '🇰🇷',
    englishName: 'Korean',
    datFileName: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    code: 'en_US',
    name: '영어 (미국)',
    nativeName: 'English (US)',
    flag: '🇺🇸',
    englishName: 'English (US)',
    datFileName: 'tw10428_Photoshop_en_US.dat',
  },
  {
    code: 'en_GB',
    name: '영어 (영국/국제)',
    nativeName: 'English (UK)',
    flag: '🇬🇧',
    englishName: 'English (UK)',
    datFileName: 'tw10428_Photoshop_en_GB.dat',
  },
  {
    code: 'ja_JP',
    name: '일본어',
    nativeName: '日本語',
    flag: '🇯🇵',
    englishName: 'Japanese',
    datFileName: 'tw10428_Photoshop_ja_JP.dat',
  },
  {
    code: 'zh_CN',
    name: '중국어 (간체)',
    nativeName: '简体中文',
    flag: '🇨🇳',
    englishName: 'Chinese (Simplified)',
    datFileName: 'tw10428_Photoshop_zh_CN.dat',
  },
  {
    code: 'zh_TW',
    name: '중국어 (번체)',
    nativeName: '繁體中文',
    flag: '🇹🇼',
    englishName: 'Chinese (Traditional)',
    datFileName: 'tw10428_Photoshop_zh_TW.dat',
  },
  {
    code: 'de_DE',
    name: '독일어',
    nativeName: 'Deutsch',
    flag: '🇩🇪',
    englishName: 'German',
    datFileName: 'tw10428_Photoshop_de_DE.dat',
  },
  {
    code: 'fr_FR',
    name: '프랑스어',
    nativeName: 'Français',
    flag: '🇫🇷',
    englishName: 'French',
    datFileName: 'tw10428_Photoshop_fr_FR.dat',
  },
  {
    code: 'es_ES',
    name: '스페인어',
    nativeName: 'Español',
    flag: '🇪🇸',
    englishName: 'Spanish',
    datFileName: 'tw10428_Photoshop_es_ES.dat',
  },
  {
    code: 'it_IT',
    name: '이탈리아어',
    nativeName: 'Italiano',
    flag: '🇮🇹',
    englishName: 'Italian',
    datFileName: 'tw10428_Photoshop_it_IT.dat',
  },
  {
    code: 'ru_RU',
    name: '러시아어',
    nativeName: 'Русский',
    flag: '🇷🇺',
    englishName: 'Russian',
    datFileName: 'tw10428_Photoshop_ru_RU.dat',
  },
  {
    code: 'pt_BR',
    name: '포르투갈어 (브라질)',
    nativeName: 'Português (Brasil)',
    flag: '🇧🇷',
    englishName: 'Portuguese (Brazil)',
    datFileName: 'tw10428_Photoshop_pt_BR.dat',
  },
  {
    code: 'pl_PL',
    name: '폴란드어',
    nativeName: 'Polski',
    flag: '🇵🇱',
    englishName: 'Polish',
    datFileName: 'tw10428_Photoshop_pl_PL.dat',
  },
  {
    code: 'tr_TR',
    name: '튀르키예어',
    nativeName: 'Türkçe',
    flag: '🇹🇷',
    englishName: 'Turkish',
    datFileName: 'tw10428_Photoshop_tr_TR.dat',
  },
  {
    code: 'cs_CZ',
    name: '체코어',
    nativeName: 'Čeština',
    flag: '🇨🇿',
    englishName: 'Czech',
    datFileName: 'tw10428_Photoshop_cs_CZ.dat',
  },
  {
    code: 'hu_HU',
    name: '헝가리어',
    nativeName: 'Magyar',
    flag: '🇭🇺',
    englishName: 'Hungarian',
    datFileName: 'tw10428_Photoshop_hu_HU.dat',
  },
  {
    code: 'uk_UA',
    name: '우크라이나어',
    nativeName: 'Українська',
    flag: '🇺🇦',
    englishName: 'Ukrainian',
    datFileName: 'tw10428_Photoshop_uk_UA.dat',
  },
  {
    code: 'sv_SE',
    name: '스웨덴어',
    nativeName: 'Svenska',
    flag: '🇸🇪',
    englishName: 'Swedish',
    datFileName: 'tw10428_Photoshop_sv_SE.dat',
  },
  {
    code: 'da_DK',
    name: '덴마크어',
    nativeName: 'Dansk',
    flag: '🇩🇰',
    englishName: 'Danish',
    datFileName: 'tw10428_Photoshop_da_DK.dat',
  },
  {
    code: 'nl_NL',
    name: '네덜란드어',
    nativeName: 'Nederlands',
    flag: '🇳🇱',
    englishName: 'Dutch',
    datFileName: 'tw10428_Photoshop_nl_NL.dat',
  },
  {
    code: 'fi_FI',
    name: '핀란드어',
    nativeName: 'Suomi',
    flag: '🇫🇮',
    englishName: 'Finnish',
    datFileName: 'tw10428_Photoshop_fi_FI.dat',
  },
  {
    code: 'nb_NO',
    name: '노르웨이어',
    nativeName: 'Norsk (Bokmål)',
    flag: '🇳🇴',
    englishName: 'Norwegian',
    datFileName: 'tw10428_Photoshop_nb_NO.dat',
  },
  {
    code: 'ar_AE',
    name: '아랍어',
    nativeName: 'العربية',
    flag: '🇦🇪',
    englishName: 'Arabic',
    datFileName: 'tw10428_Photoshop_ar_AE.dat',
  },
  {
    code: 'he_IL',
    name: '히브리어',
    nativeName: 'עברית',
    flag: '🇮🇱',
    englishName: 'Hebrew',
    datFileName: 'tw10428_Photoshop_he_IL.dat',
  },
];

export const DEFAULT_LOCALE_CODE = 'ko_KR';

/**
 * Common quick-access locales shown on priority selector tabs
 */
export const POPULAR_LOCALE_CODES = [
  'ko_KR',
  'en_US',
  'ja_JP',
  'zh_CN',
  'zh_TW',
  'de_DE',
  'fr_FR',
  'es_ES',
];

/**
 * Returns the locale preset by code, falling back to Korean (ko_KR)
 */
export function getLocaleByCode(code?: string): LocalePreset {
  if (!code) return SUPPORTED_LOCALES[0];
  const found = SUPPORTED_LOCALES.find(
    (l) => l.code.toLowerCase() === code.toLowerCase()
  );
  if (found) return found;

  // Generic fallback if unknown code provided
  return {
    code,
    name: code,
    nativeName: code,
    flag: '🌐',
    englishName: code,
    datFileName: `tw10428_Photoshop_${code}.dat`,
  };
}

/**
 * Resolves the primary DAT filename for a given locale and version
 */
export function getDatFileNameForLocale(
  localeCode: string,
  isCs6: boolean = false
): string {
  if (isCs6) {
    return 'tw10428.dat';
  }
  return `tw10428_Photoshop_${localeCode}.dat`;
}

/**
 * Extracts a locale code from a folder path like '.../Locales/ja_JP/Support Files'
 */
export function detectLocaleFromPath(folderPath: string): string | null {
  const match = folderPath.match(/Locales[\\/]([a-zA-Z]{2}_[a-zA-Z]{2})/i);
  return match ? match[1] : null;
}

/**
 * Extracts a locale code from a dat file name like 'tw10428_Photoshop_zh_CN.dat'
 */
export function detectLocaleFromDatFileName(fileName: string): string | null {
  const match = fileName.match(/tw10428_Photoshop_([a-zA-Z]{2}_[a-zA-Z]{2})\.dat/i);
  return match ? match[1] : null;
}

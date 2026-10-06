export type OperatingSystem = 'windows' | 'macos';
export type AdobeAppType = 'photoshop' | 'illustrator';

export interface PhotoshopVersionPreset {
  id: string;
  name: string;
  folderName: string;
  year: number | string;
  defaultDatFile: string;
  note?: string;
}

export interface IllustratorVersionPreset {
  id: string;
  name: string;
  folderName: string;
  year: number | string;
  defaultConfigFile: string; // usually 'application.xml'
  subPath: string; // usually 'Support Files\\Contents\\Windows\\AMT'
  note?: string;
}

export interface LocalePreset {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  englishName: string;
  datFileName?: string;
}

export type LanguageMode = 'native' | 'korean' | 'english' | 'unknown' | 'not_found';

export interface PathConfig {
  appType: AdobeAppType;
  os: OperatingSystem;
  drive: string;
  versionId: string;
  locale?: string; // e.g. 'ko_KR', 'ja_JP', 'zh_CN', etc. (default: 'ko_KR')
  isCustomPath: boolean;
  customPath: string;
  customDatFileName: string;
}

export interface DetectedFileInfo {
  koreanFileExists: boolean;
  englishFileExists: boolean;
  koreanFileName: string;
  englishFileName: string;
  currentMode: LanguageMode;
  folderName: string;
  lastChecked?: Date;
  appType?: AdobeAppType;
  xmlLanguageValue?: string;
  detectedLocale?: string;
}

export interface DetectedPhotoshopInstallation {
  id: string;
  versionName: string;
  folderName: string;
  supportFilesPath?: string;
  datFileName: string;
  oldDatFileName: string;
  currentMode: LanguageMode;
  supportDirHandle?: FileSystemDirectoryHandle;
  koreanFileExists: boolean;
  englishFileExists: boolean;
  isSelected?: boolean;
  appType?: AdobeAppType;
  xmlPath?: string;
  detectedLocale?: string;
  detectedLocaleName?: string;
}

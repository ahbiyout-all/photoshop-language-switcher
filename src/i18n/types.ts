export interface TranslationDict {
  // App & Header
  appNamePhotoshop: string;
  appNameIllustrator: string;
  appSubtitlePhotoshop: string;
  appSubtitleIllustrator: string;
  badgeLanguages: string;
  badgeLossless: string;
  pageLanguage: string;
  desktopSuiteSupport: string;
  offlineReady: string;

  // Window Bar & PWA
  windowTitleBarPsAi: string;
  pwaInstalledRunning: string;
  pwaInstallDesktopBtn: string;
  pwaModalTitle: string;
  pwaModalDescChrome: string;
  pwaModalDescEdge: string;
  pwaModalDescSafari: string;
  pwaModalClose: string;

  // Step 0: App Switcher
  selectAppTitle: string;
  selectAppSubtitle: string;
  selectAppPhotoshopBtn: string;
  selectAppIllustratorBtn: string;

  // Step 1: Scanner / Detector
  stepDetectorTitle: string;
  stepDetectorDesc: string;
  scanBtn: string;
  scanning: string;
  scanBatDownload: string;
  scanRecommendFolder: string;
  scanSuccessMsg: string;
  scanErrorMsg: string;
  batchToggleAll: string;
  batchAllEn: string;
  batchAllKo: string;
  detectedCountLabel: string;
  selectedTarget: string;
  selectThisVersion: string;
  toggleBtn: string;
  statusKoActive: string;
  statusEnActive: string;
  statusNotFound: string;
  scanHelpTip: string;
  singleToggleSuccessKo: string;
  singleToggleSuccessEn: string;
  batchToggleSuccess: string;

  // Step 2: Path Configurator
  stepPathTitle: string;
  stepPathDesc: string;
  targetLocaleLabel: string;
  installDriveLabel: string;
  copyPathBtn: string;
  copiedBtn: string;
  pasteClipboardBtn: string;
  autoPresetLabel: string;
  customPathLabel: string;
  activeTargetPreview: string;
  customPathInputPlaceholder: string;
  customDatFileLabel: string;
  resetDefaultBtn: string;

  // Step 3: GUI Distributor
  stepDistributorTitle: string;
  stepDistributorDesc: string;
  downloadZipBtn: string;
  standalonePackage: string;
  guiDistributorNoticeTitle: string;
  guiDistributorNoticeBody: string;
  guiDistributorFeature1: string;
  guiDistributorFeature2: string;
  guiDistributorFeature3: string;

  // Step 4: Script & Compiler Generator
  stepScriptTitle: string;
  stepScriptDesc: string;
  downloadExeCompiler: string;
  downloadBat: string;
  downloadCmd: string;
  downloadAllBundle: string;
  propertiesModalBtn: string;
  safeNativeDesc: string;
  adminElevationPreCheckTitle: string;
  adminElevationPreCheckDesc: string;
  tabExeTitle: string;
  tabBatTitle: string;
  tabPs1Title: string;
  tabVbsTitle: string;
  tabShortcutTitle: string;
  tabHtaTitle: string;
  tabMacTitle: string;
  scriptCopiedSuccess: string;
  copyScriptBtn: string;
  showCodePreview: string;
  hideCodePreview: string;

  // Properties / Security Modal
  propertiesModalTitle: string;
  propertiesProtectedBadge: string;
  propertiesDevUnlockedBadge: string;
  propertiesUnlockBtn: string;
  propertiesRelockBtn: string;
  propertiesOfficialDownloadBtn: string;
  propertiesCustomDownloadBtn: string;
  pinModalTitle: string;
  pinModalDesc: string;
  pinModalSubmit: string;
  pinModalCancel: string;
  pinPlaceholder: string;
  propertiesTabDetails: string;
  propertiesTabGeneral: string;
  propertiesTabSecurity: string;
  propertiesResetBtn: string;
  propertiesCloseBtn: string;

  // Step 4-1: Classroom Remote Suite
  stepClassroomTitle: string;
  stepClassroomDesc: string;
  classroomDownloadBat: string;
  classroomCopyScript: string;
  classroomTargetAppLabel: string;
  classroomTargetBoth: string;
  classroomTargetPsOnly: string;
  classroomTargetAiOnly: string;
  classroomDeployModeLabel: string;
  classroomModeToEn: string;
  classroomModeToKo: string;
  classroomModeToggle: string;
  classroomNoticeTitle: string;
  classroomNoticeDesc: string;
  classroomSilentBadge: string;

  // Step 4-2: Extended Apps
  stepExtendedTitle: string;
  stepExtendedDesc: string;
  extendedAppLabel: string;
  extendedAllApps: string;
  extendedInDesign: string;
  extendedAfterEffects: string;
  extendedPremiere: string;
  extendedAudition: string;
  extendedInCopy: string;
  extendedModeToggle: string;
  extendedModeToEn: string;
  extendedModeToTarget: string;
  extendedNoticeTitle: string;
  extendedNoticeDesc: string;
  extendedSearchLocalePlaceholder: string;

  // Step 5: Direct In-Browser Access
  stepDirectTitle: string;
  stepDirectDesc: string;
  directSelectFolder: string;
  directToggleLang: string;
  directBrowserSupportNotice: string;
  directStatusCurrent: string;
  directStatusKo: string;
  directStatusEn: string;
  directStatusNone: string;
  directFolderSelectedLabel: string;
  directNoFolderSelected: string;

  // Step 6: Guide & Mechanism & FAQ
  stepGuideTitle: string;
  stepGuideDesc: string;
  guideStep1Title: string;
  guideStep1Desc: string;
  guideStep2Title: string;
  guideStep2Desc: string;
  guideStep3Title: string;
  guideStep3Desc: string;
  guideMechTitle: string;
  guideMechPsDesc: string;
  guideMechAiDesc: string;
  faqTitle: string;
  faq1Question: string;
  faq1Answer: string;
  faq2Question: string;
  faq2Answer: string;

  // Step 7: Docs Hub
  stepDocsTitle: string;
  stepDocsDesc: string;
  docsSemVerBadge: string;
  docsAutoSyncNotice: string;
  docsVerifiedStatus: string;
  docPatchNotesTitle: string;
  docPatchNotesSummary: string;
  docArchitectureTitle: string;
  docArchitectureSummary: string;
  docUserGuideTitle: string;
  docUserGuideSummary: string;
  docClassroomGuideTitle: string;
  docClassroomGuideSummary: string;
  docExtendedAppsTitle: string;
  docExtendedAppsSummary: string;
  docTroubleshootingTitle: string;
  docTroubleshootingSummary: string;
  docGithubPublishingTitle: string;
  docGithubPublishingSummary: string;
  semVerPolicyTitle: string;
  semVerPolicyDesc: string;
  semVerCurrentBadge: string;

  // Footer
  footerAppDesc: string;
  footerDeveloper: string;
  footerContact: string;
  footerOrg: string;
  footerOfficialBlog: string;
  footerVisitBlog: string;
  footerCopyright: string;
  footerDevInfo: string;
}

export type LocaleCode = string;

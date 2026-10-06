import React, { useState } from 'react';
import {
  FileCode,
  Download,
  Copy,
  Check,
  Terminal,
  ShieldAlert,
  ArrowRightLeft,
  Package,
  Layers,
  Sparkles,
  Zap,
  PlaySquare,
  BookmarkPlus,
  Monitor,
  ShieldCheck,
  AlertTriangle,
  Info,
  Laptop,
  AppWindow,
  SlidersHorizontal,
  Globe,
} from 'lucide-react';
import { ExePropertiesModal } from './ExePropertiesModal';
import { PathConfig } from '../types';
import { SCRIPT_SECURITY_PROFILES } from '../types/security';
import { BATCH_ERROR_LEVELS } from '../types/errorLevels';
import {
  resolveFolderPath,
  resolveDatFileName,
  generateToEnglishBat,
  generateToKoreanBat,
  generateSmartToggleBat,
  generateAutoDetectMultiVersionBat,
  generateUniversalMultiLangBat,
  generatePowerShellScript,
  generateMacShellScript,
  generateExeBuilderBat,
  generateVbsGuiScript,
  generateDesktopShortcutBat,
  generateWindowsHtaApp,
  downloadTextFile,
  downloadCmdFile,
  downloadAutoExeCompilerFile,
  type ExeMetadata,
} from '../utils/photoshopHelper';
import { getLocaleByCode } from '../utils/localeHelper';
import {
  generateIllustratorSmartToggleBat,
  generateIllustratorAutoDetectMultiVersionBat,
  generateIllustratorToEnglishBat,
  generateIllustratorToKoreanBat,
  generateIllustratorShortcutBat,
  generateIllustratorPowerShellScript,
} from '../utils/illustratorHelper';
import { useI18n } from '../i18n/I18nContext';
import {
  APP_VERSION,
  APP_ORGANIZATION,
  APP_AUTHOR,
  APP_COPYRIGHT,
} from '../version';

interface ScriptGeneratorProps {
  config: PathConfig;
}

/**
 * Applies or updates the Pre-Check (사전 검사) logic:
 * - Checks administrator privileges (net session on CMD, WindowsPrincipal on PowerShell)
 * - If not elevated, outputs explicit warning message explaining that admin rights are required
 * - Prompts for privilege elevation via PowerShell Start-Process -Verb RunAs
 * - Handles elevation denial/failure gracefully with exit code 1 and user guidance
 */
export function applyAdminElevationWrapper(
  rawContent: string,
  filename: string,
  enabled: boolean
): string {
  const isBat = filename.endsWith('.bat') || filename.endsWith('.cmd');
  const isPs1 = filename.endsWith('.ps1');

  if (!isBat && !isPs1) {
    return rawContent;
  }

  if (isBat) {
    // Clean out any existing elevation / UAC blocks to ensure clean injection
    let cleaned = rawContent
      .replace(
        /rem =========================================================================\r?\nrem \[(사전 검사|Pre-Check|Auto-Elevation Wrapper)[\s\S]*?rem =========================================================================\r?\n/gi,
        ''
      )
      .replace(
        /rem =========================================================================\r?\nrem Auto-Elevate to Administrator[\s\S]*?rem =========================================================================\r?\n/gi,
        ''
      )
      .replace(
        /:: ========================================================\r?\n:: \[1\] UAC 관리자 권한[\s\S]*?:uac_ok\r?\n(@echo off\r?\nsetlocal enabledelayedexpansion\r?\ncls\r?\n)?/gi,
        ''
      );

    // Also strip standalone old net session checks if present at top
    cleaned = cleaned.replace(
      /rem =========================================================================\r?\nrem \[사전 검사 \/ Pre-Check\][\s\S]*?rem =========================================================================\r?\n/gi,
      ''
    ).replace(
      /net session >nul 2>&1\r?\nif %errorlevel% neq 0 \([\s\S]*?exit \/b [01]\r?\n\)\r?\n(cd \/d "%~dp0"\r?\n)?(if "%1"=="am_admin" \(\r?\n\s+shift\r?\n\)\r?\n)?/gi,
      ''
    );

    const batPreCheckHeader = enabled
      ? `rem =========================================================================
rem [Pre-Check] Administrator Privileges Verification & UAC Elevation
rem =========================================================================
rem [Anti-Loop Circuit Breaker] Skip elevation if already elevated via am_admin
if "%~1"=="am_admin" (
    shift
    goto :admin_acquired
)

rem Multi-method administrator privilege check (fsutil -> fltmc -> net session)
set "IS_ADMIN=0"
fsutil dirty query %systemdrive% >nul 2>&1 && set "IS_ADMIN=1"
if "!IS_ADMIN!"=="0" (
    fltmc >nul 2>&1 && set "IS_ADMIN=1"
)
if "!IS_ADMIN!"=="0" (
    net session >nul 2>&1 && set "IS_ADMIN=1"
)

if "!IS_ADMIN!"=="0" (
    echo.
    echo =========================================================================
    echo [WARNING] Administrator Privileges Not Detected - Access Denied!
    echo =========================================================================
    echo  * Modifying files in Program Files requires administrator privileges.
    echo  * Requesting Windows UAC (User Account Control) elevation...
    echo  * Please click [Yes] on the UAC prompt to continue.
    echo =========================================================================
    echo.
    set "SELF_BAT=%~f0"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath cmd.exe -ArgumentList '/c', ('\"' + $env:SELF_BAT + '\"'), 'am_admin' -Verb RunAs"
    if %errorlevel% neq 0 (
        echo.
        echo =========================================================================
        echo [ERROR] Administrator privileges could not be acquired (UAC rejected or failed).
        echo [GUIDE] Right-click this script file and select 'Run as administrator'.
        echo =========================================================================
        echo.
        pause
        exit /b 1
    )
    exit /b 0
)

:admin_acquired
cd /d "%~dp0"
rem =========================================================================
`
      : `rem =========================================================================
rem [Pre-Check] Administrator Privileges Verification (Manual Execution Mode)
rem =========================================================================
rem Multi-method administrator privilege check (fsutil -> fltmc -> net session)
set "IS_ADMIN=0"
fsutil dirty query %systemdrive% >nul 2>&1 && set "IS_ADMIN=1"
if "!IS_ADMIN!"=="0" (
    fltmc >nul 2>&1 && set "IS_ADMIN=1"
)
if "!IS_ADMIN!"=="0" (
    net session >nul 2>&1 && set "IS_ADMIN=1"
)

if "!IS_ADMIN!"=="0" (
    echo.
    echo =========================================================================
    echo [WARNING] Administrator Privileges Not Detected - Access Denied!
    echo =========================================================================
    echo  * Modifying files in Program Files requires administrator privileges.
    echo  * Please right-click this script file and select 'Run as administrator'.
    echo =========================================================================
    echo.
    pause
    exit /b 1
)

cd /d "%~dp0"
rem =========================================================================
`;

    if (cleaned.includes('@echo off')) {
      return cleaned.replace(/@echo off\r?\n(setlocal enabledelayedexpansion\r?\n)?/, () => {
        return `@echo off\n@chcp 65001 >nul 2>&1\nsetlocal enabledelayedexpansion\n${batPreCheckHeader}\n`;
      });
    }

    return `@echo off\n@chcp 65001 >nul 2>&1\nsetlocal enabledelayedexpansion\n\n${batPreCheckHeader}\n${cleaned}`;
  }

  if (isPs1) {
    // Clean out any existing elevation / UAC blocks
    let cleaned = rawContent
      .replace(
        /# =========================================================================\r?\n# \[(사전 검사|Pre-Check|Auto-Elevation Wrapper)[\s\S]*?# =========================================================================\r?\n/gi,
        ''
      )
      .replace(
        /# 1\. 관리자 권한 확인 및 자동 승격[\s\S]*?Exit\r?\n}/gi,
        ''
      )
      .replace(
        /if \(-not \(\[Security\.Principal\.WindowsPrincipal\][\s\S]*?Exit\r?\n}/gi,
        ''
      );

    const ps1PreCheckHeader = enabled
      ? `# =========================================================================
# [사전 검사 / Pre-Check] 관리자 권한 확인 및 경고 / 권한 상승(UAC) 요청
# =========================================================================
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host "[경고 / WARNING] 관리자 권한으로 실행되지 않았습니다!" -ForegroundColor Red
    Write-Host "(Administrator Privileges Not Detected - Access Denied)" -ForegroundColor Yellow
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host " * 어도비 설치 디렉터리(Program Files) 파일 수정을 위해 관리자 권한이 필수입니다." -ForegroundColor Gray
    Write-Host " * 관리자 권한 상승(UAC RunAs)을 요청합니다..." -ForegroundColor Cyan
    Write-Host " * 잠시 후 화면에 나타나는 UAC 승인 창에서 [예(Yes)]를 선택해주세요." -ForegroundColor Cyan
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host ""
    try {
        Start-Process powershell.exe -ArgumentList '-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', $PSCommandPath -Verb RunAs
    } catch {
        Write-Host ""
        Write-Host "=========================================================================" -ForegroundColor Red
        Write-Host "[오류 / ERROR] 관리자 권한 상승 요청이 거부되었거나 실패했습니다." -ForegroundColor Red
        Write-Host "[해결 방법] 스크립트 파일을 마우스 우클릭하여 [관리자 권한으로 실행]을 선택하세요." -ForegroundColor Yellow
        Write-Host "=========================================================================" -ForegroundColor Red
        Write-Host ""
        Read-Host "계속하려면 Enter 키를 누르세요..."
        Exit 1
    }
    Exit 0
}
# =========================================================================

`
      : `# =========================================================================
# [사전 검사 / Pre-Check] 관리자 권한 확인 및 경고 안내 (수동 실행 모드)
# =========================================================================
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host ""
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host "[경고 / WARNING] 관리자 권한으로 실행되지 않았습니다!" -ForegroundColor Red
    Write-Host "(Administrator Privileges Not Detected - Access Denied)" -ForegroundColor Yellow
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host " * 어도비 설치 디렉터리(Program Files) 파일 수정을 위해 관리자 권한이 필수입니다." -ForegroundColor Gray
    Write-Host " * 스크립트 파일을 마우스 우클릭하여 [관리자 권한으로 실행]을 선택해주세요." -ForegroundColor Yellow
    Write-Host "=========================================================================" -ForegroundColor Yellow
    Write-Host ""
    Read-Host "계속하려면 Enter 키를 누르세요..."
    Exit 1
}
# =========================================================================

`;

    return ps1PreCheckHeader + cleaned;
  }

  return rawContent;
}

type ScriptType =
  | 'multi_version_bat'
  | 'universal_multi_lang'
  | 'toggle_bat'
  | 'desktop_shortcut'
  | 'exe_builder'
  | 'hta_gui'
  | 'english_bat'
  | 'korean_bat'
  | 'powershell'
  | 'macos'
  | 'vbs_gui';

export const ScriptGenerator: React.FC<ScriptGeneratorProps> = ({ config }) => {
  const { t } = useI18n();
  const isIllustrator = config.appType === 'illustrator';
  const appName = isIllustrator ? (t('appNameIllustrator') || 'Illustrator') : (t('appNamePhotoshop') || 'Photoshop');
  const currentLocalePreset = getLocaleByCode(config.locale || 'ko_KR');

  // Default to multi-version auto detect bat for utmost convenience
  const [activeTab, setActiveTab] = useState<ScriptType>('multi_version_bat');
  const [copied, setCopied] = useState(false);
  const [downloadAllSuccess, setDownloadAllSuccess] = useState(false);
  // Auto-elevation wrapper state (defaults to true for maximum convenience)
  const [autoElevate, setAutoElevate] = useState(true);

  const folderPath = resolveFolderPath(config);
  const datFile = resolveDatFileName(config);

  const getScriptContentAndFilename = () => {
    if (isIllustrator) {
      switch (activeTab) {
        case 'multi_version_bat':
          return {
            content: generateIllustratorAutoDetectMultiVersionBat(),
            filename: 'illustrator_multi_version_auto_scanner.bat',
            label: '일러스트레이터 다중 버전 자동 감지 & 선택 토글 배치 스크립트 (.bat)',
            badge: '다중 버전 스마트 감지',
            desc: 'C/D/E/F 드라이브의 모든 Illustrator 버전을 1초 만에 자동 검색하여 원하는 버전을 번호로 선택하거나 전체 일괄 전환합니다.',
          };
        case 'toggle_bat':
          return {
            content: generateIllustratorSmartToggleBat(folderPath, datFile || 'application.xml', config.locale || 'ko_KR'),
            filename: 'illustrator_toggle_language.bat',
            label: `일러스트레이터 스마트 자동 토글 배치 스크립트 (.bat) [${currentLocalePreset.name}]`,
            badge: '가장 안전 (추천)',
            desc: `Illustrator Support Files\\Contents\\Windows\\AMT\\application.xml 파일 내 언어 설정을 ${currentLocalePreset.code} ⇄ en_US로 상호 전환합니다.`,
          };
        case 'desktop_shortcut':
          return {
            content: generateIllustratorShortcutBat(folderPath, datFile || 'application.xml', config.locale || 'ko_KR'),
            filename: 'create_illustrator_desktop_shortcut.bat',
            label: `일러스트레이터 바탕화면 바로가기 아이콘 생성기 (.bat) [${currentLocalePreset.name}]`,
            badge: '원클릭 바로가기',
            desc: `바탕화면에 "Illustrator ${currentLocalePreset.name}/영어 토글" 전용 바로가기(.lnk) 아이콘을 생성하고 본체 스크립트를 안전하게 보관합니다.`,
          };
        case 'english_bat':
          return {
            content: generateIllustratorToEnglishBat(folderPath, datFile || 'application.xml', config.locale || 'ko_KR'),
            filename: 'illustrator_switch_to_english.bat',
            label: '일러스트레이터 영어로 변경 배치 스크립트 (.bat)',
            badge: '영어 전용',
            desc: 'application.xml의 installedLanguages 값을 en_US(영문)로 설정합니다.',
          };
        case 'korean_bat':
          return {
            content: generateIllustratorToKoreanBat(folderPath, datFile || 'application.xml', config.locale || 'ko_KR'),
            filename: `illustrator_switch_to_${currentLocalePreset.code.toLowerCase()}.bat`,
            label: `일러스트레이터 ${currentLocalePreset.name}로 복구 배치 스크립트 (.bat)`,
            badge: `${currentLocalePreset.name} 복구`,
            desc: `application.xml의 installedLanguages 값을 ${currentLocalePreset.code}(${currentLocalePreset.name})로 복원합니다.`,
          };
        case 'powershell':
          return {
            content: generateIllustratorPowerShellScript(folderPath, datFile || 'application.xml', config.locale || 'ko_KR'),
            filename: 'illustrator_toggle.ps1',
            label: `일러스트레이터 파워셸 스크립트 (.ps1) [${currentLocalePreset.name}]`,
            badge: 'PowerShell',
            desc: '현대적인 Windows PowerShell 터미널 환경을 위한 표준 관리 스크립트입니다.',
          };
        case 'universal_multi_lang':
        case 'exe_builder':
        case 'hta_gui':
        case 'macos':
        case 'vbs_gui':
        default:
          return {
            content: generateIllustratorSmartToggleBat(folderPath),
            filename: 'illustrator_toggle_language.bat',
            label: '일러스트레이터 스마트 자동 토글 배치 스크립트 (.bat)',
            badge: '가장 안전 (추천)',
            desc: 'Illustrator Support Files\\Contents\\Windows\\AMT\\application.xml 파일 내 언어 설정을 ko_KR ⇄ en_US로 상호 전환합니다.',
          };
      }
    }

    switch (activeTab) {
      case 'multi_version_bat':
        return {
          content: generateAutoDetectMultiVersionBat(),
          filename: 'photoshop_multi_version_auto_scanner.bat',
          label: '다중 버전 자동 감지 & 선택 토글 배치 스크립트 (.bat)',
          badge: '다중 버전 스마트 감지',
          desc: 'C/D/E 드라이브의 모든 포토샵 버전을 1초 만에 자동 검색하여 원하는 버전을 번호로 선택하거나 전체 일괄 전환합니다.',
        };
      case 'universal_multi_lang':
        return {
          content: generateUniversalMultiLangBat(),
          filename: 'photoshop_universal_multilang_switcher.bat',
          label: '포토샵 전세계 다국어 통합 자동 스위처 (.bat)',
          badge: '🌐 전세계 24개국 지원',
          desc: '한국어뿐만 아니라 일본어, 중국어, 독일어, 프랑스어, 스페인어 등 시스템에 설치된 모든 언어팩을 자동 감지하여 1-Click 전환합니다.',
        };
      case 'toggle_bat':
        return {
          content: generateSmartToggleBat(folderPath, datFile),
          filename: 'photoshop_toggle_language.bat',
          label: `스마트 자동 토글 배치 스크립트 (${currentLocalePreset.name} ⇄ 영어) (.bat)`,
          badge: '가장 안전 (추천)',
          desc: `Windows 순수 내장 명령어 구성으로 백신 오진율 0%! 더블클릭 시 UAC 권한 승인 후 ${currentLocalePreset.name}/영어를 자동 전환합니다.`,
        };
      case 'desktop_shortcut':
        return {
          content: generateDesktopShortcutBat(folderPath, datFile),
          filename: 'create_desktop_shortcut.bat',
          label: '바탕화면 바로가기 아이콘 생성기 (.bat)',
          badge: '원클릭 바로가기',
          desc: `바탕화면에 "포토샵 ${currentLocalePreset.name}/영어 전환" 전용 바로가기(.lnk) 아이콘을 생성하고 본체 스크립트를 안전하게 보관합니다.`,
        };
      case 'exe_builder':
        return {
          content: generateExeBuilderBat(folderPath, datFile),
          filename: 'build_photoshop_toggle_exe.bat',
          label: 'Windows .EXE 단독 실행 파일 자동 빌더 (.bat)',
          badge: 'EXE 빌더',
          desc: 'Windows 기본 내장 .NET C# 컴파일러를 구동하여 바탕화면에 100% 무결점 단독 실행 파일(Photoshop_Language_Toggle.exe)을 생성합니다. 콘솔 창 없이 0.05초 만에 윈도우 팝업과 함께 전환됩니다.',
        };
      case 'hta_gui':
        return {
          content: generateWindowsHtaApp(folderPath, datFile),
          filename: 'Photoshop_Language_Switcher_GUI.hta',
          label: '독립형 데스크톱 HTML GUI 애플리케이션 (.hta)',
          badge: '설치 불필요 GUI',
          desc: `검은 콘솔창 없이 세련된 독립 GUI 창으로 실행되며, 버튼 클릭으로 현재 상태 확인 및 ${currentLocalePreset.name}/영 전환이 가능합니다.`,
        };
      case 'english_bat':
        return {
          content: generateToEnglishBat(folderPath, datFile),
          filename: 'photoshop_switch_to_english.bat',
          label: '영어로 변경 배치 스크립트 (.bat)',
          badge: '영어 전용',
          desc: '언어 데이터 파일에 old_ 접두사를 붙여 영문 포토샵 모드로 강제 설정합니다.',
        };
      case 'korean_bat':
        return {
          content: generateToKoreanBat(folderPath, datFile),
          filename: `photoshop_switch_to_${config.locale || 'korean'}.bat`,
          label: `${currentLocalePreset.name}로 변경 배치 스크립트 (.bat)`,
          badge: `${currentLocalePreset.name} 복구`,
          desc: `old_ 접두사를 제거하여 원래의 ${currentLocalePreset.name} 포토샵 모드로 복원합니다.`,
        };
      case 'powershell':
        return {
          content: generatePowerShellScript(folderPath, datFile),
          filename: 'photoshop_toggle.ps1',
          label: '파워셸 스크립트 (.ps1)',
          badge: 'PowerShell',
          desc: '현대적인 Windows PowerShell 터미널 환경을 위한 표준 관리 스크립트입니다.',
        };
      case 'macos':
        return {
          content: generateMacShellScript(folderPath, datFile),
          filename: 'photoshop_toggle_mac.sh',
          label: 'Mac 터미널 스크립트 (.sh)',
          badge: 'macOS',
          desc: 'Mac OS 포토샵 환경을 위한 셸 스크립트입니다.',
        };
      case 'vbs_gui':
        return {
          content: generateVbsGuiScript(folderPath, datFile),
          filename: 'photoshop_toggle_gui.vbs',
          label: 'VBScript 무음 GUI 런처 (.vbs)',
          badge: '⚠️ 오진 주의',
          desc: '검은 창 없이 Windows MsgBox를 띄우지만, VBS 스크립트 특성상 일부 백신(V3, 알약, Defender)에서 오진될 수 있습니다.',
        };
    }
  };

  const rawScript = getScriptContentAndFilename();
  const content = applyAdminElevationWrapper(rawScript.content, rawScript.filename, autoElevate);
  const { filename, label, badge, desc } = rawScript;
  const securityProfile = SCRIPT_SECURITY_PROFILES[activeTab] || SCRIPT_SECURITY_PROFILES.toggle_bat;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const [isExeModalOpen, setIsExeModalOpen] = useState(false);

  const getDefaultExeMetadata = (): ExeMetadata => {
    const appName = isIllustrator ? 'Adobe Illustrator' : 'Adobe Photoshop';
    const appNameKo = isIllustrator ? '어도비 일러스트레이터' : '어도비 포토샵';
    const actionDesc =
      activeTab === 'english_bat'
        ? '영어 전용 변경기'
        : activeTab === 'korean_bat'
        ? '한국어 전용 변경기'
        : activeTab === 'multi_version_bat'
        ? 'PC 전 버전 자동 감지 변경기'
        : '한영 스마트 토글 변경기';

    return {
      title: `${appName} Language Switcher`,
      description: `${appNameKo} ${actionDesc} (한국어 ⇄ 영어)`,
      company: APP_ORGANIZATION,
      product: `${appName} Language Switcher Suite`,
      copyright: APP_COPYRIGHT,
      trademark: `Official Core Engine: ${APP_ORGANIZATION} | ${APP_AUTHOR}`,
      version: `${APP_VERSION}.0`,
      informationalVersion: APP_VERSION,
      originalFilename: filename.replace(/\.(bat|cmd|ps1)$/i, '.exe'),
    };
  };

  const handleDownload = () => {
    downloadTextFile(content, filename);
  };

  const handleDownloadCmd = () => {
    downloadCmdFile(content, filename);
  };

  const handleDownloadExeCompiler = (customMeta?: ExeMetadata) => {
    downloadAutoExeCompilerFile(content, filename, customMeta || getDefaultExeMetadata());
  };

  const handleDownloadAllToolkit = () => {
    // Sequentially trigger downloads for the entire safe desktop suite
    const suite = isIllustrator
      ? [
          { name: 'illustrator_multi_version_auto_scanner.bat', content: generateIllustratorAutoDetectMultiVersionBat() },
          { name: 'illustrator_toggle_language.bat', content: generateIllustratorSmartToggleBat(folderPath) },
          { name: 'create_illustrator_desktop_shortcut.bat', content: generateIllustratorShortcutBat(folderPath) },
          { name: 'illustrator_switch_to_english.bat', content: generateIllustratorToEnglishBat(folderPath) },
          { name: 'illustrator_switch_to_korean.bat', content: generateIllustratorToKoreanBat(folderPath) },
        ]
      : [
          { name: 'photoshop_multi_version_auto_scanner.bat', content: generateAutoDetectMultiVersionBat() },
          { name: 'photoshop_toggle_language.bat', content: generateSmartToggleBat(folderPath, datFile) },
          { name: 'create_desktop_shortcut.bat', content: generateDesktopShortcutBat(folderPath, datFile) },
          { name: 'photoshop_switch_to_english.bat', content: generateToEnglishBat(folderPath, datFile) },
          { name: 'photoshop_switch_to_korean.bat', content: generateToKoreanBat(folderPath, datFile) },
        ];

    suite.forEach((file, index) => {
      const finalContent = applyAdminElevationWrapper(file.content, file.name, autoElevate);
      setTimeout(() => {
        downloadTextFile(finalContent, file.name);
      }, index * 250);
    });

    setDownloadAllSuccess(true);
    setTimeout(() => setDownloadAllSuccess(false), 3000);
  };

  return (
    <section id="script-generator-section" className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">
              {t('stepScriptTitle')}
            </h2>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              {t('badgeLossless')}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {t('stepScriptDesc')}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-mono text-slate-500 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200">
            <span className="text-emerald-700 font-bold">UTF-8 BOM</span>
            <span className="text-slate-300">|</span>
            <span className="text-blue-700 font-bold">CRLF</span>
            <span className="text-slate-300">|</span>
            <span className="text-indigo-700 font-bold">Auto UAC</span>
          </div>

          <button
            id="download-all-bundle-btn"
            type="button"
            onClick={handleDownloadAllToolkit}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            title="Download full toolkit"
          >
            {downloadAllSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-300 font-bold">✓ Downloaded!</span>
              </>
            ) : (
              <>
                <Layers className="w-3.5 h-3.5 text-blue-300" />
                <span>{t('downloadAllBundle')}</span>
              </>
            )}
          </button>

          <button
            id="download-script-btn"
            type="button"
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer"
            title=".BAT"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('downloadBat')}</span>
          </button>

          <button
            id="download-cmd-script-btn"
            type="button"
            onClick={handleDownloadCmd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs hover:shadow transition-all active:scale-95 cursor-pointer"
            title=".CMD"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />
            <span>{t('downloadCmd')}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              id="download-exe-compiler-btn"
              type="button"
              onClick={() => handleDownloadExeCompiler()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer border border-blue-400/30"
              title="1-Click .EXE Compiler"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{t('downloadExeCompiler')}</span>
            </button>

            <button
              id="configure-exe-props-btn"
              type="button"
              onClick={() => setIsExeModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-blue-300 hover:text-white text-xs font-semibold shadow-2xs transition-all active:scale-95 cursor-pointer border border-blue-400/30"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">{t('propertiesModalBtn')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Auto-Elevation & Pre-Check Control Bar */}
      <div className="mt-4 p-3.5 rounded-xl bg-gradient-to-r from-blue-50/90 via-indigo-50/60 to-slate-50 border border-blue-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-start sm:items-center gap-2.5">
          <div className={`p-2 rounded-lg ${autoElevate ? 'bg-blue-600 text-white shadow-xs' : 'bg-slate-200 text-slate-600'} transition-all shrink-0`}>
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-900">
                {t('adminElevationPreCheckTitle')}
              </span>
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${autoElevate ? 'bg-blue-100 text-blue-800 border-blue-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                {autoElevate ? 'Auto UAC (ON)' : 'Manual Guide (OFF)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 mt-0.5">
              {t('adminElevationPreCheckDesc')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
          <button
            id="toggle-elevation-wrapper-btn"
            type="button"
            onClick={() => setAutoElevate(!autoElevate)}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
              autoElevate ? 'bg-blue-600' : 'bg-slate-300'
            }`}
            role="switch"
            aria-checked={autoElevate}
            title={t('adminElevationPreCheckTitle')}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                autoElevate ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Pre-Check Mechanism Flow Card */}
      <div className="mt-3 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-slate-100 text-xs">
              관리자 권한 사전 검사(Pre-Check) 및 경고·승격 메커니즘
            </span>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800/80">
            사전 검사 로직 내장됨
          </span>
        </div>

        <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-blue-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-blue-900/60 text-blue-300 flex items-center justify-center text-[10px]">1</span>
              <span>권한 사전 검증 (Pre-Check)</span>
            </div>
            <p className="mt-1 text-[10px] text-slate-400 leading-relaxed font-mono">
              net session (CMD)<br />
              WindowsPrincipal (PS1)
            </p>
            <p className="mt-1 text-[11px] text-slate-300 leading-snug">
              스크립트 실행 즉시 관리자 권한 보유 여부를 오류 없이 0.01초 만에 사전 검사합니다.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-amber-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-amber-900/60 text-amber-300 flex items-center justify-center text-[10px]">2</span>
              <span>미권한 실행 시 경고 출력</span>
            </div>
            <p className="mt-1 text-[10px] text-amber-300 leading-relaxed font-mono">
              [경고] 관리자 권한 미감지!
            </p>
            <p className="mt-1 text-[11px] text-slate-300 leading-snug">
              Program Files 시스템 디렉터리 접근에 권한이 필수임을 사용자에게 명확히 경고합니다.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
              <span className="w-4 h-4 rounded-full bg-emerald-900/60 text-emerald-300 flex items-center justify-center text-[10px]">3</span>
              <span>UAC 권한 상승 및 가이드</span>
            </div>
            <p className="mt-1 text-[10px] text-emerald-300 leading-relaxed font-mono">
              Start-Process -Verb RunAs
            </p>
            <p className="mt-1 text-[11px] text-slate-300 leading-snug">
              UAC 창을 호출하고, 승인 거부 시 '우클릭 관리자 권한 실행' 가이드를 제공합니다.
            </p>
          </div>
        </div>
      </div>

      {/* Grouped Category Tabs */}
      <div className="mt-5 space-y-3">
        {/* Category 1: Recommended Safe Batch Scripts */}
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 mb-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>백신 오진 없는 고신뢰 표준 배치(.bat) 스크립트 (강력 추천)</span>
            </div>
            <span className="text-[10px] font-normal text-slate-500">순수 Windows 내장 명령어로 안전성 100%</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('multi_version_bat')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'multi_version_bat'
                  ? 'bg-blue-50/90 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">다중 버전 자동 감지 (.bat)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">신기능</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  모든 버전 탐색 & 번호 선택/일괄 전환
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('universal_multi_lang')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'universal_multi_lang'
                  ? 'bg-indigo-50/90 border-indigo-500 ring-2 ring-indigo-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 text-white shrink-0 mt-0.5">
                <Globe className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">다국어 통합 스위처 (.bat)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">24개국</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  모든 언어팩 자동 탐색 & 다국어 전환
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('toggle_bat')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'toggle_bat'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-600 text-white shrink-0 mt-0.5">
                <ArrowRightLeft className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">스마트 자동 토글 (.bat)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">최고 안전</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  자동 UAC 승격 & 백신 안전 0%
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hta_gui')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'hta_gui'
                  ? 'bg-blue-50/80 border-blue-500 ring-2 ring-blue-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-blue-600 text-white shrink-0 mt-0.5">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">HTML 데스크톱 GUI (.hta)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-blue-100 text-blue-800">독립 GUI</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  창 프로그램으로 실행되는 네이티브 GUI
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('desktop_shortcut')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'desktop_shortcut'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-indigo-600 text-white shrink-0 mt-0.5">
                <BookmarkPlus className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">바탕화면 바로가기 (.bat)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">편리</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  바탕화면에 안전한 전용 바로가기 생성
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exe_builder')}
              className={`flex items-start gap-2.5 p-3 rounded-xl border text-left transition-all ${
                activeTab === 'exe_builder'
                  ? 'bg-emerald-50/80 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-800 text-white shrink-0 mt-0.5">
                <PlaySquare className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900">.EXE 빌더 (IExpress)</span>
                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-slate-200 text-slate-800">내장 빌더</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">
                  Windows 기본 기능으로 단독 .exe 빌드
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Category 2: Fixed Direction & Cross-Platform */}
        <div className="pt-1">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5 flex items-center gap-1">
            <Terminal className="w-3 h-3 text-slate-400" />
            <span>단방향 고정 전환 & 터미널 스크립트</span>
          </div>
          <div className="flex flex-wrap gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/80">
            <button
              type="button"
              onClick={() => setActiveTab('english_bat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'english_bat'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              🇺🇸 영어로 고정 변경 (.bat)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('korean_bat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'korean_bat'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>{currentLocalePreset.flag}</span>
              <span>{currentLocalePreset.name}로 고정 복구 (.bat)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('powershell')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'powershell'
                  ? 'bg-white text-blue-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              PowerShell (.ps1)
            </button>

            {config.os === 'macos' && (
              <button
                type="button"
                onClick={() => setActiveTab('macos')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'macos'
                    ? 'bg-white text-blue-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Terminal className="w-3.5 h-3.5" />
                Mac Shell (.sh)
              </button>
            )}

            {/* VBS Tab with explicit warning indicator */}
            <button
              type="button"
              onClick={() => setActiveTab('vbs_gui')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'vbs_gui'
                  ? 'bg-rose-50 text-rose-800 border border-rose-200 shadow-xs'
                  : 'text-slate-500 hover:text-rose-700'
              }`}
              title="VBS 파일은 백신 휴리스틱 감시 정책으로 인해 오진될 수 있습니다"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
              <span>VBScript 무음 런처 (.vbs)</span>
              <span className="text-[10px] px-1 bg-rose-100 text-rose-700 rounded">오진주의</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Item Description & Security Badge Banner */}
      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 text-sm">{label}</span>
            <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] border ${securityProfile.badgeColor}`}>
              {securityProfile.riskLabel}
            </span>
          </div>
          <p className="text-slate-600 leading-relaxed">{desc}</p>
        </div>
        <span className="font-mono text-xs text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200/60 shrink-0 self-start sm:self-center">
          {filename}
        </span>
      </div>

      {/* Special Warning box if VBS tab is selected */}
      {activeTab === 'vbs_gui' && (
        <div className="mt-3 p-3.5 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-950 text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-amber-900 font-bold">⚠️ VBScript 백신 오진(False Positive) 주의 안내:</strong>
            <p className="mt-0.5 text-amber-800">
              VBS 파일은 과거 악성 스크립트 유포 전력으로 인해 무해한 로직임에도 불구하고 백신(V3, 알약, 카스퍼스키 등)의 휴리스틱 진단에 의해 바이러스로 오진될 가능성이 높습니다.
              오진 걱정 없이 완벽하게 안전한 사용을 원하시면 최상단의 <strong>[스마트 자동 토글 (.bat)]</strong>을 사용해 주시기 바랍니다.
            </p>
          </div>
        </div>
      )}

      {/* Script Preview Box */}
      <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900 text-slate-100 overflow-hidden shadow-sm">
        <div className="px-4 py-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block"></span>
            <span className="font-mono text-slate-300 ml-2 font-medium">
              {filename}
            </span>
            {(filename.endsWith('.bat') || filename.endsWith('.ps1')) && (
              <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold border ml-2 ${
                autoElevate
                  ? 'bg-blue-900/60 text-blue-300 border-blue-700/60'
                  : 'bg-amber-950/60 text-amber-300 border-amber-800/60'
              }`}>
                <ShieldAlert className="w-3 h-3 text-amber-400" />
                {autoElevate ? '사전 검사(Pre-Check) + UAC 자동 승격 적용됨' : '사전 검사(Pre-Check) + 경고 안내 적용됨'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              id="copy-script-btn"
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">복사 완료!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-slate-400" />
                  <span>내용 복사</span>
                </>
              )}
            </button>
          </div>
        </div>

        <pre className="p-4 text-xs font-mono text-slate-200 overflow-x-auto leading-relaxed max-h-72 select-all">
          {content}
        </pre>
      </div>

      {/* Standard ErrorLevel Reference Matrix */}
      {(activeTab === 'toggle_bat' || activeTab === 'english_bat' || activeTab === 'korean_bat') && (
        <div className="mt-3.5 p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-200 text-xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 font-bold text-slate-100">
              <Terminal className="w-3.5 h-3.5 text-blue-400" />
              <span>표준 ErrorLevel (Exit Code) 종료 코드 규격 관리</span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">exit /b %errorlevel%</span>
          </div>

          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-5 gap-2">
            {BATCH_ERROR_LEVELS.map((err) => (
              <div
                key={err.code}
                className="p-2 rounded-lg bg-slate-950/80 border border-slate-800/80 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-1.5 py-0.2 rounded font-mono font-bold text-[11px] ${
                      err.code === 0
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-800/60'
                        : 'bg-rose-950 text-rose-300 border border-rose-800/60'
                    }`}
                  >
                    Code {err.code}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono font-semibold">
                    {err.label}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-300 leading-snug">
                  {err.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Administrator Privilege & Encoding Notice */}
      <div className="mt-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/90 text-emerald-950 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-emerald-900">
              🛡️ 안전성 & 품질 보장 (.BAT 완벽 최적화):
            </span>
            <p className="mt-1 text-slate-700 leading-relaxed">
              • <strong>백신 오진 0% 보장</strong>: Windows 순수 CMD 명령어로만 작성되어 백신 검사를 안전하게 통과합니다.
              <br />
              • <strong>자동 관리자 승격(UAC)</strong>: 더블클릭 시 Windows UAC 승인 창이 즉시 호출되어 우클릭 없이 실행됩니다.
              <br />
              • <strong>포토샵 프로세스 감지</strong>: 포토샵이 켜져 있는 상태에서 발생할 수 있는 파일 잠금 오류를 사전에 감지하고 안내합니다.
              <br />
              • <strong>한글 깨짐 원천 방지</strong>: <code>UTF-8 BOM</code> 및 <code>CRLF</code>를 강제 주입하여 메모장 및 CMD에서 한글이 깨지지 않습니다.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="shrink-0 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-2xs transition-colors cursor-pointer"
        >
          {filename} 다운로드
        </button>
      </div>

      {/* Windows PE Properties (자세히) Modal */}
      <ExePropertiesModal
        isOpen={isExeModalOpen}
        onClose={() => setIsExeModalOpen(false)}
        defaultMetadata={getDefaultExeMetadata()}
        targetFilename={filename}
        onDownload={(customMeta) => {
          handleDownloadExeCompiler(customMeta);
        }}
      />
    </section>
  );
};



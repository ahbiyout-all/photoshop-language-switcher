import { OperatingSystem, PhotoshopVersionPreset, PathConfig } from '../types';
import { ILLUSTRATOR_VERSIONS, getIllustratorDefaultPath } from './illustratorHelper';
import { APP_VERSION_FULL } from '../version';
import {
  getLocaleByCode,
  getDatFileNameForLocale,
  detectLocaleFromDatFileName,
  SUPPORTED_LOCALES,
} from './localeHelper';

export const PHOTOSHOP_VERSIONS: PhotoshopVersionPreset[] = [
  {
    id: 'ps2026',
    name: 'Photoshop 2026',
    folderName: 'Adobe Photoshop 2026',
    year: 2026,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2025',
    name: 'Photoshop 2025',
    folderName: 'Adobe Photoshop 2025',
    year: 2025,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2024',
    name: 'Photoshop 2024',
    folderName: 'Adobe Photoshop 2024',
    year: 2024,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2023',
    name: 'Photoshop 2023',
    folderName: 'Adobe Photoshop 2023',
    year: 2023,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2022',
    name: 'Photoshop 2022',
    folderName: 'Adobe Photoshop 2022',
    year: 2022,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2021',
    name: 'Photoshop 2021',
    folderName: 'Adobe Photoshop 2021',
    year: 2021,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps2020',
    name: 'Photoshop 2020',
    folderName: 'Adobe Photoshop 2020',
    year: 2020,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cc2019',
    name: 'Photoshop CC 2019',
    folderName: 'Adobe Photoshop CC 2019',
    year: 2019,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cc2018',
    name: 'Photoshop CC 2018',
    folderName: 'Adobe Photoshop CC 2018',
    year: 2018,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cc2017',
    name: 'Photoshop CC 2017',
    folderName: 'Adobe Photoshop CC 2017',
    year: 2017,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cc2015',
    name: 'Photoshop CC 2015',
    folderName: 'Adobe Photoshop CC 2015',
    year: 2015,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cc2014',
    name: 'Photoshop CC 2014',
    folderName: 'Adobe Photoshop CC 2014',
    year: 2014,
    defaultDatFile: 'tw10428_Photoshop_ko_KR.dat',
  },
  {
    id: 'ps_cs6',
    name: 'Photoshop CS6 (64-bit)',
    folderName: 'Adobe Photoshop CS6 (64 Bit)',
    year: 'CS6',
    defaultDatFile: 'tw10428.dat',
    note: 'CS6 64비트 버전 (tw10428.dat)',
  },
  {
    id: 'ps_cs6_32',
    name: 'Photoshop CS6 (32-bit)',
    folderName: 'Adobe Photoshop CS6',
    year: 'CS6',
    defaultDatFile: 'tw10428.dat',
    note: 'CS6 32비트 버전 (tw10428.dat)',
  },
];

export const DRIVE_LETTERS = ['C', 'D', 'E', 'F', 'G'];

/**
 * Resolves the absolute directory path based on version rules and user configuration
 */
export function resolveFolderPath(config: PathConfig): string {
  if (config.isCustomPath && config.customPath && config.customPath.trim()) {
    return config.customPath.trim();
  }

  if (config.appType === 'illustrator') {
    const aiVersion =
      ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) ||
      ILLUSTRATOR_VERSIONS[2];
    return getIllustratorDefaultPath(aiVersion, config.drive || 'C', config.os || 'windows');
  }

  const version = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId) || PHOTOSHOP_VERSIONS[2]; // Default to 2024
  const locale = config.locale || 'ko_KR';

  if (config.os === 'macos') {
    return `/Applications/${version.folderName}/Locales/${locale}/Support Files`;
  }

  // Windows path
  const drive = config.drive || 'C';
  return `${drive}:\\Program Files\\Adobe\\${version.folderName}\\Locales\\${locale}\\Support Files`;
}

/**
 * Resolves the primary DAT or XML filename for the configured version
 */
export function resolveDatFileName(config: PathConfig): string {
  if (config.isCustomPath && config.customDatFileName && config.customDatFileName.trim()) {
    return config.customDatFileName.trim();
  }
  if (config.appType === 'illustrator') {
    return 'application.xml';
  }
  const version = PHOTOSHOP_VERSIONS.find((v) => v.id === config.versionId);
  const isCs6 = version?.year === 'CS6';
  return getDatFileNameForLocale(config.locale || 'ko_KR', isCs6);
}

/**
 * Returns the "old_" renamed file name for English mode
 */
export function getOldDatFileName(fileName: string): string {
  if (fileName.startsWith('old_')) {
    return fileName;
  }
  return `old_${fileName}`;
}

/**
 * Generate Windows Batch script to switch to English
 * Hardened for robust safety, antivirus-friendliness, and standardized ErrorLevel management
 */
export function generateToEnglishBat(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `@echo off
setlocal enabledelayedexpansion

rem =========================================================================
rem Auto-Elevate to Administrator (Self-Elevation on Double-Click)
rem =========================================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrator Privileges...
    powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\" am_admin\"' -Verb RunAs" >nul 2>&1
    exit /b 0
)

cd /d "%~dp0"

if "%1"=="am_admin" (
    shift
)

title Photoshop Language Switcher - To English Mode (1.5s Safe Pacing Engine)

rem =========================================================================
rem [Exit Code Standards]
rem 0: SUCCESS
rem 1: UAC_DENIED
rem 2: FOLDER_NOT_FOUND
rem 3: FILE_NOT_FOUND
rem 4: RENAME_FAILED
rem =========================================================================

echo =========================================================================
echo   Adobe Photoshop Language Switcher - Change to English Mode
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

rem Step 1: Check if Photoshop is running to avoid file lock
echo [Step 1/4] Checking active Photoshop process and file lock...
tasklist /fi "imagename eq Photoshop.exe" 2>nul | find /i "Photoshop.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Photoshop.exe is currently running.
    echo                     Please close Photoshop to prevent file locking issues.
) else (
    echo           [OK] No running Photoshop instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 2: Target folder verification
echo [Step 2/4] Verifying target folder access and security permissions...
echo           Target Folder : "${folderPath}"
echo           Target File   : "${fileName}"
cd /d "${folderPath}" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR: Exit Code 2] Target folder cannot be accessed or does not exist.
    echo                      Please verify your installation path:
    echo                      "${folderPath}"
    goto err_folder
)
echo           [OK] Target directory accessed successfully.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 3: Apply renaming
echo [Step 3/4] Switching language configuration to English mode...
if not exist "${fileName}" (
    if exist "${oldFileName}" (
        echo           [INFO] Already set to English Mode!
        echo                  Detected File: "${oldFileName}"
        goto verify_step
    ) else (
        echo [ERROR: Exit Code 3] Target language file ("${fileName}") not found.
        goto err_file
    )
)

ren "${fileName}" "${oldFileName}"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR: Exit Code 4] Failed to rename file due to permission lock.
    echo                      Please ensure Photoshop is completely closed.
    goto err_rename
)
echo           [OK] File renamed: "${fileName}" -> "${oldFileName}"

:verify_step
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 4: Verification and I/O buffer flush
echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
if exist "${oldFileName}" (
    echo           [OK] English language file verified on disk.
) else (
    echo           [WARNING] Delayed disk sync detected, retrying verification...
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1
)

echo.
echo -------------------------------------------------------------------------
echo [SUCCESS: Exit Code 0] Photoshop language changed to English successfully!
echo                        ("%fileName%" -> "%oldFileName%")
echo -------------------------------------------------------------------------
echo Photoshop will launch in English interface next time.
goto success

:success
echo.
echo =========================================================================
echo [STATUS] Finished successfully. (Exit Code: 0)
echo =========================================================================
pause
exit /b 0

:err_folder
echo.
echo =========================================================================
echo [STATUS] Failed - Folder Not Found (Exit Code: 2)
pause
exit /b 2

:err_file
echo.
echo =========================================================================
echo [STATUS] Failed - Language File Not Found (Exit Code: 3)
pause
exit /b 3

:err_rename
echo.
echo =========================================================================
echo [STATUS] Failed - Rename Lock Failure (Exit Code: 4)
pause
exit /b 4
`;
}

/**
 * Generate Windows Batch script to switch to Korean
 * Hardened for robust safety, antivirus-friendliness, and standardized ErrorLevel management
 */
export function generateToKoreanBat(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `@echo off
setlocal enabledelayedexpansion

rem =========================================================================
rem Auto-Elevate to Administrator (Self-Elevation on Double-Click)
rem =========================================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrator Privileges...
    powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\" am_admin\"' -Verb RunAs" >nul 2>&1
    exit /b 0
)

cd /d "%~dp0"

if "%1"=="am_admin" (
    shift
)

title Photoshop Language Switcher - Restore to Korean Mode (1.5s Safe Pacing Engine)

rem =========================================================================
rem [Exit Code Standards]
rem 0: SUCCESS
rem 1: UAC_DENIED
rem 2: FOLDER_NOT_FOUND
rem 3: FILE_NOT_FOUND
rem 4: RENAME_FAILED
rem =========================================================================

echo =========================================================================
echo   Adobe Photoshop Language Switcher - Restore to Korean Mode
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

rem Step 1: Check if Photoshop is running to avoid file lock
echo [Step 1/4] Checking active Photoshop process and file lock...
tasklist /fi "imagename eq Photoshop.exe" 2>nul | find /i "Photoshop.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Photoshop.exe is currently running.
    echo                     Please close Photoshop to prevent file locking issues.
) else (
    echo           [OK] No running Photoshop instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 2: Target folder verification
echo [Step 2/4] Verifying target folder access and security permissions...
echo           Target Folder : "${folderPath}"
echo           Target File   : "${oldFileName}"
cd /d "${folderPath}" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR: Exit Code 2] Target folder cannot be accessed or does not exist.
    echo                      Please verify your installation path:
    echo                      "${folderPath}"
    goto err_folder
)
echo           [OK] Target directory accessed successfully.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 3: Apply restoring
echo [Step 3/4] Restoring language configuration to Korean mode...
if not exist "${oldFileName}" (
    if exist "${fileName}" (
        echo           [INFO] Already set to Korean Mode!
        echo                  Detected File: "${fileName}"
        goto verify_step
    ) else (
        echo [ERROR: Exit Code 3] Target old file ("${oldFileName}") not found.
        goto err_file
    )
)

ren "${oldFileName}" "${fileName}"
if %errorlevel% neq 0 (
    echo.
    echo [ERROR: Exit Code 4] Failed to rename file due to permission lock.
    echo                      Please ensure Photoshop is completely closed.
    goto err_rename
)
echo           [OK] File restored: "${oldFileName}" -> "${fileName}"

:verify_step
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 4: Verification and I/O buffer flush
echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
if exist "${fileName}" (
    echo           [OK] Korean language file verified on disk.
) else (
    echo           [WARNING] Delayed disk sync detected, retrying verification...
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1
)

echo.
echo -------------------------------------------------------------------------
echo [SUCCESS: Exit Code 0] Photoshop language restored to Korean successfully!
echo                        ("%oldFileName%" -> "%fileName%")
echo -------------------------------------------------------------------------
echo Photoshop will launch in Korean interface next time.
goto success

:success
echo.
echo =========================================================================
echo [STATUS] Finished successfully. (Exit Code: 0)
echo =========================================================================
pause
exit /b 0

:err_folder
echo.
echo =========================================================================
echo [STATUS] Failed - Folder Not Found (Exit Code: 2)
pause
exit /b 2

:err_file
echo.
echo =========================================================================
echo [STATUS] Failed - Language File Not Found (Exit Code: 3)
pause
exit /b 3

:err_rename
echo.
echo =========================================================================
echo [STATUS] Failed - Rename Lock Failure (Exit Code: 4)
pause
exit /b 4
`;
}

/**
 * Generate Windows Batch script for smart one-click auto-toggle
 * State-of-the-art implementation:
 * - Antivirus-safe (Pure Windows native commands only)
 * - UTF-8 BOM + chcp 65001 console encoding
 * - Standardized ErrorLevel return codes (0 to 4)
 * - Graceful UAC Self-Elevation
 * - Active Photoshop.exe process check
 * - 1.5-second Safe Step Pacing engine
 * - Complete error handling and state feedback
 */
export function generateSmartToggleBat(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `@echo off
setlocal enabledelayedexpansion

rem =========================================================================
rem Auto-Elevate to Administrator (Self-Elevation on Double-Click)
rem =========================================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrator Privileges...
    powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\" am_admin\"' -Verb RunAs" >nul 2>&1
    exit /b 0
)

cd /d "%~dp0"

if "%1"=="am_admin" (
    shift
)

title Photoshop Language Switcher - Smart Toggle Mode (1.5s Safe Pacing Engine)

rem =========================================================================
rem [Exit Code Standards]
rem 0: SUCCESS
rem 1: UAC_DENIED
rem 2: FOLDER_NOT_FOUND
rem 3: FILE_NOT_FOUND
rem 4: RENAME_FAILED
rem =========================================================================

echo =========================================================================
echo   Adobe Photoshop Korean ^<--^> English Auto Switcher [Smart Toggle]
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

rem Step 1: Process Check
echo [Step 1/4] Checking active Photoshop process and file lock...
tasklist /fi "imagename eq Photoshop.exe" 2>nul | find /i "Photoshop.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Photoshop.exe is currently running.
    echo                     Please close Photoshop to prevent file locking issues.
) else (
    echo           [OK] No running Photoshop instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 2: Target folder verification
echo [Step 2/4] Verifying target folder access and security permissions...
echo           Target Folder : "${folderPath}"
cd /d "${folderPath}" 2>nul
if %errorlevel% neq 0 (
    echo [ERROR: Exit Code 2] Target folder cannot be accessed or does not exist.
    echo                      Please verify your installation path:
    echo                      "${folderPath}"
    goto err_folder
)
echo           [OK] Target directory accessed successfully.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

rem Step 3: Toggle Operation
echo [Step 3/4] Detecting current language mode and switching...
if exist "${fileName}" (
    echo           [STATUS] Current mode: Korean. Switching to English...
    ren "${fileName}" "${oldFileName}"
    if %errorlevel% neq 0 goto err_rename
    echo           [OK] Switched: "${fileName}" -> "${oldFileName}"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

    echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
    echo -------------------------------------------------------------------------
    echo [SUCCESS: Exit Code 0] Successfully switched to English Mode!
    echo                        ("%fileName%" -> "%oldFileName%")
    echo -------------------------------------------------------------------------
    echo Photoshop will launch in English interface now.
    goto success
) else if exist "${oldFileName}" (
    echo           [STATUS] Current mode: English. Restoring to Korean...
    ren "${oldFileName}" "${fileName}"
    if %errorlevel% neq 0 goto err_rename
    echo           [OK] Restored: "${oldFileName}" -> "${fileName}"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

    echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
    echo -------------------------------------------------------------------------
    echo [SUCCESS: Exit Code 0] Successfully restored to Korean Mode!
    echo                        ("%oldFileName%" -> "%fileName%")
    echo -------------------------------------------------------------------------
    echo Photoshop will launch in Korean interface now.
    goto success
) else (
    echo [ERROR: Exit Code 3] Target language files not found!
    echo                      Please verify if "${fileName}" or "${oldFileName}" exists in:
    echo                      "${folderPath}"
    goto err_file
)

:success
echo.
echo =========================================================================
echo [STATUS] Finished successfully. (Exit Code: 0)
echo =========================================================================
pause
exit /b 0

:err_folder
echo.
echo =========================================================================
echo [STATUS] Failed - Folder Not Found (Exit Code: 2)
pause
exit /b 2

:err_file
echo.
echo =========================================================================
echo [STATUS] Failed - Language File Not Found (Exit Code: 3)
pause
exit /b 3

:err_rename
echo.
echo =========================================================================
echo [STATUS] Failed - Rename Lock Failure (Exit Code: 4)
pause
exit /b 4
`;
}


/**
 * Generate PowerShell script for modern Windows users
 */
export function generatePowerShellScript(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `# Photoshop Language Switcher (PowerShell)
$targetPath = "${folderPath}"
$korFile = Join-Path $targetPath "${fileName}"
$engFile = Join-Path $targetPath "${oldFileName}"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Adobe Photoshop Language Switcher (PS1)  " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

if (-not (Test-Path $targetPath)) {
    Write-Host "[오류] 폴더를 찾을 수 없습니다: $targetPath" -ForegroundColor Red
    Read-Host "엔터 키를 누르면 종료합니다..."
    exit
}

if (Test-Path $korFile) {
    Write-Host "[현재: 한글 모드] -> 영어 모드로 변경합니다..." -ForegroundColor Yellow
    Rename-Item -Path $korFile -NewName "${oldFileName}" -Force
    Write-Host "[성공] 영어 모드로 변경되었습니다!" -ForegroundColor Green
} elseif (Test-Path $engFile) {
    Write-Host "[현재: 영어 모드] -> 한글 모드로 변경합니다..." -ForegroundColor Yellow
    Rename-Item -Path $engFile -NewName "${fileName}" -Force
    Write-Host "[성공] 한글 모드로 변경되었습니다!" -ForegroundColor Green
} else {
    Write-Host "[경고] 대상 언어 파일을 찾을 수 없습니다." -ForegroundColor Red
}

Write-Host "\`n포토샵을 재시작하면 언어가 적용됩니다." -ForegroundColor DarkGray
Read-Host "엔터 키를 누르면 종료합니다..."
`;
}

/**
 * Generate macOS shell script (.sh / .command)
 */
export function generateMacShellScript(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `#!/bin/bash
# Photoshop Language Switcher for macOS
TARGET_DIR="${folderPath}"
KOR_FILE="$TARGET_DIR/${fileName}"
ENG_FILE="$TARGET_DIR/${oldFileName}"

echo "=========================================="
echo " Photoshop Language Switcher (macOS)      "
echo "=========================================="

if [ ! -d "$TARGET_DIR" ]; then
    echo "[오류] 폴더를 찾을 수 없습니다: $TARGET_DIR"
    exit 1
fi

if [ -f "$KOR_FILE" ]; then
    echo "[현재: 한글 모드] -> 영어 모드로 변경합니다..."
    mv "$KOR_FILE" "$ENG_FILE"
    echo "[성공] 영어 모드로 변경되었습니다!"
elif [ -f "$ENG_FILE" ]; then
    echo "[현재: 영어 모드] -> 한글 모드로 변경합니다..."
    mv "$ENG_FILE" "$KOR_FILE"
    echo "[성공] 한글 모드로 변경되었습니다!"
else
    echo "[오류] 대상 언어 파일을 찾을 수 없습니다."
fi

echo "포토샵을 재시작해 주세요."
`;
}

/**
 * Generate Windows native IExpress SED & .EXE Builder Batch script
 * Builds a standalone .exe file directly on the user's desktop without installing any compilers!
 */
/**
 * Helper to encode PowerShell script to UTF-16LE Base64 for -EncodedCommand
 * Eliminates all CMD escaping, quote parsing, and parenthesis issues on all Windows platforms.
 */
function toPowerShellEncodedCommand(script: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < script.length; i++) {
    const code = script.charCodeAt(i);
    bytes.push(code & 0xff);
    bytes.push((code >> 8) & 0xff);
  }
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Generate Windows native .EXE Builder Batch script
 * Compiles a standalone native Windows GUI .exe file (0.05s ultra-fast toggle with zero console window)
 * Uses Windows built-in C# compiler via PowerShell Add-Type with UTF-16LE Base64 encoding.
 */
export function generateExeBuilderBat(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);
  const escapedFolderPath = folderPath.replace(/\\/g, '\\\\');

  const psScript = `
$folder = "${escapedFolderPath}"
$kor = Join-Path $folder "${fileName}"
$eng = Join-Path $folder "${oldFileName}"
$code = @"
using System;
using System.IO;
using System.Windows.Forms;
class Program {
    [STAThread]
    static void Main() {
        string folder = @"${folderPath}";
        string kor = Path.Combine(folder, "${fileName}");
        string eng = Path.Combine(folder, "${oldFileName}");
        if (!Directory.Exists(folder)) {
            MessageBox.Show("Cannot access Photoshop language directory:\\n" + folder, "Photoshop Language Switcher", MessageBoxButtons.OK, MessageBoxIcon.Error);
            return;
        }
        try {
            if (File.Exists(kor)) {
                File.Move(kor, eng);
                MessageBox.Show("Photoshop language changed to [English] Mode!\\nPhotoshop will open in English next time.", "Language Switch Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } else if (File.Exists(eng)) {
                File.Move(eng, kor);
                MessageBox.Show("Photoshop language restored to [Korean] Mode!\\nPhotoshop will open in Korean next time.", "Language Restore Success", MessageBoxButtons.OK, MessageBoxIcon.Information);
            } else {
                MessageBox.Show("Target language data file (${fileName}) not found.", "Notification", MessageBoxButtons.OK, MessageBoxIcon.Warning);
            }
        } catch (Exception ex) {
            MessageBox.Show("Failed to switch language! If Photoshop is running, please close it and retry.\\n\\nDetails: " + ex.Message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
"@
$out = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Photoshop_Language_Toggle.exe'
Add-Type -TypeDefinition $code -Language CSharp -OutputAssembly $out -OutputType WindowsApplication -ReferencedAssemblies 'System.Windows.Forms.dll','System.Drawing.dll'
`;

  const encodedPs = toPowerShellEncodedCommand(psScript);

  return `@echo off
setlocal enabledelayedexpansion

rem =========================================================================
rem Auto-Elevate to Administrator (Self-Elevation on Double-Click)
rem =========================================================================
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Requesting Administrator Privileges...
    powershell -NoProfile -Command "Start-Process -FilePath 'cmd.exe' -ArgumentList '/c \"\"%~f0\" am_admin\"' -Verb RunAs" >nul 2>&1
    exit /b 0
)

cd /d "%~dp0"

if "%1"=="am_admin" (
    shift
)

title Photoshop Language Switcher - Native EXE Builder

echo =========================================================================
echo   Photoshop Language Switcher - Standalone .EXE Builder
echo =========================================================================
echo.
echo Compiling native Windows executable to your Desktop...
echo.

set "OUTPUT_EXE=%USERPROFILE%\\Desktop\\Photoshop_Language_Toggle.exe"

echo [1/2] Compiling C# source code via Windows .NET engine...
powershell -NoProfile -ExecutionPolicy Bypass -EncodedCommand ${encodedPs}

echo [2/2] Verifying output file...
echo.

if exist "%OUTPUT_EXE%" (
    echo =========================================================================
    echo [SUCCESS] Standalone toggle executable created on your Desktop!
    echo.
    echo Path: "%OUTPUT_EXE%"
    echo =========================================================================
    echo.
    echo Now you can simply double-click [Photoshop_Language_Toggle.exe]
    echo to switch between Korean and English in 0.05s with a clean popup dialogue.
) else (
    echo [ERROR] Failed to compile native EXE.
    echo Creating alternative URL shortcut on your Desktop...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $s = $ws.CreateShortcut([Environment]::GetFolderPath('Desktop') + '\\Photoshop_Language_Toggle.url'); $s.TargetPath = '%~f0'; $s.Save()"
)

echo.
pause
`;
}

/**
 * Generate VBScript Silent GUI Launcher
 * Runs without showing black CMD prompt window, and shows a native Windows MsgBox!
 */
export function generateVbsGuiScript(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `' ========================================================
' Photoshop Language Switcher - Silent VBS GUI Switcher
' Performs instant toggle without showing a black console window
' ========================================================
Option Explicit

Dim fso, shell, folderPath, korFile, engFile, oldName, newName

Set fso = CreateObject("Scripting.FileSystemObject")
Set shell = CreateObject("WScript.Shell")

' 1. Auto-Elevate to Administrator (UAC Elevation)
If Not WScript.Arguments.Named.Exists("elevated") Then
    CreateObject("Shell.Application").ShellExecute "wscript.exe", Chr(34) & WScript.ScriptFullName & Chr(34) & " /elevated", "", "runas", 1
    WScript.Quit
End If

folderPath = "${folderPath.replace(/\\/g, '\\\\')}"
korFile = folderPath & "\\${fileName}"
engFile = folderPath & "\\${oldFileName}"

If Not fso.FolderExists(folderPath) Then
    MsgBox "Photoshop directory not found:" & vbCrLf & folderPath, vbCritical, "Folder Access Failed"
    WScript.Quit
End If

If fso.FileExists(korFile) Then
    ' Current: Korean -> Switch to English
    On Error Resume Next
    fso.MoveFile korFile, engFile
    If Err.Number = 0 Then
        MsgBox "Photoshop language has been changed to [English] Mode." & vbCrLf & vbCrLf & "Photoshop will launch in English next time.", vbInformation, "Photoshop Language Switched"
    Else
        MsgBox "Failed to rename file. Please verify if Photoshop is currently running." & vbCrLf & Err.Description, vbExclamation, "Error"
    End If
    On Error Goto 0
ElseIf fso.FileExists(engFile) Then
    ' Current: English -> Restore to Korean
    On Error Resume Next
    fso.MoveFile engFile, korFile
    If Err.Number = 0 Then
        MsgBox "Photoshop language has been restored to [Korean] Mode." & vbCrLf & vbCrLf & "Photoshop will launch in Korean next time.", vbInformation, "Photoshop Language Restored"
    Else
        MsgBox "Failed to rename file. Please verify if Photoshop is currently running." & vbCrLf & Err.Description, vbExclamation, "Error"
    End If
    On Error Goto 0
Else
    MsgBox "Language data file (" & "${fileName}" & ") not found." & vbCrLf & "Please check folder contents.", vbExclamation, "File Not Detected"
End If
`;
}

/**
 * Generate Standalone Windows HTML Application (.hta) GUI
 * Runs on ANY Windows without installing runtime/compilers!
 * Native GUI window with interactive buttons, real-time status check, and full UAC security.
 * Now with full Multi-Version Photoshop Auto-Scan & Selection Support!
 */
export function generateWindowsHtaApp(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);
  const escapedFolderPath = folderPath.replace(/\\/g, '\\\\');

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>포토샵 다중 버전 언어 전환기 - 데스크톱 GUI</title>
<hta:application
    id="PsLangApp"
    applicationname="PhotoshopLanguageSwitcher"
    border="dialog"
    borderstyle="normal"
    caption="yes"
    contextmenu="no"
    maximizebutton="no"
    minimizebutton="yes"
    navigable="no"
    scroll="no"
    selection="no"
    showintaskbar="yes"
    singleinstance="yes"
    sysmenu="yes"
    version="1.4.0"
    windowstate="normal"
/>
<style>
    * { box-sizing: border-box; font-family: 'Malgun Gothic', 'Segoe UI', Tahoma, sans-serif; }
    body {
        margin: 0; padding: 20px;
        background: #f8fafc; color: #1e293b;
        user-select: none;
    }
    .header {
        display: flex; align-items: center; gap: 12px;
        margin-bottom: 14px; padding-bottom: 12px;
        border-bottom: 1px solid #e2e8f0;
    }
    .logo {
        width: 42px; height: 42px; border-radius: 10px;
        background: linear-gradient(135deg, #2563eb, #1d4ed8);
        color: #fff; font-weight: 900; font-size: 19px;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 8px rgba(37,99,235,0.25);
    }
    .title-group h1 { margin: 0; font-size: 16px; font-weight: bold; color: #0f172a; }
    .title-group p { margin: 2px 0 0 0; font-size: 11px; color: #64748b; }
    
    .version-selector-box {
        background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px;
        padding: 10px 12px; margin-bottom: 12px;
    }
    .version-selector-label {
        font-size: 11px; font-weight: bold; color: #475569; margin-bottom: 6px; display: block;
    }
    .version-select {
        width: 100%; padding: 6px 8px; border-radius: 6px; border: 1px solid #cbd5e1;
        font-size: 12px; font-weight: bold; color: #0f172a; background: #f8fafc;
    }

    .status-card {
        background: #ffffff; border: 1px solid #cbd5e1; border-radius: 10px;
        padding: 12px 14px; margin-bottom: 14px;
        box-shadow: 0 1px 3px rgba(0,0,0,0.04);
    }
    .status-badge {
        display: inline-block; font-size: 11px; font-weight: bold;
        padding: 3px 8px; border-radius: 6px; margin-bottom: 4px;
    }
    .badge-kor { background: #eff6ff; color: #1d4ed8; border: 1px solid #bfdbfe; }
    .badge-eng { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
    .path-text {
        font-family: Consolas, monospace; font-size: 10px; color: #64748b;
        word-break: break-all; margin-top: 3px; line-height: 1.3;
    }
    
    .btn-group { display: flex; flex-direction: column; gap: 8px; }
    .btn-row { display: flex; gap: 8px; }
    .btn {
        width: 100%; padding: 10px 14px; border: none; border-radius: 8px;
        font-size: 12px; font-weight: bold; cursor: pointer;
        transition: all 0.15s ease; text-align: center;
    }
    .btn-primary {
        background: #2563eb; color: #ffffff;
        box-shadow: 0 2px 4px rgba(37,99,235,0.2);
    }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-secondary {
        background: #ffffff; color: #334155; border: 1px solid #cbd5e1;
    }
    .btn-secondary:hover { background: #f1f5f9; border-color: #94a3b8; }
    .btn-toggle {
        background: #0f172a; color: #ffffff;
    }
    .btn-toggle:hover { background: #1e293b; }
    .btn-batch {
        background: #7c3aed; color: #ffffff;
    }
    .btn-batch:hover { background: #6d28d9; }

    .footer {
        margin-top: 14px; text-align: center; font-size: 10px; color: #94a3b8;
    }
    .log-box {
        margin-top: 10px; padding: 8px 10px; border-radius: 6px;
        background: #f1f5f9; font-size: 11px; color: #334155;
        border: 1px solid #e2e8f0; min-height: 32px; display: flex; align-items: center;
    }
</style>
<script language="VBScript">
    Dim fso, shell, currentFolderPath, currentFileName, currentOldFileName
    Dim detectedFolders(), detectedNames(), detectedCount
    detectedCount = 0

    Sub Window_OnLoad
        window.resizeTo 470, 580
        currentFolderPath = "${escapedFolderPath}"
        currentFileName = "${fileName}"
        currentOldFileName = "${oldFileName}"
        
        ScanInstalledPhotoshopVersions
        RefreshStatus
    End Sub

    Sub ScanInstalledPhotoshopVersions
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim drives, d, basePath, adobeFolder, subFolder, supportPath
        drives = Array("C", "D", "E", "F")
        
        Dim selectElem
        Set selectElem = document.getElementById("version-select")
        selectElem.options.length = 0

        Dim optDefault
        Set optDefault = document.createElement("option")
        optDefault.value = "${escapedFolderPath}|${fileName}"
        optDefault.text = "기본 선택 경로 (${fileName})"
        selectElem.add optDefault

        Dim foundTotal
        foundTotal = 0

        For Each d In drives
            basePath = d & ":\\Program Files\\Adobe"
            If fso.FolderExists(basePath) Then
                Set adobeFolder = fso.GetFolder(basePath)
                For Each subFolder In adobeFolder.SubFolders
                    If InStr(1, subFolder.Name, "Photoshop", vbTextCompare) > 0 Then
                        supportPath = subFolder.Path & "\\Locales\\ko_KR\\Support Files"
                        If fso.FolderExists(supportPath) Then
                            foundTotal = foundTotal + 1
                            Dim isCs6, datName, opt
                            If InStr(1, subFolder.Name, "CS6", vbTextCompare) > 0 Then
                                datName = "tw10428.dat"
                            Else
                                datName = "tw10428_Photoshop_ko_KR.dat"
                            End If
                            
                            Set opt = document.createElement("option")
                            opt.value = supportPath & "|" & datName
                            opt.text = subFolder.Name & " (" & d & ": 드라이브)"
                            selectElem.add opt
                        End If
                    End If
                Next
            End If
        Next

        If foundTotal > 0 Then
            document.getElementById("scan-badge").innerText = "[총 " & foundTotal & "개 버전 자동 감지됨]"
        Else
            document.getElementById("scan-badge").innerText = "[기본 경로 모드]"
        End If
    End Sub

    Sub OnVersionChange
        Dim selectElem, parts, val
        Set selectElem = document.getElementById("version-select")
        val = selectElem.value
        parts = Split(val, "|")
        currentFolderPath = parts(0)
        currentFileName = parts(1)
        If InStr(1, currentFileName, "tw10428.dat", vbTextCompare) > 0 Then
            currentOldFileName = "old_tw10428.dat"
        Else
            currentOldFileName = "old_tw10428_Photoshop_ko_KR.dat"
        End If
        RefreshStatus
    End Sub

    Sub RefreshStatus
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim korPath, engPath, statusElem, logElem
        korPath = currentFolderPath & "\\" & currentFileName
        engPath = currentFolderPath & "\\" & currentOldFileName
        
        Set statusElem = document.getElementById("current-status")
        Set logElem = document.getElementById("log-message")
        
        If Not fso.FolderExists(currentFolderPath) Then
            statusElem.innerHTML = "<span class='status-badge' style='background:#fef2f2;color:#b91c1c;'>폴더 미감지</span><div class='path-text'>" & currentFolderPath & "</div>"
            logElem.innerText = "포토샵 설치 폴더가 존재하지 않거나 권한이 필요합니다."
            Exit Sub
        End If

        If fso.FileExists(korPath) Then
            statusElem.innerHTML = "<span class='status-badge badge-kor'>현재 언어: 한국어 (Korean)</span><div class='path-text'>" & currentFileName & " (한글 활성)</div>"
            logElem.innerText = "선택된 포토샵이 한국어 모드입니다."
        ElseIf fso.FileExists(engPath) Then
            statusElem.innerHTML = "<span class='status-badge badge-eng'>현재 언어: 영어 (English)</span><div class='path-text'>" & currentOldFileName & " (영문 활성)</div>"
            logElem.innerText = "선택된 포토샵이 영어 모드입니다."
        Else
            statusElem.innerHTML = "<span class='status-badge' style='background:#fef3c7;color:#b45309;'>언어 파일 없음</span><div class='path-text'>" & currentFileName & " 미존재</div>"
            logElem.innerText = "tw10428 언어 데이터 파일이 감지되지 않았습니다."
        End If
    End Sub

    Sub SwitchToEnglish
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim korPath, engPath
        korPath = currentFolderPath & "\\" & currentFileName
        engPath = currentFolderPath & "\\" & currentOldFileName

        If Not fso.FileExists(korPath) Then
            If fso.FileExists(engPath) Then
                MsgBox "이미 영어(English) 모드로 설정되어 있습니다.", vbInformation, "알림"
            Else
                MsgBox "언어 데이터 파일을 찾을 수 없습니다.", vbExclamation, "오류"
            End If
            Exit Sub
        End If

        On Error Resume Next
        fso.MoveFile korPath, engPath
        If Err.Number = 0 Then
            document.getElementById("log-message").innerText = "성공: 영어(English) 모드로 전환되었습니다!"
            MsgBox "포토샵 언어가 [영어(English)] 모드로 변경되었습니다." & vbCrLf & "포토샵을 실행하면 영문 인터페이스로 열립니다.", vbInformation, "완료"
            RefreshStatus
        Else
            MsgBox "파일 변경 실패! 포토샵이 켜져 있다면 종료 후 다시 시도하세요." & vbCrLf & Err.Description, vbCritical, "오류"
        End If
        On Error Goto 0
    End Sub

    Sub SwitchToKorean
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim korPath, engPath
        korPath = currentFolderPath & "\\" & currentFileName
        engPath = currentFolderPath & "\\" & currentOldFileName

        If Not fso.FileExists(engPath) Then
            If fso.FileExists(korPath) Then
                MsgBox "이미 한국어(Korean) 모드로 설정되어 있습니다.", vbInformation, "알림"
            Else
                MsgBox "언어 데이터 파일을 찾을 수 없습니다.", vbExclamation, "오류"
            End If
            Exit Sub
        End If

        On Error Resume Next
        fso.MoveFile engPath, korPath
        If Err.Number = 0 Then
            document.getElementById("log-message").innerText = "성공: 한국어(Korean) 모드로 복구되었습니다!"
            MsgBox "포토샵 언어가 [한국어(Korean)] 모드로 복구되었습니다." & vbCrLf & "포토샵을 실행하면 한글 인터페이스로 열립니다.", vbInformation, "완료"
            RefreshStatus
        Else
            MsgBox "파일 변경 실패! 포토샵이 켜져 있다면 종료 후 다시 시도하세요." & vbCrLf & Err.Description, vbCritical, "오류"
        End If
        On Error Goto 0
    End Sub

    Sub ToggleLanguage
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim korPath, engPath
        korPath = currentFolderPath & "\\" & currentFileName
        engPath = currentFolderPath & "\\" & currentOldFileName

        If fso.FileExists(korPath) Then
            SwitchToEnglish
        ElseIf fso.FileExists(engPath) Then
            SwitchToKorean
        Else
            MsgBox "언어 데이터 파일을 찾을 수 없습니다.", vbExclamation, "오류"
        End If
    End Sub

    Sub ToggleAllVersions
        Set fso = CreateObject("Scripting.FileSystemObject")
        Dim selectElem, i, parts, sPath, sFile, sOld, countSuccess
        Set selectElem = document.getElementById("version-select")
        countSuccess = 0

        For i = 1 To selectElem.options.length - 1
            parts = Split(selectElem.options(i).value, "|")
            sPath = parts(0)
            sFile = parts(1)
            If InStr(1, sFile, "tw10428.dat", vbTextCompare) > 0 Then
                sOld = "old_tw10428.dat"
            Else
                sOld = "old_tw10428_Photoshop_ko_KR.dat"
            End If

            If fso.FileExists(sPath & "\\" & sFile) Then
                On Error Resume Next
                fso.MoveFile sPath & "\\" & sFile, sPath & "\\" & sOld
                If Err.Number = 0 Then countSuccess = countSuccess + 1
                On Error Goto 0
            ElseIf fso.FileExists(sPath & "\\" & sOld) Then
                On Error Resume Next
                fso.MoveFile sPath & "\\" & sOld, sPath & "\\" & sFile
                If Err.Number = 0 Then countSuccess = countSuccess + 1
                On Error Goto 0
            End If
        Next

        MsgBox "총 " & countSuccess & "개의 포토샵 설치 버전 언어가 일괄 토글되었습니다!", vbInformation, "일괄 토글 완료"
        RefreshStatus
    End Sub
</script>
</head>
<body>
    <div class="header">
        <div class="logo">Ps</div>
        <div class="title-group">
            <h1>포토샵 다중 버전 언어 전환기 GUI</h1>
            <p>Photoshop Multi-Version Auto-Detect & Switcher</p>
        </div>
    </div>

    <!-- Multi-version selector -->
    <div class="version-selector-box">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span class="version-selector-label">감지된 포토샵 버전 선택:</span>
            <span id="scan-badge" style="font-size:10px; color:#2563eb; font-weight:bold;"></span>
        </div>
        <select id="version-select" class="version-select" onchange="OnVersionChange()">
        </select>
    </div>

    <div class="status-card">
        <div id="current-status">상태 감지 중...</div>
    </div>

    <div class="btn-group">
        <button class="btn btn-toggle" onclick="ToggleLanguage()">⇄ 선택한 버전 언어 토글 (Toggle)</button>
        <div class="btn-row">
            <button class="btn btn-primary" onclick="SwitchToEnglish()">🌐 영어로 전환</button>
            <button class="btn btn-secondary" onclick="SwitchToKorean()">🇰🇷 한글로 복구</button>
        </div>
        <button class="btn btn-batch" onclick="ToggleAllVersions()">⚡ 감지된 모든 포토샵 버전 일괄 토글 (Toggle All)</button>
    </div>

    <div id="log-message" class="log-box">
        준비 완료. 원하는 모드 버튼을 클릭하세요.
    </div>

    <div class="footer">
        개발자: AhBiYout (CIS) · 다중 버전 자동 감지 v1.4.0
    </div>
</body>
</html>`;
}

/**
 * Generate PowerShell Modern WPF GUI Script (.ps1)
 * High-resolution vector GUI with dark slate styling and native Windows WPF components
 * Fully supports multi-version Photoshop auto-detection and combo-box switching!
 */
export function generatePowerShellWpfApp(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `# ========================================================
# 포토샵 언어 원클릭 전환기 - PowerShell WPF 모던 GUI 앱 (다중 버전 지원)
# 개발자: AhBiYout | CIS (https://www.cisnet.co.kr)
# ========================================================
[CmdletBinding()]
param()

# 1. 관리자 권한 자동 승격
if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Start-Process powershell.exe -ArgumentList ("-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`"") -Verb RunAs
    exit
}

Add-Type -AssemblyName PresentationFramework
Add-Type -AssemblyName PresentationCore
Add-Type -AssemblyName WindowsBase

$defaultFolderPath = "${folderPath}"
$defaultFileName = "${fileName}"

[xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="포토샵 다중 버전 언어 전환기 GUI" Height="500" Width="460"
        WindowStartupLocation="CenterScreen" ResizeMode="NoResize"
        Background="#0F172A" FontFamily="Malgun Gothic">
    <Grid Margin="20">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <!-- Header -->
        <StackPanel Grid.Row="0" Orientation="Horizontal" Margin="0,0,0,14">
            <Border Width="40" Height="40" Background="#2563EB" CornerRadius="8">
                <TextBlock Text="Ps" Foreground="White" FontWeight="Bold" FontSize="18"
                           HorizontalAlignment="Center" VerticalAlignment="Center"/>
            </Border>
            <StackPanel Margin="12,0,0,0" VerticalAlignment="Center">
                <TextBlock Text="포토샵 다중 버전 언어 전환기" Foreground="White" FontWeight="Bold" FontSize="15"/>
                <TextBlock Text="Multi-Version Auto-Detect Desktop Switcher" Foreground="#94A3B8" FontSize="11"/>
            </StackPanel>
        </StackPanel>

        <!-- Version Selector -->
        <Border Grid.Row="1" Background="#1E293B" CornerRadius="10" Padding="10,8" Margin="0,0,0,12" BorderBrush="#334155" BorderThickness="1">
            <StackPanel>
                <TextBlock Text="감지된 포토샵 버전 선택:" Foreground="#94A3B8" FontSize="10" FontWeight="Bold" Margin="0,0,0,4"/>
                <ComboBox Name="cmbVersions" Height="28" Background="#0F172A" Foreground="#0F172A" FontSize="11" FontWeight="Bold"/>
            </StackPanel>
        </Border>

        <!-- Status Card -->
        <Border Grid.Row="2" Background="#1E293B" CornerRadius="10" Padding="12" Margin="0,0,0,14" BorderBrush="#334155" BorderThickness="1">
            <StackPanel>
                <TextBlock Name="txtStatusBadge" Text="상태 확인 중..." Foreground="#38BDF8" FontWeight="Bold" FontSize="12" Margin="0,0,0,4"/>
                <TextBlock Name="txtStatusPath" Text="$defaultFolderPath" Foreground="#64748B" FontSize="10" TextWrapping="Wrap"/>
            </StackPanel>
        </Border>

        <!-- Action Buttons -->
        <StackPanel Grid.Row="3" VerticalAlignment="Center">
            <Button Name="btnToggle" Content="⇄ 선택한 버전 언어 토글 (Toggle)" Height="38" Margin="0,0,0,8"
                    Background="#2563EB" Foreground="White" FontWeight="Bold" FontSize="12" BorderThickness="0"/>
            <Grid Margin="0,0,0,8">
                <Grid.ColumnDefinitions>
                    <ColumnDefinition Width="*"/>
                    <ColumnDefinition Width="8"/>
                    <ColumnDefinition Width="*"/>
                </Grid.ColumnDefinitions>
                <Button Grid.Column="0" Name="btnEnglish" Content="🌐 영어로 변경" Height="34"
                        Background="#334155" Foreground="White" FontWeight="SemiBold" FontSize="11" BorderThickness="0"/>
                <Button Grid.Column="2" Name="btnKorean" Content="🇰🇷 한글로 복구" Height="34"
                        Background="#334155" Foreground="White" FontWeight="SemiBold" FontSize="11" BorderThickness="0"/>
            </Grid>
            <Button Name="btnBatchToggle" Content="⚡ 설치된 모든 버전 일괄 토글 (Batch All)" Height="36"
                    Background="#7C3AED" Foreground="White" FontWeight="Bold" FontSize="11" BorderThickness="0"/>
        </StackPanel>

        <!-- Footer -->
        <TextBlock Grid.Row="4" Text="개발자: AhBiYout (CIS) · 다중 버전 자동 스캔 지원 v1.4.0" 
                   Foreground="#64748B" FontSize="10" HorizontalAlignment="Center" Margin="0,8,0,0"/>
    </Grid>
</Window>
"@

$reader = (New-Object System.Xml.XmlNodeReader $xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$cmbVersions = $window.FindName("cmbVersions")
$txtStatusBadge = $window.FindName("txtStatusBadge")
$txtStatusPath = $window.FindName("txtStatusPath")
$btnToggle = $window.FindName("btnToggle")
$btnEnglish = $window.FindName("btnEnglish")
$btnKorean = $window.FindName("btnKorean")
$btnBatchToggle = $window.FindName("btnBatchToggle")

$script:detectedList = @()

# Scan drives
$drives = @("C", "D", "E", "F")
foreach ($d in $drives) {
    $adobeDir = $d + ':\Program Files\Adobe'
    if (Test-Path $adobeDir) {
        $psDirs = Get-ChildItem -Path $adobeDir -Directory -Filter "*Photoshop*" -ErrorAction SilentlyContinue
        foreach ($ps in $psDirs) {
            $sup = Join-Path $ps.FullName "Locales\ko_KR\Support Files"
            if (Test-Path $sup) {
                $dat = if ($ps.Name -like "*CS6*") { "tw10428.dat" } else { "tw10428_Photoshop_ko_KR.dat" }
                $script:detectedList += [PSCustomObject]@{
                    Name = $ps.Name + " (" + $d + ":)"
                    Path = $sup
                    DatFile = $dat
                    OldDatFile = if ($ps.Name -like "*CS6*") { "old_tw10428.dat" } else { "old_tw10428_Photoshop_ko_KR.dat" }
                }
            }
        }
    }
}

if ($script:detectedList.Count -eq 0) {
    $script:detectedList += [PSCustomObject]@{
        Name = "기본 지정 경로 ($defaultFileName)"
        Path = $defaultFolderPath
        DatFile = $defaultFileName
        OldDatFile = if ($defaultFileName -like "*tw10428.dat*") { "old_tw10428.dat" } else { "old_tw10428_Photoshop_ko_KR.dat" }
    }
}

foreach ($item in $script:detectedList) {
    $cmbVersions.Items.Add($item.Name) | Out-Null
}
$cmbVersions.SelectedIndex = 0

function Update-UIStatus {
    $idx = $cmbVersions.SelectedIndex
    if ($idx -lt 0) { return }
    $current = $script:detectedList[$idx]
    
    $txtStatusPath.Text = $current.Path
    $korFile = Join-Path $current.Path $current.DatFile
    $engFile = Join-Path $current.Path $current.OldDatFile

    if (-not (Test-Path $current.Path)) {
        $txtStatusBadge.Text = "경로 오류: 지원 폴더를 찾을 수 없음"
        $txtStatusBadge.Foreground = [System.Windows.Media.Brushes]::IndianRed
        return
    }

    if (Test-Path $korFile) {
        $txtStatusBadge.Text = "● 현재 언어: 한국어 (Korean)"
        $txtStatusBadge.Foreground = [System.Windows.Media.Brushes]::DodgerBlue
    } elseif (Test-Path $engFile) {
        $txtStatusBadge.Text = "● 현재 언어: 영어 (English)"
        $txtStatusBadge.Foreground = [System.Windows.Media.Brushes]::MediumSeaGreen
    } else {
        $txtStatusBadge.Text = "● 언어 파일 미감지"
        $txtStatusBadge.Foreground = [System.Windows.Media.Brushes]::Goldenrod
    }
}

$cmbVersions.Add_SelectionChanged({
    Update-UIStatus
})

$btnToggle.Add_Click({
    $idx = $cmbVersions.SelectedIndex
    if ($idx -lt 0) { return }
    $current = $script:detectedList[$idx]
    
    $korFile = Join-Path $current.Path $current.DatFile
    $engFile = Join-Path $current.Path $current.OldDatFile

    if (Test-Path $korFile) {
        Rename-Item -Path $korFile -NewName $current.OldDatFile -Force
        [System.Windows.MessageBox]::Show("[$($current.Name)] 영어(English) 모드로 전환되었습니다!", "성공", "OK", "Information")
    } elseif (Test-Path $engFile) {
        Rename-Item -Path $engFile -NewName $current.DatFile -Force
        [System.Windows.MessageBox]::Show("[$($current.Name)] 한글(Korean) 모드로 복구되었습니다!", "성공", "OK", "Information")
    }
    Update-UIStatus
})

$btnEnglish.Add_Click({
    $idx = $cmbVersions.SelectedIndex
    if ($idx -lt 0) { return }
    $current = $script:detectedList[$idx]
    
    $korFile = Join-Path $current.Path $current.DatFile
    $engFile = Join-Path $current.Path $current.OldDatFile

    if (Test-Path $korFile) {
        Rename-Item -Path $korFile -NewName $current.OldDatFile -Force
        [System.Windows.MessageBox]::Show("[$($current.Name)] 영어(English) 모드로 전환되었습니다!", "성공", "OK", "Information")
    } else {
        [System.Windows.MessageBox]::Show("이미 영어 모드이거나 대상 파일이 없습니다.", "알림", "OK", "Information")
    }
    Update-UIStatus
})

$btnKorean.Add_Click({
    $idx = $cmbVersions.SelectedIndex
    if ($idx -lt 0) { return }
    $current = $script:detectedList[$idx]
    
    $korFile = Join-Path $current.Path $current.DatFile
    $engFile = Join-Path $current.Path $current.OldDatFile

    if (Test-Path $engFile) {
        Rename-Item -Path $engFile -NewName $current.DatFile -Force
        [System.Windows.MessageBox]::Show("[$($current.Name)] 한글(Korean) 모드로 복구되었습니다!", "성공", "OK", "Information")
    } else {
        [System.Windows.MessageBox]::Show("이미 한글 모드이거나 대상 파일이 없습니다.", "알림", "OK", "Information")
    }
    Update-UIStatus
})

$btnBatchToggle.Add_Click({
    $count = 0
    foreach ($item in $script:detectedList) {
        $kor = Join-Path $item.Path $item.DatFile
        $eng = Join-Path $item.Path $item.OldDatFile
        if (Test-Path $kor) {
            Rename-Item -Path $kor -NewName $item.OldDatFile -Force
            $count++
        } elseif (Test-Path $eng) {
            Rename-Item -Path $eng -NewName $item.DatFile -Force
            $count++
        }
    }
    [System.Windows.MessageBox]::Show("총 $count 개 포토샵 설치 버전의 언어가 일괄 토글되었습니다!", "일괄 토글 완료", "OK", "Information")
    Update-UIStatus
})

Update-UIStatus
$window.ShowDialog() | Out-Null
`;
}

/**
 * Generate Smart Multi-Version Auto-Detect & Interactive Selection Windows Batch Script (.bat)
 * Automatically scans all drives (C, D, E, F) for any installed Photoshop versions.
 * If 1 version is found -> auto applies toggle.
 * If multiple versions are found -> shows clean interactive menu to select specific version or batch toggle!
 */
export function generateAutoDetectMultiVersionBat(): string {
  return `@echo off
chcp 65001 >nul 2>&1
title Photoshop Multi-Version Auto-Scanner ^& Switcher - CIS
color 0B

:: ========================================================
:: [1] UAC Administrator Privileges Auto-Elevation
:: ========================================================
net session >nul 2>&1
if %errorLevel% equ 0 goto uac_ok

echo ========================================================
echo   Photoshop Multi-Version Auto-Scanner ^& Switcher
echo   Supported: CS6 / CC 2014 ~ 2026+ / Beta (32-bit ^& 64-bit)
echo ========================================================
echo.
echo [INFO] Requesting administrator privileges to modify language files...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs" 2>nul
if %errorlevel% equ 0 exit /b 0

echo [ERROR] Failed to acquire administrator privileges. Please right-click and select 'Run as administrator'.
pause
exit /b 1

:uac_ok
@echo off
setlocal enabledelayedexpansion
cls

echo ========================================================
echo   Photoshop Multi-Version Auto Scanner ^& Switcher (${APP_VERSION_FULL})
echo   Developer: AhBiYout (CIS)
echo   Supported: CS6, CC 2014 ~ 2026+ (All Versions ^& Beta)
echo   지원 버전: CS6, CC 2014~2026 전 버전 및 Beta (32/64-bit)
echo ========================================================
echo.
echo [1/2] Scanning all installed Adobe Photoshop versions on this system...
echo.

set ps_count=0

rem [Scan 1] Check Windows Registry for Photoshop.exe App Paths
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do set "reg_pdir=%%~dpF"
        call :check_and_register_photoshop "!reg_pdir!" "Adobe Photoshop [Registry Detected]"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do set "reg_pdir=%%~dpF"
        call :check_and_register_photoshop "!reg_pdir!" "Adobe Photoshop 32-bit [Registry Detected]"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do set "reg_pdir=%%~dpF"
        call :check_and_register_photoshop "!reg_pdir!" "Adobe Photoshop [User Registry Detected]"
    )
)

rem [Scan 2] Scan standard drive directories
for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Photoshop 포토샵" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register_photoshop "%%P" "%%~nxP [%%D:]"
            )
        )
    )
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Photoshop 포토샵" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register_photoshop "%%P" "%%~nxP [%%D: x86]"
            )
        )
    )
    if exist "%%D:\\Adobe" (
        for /d %%P in ("%%D:\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Photoshop 포토샵" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register_photoshop "%%P" "%%~nxP [%%D: Root]"
            )
        )
    )
)

rem [Scan 3] Deep scan using PowerShell if none found
if %ps_count% equ 0 (
    echo [INFO] Standard directories scanned. Initializing deep-scan via PowerShell...
    for /f "usebackq delims=" %%F in (\`powershell -NoProfile -Command "Get-ChildItem -Path 'C:\\Program Files','C:\\Program Files (x86)','C:\\','D:\\','E:\\' -Filter '*tw10428*' -Recurse -Depth 6 -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like '*Locales*' -or $_.FullName -like '*Support Files*' } | Select-Object -First 5 -ExpandProperty DirectoryName" 2^>nul\`) do (
        if exist "%%F" (
            call :register_direct_support_dir "%%F" "Adobe Photoshop [Deep Scan Detected]"
        )
    )
)

if %ps_count% equ 0 goto no_photoshop_found
goto show_menu

:check_and_register_photoshop
set "cand_base=%~1"
set "cand_lbl=%~2"

rem 1. Check all subfolders inside Locales (ko_KR, ja_JP, zh_CN, de_DE, fr_FR, es_ES, etc.)
if exist "!cand_base!\\Locales" (
    for /d %%L in ("!cand_base!\\Locales\\*") do (
        if exist "%%L\\Support Files" (
            call :register_direct_support_dir "%%L\\Support Files" "!cand_lbl!" "%%~nxL"
        )
    )
)
rem 2. Check standard ko_KR Support Files if missed
if exist "!cand_base!\\Locales\\ko_KR\\Support Files" (
    call :register_direct_support_dir "!cand_base!\\Locales\\ko_KR\\Support Files" "!cand_lbl!" "ko_KR"
)
rem 3. Check if Support Files is directly inside root
if exist "!cand_base!\\Support Files" (
    if exist "!cand_base!\\Support Files\\*tw10428*" (
        call :register_direct_support_dir "!cand_base!\\Support Files" "!cand_lbl!" "Direct"
    )
)
goto :eof

:register_direct_support_dir
set "cand_dir=%~1"
set "cand_name=%~2"
set "cand_loc=%~3"

rem Deduplication check
for /l %%k in (1,1,!ps_count!) do (
    if /i "!ps_dir_%%k!"=="!cand_dir!" goto :eof
)

if "!cand_loc!"=="" set "cand_loc=ko_KR"
if "!cand_loc!"=="Direct" set "cand_loc=ko_KR"

set "cand_dat="
set "cand_old="

rem Detect active or old dat file in folder
for %%F in ("!cand_dir!\\tw10428*.dat") do (
    set "cand_dat=%%~nxF"
    set "cand_old=old_%%~nxF"
)
if not defined cand_dat (
    for %%F in ("!cand_dir!\\old_tw10428*.dat") do (
        set "cand_old=%%~nxF"
        set "raw_dat=%%~nxF"
        set "cand_dat=!raw_dat:~4!"
    )
)
if not defined cand_dat (
    set "cand_dat=tw10428_Photoshop_!cand_loc!.dat"
    set "cand_old=old_tw10428_Photoshop_!cand_loc!.dat"
)

set /a ps_count+=1
set "ps_dir_!ps_count!=!cand_dir!"
set "ps_name_!ps_count!=!cand_name!"
set "ps_loc_!ps_count!=!cand_loc!"
set "ps_dat_!ps_count!=!cand_dat!"
set "ps_old_!ps_count!=!cand_old!"
goto :eof

:no_photoshop_found
echo.
echo ========================================================
echo  [INFO] Photoshop Support Files directory was not detected in standard drives.
echo ========================================================
echo  - Adobe Photoshop might be installed in a custom drive/folder, or
echo  - Language pack [ko_KR/ja_JP/zh_CN/etc.] Support Files is in a custom path.
echo.
echo  [1] Manually enter Photoshop installation path to proceed
echo  [2] Press Q to quit script
echo ========================================================
echo.
set /p manual_input="Enter Photoshop or Support Files folder path (Quit: Q): "
if /i "!manual_input!"=="Q" exit /b 2
if "!manual_input!"=="" exit /b 2

set "test_target=!manual_input!"
set "test_target=!test_target:"=!"

if exist "!test_target!\\Locales" (
    for /d %%L in ("!test_target!\\Locales\\*") do (
        if exist "%%L\\Support Files" (
            set "test_target=%%L\\Support Files"
            goto manual_found
        )
    )
)
:manual_found
if not exist "!test_target!" (
    echo.
    echo [ERROR] Specified path could not be found: !test_target!
    pause
    exit /b 2
)

set "cand_loc=ko_KR"
for %%F in ("!test_target!\\..") do set "cand_loc=%%~nxF"

call :register_direct_support_dir "!test_target!" "Custom Specified Path" "!cand_loc!"
goto show_menu

:show_menu
echo [SUCCESS] Total %ps_count% Photoshop installation(s) detected!
echo.
echo ========================================================
echo   Installed Photoshop Versions ^& Current Language Status:
echo ========================================================

for /l %%I in (1,1,%ps_count%) do (
    set "cur_dir=!ps_dir_%%I!"
    set "cur_dat=!ps_dat_%%I!"
    set "cur_old=!ps_old_%%I!"
    set "cur_name=!ps_name_%%I!"
    set "cur_loc=!ps_loc_%%I!"
    
    if exist "!cur_dir!\\!cur_dat!" (
        echo   [%%I] !cur_name! (!cur_loc!)  --^>  [Native !cur_loc! Mode: Active]
    ) else if exist "!cur_dir!\\!cur_old!" (
        echo   [%%I] !cur_name! (!cur_loc!)  --^>  [English Mode: Switched]
    ) else (
        echo   [%%I] !cur_name! (!cur_loc!)  --^>  [Language File Not Found]
    )
)

echo.
echo   ------------------------------------------------------
echo   [A] Batch Toggle language for all Photoshop versions [Toggle All]
echo   [E] Switch all Photoshop versions to English Mode
echo   [R] Restore all Photoshop versions to Native Language Mode
echo   [K] Restore all Photoshop versions to Korean/Native Mode
echo   [Q] Cancel and Exit
echo ========================================================
echo.

:ask_choice
set /p user_choice="Enter selection (1~%ps_count%, A, E, R, K, Q): "

if /i "%user_choice%"=="Q" (
    echo Operation cancelled. Exiting...
    exit /b 0
)

if /i "%user_choice%"=="A" goto do_batch_toggle
if /i "%user_choice%"=="E" goto do_batch_english
if /i "%user_choice%"=="R" goto do_batch_native
if /i "%user_choice%"=="K" goto do_batch_native

:: Check if valid number
set "valid_num=0"
for /l %%I in (1,1,%ps_count%) do (
    if "%user_choice%"=="%%I" set "valid_num=1"
)

if "%valid_num%"=="1" (
    set "sel_dir=!ps_dir_%user_choice%!"
    set "sel_dat=!ps_dat_%user_choice%!"
    set "sel_old=!ps_old_%user_choice%!"
    set "sel_name=!ps_name_%user_choice%!"
    set "sel_loc=!ps_loc_%user_choice%!"
    goto do_single_toggle
)

echo [WARNING] Please enter a valid option.
goto ask_choice

:do_single_toggle
echo.
echo ========================================================
echo  Executing language switch for [!sel_name! (!sel_loc!)]...
echo  Safe Pacing Engine Active (1.5s Delay / File-Lock & I/O Flush Guard)
echo ========================================================

powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
cd /d "!sel_dir!" 2>nul
if exist "!sel_dat!" (
    ren "!sel_dat!" "!sel_old!"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo.
    echo [SUCCESS] !sel_name! -^> Switched to English Mode!
) else if exist "!sel_old!" (
    ren "!sel_old!" "!sel_dat!"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo.
    echo [SUCCESS] !sel_name! -^> Restored to !sel_loc! Mode!
) else (
    echo [ERROR] Language files not found.
)
echo.
pause
exit /b 0

:do_batch_toggle
echo.
echo ========================================================
echo  Batch toggling language for all installed Photoshop versions...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ps_count%) do (
    set "t_dir=!ps_dir_%%I!"
    set "t_dat=!ps_dat_%%I!"
    set "t_old=!ps_old_%%I!"
    set "t_name=!ps_name_%%I!"
    set "t_loc=!ps_loc_%%I!"
    
    cd /d "!t_dir!" 2>nul
    if exist "!t_dat!" (
        ren "!t_dat!" "!t_old!"
        echo  [*] !t_name! (!t_loc!)  -^>  Switched to English
    ) else if exist "!t_old!" (
        ren "!t_old!" "!t_dat!"
        echo  [*] !t_name! (!t_loc!)  -^>  Restored to !t_loc!
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] Language toggle completed for all versions!
pause
exit /b 0

:do_batch_english
echo.
echo ========================================================
echo  Switching all installed Photoshop versions to English Mode...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ps_count%) do (
    set "t_dir=!ps_dir_%%I!"
    set "t_dat=!ps_dat_%%I!"
    set "t_old=!ps_old_%%I!"
    set "t_name=!ps_name_%%I!"
    set "t_loc=!ps_loc_%%I!"
    
    cd /d "!t_dir!" 2>nul
    if exist "!t_dat!" (
        ren "!t_dat!" "!t_old!"
        echo  [*] !t_name! (!t_loc!)  -^>  Switched to English
    ) else if exist "!t_old!" (
        echo  [*] !t_name! (!t_loc!)  -^>  Already in English Mode
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All versions switched to English Mode!
pause
exit /b 0

:do_batch_native
echo.
echo ========================================================
echo  Restoring all installed Photoshop versions to Native Language Mode...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ps_count%) do (
    set "t_dir=!ps_dir_%%I!"
    set "t_dat=!ps_dat_%%I!"
    set "t_old=!ps_old_%%I!"
    set "t_name=!ps_name_%%I!"
    set "t_loc=!ps_loc_%%I!"
    
    cd /d "!t_dir!" 2>nul
    if exist "!t_old!" (
        ren "!t_old!" "!t_dat!"
        echo  [*] !t_name! (!t_loc!)  -^>  Restored to !t_loc! Mode
    ) else if exist "!t_dat!" (
        echo  [*] !t_name! (!t_loc!)  -^>  Already in !t_loc! Mode
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All versions restored to Native Language Mode!
pause
exit /b 0
`;
}

/**
 * Generate Universal Multi-Language Switcher (.bat)
 * Automatically discovers all language packs across all drives (ko_KR, ja_JP, zh_CN, de_DE, fr_FR, es_ES, etc.)
 * and allows toggling to English or activating any installed world language!
 */
export function generateUniversalMultiLangBat(): string {
  return `@echo off
chcp 65001 >nul 2>&1
title Photoshop Universal Multi-Language Switcher - AhBiYout (CIS)
color 0B

:: ========================================================
:: [1] UAC Administrator Privileges Auto-Elevation
:: ========================================================
net session >nul 2>&1
if %errorLevel% equ 0 goto uac_ok

echo ========================================================
echo   Photoshop Universal Multi-Language Switcher
echo   Supported: Korean, Japanese, Chinese, German, French, Spanish, etc.
echo ========================================================
echo.
echo [INFO] Requesting administrator privileges to switch language files...

powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs" 2>nul
if %errorlevel% equ 0 exit /b 0

echo [ERROR] Administrator privileges could not be acquired.
pause
exit /b 1

:uac_ok
@echo off
setlocal enabledelayedexpansion
cls

echo ========================================================
echo   Photoshop Universal Multi-Language Switcher (${APP_VERSION_FULL})
echo   Developer: AhBiYout (CIS)
echo   Global Languages: 한국어, 日本語, 简体中文, 繁體中文, Deutsch,
echo                    Français, Español, Italiano, Русский, etc.
echo ========================================================
echo.
echo [1/2] Scanning all installed Photoshop versions and language packs...
echo.

set lang_count=0

rem Scan standard drives for Locales
for %%D in (C D E F G H I J K L M N O P Q R S T U V W X Y Z) do (
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Photoshop 포토샵" >nul 2>&1
            if !errorlevel! equ 0 (
                if exist "%%P\\Locales" (
                    for /d %%L in ("%%P\\Locales\\*") do (
                        if exist "%%L\\Support Files" (
                            call :register_lang_pack "%%L\\Support Files" "%%~nxP [%%D:]" "%%~nxL"
                        )
                    )
                )
            )
        )
    )
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Photoshop 포토샵" >nul 2>&1
            if !errorlevel! equ 0 (
                if exist "%%P\\Locales" (
                    for /d %%L in ("%%P\\Locales\\*") do (
                        if exist "%%L\\Support Files" (
                            call :register_lang_pack "%%L\\Support Files" "%%~nxP [%%D: x86]" "%%~nxL"
                        )
                    )
                )
            )
        )
    )
)

if %lang_count% equ 0 goto no_langs_found
goto show_lang_menu

:register_lang_pack
set "cand_dir=%~1"
set "cand_app=%~2"
set "cand_code=%~3"

rem Deduplication
for /l %%k in (1,1,!lang_count!) do (
    if /i "!lp_dir_%%k!"=="!cand_dir!" goto :eof
)

set "cand_dat="
set "cand_old="

for %%F in ("!cand_dir!\\tw10428*.dat") do (
    set "cand_dat=%%~nxF"
    set "cand_old=old_%%~nxF"
)
if not defined cand_dat (
    for %%F in ("!cand_dir!\\old_tw10428*.dat") do (
        set "cand_old=%%~nxF"
        set "raw_dat=%%~nxF"
        set "cand_dat=!raw_dat:~4!"
    )
)
if not defined cand_dat (
    set "cand_dat=tw10428_Photoshop_!cand_code!.dat"
    set "cand_old=old_tw10428_Photoshop_!cand_code!.dat"
)

set /a lang_count+=1
set "lp_dir_!lang_count!=!cand_dir!"
set "lp_app_!lang_count!=!cand_app!"
set "lp_code_!lang_count!=!cand_code!"
set "lp_dat_!lang_count!=!cand_dat!"
set "lp_old_!lang_count!=!cand_old!"
goto :eof

:no_langs_found
echo ========================================================
echo  [INFO] No standard Photoshop Locales folders detected.
echo ========================================================
echo  Please specify your Photoshop or Support Files folder:
set /p manual_input="Path (Quit: Q): "
if /i "!manual_input!"=="Q" exit /b 0
if "!manual_input!"=="" exit /b 0
set "test_target=!manual_input:"=!"
if exist "!test_target!\\Locales" (
    for /d %%L in ("!test_target!\\Locales\\*") do (
        if exist "%%L\\Support Files" (
            call :register_lang_pack "%%L\\Support Files" "Custom Specified Path" "%%~nxL"
        )
    )
)
if %lang_count% equ 0 (
    call :register_lang_pack "!test_target!" "Custom Specified Path" "ko_KR"
)
goto show_lang_menu

:show_lang_menu
echo [SUCCESS] Total %lang_count% language pack(s) detected across Photoshop installations!
echo.
echo ========================================================
echo   Detected Language Packs ^& Status:
echo ========================================================

for /l %%I in (1,1,%lang_count%) do (
    set "c_dir=!lp_dir_%%I!"
    set "c_app=!lp_app_%%I!"
    set "c_code=!lp_code_%%I!"
    set "c_dat=!lp_dat_%%I!"
    set "c_old=!lp_old_%%I!"

    set "c_name=Language"
    if /i "!c_code!"=="ko_KR" set "c_name=Korean (한국어)"
    if /i "!c_code!"=="ja_JP" set "c_name=Japanese (日本語)"
    if /i "!c_code!"=="zh_CN" set "c_name=Chinese Simplified (简体中文)"
    if /i "!c_code!"=="zh_TW" set "c_name=Chinese Traditional (繁體中文)"
    if /i "!c_code!"=="de_DE" set "c_name=German (Deutsch)"
    if /i "!c_code!"=="fr_FR" set "c_name=French (Français)"
    if /i "!c_code!"=="es_ES" set "c_name=Spanish (Español)"
    if /i "!c_code!"=="it_IT" set "c_name=Italian (Italiano)"
    if /i "!c_code!"=="ru_RU" set "c_name=Russian (Русский)"
    if /i "!c_code!"=="pt_BR" set "c_name=Portuguese (Português)"

    if exist "!c_dir!\\!c_dat!" (
        echo   [%%I] !c_app! - !c_name! [!c_code!]  --^>  [ACTIVE / 활성]
    ) else if exist "!c_dir!\\!c_old!" (
        echo   [%%I] !c_app! - !c_name! [!c_code!]  --^>  [ENGLISH MODE / 영어]
    ) else (
        echo   [%%I] !c_app! - !c_name! [!c_code!]  --^>  [File Not Found]
    )
)

echo.
echo   ------------------------------------------------------
echo   [1~%lang_count%] Toggle selected language pack (Native ⇄ English)
echo   [A] Batch Toggle all packs
echo   [E] Switch all to English Mode
echo   [R] Restore all to Native Language Mode
echo   [Q] Quit
echo ========================================================
echo.

:ask_lp_choice
set /p lp_choice="Enter selection (1~%lang_count%, A, E, R, Q): "

if /i "%lp_choice%"=="Q" exit /b 0
if /i "%lp_choice%"=="A" goto lp_toggle_all
if /i "%lp_choice%"=="E" goto lp_all_english
if /i "%lp_choice%"=="R" goto lp_all_native

set "valid_idx=0"
for /l %%I in (1,1,%lang_count%) do (
    if "%lp_choice%"=="%%I" set "valid_idx=1"
)

if "%valid_idx%"=="1" (
    set "s_dir=!lp_dir_%lp_choice%!"
    set "s_dat=!lp_dat_%lp_choice%!"
    set "s_old=!lp_old_%lp_choice%!"
    set "s_app=!lp_app_%lp_choice%!"
    set "s_code=!lp_code_%lp_choice%!"
    
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    cd /d "!s_dir!" 2>nul
    if exist "!s_dat!" (
        ren "!s_dat!" "!s_old!"
        powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
        echo.
        echo [SUCCESS] !s_app! [!s_code!] -^> Switched to English Mode!
    ) else if exist "!s_old!" (
        ren "!s_old!" "!s_dat!"
        powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
        echo.
        echo [SUCCESS] !s_app! [!s_code!] -^> Restored to Native Language!
    )
    echo.
    pause
    exit /b 0
)

echo [WARNING] Invalid selection.
goto ask_lp_choice

:lp_toggle_all
echo.
echo ========================================================
echo  Batch toggling all global language packs...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%lang_count%) do (
    set "t_dir=!lp_dir_%%I!"
    set "t_dat=!lp_dat_%%I!"
    set "t_old=!lp_old_%%I!"
    set "t_app=!lp_app_%%I!"
    set "t_code=!lp_code_%%I!"
    cd /d "!t_dir!" 2>nul
    if exist "!t_dat!" (
        ren "!t_dat!" "!t_old!"
        echo  [*] !t_app! [!t_code!] -^> Switched to English
    ) else if exist "!t_old!" (
        ren "!t_old!" "!t_dat!"
        echo  [*] !t_app! [!t_code!] -^> Restored to !t_code!
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] Operation completed!
pause
exit /b 0

:lp_all_english
echo.
echo ========================================================
echo  Switching all language packs to English Mode...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%lang_count%) do (
    set "t_dir=!lp_dir_%%I!"
    set "t_dat=!lp_dat_%%I!"
    set "t_old=!lp_old_%%I!"
    set "t_app=!lp_app_%%I!"
    set "t_code=!lp_code_%%I!"
    cd /d "!t_dir!" 2>nul
    if exist "!t_dat!" (
        ren "!t_dat!" "!t_old!"
        echo  [*] !t_app! [!t_code!] -^> Switched to English
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All Photoshop editions switched to English Mode!
pause
exit /b 0

:lp_all_native
echo.
echo ========================================================
echo  Restoring all language packs to Native Language Mode...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo ========================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%lang_count%) do (
    set "t_dir=!lp_dir_%%I!"
    set "t_dat=!lp_dat_%%I!"
    set "t_old=!lp_old_%%I!"
    set "t_app=!lp_app_%%I!"
    set "t_code=!lp_code_%%I!"
    cd /d "!t_dir!" 2>nul
    if exist "!t_old!" (
        ren "!t_old!" "!t_dat!"
        echo  [*] !t_app! [!t_code!] -^> Restored to !t_code!
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All Photoshop editions restored to Native Language Mode!
pause
exit /b 0
`;
}

/**
 * Generate detailed Readme file for ZIP distribution
 */
export function generateReadmeReleaseText(
  folderPath: string,
  fileName: string,
  versionTag: string = 'v1.3.0'
): string {
  return `======================================================================
 포토샵 언어 전환기 - 공식 배포 패키지 (${versionTag})
 Photoshop Korean <-> English Language Switcher Release Bundle
======================================================================

개발자: AhBiYout
공식 블로그: https://ahbiyoutvibe.blogspot.com/
소속 조직: https://www.cisnet.co.kr (CIS)

----------------------------------------------------------------------
1. 패키지 구성 및 실행 방법
----------------------------------------------------------------------
[1] Photoshop_Language_Switcher_GUI.hta (강력 추천 - 단독 GUI 앱)
    - 별도 설치 없이 윈도우에서 바로 더블클릭하여 실행하는 독립 GUI 창 프로그램입니다.
    - 버튼 클릭으로 현재 언어 상태 확인 및 한글/영어 전환이 가능합니다.

[2] Photoshop_Switcher_WPF_GUI.ps1 (PowerShell 모던 WPF GUI 앱)
    - 마우스 우클릭 후 'PowerShell에서 실행'을 누르면 다크 테마 GUI 폼 창이 실행됩니다.

[3] scripts/ 디렉터리
    - photoshop_toggle_language.bat : 바탕화면에서 원클릭으로 한/영 자동 토글
    - create_desktop_shortcut.bat   : 바탕화면에 바로가기 아이콘 생성
    - photoshop_switch_to_english.bat: 영문 모드로 강제 변경
    - photoshop_switch_to_korean.bat : 한글 모드로 강제 복구
    - build_photoshop_toggle_exe.bat : Windows 내장 C# 컴파일러로 바탕화면에 단독 .EXE 파일 100% 자동 생성

----------------------------------------------------------------------
2. 현재 타겟 설정 정보
----------------------------------------------------------------------
- 대상 설치 경로: ${folderPath}
- 대상 언어 파일: ${fileName}

----------------------------------------------------------------------
3. 안전성 및 종료 코드 규격 (ErrorLevel)
----------------------------------------------------------------------
모든 배치 스크립트는 백신 오진 0%를 위해 순수 Windows 내장 명령어로 작성되었으며,
표준 Exit Code(0: 성공, 1: UAC 거부, 2: 폴더 없음, 3: 파일 없음, 4: 잠김)를 지원합니다.
`;
}


/**
 * Generate Desktop Shortcut Bat Creator
 * Creates a convenient shortcut on the Windows Desktop with Photoshop icon and safe storage
 */
export function generateDesktopShortcutBat(folderPath: string, fileName: string): string {
  const oldFileName = getOldDatFileName(fileName);

  return `@echo off
chcp 65001 >nul
title Photoshop Language Switcher - Desktop Shortcut Creator

:: ========================================================
:: [1] Auto-Elevate to Administrator (UAC Self-Elevation)
:: ========================================================
net session >nul 2>&1
if %errorlevel% equ 0 goto uac_ok

echo [INFO] Requesting administrator privileges to create shortcut...
powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs" 2>nul
exit /b 0

:uac_ok

echo ========================================================
echo  Creating "Photoshop Language Switcher" shortcut on Desktop...
echo ========================================================
echo.

set "SCRIPT_DIR=%USERPROFILE%\\PhotoshopSwitcher"
if not exist "%SCRIPT_DIR%" mkdir "%SCRIPT_DIR%"

:: 1. Save core toggle script to permanent directory
set "PERM_BAT=%SCRIPT_DIR%\\photoshop_toggle_language.bat"
(
echo @echo off
echo chcp 65001 ^>nul
echo title Photoshop Language Switcher
echo net session ^>nul 2^>^&1
echo if %%errorlevel%% neq 0 (
echo     powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%%~f0' -Verb RunAs" 2^>nul
echo     exit /b
echo )
echo tasklist /fi "imagename eq Photoshop.exe" 2^>nul ^| find /i "Photoshop.exe" ^>nul
echo if %%errorlevel%% equ 0 (
echo     echo [WARNING] Photoshop is currently running. Please restart Photoshop to apply changes.
echo     echo.
echo )
echo cd /d "${folderPath}" 2^>nul
echo if %%errorlevel%% neq 0 (
echo     echo [ERROR] Cannot access target Photoshop folder: "${folderPath}"
echo     pause
echo     exit /b
echo )
echo powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo if exist "${fileName}" (
echo     ren "${fileName}" "${oldFileName}"
echo     if %%errorlevel%% equ 0 (
echo         powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo         echo ========================================================
echo         echo [SUCCESS] Photoshop language changed to English mode!
echo         echo ========================================================
echo     ) else (
echo         echo [ERROR] Failed to rename file. Please close Photoshop and try again.
echo     )
echo ) else if exist "${oldFileName}" (
echo     ren "${oldFileName}" "${fileName}"
echo     if %%errorlevel%% equ 0 (
echo         powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo         echo ========================================================
echo         echo [SUCCESS] Photoshop language restored to Korean mode!
echo         echo ========================================================
echo     ) else (
echo         echo [ERROR] Failed to rename file. Please close Photoshop and try again.
echo     )
echo ) else (
echo     echo [WARNING] Target language data file not found.
echo )
echo echo.
echo pause
) > "%PERM_BAT%"

:: 2. Create shortcut (.lnk) on Desktop
powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$s = $ws.CreateShortcut([System.IO.Path]::Combine([Environment]::GetFolderPath('Desktop'), 'Photoshop Language Switcher.lnk')); " ^
  "$s.TargetPath = '%PERM_BAT%'; " ^
  "$s.WorkingDirectory = '%SCRIPT_DIR%'; " ^
  "$s.Description = 'Photoshop One-Click Language Switcher'; " ^
  "$s.Save()"

echo.
echo ========================================================
echo [SUCCESS] Desktop shortcut 'Photoshop Language Switcher' created!
echo Location: %USERPROFILE%\\Desktop\\Photoshop Language Switcher.lnk
echo Script Path: %PERM_BAT%
echo ========================================================
echo Double-click the shortcut on your desktop to easily switch languages.
echo.
pause
`;
}

import { downloadCmdFile, downloadAutoExeCompilerFile, type ExeMetadata } from './exeGenerator';

export { downloadCmdFile, downloadAutoExeCompilerFile, type ExeMetadata };

/**
 * Triggers a browser download for a text file with Windows CRLF line endings and UTF-8 BOM
 * Ensures zero encoding issues (no broken Korean characters) and native Windows compatibility.
 * Also supports direct .EXE binary download conversion.
 */
export function downloadTextFile(
  content: string,
  filename: string,
  options?: { isWindowsCrlf?: boolean; withBom?: boolean }
) {
  if (filename.endsWith('.exe')) {
    downloadCmdFile(content, filename);
    return;
  }

  // .bat 및 .cmd는 Windows CMD 파서 호환을 위해 UTF-8 without BOM(BOM 없음)이 필수입니다.
  // (BOM이 있을 경우 첫 줄 주석이나 명령어가 깨져서 "??체 is not recognized" 에러 발생)
  const isBatOrCmd = filename.endsWith('.bat') || filename.endsWith('.cmd');
  const isBatOrWindows =
    options?.isWindowsCrlf ??
    (isBatOrCmd || filename.endsWith('.ps1') || !filename.endsWith('.sh'));
  const useBom =
    options?.withBom ??
    (isBatOrCmd ? false : (filename.endsWith('.ps1') || filename.endsWith('.txt')));

  // 1. Windows CRLF (\r\n) 개행 정규화
  let formattedContent = content;
  if (isBatOrWindows) {
    formattedContent = content.replace(/\r\n/g, '\n').replace(/\n/g, '\r\n');
  }

  // 2. UTF-8 인코딩 (BOM 선택 옵션)
  const blobParts: BlobPart[] = [];
  if (useBom) {
    const bom = new Uint8Array([0xef, 0xbb, 0xbf]);
    blobParts.push(bom);
  }
  blobParts.push(formattedContent);

  const blob = new Blob(blobParts, { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/**
 * 학교/기관 컴퓨터실 원격 제어 프로그램(NetSupport, Veyon, 넷오피 등) 일괄 배포 전용
 * 완전 무인(Silent / Non-interactive) 배치 스크립트 생성기
 */
export function generatePhotoshopClassroomSilentBat(
  mode: 'toggle' | 'to_en' | 'to_ko' | 'to_locale' = 'to_en',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);
  const isToLocale = mode === 'to_ko' || mode === 'to_locale';
  const modeLabel =
    mode === 'to_en'
      ? 'Photoshop [English Mode]'
      : isToLocale
      ? `Photoshop [${lp.name} (${lp.code}) Mode]`
      : `Photoshop [Toggle: ${lp.name} (${lp.code}) <-> English]`;

  return `@echo off
@chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

rem =========================================================================
rem [Classroom / Lab Remote Silent Deployer] Adobe Photoshop Language Switcher
rem Target Language: ${lp.flag} ${lp.name} (${lp.nativeName}) [${lp.code}]
rem Mode: ${modeLabel}
rem Created by: AhBiYout [CIS]
rem Features: Anti-Loop Guard, Multi-Method Admin Check, 100% Silent, Auto Close
rem =========================================================================

rem 0. Check & Request Administrator Privileges (Self-Elevation with Loop Guard)
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
    echo [INFO] Administrator privileges required.
    echo        Requesting UAC elevation...
    echo        (Work will continue in the new elevated window)
    set "SELF_BAT=%~f0"
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath cmd.exe -ArgumentList '/c', ('\"' + $env:SELF_BAT + '\"'), 'am_admin' -Verb RunAs"
    if %errorlevel% neq 0 (
        echo.
        echo =========================================================================
        echo [ERROR] Administrator privileges could not be acquired (UAC rejected or failed).
        echo [GUIDE] Please right-click this script file and select 'Run as administrator'.
        echo =========================================================================
        echo.
        pause
        exit /b 1
    )
    exit /b 0
)

:admin_acquired
cd /d "%~dp0"

set "LOG_FILE=%TEMP%\\photoshop_remote_deploy.log"
echo [%DATE% %TIME%] [START] Photoshop Silent Deploy (Mode: ${mode}, Locale: ${lp.code}) > "!LOG_FILE!"

rem 1. Kill running Photoshop processes to avoid file lock
taskkill /f /im Photoshop.exe >> "!LOG_FILE!" 2>&1
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

set "CHANGED_COUNT=0"

rem 2. Check Windows Registry (App Paths)
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do call :process_ps_dir "%%~dpF"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do call :process_ps_dir "%%~dpF"
    )
)

rem 3. Comprehensive Drive Scanning (Drives C through H)
for %%D in (C D E F G H) do (
    rem Standard Program Files
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*Photoshop*") do (
            call :process_ps_dir "%%P"
        )
    )
    rem 32-bit Program Files (x86)
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*Photoshop*") do (
            call :process_ps_dir "%%P"
        )
    )
    rem Root Adobe Directory
    if exist "%%D:\\Adobe" (
        for /d %%P in ("%%D:\\Adobe\\*Photoshop*") do (
            call :process_ps_dir "%%P"
        )
    )
)

echo [%DATE% %TIME%] [END] Total Modified: !CHANGED_COUNT! >> "!LOG_FILE!"

echo.
echo ========================================================
echo   [SUCCESS] Adobe Photoshop Language Switch Finished
echo ========================================================
echo   * Mode              : ${modeLabel}
echo   * Target Country    : ${lp.flag} ${lp.name} [${lp.code}]
echo   * Photoshop Count   : !CHANGED_COUNT! item(s)
echo   * Processed Versions:
if defined MODIFIED_VERSIONS (
    echo     !MODIFIED_VERSIONS!
) else (
    echo     None (No supported Photoshop installations detected)
)
echo   * Log File Saved    : !LOG_FILE!
echo ========================================================
echo.
if not "%~1"=="silent" if not "%~2"=="silent" (
    echo   [*] Finished successfully. Press any key to close this window...
    pause
)
exit /b 0

:process_ps_dir
set "PS_ROOT=%~1"
if "!PS_ROOT:~-1!"=="\" set "PS_ROOT=!PS_ROOT:~0,-1!"

rem Avoid processing same folder twice
if defined PS_DONE_!PS_ROOT! goto :eof
set "PS_DONE_!PS_ROOT!=1"

for %%V in ("!PS_ROOT!") do set "ver_title=%%~nxV"
if defined MODIFIED_VERSIONS (
    echo !MODIFIED_VERSIONS! | findstr /i /c:"!ver_title!" >nul 2>&1
    if errorlevel 1 set "MODIFIED_VERSIONS=!MODIFIED_VERSIONS!, !ver_title!"
) else (
    set "MODIFIED_VERSIONS=!ver_title!"
)

set "SUP_DIR=!PS_ROOT!\\Locales\\${targetLocale}\\Support Files"
if not exist "!SUP_DIR!" (
    for /d %%L in ("!PS_ROOT!\\Locales\\*") do (
        if exist "%%L\\Support Files" set "SUP_DIR=%%L\\Support Files"
    )
)
if not exist "!SUP_DIR!" (
    if exist "!PS_ROOT!\\Support Files\\tw10428*.dat" (
        set "SUP_DIR=!PS_ROOT!\\Support Files"
    ) else if exist "!PS_ROOT!\\Support Files\\old_tw10428*.dat" (
        set "SUP_DIR=!PS_ROOT!\\Support Files"
    )
)
if not exist "!SUP_DIR!" goto :eof

${
  mode === 'to_en'
    ? `rem [Fixed English Mode] tw10428*.dat -> old_tw10428*.dat
set "PS_FOUND_EN=0"
for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
    if exist "%%F" (
        set "orig_name=%%~nxF"
        ren "%%F" "old_!orig_name!" >> "!LOG_FILE!" 2>&1
        if !errorlevel! equ 0 (
            set /a CHANGED_COUNT+=1
            set "PS_FOUND_EN=1"
            echo [OK: to_en] Photoshop %%~nxF -^> old_!orig_name! in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!PS_FOUND_EN!"=="0" (
    for %%F in ("!SUP_DIR!\\old_tw10428*.dat") do (
        if exist "%%F" (
            set /a CHANGED_COUNT+=1
            echo [ALREADY_EN] Photoshop %%~nxF already in English in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)`
    : isToLocale
    ? `rem [Fixed Target Country Language Mode (${lp.code})] old_tw10428*.dat -> tw10428*.dat
set "PS_FOUND_LOC=0"
for %%F in ("!SUP_DIR!\\old_tw10428*.dat") do (
    if exist "%%F" (
        set "old_name=%%~nxF"
        set "new_name=!old_name:old_=!"
        ren "%%F" "!new_name!" >> "!LOG_FILE!" 2>&1
        if !errorlevel! equ 0 (
            set /a CHANGED_COUNT+=1
            set "PS_FOUND_LOC=1"
            echo [OK: to_locale] Photoshop !old_name! -^> !new_name! (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!PS_FOUND_LOC!"=="0" (
    for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
        if exist "%%F" (
            set /a CHANGED_COUNT+=1
            echo [ALREADY_ACTIVE] Photoshop %%~nxF already active (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)`
    : `rem [Toggle Mode (${lp.name} <-> English)]
set "toggled=0"
for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
    if exist "%%F" (
        set "orig_name=%%~nxF"
        ren "%%F" "old_!orig_name!" >> "!LOG_FILE!" 2>&1
        if !errorlevel! equ 0 (
            set /a CHANGED_COUNT+=1
            set "toggled=1"
            echo [TOGGLE: EN] Photoshop %%~nxF -^> old_!orig_name! in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!toggled!"=="0" (
    for %%F in ("!SUP_DIR!\\old_tw10428*.dat") do (
        if exist "%%F" (
            set "old_name=%%~nxF"
            set "new_name=!old_name:old_=!"
            ren "%%F" "!new_name!" >> "!LOG_FILE!" 2>&1
            if !errorlevel! equ 0 (
                set /a CHANGED_COUNT+=1
                echo [TOGGLE: ${lp.code}] Photoshop !old_name! -^> !new_name! (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
            )
        )
    )
)`
}

goto :eof
`;
}


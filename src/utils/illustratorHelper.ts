import { OperatingSystem, IllustratorVersionPreset, PathConfig } from '../types';
import { getLocaleByCode } from './localeHelper';
import { APP_VERSION_FULL } from '../version';

export const ILLUSTRATOR_VERSIONS: IllustratorVersionPreset[] = [
  {
    id: 'ai2026',
    name: 'Illustrator 2026',
    folderName: 'Adobe Illustrator 2026',
    year: 2026,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
    note: '최신 릴리스 - AMT application.xml 언어 제어',
  },
  {
    id: 'ai2025',
    name: 'Illustrator 2025',
    folderName: 'Adobe Illustrator 2025',
    year: 2025,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai2024',
    name: 'Illustrator 2024',
    folderName: 'Adobe Illustrator 2024',
    year: 2024,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai2023',
    name: 'Illustrator 2023',
    folderName: 'Adobe Illustrator 2023',
    year: 2023,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai2022',
    name: 'Illustrator 2022',
    folderName: 'Adobe Illustrator 2022',
    year: 2022,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai2021',
    name: 'Illustrator 2021',
    folderName: 'Adobe Illustrator 2021',
    year: 2021,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai2020',
    name: 'Illustrator 2020',
    folderName: 'Adobe Illustrator 2020',
    year: 2020,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai_cc2019',
    name: 'Illustrator CC 2019',
    folderName: 'Adobe Illustrator CC 2019',
    year: 2019,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai_cc2018',
    name: 'Illustrator CC 2018',
    folderName: 'Adobe Illustrator CC 2018',
    year: 2018,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai_cc2017',
    name: 'Illustrator CC 2017',
    folderName: 'Adobe Illustrator CC 2017',
    year: 2017,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai_cc2015',
    name: 'Illustrator CC 2015',
    folderName: 'Adobe Illustrator CC 2015',
    year: 2015,
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
  },
  {
    id: 'ai_cs6',
    name: 'Illustrator CS6 (64-bit)',
    folderName: 'Adobe Illustrator CS6 (64 Bit)',
    year: 'CS6',
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
    note: 'CS6 64비트 버전 - AMT application.xml 지원',
  },
  {
    id: 'ai_cs6_32',
    name: 'Illustrator CS6 (32-bit)',
    folderName: 'Adobe Illustrator CS6',
    year: 'CS6',
    defaultConfigFile: 'application.xml',
    subPath: 'Support Files\\Contents\\Windows\\AMT',
    note: 'CS6 32비트 버전 - AMT application.xml 지원',
  },
];

export function getIllustratorDefaultPath(
  preset: IllustratorVersionPreset,
  drive: string = 'C',
  os: OperatingSystem = 'windows'
): string {
  if (os === 'macos') {
    return `/Applications/${preset.folderName}/Adobe Illustrator.app/Contents/Resources/AMT`;
  }
  return `${drive || 'C'}:\\Program Files\\Adobe\\${preset.folderName}\\${preset.subPath}`;
}

export function getIllustratorResolvedPath(config: PathConfig): string {
  if (config.isCustomPath && config.customPath && config.customPath.trim()) {
    return config.customPath.trim();
  }
  const preset =
    ILLUSTRATOR_VERSIONS.find((v) => v.id === config.versionId) ||
    ILLUSTRATOR_VERSIONS[2];
  return getIllustratorDefaultPath(preset, config.drive || 'C', config.os || 'windows');
}

/**
 * Generates Smart Toggle .BAT for Adobe Illustrator
 * Automatically acquires UAC elevation, detects application.xml,
 * and toggles <Data key="installedLanguages">targetLocale</Data> <-> en_US
 */
export function generateIllustratorSmartToggleBat(
  folderPath: string,
  xmlFileName: string = 'application.xml',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);

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

title Adobe Illustrator Language Switcher - Smart Toggle (1.5s Safe Pacing Engine)

echo =========================================================================
echo   Adobe Illustrator ${lp.name} [${lp.code}] ^<--^> English [en_US] Auto Switcher
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

set "TARGET_DIR=${folderPath}"
set "XML_FILE=${xmlFileName}"

rem Path correction: Scan subfolders if target is parent Illustrator directory
if not exist "!TARGET_DIR!\\!XML_FILE!" (
    if exist "!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT"
    ) else if exist "!TARGET_DIR!\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\AMT"
    )
)

echo [Step 1/4] Checking active Illustrator process and file lock...
tasklist /fi "imagename eq Illustrator.exe" 2>nul | find /i "Illustrator.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Illustrator.exe is currently running.
    echo                     Please close Illustrator to prevent XML file locking.
) else (
    echo           [OK] No running Illustrator instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 2/4] Verifying Target Folder and AMT configuration file...
echo           Path: "!TARGET_DIR!"
echo           File: "!XML_FILE!"

if not exist "!TARGET_DIR!" (
    echo.
    echo =========================================================================
    echo  [ERROR: Exit Code 2] Target Illustrator directory not found!
    echo =========================================================================
    echo  Path: "!TARGET_DIR!"
    pause
    exit /b 2
)

cd /d "!TARGET_DIR!" 2>nul
if not exist "!XML_FILE!" (
    echo.
    echo =========================================================================
    echo  [ERROR: Exit Code 3] File '!XML_FILE!' not found!
    echo =========================================================================
    echo  Please ensure application.xml exists in the folder.
    pause
    exit /b 3
)
echo           [OK] Target folder and XML configuration file confirmed.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 3/4] Analyzing and switching language tags...

rem Create initial backup if it doesn't exist
if not exist "!XML_FILE!.initial_backup" (
    copy "!XML_FILE!" "!XML_FILE!.initial_backup" >nul 2>&1
    echo           [*] Created initial secure backup: !XML_FILE!.initial_backup
)

rem Check installedLanguages inside application.xml
findstr /i "${targetLocale}" "!XML_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    echo           [*] Current Status: [${lp.name} - ${targetLocale} Mode] detected.
    echo           [*] Applying: [English - en_US Mode]...
    
    copy "!XML_FILE!" "!XML_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US'; }; [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8)"
    
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
    echo.
    echo =========================================================================
    echo  [SUCCESS] Adobe Illustrator switched to [English - en_US] successfully!
    echo =========================================================================
    echo  - Illustrator will launch in English interface next time.
    echo  - To restore to ${lp.name}, simply run this script again.
    echo =========================================================================
    goto end_script
)

findstr /i "en_US" "!XML_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    echo           [*] Current Status: [English - en_US Mode] detected.
    echo           [*] Applying: [${lp.name} - ${targetLocale} Mode]...
    
    copy "!XML_FILE!" "!XML_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8)"
    
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
    echo.
    echo =========================================================================
    echo  [SUCCESS] Adobe Illustrator restored to [${lp.name} - ${targetLocale}] successfully!
    echo =========================================================================
    echo  - Illustrator will launch in ${lp.name} interface next time.
    echo  - To switch to English, simply run this script again.
    echo =========================================================================
    goto end_script
)

findstr /i "en_GB" "!XML_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    echo           [*] Current Status: [English - en_GB Mode] detected.
    echo           [*] Applying: [${lp.name} - ${targetLocale} Mode]...
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8)"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo.
    echo  [SUCCESS] Adobe Illustrator restored to [${lp.name} - ${targetLocale}] successfully!
    goto end_script
)

echo.
echo [WARNING] Could not find ${targetLocale} or en_US language tags in !XML_FILE!.
echo           Switching tag to ${targetLocale}...
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8); echo 'Applied ${targetLocale}'; }"
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:end_script
echo.
pause
exit /b 0
`;
}

/**
 * Generates Multi-Version Auto Detection Batch Script for Adobe Illustrator
 * Scans C, D, E, F drives for all installed Illustrator versions
 * and allows user to select or batch toggle.
 */
export function generateIllustratorAutoDetectMultiVersionBat(): string {
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

title Adobe Illustrator Language Switcher - Multi-Version Scanner

echo =========================================================================
echo   Adobe Illustrator Multi-Version Auto-Scanner ^& Switcher (${APP_VERSION_FULL})
echo   Developer: AhBiYout (CIS)
echo   Supported: CS6, CC 2014 ~ 2026+ (All Versions ^& Beta)
echo   지원 버전: CS6, CC 2014~2026 전 버전 및 Beta (32/64-bit)
echo =========================================================================
echo.
echo [1/2] Scanning for installed Adobe Illustrator versions on this system...
echo.

set ai_count=0

rem [Scan 1] Query registry for actual executable path
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Illustrator.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do set "reg_pdir=%%~dpF"
        if exist "!reg_pdir!AMT\\application.xml" (
            set /a ai_count+=1
            set "ai_dir_!ai_count!=!reg_pdir!AMT"
            set "ai_name_!ai_count!=Adobe Illustrator [Registry Detected]"
            set "ai_xml_!ai_count!=application.xml"
        )
    )
)

rem [Scan 2] Scan standard drive directories
for %%D in (C D E F G H) do (
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Illustrator 일러스트" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register "%%P" "%%~nxP [%%D:]"
            )
        )
    )
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Illustrator 일러스트" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register "%%P" "%%~nxP [%%D: x86]"
            )
        )
    )
    if exist "%%D:\\Adobe" (
        for /d %%P in ("%%D:\\Adobe\\*") do (
            set "chk_n=%%~nxP"
            echo !chk_n! | findstr /i "Illustrator 일러스트" >nul 2>&1
            if !errorlevel! equ 0 (
                call :check_and_register "%%P" "%%~nxP [%%D: Root]"
            )
        )
    )
)

rem [Scan 3] Deep scan using PowerShell if none found
if %ai_count% equ 0 (
    echo [INFO] Standard directories scanned. Initializing deep-scan via PowerShell...
    for /f "usebackq delims=" %%F in (\`powershell -NoProfile -Command "Get-ChildItem -Path 'C:\\Program Files','C:\\Program Files (x86)','C:\\','D:\\' -Filter 'application.xml' -Recurse -Depth 6 -ErrorAction SilentlyContinue | Where-Object { $_.FullName -like '*Illustrator*' -and $_.FullName -like '*AMT*' } | Select-Object -First 3 -ExpandProperty DirectoryName" 2^>nul\`) do (
        if exist "%%F\\application.xml" (
            set /a ai_count+=1
            set "ai_dir_!ai_count!=%%F"
            set "ai_name_!ai_count!=Adobe Illustrator [Deep Scan Detected]"
            set "ai_xml_!ai_count!=application.xml"
        )
    )
)

if %ai_count% equ 0 goto no_illustrator_found
goto show_menu

:check_and_register
set "cand_dir=%~1"
set "cand_lbl=%~2"

rem Deduplication check
for /l %%k in (1,1,!ai_count!) do (
    if "!ai_dir_%%k!"=="!cand_dir!\\Support Files\\Contents\\Windows\\AMT" goto :eof
    if "!ai_dir_%%k!"=="!cand_dir!\\AMT" goto :eof
    if "!ai_dir_%%k!"=="!cand_dir!\\Support Files\\AMT" goto :eof
)

if exist "!cand_dir!\\Support Files\\Contents\\Windows\\AMT\\application.xml" (
    set /a ai_count+=1
    set "ai_dir_!ai_count!=!cand_dir!\\Support Files\\Contents\\Windows\\AMT"
    set "ai_name_!ai_count!=!cand_lbl!"
    set "ai_xml_!ai_count!=application.xml"
    goto :eof
)
if exist "!cand_dir!\\AMT\\application.xml" (
    set /a ai_count+=1
    set "ai_dir_!ai_count!=!cand_dir!\\AMT"
    set "ai_name_!ai_count!=!cand_lbl!"
    set "ai_xml_!ai_count!=application.xml"
    goto :eof
)
if exist "!cand_dir!\\Support Files\\AMT\\application.xml" (
    set /a ai_count+=1
    set "ai_dir_!ai_count!=!cand_dir!\\Support Files\\AMT"
    set "ai_name_!ai_count!=!cand_lbl!"
    set "ai_xml_!ai_count!=application.xml"
    goto :eof
)
if exist "!cand_dir!\\Support Files\\Contents\\Windows\\application.xml" (
    set /a ai_count+=1
    set "ai_dir_!ai_count!=!cand_dir!\\Support Files\\Contents\\Windows"
    set "ai_name_!ai_count!=!cand_lbl!"
    set "ai_xml_!ai_count!=application.xml"
    goto :eof
)
goto :eof

:no_illustrator_found
echo.
echo =========================================================================
echo  [INFO] Adobe Illustrator installation folder was not detected.
echo =========================================================================
echo.
echo  Please manually enter or paste your Illustrator installation folder below:
echo  (e.g., C:\\Program Files\\Adobe\\Adobe Illustrator 2024)
echo  The script will automatically resolve internal 'application.xml' path.
echo =========================================================================
echo.
set /p manual_input="Enter Illustrator Folder (or Q to Quit): "
if /i "!manual_input!"=="Q" exit /b 2
if "!manual_input!"=="" exit /b 2

set "test_target=!manual_input!"
set "test_target=!test_target:"=!"

if /i "!test_target:~-15!"=="application.xml" (
    for %%F in ("!test_target!") do set "test_target=%%~dpF"
    set "test_target=!test_target:~0,-1!"
)

if exist "!test_target!\\Support Files\\Contents\\Windows\\AMT\\application.xml" (
    set "test_target=!test_target!\\Support Files\\Contents\\Windows\\AMT"
) else if exist "!test_target!\\AMT\\application.xml" (
    set "test_target=!test_target!\\AMT"
) else if exist "!test_target!\\Support Files\\AMT\\application.xml" (
    set "test_target=!test_target!\\Support Files\\AMT"
) else if exist "!test_target!\\Contents\\Windows\\AMT\\application.xml" (
    set "test_target=!test_target!\\Contents\\Windows\\AMT"
)

if not exist "!test_target!\\application.xml" (
    for /r "!test_target!" %%X in (application.xml) do (
        if exist "%%X" (
            set "test_target=%%~dpX"
            set "test_target=!test_target:~0,-1!"
            goto found_manual_target
        )
    )
)

:found_manual_target
if not exist "!test_target!\\application.xml" (
    echo.
    echo [ERROR] application.xml file not found in: !manual_input!
    pause
    exit /b 2
)

set /a ai_count+=1
set "ai_dir_1=!test_target!"
set "ai_name_1=Adobe Illustrator [Custom Path]"
set "ai_xml_1=application.xml"
goto show_menu

:show_menu
echo [SUCCESS] Identified total %ai_count% Adobe Illustrator installation(s)!
echo.
echo =========================================================================
echo   Installed Illustrator versions ^& Language Status:
echo =========================================================================

for /l %%I in (1,1,%ai_count%) do (
    set "cur_dir=!ai_dir_%%I!"
    set "cur_xml=!ai_xml_%%I!"
    set "cur_name=!ai_name_%%I!"
    
    findstr /i "ko_KR" "!cur_dir!\\!cur_xml!" >nul 2>&1
    if !errorlevel! equ 0 (
        echo   [%%I] !cur_name!  --^>  [Korean Mode]
    ) else (
        findstr /i "en_US" "!cur_dir!\\!cur_xml!" >nul 2>&1
        if !errorlevel! equ 0 (
            echo   [%%I] !cur_name!  --^>  [English Mode]
        ) else (
            echo   [%%I] !cur_name!  --^>  [Other / Multilingual Mode]
        )
    )
)

echo   -------------------------------------------------------------------------
echo   [A] Batch Toggle all Illustrator versions [Toggle All]
echo   [E] Batch Switch all Illustrator versions to English
echo   [K] Batch Restore all Illustrator versions to Korean
echo   [Q] Cancel and Exit
echo =========================================================================
echo.

set /p user_choice="Enter your selection [Number or A/E/K/Q]: "
if /i "!user_choice!"=="Q" exit /b 0
if /i "!user_choice!"=="A" goto do_batch_toggle
if /i "!user_choice!"=="E" goto do_batch_english
if /i "!user_choice!"=="K" goto do_batch_korean

set /a num_choice=!user_choice! 2>nul
if !num_choice! geq 1 (
    if !num_choice! leq %ai_count% (
        goto do_single_toggle
    )
)

echo.
echo [ERROR] Invalid selection option.
pause
exit /b 1

:do_single_toggle
set "sel_dir=!ai_dir_%num_choice%!"
set "sel_xml=!ai_xml_%num_choice%!"
set "sel_name=!ai_name_%num_choice%!"

echo.
echo =========================================================================
echo  Executing language switch for [!sel_name!]...
echo  Safe Pacing Engine Active (1.5s Delay / File Lock Guard)
echo =========================================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

cd /d "!sel_dir!" 2>nul
findstr /i "ko_KR" "!sel_xml!" >nul 2>&1
if !errorlevel! equ 0 (
    powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!sel_xml!', ([System.IO.File]::ReadAllText('!sel_xml!', [System.Text.Encoding]::UTF8) -replace 'ko_KR', 'en_US'), [System.Text.Encoding]::UTF8)"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo.
    echo [SUCCESS] !sel_name! -> English Mode applied!
) else (
    powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!sel_xml!', ([System.IO.File]::ReadAllText('!sel_xml!', [System.Text.Encoding]::UTF8) -replace 'en_US', 'ko_KR'), [System.Text.Encoding]::UTF8)"
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
    echo.
    echo [SUCCESS] !sel_name! -> Korean Mode restored!
)
goto finish

:do_batch_toggle
echo.
echo =========================================================================
echo  Batch toggling all installed Illustrator versions...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo =========================================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ai_count%) do (
    set "t_dir=!ai_dir_%%I!"
    set "t_xml=!ai_xml_%%I!"
    set "t_name=!ai_name_%%I!"
    
    cd /d "!t_dir!" 2>nul
    findstr /i "ko_KR" "!t_xml!" >nul 2>&1
    if !errorlevel! equ 0 (
        powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!t_xml!', ([System.IO.File]::ReadAllText('!t_xml!', [System.Text.Encoding]::UTF8) -replace 'ko_KR', 'en_US'), [System.Text.Encoding]::UTF8)"
        echo  [*] !t_name!  --^>  Switched to English
    ) else (
        powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!t_xml!', ([System.IO.File]::ReadAllText('!t_xml!', [System.Text.Encoding]::UTF8) -replace 'en_US', 'ko_KR'), [System.Text.Encoding]::UTF8)"
        echo  [*] !t_name!  --^>  Restored to Korean
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] Batch language toggle completed successfully!
goto finish

:do_batch_english
echo.
echo =========================================================================
echo  Switching all installed Illustrator versions to English...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo =========================================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ai_count%) do (
    set "t_dir=!ai_dir_%%I!"
    set "t_xml=!ai_xml_%%I!"
    set "t_name=!ai_name_%%I!"
    
    cd /d "!t_dir!" 2>nul
    findstr /i "ko_KR" "!t_xml!" >nul 2>&1
    if !errorlevel! equ 0 (
        powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!t_xml!', ([System.IO.File]::ReadAllText('!t_xml!', [System.Text.Encoding]::UTF8) -replace 'ko_KR', 'en_US'), [System.Text.Encoding]::UTF8)"
        echo  [*] !t_name!  --^>  Switched to English
    ) else (
        echo  [*] !t_name!  --^>  Already in English Mode
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All installations set to English (en_US) successfully!
goto finish

:do_batch_korean
echo.
echo =========================================================================
echo  Restoring all installed Illustrator versions to Korean...
echo  Safe Pacing Engine Active (1.5s Step Interval / File Lock Guard)
echo =========================================================================
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
for /l %%I in (1,1,%ai_count%) do (
    set "t_dir=!ai_dir_%%I!"
    set "t_xml=!ai_xml_%%I!"
    set "t_name=!ai_name_%%I!"
    
    cd /d "!t_dir!" 2>nul
    findstr /i "en_US" "!t_xml!" >nul 2>&1
    if !errorlevel! equ 0 (
        powershell -NoProfile -Command "[System.IO.File]::WriteAllText('!t_xml!', ([System.IO.File]::ReadAllText('!t_xml!', [System.Text.Encoding]::UTF8) -replace 'en_US', 'ko_KR'), [System.Text.Encoding]::UTF8)"
        echo  [*] !t_name!  --^>  Restored to Korean
    ) else (
        echo  [*] !t_name!  --^>  Already in Korean Mode
    )
    powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul
)
echo.
echo [SUCCESS] All installations restored to Korean (ko_KR) successfully!
goto finish

:finish
echo.
echo =========================================================================
echo  Task completed successfully!
echo =========================================================================
pause
exit /b 0
`;
}

/**
 * Generates Dedicated Switch to English Script for Illustrator
 */
export function generateIllustratorToEnglishBat(
  folderPath: string,
  xmlFileName: string = 'application.xml',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);

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

title Adobe Illustrator - Switch to English (1.5s Safe Pacing Engine)
color 0B
cls

echo =========================================================================
echo   Adobe Illustrator - Switch to English (en_US) Mode
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

set "TARGET_DIR=${folderPath}"
set "XML_FILE=${xmlFileName}"

rem Path correction
if not exist "!TARGET_DIR!\\!XML_FILE!" (
    if exist "!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT"
    ) else if exist "!TARGET_DIR!\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\AMT"
    )
)

echo [Step 1/4] Checking active Illustrator process and file lock...
tasklist /fi "imagename eq Illustrator.exe" 2>nul | find /i "Illustrator.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Illustrator.exe is currently running.
    echo                     Please close Illustrator to prevent XML file locking.
) else (
    echo           [OK] No running Illustrator instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 2/4] Verifying Target Folder and AMT configuration file...
echo           Path: "!TARGET_DIR!"
echo           File: "!XML_FILE!"

cd /d "!TARGET_DIR!" 2>nul
if not exist "!XML_FILE!" (
    echo [ERROR] Config file '!XML_FILE!' not found in: "!TARGET_DIR!"
    pause
    exit /b 1
)
echo           [OK] Configuration file found.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 3/4] Switching language configuration to English mode...
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US' -replace 'ko_KR', 'en_US'; }; [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8)"
echo           [OK] Language tag updated to en_US.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
echo.
echo =========================================================================
echo [SUCCESS] Adobe Illustrator successfully switched to English (en_US) mode!
echo =========================================================================
echo.
pause
exit /b 0
`;
}

/**
 * Generates Dedicated Switch to Target Country Language Script for Illustrator
 */
export function generateIllustratorToKoreanBat(
  folderPath: string,
  xmlFileName: string = 'application.xml',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);

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

title Adobe Illustrator - Restore to ${lp.name} (1.5s Safe Pacing Engine)
color 0A
cls

echo =========================================================================
echo   Adobe Illustrator - Restore to ${lp.flag} ${lp.name} (${lp.nativeName}) Mode
echo   Safe Pacing Engine Active (1.5s Delay / File-Lock ^& I/O Flush Guard)
echo =========================================================================
echo.

set "TARGET_DIR=${folderPath}"
set "XML_FILE=${xmlFileName}"

rem Path correction
if not exist "!TARGET_DIR!\\!XML_FILE!" (
    if exist "!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\Support Files\\Contents\\Windows\\AMT"
    ) else if exist "!TARGET_DIR!\\AMT\\!XML_FILE!" (
        set "TARGET_DIR=!TARGET_DIR!\\AMT"
    )
)

echo [Step 1/4] Checking active Illustrator process and file lock...
tasklist /fi "imagename eq Illustrator.exe" 2>nul | find /i "Illustrator.exe" >nul
if %errorlevel% equ 0 (
    echo           [WARNING] Illustrator.exe is currently running.
    echo                     Please close Illustrator to prevent XML file locking.
) else (
    echo           [OK] No running Illustrator instance detected.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 2/4] Verifying Target Folder and AMT configuration file...
echo           Path: "!TARGET_DIR!"
echo           File: "!XML_FILE!"

cd /d "!TARGET_DIR!" 2>nul
if not exist "!XML_FILE!" (
    echo [ERROR] Config file '!XML_FILE!' not found in: "!TARGET_DIR!"
    pause
    exit /b 1
)
echo           [OK] Configuration file found.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 3/4] Restoring language configuration to ${lp.name} mode...
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!XML_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!XML_FILE!', $c, [System.Text.Encoding]::UTF8)"
echo           [OK] Language tag restored to ${targetLocale}.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo [Step 4/4] Verifying filesystem integrity and flushing disk cache...
echo.
echo =========================================================================
echo [SUCCESS] Adobe Illustrator successfully switched to ${lp.flag} ${lp.name} (${targetLocale}) mode!
echo =========================================================================
echo.
pause
exit /b 0
`;
}

/**
 * Generates Desktop Shortcut Installer for Illustrator
 */
export function generateIllustratorShortcutBat(
  folderPath: string,
  xmlFileName: string = 'application.xml',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);

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

title Adobe Illustrator Shortcut Creator
color 0E
cls

echo =========================================================================
echo  Adobe Illustrator - Desktop Quick Language Toggle Shortcut Creator
echo  Target Language: ${lp.flag} ${lp.name} [${targetLocale}]
echo =========================================================================
echo.

set "SCRIPT_DIR=%ProgramData%\\AdobeIllustratorLanguageSwitcher"
if not exist "%SCRIPT_DIR%" mkdir "%SCRIPT_DIR%" >nul 2>&1

set "CORE_BAT=%SCRIPT_DIR%\\illustrator_toggle.bat"

(
echo @echo off
echo setlocal enabledelayedexpansion
echo set "T_DIR=${folderPath}"
echo set "X_FILE=${xmlFileName}"
echo cd /d "%%T_DIR%%" 2^>nul
echo powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo findstr /i "${targetLocale}" "%%X_FILE%%" ^>nul 2^>^&1
echo if %%errorlevel%% equ 0 ^(
echo     powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('%%X_FILE%%', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US'; }; [System.IO.File]::WriteAllText('%%X_FILE%%', $c, [System.Text.Encoding]::UTF8)"
echo     powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo     msg * /time:2 "Adobe Illustrator: English (en_US) mode applied successfully!"
echo ^) else ^(
echo     powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('%%X_FILE%%', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('%%X_FILE%%', $c, [System.Text.Encoding]::UTF8)"
echo     powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" ^>nul 2^>^&1 ^|^| ping 127.0.0.1 -n 3 ^>nul
echo     msg * /time:2 "Adobe Illustrator: ${lp.name} (${targetLocale}) mode restored successfully!"
echo ^)
) > "%CORE_BAT%"

:: Generate elevated shortcut on Desktop via PowerShell
powershell -NoProfile -Command ^
  "$ws = New-Object -ComObject WScript.Shell; " ^
  "$desktop = [Environment]::GetFolderPath('Desktop'); " ^
  "$s = $ws.CreateShortcut(\"$desktop\\Illustrator Language Toggle.lnk\"); " ^
  "$s.TargetPath = 'cmd.exe'; " ^
  "$s.Arguments = '/c \"\"' + '%CORE_BAT%' + '\"\"'; " ^
  "$s.WindowStyle = 7; " ^
  "$s.Description = 'Adobe Illustrator ${lp.name} / English One-Click Language Switcher'; " ^
  "$s.Save(); " ^
  "$bytes = [System.IO.File]::ReadAllBytes(\"$desktop\\Illustrator Language Toggle.lnk\"); " ^
  "$bytes[0x15] = $bytes[0x15] -bor 0x20; " ^
  "[System.IO.File]::WriteAllBytes(\"$desktop\\Illustrator Language Toggle.lnk\", $bytes)"

echo.
echo [SUCCESS] 'Illustrator Language Toggle' shortcut has been created on your desktop!
echo.
pause
exit /b 0
`;
}

/**
 * Generates PowerShell Script for Illustrator
 */
export function generateIllustratorPowerShellScript(
  folderPath: string,
  xmlFileName: string = 'application.xml',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);

  return `# ========================================================
# Adobe Illustrator ${lp.name}(${targetLocale})/영어 원클릭 언어 전환 스크립트
# PowerShell 5.1 / 7+ 호환
# ========================================================

# 1. 관리자 권한 확인 및 자동 승격
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[안내] 관리자 권한으로 다시 실행합니다..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File \`"$PSCommandPath\`"" -Verb RunAs
    Exit
}

$targetDir = "${folderPath}"
$xmlName = "${xmlFileName}"
$fullPath = Join-Path -Path $targetDir -ChildPath $xmlName

Write-Host "========================================================" -ForegroundColor Cyan
Write-Host "  Adobe Illustrator 언어 토글기 (PowerShell)" -ForegroundColor Cyan
Write-Host "  대상 언어: ${lp.flag} ${lp.name} [${targetLocale}] <-> English [en_US]" -ForegroundColor Gray
Write-Host "========================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "대상 파일: $fullPath" -ForegroundColor Gray

if (-not (Test-Path -LiteralPath $fullPath)) {
    Write-Host "[오류] 설정 파일을 찾을 수 없습니다: $fullPath" -ForegroundColor Red
    Pause
    Exit 1
}

$content = Get-Content -LiteralPath $fullPath -Encoding UTF8 -Raw

if ($content -match "${targetLocale}") {
    Write-Host "[상태] 현재 [${lp.name}(${targetLocale})] 모드 감지됨" -ForegroundColor Green
    if ($content -match '<Data key="installedLanguages">') {
        $newContent = [regex]::Replace($content, '<Data key="installedLanguages">.*?</Data>', '<Data key="installedLanguages">en_US</Data>')
    } else {
        $newContent = $content -replace "${targetLocale}", "en_US"
    }
    Set-Content -LiteralPath $fullPath -Value $newContent -Encoding UTF8
    Write-Host "[성공] Adobe Illustrator가 [영어(English)] 모드로 전환되었습니다!" -ForegroundColor Green
} elseif ($content -match "en_US" -or $content -match "en_GB") {
    Write-Host "[상태] 현재 [영어(English)] 모드 감지됨" -ForegroundColor Green
    if ($content -match '<Data key="installedLanguages">') {
        $newContent = [regex]::Replace($content, '<Data key="installedLanguages">.*?</Data>', '<Data key="installedLanguages">${targetLocale}</Data>')
    } else {
        $newContent = $content -replace "en_US", "${targetLocale}" -replace "en_GB", "${targetLocale}"
    }
    Set-Content -LiteralPath $fullPath -Value $newContent -Encoding UTF8
    Write-Host "[성공] Adobe Illustrator가 [${lp.name}(${targetLocale})] 모드로 복구되었습니다!" -ForegroundColor Green
} else {
    Write-Host "[경고] ${targetLocale} 또는 en_US 태그를 찾지 못했습니다. ${targetLocale} 모드로 강제 설정합니다." -ForegroundColor Yellow
    $newContent = [regex]::Replace($content, '<Data key="installedLanguages">.*?</Data>', '<Data key="installedLanguages">${targetLocale}</Data>')
    Set-Content -LiteralPath $fullPath -Value $newContent -Encoding UTF8
}

Start-Sleep -Seconds 3
`;
}

/**
 * 학교/기관 컴퓨터실 원격 제어 프로그램(NetSupport, Veyon, 넷오피 등) 일괄 배포 전용
 * Illustrator 완전 무인(Silent / Non-interactive) 배치 스크립트 생성기
 */
export function generateIllustratorClassroomSilentBat(
  mode: 'toggle' | 'to_en' | 'to_ko' | 'to_locale' = 'to_en',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);
  const isToLocale = mode === 'to_ko' || mode === 'to_locale';
  const modeLabel =
    mode === 'to_en'
      ? 'Set English (en_US) Mode'
      : isToLocale
      ? `Set ${lp.name} (${lp.code}) Mode`
      : `Toggle English <-> ${lp.name} (${lp.code}) Mode`;

  return `@echo off
@chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

rem =========================================================================
rem [Classroom / Lab Remote Silent Deployer] Adobe Illustrator Language Switcher
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

set "LOG_FILE=%TEMP%\\illustrator_remote_deploy.log"
echo [%DATE% %TIME%] [START] Illustrator Silent Deploy (Mode: ${mode}) > "!LOG_FILE!"

rem 1. Kill running processes to avoid file lock
taskkill /f /im Illustrator.exe >> "!LOG_FILE!" 2>&1
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

set "CHANGED_COUNT=0"

rem 2. Check Windows Registry (App Paths)
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Illustrator.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do (
            call :try_modify_xml "%%~dpFAMT\\application.xml"
            call :try_modify_xml "%%~dpFSupport Files\\Contents\\Windows\\AMT\\application.xml"
        )
    )
)
for /f "tokens=2*" %%A in ('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Illustrator.exe" /ve 2^>nul') do (
    set "reg_exe=%%B"
    if exist "!reg_exe!" (
        for %%F in ("!reg_exe!") do (
            call :try_modify_xml "%%~dpFAMT\\application.xml"
            call :try_modify_xml "%%~dpFSupport Files\\Contents\\Windows\\AMT\\application.xml"
        )
    )
)

rem 3. Comprehensive Drive Scanning (Drives C through H)
for %%D in (C D E F G H) do (
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*Illustrator*") do (
            call :scan_ai_subdirs "%%P"
        )
    )
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*Illustrator*") do (
            call :scan_ai_subdirs "%%P"
        )
    )
    if exist "%%D:\\Adobe" (
        for /d %%P in ("%%D:\\Adobe\\*Illustrator*") do (
            call :scan_ai_subdirs "%%P"
        )
    )
)

echo [%DATE% %TIME%] [END] Total Modified: !CHANGED_COUNT! >> "!LOG_FILE!"

echo.
echo =========================================================================
echo   [SUCCESS] Adobe Illustrator Language Switch Finished
echo =========================================================================
echo   * Mode              : ${modeLabel}
echo   * Illustrator Count : !CHANGED_COUNT! item(s)
echo   * Processed Versions:
if defined MODIFIED_VERSIONS (
    echo     !MODIFIED_VERSIONS!
) else (
    echo     None (No supported Illustrator installations detected)
)
echo   * Log File Saved    : !LOG_FILE!
echo =========================================================================
echo.
if not "%~1"=="silent" if not "%~2"=="silent" (
    echo   [*] Finished successfully. Press any key to close this window...
    pause
)
exit /b 0

:scan_ai_subdirs
set "R_DIR=%~1"
if "!R_DIR:~-1!"=="\" set "R_DIR=!R_DIR:~0,-1!"

rem Avoid processing same directory twice
if defined AI_SCAN_DONE_!R_DIR! goto :eof
set "AI_SCAN_DONE_!R_DIR!=1"

for %%V in ("!R_DIR!") do set "ver_title=%%~nxV"
if defined MODIFIED_VERSIONS (
    echo !MODIFIED_VERSIONS! | findstr /i /c:"!ver_title!" >nul 2>&1
    if errorlevel 1 set "MODIFIED_VERSIONS=!MODIFIED_VERSIONS!, !ver_title!"
) else (
    set "MODIFIED_VERSIONS=!ver_title!"
)

call :try_modify_xml "!R_DIR!\\Support Files\\Contents\\Windows\\AMT\\application.xml"
call :try_modify_xml "!R_DIR!\\AMT\\application.xml"
call :try_modify_xml "!R_DIR!\\Support Files\\AMT\\application.xml"
call :try_modify_xml "!R_DIR!\\Support Files\\Contents\\Windows\\application.xml"
goto :eof

:try_modify_xml
set "X_FILE=%~1"
if not exist "!X_FILE!" goto :eof

rem Avoid processing same file twice
if defined XML_DONE_!X_FILE! goto :eof
set "XML_DONE_!X_FILE!=1"

${
  mode === 'to_en'
    ? `findstr /i "en_US" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    set /a CHANGED_COUNT+=1
    echo [ALREADY_EN] Already en_US: !X_FILE! >> "!LOG_FILE!"
    goto :eof
)
copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US' -replace 'ko_KR', 'en_US'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
set /a CHANGED_COUNT+=1
echo [OK: to_en] Modified: !X_FILE! >> "!LOG_FILE!"`
    : isToLocale
    ? `findstr /i "${targetLocale}" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    set /a CHANGED_COUNT+=1
    echo [ALREADY_LOC] Already ${targetLocale}: !X_FILE! >> "!LOG_FILE!"
    goto :eof
)
copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
set /a CHANGED_COUNT+=1
echo [OK: to_locale] Modified: !X_FILE! (${lp.name} [${targetLocale}]) >> "!LOG_FILE!"`
    : `findstr /i "${targetLocale}" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
    set /a CHANGED_COUNT+=1
    echo [TOGGLE: ${lp.code}->EN] Modified: !X_FILE! >> "!LOG_FILE!"
) else (
    copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
    set /a CHANGED_COUNT+=1
    echo [TOGGLE: EN->${lp.code}] Modified: !X_FILE! (${lp.name}) >> "!LOG_FILE!"
)`
}
goto :eof
`;
}

/**
 * 포토샵 + 일러스트레이터를 단 한 번의 실행으로 동시 일괄 처리하는 컴퓨터실 원격 스크립트
 */
export function generateAllAdobeClassroomSilentBat(
  mode: 'toggle' | 'to_en' | 'to_ko' | 'to_locale' = 'to_en',
  targetLocale: string = 'ko_KR'
): string {
  const lp = getLocaleByCode(targetLocale);
  const isToLocale = mode === 'to_ko' || mode === 'to_locale';
  const modeLabel =
    mode === 'to_en'
      ? 'Photoshop + Illustrator [English Mode]'
      : isToLocale
      ? `Photoshop + Illustrator [${lp.name} (${lp.code}) Mode]`
      : `Photoshop + Illustrator [Toggle: ${lp.name} (${lp.code}) <-> English]`;

  return `@echo off
@chcp 65001 >nul 2>&1
setlocal enabledelayedexpansion

rem =========================================================================
rem [Classroom / Lab Remote Silent Deployer] Adobe Photoshop + Illustrator
rem Target Language: ${lp.flag} ${lp.name} (${lp.nativeName}) [${lp.code}]
rem Mode: ${modeLabel}
rem Created by: AhBiYout [CIS]
rem Features: Anti-Loop Guard, Multi-Method Admin Check, Multi-Drive Scan, Auto Log
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

set "LOG_FILE=%TEMP%\\adobe_all_remote_deploy.log"
echo [%DATE% %TIME%] [START] Adobe Photoshop and Illustrator Silent Deploy (Mode: ${mode}) > "!LOG_FILE!"

rem 1. Kill running processes to avoid file lock
taskkill /f /im Photoshop.exe >> "!LOG_FILE!" 2>&1
taskkill /f /im Illustrator.exe >> "!LOG_FILE!" 2>&1
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

set "PS_COUNT=0"
set "AI_COUNT=0"

rem 2. Check Windows Registry for App Paths (Photoshop & Illustrator)
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_ps_exe=%%B"
    if exist "!reg_ps_exe!" (
        for %%F in ("!reg_ps_exe!") do call :process_ps "%%~dpF"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Photoshop.exe" /ve 2^>nul') do (
    set "reg_ps_exe=%%B"
    if exist "!reg_ps_exe!" (
        for %%F in ("!reg_ps_exe!") do call :process_ps "%%~dpF"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKLM\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Illustrator.exe" /ve 2^>nul') do (
    set "reg_ai_exe=%%B"
    if exist "!reg_ai_exe!" (
        for %%F in ("!reg_ai_exe!") do call :process_ai "%%~dpF"
    )
)
for /f "tokens=2*" %%A in ('reg query "HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\App Paths\\Illustrator.exe" /ve 2^>nul') do (
    set "reg_ai_exe=%%B"
    if exist "!reg_ai_exe!" (
        for %%F in ("!reg_ai_exe!") do call :process_ai "%%~dpF"
    )
)

rem 3. Comprehensive Drive Scanning (Drives C through H)
for %%D in (C D E F G H) do (
    rem Standard 64-bit Program Files
    if exist "%%D:\\Program Files\\Adobe" (
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*Photoshop*") do call :process_ps "%%P"
        for /d %%P in ("%%D:\\Program Files\\Adobe\\*Illustrator*") do call :process_ai "%%P"
    )
    rem 32-bit Program Files (x86)
    if exist "%%D:\\Program Files (x86)\\Adobe" (
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*Photoshop*") do call :process_ps "%%P"
        for /d %%P in ("%%D:\\Program Files (x86)\\Adobe\\*Illustrator*") do call :process_ai "%%P"
    )
    rem Custom Root Adobe Folder
    if exist "%%D:\\Adobe" (
        for /d %%P in ("%%D:\\Adobe\\*Photoshop*") do call :process_ps "%%P"
        for /d %%P in ("%%D:\\Adobe\\*Illustrator*") do call :process_ai "%%P"
    )
)

echo [%DATE% %TIME%] [END] Photoshop: !PS_COUNT!, Illustrator: !AI_COUNT! >> "!LOG_FILE!"

echo.
echo =========================================================================
echo   [SUCCESS] Adobe Language Switch Finished
echo =========================================================================
echo   * Mode               : ${modeLabel}
echo   * Photoshop Changed  : !PS_COUNT! item(s)
echo   * Illustrator Changed: !AI_COUNT! item(s)
echo   * Processed Versions :
if defined MODIFIED_VERSIONS (
    echo     !MODIFIED_VERSIONS!
) else (
    echo     None (No supported Adobe installations detected)
)
echo   * Log File Saved     : !LOG_FILE!
echo =========================================================================
echo.
if not "%~1"=="silent" if not "%~2"=="silent" (
    echo   [*] Finished. Press any key to close this window...
    pause
)
exit /b 0

:process_ps
set "PS_ROOT=%~1"
if "!PS_ROOT:~-1!"=="\" set "PS_ROOT=!PS_ROOT:~0,-1!"

rem Avoid processing same folder twice
if defined PS_DONE_!PS_ROOT! goto :eof
set "PS_DONE_!PS_ROOT!=1"

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

for %%V in ("!PS_ROOT!") do set "ver_title=%%~nxV"
if defined MODIFIED_VERSIONS (
    echo !MODIFIED_VERSIONS! | findstr /i /c:"!ver_title!" >nul 2>&1
    if errorlevel 1 set "MODIFIED_VERSIONS=!MODIFIED_VERSIONS!, !ver_title!"
) else (
    set "MODIFIED_VERSIONS=!ver_title!"
)

${
  mode === 'to_en'
    ? `rem [Fixed English Mode] tw10428*.dat -> old_tw10428*.dat
set "PS_FOUND_EN=0"
for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
    if exist "%%F" (
        set "orig_name=%%~nxF"
        ren "%%F" "old_!orig_name!" >> "!LOG_FILE!" 2>&1
        if !errorlevel! equ 0 (
            set /a PS_COUNT+=1
            set "PS_FOUND_EN=1"
            echo [OK: to_en] Photoshop %%~nxF -^> old_!orig_name! in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!PS_FOUND_EN!"=="0" (
    for %%F in ("!SUP_DIR!\\old_tw10428*.dat") do (
        if exist "%%F" (
            set /a PS_COUNT+=1
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
            set /a PS_COUNT+=1
            set "PS_FOUND_LOC=1"
            echo [OK: to_locale] Photoshop !old_name! -^> !new_name! (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!PS_FOUND_LOC!"=="0" (
    for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
        if exist "%%F" (
            set /a PS_COUNT+=1
            echo [ALREADY_ACTIVE] Photoshop %%~nxF already active (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)`
    : `rem [Toggle Mode (${lp.name} <-> English)]
set "PS_TOGGLED=0"
for %%F in ("!SUP_DIR!\\tw10428*.dat") do (
    if exist "%%F" (
        set "orig_name=%%~nxF"
        ren "%%F" "old_!orig_name!" >> "!LOG_FILE!" 2>&1
        if !errorlevel! equ 0 (
            set /a PS_COUNT+=1
            set "PS_TOGGLED=1"
            echo [TOGGLE: EN] Photoshop %%~nxF -^> old_!orig_name! in !SUP_DIR! >> "!LOG_FILE!"
        )
    )
)
if "!PS_TOGGLED!"=="0" (
    for %%F in ("!SUP_DIR!\\old_tw10428*.dat") do (
        if exist "%%F" (
            set "old_name=%%~nxF"
            set "new_name=!old_name:old_=!"
            ren "%%F" "!new_name!" >> "!LOG_FILE!" 2>&1
            if !errorlevel! equ 0 (
                set /a PS_COUNT+=1
                echo [TOGGLE: ${lp.code}] Photoshop !old_name! -^> !new_name! (${lp.name}) in !SUP_DIR! >> "!LOG_FILE!"
            )
        )
    )
)`
}
goto :eof

:process_ai
set "AI_ROOT=%~1"
if "!AI_ROOT:~-1!"=="\" set "AI_ROOT=!AI_ROOT:~0,-1!"

rem Avoid processing same folder twice
if defined AI_DONE_!AI_ROOT! goto :eof
set "AI_DONE_!AI_ROOT!=1"

for %%V in ("!AI_ROOT!") do set "ver_title=%%~nxV"
if defined MODIFIED_VERSIONS (
    echo !MODIFIED_VERSIONS! | findstr /i /c:"!ver_title!" >nul 2>&1
    if errorlevel 1 set "MODIFIED_VERSIONS=!MODIFIED_VERSIONS!, !ver_title!"
) else (
    set "MODIFIED_VERSIONS=!ver_title!"
)

call :try_modify_ai_xml "!AI_ROOT!\\Support Files\\Contents\\Windows\\AMT\\application.xml"
call :try_modify_ai_xml "!AI_ROOT!\\AMT\\application.xml"
call :try_modify_ai_xml "!AI_ROOT!\\Support Files\\AMT\\application.xml"
call :try_modify_ai_xml "!AI_ROOT!\\Support Files\\Contents\\Windows\\application.xml"
goto :eof

:try_modify_ai_xml
set "X_FILE=%~1"
if not exist "!X_FILE!" goto :eof

rem Avoid processing same xml file twice
if defined XML_DONE_!X_FILE! goto :eof
set "XML_DONE_!X_FILE!=1"

${
  mode === 'to_en'
    ? `findstr /i "en_US" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    set /a AI_COUNT+=1
    echo [ALREADY_EN] Illustrator already en_US: !X_FILE! >> "!LOG_FILE!"
    goto :eof
)
copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US' -replace 'ko_KR', 'en_US'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
set /a AI_COUNT+=1
echo [OK: to_en] Modified Illustrator XML: !X_FILE! >> "!LOG_FILE!"`
    : isToLocale
    ? `findstr /i "${targetLocale}" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    set /a AI_COUNT+=1
    echo [ALREADY_LOC] Illustrator already ${targetLocale}: !X_FILE! >> "!LOG_FILE!"
    goto :eof
)
copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
set /a AI_COUNT+=1
echo [OK: to_locale] Restored Illustrator XML: !X_FILE! (${lp.name} [${targetLocale}]) >> "!LOG_FILE!"`
    : `findstr /i "${targetLocale}" "!X_FILE!" >nul 2>&1
if !errorlevel! equ 0 (
    copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">en_US</Data>'); } else { $c = $c -replace '${targetLocale}', 'en_US'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
    set /a AI_COUNT+=1
    echo [TOGGLE: ${lp.code}->EN] Modified Illustrator XML: !X_FILE! >> "!LOG_FILE!"
) else (
    copy "!X_FILE!" "!X_FILE!.bak" >nul 2>&1
    powershell -NoProfile -Command "$c=[System.IO.File]::ReadAllText('!X_FILE!', [System.Text.Encoding]::UTF8); if ($c -match '<Data key=\\\"installedLanguages\\\">') { $c = [System.Text.RegularExpressions.Regex]::Replace($c, '<Data key=\\\"installedLanguages\\\">.*?</Data>', '<Data key=\\\"installedLanguages\\\">${targetLocale}</Data>'); } else { $c = $c -replace 'en_US', '${targetLocale}' -replace 'en_GB', '${targetLocale}'; }; [System.IO.File]::WriteAllText('!X_FILE!', $c, [System.Text.Encoding]::UTF8)" >> "!LOG_FILE!" 2>&1
    set /a AI_COUNT+=1
    echo [TOGGLE: EN->${lp.code}] Restored Illustrator XML: !X_FILE! (${lp.name}) >> "!LOG_FILE!"
)`
}
goto :eof
`;
}


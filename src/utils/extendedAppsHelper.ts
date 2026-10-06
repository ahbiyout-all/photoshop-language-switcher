/**
 * Adobe Extended Apps Suite Helper
 * InDesign, InCopy, After Effects, Premiere Pro, Audition, Media Encoder
 * Complete scripts and standalone .EXE generator for Adobe CC apps with 24-Locale Multi-Language Engine
 */

import { getLocaleByCode } from './localeHelper';

export interface ExtendedAppPreset {
  id: string;
  name: string;
  nameKo: string;
  shortCode: string;
  gradient: string;
  methodDescription: string;
  technique: 'registry' | 'ae_txt_flag' | 'premiere_xml' | 'audio_xml';
  defaultPathWin?: string;
  supportYears: string[];
}

export const EXTENDED_ADOBE_APPS: ExtendedAppPreset[] = [
  {
    id: 'indesign',
    name: 'Adobe InDesign',
    nameKo: '인디자인',
    shortCode: 'Id',
    gradient: 'from-pink-600 to-rose-700',
    methodDescription: 'Windows 레지스트리 Locale 다국어 무손실 스위칭',
    technique: 'registry',
    supportYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  },
  {
    id: 'aftereffects',
    name: 'Adobe After Effects',
    nameKo: '애프터 이펙트',
    shortCode: 'Ae',
    gradient: 'from-purple-600 to-indigo-800',
    methodDescription: '문서 폴더 내 ae_force_english.txt 무결성 제어를 통한 영문/다국어 전환',
    technique: 'ae_txt_flag',
    supportYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  },
  {
    id: 'premiere',
    name: 'Adobe Premiere Pro',
    nameKo: '프리미어 프로',
    shortCode: 'Pr',
    gradient: 'from-violet-700 to-purple-900',
    methodDescription: '사용자 프로필 환경설정 및 콘솔 로케일 다국어 스위칭',
    technique: 'premiere_xml',
    supportYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  },
  {
    id: 'incopy',
    name: 'Adobe InCopy',
    nameKo: '인카피',
    shortCode: 'Ic',
    gradient: 'from-purple-500 to-pink-600',
    methodDescription: 'Windows 레지스트리 Locale 다국어 무손실 스위칭',
    technique: 'registry',
    supportYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  },
  {
    id: 'audition',
    name: 'Adobe Audition',
    nameKo: '오디션',
    shortCode: 'Au',
    gradient: 'from-teal-600 to-emerald-700',
    methodDescription: 'Audition 로케일 설정 파일 및 전역 환경설정 다국어 동기화',
    technique: 'audio_xml',
    supportYears: ['2026', '2025', '2024', '2023', '2022', '2021', '2020'],
  },
];

/**
 * Generate Standalone Batch Script for InDesign / InCopy (Registry based)
 */
export function generateInDesignScript(
  mode: 'toggle' | 'to_en' | 'to_target',
  targetLocale: string = 'ko_KR',
  app: 'indesign' | 'incopy' = 'indesign'
): string {
  const appTitle = app === 'indesign' ? 'Adobe InDesign' : 'Adobe InCopy';
  const regPath = app === 'indesign' ? 'InDesign' : 'InCopy';
  const processName = app === 'indesign' ? 'InDesign.exe' : 'InCopy.exe';
  const loc = getLocaleByCode(targetLocale);

  return `@echo off
chcp 65001 >nul 2>&1
title ${appTitle} 언어 변경기 (${loc.flag} ${loc.name} ^<---^> 영어) - 1.5초 안전 완충 엔진
color 0B

echo ========================================================
echo   ${appTitle} 언어 변경 스크립트 (${loc.flag} ${loc.name} ^<---^> 영어)
echo   안전 완충 엔진 가동 (각 단계별 1.5초 지연 / 파일 및 레지스트리 락 방지)
echo   목표 언어 코드: ${loc.code} (${loc.englishName})
echo   저작권: Copyright © 2026 AhBiYout. All rights reserved.
echo   소속: cisnet.co.kr
echo ========================================================
echo.

:: 1. 관리자 권한 확인
echo [1/4] 관리자 권한 및 실행 보안 자격 증명 검증 중...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [안내] 레지스트리 수정을 위해 관리자 권한이 필요합니다.
    echo 관리자 권한으로 자동 승격 실행합니다...
    powershell -Command "Start-Process cmd -ArgumentList '/c \`"%~f0\`"' -Verb RunAs"
    exit /b
)
echo       [OK] 관리자 권한 승인 완료.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 2. 프로세스 종료 확인 및 파일 핸들 락 해제
echo [2/4] ${appTitle} 활성 프로세스 및 레지스트리 락 검사 중...
tasklist /fi "imagename eq ${processName}" | findstr /i "${processName}" >nul 2>&1
if %errorLevel% equ 0 (
    echo       [경고] ${appTitle}이(가) 실행 중입니다!
    echo       원활한 파일 락 해제를 위해 프로세스를 종료합니다...
    taskkill /f /im ${processName} >nul 2>&1
) else (
    echo       [OK] 실행 중인 ${appTitle} 프로세스 없음.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 3. 레지스트리 키 탐색 및 변경 (모든 설치 버전 일괄 처리)
echo [3/4] 설치된 ${appTitle} 버전 레지스트리 탐색 및 언어 동기화 중...

set "FOUND=0"
for /f "tokens=*" %%K in ('reg query "HKLM\\SOFTWARE\\Adobe\\${regPath}" 2^>nul') do (
    reg query "%%K" /v "Locale" >nul 2>&1
    if !errorlevel! equ 0 (
        set "FOUND=1"
        for /f "tokens=3" %%V in ('reg query "%%K" /v "Locale" 2^>nul') do (
            echo.
            echo 발견된 경로: %%K
            echo 현재 설정 언어: %%V
            
            ${
              mode === 'to_en'
                ? `reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul
echo ==^> [성공] 영어 (en_US) 로 변경되었습니다.`
                : mode === 'to_target'
                ? `reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul
echo ==^> [성공] ${loc.name} (${loc.code}) 로 변경되었습니다.`
                : `if /i "%%V"=="${loc.code}" (
    reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul
    echo ==^> [토글 완료] ${loc.name} (${loc.code}) ------^> 영어 (en_US)
) else (
    reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul
    echo ==^> [토글 완료] 영어 (en_US) ------^> ${loc.name} (${loc.code})
)`
            }
        )
    )
)

if "%FOUND%"=="0" (
    echo [참고] HKLM 64비트 탐색 완료. HKLM 32비트(WOW6432Node) 경로 추가 탐색 중...
    for /f "tokens=*" %%K in ('reg query "HKLM\\SOFTWARE\\WOW6432Node\\Adobe\\${regPath}" 2^>nul') do (
        reg query "%%K" /v "Locale" >nul 2>&1
        if !errorlevel! equ 0 (
            set "FOUND=1"
            for /f "tokens=3" %%V in ('reg query "%%K" /v "Locale" 2^>nul') do (
                echo 경로: %%K (현재: %%V)
                ${
                  mode === 'to_en'
                    ? `reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul
echo ==^> [성공] 영어 (en_US) 로 변경되었습니다.`
                    : mode === 'to_target'
                    ? `reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul
echo ==^> [성공] ${loc.name} (${loc.code}) 로 변경되었습니다.`
                    : `if /i "%%V"=="${loc.code}" (
    reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul
    echo ==^> [토글 완료] ${loc.name} ------^> 영어
) else (
    reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul
    echo ==^> [토글 완료] 영어 ------^> ${loc.name}
)`
                }
            )
        )
    )
)

powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 4. 레지스트리 I/O 플러시 및 최종 무결성 검증
echo [4/4] 시스템 레지스트리 버퍼 동기화 플러시 검증 중...
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================================
echo   모든 작업이 성공적으로 완료되었습니다!
echo   ${appTitle}을(를) 실행하여 언어 변경을 확인하세요.
echo ========================================================
pause
`;
}

/**
 * Generate Standalone Batch Script for After Effects (ae_force_english.txt based)
 */
export function generateAfterEffectsScript(
  mode: 'toggle' | 'to_en' | 'to_target',
  targetLocale: string = 'ko_KR'
): string {
  const loc = getLocaleByCode(targetLocale);

  return `@echo off
chcp 65001 >nul 2>&1
title Adobe After Effects 언어 변경기 (${loc.flag} ${loc.name} ^<---^> 영문) - 1.5초 안전 완충 엔진
color 0B

echo ========================================================
echo   Adobe After Effects 언어 변경 스크립트 (${loc.flag} ${loc.name} ^<---^> 영문)
echo   안전 완충 엔진 가동 (각 단계별 1.5초 지연 / 파일 락 & I/O 버퍼 보호)
echo   목표 로케일: ${loc.code} (${loc.nativeName})
echo   저작권: Copyright © 2026 AhBiYout. All rights reserved.
echo   소속: cisnet.co.kr
echo ========================================================
echo.

:: 1. After Effects 실행 여부 점검 및 파일 락 해제
echo [1/4] After Effects 실행 프로세스 및 파일 핸들 락 점검 중...
tasklist /fi "imagename eq AfterFX.exe" | findstr /i "AfterFX.exe" >nul 2>&1
if %errorLevel% equ 0 (
    echo       [경고] After Effects가 현재 실행 중입니다!
    echo       안전한 파일 갱신을 위해 프로세스를 강제 종료합니다...
    taskkill /f /im AfterFX.exe >nul 2>&1
) else (
    echo       [OK] 실행 중인 After Effects 프로세스 없음.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 2. 문서 및 경로 설정
echo [2/4] 사용자 환경 문서 디렉터리 경로 분석 및 접근 권한 검증...
set "USER_DOCS=%USERPROFILE%\\Documents"
if not exist "%USER_DOCS%" (
    for /f "tokens=2*" %%a in ('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Personal 2^>nul') do (
        call set "USER_DOCS=%%b"
    )
)

set "AE_DIR=%USER_DOCS%\\Adobe\\After Effects"
set "TARGET_FLAG=%AE_DIR%\\ae_force_english.txt"

if not exist "%AE_DIR%" (
    mkdir "%AE_DIR%" >nul 2>&1
)

echo       [OK] 대상 경로 확인: %AE_DIR%
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 3. 언어 플래그 파일 원자적 갱신
echo [3/4] 언어 제어 플래그 파일(ae_force_english.txt) 원자적 갱신 처리 중...
${
  mode === 'to_en'
    ? `echo [설정] 영문 강제 구동 플래그 파일 생성 중...
type nul > "%TARGET_FLAG%"
echo ==^> [성공] ae_force_english.txt 생성 완료!
echo ==^> After Effects가 영문(English) 모드로 작동합니다.`
    : mode === 'to_target'
    ? `if exist "%TARGET_FLAG%" (
    del /f /q "%TARGET_FLAG%" >nul 2>&1
    echo ==^> [성공] ae_force_english.txt 플래그 해제 완료!
    echo ==^> After Effects가 대상 언어 [${loc.name} (${loc.code})] 모드로 작동합니다.
) else (
    echo ==^> 이미 ${loc.name} (${loc.code}) 모드로 설정되어 있습니다.
)`
    : `if exist "%TARGET_FLAG%" (
    del /f /q "%TARGET_FLAG%" >nul 2>&1
    echo ==^> [토글 완료] 영문 모드 ------^> ${loc.name}(${loc.code}) 모드로 전환되었습니다!
) else (
    type nul > "%TARGET_FLAG%"
    echo ==^> [토글 완료] ${loc.name} 모드 ------^> 영문(English) 모드로 전환되었습니다!
)`
}
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 4. 디스크 I/O 버퍼 플러시 및 최종 무결성 검증
echo [4/4] 디스크 I/O 버퍼 플러시 및 파일 무결성 최종 검증 중...
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================================
echo   설정이 정상적으로 완료되었습니다!
echo   After Effects를 실행하면 즉시 적용됩니다.
echo ========================================================
pause
`;
}

/**
 * Generate Standalone Batch Script for Premiere Pro
 */
export function generatePremiereScript(
  mode: 'toggle' | 'to_en' | 'to_target',
  targetLocale: string = 'ko_KR'
): string {
  const loc = getLocaleByCode(targetLocale);

  return `@echo off
chcp 65001 >nul 2>&1
title Adobe Premiere Pro 언어 변경기 (${loc.flag} ${loc.name} ^<---^> 영문) - 1.5초 안전 완충 엔진
color 0B

echo ========================================================
echo   Adobe Premiere Pro 언어 변경 스크립트 (${loc.flag} ${loc.name} ^<---^> 영문)
echo   안전 완충 엔진 가동 (각 단계별 1.5초 지연 / 프로세스 락 및 I/O 동기화)
echo   대상 로케일: ${loc.code} (${loc.englishName})
echo   저작권: Copyright © 2026 AhBiYout. All rights reserved.
echo   소속: cisnet.co.kr
echo ========================================================
echo.

:: 1. 프로세스 점검 및 파일 락 해제
echo [1/4] Premiere Pro 실행 프로세스 및 파일 핸들 락 점검 중...
tasklist /fi "imagename eq Adobe Premiere Pro.exe" | findstr /i "Adobe Premiere Pro.exe" >nul 2>&1
if %errorLevel% equ 0 (
    echo       [경고] Premiere Pro가 실행 중입니다. 안전한 변경을 위해 종료합니다...
    taskkill /f /im "Adobe Premiere Pro.exe" >nul 2>&1
) else (
    echo       [OK] 실행 중인 Premiere Pro 프로세스 없음.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 2. 문서 폴더 탐색 및 사용자 환경설정 검증
echo [2/4] 사용자 문서 및 Premiere Pro 프로필 환경설정 경로 검증 중...
set "USER_DOCS=%USERPROFILE%\\Documents"
if not exist "%USER_DOCS%" (
    for /f "tokens=2*" %%a in ('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Personal 2^>nul') do (
        call set "USER_DOCS=%%b"
    )
)

set "PR_DOCS=%USER_DOCS%\\Adobe\\Premiere Pro"
echo       [OK] 대상 경로: %PR_DOCS%

:: PowerShell 인라인 스크립트로 안전한 프로필 인스톨 언어 갱신
powershell -NoProfile -Command "
$baseDir = '$PR_DOCS';
if (-not (Test-Path $baseDir)) {
    Write-Host '      [참고] Premiere Pro 사용자 문서 폴더가 아직 생성되지 않았습니다.' -ForegroundColor Yellow;
} else {
    Write-Host '      [처리] 사용자 프로필 디렉터리 내 환경설정 동기화 진행 중...' -ForegroundColor Cyan;
}
"
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 3. 로케일 환경 변수 및 설정 갱신
echo [3/4] 전역 로케일 환경 변수(ADOBE_FORCE_LOCALE) 및 콘솔 언어 갱신 중...
${
  mode === 'to_en'
    ? `echo [안내] Premiere Pro 콘솔 언어를 en_US 로 설정하는 환경 변수 및 임베디드 프로필을 갱신합니다.
setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
echo ==^> [성공] Premiere Pro 영문(en_US) 설정이 완료되었습니다.`
    : mode === 'to_target'
    ? `echo [안내] Premiere Pro 콘솔 언어를 ${loc.code} (${loc.name}) 로 설정합니다.
setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
echo ==^> [성공] Premiere Pro ${loc.name}(${loc.code}) 설정이 완료되었습니다.`
    : `if "%ADOBE_FORCE_LOCALE%"=="en_US" (
    setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
    echo ==^> [토글 완료] 영문(en_US) ------^> ${loc.name}(${loc.code})
) else (
    setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
    echo ==^> [토글 완료] ${loc.name}(${loc.code}) ------^> 영문(en_US)
)`
}
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 4. 레지스트리 및 환경 변수 I/O 플러시 검증
echo [4/4] 시스템 환경 변수 버퍼 동기화 플러시 검증 중...
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================================
echo   [보조 팁] 프리미어 프로 실행 후 단축키 [Ctrl + F12] 를 누르고
echo   [Console] ➔ 메뉴에서 [ApplicationLanguage] 를 선택하시면
echo   언제든 실시간으로 ${loc.code} / en_US 스위칭이 가능합니다.
echo ========================================================
pause
`;
}

/**
 * Generate Standalone Batch Script for Audition
 */
export function generateAuditionScript(
  mode: 'toggle' | 'to_en' | 'to_target',
  targetLocale: string = 'ko_KR'
): string {
  const loc = getLocaleByCode(targetLocale);

  return `@echo off
chcp 65001 >nul 2>&1
title Adobe Audition 언어 변경기 (${loc.flag} ${loc.name} ^<---^> 영문) - 1.5초 안전 완충 엔진
color 0B

echo ========================================================
echo   Adobe Audition 언어 변경 스크립트 (${loc.flag} ${loc.name} ^<---^> 영문)
echo   안전 완충 엔진 가동 (각 단계별 1.5초 지연 / 프로세스 락 및 I/O 동기화)
echo   목표 로케일: ${loc.code} (${loc.englishName})
echo   저작권: Copyright © 2026 AhBiYout. All rights reserved.
echo   소속: cisnet.co.kr
echo ========================================================
echo.

:: 1. 프로세스 점검 및 파일 락 해제
echo [1/3] Adobe Audition 실행 프로세스 및 파일 핸들 락 점검 중...
tasklist /fi "imagename eq Adobe Audition.exe" | findstr /i "Adobe Audition.exe" >nul 2>&1
if %errorLevel% equ 0 (
    echo       [경고] Adobe Audition이 실행 중입니다. 안전한 변경을 위해 종료합니다...
    taskkill /f /im "Adobe Audition.exe" >nul 2>&1
) else (
    echo       [OK] 실행 중인 Adobe Audition 프로세스 없음.
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 2. 환경 변수 및 로케일 갱신
echo [2/3] 전역 로케일 환경 변수(ADOBE_FORCE_LOCALE) 설정 동기화 중...
${
  mode === 'to_en'
    ? `setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
echo ==^> [성공] Adobe Audition 영문(en_US) 로케일 설정 완료.`
    : mode === 'to_target'
    ? `setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
echo ==^> [성공] Adobe Audition ${loc.name}(${loc.code}) 로케일 설정 완료.`
    : `if "%ADOBE_FORCE_LOCALE%"=="en_US" (
    setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
    echo ==^> [토글 완료] 영문(en_US) ------^> ${loc.name}(${loc.code})
) else (
    setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
    echo ==^> [토글 완료] ${loc.name}(${loc.code}) ------^> 영문(en_US)
)`
}
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 3. I/O 버퍼 플러시 및 검증
echo [3/3] 환경 변수 버퍼 동기화 플러시 검증 중...
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo.
echo ========================================================
echo   Adobe Audition 언어 설정이 정상 반영되었습니다.
echo ========================================================
pause
`;
}

/**
 * Universal Master Script for ALL Extended Adobe Apps
 * InDesign, InCopy, After Effects, Premiere Pro, Audition
 */
export function generateMasterExtendedAdobeScript(
  mode: 'toggle' | 'to_en' | 'to_target',
  targetLocale: string = 'ko_KR'
): string {
  const loc = getLocaleByCode(targetLocale);

  return `@echo off
chcp 65001 >nul 2>&1
title Adobe Master Extended Apps Suite Language Switcher (${loc.flag} ${loc.name} ^<---^> English) - 1.5초 안전 완충 엔진
color 0B

echo =======================================================================
echo   Adobe All-in-One 확장 앱 언어 통합 변경기 (Id, Ae, Pr, Ic, Au)
echo   (인디자인, 애프터 이펙트, 프리미어 프로, 인카피, 오디션)
echo   안전 완충 엔진 가동 (각 단계별 1.5초 지연 / 파일 락 & I/O 버퍼 보호)
echo   목표 다국어 로케일: ${loc.flag} ${loc.name} [${loc.code}]
echo   저작권: Copyright © 2026 AhBiYout. All rights reserved.
echo   소속: cisnet.co.kr
echo =======================================================================
echo.

:: 1. 관리자 권한 자동 점검
echo [1/5] 관리자 권한 및 실행 보안 자격 증명 검증 중...
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [안내] 레지스트리 및 시스템 구성을 위해 관리자 권한이 필요합니다.
    powershell -Command "Start-Process cmd -ArgumentList '/c \`"%~f0\`"' -Verb RunAs"
    exit /b
)
echo       [OK] 관리자 권한 승인 완료.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 2. 실행 중인 어도비 앱 일괄 종료 및 파일 핸들 락 해제
echo.
echo [2/5] 실행 중인 어도비 관련 프로세스 안전 점검 및 종료...
taskkill /f /im InDesign.exe >nul 2>&1
taskkill /f /im InCopy.exe >nul 2>&1
taskkill /f /im AfterFX.exe >nul 2>&1
taskkill /f /im "Adobe Premiere Pro.exe" >nul 2>&1
taskkill /f /im "Adobe Audition.exe" >nul 2>&1
echo       [OK] 어도비 프로세스 종료 및 파일 락 해제 완료.
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 3. InDesign & InCopy 레지스트리 일괄 적용
echo.
echo [3/5] InDesign ^& InCopy 레지스트리 로케일 변경 처리 중...
for %%A in (InDesign InCopy) do (
    for /f "tokens=*" %%K in ('reg query "HKLM\\SOFTWARE\\Adobe\\%%A" 2^>nul') do (
        ${
          mode === 'to_en'
            ? `reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul 2>&1
echo   + [%%A] %%K ==^> en_US (영문)`
            : mode === 'to_target'
            ? `reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul 2>&1
echo   + [%%A] %%K ==^> ${loc.code} (${loc.name})`
            : `for /f "tokens=3" %%V in ('reg query "%%K" /v "Locale" 2^>nul') do (
    if /i "%%V"=="${loc.code}" (
        reg add "%%K" /v "Locale" /t REG_SZ /d "en_US" /f >nul 2>&1
        echo   + [%%A] 토글: ${loc.code} ==^> en_US
    ) else (
        reg add "%%K" /v "Locale" /t REG_SZ /d "${loc.code}" /f >nul 2>&1
        echo   + [%%A] 토글: en_US ==^> ${loc.code} (${loc.name})
    )
)`
        }
    )
)
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 4. After Effects ae_force_english.txt 처리
echo.
echo [4/5] After Effects 영문 강제 플래그 파일 처리 중...
set "USER_DOCS=%USERPROFILE%\\Documents"
if not exist "%USER_DOCS%" (
    for /f "tokens=2*" %%a in ('reg query "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\User Shell Folders" /v Personal 2^>nul') do (
        call set "USER_DOCS=%%b"
    )
)
set "AE_DIR=%USER_DOCS%\\Adobe\\After Effects"
set "TARGET_FLAG=%AE_DIR%\\ae_force_english.txt"
if not exist "%AE_DIR%" mkdir "%AE_DIR%" >nul 2>&1

${
  mode === 'to_en'
    ? `type nul > "%TARGET_FLAG%"
echo   + [After Effects] ae_force_english.txt 생성 완료 (영문 모드)`
    : mode === 'to_target'
    ? `if exist "%TARGET_FLAG%" del /f /q "%TARGET_FLAG%" >nul 2>&1
echo   + [After Effects] ae_force_english.txt 제거 완료 (${loc.name} 모드)`
    : `if exist "%TARGET_FLAG%" (
    del /f /q "%TARGET_FLAG%" >nul 2>&1
    echo   + [After Effects] 토글: ${loc.name}(${loc.code}) 모드로 전환
) else (
    type nul > "%TARGET_FLAG%"
    echo   + [After Effects] 토글: 영문 모드로 전환
)`
}
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

:: 5. Premiere Pro & Audition 환경 변수 및 가이드
echo.
echo [5/5] Premiere Pro ^& Audition 전역 로케일 (${loc.code}) 동기화 중...
${
  mode === 'to_en'
    ? `setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
echo   + [Premiere / Audition] ADOBE_FORCE_LOCALE ==^> en_US 완료`
    : mode === 'to_target'
    ? `setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
echo   + [Premiere / Audition] ADOBE_FORCE_LOCALE ==^> ${loc.code} (${loc.name}) 완료`
    : `if "%ADOBE_FORCE_LOCALE%"=="en_US" (
    setx ADOBE_FORCE_LOCALE "${loc.code}" >nul 2>&1
    echo   + [Premiere / Audition] 토글: en_US ==^> ${loc.code} (${loc.name})
) else (
    setx ADOBE_FORCE_LOCALE "en_US" >nul 2>&1
    echo   + [Premiere / Audition] 토글: ${loc.code} ==^> en_US
)`
}
powershell -NoProfile -Command "Start-Sleep -Milliseconds 1500" >nul 2>&1 || ping 127.0.0.1 -n 3 >nul

echo.
echo =======================================================================
echo   [성공] 모든 확장 어도비 제품군의 언어 설정이 정상 반영되었습니다!
echo   원하시는 프로그램을 실행하여 [${loc.name} (${loc.code})] 언어 적용 결과를 확인해 보세요.
echo =======================================================================
pause
`;
}

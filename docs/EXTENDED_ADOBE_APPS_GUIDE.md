# 어도비 확장 제품군 24개국 다국어 언어 변경 가이드 (Extended Adobe Apps Multi-Language Guide)

본 문서는 Adobe Photoshop 및 Illustrator 외에, **자체 환경설정 메뉴에서 언어 변경 옵션을 제공하지 않아 외부 레지스트리 또는 플래그 파일 제어가 필요한 주요 어도비 애플리케이션들(InDesign, InCopy, After Effects, Premiere Pro, Audition)**의 전 세계 24개국 다국어 변경 메커니즘과 스크립트 사용법을 설명합니다.

---

## 1. 지원 대상 애플리케이션 및 다국어 변경 메커니즘

| 애플리케이션 | 대상 플랫폼 | 핵심 제어 원리 | 지원 언어 | 안전도 |
| :--- | :--- | :--- | :--- | :--- |
| **Adobe InDesign (인디자인)** | Windows 64-bit | `HKLM\SOFTWARE\Adobe\InDesign` 레지스트리의 `Locale` 키 | 전 세계 24개국 | 100% 무손실 |
| **Adobe InCopy (인카피)** | Windows 64-bit | `HKLM\SOFTWARE\Adobe\InCopy` 레지스트리의 `Locale` 키 | 전 세계 24개국 | 100% 무손실 |
| **Adobe After Effects (애프터 이펙트)** | Windows / macOS | `%USERPROFILE%\Documents\Adobe\After Effects\ae_force_english.txt` 파일 생성/제거 | 영문 ⇄ 대상국 언어 | 100% 무손실 |
| **Adobe Premiere Pro (프리미어 프로)** | Windows 64-bit | `ADOBE_FORCE_LOCALE` 환경 변수 동기화 및 `Ctrl+F12` Console 전환 | 전 세계 24개국 | 100% 무손실 |
| **Adobe Audition (오디션)** | Windows 64-bit | Audition 로케일 프로필 및 `ADOBE_FORCE_LOCALE` 동기화 | 전 세계 24개국 | 100% 무손실 |

---

## 2. 세부 작동 원리 및 24개국 다국어 지원

### 1) Adobe InDesign & InCopy
- **원리**: 인디자인과 인카피는 프로그램 내부 메뉴에 언어 변경 항목이 없습니다. 설치된 언어팩 환경에서 Windows 레지스트리의 `Locale` 문자열 값에 따라 UI 언어가 결정됩니다.
- **레지스트리 위치**:
  - `HKEY_LOCAL_MACHINE\SOFTWARE\Adobe\InDesign\[버전]`
  - `HKEY_LOCAL_MACHINE\SOFTWARE\Adobe\InCopy\[버전]`
- **스크립트 동작**:
  - 24개국 언어 코드(`ko_KR`, `ja_JP`, `zh_CN`, `zh_TW`, `de_DE`, `fr_FR`, `es_ES`, `it_IT`, `ru_RU`, `pt_BR` 등)를 레지스트리에 주입하여 목표 언어로 즉시 전환하거나 영어(`en_US`)와 스마트 토글합니다.

### 2) Adobe After Effects
- **원리**: 애프터 이펙트는 사용자의 문서 디렉터리 내에 `ae_force_english.txt` 파일이 존재하는지 여부를 시작 시 감지합니다.
- **파일 경로**:
  - `%USERPROFILE%\Documents\Adobe\After Effects\ae_force_english.txt`
- **스크립트 동작**:
  - **영문 모드**: 빈 `ae_force_english.txt` 파일을 자동 생성합니다.
  - **대상 언어 모드**: 해당 플래그 파일을 삭제하여 원래 설치된 기본 언어(또는 시스템 로케일)로 복원합니다.
  - **스마트 토글**: 파일 존재 유무에 따라 영문과 대상 언어를 즉시 상호 전환합니다.

### 3) Adobe Premiere Pro & Audition
- **원리**: 프리미어 프로와 오디션은 시스템 전역 로케일 변수(`ADOBE_FORCE_LOCALE`) 및 자체 콘솔 디버그 모드(`Ctrl + F12` ➔ Console ➔ ApplicationLanguage)를 지원합니다.
- **스크립트 동작**:
  - 백그라운드 프로세스를 안전하게 종료 후 `setx ADOBE_FORCE_LOCALE "[목표언어코드]"`를 실행하여 원하는 언어로 즉시 환경을 조성합니다.

---

## 3. 원클릭 실행 및 .EXE 컴파일 지원
웹 애플리케이션의 **[추가 어도비 핵심 앱 전용 언어 변경기]** 섹션에서:
1. **1단계**: 상단 칩 및 드롭다운에서 목표로 하는 국가/언어(한국어, 일본어, 중국어, 독일어, 프랑스어 등 24개국)를 선택합니다.
2. **2단계**: 변경하고자 하는 앱(또는 전체 통합 ALL)을 클릭합니다.
3. **모드 선택**: `스마트 토글`, `영어 고정`, `[선택 언어] 전환` 중 원하는 동작을 선택합니다.
4. **다운로드**: **`1-Click .EXE 컴파일러 받기`** 또는 `.BAT`를 누르면, 공식 속성 [자세히] 탭 메타데이터(`cisnet.co.kr`, `Copyright © 2026 AhBiYout`)가 포함된 독립 실행형 스크립트를 즉시 내려받을 수 있습니다.

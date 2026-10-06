# 모듈 및 스탠드얼론 아키텍처 명세서 (Module & DLL Specification)

- **문서 버전:** v1.0.0 (앱 버전 v2.9.0 기준)
- **대상 모듈:** Adobe Language Switcher Standalone Engine & PE Resource Injector
- **개발사 / 소속:** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS) | AhBiYout
- **저장소:** [https://github.com/ahbiyout/photoshop-language-switcher](https://github.com/ahbiyout/photoshop-language-switcher)

---

## 1. 모듈 아키텍처 개요
본 프로젝트는 웹 기반 정적 애플리케이션의 한계(로컬 파일 시스템 임의 변경 불가, 시스템 관리자 권한 획득 불가)를 극복하기 위해, **Windows 네이티브 스탠드얼론 모듈 및 순수 창작 PE 래퍼 바이너리 컴파일 아키텍처**를 채택하고 있습니다.

Adobe 사의 상용 DLL이나 내부 바이너리에 대한 의존성을 100% 배제하고, Windows 표준 API와 Microsoft .NET Core Framework 내장 컴파일러(`csc.exe`)만을 사용하여 순수 창작된 독립 바이너리를 조립합니다.

```
┌────────────────────────────────────────────────────────┐
│               Web Frontend UI (React 19)               │
│   (User Configuration / Locale Selection / i18n)       │
└───────────────────────────┬────────────────────────────┘
                            │ Download / Export
┌───────────────────────────▼────────────────────────────┐
│          Standalone Hybrid Packaging Pipeline          │
│  - PE Version Resource Metadata (VS_VERSION_INFO)      │
│  - 32-bit ARGB High-Res Globe Icon (.ICO) Embedding    │
│  - Pure C# Bootstrap Runner Source Code Generation     │
│  - Inno Setup 6 Silent & Secured Distribution Module   │
└───────────────────────────┬────────────────────────────┘
                            │ Compilation
┌───────────────────────────▼────────────────────────────┐
│      Native Standalone 64-bit Binary (.EXE / DLL)      │
│  - Auto-Elevated UAC Execution Context                 │
│  - Registry & XML Manipulation Subsystem               │
│  - Atomic File Toggle Engine (Safe Backup & Rollback)  │
└────────────────────────────────────────────────────────┘
```

---

## 2. 세부 컴포넌트 명세

### 2.1. C# 부트스트랩 엔진 (`csc.exe` 자동 생성 모듈)
- **역할:** Windows 관리자 권한을 자동으로 요청(`System.Diagnostics.ProcessStartInfo { Verb = "runas" }`)하고, 내장된 배치 스크립트 페이로드를 임시 메모리 및 격리된 보안 환경에서 실행.
- **PE 메타데이터 임베딩 (Assembly Attributes):**
  - `[assembly: AssemblyTitle("Adobe Language Switcher")]`
  - `[assembly: AssemblyCompany("cisnet.co.kr")]`
  - `[assembly: AssemblyProduct("Adobe Language Switcher Suite")]`
  - `[assembly: AssemblyCopyright("Copyright © 2026 AhBiYout. All rights reserved.")]`
  - `[assembly: AssemblyTrademark("Official Core Engine: cisnet.co.kr | AhBiYout")]`
  - `[assembly: AssemblyFileVersion("2.9.0.0")]`
  - `[assembly: AssemblyInformationalVersion("v2.9.0")]`

### 2.2. 리소스 임베딩 서브시스템 (Embedded Resources)
- **아이콘 리소스 (RT_ICON / RT_GROUP_ICON):**
  - 포맷: Windows 32-bit ARGB 다중 해상도 아이콘 (16x16, 32x32, 48x48)
  - 인코딩: 64자 표준 분할 Base64 블록 (`::BEGIN_ICON` ~ `::END_ICON`)
  - 컴파일 플래그: `/win32icon:"%TEMP_ICO%"`
- **문자열 인코딩 지원:**
  - `/codepage:65001` (UTF-8) 전면 적용으로 한국어 및 다국어 메타데이터의 왜곡 방지.

### 2.3. 파일 조작 및 안전 롤백 엔진
- **포토샵 모듈:**
  - 대상: `[Photoshop_Path]\Locales\[Locale]\Support Files\tw10428.dat`
  - 상태 A (모국어): `tw10428.dat` 존재
  - 상태 B (영어): `tw10428.dat.bak` 존재
  - 복원 보장: 초기 실행 시 `tw10428.dat.original.bak` 영구 보존.
- **일러스트레이터 모듈:**
  - 대상: `[Illustrator_Path]\Support Files\Contents\Windows\AMT\application.xml`
  - 노드: `<Data key="installedLanguages">ko_KR</Data>` ⇄ `en_US`
  - 무결성: XML 파싱 및 치환 전 타임스탬프 기반 백업 생성.
- **확장 앱 모듈 (InDesign, After Effects, Premiere Pro):**
  - InDesign/InCopy: `HKLM\SOFTWARE\Adobe\InDesign\Locale` 및 사용자 레지스트리 안전 기록.
  - After Effects: `%USERPROFILE%\Documents\ae_force_english.txt` 플래그 관리.
  - Premiere Pro: `ADOBE_FORCE_LOCALE` 환경 변수 동기화.

---

## 3. Inno Setup 패키징 모듈 인터페이스
- **모듈명:** `Adobe_Language_Switcher_Setup_v2.9.0.exe`
- **사일런트(무인) 설치 스위치:**
  - `/VERYSILENT /SUPPRESSMSGBOXES /NORESTART`
- **방화벽 인바운드 규칙 등록 API:**
  - `netsh.exe advfirewall firewall add rule name="Adobe Language Switcher Suite" dir=in action=allow program="..." enable=yes`
- **버전 감지 및 기존 버전 덮어쓰기 로직:**
  - 레지스트리 `Uninstall\{AppId}_is1` 검사 후 버전 비교 안내 대화상자 노출.

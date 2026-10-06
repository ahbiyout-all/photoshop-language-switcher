# 자동 빌드 스크립트 가이드 (Automated Build Pipeline Guide)

본 문서는 **포토샵 & 일러스트레이터 다국어 언어 변경기**의 Windows 자동 빌드 파이프라인(`build.bat`)의 구조, 동작 원리, 실행 방법 및 버전 동기화 규칙을 설명합니다.

---

## 1. ⚙️ 빌드 스크립트 명세 (`build.bat`)

프로젝트 루트의 `build.bat`는 Windows 환경에서 웹 SPA 번들과 독립 실행형 Windows 64비트 바이너리(`.exe`)를 원클릭으로 컴파일하는 표준 빌드 파이프라인입니다.

| 항목 | 규격 및 사양 |
| :--- | :--- |
| **파일 경로** | `build.bat` (프로젝트 루트) |
| **인코딩** | **Windows CRLF (`\r\n`)**, ASCII/UTF-8 호환 |
| **언어** | **100% 영문(English)** 터미널 출력 및 주석 |
| **버전 추출** | `package.json`의 `"version"` 필드에서 자동 추출 (PowerShell / Node.js fallback) |
| **결과물 네이밍** | 컴파일 결과물 파일명 끝에 자동으로 패치 버전 결합<br>• `release\Photoshop_Language_Switcher_v[VERSION].exe`<br>• `release\Adobe_Language_Switcher_Suite_v[VERSION].exe`<br>• `release\Photoshop_Language_Switcher_v[VERSION].bat` |
| **PE 메타데이터** | Windows 탐색기 [속성] -> [자세히] 탭 공식 메타데이터 및 버전 자동 주입 (`cisnet.co.kr`, `AhBiYout`) |

---

## 2. 🚀 실행 방법

### 방법 A: 탐색기에서 더블 클릭 (가장 간편함)
1. 프로젝트 폴더에서 **`build.bat`** 파일을 마우스로 더블 클릭합니다.
2. 스크립트가 실행되어 환경 검사, 웹 번들링, C# .exe 컴파일을 순차적으로 수행합니다.
3. 빌드가 끝나면 결과물 위치가 출력되며 창이 닫히지 않고 대기(`pause`)합니다.

### 방법 B: 명령 프롬프트(CMD) 또는 PowerShell에서 실행
```cmd
# 프로젝트 루트 디렉터리에서 실행
build.bat
```
또는 npm 스크립트를 통해 실행:
```bash
npm run build:bat
```

---

## 3. 🔄 5단계 빌드 파이프라인 단계별 동작

1. **Step 1: 환경 사전 점검 (Prerequisites Check)**
   - Node.js 및 npm 설치 여부를 점검합니다.
2. **Step 2: 동적 버전 추출 (Dynamic Version Extraction)**
   - `package.json`의 `"version"`을 읽어와 `APP_VERSION` 및 `APP_VERSION_TAG` (예: `v2.5.2`) 변수에 할당합니다.
3. **Step 3: 웹 프론트엔드 컴파일 (Web SPA Compilation)**
   - `npm run build`를 실행하여 정적 웹 자산을 `dist/` 폴더에 빌드합니다. (필요 시 `npm install` 선행 실행)
4. **Step 4: .NET C# 컴파일러 탐색 (Compiler Detection)**
   - Windows에 기본 내장된 Microsoft .NET Framework C# 컴파일러(`csc.exe`) 경로를 탐색합니다.
5. **Step 5: 버전 번호가 결합된 .EXE 컴파일 및 릴리스 패키징**
   - PE 속성, 관리자 권한 자동 승격(UAC), 콘솔 스위칭 로직이 내장된 C# 소스를 컴파일하여 `release/` 폴더에 버전 태그가 붙은 `.exe` 파일을 생성합니다.

---

## 4. 📌 버전 동기화 규칙 (Version Synchronization Rule)

문서 업데이트 및 패치노트 작성 후 소프트웨어 버전이 변경될 때마다 다음 파일들이 일관되게 동기화됩니다:

```
[버전 관리 단일 진실 공급원 (Single Source of Truth)]
           ┌──────────────────────┐
           │     package.json     │  <-- "version": "2.5.2"
           └──────────┬───────────┘
                      │
       ┌──────────────┴──────────────┐
       ▼                             ▼
┌──────────────┐             ┌──────────────┐
│src/version.ts│             │  build.bat   │
└──────┬───────┘             └──────┬───────┘
       │                             │
       ▼                             ▼
[앱 화면 전체]                 [빌드 결과물 파일명]
• Header 상단 배지 (v2.5.2)    • release/Photoshop_Language_Switcher_v2.5.2.exe
• Desktop Window Bar          • release/Adobe_Language_Switcher_Suite_v2.5.2.exe
• Extended Apps Suite 배지     • release/Photoshop_Language_Switcher_v2.5.2.bat
• 스크립트 출력문 배너
```

1. **`package.json`**: `"version": "X.Y.Z"` 갱신
2. **`src/version.ts`**: `APP_VERSION = 'X.Y.Z'` 갱신 (앱 화면 전체에 자동 반영)
3. **`build.bat`**: 빌드 실행 시 결과물 파일명에 자동으로 `vX.Y.Z` 결합
4. **`docs/PATCH_NOTES.md`**: 신규 버전 릴리스 내역 기록

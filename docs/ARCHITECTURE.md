# 시스템 아키텍처 및 동작 규칙 사양 (System Architecture)

본 문서는 포토샵 언어 변경기 애플리케이션의 내부 구조, 폴더 자동 감지 규칙, 파일 시스템 제어 매커니즘을 정의합니다.

## 1. 개요 및 설계 원칙

어도비 포토샵(Adobe Photoshop) 한국어 버전은 설치 디렉터리 내 로케일 데이터 파일(`.dat`)을 참조하여 한국어 UI 리소스를 렌더링합니다. 
해당 파일명이 변경되거나 누락되면 포토샵 내부 엔진은 자체 내장된 기본 언어인 **영어(English)**로 UI를 표시하는 특성을 가집니다.

- **원형 파일명**: `tw10428_Photoshop_ko_KR.dat` (최신 공통) / `tw10428.dat` (CS6)
- **영어 전환 파일명**: `old_tw10428_Photoshop_ko_KR.dat` / `old_tw10428.dat`
- **핵심 원칙**: 무손실 보존 (파일 삭제 ❌, 이름 리네임 토글 ⭕)

---

## 2. 폴더 자동 감지 규칙 (Folder Detection Rules)

### Windows 표준 경로 패턴
```
[드라이브 문자]:\Program Files\Adobe\[포토샵 버전 폴더명]\Locales\ko_KR\Support Files
```

### 버전별 프리셋 매핑 테이블

| 버전 ID | 표시 명칭 | 설치 폴더명 (`Adobe/...`) | 기본 대상 파일명 |
| :--- | :--- | :--- | :--- |
| `ps2026` | Photoshop 2026 | `Adobe Photoshop 2026` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2025` | Photoshop 2025 | `Adobe Photoshop 2025` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2024` | Photoshop 2024 | `Adobe Photoshop 2024` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2023` | Photoshop 2023 | `Adobe Photoshop 2023` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2022` | Photoshop 2022 | `Adobe Photoshop 2022` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2021` | Photoshop 2021 | `Adobe Photoshop 2021` | `tw10428_Photoshop_ko_KR.dat` |
| `ps2020` | Photoshop 2020 | `Adobe Photoshop 2020` | `tw10428_Photoshop_ko_KR.dat` |
| `ps_cc2019` | Photoshop CC 2019 | `Adobe Photoshop CC 2019` | `tw10428_Photoshop_ko_KR.dat` |
| `ps_cc2018` | Photoshop CC 2018 | `Adobe Photoshop CC 2018` | `tw10428_Photoshop_ko_KR.dat` |
| `ps_cs6` | Photoshop CS6 (64 Bit) | `Adobe Photoshop CS6 (64 Bit)` | `tw10428.dat` |

### macOS 표준 경로 패턴
```
/Applications/[포토샵 버전 폴더명]/Locales/ko_KR/Support Files
```

---

## 3. 사용자 지정 경로 지원 메커니즘 (Custom Path Resolution)

사용자가 기본 C 드라이브 Program Files가 아닌 D: 드라이브, 외장 SSD, 휴대용 경로 등에 포토샵을 설치한 경우:
1. `isCustomPath: true` 상태 플래그로 전환
2. 사용자가 입력한 경로의 앞뒤 따옴표 및 공백 자동 트리밍
3. 사용자가 지정한 DAT 파일명(기본값 `tw10428_Photoshop_ko_KR.dat`)을 기준으로 스크립트 및 파일 시스템 API 제어 타깃을 동적 재바인딩

---

## 4. 실행 방식 멀티 트랙 아키텍처 (Multi-Track Architecture)

### 트랙 1: 브라우저 File System Access API
- `window.showDirectoryPicker()`로 Support Files 폴더 핸들 획득
- `entries()` 탐색으로 한글 파일 및 영문(`old_`) 파일 실시간 파악
- 브라우저 상에서 즉시 `move()` 또는 복사-삭제 파이프라인을 통해 원클릭 즉각 변경

### 트랙 2: Windows .EXE 단독 실행 파일 자동 빌더 (IExpress 컴파일러 엔진)
- Windows 기본 내장 컴파일 도구인 `iexpress.exe`를 구동하는 전용 빌더 배치 스크립트 생성
- 임시 디렉터리(`%TEMP%`)에 지시자 파일(`iexpress.sed`) 및 패키징 스크립트를 생성한 뒤, `iexpress /n /q iexpress.sed`를 무음 백그라운드로 실행
- 별도 컴파일러(GCC, Visual Studio 등)나 타사 소프트웨어 설치 없이 순수 Windows 내장 기능만으로 바탕화면에 단독 실행 파일(`Photoshop_Language_Toggle.exe`) 영구 산출

### 트랙 3: VBScript 무음 GUI 런처 및 바탕화면 바로가기
- **VBScript GUI (`.vbs`)**: Windows 내장 스크립트 호스트(`wscript.exe`)를 통해 검은색 CMD 콘솔 창 없이 백그라운드 파일명 토글 수행 후 Windows 네이티브 `MsgBox` 알림 출력
- **바탕화면 바로가기 (`.lnk`)**: `WScript.Shell`의 `CreateShortcut` 인터페이스를 배치 파일에서 자동 호출하여 바탕화면에 1-클릭 실행 아이콘 즉시 등록

### 트랙 4: 독립형 스크립트 생성기 (Batch, PowerShell, Bash)
- 웹 브라우저 환경에 구애받지 않고 데스크톱에서 직접 실행 가능한 `.bat`, `.ps1`, `.sh` 실시간 코드 생성
- **관리자 권한 자동 획득 (UAC Self-Elevation)**:
  - 배치 파일 최초 실행 시 `net session` 명령어로 관리자 권한 소유 여부를 검사
  - 일반 권한으로 실행된 경우 `powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"`를 통해 사용자의 UAC 승인 팝업을 자동 호출하여 관리자 권한으로 승격 재실행
- **Windows CRLF (`\r\n`) 개행 표준 준수**:
  - 브라우저 다운로드 파이프라인에서 텍스트 줄바꿈을 Windows 표준 개행인 `\r\n`으로 강제 정규화
- **UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) 인코딩 파이프라인**:
  - 파일 바이너리 헤더에 UTF-8 BOM을 삽입하여 다운로드 제공
  - 한글 윈도우 환경(기본 ANSI/CP949)의 `cmd.exe` 및 메모장이 UTF-8임을 즉시 인식하여, 스크립트 실행 전후 및 콘솔 출력 시 한글 깨짐을 원천 방지
  - 콘솔 코드페이지 `chcp 65001 >nul`을 최상단에 배치하여 유니코드 렌더링 보장

### 트랙 5: 단독 데스크톱 앱 런타임 (PWA Standalone Mode)
- `vite-plugin-pwa` 및 W3C Web App Manifest(`display: "standalone"`)를 기반으로 PC에 독립 설치
- 브라우저 주소창 및 프레임 없는 네이티브 윈도우 스타일 UI (`DesktopWindowBar`)
- 서비스 워커(Service Worker) 프리캐싱을 통한 완전한 100% 오프라인 작동 지원 (`OfflineIndicator`)

---

## 5. 표준 종료 코드 규격 체계 (ErrorLevel / Exit Code Architecture)

외부 프로그램(파이썬, PowerShell, 작업 스케줄러, CI 자동화 도구 등) 및 배치 파일 체인 호출 시 안정적인 에러 핸들링과 상태 추적을 지원하기 위해 모든 배치 스크립트(`.bat`)는 고유의 표준 Exit Code 체계를 엄격히 준수합니다.

| ErrorLevel (Exit Code) | 상태 식별자 | 설명 | 세부 동작 |
| :---: | :--- | :--- | :--- |
| **`0`** | `SUCCESS` | 언어 전환 또는 복구 정상 완료 | `exit /b 0` 반환. 정상 완료 메시지 표시 |
| **`1`** | `UAC_DENIED` | 관리자 권한(UAC) 승격 실패 또는 거부 | `exit /b 1` 반환. 우클릭 '관리자 권한으로 실행' 안내 |
| **`2`** | `FOLDER_NOT_FOUND` | 포토샵 설치 및 Support Files 폴더 미존재 | `exit /b 2` 반환. 설치 경로 검증 안내 |
| **`3`** | `FILE_NOT_FOUND` | 대상 언어 데이터 파일(`tw10428*.dat`) 미존재 | `exit /b 3` 반환. 현재 폴더 내 `.dat` 파일 목록 출력 |
| **`4`** | `RENAME_FAILED` | 파일 이름 변경(`ren`) 실패 | `exit /b 4` 반환. 포토샵 프로세스 잠금 여부 확인 안내 |

모든 배치 스크립트의 종료 지점은 `exit /b <코드>`로 명시되어 다른 배치 파일이나 PowerShell 등 부모 프로세스의 실행 흐름을 방해하지 않고 에러 상태만을 명확하게 전달합니다.



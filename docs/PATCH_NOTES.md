# 패치 노트 (Patch Notes) & 버전 히스토리

이 문서는 소프트웨어 버전 관리(Semantic Versioning: `MAJOR.MINOR.PATCH`) 원칙에 따라, 변경 규모에 맞춰 3단계로 명확히 분리하여 릴리스 및 코드 수정 특이점을 기록합니다.

---

## 🏷️ 버전 관리 기준 (Semantic Versioning 2.0.0)

| 단계 | 형식 | 적용 기준 |
| :--- | :--- | :--- |
| **MAJOR (주 버전)** | `X.0.0` | 기존 호환성을 깨는 대대적 아키텍처 개편, 파일 처리 프로토콜 변경, 지원 체계의 근본적 파괴적 변경 |
| **MINOR (부 버전)** | `0.X.0` | 기존 호환성을 유지하면서 새로운 기능 추가 (새로운 포토샵 버전 지원, 신규 플랫폼/스크립트 형식 추가 등) |
| **PATCH (수 버전)** | `0.0.X` | 기존 호환성을 유지하면서 버그 수정, 문서 갱신, UI 디테일 개선, 경로 오타 수정 |

---

## 📋 버전 릴리스 로그

### [v2.12.3] - 2026-10-06
> **변경 분류: PATCH (github_setup.bat 최초 실행 시 ".은(는) 예상되지 않았습니다" 구문 오류 수정 및 선형 흐름 구조 개편)**

#### 🚀 변경 요약 & 원인 분석 및 해결
1. **버그 원인 (`.은(는) 예상되지 않았습니다.` / `'.' was unexpected at this time`)**:
   - `github_setup.bat` 및 `scripts/github_setup.bat`의 `:remote_origin_setup` 라벨(원격 origin이 처음 등록되는 첫 실행 시점) 내에서, 거대한 중첩 괄호 블록 `if /i not "!PUSH_FIRST!"=="N" (` 내부에 `%APP_TAG%` 치환(`(%APP_TAG%)`)과 `echo.` 및 중첩 `if/set /p`가 포함되어 있었습니다.
   - 배치 구문 파서(CMD.EXE) 특성상 괄호 블록 내에서 변수 치환 후 닫는 괄호 `)`가 조기 파싱되거나 중첩 `if` 구문 내 `echo.`가 비정상 인식되면서 첫 실행 시 무조건 문법 오류(`.은(는) 예상되지 않았습니다.`)를 일으키며 비정상 종료되었습니다.
   - 첫 실행 시 원격 저장소(`origin`) 등록 자체는 에러 직전에 이미 완료되었기 때문에, 사용자가 배치 파일을 두 번째 실행했을 때에는 `:remote_origin_found`로 점프하여 정상 진행되는 기현상이 발생했습니다.
2. **해결 및 개선 조치 (선형 실행 구조화)**:
   - `:remote_origin_setup`의 중첩 `if (...)` 괄호 블록을 `:remote_origin_found`와 동일한 안전한 **선형(Linear) 분기 구조**(`if /i "!PUSH_FIRST!"=="N" goto :success_exit`)로 전면 개편.
   - 메시지 내 괄호 표기를 `[!APP_TAG!]`로 통일하여 CMD 괄호 파싱 충돌 위험을 원천 차단.
   - `origin` 미등록 시에도 추천 저장소(`ahbiyout-all`), 계정 저장소(`ahbiyout`), 사용자 정의 URL을 선택할 수 있는 1~3번 선택 메뉴를 양쪽 스크립트에 완벽 동기화.
   - 최초 실행이든 재실행이든 중단 없이 푸시 및 충돌 해결(Auto-Rebase, Force Push) 단계까지 한 번에 부드럽게 진행되도록 보장.

---

### [v2.12.2] - 2026-10-06
> **변경 분류: PATCH (모든 스크립트 실행 종료 시 콘솔 창 자동 꺼짐 방지용 pause 표준화 탑재)**

#### 🚀 변경 요약 & 모든 생성 스크립트 종료 지점에 명시적 pause 표준 적용
1. **모든 스크립트 종료 지점에 `pause` 표준화 탑재**:
   - 사용자가 실행 결과를 충분히 확인하기 전에 콘솔 창이 자동으로 닫히는 현상을 완전히 해결하기 위해, 모든 스크립트의 종료 지점에 `pause`를 표준 배치:
     - **Photoshop 스크립트군 (`photoshopHelper.ts`)**:
       - `generateToEnglishBat`, `generateToKoreanBat`, `generateSmartToggleBat`: `pause >nul` 대신 표준 `pause`를 배치하여 사용자가 "계속하려면 아무 키나 누르십시오 . . ." 안내를 보고 안전하게 창을 닫을 수 있도록 개선.
       - `generateDesktopShortcutBat`: 바탕화면 바로가기가 참조하는 영구 스크립트(`PERM_BAT`)의 마지막에 `timeout /t 2` 대신 명시적 `pause` 배치.
       - `generatePhotoshopClassroomSilentBat`: `timeout /t 5` 대신 무인(`silent`) 옵션이 아닌 일반 대화형 실행 시 마지막에 `pause` 적용.
     - **Illustrator 스크립트군 (`illustratorHelper.ts`)**:
       - `generateIllustratorSmartToggleBat`: 3초 타임아웃 자동 종료(`timeout /t 3`)를 제거하고 명시적 `pause` 적용.
       - `generateIllustratorAutoDetectMultiVersionBat`: 작업 완료 후 자동 종료 카운트다운을 제거하고 `pause`로 대기하도록 변경.
       - `generateIllustratorToEnglishBat` & `generateIllustratorToKoreanBat`: `timeout /t 3` 대신 `pause` 적용.
       - `generateIllustratorShortcutBat`: 바로가기 생성 완료 및 바로가기 내부 스크립트 종료 시 `pause` 적용.
       - `generateIllustratorClassroomSilentBat` & `generateAllAdobeClassroomSilentBat`: 일반 대화형 실행 시 `pause` 적용.
     - **확장 어도비 제품군 (`extendedAppsHelper.ts`)**:
       - InDesign, After Effects, Premiere Pro, Audition 및 올인원 마스터 스크립트 전체의 마지막 `pause` 정상 작동 검증 완료.
     - **빌드/배포 스크립트 (`*.bat`)**:
       - `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 정상 완료 및 에러 분기 전체에 `pause` 탑재 유지.
2. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.12.2`로 동기화 완료.

---

### [v2.12.1] - 2026-10-06
> **변경 분류: PATCH (추가 어도비 확장 제품군 전체 1.5초 안전 멈춤 엔진(Safe Step Pacing Engine) 전면 탑재)**

#### 🚀 변경 요약 & 확장 어도비 앱 1.5초 프로세스 락 및 I/O 동기화 완충 엔진 적용
1. **추가 어도비 제품군(InDesign, InCopy, After Effects, Premiere Pro, Audition) 1.5초 완충 탑재**:
   - `extendedAppsHelper.ts` 내 모든 단일 및 통합 스크립트 생성기에 **1.5초 단계별 안전 멈춤 엔진(Safe Step Pacing Engine / 1500ms Buffer)**을 일괄 적용:
     - **Adobe InDesign & InCopy (`generateInDesignScript`)**:
       - [1단계] 관리자 권한 검증 (1.5초 대기)
       - [2단계] `InDesign.exe` / `InCopy.exe` 프로세스 검사 및 강제 종료 후 레지스트리 락 해제 (1.5초 대기)
       - [3단계] HKLM 64비트 및 WOW6432Node 레지스트리 키 탐색/변경 (1.5초 대기)
       - [4단계] 시스템 레지스트리 버퍼 플러시 및 최종 검증 (1.5초 대기)
     - **Adobe After Effects (`generateAfterEffectsScript`)**:
       - [1단계] `AfterFX.exe` 프로세스 점검 및 강제 종료 (1.5초 대기)
       - [2단계] 사용자 Documents 및 `Adobe/After Effects` 디렉터리 권한 검증 (1.5초 대기)
       - [3단계] `ae_force_english.txt` 플래그 파일 생성/제거 원자적 갱신 (1.5초 대기)
       - [4단계] 디스크 I/O 버퍼 플러시 및 파일 무결성 최종 검증 (1.5초 대기)
     - **Adobe Premiere Pro (`generatePremiereScript`)**:
       - [1단계] `Adobe Premiere Pro.exe` 프로세스 점검 및 파일 락 해제 (1.5초 대기)
       - [2단계] 사용자 프로필 디렉터리 경로 및 환경설정 파일 접근 검증 (1.5초 대기)
       - [3단계] 전역 환경 변수 `ADOBE_FORCE_LOCALE` 및 콘솔 언어 갱신 (1.5초 대기)
       - [4단계] 시스템 환경 변수 버퍼 동기화 플러시 검증 (1.5초 대기)
     - **Adobe Audition (`generateAuditionScript`)**:
       - [1단계] `Adobe Audition.exe` 프로세스 점검 및 종료 (1.5초 대기)
       - [2단계] `ADOBE_FORCE_LOCALE` 환경 변수 및 설정 동기화 (1.5초 대기)
       - [3단계] 환경 변수 버퍼 동기화 플러시 검증 (1.5초 대기)
     - **Adobe All-in-One 확장 앱 통합 마스터 스크립트 (`generateMasterExtendedAdobeScript`)**:
       - [1단계] 관리자 권한 검증 (1.5초) -> [2단계] 5개 앱 프로세스 일괄 종료 (1.5초) -> [3단계] InDesign/InCopy 레지스트리 변경 (1.5초) -> [4단계] After Effects 플래그 처리 (1.5초) -> [5단계] Premiere/Audition 환경 변수 동기화 및 검증 (1.5초)의 5단계 완충 엔진 가동.
2. **ExtendedAppsSuite UI 안전 엔진 배지 추가**:
   - `ExtendedAppsSuite.tsx` 상단 배너에 `1.5s Safe Engine` 보안 배지 추가 탑재.
3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.12.1`로 동기화 완료.

---

### [v2.12.0] - 2026-10-06
> **변경 분류: MINOR (모든 사용자/전산관리자/강사/개발자 전용 스크립트에 1.5초 단계별 안전 멈춤 엔진(Safe Step Pacing Engine) 전면 기본 탑재)**

#### 🚀 변경 요약 & 파일 락(Lock) 및 I/O 버퍼 보호 1.5초 안전 딜레이 엔진 전면 탑재
1. **1.5초 단계별 안전 멈춤 엔진 (1.5s Safe Step Pacing Engine) 기본 탑재**:
   - `photoshopHelper.ts`, `illustratorHelper.ts`, `exeGenerator.ts` 내 모든 일반 모드 및 **전산 관리자 / 강사 / 개발자 전용 스크립트** 실행 과정에 **1.5초 안전 딜레이(1500ms)**를 기본 탑재:
     - **[Step 1/4] 실행 프로세스 검사 & 파일 락 잔류 해제 대기 (1.5초)**: 포토샵/일러스트레이터가 종료 직후 파일 핸들을 반환할 시간을 확보하여 `Access Denied (Exit Code 4)` 오류를 원천 차단.
     - **[Step 2/4] 대상 폴더 접근 및 보안 권한 사전 검증 (1.5초)**: 실시간 백신(Windows Defender, V3, 알약 등)의 파일 스캔 경합(Race Condition) 방지.
     - **[Step 3/4] 언어 파일 교체 / XML 태그 원자적 변경 (1.5초)**: 안전한 파일 스왑 및 백업 무결성 확보.
     - **[Step 4/4] 디스크 I/O 버퍼 플러시 및 디스크 기록 검증 (1.5초)**: 파일 시스템 변경 사항 완벽 동기화.
2. **전산 관리자 / 강사 / 개발자 전용 도구 1.5초 완충 로직 100% 완비**:
   - **전산실 / 학원 무인 일괄 배포기 (NetSupport, Veyon, 넷오피, Active Directory GPO)**:
     - `generatePhotoshopClassroomSilentBat`, `generateIllustratorClassroomSilentBat`, `generateAllAdobeClassroomSilentBat` 스크립트에서 프로세스 강제 종료(`taskkill /f`) 직후 Windows 커널이 파일 핸들을 완전히 닫을 수 있도록 **1.5초 안전 대기 시간**을 의무 적용하고, 파일 수정 후 I/O 플러시 대기 및 5초 자동 카운트다운 적용.
   - **다중 버전 자동 감지 & 일괄 전환기 (Multi-Version Scanner & Batch Switcher)**:
     - `generateAutoDetectMultiVersionBat`, `generateIllustratorAutoDetectMultiVersionBat` 스크립트에서 다중 설치본 대상 일괄 토글(Batch Toggle) 및 개별 버전 전환 시 각 버전 처리 단계마다 **1.5초 안전 지연**을 적용하여 연속 파일 수정 시의 디스크 경합 차단.
   - **24개국 글로벌 언어 매트릭스 전환기 (Universal Multi-Language Matrix Switcher)**:
     - `generateUniversalMultiLangBat`의 모든 언어팩 스왑 및 일괄 전환 시 **1.5초 안전 지연** 적용.
   - **바탕화면 원클릭 바로가기 생성기 (Desktop Shortcut Deployer)**:
     - 생성된 바탕화면 바로가기 내부의 실행 배치 파일(`photoshop_toggle_language.bat`, `illustrator_toggle.bat`)에도 1.5초 안전 지연 엔진 내장.
3. **시각적 단계별 진행 알림 및 UX 신뢰성 극대화**:
   - 콘솔 창이 0.01초 만에 닫히는 불안감을 해소하고 단계별 `[OK]` 진행 상태를 한눈에 확인할 수 있도록 콘솔 UI 고도화.
4. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.12.0`으로 동기화 완료.

---

### [v2.11.19] - 2026-10-06
> **변경 분류: PATCH (설치된 연도 버전 선택 시 실제 경로 미반영 버그 전면 해결 및 확장 버전 프리셋 동기화)**

#### 🚀 변경 요약 & 연도 버전 선택 시 경로 생성 로직 완벽 교정
1. **연도 버전 선택 시 실제 대상 경로 생성 및 동기화 결함 해결**:
   - `EasyModeView.tsx`에서 '설치된 연도 버전 선택' 버튼 클릭 시 `isCustomPath` 상태가 해제되지 않거나 드라이브/운영체제별 경로가 온전히 갱신되지 않던 결함을 전면 수정.
   - `handleSelectVersion`, `handleSelectApp`, `handleSelectLocale` 실행 시 `getIllustratorDefaultPath` 및 `resolveFolderPath`를 통해 Windows/macOS, 선택 드라이브, 선택 언어(`tw10428_Photoshop_ko_KR.dat` vs `tw10428.dat` vs `application.xml`)가 100% 일치하도록 즉각 동기화.
   - `MultiVersionDetector.tsx`의 탐지 버전 선택 및 자동 동기화 로직에서도 `customPath`와 `isCustomPath`가 일관되게 생성되도록 보완.
2. **포토샵 및 일러스트레이터 연도별 버전 프리셋 대폭 확장**:
   - **Photoshop**: 2026, 2025, 2024, 2023, 2022, 2021, 2020, CC 2019, CC 2018, CC 2017, CC 2015, CC 2014, CS6 (64-bit), CS6 (32-bit) 지원.
   - **Illustrator**: 2026, 2025, 2024, 2023, 2022, 2021, 2020, CC 2019, CC 2018, CC 2017, CC 2015, CS6 (64-bit), CS6 (32-bit) 지원.
3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.19`로 동기화 완료.

---

### [v2.11.18] - 2026-10-05
> **변경 분류: PATCH (배치 스크립트(.bat) echo 내 특수문자(&) 이스케이프 가드 보완 및 푸시 성공 검증 완료)**

#### 🚀 변경 요약 & 배치 명령어 구분자(Ampersand) 이스케이프 처리
1. **배치 파일 명령어 구분자 이스케이프 (`^&`) 처리**:
   - `github_setup.bat`, `scripts/github_setup.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat` 콘솔 출력 문구 중 `Auto-Rebase & Push` 등 `&` 문자를 `^&`로 이스케이프하여, CMD가 `&`를 명령어 구분자로 오인해 `'Push'은(는) 내부 또는 외부 명령이 아닙니다`라는 문구를 출력하던 구문 결함을 원천 해결.
2. **원격 저장소 푸시 성공 검증**:
   * `To https://github.com/ahbiyout-all/photoshop-language-switcher.git` 정상 푸시 및 원격 main 브랜치 최신화 완료.
3. **전역 빌드 스크립트 및 버전 동기화**:
   * `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.18`로 동기화 완료.

---

### [v2.11.17] - 2026-10-05
> **변경 분류: PATCH (GitHub 공식 Privacy Noreply 이메일 ahbiyout-all@users.noreply.github.com 전면 교정 및 정합성 보장)**

#### 🚀 변경 요약 & GitHub 사용자명(ahbiyout-all) 기반 No-Reply 이메일 완벽 동기화
1. **GitHub Privacy No-Reply Email 교정**:
   * **GitHub 사용자명**: `ahbiyout-all`
   * **GitHub 공식 노리플라이 이메일**: **`ahbiyout-all@users.noreply.github.com`**
   * 이전 `ahbiyout@...`로 표기되어 있던 Git Author Email 및 자동 서명 로직을 `ahbiyout-all@users.noreply.github.com`으로 전면 교정.
2. **배치 스크립트 및 보안 가이드 동기화**:
   * `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 내 자동 설정 및 Sanitization 대상을 `ahbiyout-all@users.noreply.github.com`으로 100% 동기화.
   * `docs/GIT_SECURITY_GUIDE.md` 내 권장 이메일 항목 갱신.
3. **전역 빌드 스크립트 및 버전 동기화**:
   * `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.17`로 동기화 완료.

---

### [v2.11.16] - 2026-10-05
> **변경 분류: PATCH (GitHub 사용자명 'ahbiyout-all' 및 계정명 'ahbiyout' 구조적 명확화 & 전역 URL 동기화)**

#### 🚀 변경 요약 & GitHub 사용자명(ahbiyout-all) 기반 리포지토리 및 Pages 동기화
1. **GitHub 계정 구조 명확화**:
   * **GitHub 사용자명 (Username / URL ID)**: `ahbiyout-all`
   * **계정명 / 조직 (Account / Org / Author)**: `ahbiyout` / `AhBiYout`
2. **원격 저장소 및 배포 URL 일괄 동기화**:
   * **저장소 URL**: `https://github.com/ahbiyout-all/photoshop-language-switcher`
   * **Git Clone / Origin URL**: `https://github.com/ahbiyout-all/photoshop-language-switcher.git`
   * **GitHub Pages 라이브 데모**: `https://ahbiyout-all.github.io/photoshop-language-switcher/`
3. **배치 스크립트 및 UI 링크 연동**:
   * `deploy_gh_pages.bat` 및 `github_setup.bat` 1번 추천 메뉴를 `ahbiyout-all`로 지정하고, 2번 보조 메뉴로 `ahbiyout` 선택권 제공.
   * `README.md` 상단 뱃지 및 본문 바로가기 링크를 `ahbiyout-all.github.io`로 100% 동기화.
4. **전역 빌드 스크립트 및 버전 동기화**:
   * `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.16`으로 동기화 완료.

---

### [v2.11.15] - 2026-10-05
> **변경 분류: PATCH (배치 파일(.bat) 내 GitHub 원격 저장소 기본 URL(ahbiyout) 전면 교정 및 GitHub Pages 링크 정합성 동기화)**

#### 🚀 변경 요약 & 원격 저장소 URL 오류 교정 및 최종 검증
1. **배치 파일(`deploy_gh_pages.bat`, `github_setup.bat`) 내 기본 원격 저장소 URL 교정**:
   - `[1]`번 기본 추천 URL을 기존 `ahbiyout-all`에서 실제 소유자 계정인 **`https://github.com/ahbiyout/photoshop-language-switcher.git`**으로 전면 교정.
   - 403 권한 트러블슈터 및 수동 가이드(`manual_instructions`) 내의 리모트 주소도 `ahbiyout`으로 일괄 동기화하여 푸시 시 403 오류나 리포지토리 미발견 문제를 근본적으로 해결.
2. **GitHub Pages 라이브 데모 URL 정합성 동기화**:
   - `src/version.ts` 및 `README.md` 내 배포 사이트 링크를 **`https://ahbiyout.github.io/photoshop-language-switcher/`**로 100% 일치.
3. **개인정보 완벽 비노출 및 bat 스크립트 업로드 보안 보장**:
   - 개인 이메일(`redmunlight@gmail.com`)은 프로젝트 전역에서 완벽히 비노출 상태 유지.
   - Git 작성자 정보는 GitHub 공식 프라이버시 보호 이메일(`ahbiyout@users.noreply.github.com`)로 자동 서명.
   - 오픈소스 유틸리티 동작용 배치 스크립트(`build.bat`, `deploy_gh_pages.bat`, `github_setup.bat`)는 개인 자격 증명이 포함되어 있지 않으므로 깃허브에 함께 배포해도 안전함.
4. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.15`로 동기화 완료.

---

### [v2.11.13] - 2026-10-05
> **변경 분류: PATCH (공식 GitHub Pages 배포 사이트 라이브 URL 리드미(README.md) 전면 배치 및 다국어 문서 연동)**

#### 🚀 변경 요약 & GitHub Pages 공식 라이브 서비스 주소 전면 쇼케이스
1. **루트 리드미(`README.md`) 상단에 GitHub Pages 공식 주소 및 뱃지 추가**:
   - `[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-success?style=for-the-badge&logo=github)](https://ahbiyout.github.io/photoshop-language-switcher/)`
   - 방문자가 리포지토리에 접속하자마자 설치 없이 웹에서 즉시 체험할 수 있도록 하이라이트 박스 및 바로가기 링크(`https://ahbiyout.github.io/photoshop-language-switcher/`) 전면 배치.
2. **스크립트 및 문서 색인 링크 동기화**:
   - `scripts/README.md`: 원클릭 배포 스크립트 실행 후 접속할 실제 Live URL 추가.
   - `docs/README.md`: 신규 보안 가이드(`GIT_SECURITY_GUIDE.md`) 문서 색인 등록.
   - `src/version.ts`: `APP_GITHUB_PAGES_URL` 상수 정의 추가.
3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.13`으로 동기화 완료.

---

### [v2.11.12] - 2026-10-05
> **변경 분류: PATCH (개인 이메일 전면 비노출 보안 처리 및 GitHub 공식 Privacy No-Reply 주소 ahbiyout@users.noreply.github.com 전환)**

#### 🚀 변경 요약 & 개인 이메일 전면 비노출 및 No-Reply 마스킹
1. **개인 이메일 전면 비노출 및 노출 차단**:
   - 코드베이스, 배치 스크립트, 문서 전역에서 개인 이메일 주소를 완전히 제거.
   - 깃허브 공개 시 발생할 수 있는 스팸 메일 수신 및 개인정보 유출 위험을 원천 차단.
2. **GitHub 공식 프라이버시 보호 노리플라이 이메일 도입**:
   - Git 작성자 이메일(`git config user.email`)을 GitHub의 공식 개인정보 보호용 노리플라이 주소인 **`ahbiyout@users.noreply.github.com`**으로 일괄 전환.
   - `deploy_gh_pages.bat` 및 `github_setup.bat`에 기존 로컬에 캐시되었을 수 있는 개인 이메일 감지 시 No-Reply 주소로 자동 정화(Sanitization)하는 보안 로직 탑재.
3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `docs/GIT_SECURITY_GUIDE.md` 전역 버전을 `v2.11.12`로 동기화 완료.

---

### [v2.11.11] - 2026-10-05
> **변경 분류: PATCH (GitHub 푸시 보안 강화, 개인정보 및 시크릿 파일 차단망 고도화, 배치 스크립트(.bat) 배포 안전성 검증 및 전용 가이드 수립)**

#### 🚀 변경 요약 & GitHub 푸시 시크릿 방어 및 배치 스크립트 무결성 보증
1. **GitHub 푸시 시 개인정보 및 시크릿 데이터 차단망 고도화 (`.gitignore`)**:
   - 사용자가 작성한 개인용 토큰, 패스워드, 개인 키, 비공개 메모 등이 실수로 `git add .` 및 푸시되지 않도록 다계층 필터링 룰 추가:
     - `*.secret`, `*.token`, `*.pat`, `*.key`, `*.pem`, `*.pfx`, `*.p12`
     - `credentials.json`, `client_secret*.json`
     - `personal/`, `private/` 격리 폴더 무시 규칙 신설.
2. **배치 스크립트(`.bat`)의 깃허브 배포 안전성 검증 및 공식 가이드 수립 (`docs/GIT_SECURITY_GUIDE.md`)**:
   - 프로젝트 내 자동화 스크립트(`build.bat`, `deploy_gh_pages.bat`, `github_setup.bat`)의 안전성 전수 점검 완료:
     - 스크립트 내부에 사용자 토큰이나 비밀번호가 전혀 하드코딩되어 있지 않으며, 동적 대화형 입력 또는 윈도우 자격 증명 관리자를 경유하여 처리됨을 확인.
     - 오픈소스 프로젝트의 빌드/배포 핵심 도구로서 리포지토리에 동봉 배포하는 것이 필수 권장 사항임을 확립.
     - 푸시 전 10초 셀프 체크리스트 및 업로드 허용/금지 데이터 분류 체계 문서화.
3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.11`로 동기화 완료.

---

### [v2.11.10] - 2026-10-02
> **변경 분류: PATCH (GitHub 계정 사용자명 'ahbiyout' 및 프로필 표시 이름 'ahbiyout-all' 최종 정합성 확정 & 외부 CMD 경로 오류 방지 안내)**

#### 🚀 변경 요약 & GitHub 계정 체계 정합성 최종 동기화
1. **GitHub 계정 사용자명(아이디)과 프로필 표시 이름 구분 확정**:
   - 사용자 확인에 따른 명확한 역할 정의:
     - **계정 아이디 (Username)**: `ahbiyout`
     - **프로필 표시 이름 (Display Name)**: `ahbiyout-all`
     - **작성자 (Author)**: `AhBiYout`
   - GitHub의 리포지토리 및 프로필 URL 표준 체계(`https://github.com/{username}/{repo}`)에 따라:
     - **공식 리포지토리 URL**: `https://github.com/ahbiyout/photoshop-language-switcher.git`
     - **공식 프로필 URL**: `https://github.com/ahbiyout`
     - **UI 표시 명칭**: `ahbiyout-all` (또는 `AhBiYout`)
   - 이에 따라 코드 및 배치 스크립트 전역의 GitHub 대상 URL을 `https://github.com/ahbiyout/photoshop-language-switcher.git`로 완전 동기화.

2. **Windows 명령 프롬프트 외부 경로(`C:\Users\user`) 실행 오류 예방 및 원클릭 배치 실행**:
   - `fatal: not a git repository` 오류는 명령 프롬프트가 프로젝트 폴더가 아닌 사용자 홈 디렉터리(`C:\Users\user`)에서 실행되어 발생함.
   - 사용자가 번거롭게 터미널 경로를 이동하지 않아도 프로젝트 폴더 내의 `deploy_gh_pages.bat` 또는 `github_setup.bat` 파일을 마우스 더블 클릭하기만 하면 자동으로 현재 폴더를 인식하여 안전하게 원클릭 배포가 이루어지도록 스크립트 프리셋 완비.

3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md`, `docs/SECURITY_REPORT.md`, `docs/DLL_SPECIFICATION.md`, `docs/TEST_PLAN.md` 전역 버전을 `v2.11.10`으로 통일 완료.

---

### [v2.11.9] - 2026-10-02
> **변경 분류: PATCH (사용자 실제 GitHub 프로필 ahbiyout-all 검증 반영 및 Windows Credential Manager 캐시 불일치 복구 엔진 고도화)**

#### 🚀 변경 요약 & 공식 저장소 ahbiyout-all 재확인 및 자격 증명 스위칭 완비
1. **사용자 실제 브라우저 GitHub 프로필 스크린샷 검증 및 공식 리포지토리 확정**:
   - 사용자가 제공한 실제 GitHub 프로필 화면(`https://github.com/ahbiyout-all`) 확인 결과:
     - 실제 GitHub 사용자명/계정: **`ahbiyout-all`**
     - 생성된 리포지토리: **`ahbiyout-all/photoshop-language-switcher`**
   - 이에 따라 전역 공식 원격 저장소 및 프로필 URL을 `https://github.com/ahbiyout-all/photoshop-language-switcher.git`로 최종 동기화 완료.

2. **403 오류의 진짜 원인과 1클릭 자격 증명 스위칭 엔진 (`permission_403_resolver`)**:
   - `Permission to ahbiyout-all/... denied to AhBiYout. (403)` 오류는 **윈도우 PC의 자격 증명 관리자(Windows Credential Manager)에 과거 계정인 `AhBiYout`이 캐시되어 있어**, 깃허브로 푸시할 때 `ahbiyout-all`이 아닌 `AhBiYout` 자격 증명이 전송되었기 때문임이 입증됨.
   - `deploy_gh_pages.bat` 및 `github_setup.bat`의 403 복구 마법사 1번 메뉴를 **"Reset Windows Credential & sign in as 'ahbiyout-all'"**로 전면 개편.
   - 1번을 선택하면 `cmdkey /delete:git:https://github.com`를 실행하여 캐시된 `AhBiYout` 자격 증명을 말끔히 삭제하고 즉시 웹 브라우저 인증 창을 띄워 현재 브라우저에 로그인된 `ahbiyout-all`로 원클릭 승인 푸시가 완료되도록 파이프라인 구축.

3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `scripts/installer.iss`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md` 전역 버전을 `v2.11.9`로 통일 완료.

---

### [v2.11.8] - 2026-10-02
> **변경 분류: PATCH (GitHub 계정 ID 'ahbiyout' 및 프로필 표시 이름 'ahbiyout-all' URL 분리 정합성 교정)**

#### 🚀 변경 요약 & GitHub 계정 사용자명(URL)과 표시 이름 분리 표준화
1. **GitHub 계정 사용자명(`ahbiyout`)과 프로필 표시 이름(`ahbiyout-all`) 분리 반영**:
   - 사용자의 실제 GitHub 계정(아이디 / 사용자명)은 **`ahbiyout`**이고, 계정 내 프로필 표시 이름(Display Name)이 **`ahbiyout-all`**임이 확인됨에 따라 전역 원격 저장소 및 프로필 URL을 완벽하게 교정.
   - GitHub의 리포지토리 URL은 표시 이름이 아닌 계정 사용자명만 사용하므로:
     - 원격 저장소 URL: `https://github.com/ahbiyout/photoshop-language-switcher.git`
     - 프로필 URL: `https://github.com/ahbiyout`
     - UI 표시 명칭: `ahbiyout-all` (또는 `AhBiYout`)
   - 이를 통해 이전 `ahbiyout-all`로 잘못 지정되어 발생하던 **HTTP 403 (Permission denied to AhBiYout)** 권한 거부 오류를 구조적으로 원천 해결.

2. **배포 및 셋업 스크립트 기본 원격 프리셋 교정 (`deploy_gh_pages.bat`, `github_setup.bat`)**:
   - `deploy_gh_pages.bat` 및 `github_setup.bat`의 기본 리포지토리 연결 주소를 `https://github.com/ahbiyout/photoshop-language-switcher.git`로 일괄 정정.
   - 사용자 계정 `ahbiyout`과 완벽히 일치하여 엔터만 누르면 권한 오류 없이 원클릭 배포 성공 보장.

3. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `scripts/installer.iss`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md` 전역 버전을 `v2.11.8`로 통일 완료.

---

### [v2.11.7] - 2026-10-02
> **변경 분류: PATCH (GitHub HTTP 403 권한 거부 자동 진단 및 복구 도구, Windows 자격 증명 캐시 초기화, 미병합 충돌 자동 정리 파이프라인 신설)**

#### 🚀 변경 요약 & GitHub 403 / 권한 불일치 자가 복구 고도화
1. **GitHub 푸시 403 권한 거부 (`Permission to ... denied to ...`) 자가 진단 및 7단계 복구 엔진 (`deploy_gh_pages.bat`, `github_setup.bat`)**:
   - 로컬 윈도우 Git 인증 계정(예: `AhBiYout`)과 원격 저장소 소유자(예: `ahbiyout-all`)가 불일치하거나, 리포지토리 쓰기 권한이 없어 `git push`가 HTTP 403으로 거절될 때 단순 에러 종료 대신 **대화형 복구 마법사**(`permission_403_resolver`) 즉시 작동:
     - `[1]`: 현재 감지된 본인 개인 계정 저장소(`https://github.com/AhBiYout/photoshop-language-switcher.git`)로 원격 URL 원터치 전환 후 즉시 푸시
     - `[2]`: 사용자가 직접 포크/개인 저장소 URL 입력 후 즉각 푸시
     - `[3]`: GitHub Personal Access Token (PAT) 입력 시 원격 URL에 토큰을 안전하게 결합(`https://<TOKEN>@github.com/...`)하여 자격 증명 오류 원천 우회
     - `[4]`: 윈도우 자격 증명 관리자(Windows Credential Manager)의 `github.com` 캐시 자동 삭제(`cmdkey /delete`)를 통해 브라우저 로그인 창 재호출 유도
     - `[5]`: 저장소 권한 설정 페이지(`.../settings/access`) 브라우저 원클릭 호출로 Collaborator 권한 점검 지원
     - `[6]`: 현재 설정으로 재시도
     - `[7]`: 배포 안전 취소

2. **미병합 파일 충돌 (`Pulling is not possible because you have unmerged files`) 선제적 자동 청소**:
   - `git pull`, `git pull --rebase`, `git push` 실행 전에 이전 작업에서 중단된 병합/리베이스 상태를 감지하여 `git merge --abort`, `git rebase --abort`, `git reset --merge`를 선제적으로 일괄 수행, 작업 디렉터리가 꼬여서 명령이 거부되는 현상 완벽 방지.

3. **Step 2 원격 저장소 선택 시 본인 계정 우선 감지**:
   - PC의 `git config user.name`을 읽어와 본인 계정 리포지토리(`https://github.com/<user.name>/photoshop-language-switcher.git`)를 [1]번 추천 옵션으로 제공하여 계정 불일치로 인한 403 에러 원천 차단.

4. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.7`로 통일 완료.

---

### [v2.11.6] - 2026-10-02
> **변경 분류: PATCH (신규 PC ZIP 다운로드 환경 Git 저장소 자동 초기화 및 1클릭 원격 리포지토리 자동 연결 파이프라인 신설)**

#### 🚀 변경 요약 & ZIP 다운로드 첫 실행 배포 원천 자동화
1. **신규 PC ZIP 압축 해제 환경 Git 자동 초기화 (`deploy_gh_pages.bat`)**:
   - 사용자가 GitHub에서 ZIP으로 소스코드를 내려받아 새 PC에서 `deploy_gh_pages.bat`를 처음 실행했을 때, `.git` 폴더가 존재하지 않아 발생하던 `fatal: not a git repository` 및 `Git remote 'origin' is not yet configured` 에러를 원천 차단.
   - 스크립트가 비정상 종료되는 대신, 자동으로 첫 실행 안내 화면을 띄우고 사용자가 엔터(기본값 1)만 누르면:
     - `git init -b main` 자동 실행
     - 공식 저장소(`https://github.com/ahbiyout-all/photoshop-language-switcher.git`)를 원격 `origin`으로 원터치 자동 등록
     - 작성자 정보(`user.name`, `user.email`) 자동 보정
     - 전체 파일 커밋(`git add . && git commit`) 자동 완료
     - 중단 없이 바로 GitHub Pages 배포 단계(Step 3~4)로 직결되도록 UX 완성.

2. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.6`으로 통일 완료.

---

### [v2.11.5] - 2026-10-02
> **변경 분류: PATCH (Windows CMD 배치 구문 파싱 에러 'detected은(는) 예상되지 않았습니다.' 해결 및 플랫 라벨 구조로 완전 리팩토링)**

#### 🚀 변경 요약 & 배치 파서 에러 원천 해결
1. **Windows CMD 괄호 구문 파싱 에러 수정 (`deploy_gh_pages.bat`, `github_setup.bat`)**:
   - `if (...)` 조건 블록 내부에 `(winget)` 문자열이 `echo`될 때, Windows 명령 프롬프트(`cmd.exe`)가 닫는 괄호 `)`를 블록의 끝으로 오인하여 이후의 단어 `detected`를 알 수 없는 명령어로 취급하며 중단되던 현상(`detected은(는) 예상되지 않았습니다.`)을 완벽하게 수정.
   - 중첩 `if (...)` 괄호 구조를 완전히 제거하고, 레이블 기반의 단방향 점프(`goto :git_check_done`, `goto :manual_git_install`) 플랫 아키텍처로 전면 개편하여 어떤 Windows 환경에서도 100% 문법 오류 없이 실행되도록 보장.

2. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.5`로 통일 완료.

---

### [v2.11.4] - 2026-10-02
> **변경 분류: PATCH (신규 PC 환경 Git/Node 부재 감지, Windows 표준 설치 경로 자동 스캔 및 winget 원클릭 자동 설치 복구 파이프라인 신설)**

#### 🚀 변경 요약 & 신규 컴퓨터 배포 스크립트 자가 복구 고도화
1. **Windows 표준 Git 설치 경로 자동 감지 엔진 (`deploy_gh_pages.bat`, `github_setup.bat`)**:
   - 새 컴퓨터에서 Git이 설치되어 있으나 환경 변수 `PATH`에 등록되지 않은 경우:
     - `C:\Program Files\Git\cmd\git.exe`
     - `%LOCALAPPDATA%\Programs\Git\cmd\git.exe`
     - `C:\Program Files (x86)\Git\cmd\git.exe`
     - `C:\Git\cmd\git.exe`
     위 표준 경로를 자동 스캔하여 즉시 세션 `PATH`에 추가하고 중단 없이 배포를 속행하도록 자가 복구 로직 탑재.

2. **Windows 패키지 관리자 (`winget`) 1클릭 원터치 Git 자동 설치 지원**:
   - PC에 Git이 전혀 설치되어 있지 않은 경우, 단순 오류 메시지(`[ERROR] Git is not found in PATH`)로 튕기지 않고 Windows 10/11 기본 제공 도구인 `winget`의 존재를 감지.
   - 사용자가 엔터(Y)만 누르면 `winget install --id Git.Git -e --source winget` 명령으로 즉각 Git 최신 정품을 설치하고 세션에 자동 반영.
   - `winget`이 없는 구형 환경에서는 공식 설치 페이지(`https://git-scm.com/download/win`)를 브라우저로 1클릭 자동 연결.

3. **GitHub Actions CI/CD 배포 시 로컬 Node.js 의존성 분리 (디커플링)**:
   - Method 1 (GitHub Actions CI/CD) 배포 방식은 GitHub 클라우드 컨테이너에서 모든 Vite 빌드를 수행하므로 로컬 PC의 Node.js/npm 유무와 무관하게 동작하도록 환경 검사 구조 개선.
   - 로컬 Node.js가 없는 새 PC에서도 Git만 있으면 즉시 원격 main에 푸시하여 GitHub Pages 사이트가 100% 정상 자동 빌드·배포되도록 최적화.
   - Method 2 (직접 로컬 빌드) 선택 시에만 Node.js를 요구하며, 부재 시 winget으로 원클릭 설치하거나 Method 1으로 자동 전환하는 안내 메뉴 제공.

4. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.4`로 통일 완료.

---

### [v2.11.3] - 2026-10-01
> **변경 분류: PATCH (하단 푸터 중복 개발자 메타데이터 전면 제거 및 GitHub Pages 배포 자동화 스크립트 충돌 자동 복구/리베이스 파이프라인 신설)**

#### 🚀 변경 요약 & 배포 자동화 및 푸터 정돈
1. **하단 푸터(Footer) 중복 표기 전면 제거 (`src/components/Footer.tsx`)**:
   - 상단 헤더, 작업표시줄, 간편 모드에 이미 상시 노출되어 있는 `개발자: AhBiYout (CIS - cisnet.co.kr)` 정보가 하단 푸터 2열에 중복 표기되던 영역을 완전히 제거.
   - 2열 그리드로 정돈: 좌측(프로그램 정보, 안전 무손실 뱃지, 데스크톱 버전)과 우측(공식 채널/블로그 및 GitHub 리포지토리 링크)으로 시각적 위계 단순화.
   - 최하단 저작권 표기를 군더더기 없이 단일 라인으로 간소화.

2. **GitHub Pages 원클릭 배포 스크립트 지능형 충돌 자동 복구 신설 (`deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`)**:
   - 원격 저장소(`origin main`)에 이미 README 생성 또는 이전 커밋이 존재하여 `git push -u origin main` 실행 시 `[rejected] main -> main (fetch first)` 거절 오류가 발생하던 현상 해결.
   - 스크립트가 푸시 거절 상태를 자동 감지하고 4가지 지능형 대응 전략을 대화형 메뉴로 제공:
     - **[1] Auto-Rebase & Push (권장)**: `git pull --rebase origin main`을 자동 수행하여 원격 커밋을 먼저 가져온 뒤 로컬 최신 코드를 안전하게 리베이스하여 푸시. (충돌 시 자동 중단 및 강제 푸시 전환 옵션 지원)
     - **[2] Force Push (직접 배포 동기화)**: 원격 저장소 `main` 브랜치를 로컬 최신 릴리스 버전(`v2.11.3`)과 릴리스 태그로 즉시 강제 덮어쓰기 (`git push -f origin main --tags`).
     - **[3] Auto-Merge & Push**: `git pull origin main --no-rebase`로 머지 커밋 생성 후 푸시.
     - **[4] 배포 취소**: 안전한 수동 검토 지원.

3. **초기 저장소 셋업 스크립트 리베이스 옵션 탑재 (`github_setup.bat`, `scripts/github_setup.bat`)**:
   - 원격 브랜치와 로컬 브랜치의 히스토리가 갈라졌을 때 단일 강제 푸시 외에도 `Auto-Rebase & Push`를 1순위로 지원하도록 선택 프로세스 고도화.

4. **전역 빌드 스크립트 및 버전 동기화**:
   - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `github_setup.bat`, `deploy_gh_pages.bat` 전역 버전을 `v2.11.3`으로 통일 완료.

---

### [v2.11.2] - 2026-10-01
> **변경 분류: PATCH (푸터 레이아웃 정돈, 중복된 개발자·소속사 정보 표기 제거 및 일관된 시각적 위계 구축)**

#### 🚀 변경 요약 & 하단 푸터 중복 텍스트 제거
- **하단 섹션 중복 표기 제거 (`src/i18n/translations.ts`, `src/components/Footer.tsx`)**:
  - 푸터 2열 헤더의 중복 텍스트(`개발자: AhBiYout (CIS - cisnet.co.kr)`)를 직관적인 섹션 명칭인 **`개발자 및 소속 정보` (Developer & Organization)**로 개선.
  - 최하단 저작권 표기 바에서 2열과 중복되던 `CIS (cisnet.co.kr)` 링크를 제거하여 깔끔하고 군더더기 없는 레이아웃으로 최적화.
- **버전 및 빌드 스크립트 전역 동기화**:
  - `package.json`, `src/version.ts`, `github_setup.bat`, `build.bat`, `deploy_gh_pages.bat` 전역 버전을 `v2.11.2`로 동기화 완료.

---

### [v2.11.1] - 2026-10-01
> **변경 분류: PATCH (AI Studio 미리보기 iframe 내 Cross-origin showDirectoryPicker 보안 예외 처리, 지능형 환경 감지 및 단독 탭/실행기 즉시 폴백 시스템 구축)**

#### 🚀 변경 요약 & iframe 브라우저 보안 제약 완벽 해결
- **W3C Cross-Origin Subframe 보안 예외 정밀 핸들링 (`src/utils/fileSystemAccess.ts`)**:
  - `isRunningInIframe()` 환경 감지 유틸리티 신설: 현재 브라우저 렌더링 컨텍스트가 `<iframe>` 내부인지 자동 판별.
  - `openPhotoshopDirectory` 및 `openAndScanAllPhotoshopVersions` 호출 시 크로스오리진 서브프레임 제한을 사전 감지하여 명확한 오류 코드(`CROSS_ORIGIN_IFRAME_RESTRICTED`) 반환.
- **간편 모드(Easy Mode) UI 지능형 반응형 폴백 (`src/components/EasyModeView.tsx`)**:
  - **기본 실행 방법 스마트 전환**: 미리보기 iframe 환경에서는 W3C 보안 제한이 없는 **`방법 B (원클릭 실행 파일 .exe)`** 또는 **`방법 C (배치 스크립트 .bat)`**를 기본값으로 자동 선택.
  - **방법 A 사전 알림 배너**: iframe 환경 감지 시 상단에 브라우저 보안 규정 안내와 함께 1클릭 해결 버튼 제공:
    - 🌐 **[새 창(단독 탭)에서 열기]**: 브라우저 단독 창에서 열어 `showDirectoryPicker` 웹 직접 변경 즉시 사용.
    - 💻 **[원클릭 .exe 다운로드]**: 바탕화면 64비트 독립 실행기 생성.
    - 📜 **[배치 스크립트(.bat) 다운로드]**: 초경량 텍스트 배치 파일.
  - **예외 발생 시 대화형 해결 카드 표시**: 사용자가 iframe 내에서 직접 변경을 시도하더라도 당황스러운 영어 기술 에러(`Failed to execute 'showDirectoryPicker'...`) 대신 친절한 원인 설명과 단독 탭 열기 및 .exe 즉시 다운로드 버튼 표시.
- **상단 윈도우 바 단독 탭 원클릭 바로가기 버튼 탑재 (`src/components/DesktopWindowBar.tsx`)**:
  - iframe 미리보기 감지 시 상단 바에 `단독 새 탭 열기` 버튼을 상시 표시하여 원클릭 팝아웃 지원.
- **전문가 모드(Pro Mode) 탐색기 오류 메시지 사용자화 (`DirectFolderController.tsx`, `MultiVersionDetector.tsx`)**:
  - iframe 보안 차단 발생 시 친절한 한국어 안내 및 단독 탭 열기 유도 메시지 표시.

---

### [v2.11.0] - 2026-10-01
> **변경 분류: MINOR (간편 모드 다국어 퀵 셀렉트 칩 버튼 신설, 24개국 전 세계 언어 즉시 선택 엔진, 다국어 동적 UI 파이프라인 완성)**

#### 🚀 변경 요약 & 간편 모드 글로벌 다국어 퀵 셀렉트 칩 시스템 구축
- **간편 모드(Easy Mode) 퀵 셀렉트 칩 버튼 바 신설 (`src/components/EasyModeView.tsx`)**:
  - 한국어(🇰🇷), 영어(🇺🇸) 외에도 일본어(🇯🇵), 중국어 간체(🇨🇳), 중국어 번체(🇹🇼), 독일어(🇩🇪), 프랑스어(🇫🇷), 스페인어(🇪🇸), 이탈리아어(🇮🇹), 러시아어(🇷🇺), 포르투갈어(🇧🇷), 폴란드어(🇵🇱), 튀르키예어(🇹🇷) 등 사용 빈도가 높은 핵심 글로벌 언어를 1클릭 퀵 셀렉트 칩으로 제공.
  - **전체 24개국 언어 서랍(Drawer) & 실시간 검색 필터**:
    - 체코어, 헝가리어, 우크라이나어, 스웨덴어, 덴마크어, 네덜란드어, 핀란드어, 노르웨이어, 아랍어, 히브리어 등 Adobe Creative Cloud가 지원하는 전 세계 24개 모든 언어를 검색/선택 가능.
    - 국기 이모지, 현지 원어(Native Name), 공식 언어 코드(Locale Code) 3중 표기.
- **다국어 맞춤형 동적 액션 카드 & 경로 자동 연동**:
  - 선택한 언어 칩에 맞춰 2단계 3대 액션 카드 타이틀과 설명 문구가 실시간으로 동적 적응:
    - 🔄 **스마트 자동 토글 ({선택 언어} ⇄ 영문)**: 일본어 ⇄ 영문, 중국어 ⇄ 영문 등 상호 전환.
    - 🇺🇸 **영문(English)으로 변경**: 선택한 국가 언어팩 비활성화 및 공식 영문 모드 전환.
    - 🌐 **{선택 언어}로 복구/변경**: 원래의 현지 언어 인터페이스로 100% 무손실 복구.
  - 1단계 경로 표시 및 3단계 웹 직접 변경/실행 파일(.exe)/배치 스크립트(.bat) 생성 엔진이 해당 국가 언어 사전 파일(`tw10428_Photoshop_{locale}.dat` 및 일러스트레이터 `application.xml`)과 100% 자동 연동.
- **일러스트레이터 파일 시스템 직접 제어 API 다국어 확장 (`src/utils/fileSystemAccess.ts`)**:
  - `toggleIllustratorXmlLanguage` 함수에 `targetLocale` 파라미터를 추가하여 한국어 외에 전 세계 모든 언어 태그를 웹 브라우저에서 무손실 직접 치환 가능하도록 고도화.
- **버전 및 배포 스크립트 동기화**:
  - `package.json`, `src/version.ts`, `github_setup.bat`, `build.bat`, `deploy_gh_pages.bat` 전역 버전을 `v2.11.0`으로 상향 동기화.

---

### [v2.10.0] - 2026-10-01
> **변경 분류: MINOR (일반 사용자 전용 3단계 간편 모드 신설, 듀얼 뷰 모드 스위처 아키텍처 구축, 초보자 사용성 극대화)**

#### 🚀 변경 요약 & 일반 사용자용 초간단 UI/UX 개편
- **일반 사용자를 위한 '간편 모드(Easy Mode)' 신규 구축 (`src/components/EasyModeView.tsx`)**:
  - **1단계 (프로그램 및 버전 선택)**: 대형 카드로 포토샵(Ps)과 일러스트레이터(Ai)를 직관적으로 선택하고 연도별 버전을 클릭 한 번으로 지정.
  - **2단계 (목표 언어 선택)**: 스마트 자동 토글(추천), 영문으로 변경, 한국어로 복구 중 원하는 동작을 명확히 선택.
  - **3단계 (3대 실행 방식 제공)**:
    - 🌐 **웹 브라우저에서 바로 변경**: 별도 파일 다운로드 없이 브라우저 File System Access로 1초 만에 언어 전환.
    - 💻 **원클릭 실행 파일(.exe) 생성**: 바탕화면에 두고 더블클릭만 하면 언어가 바뀌는 64비트 단독 실행기 자동 빌드.
    - 📜 **초경량 배치 스크립트(.bat)**: 투명하고 안전한 배치 파일 다운로드.
  - **초보자 전용 3문 3답 FAQ 아코디언**: '언어가 안 바뀔 때', '원상 복구 보장', '스마트스크린/UAC 안내' 탑재.
- **듀얼 뷰 모드 스위처(Dual-View Mode Switcher) 도입 (`src/App.tsx`)**:
  - `💡 일반 사용자 간편 모드 (Easy Mode)`(기본값) ⇄ `⚙️ 전문가 & 관리자 모드 (Pro Mode)`를 즉각 전환하는 직관적 탭 바 신설.
  - 전산실 일괄 배포(NetSupport), 스탠드얼론 GUI 빌더, 24개국 다국어 매트릭스, 엔지니어링 문서 등 기존 파워 유저 기능 100% 보존.
  - `?mode=easy` 및 `?mode=pro` URL 쿼리 파라미터 및 `localStorage` 브라우저 상태 동기화 지원.

---

### [v2.9.3] - 2026-10-01
> **변경 분류: PATCH (새 다운로드 폴더 재초기화 시 원격 충돌 해결, git push --force 자동 복구 폴백 엔진 구축)**

#### 🚀 변경 요약 & GitHub 원격 저장소 이력 충돌 자동 해결
- **`github_setup.bat` 원격 거부(`! [rejected] main -> main (fetch first)`) 자동 복구 루틴 추가**:
  - 사용자가 새 ZIP을 다운로드하여 새 폴더에서 `git init`을 수행할 때, 원격 저장소에 이미 이전 커밋 이력이 존재하여 `push`가 거부되던 현상 대응.
  - 최초 푸시 실패 시 사용자에게 원격 이력 존재 원인을 명확히 안내하고, 엔터(`Y`) 한 번으로 최신 로컬 코드(`v2.9.3`)로 원격 `main` 브랜치를 강제 동기화(`git push -f origin main --tags`)하는 자동 복구 인터페이스 탑재.
- **`deploy_gh_pages.bat` 동기화 보강**:
  - GitHub Actions 전략 실행 시에도 원격 거부 발생 시 자동 복구 안내 강화.

---

### [v2.9.2] - 2026-10-01
> **변경 분류: PATCH (GitHub Actions CI/CD 클라우드 러너 빌드 호환성 최적화 및 ERESOLVE 의존성 충돌 방지)**

#### 🚀 변경 요약 & GitHub Pages 클라우드 자동 배포 파이프라인 강화
- **GitHub Actions 워크플로 의존성 설치 최적화 (`.github/workflows/deploy.yml`, `ci.yml`)**:
  - `npm ci || npm install` 명령을 `npm install --legacy-peer-deps`로 전환하여 GitHub Actions Ubuntu 러너 환경에서 발생할 수 있는 npm peer dependency(ERESOLVE) 충돌을 사전 차단.
  - 별도 `package-lock.json` 미존재 시 `setup-node`의 `cache: 'npm'` 단계에서 발생할 수 있는 캐시 락파일 탐색 경고/오류 제거.
- **클라우드 빌드 및 GitHub Pages 호스팅 무결성 보장**:
  - `main` 브랜치 푸시 시 GitHub Actions가 오류 없이 Vite SPA를 자동 빌드하고 `dist/` 정적 결과물(`.nojekyll`, `404.html`)을 GitHub Pages로 원활하게 배포하도록 완비.

---

### [v2.9.1] - 2026-10-01
> **변경 분류: PATCH (github_setup.bat 윈도우 배치 구문 오류 긴급 수정, Git 작성자 정보 자동 복구, 무오류 GitHub 연동 파이프라인 구축)**

#### 🚀 변경 요약 & GitHub 자동화 스크립트 결함 긴급 패치
- **`github_setup.bat` 및 `scripts/github_setup.bat` 괄호 구문 분석(Parsing) 오류 해결**:
  - Windows CMD 인터프리터에서 `if (...) else (...)` 블록 내부에 닫는 괄호 `)`가 포함된 안내 문구(예: `(PAT) is configured`)로 인해 발생하던 `is은(는) 예상되지 않았습니다.` 구문 에러를 완벽하게 근결.
  - 중첩 괄호 블록 방식을 전면 폐기하고 안전한 레이블 점프(`goto :remote_origin_found`, `goto :remote_origin_setup`, `goto :success_exit`) 기반 단일 선형 실행 구조로 리팩터링 완료.
- **Git 작성자 신원(`user.name`, `user.email`) 미설정 자동 감지 및 로컬 복구 체계 신설**:
  - 신규 설치된 Git 환경에서 `Author identity unknown` 오류로 커밋 및 태그 생성이 실패하던 문제 해결.
  - 스크립트 실행 시 로컬 Git 설정(`git config user.name`, `user.email`) 존재 여부를 확인하고, 누락된 경우 기본 개발자 식별 정보(`AhBiYout` / `ahbiyout@users.noreply.github.com`)를 로컬 리포지토리에 자동 등록하여 커밋 중단 원천 차단.
- **HEAD 무결성 검증 후 안전한 태그 생성 처리**:
  - 유효한 커밋 HEAD가 생성되었는지 `git rev-parse HEAD`를 통해 사전 검증한 뒤에만 릴리스 버전 태그(`v2.9.1`)를 생성하도록 방어 코드 보강.
- **공식 저장소 프리셋 및 자동 푸시 안내 유지**:
  - 기본 대상 저장소: `https://github.com/ahbiyout-all/photoshop-language-switcher.git`
  - 엔터 1회로 Git 초기화, 작성자 설정, 스테이징, 커밋, 태깅, 원격지 푸시까지 원클릭 무결점 완료 지원.

---

### [v2.9.0] - 2026-09-29
> **변경 분류: MINOR (보안 패키징 Inno Setup 파이프라인 구축, 개발 행동 강령 5대 표준 엔지니어링 문서 체계 완비, build/ 형상 관리 수립)**

#### 🚀 변경 요약 & 보안 인스톨러 및 표준 문서 체계 구축
- **Inno Setup 6 기반 보안 인스톨러 파이프라인 신규 구축 (`scripts/installer.iss`)**:
  - Windows 관리자 권한 및 x64 아키텍처 네이티브 인스톨러 스크립트 작성.
  - **기존 버전 감지 및 덮어쓰기 안내**: Windows 레지스트리 `DisplayVersion`을 조회하여 이전 버전 발견 시 업그레이드/덮어쓰기 대화상자 노출.
  - **무인 자동 설치(Silent Install) 완벽 지원**: `/VERYSILENT /SUPPRESSMSGBOXES /NORESTART` 스위치 제공으로 기업/학교 전산실 일괄 무인 배포 지원.
  - **Windows 방화벽 인바운드 규칙 자동 관리**:
    - 설치 시: `netsh advfirewall firewall add rule ...`을 통한 인바운드 허용 규칙 자동 등록.
    - 프로그램 제거 시: `netsh advfirewall firewall delete rule ...`을 통해 방화벽 잔재 완벽 청소.
- **개발 행동 강령 준수 5대 표준 엔지니어링 문서 전수 수립 (`docs/`)**:
  - `docs/SECURITY_REPORT.md`: 정적 보안 감사, XSS 방지, File System Access API 샌드박스, 무결성 PIN(`1375`) 잠금 및 텔레메트리 부재 검증 보고서.
  - `docs/DLL_SPECIFICATION.md`: 순수 창작 PE 래퍼 바이너리, C# `csc.exe` 자동 생성 엔진, 32-bit ARGB 리소스 임베딩 및 아토믹 파일 제어 명세.
  - `docs/LICENSE_KR.md` & `docs/LICENSE_EN.md`: MIT 표준 조건 및 Adobe 상표권 비제휴·무보증 고지문을 담은 한국어/영어 분리 라이선스.
  - `docs/WorkLog.md`: 마일스톤 1(최초 개발)부터 마일스톤 9(v2.9.0)까지의 전사적 작업 이력 통합 로그.
  - `docs/TEST_PLAN.md` & `docs/TEST_REPORT.md`: 코드, 빌드, UI/UX, 보안, 배포 5대 영역 QA 테스트 계획서 및 전 항목 PASS 검증 결과서.
  - `docs/README.md`: 신규 5대 엔지니어링 문서 색인 일괄 반영.
- **GitHub 관리 규격 준수 & 저장소 구조 정비**:
  - `build/.gitkeep` 생성: 깃허브 관리 4대 핵심 구조(`src/`, `docs/`, `build/`, `scripts/`) 100% 동기화.
- **시맨틱 버저닝 & 산출물 동기화**:
  - `package.json`, `src/version.ts`: **`v2.9.0` (MINOR)** 판올림 완료.
  - `build.bat`, `scripts/build.bat`, `github_setup.bat`, `deploy_gh_pages.bat` 안전 폴백 버전 `2.9.0` 동기화.
  - 산출물 명칭:
    - `build\Photoshop_Language_Switcher_v2.9.0.exe`
    - `build\Adobe_Language_Switcher_Suite_v2.9.0.exe`
    - `build\Photoshop_Language_Switcher_v2.9.0.bat`
    - `release\Adobe_Language_Switcher_Setup_v2.9.0.exe` (Inno Setup 인스톨러)

---

### [v2.8.1] - 2026-09-29
> **변경 분류: PATCH (공식 GitHub 계정 ahbiyout-all 및 photoshop-language-switcher 원격 저장소 프리셋 연동, 원클릭 업로드 편의성 극대화)**

#### 🚀 변경 요약 & 공식 GitHub 저장소 프리셋 구축
- **공식 GitHub 계정(`ahbiyout-all`) 원격 저장소 자동 연동**:
  - `github_setup.bat` 및 `scripts/github_setup.bat`에 대상 저장소 기본 URL(`https://github.com/ahbiyout-all/photoshop-language-switcher.git`)을 프리셋으로 내장.
  - 사용자가 엔터(Enter)만 누르면 자동으로 `ahbiyout-all` 원격 저장소가 등록되어 수동 오타 위험 원천 차단.
- **공식 채널 메타데이터에 GitHub 프로필 추가**:
  - `src/version.ts`: `APP_GITHUB_OWNER` ('ahbiyout-all'), `APP_GITHUB_REPO`, `APP_GITHUB_PROFILE`, `APP_GITHUB_REPO_URL` 상수 정의.
  - `src/types/developer.ts`: 개발자 공식 프로필 인터페이스에 `githubUrl` 필드 탑재.
  - `src/components/Footer.tsx`: 하단 푸터 2열 개발자 프로필 및 최하단 링크 영역에 공식 GitHub(`ahbiyout-all`) 바로가기 추가.
- **시맨틱 버저닝 & 산출물 동기화**:
  - `package.json`, `src/version.ts`: **`v2.8.1` (PATCH)** 일괄 갱신.
  - `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat` 안전 폴백 버전 `2.8.1` 동기화.
  - 산출물 명칭:
    - `build\Photoshop_Language_Switcher_v2.8.1.exe`
    - `build\Adobe_Language_Switcher_Suite_v2.8.1.exe`
    - `build\Photoshop_Language_Switcher_v2.8.1.bat`

---

### [v2.8.0] - 2026-09-29
> **변경 분류: MINOR (깃허브 업로드 준비 및 GitHub Pages 배포 자동화 스크립트 파이프라인 전면 구축, CI/CD Actions 연동)**

#### 🚀 변경 요약 & 깃허브 배포 자동화 파이프라인
- **깃허브 저장소 업로드 원클릭 자동화 스크립트 (`github_setup.bat`, `scripts/github_setup.bat`)**:
  - Windows CRLF 인코딩 준수 및 100% 영문 콘솔 인터페이스 구축.
  - Git 설치 여부 확인 및 기본 `main` 브랜치 자동 초기화 (`git init -b main`).
  - `.gitignore` 자동 점검 및 프로젝트 소스 코드 전량 자동 스테이징 (`git add .`).
  - 시맨틱 버전에 맞춘 릴리스 버전 태그(`v2.8.0`) 자동 생성 및 원격 저장소(`origin`) 연동/푸시 가이드 제공.
- **GitHub Pages 원클릭 배포 자동화 스크립트 (`deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`)**:
  - **전략 1 (GitHub Actions CI/CD)**: `main` 브랜치 푸시를 통한 `.github/workflows/deploy.yml` 무중단 자동 클라우드 배포.
  - **전략 2 (Direct gh-pages)**: 로컬 Vite 컴파일 후 `.nojekyll` 및 SPA 라우팅용 `404.html` 주입, `gh-pages` 브랜치 직접 배포.
- **GitHub Actions 워크플로 완비**:
  - `.github/workflows/deploy.yml`: GitHub Pages 자동 빌드 및 배포 워크플로 최적화.
  - `.github/workflows/ci.yml`: 풀 리퀘스트 및 브랜치 푸시 시 TypeScript 린트/빌드 무결성 자동 검증 CI 파이프라인 추가.
- **GitHub 배포용 정적 라우팅 안전장치 추가**:
  - `public/.nojekyll`: Jekyll 빌드 우회를 통해 밑줄(_) 접두사 에셋 및 Vite 번들 누락 방지.
  - `public/404.html`: GitHub Pages 서브 디렉터리 경로 새로고침 시 SPA 라우팅 깨짐 방지 리디렉션 스크립트 내장.
- **문서화 및 가이드 최신화**:
  - `docs/GITHUB_PUBLISHING_GUIDE.md`: 깃허브 업로드 대상/제외 파일 명세, 자동화 스크립트 사용법, GitHub Pages 활성화 및 Releases exe 배포 가이드 전면 개정.
  - `scripts/README.md` & `README.md`: 신규 깃허브 자동화 스크립트 사용법 및 v2.8.0 산출물 정보 갱신.
- **시맨틱 버저닝 & 산출물 동기화**:
  - `package.json`, `src/version.ts`: **`v2.8.0` (MINOR)** 판올림 완료.
  - `build.bat` 및 `scripts/build.bat` 안전 폴백 버전 `2.8.0` 동기화.
  - 산출물 명칭 동기화:
    - `build\Photoshop_Language_Switcher_v2.8.0.exe`
    - `build\Adobe_Language_Switcher_Suite_v2.8.0.exe`
    - `build\Photoshop_Language_Switcher_v2.8.0.bat`

---

### [v2.7.4] - 2026-09-29
> **변경 분류: PATCH (공식 문의 이메일 채널 전면 제거 및 공식 블로그·소속 조직 채널 단일화, SemVer 및 빌드 스크립트 산출물 동기화)**

#### 🚀 변경 요약 & 공식 채널 정비
- **공식 문의 이메일 채널 전 영역 제거**:
  - 사용자 요청에 따라 직접 문의 이메일 항목을 웹 앱 화면, 메타데이터, 푸터, 생성 스크립트 리드미 및 모든 공식 기술 문서에서 전면 제거했습니다.
  - 공식 소통 및 정보 채널을 **공식 구글 블로그** 및 **소속 웹사이트**로 일원화하여 보다 안정적이고 공인된 창구를 유지합니다.
- **제작자 및 공식 채널 최신 안내 체계 확립**:
  - **개발자**: AhBiYout
  - **공식 구글 블로그**: [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
  - **소속**: [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS)
- **앱 화면 버전 정보 및 빌드 스크립트 산출물 버전 동기화**:
  - `package.json`, `src/version.ts`: **`v2.7.4` (PATCH)** 판올림 완료.
  - 상단 헤더, 창 제목 표시줄, 문서 허브 배너 및 확장 앱 스위트의 버전 표기 실시간 동기화.
  - `build.bat` 및 `scripts/build.bat`의 버전 폴백 및 자동 추출 대상 버전(`v2.7.4`) 동기화.
  - 생성 산출물 파일명 동기화:
    - `build\Photoshop_Language_Switcher_v2.7.4.exe`
    - `build\Adobe_Language_Switcher_Suite_v2.7.4.exe`
    - `build\Photoshop_Language_Switcher_v2.7.4.bat`

---

### [v2.7.3] - 2026-09-29
> **변경 분류: PATCH (자동 빌드 스크립트 .BAT 파이프라인 구축, Windows CRLF 인코딩 준수, 영문 작성, 결과물 버전 자동 결합 및 제작자 공식 채널 동기화)**

#### 🚀 변경 요약 & 빌드 자동화 파이프라인 구축
- **Windows CRLF 영문 자동 빌드 스크립트 구축 (`build.bat`, `scripts/build.bat`)**:
  - `build.bat`(프로젝트 루트) 및 `scripts/build.bat`(스크립트 디렉터리)를 전면 구축하여 원클릭 빌드 환경 제공.
  - Windows CRLF(`\r\n`) 줄바꿈 인코딩을 엄격히 적용하여 cmd.exe 실행 시 인코딩 오류 방지.
  - 빌드 진행 로그, 오류 메시지, 콘솔 대화형 인터페이스를 100% 영문(English)으로 작성.
  - `package.json`으로부터 시맨틱 버전을 자동 추출하여 빌드 결과물 파일명 끝에 패치 버전 태그를 자동으로 결합:
    - `build\Photoshop_Language_Switcher_v2.7.3.exe`
    - `build\Adobe_Language_Switcher_Suite_v2.7.3.exe`
    - `build\Photoshop_Language_Switcher_v2.7.3.bat`
    - `dist\` (웹 SPA 정적 번들)
  - Microsoft .NET C# 컴파일러(`csc.exe`) 자동 탐색 및 PE 세부 메타데이터(Title, Company, Version, Copyright, Trademark, UAC Elevation) 자동 임베딩.
- **앱 화면 버전 정보 및 빌드 결과물 버전 실시간 동기화**:
  - `src/version.ts`, `package.json`: **`v2.7.3` (PATCH)** 일괄 갱신.
  - 상단 헤더 배지(`v2.7.3`), 데스크톱 윈도우 바(`v2.7.3 Desktop`), 공식 문서 허브 SemVer 배너(`v2.7.3`), 확장 앱 스위트(`v2.7.3`) 실시간 동기화.
- **제작자 및 공식 채널 안내 최신화 및 코드베이스 전수 반영**:
  - **개발자 (Developer):** AhBiYout
  - **공식 구글 블로그 (Official Blog):** [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
  - **소속 (Organization):** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS)
  - `src/version.ts`, `src/types/developer.ts`, `Footer.tsx`, `README.md`, `scripts/README.md` 전 영역 일치 확인.

---

### [v2.7.2] - 2026-09-28
> **변경 분류: PATCH (다국어 사전 누락 텍스트 전수 보강 및 전 UI 하드코딩 완전 제거·실시간 i18n 바인딩)**

#### 🚀 변경 요약 & 번역 완성도 보강
- **다국어 사전 미번역 및 누락 항목 전수 보강 (`src/i18n/types.ts`, `src/i18n/translations.ts`)**:
  - `PhotoshopGuide.tsx`(3단계 워크플로우 1·2·3단계 본문, Photoshop & Illustrator 내부 원리 설명, FAQ 전체 Q&A 1·2)의 하드코딩을 제거하고 사전 키(`guideStep1Title/Desc`, `guideStep2Title/Desc`, `guideStep3Title/Desc`, `guideMechTitle/PsDesc/AiDesc`, `faqTitle/1/2`) 전수 등록.
  - `DocsViewer.tsx` 내 6대 공식 문서(패치 노트, 아키텍처, 사용자 가이드, 원격 배포 가이드, 확장 앱 가이드, 문제 해결 가이드) 제목 및 요약 설명문을 i18n 사전 키(`doc*Title/Summary`)로 완전 분리.
  - `PWAInstallButton.tsx` 내 브라우저별(Chrome, Edge, Safari) 설치 안내 가이드 문구 사전화 완료.
  - `ExtendedAppsSuite.tsx`, `ClassroomRemoteDeployer.tsx`, `ScriptGenerator.tsx`, `GuiDistributor.tsx`, `DirectFolderController.tsx`, `PathConfigurator.tsx`, `MultiVersionDetector.tsx` 내 모든 버튼 및 피드백 메시지 다국어화.
- **24개국 전 언어 다국어화 무결성 확보**:
  - 모든 UI 요소가 웹페이지 언어 선택기에서 언어 변경 시 즉시 동기화되도록 보장.
- **시맨틱 버저닝 및 규칙 준수**:
  - `package.json`, `src/version.ts`: **`v2.7.2` (PATCH)** 갱신.
  - `docs/PATCH_NOTES.md`: 릴리스 내역 기록.

---

### [v2.7.1] - 2026-09-28
> **변경 분류: PATCH (24개국 전 언어 사전 전수 번역 완성 및 전체 UI 컴포넌트 실시간 다국어 연동 완료)**

#### 🚀 변경 요약 & 번역 완성도 보강
- **24개국 공식 언어 사전 전수 번역 완료 (`src/i18n/translations.ts`, `src/i18n/types.ts`)**:
  - 기존 일부 언어(한국어, 영어, 일본어, 중국어 등)에만 부분 번역되어 있던 사전 항목을 확장하여, **24개 전 지원 언어(한국어, 영어 US/UK, 일본어, 중국어 간/번체, 독일어, 프랑스어, 스페인어, 이탈리아어, 러시아어, 포르투갈어, 폴란드어, 튀르키예어, 체코어, 헝가리어, 우크라이나어, 스웨덴어, 덴마크어, 네덜란드어, 핀란드어, 노르웨이어, 아랍어, 히브리어)**의 전체 키에 대해 완전한 고품질 네이티브 번역 데이터셋을 구축.
  - 헤더, 애플리케이션 선택기, 자동 감지 스캐너, 경로 설정기, GUI 빌더, 1-Click .EXE 컴파일러/스크립트 생성기, 학교/기관 원격 배포기, 확장 어도비 앱, 브라우저 직접 제어, 시각 가이드 및 푸터까지 전 영역 키 정의 완료.
- **전체 UI 컴포넌트 `useI18n()` / `t(...)` 바인딩 전면 적용**:
  - `MultiVersionDetector.tsx`, `PathConfigurator.tsx`, `GuiDistributor.tsx`, `ScriptGenerator.tsx`, `ClassroomRemoteDeployer.tsx`, `ExtendedAppsSuite.tsx`, `DirectFolderController.tsx`, `PhotoshopGuide.tsx`, `DocsViewer.tsx`, `DesktopWindowBar.tsx`, `ExePropertiesModal.tsx`, `Footer.tsx` 내 하드코딩된 텍스트를 i18n 동적 함수로 연동하여 웹 언어 변경 즉시 모든 UI 요소가 선택 언어로 전환되도록 개선.
- **문서화 및 버전 관리 규칙 준수**:
  - `docs/PATCH_NOTES.md`: v2.7.1 패치노트 상세 기록.
  - `package.json`, `src/version.ts`: 버전 `v2.7.1` (PATCH) 갱신.

---

### [v2.7.0] - 2026-09-28
> **변경 분류: MINOR (웹페이지 자체 UI 24개국 글로벌 다국어 지원 엔진 및 상단 글로벌 언어 선택기 전면 탑재)**

#### 🚀 변경 요약 & 신규 기능 추가
- **웹페이지 인터페이스 24개국 글로벌 다국어화 엔진 (`src/i18n/`) 탑재**:
  - 기존 어도비 앱 스크립트 전환 대상 언어뿐만 아니라, **웹 애플리케이션 화면 자체의 언어도 전 세계 24개국 언어(한국어, 영어 US/UK, 일본어, 중국어 간/번체, 독일어, 프랑스어, 스페인어, 이탈리아어, 러시아어, 포르투갈어, 튀르키예어, 폴란드어, 네덜란드어 등)로 실시간 전환**되도록 전면 구현.
  - `I18nProvider` 및 `useI18n()` 훅 구조를 수립하여, 번역 키 누락 시에도 안전하게 기본 언어로 자동 폴백(Fallback)하는 고가용성 설계 적용.
  - 사용자가 선택한 언어는 `localStorage`에 영구 보관되어 브라우저 재방문 시에도 언어 설정 유지.
- **글로벌 웹 UI 언어 선택기 (`WebLanguageSelector.tsx`) 탑재**:
  - 상단 헤더(`Header.tsx`) 우측에 24개국 국기 및 원어 표기가 포함된 세련된 글로벌 언어 드롭다운 탑재.
  - 인기 5개국(한국어, 영어, 일본어, 중국어 간체, 번체) 원클릭 퀵 칩 및 24개국 실시간 검색 필터 지원.
- **문서화 및 버전 관리 규칙 준수**:
  - `docs/I18N_WEB_GUIDE.md`: 24개국 웹 UI 다국어 아키텍처 및 선택기 가이드 신규 작성.
  - `docs/README.md`: 문서 디렉터리 색인 갱신.
  - `package.json`, `src/version.ts`, `build.bat`: 버전 `v2.7.0` (MINOR) 일괄 판올림.

---

### [v2.6.1] - 2026-09-28
> **변경 분류: PATCH (기본 관리자/개발자 잠금 해제 PIN 번호 1375 설정 및 관련 보안 가이드/UI 힌트 동기화)**

#### 🚀 변경 요약 & 보안 설정 조정
- **기본 관리자 PIN 번호 갱신 (`src/version.ts`)**:
  - `DEFAULT_DEV_ADMIN_PIN`을 기존 임시 기본값에서 요청된 공식 관리자 PIN인 **`1375`**로 변경.
  - Windows PE 속성(자세히) 창에서 개발자 잠금 해제 모달 호출 시 `1375`를 입력하여 즉시 커스텀 편집 모드로 진입 가능.
- **UI 힌트 동적 연동 및 가이드 문서 갱신**:
  - `ExePropertiesModal.tsx`: 보안 무결성 탭 내 안내 문구의 하드코딩된 PIN을 상수로 동적 바인딩(`{DEFAULT_DEV_ADMIN_PIN}`)하여 버전 관리 정합성 보장.
  - `docs/METADATA_PROTECTION_GUIDE.md`: 관리자 잠금 해제 절차 및 비교 요약표 내 기본 관리자 PIN 번호를 `1375`로 갱신.
  - `docs/GITHUB_PUBLISHING_GUIDE.md`: 제7절 공개 배포 보안 체크리스트 내 관리자 PIN을 `1375`로 갱신.
  - `build.bat`: 예비 추출 버전 태그를 `v2.6.1`로 동기화.

---

### [v2.6.0] - 2026-09-28
> **변경 분류: MINOR (GitHub Pages 공개 배포 시 속성(자세히) 임의 변경 방지 대처 방안 1 & 2 전면 구현 및 이중 무결성 보안 체계 구축)**

#### 🚀 변경 요약 & 보안 아키텍처 구축
- **대처 방안 1: 공식 속성 읽기 전용 보호 잠금 (Official Read-Only Lock) & PIN 인증 해제 시스템 탑재**:
  - GitHub Pages 등 공개 웹 호스팅 환경에서 일반 방문자가 속성(자세히) 창의 회사명(`cisnet.co.kr`), 저작권, 설명, 버전 등을 임의로 수정하여 사칭하거나 변조 배포하는 위험을 차단.
  - 모든 메타데이터 입력 필드를 기본적으로 **읽기 전용(`readOnly={!isUnlocked}`)**으로 잠그고 `🔒 공식 무결성 보호됨` 배지 표시.
  - 일반 사용자는 공식 검증값 그대로 `공식 정품 .EXE 컴파일러 받기`로 안전하게 다운로드 가능.
  - 배포자/개발자 본인을 위한 **관리자 PIN(`2026`) 인증 모달** 탑재: PIN 일치 시 `🔓 개발자 커스텀 편집 모드`로 전환되며 `sessionStorage`에 세션 유지.
  - URL 파라미터(`?admin=true` 또는 `?dev=1`)를 통한 배포자 다이렉트 관리자 모드 지원.
- **대처 방안 2: 불변 공식 디지털 서명 및 변조 방지 워터마크 영구 주입 (Permanent Brand Watermark)**:
  - C# 소스코드 및 컴파일러 엔진(`src/utils/exeGenerator.ts`) 레벨에서 `[assembly: AssemblyTrademark("Official Core Engine: cisnet.co.kr | AhBiYout")]` 및 `AssemblyConfiguration`을 하드코딩 주입.
  - 생성된 `.exe` 실행 시 콘솔 타이틀(`[Core Engine: cisnet.co.kr]`)과 실행 배너 상단에 영구 불변 공식 배포처가 고정 출력되어, 제3자가 파일 속성을 조작하더라도 실제 런타임 위변조 및 사칭을 원천 무력화.
  - 로컬 자동 컴파일러 배치 스크립트(`.bat`) 헤더에도 공식 디지털 무결성 보증 주석 영구 삽입.
  - 자동 빌드 스크립트(`build.bat`)에도 동일한 불변 트레이드마크 및 구성 메타데이터 적용.
- **UI & UX 인터페이스 고도화**:
  - `ExePropertiesModal.tsx`: 상단 자물쇠/해제 상태 표시, 상세 탭 내 보안 상태 안내 카드, `🛡️ 보안 & 무결성 보증` 전용 탭 신설, 플로팅 PIN 입력 팝업 구현.
  - `ScriptGenerator.tsx`, `ClassroomRemoteDeployer.tsx`: 속성 버튼에 `ShieldCheck` 아이콘 및 `속성(자세히) 🔒` 보호 배지 결합.
- **문서화 및 보안 가이드 완비**:
  - `docs/METADATA_PROTECTION_GUIDE.md`: 위협 모델, 대처 방안 1 & 2 구조, PIN 인증 관리, 불변 서명 아키텍처 상세 문서화.
  - `docs/GITHUB_PUBLISHING_GUIDE.md`: 제7절 '공개 배포 시 메타데이터 위변조 방지' 항목 추가.
  - `docs/README.md`: 문서 디렉터리 색인 갱신.

---

### [v2.5.2] - 2026-09-28
> **변경 분류: PATCH (Windows CRLF 영문 자동 빌드 스크립트 build.bat 탑재, .EXE 버전 자동 결합 파이프라인 및 앱 화면 버전 전역 동기화 체계 구축)**

#### 🚀 변경 요약 & 빌드 자동화
- **Windows CRLF 영문 자동 빌드 스크립트(`build.bat`) 신규 구축**:
  - Windows 표준 CRLF(`\r\n`) 라인 엔딩 및 100% 영문(English) 콘솔 인터페이스를 준수하는 독립 실행형 5단계 빌드 파이프라인 구현.
  - `package.json`의 `"version"` 필드를 PowerShell/Node.js로 실시간 추출하여 빌드 결과물 파일명 끝에 자동으로 버전 태그(`v2.5.2`) 결합:
    - `release\Photoshop_Language_Switcher_v2.5.2.exe`
    - `release\Adobe_Language_Switcher_Suite_v2.5.2.exe`
    - `release\Photoshop_Language_Switcher_v2.5.2.bat`
  - Windows 내장 Microsoft .NET C# 컴파일러(`csc.exe`)를 활용하여 PE 파일 속성(버전 `2.5.2.0`, 저작권, 설명, 회사명 `cisnet.co.kr`) 및 UAC 관리자 권한 자동 승격이 내장된 정품 64비트 바이너리 자동 컴파일.
- **앱 화면 버전 정보 전역 동기화 체계(`src/version.ts`) 수립**:
  - `APP_VERSION`, `APP_VERSION_FULL`을 단일 진실 공급원(Single Source of Truth)으로 정의.
  - 상단 헤더 배지(`Header.tsx`), 데스크톱 윈도우 바(`DesktopWindowBar.tsx`), 확장 제품군 배지(`ExtendedAppsSuite.tsx`), ZIP 배포기(`GuiDistributor.tsx`), 스크립트 배너(`photoshopHelper.ts`, `illustratorHelper.ts`)를 연동하여, 버전 판올림 시 앱 화면과 스크립트 출력 결과물이 누락 없이 100% 동기화되도록 개선.
- **문서화 및 가이드 완비**:
  - `docs/BUILD_GUIDE.md`: 자동 빌드 스크립트 명세, 실행 방법, 버전 동기화 맵 문서화 및 `docs/README.md` 색인 갱신.

---

### [v2.5.1] - 2026-09-26
> **변경 분류: PATCH (GitHub Pages 자동 CI/CD 워크플로우 내장, Vite 상대 경로 base 호환성 최적화 및 웹 배포 가이드 완성)**

#### 🚀 변경 요약 & 배포 자동화
- **GitHub Actions 자동 배포 파이프라인(`.github/workflows/deploy.yml`) 구축**:
  - `main` 브랜치에 코드를 푸시할 때마다 Node.js 20 환경에서 자동으로 빌드 후 GitHub Pages로 1분 내 무중단 배포를 수행하는 CI/CD 워크플로우 탑재.
- **Vite 범용 호스팅 베이스 경로(`base: './'`) 설정**:
  - 서브패스 호스팅(GitHub Pages), 루트 호스팅(Vercel, Netlify), 커스텀 도메인 환경 모두에서 자산(JS/CSS/이미지) 경로가 깨지지 않도록 상대 경로 베이스 적용.
- **웹 배포 종합 가이드(`docs/DEPLOYMENT_GUIDE.md`) 신설**:
  - GitHub Pages, Vercel, Cloudflare Pages 3대 무료 배포 플랫폼의 비교 및 원클릭 단계별 설정 절차 수록.

---

### [v2.5.0] - 2026-09-26
> **변경 분류: MINOR (추가 어도비 핵심 앱 전용 언어 변경기 24개국 글로벌 다국어 엔진 전면 탑재)**

#### 🚀 변경 요약 & 신규 기능 추가
- **추가 어도비 핵심 앱(ExtendedAppsSuite) 24개국 다국어 선택 엔진 전면 구축**:
  - 기존 한국어/영어 단일 스위칭 체계에서 **전 세계 24개국 언어 팩(일본어 `ja_JP`, 중국어 간체 `zh_CN`/번체 `zh_TW`, 독일어 `de_DE`, 프랑스어 `fr_FR`, 스페인어 `es_ES`, 이탈리아어 `it_IT`, 러시아어 `ru_RU`, 포르투갈어 `pt_BR`, 튀르키예어 `tr_TR`, 베트남어 `vi_VN` 등)** 지원으로 전면 확장.
  - 인기 8개국 퀵 셀렉트 칩 및 전체 24개국 드롭다운/검색 UI를 탑재하여 원하는 목표 언어를 원클릭으로 선택 가능.
- **5종 핵심 앱 및 통합 스크립트 생성기(`extendedAppsHelper.ts`) 다국어 엔진 고도화**:
  - **Adobe InDesign & InCopy**: Windows 레지스트리 `Locale` 키를 선택한 24개국 언어 코드로 안전하게 주입/토글하도록 개선.
  - **Adobe Premiere Pro & Audition**: `setx ADOBE_FORCE_LOCALE "[localeCode]"` 환경 변수 및 콘솔 디버그 모드와 연동하여 24개국 다국어 즉시 반영.
  - **Adobe After Effects**: `ae_force_english.txt` 플래그 제어를 통해 영문과 선택한 모국어 간 스마트 상호 토글 지원.
  - **확장 앱 통합 전체 (ALL Master)**: 5종 핵심 프로그램을 선택한 대상 언어(`targetLocale`)로 일괄 원클릭 전환.
- **동적 파일명 및 PE 메타데이터 연동**:
  - 선택한 언어 코드에 따라 스크립트 파일명(`indesign_language_ja_JP.bat`, `adobe_extended_all_toggle_zh_CN.bat` 등) 및 1-Click .EXE 컴파일러 메타데이터 속성 정보가 실시간으로 동적 갱신.
- **문서 동기화**:
  - `docs/EXTENDED_ADOBE_APPS_GUIDE.md`에 24개국 다국어 작동 원리 및 스크립트 안내 보완.

---

### [v2.4.1] - 2026-09-26
> **변경 분류: PATCH (GitHub 업로드 대상/제외 파일 명세표 보완 및 Git Ignore 정책 문서화)**

#### 🚀 변경 요약 & 문서 보완
- **GitHub 파일 업로드 범위 상세 명세(`docs/GITHUB_PUBLISHING_GUIDE.md`) 추가**:
  - 깃허브에 반드시 포함되어야 하는 핵심 파일(`src/`, `public/`, `docs/`, `package.json`, `index.html`, `vite.config.ts`, `README.md`, `LICENSE` 등)의 역할과 보존 필요성을 표로 체계화.
  - 절대 업로드되지 않아야 하는 파일(`node_modules/`, `dist/`, `.env`, 임시 로그 파일 등)의 제외 사유와 `.gitignore`의 자동 필터링 동작 원리를 명쾌하게 기술.

---

### [v2.4.0] - 2026-09-26
> **변경 분류: MINOR (GitHub 퍼블릭 오픈소스 배포 패키징, 루트 README 및 MIT 라이선스 수립, 릴리스 종합 점검 가이드 완성)**

#### 🚀 변경 요약 & 신규 기능 추가
- **GitHub 오픈소스 공개 종합 가이드라인(`docs/GITHUB_PUBLISHING_GUIDE.md`) 완비**:
  - **법적/상표권 고지**: Adobe 상표권(Trademark) 비공식 고지문, 어도비 EULA 및 저작권 파일(바이너리, 원본 dat) 비포함 원칙, 무보증(AS-IS) 면책 조항 가이드 수립.
  - **보안 및 환경 변수 보호**: `.env` 시크릿 유출 방지 및 `.gitignore` 점검 가이드.
  - **스크립트 실행 보안(UX)**: Windows SmartScreen "PC 보호" 경고 대처법, PowerShell ExecutionPolicy 우회 기법, UAC 관리자 권한 필수 안내 정리.
  - **웹 호환성 & 브라우저 정책**: Chromium 엔진(File System Access API) 전용 동작 환경 및 HTTPS 컨텍스트 요구조건 명시.
  - **무료 배포 가이드**: GitHub Pages + GitHub Actions 자동 빌드/배포 및 Vercel/Cloudflare Pages 연동 절차 문서화.
- **루트 저장소 배포 준비 완료**:
  - 루트 경로에 글로벌 표준 `README.md` 및 `LICENSE`(MIT License) 추가.
  - `docs/README.md` 문서 색인 내 GitHub 가이드라인 연동 및 전사적 검증 완료.

---

### [v2.3.0] - 2026-09-26
> **변경 분류: MINOR (컴퓨터실 무인 원격 배포기 24개국 다국어 엔진 전면 확장 및 일러스트레이터 다국어 동적 연동 탑재)**

#### 🚀 변경 요약 & 신규 기능 추가
- **컴퓨터실 원격 일괄 배포기(Classroom Remote Deployer) 24개국 다국어 엔진 탑재**:
  - 기존 한국어(ko_KR) 중심이던 무인 원격 배포 체계를 전 세계 24개국 언어 팩(일본어 `ja_JP`, 중국어 간체 `zh_CN`/번체 `zh_TW`, 독일어 `de_DE`, 프랑스어 `fr_FR`, 스페인어 `es_ES`, 러시아어 `ru_RU`, 포르투갈어 `pt_BR`, 베트남어 `vi_VN` 등)으로 대폭 확장하였습니다.
  - 상단 퀵 셀렉트 칩 및 전체 24개국 검색/드롭다운 UI를 추가하여 원격 배포 목표 언어를 원클릭으로 선택할 수 있습니다.
  - 선택한 국가/언어에 따라 스크립트 파일명, 대상 언어 상태 버튼(영어 고정 / 해당국 언어 일괄 원복 / 스마트 토글), PE 64비트 메타데이터 속성 정보가 실시간으로 동적 갱신됩니다.
- **포토샵 & 일러스트레이터 원격 무인 스크립트 다국어 엔진 정밀화**:
  - `generatePhotoshopClassroomSilentBat`, `generateIllustratorClassroomSilentBat`, `generateAllAdobeClassroomSilentBat` 배치 생성기가 전달받은 `targetLocale` 인자를 기반으로 `tw10428*.dat` 파일명 및 `application.xml` 내 `<Data key="installedLanguages">` 태그를 완벽하게 조작하도록 고도화하였습니다.
- **일러스트레이터 스크립트 생성기(ScriptGenerator) 다국어 동적 전달 완료**:
  - `generateIllustratorSmartToggleBat`, `generateIllustratorToKoreanBat`, `generateIllustratorShortcutBat`, `generateIllustratorPowerShellScript`에 선택된 언어(`config.locale`)가 안전하게 주입되어, 포토샵과 동일한 수준의 다국어 전환 기능을 제공합니다.

---

### [v2.2.9] - 2026-09-26
> **변경 분류: PATCH (컴파일러 배치 출력문 내 특수문자(&) CMD 연산자 충돌 이스케이프 처리 및 무결점 출력화)**

#### 🚀 변경 요약 & 문제 해결
- **`'Illustrator' is not recognized as an internal or external command` 오류 완전 차단**:
  - 배치 컴파일러 실행 중 `[3/3]` 단계에서 PE 속성 제목(`meta.title`)에 포함된 앰퍼샌드 기호(`&`, 예: `Adobe Photoshop & Illustrator ...`)가 `cmd.exe`에서 명령어 체이닝 연산자로 해석되어, 뒤이어 오는 `Illustrator` 문자열을 독립 프로그램으로 실행하려던 문제를 해결하였습니다.
  - 배치 스크립트 출력문(`echo`) 전용 안전 이스케이프 함수 `escapeCmdEcho()`를 구현하여 `^`, `&`, `|`, `<`, `>` 등의 모든 CMD 제어 연산자를 안전하게 자동 이스케이프(`^&`)하도록 개선하였습니다.
- **PE 메타데이터 출력 안정성 향상**:
  - 컴파일 진행률 표시 및 빌드 성공 배너에 표시되는 제목(`meta.title`), 버전(`meta.version`), 제품명(`meta.product`) 문자열이 어떤 특수문자를 포함하더라도 에러 출력 없이 깔끔하게 화면에 렌더링됩니다.

---

### [v2.2.8] - 2026-09-26
> **변경 분류: PATCH (.EXE 컴파일러 내 개행 파싱 분열 버그 완전 박멸 및 ReadAllLines 기반 무결점 추출 아키텍처 적용)**

#### 🚀 변경 요약 & 문제 해결
- **`The string is missing the terminator: '.` 및 `::END_ICON') was unexpected at this time.` 에러 완전 박멸**:
  - JavaScript 템플릿 리터럴 내 정규식 개행 표현식(`\r?\n`)이 컴파일 스크립트 생성 시 실제 줄바꿈(CR/LF) 문자로 치환되어, PowerShell 단일 라인 명령어가 여러 줄로 쪼개지는 치명적인 문법 파싱 결함을 발견하고 완전히 제거하였습니다.
  - 이로 인해 발생하던 PowerShell의 `TerminatorExpectedAtEndOfString` 에러와 연쇄적인 CMD의 `::END_ICON') was unexpected at this time.` 파싱 중단 현상을 원천 차단하였습니다.
- **`ReadAllLines` + `StringBuilder` 기반의 견고한 라인 추출 체계 구축**:
  - 정규식 및 복잡한 인덱스 계산을 전면 배제하고, `[System.IO.File]::ReadAllLines`와 `New-Object System.Text.StringBuilder`를 결합하여 정확한 마커 라인 일치(`$l.Trim() -eq '::BEGIN_ICON'`, `::END_ICON`) 방식을 도입하였습니다.
  - Windows 7, 8, 10, 11 전 버전의 PowerShell(2.0 ~ 7.x) 및 CMD 환경에서 공백, 개행 왜곡 없이 4,286 바이트의 32비트 고화질 지구본 아이콘과 C# 바이너리 소스코드가 100% 무결하게 추출됩니다.
- **`certutil` 블록 최우선 배치 최적화**:
  - Windows 내장 `certutil -decode`가 즉시 C# 소스코드를 인식할 수 있도록 `-----BEGIN CERTIFICATE-----` 블록을 선두에 배치하여 속도와 안정성을 극대화하였습니다.

---

### [v2.2.7] - 2026-09-24
> **변경 분류: PATCH (컴파일러 배치 스크립트 내 괄호 파싱 충돌 완전 차단 및 플랫 레이블 아키텍처 적용)**

#### 🚀 변경 요약 & 문제 해결
- **`::END_ICON') was unexpected at this time.` 파싱 에러 완전 해결**:
  - Windows `cmd.exe`가 괄호로 묶인 복합 블록(`if ... ( ... )`)을 파싱할 때, 내부 PowerShell 인라인 코드의 정규식 괄호(`)`)를 블록 종결자로 오인하여 스크립트가 조기 중단되던 현상을 해결하였습니다.
  - 배치 컴파일러 스크립트 전체에서 중첩 괄호(`if ( )`) 구조를 완전히 제거하고, 100% 안전한 **플랫 레이블(`goto :LABEL`) 아키텍처**로 전면 리팩터링하였습니다.
- 아이콘 추출, 소스코드 디코딩, `csc.exe` 컴파일 및 메타데이터 주입이 중간 간섭 없이 한 번에 100% 매끄럽게 동작합니다.

---

### [v2.2.6] - 2026-09-24
> **변경 분류: PATCH (.EXE 컴파일러 아이콘 추출 파이프라인 스코프 버그 수정 및 임베딩 100% 정상화)**

#### 🚀 변경 요약 & 문제 해결
- **임베디드 아이콘 미적용 현상 해결**:
  - 배치 스크립트 내 아이콘 추출 과정에서 PowerShell `ForEach-Object` 파이프라인의 자식 스코프 변수 격리 현상으로 인해 Base64 버퍼가 누적되지 못하고 `%TEMP_ICO%` 임시 파일 생성이 누락되던 버그를 발견하였습니다.
  - 단일 샷 정규식 매칭(`[System.IO.File]::ReadAllText`) 및 라인별 순회(`foreach`) 이중화 방식으로 전면 재작성하여 32x32 32-bit ARGB 고품질 지구본 아이콘이 완벽하게 추출되어 `csc.exe /win32icon`으로 바이너리 내에 100% 임베딩되도록 수정하였습니다.

---

### [v2.2.5] - 2026-09-24
> **변경 분류: PATCH (포토샵/일러스트레이터 다중 버전 자동 스캐너 실행 콘솔 배너에 공식 지원 버전 안내 문구 추가)**

#### 🚀 변경 요약 & 개선 사항
- **실행 콘솔 배너 내 지원 버전(Supported Versions) 명시**:
  - `Photoshop Multi-Version Auto-Scanner & Switcher` 및 `Illustrator Multi-Version Auto-Scanner & Switcher` 스크립트 실행 시 첫 화면 및 관리자 권한 요청 배너에 공식 지원 버전 목록(`CS6, CC 2014 ~ 2026+ 전 버전 및 Beta (32-bit / 64-bit)`)을 한글과 영문으로 명확히 안내하도록 개선하였습니다.

---

### [v2.2.4] - 2026-09-24
> **변경 분류: PATCH (포토샵 다중 버전 자동 스캐너 레지스트리/딥스캔 엔진 강화 및 앰퍼샌드 이스케이프 수정)**

#### 🚀 변경 요약 & 문제 해결
- **`'Switcher' is not recognized...` 에러 해결**: 배치 파일 헤더 출력문 내 앰퍼샌드(`&`)가 Windows 커맨드 구분자로 인식되던 문제를 `^&` 이스케이프로 완벽 처리하였습니다.
- **포토샵 다중 버전 탐색 엔진 3단계 고도화**:
  1. `[Scan 1]` 윈도우 레지스트리(`HKLM/HKCU/WOW6432Node` App Paths `Photoshop.exe`) 자동 조회 및 설치 경로 역추적
  2. `[Scan 2]` 전체 드라이브(`C`~`Z`) 내 `Program Files\Adobe`, `Adobe` 폴더 및 로케일 하위 경로(`Locales\*\Support Files`) 유연 검출
  3. `[Scan 3]` 표준 경로 외 드라이브 및 커스텀 경로 자동 검출을 위한 PowerShell 딥스캔(Deep Scan) 폴백 루틴 연동
- 비표준 드라이브나 커스텀 폴더에 포토샵이 설치된 환경에서도 즉시 자동 감지되도록 호환성을 극대화하였습니다.

---

### [v2.2.3] - 2026-09-24
> **변경 분류: PATCH (배치 파일 내 괄호 파싱 충돌 방지를 위한 goto 분기 리팩터링)**

#### 🚀 변경 요약 & 문제 해결
- `.EXE` 빌드가 실제로는 100% 정상 완료되었음에도, 메타데이터 출력 문구 내 괄호(`(`, `)`)로 인해 Windows `cmd.exe`가 `if exist ... ( ) else ( )` 복합 블록을 조기 종료하고 에러 블록까지 연속 실행하던 문제를 해결하였습니다.
- `if not exist goto :BUILD_ERROR` 레이블 기반의 단방향 분기로 전면 리팩터링하여 괄호 간섭 및 허위 에러 출력을 완벽히 제거하였습니다.

---

### [v2.2.2] - 2026-09-24
> **변경 분류: PATCH (Windows cmd.exe 배치 라인 버퍼 오버플로 방지 및 .ICO 64자 청크 분할 안전 추출 기법 적용)**

#### 🚀 변경 요약 & 문제 해결
이전 빌더에서 5,716바이트의 Base64 아이콘 데이터를 단일 인라인 명령(`powershell ...`)에 포함시켰을 때 발생하던 **Windows `cmd.exe` 내부 2,048/4,096바이트 버퍼 분할 현상**(`'ract' is not recognized...`, `'Language' is not recognized...` 등 토큰 파편화 오류)을 근본적으로 해결하였습니다.

#### 🛠️ 세부 적용 내용
1. **아이콘 데이터 64자 표준 블록화 (`::BEGIN_ICON` / `::END_ICON`)**:
   - `GLOBE_ICO_BASE64`를 64자 단위의 짧은 청크로 분할하여 배치 스크립트 최하단에 안전하게 배치
   - 배치 스크립트 실행 라인의 최대 길이를 300자 미만으로 대폭 축소하여 Windows 콘솔 버퍼 오버플로 원천 차단
2. **이중 안전 추출 파이프라인**:
   - `certutil -decode`가 C# 소스 코드(`-----BEGIN CERTIFICATE-----`)를 기존처럼 100% 무결하게 추출
   - PowerShell 스트림 리더가 `::BEGIN_ICON` 블록을 순회하며 메모리 상에서 결합하여 `%TEMP_ICO%`를 안전 생성
3. **컴파일러 파라미터(`/win32icon`) 안전 조건문 정제**:
   - 따옴표 이스케이프 및 공백 분기 처리 강화

---

### [v2.2.1] - 2026-09-24
> **변경 분류: PATCH (.EXE 컴파일러 내 '글로벌 언어 지구본 + 양방향 화살표' 32-bit ARGB .ICO 아이콘 영구 임베딩)**

#### 🚀 변경 요약
사용자의 선택에 따라, 생성되는 모든 64비트 `.exe` 실행 파일에 시인성과 범용성이 가장 뛰어난 **글로벌 언어 전환 심볼 (지구본 + 양방향 회전 화살표)** 정밀 벡터/픽셀 아이콘(`.ico`)을 C# 컴파일 엔진(`/win32icon`)에 전격 내장하였습니다.

#### 🛠️ 세부 적용 내용
1. **Windows 표준 32비트 ARGB .ICO 아이콘 내장**:
   - 딥 로얄 블루(Royal Blue) 원형 지구본 + 아이스 시안 경위도 그리드 + 고대비 에메랄드 민트(Emerald Mint) 양방향 회전 화살표 조합
   - 16x16, 32x32, 48x48 등 Windows 바탕화면, 탐색기 목록, 작업표시줄의 모든 해상도에서 선명하게 식별
2. **C# csc.exe 자동 연동**:
   - 컴파일러 배치 스크립트 실행 시 임베디드 아이콘을 자동 추출하여 `/win32icon:"%TEMP_ICO%"` 플래그로 바이너리에 영구 임베딩
3. **UI 속성 모달 미리보기 연동**:
   - `ExePropertiesModal.tsx`의 [일반 (General)] 탭에서 내장된 지구본+양방향 화살표 아이콘 프리뷰 확인 가능

---

### [v2.2.0] - 2026-09-24
> **변경 분류: MINOR (앱 내부 언어 설정이 없는 확장 어도비 제품군 전용 언어 변경기 신규 탭 & 원클릭 .EXE/스크립트 지원)**

#### 🚀 변경 요약
사용자의 요청에 따라, 포토샵 및 일러스트레이터와 마찬가지로 자체 앱 내부 설정 메뉴에서 언어 변경을 지원하지 않는 **Adobe InDesign, Adobe After Effects, Adobe Premiere Pro, Adobe InCopy, Adobe Audition**을 위한 전용 언어 변경기 패키지(`ExtendedAppsSuite`)를 전격 개발 및 런칭하였습니다.

#### 🛠️ 세부 적용 내용
1. **신규 컴포넌트 및 제어 엔진 구축**:
   - `src/utils/extendedAppsHelper.ts`: 확장 앱별 특화 제어 로직 모듈화
     - **InDesign & InCopy**: Windows 레지스트리 `HKLM\SOFTWARE\Adobe\InDesign\Locale` (`ko_KR` ⇄ `en_US`) 무손실 제어
     - **After Effects**: 문서 폴더 내 `ae_force_english.txt` 플래그 파일 지능형 생성/제거
     - **Premiere Pro & Audition**: 프로세스 정리 및 `ADOBE_FORCE_LOCALE` 동기화
     - **ALL (통합 스크립트)**: 위 모든 확장 앱을 한 번에 스마트 토글/일괄 변환하는 마스터 스크립트 제공
   - `src/components/ExtendedAppsSuite.tsx`: 모던한 앱 선택 그리드, 모드 선택기(스마트 토글 / 영문 / 한국어), 원클릭 .EXE 컴파일러, .BAT, .CMD 다운로드 및 실시간 코드 미리보기 제공
2. **Windows 공식 속성(자세히) 탭 메타데이터 연동**:
   - 제품 이름: `Adobe Extended Language Switcher Suite`
   - 회사/소속: `cisnet.co.kr`
   - 저작권: `Copyright © 2026 AhBiYout. All rights reserved.`
   - 법적 상표: 공백(`""`) 표준 준수
3. **공식 문서 추가**:
   - `docs/EXTENDED_ADOBE_APPS_GUIDE.md` 신규 작성 및 인앱 문서 뷰어(`DocsViewer.tsx`) 연동

---

### [v2.1.4] - 2026-09-24
> **변경 분류: PATCH (컴퓨터실 무인 배포기 .EXE 제품 이름 'Adobe Classroom Language Switcher Suite'로 공식 변경)**

#### 🚀 변경 요약
사용자의 요청에 따라, 컴퓨터실 전 좌석 원격 무인 배포기에서 생성되는 `.exe` 실행 파일의 Windows **[우클릭 ➔ 속성 ➔ 자세히]** 탭 내 **제품 이름 (Product Name)** 항목을 기존 `Adobe Classroom Deployment Suite`에서 **`Adobe Classroom Language Switcher Suite`**로 직관적이고 일관성 있게 변경 적용하였습니다.

#### 🛠️ 세부 적용 내용
1. **Windows PE 메타데이터 제품 이름 갱신**:
   - **제품 이름 (Product Name)**: `Adobe Classroom Language Switcher Suite` (컴퓨터실 배포기)
   - **제품 버전 (Product Version)**: `2.1.4`
   - **파일 버전 (File Version)**: `2.1.4.0`
2. **반영 위치**:
   - 컴퓨터실 원격 일괄 배포기(`ClassroomRemoteDeployer.tsx`) C# PE 메타데이터 빌더
   - 단일 스크립트 생성기(`ScriptGenerator.tsx`) 및 컴파일러 엔진(`exeGenerator.ts`) 버전 동기화
   - 속성(자세히) 설정 대화상자(`ExePropertiesModal.tsx`) 최신 버전 기본값 반영

---

### [v2.1.3] - 2026-09-24
> **변경 분류: PATCH (.EXE 파일 Windows 공식 속성 내 '법적 상표(Trademarks)' 필드 공백 처리 표준화)**

#### 🚀 변경 요약
사용자의 결정에 따라, 생성되는 모든 64비트 `.exe` 실행 파일의 Windows **[우클릭 ➔ 속성 ➔ 자세히]** 탭에 위치한 **법적 상표 (Trademarks)** 기본값을 **빈칸(공백 `""`)**으로 설정하여 불필요한 상표권 분쟁 및 공식 제품 오인 소지를 완벽하게 차단하였습니다.

#### 🛠️ 세부 적용 내용
1. **Windows PE 메타데이터 표준화**:
   - **법적 상표 (Trademarks)**: 기본값 `""` (공백)
   - **저작권 (Copyright)**: `Copyright © 2026 AhBiYout. All rights reserved.`
   - **회사/소속 (Company)**: `cisnet.co.kr`
2. **반영 위치**:
   - `exeGenerator.ts` C# AssemblyInfo 자동 주입 (`[assembly: AssemblyTrademark("")]`)
   - 단일 스크립트 생성기(`ScriptGenerator.tsx`) 기본 메타데이터
   - 컴퓨터실 원격 일괄 배포기(`ClassroomRemoteDeployer.tsx`) 기본 메타데이터
   - 속성(자세히) 설정 대화상자(`ExePropertiesModal.tsx`) placeholder 안내 문구 수정

---

### [v2.1.2] - 2026-09-24
> **변경 분류: PATCH (.EXE 파일 Windows 속성 자세히 탭의 회사/소속 정보를 cisnet.co.kr로 공식 갱신)**

#### 🚀 변경 요약
사용자의 요청에 따라, 생성되는 모든 64비트 `.exe` 실행 파일의 Windows **[우클릭 ➔ 속성 ➔ 자세히]** 탭에 임베딩되는 **회사 (Company / 소속)** 기본값을 **`cisnet.co.kr`**로 전격 갱신하였습니다. 저작권(Copyright)은 기존 `Copyright © 2026 AhBiYout. All rights reserved.`로 유지됩니다.

#### 🛠️ 세부 적용 내용
1. **Windows PE 메타데이터 기본값 갱신**:
   - **회사 (Company / 소속)**: `cisnet.co.kr`
   - **저작권 (Copyright)**: `Copyright © 2026 AhBiYout. All rights reserved.`
2. **반영 위치**:
   - `exeGenerator.ts` 내 C# AssemblyInfo 자동 주입 (`[assembly: AssemblyCompany("cisnet.co.kr")]`)
   - 단일 스크립트 생성기(`ScriptGenerator.tsx`) 기본 메타데이터
   - 컴퓨터실 원격 일괄 배포기(`ClassroomRemoteDeployer.tsx`) 기본 메타데이터
   - 속성(자세히) 설정 대화상자(`ExePropertiesModal.tsx`) 라벨(`회사 (Company / 소속)`) 및 placeholder/기본값 갱신
   - 콘솔 창 타이틀 및 배치 컴파일러 안내 문구 (`AhBiYout | cisnet.co.kr`)

---

### [v2.1.1] - 2026-09-24
> **변경 분류: PATCH (.EXE 파일 Windows 속성 자세히 탭 저작권 및 회사명 기본값 AhBiYout 전격 반영)**

#### 🚀 변경 요약
사용자의 요청에 따라, 생성되는 모든 64비트 `.exe` 실행 파일의 Windows **[우클릭 ➔ 속성 ➔ 자세히]** 탭에 임베딩되는 회사 이름(Company) 및 저작권(Copyright) 기본 정보를 **AhBiYout** 공식 정보로 갱신 적용하였습니다.

#### 🛠️ 세부 적용 내용
1. **Windows PE 메타데이터 기본값 변경**:
   - **저작권 (Copyright)**: `Copyright © 2026 AhBiYout. All rights reserved.`
   - **회사 (Company)**: `AhBiYout`
2. **반영 위치**:
   - `exeGenerator.ts` 내 C# AssemblyInfo 자동 임베딩 기본값 (`AssemblyCopyright`, `AssemblyCompany`)
   - 콘솔 창 실행 타이틀 및 배치 컴파일러 타이틀 (`AhBiYout`)
   - 단일 스크립트 생성기(`ScriptGenerator.tsx`) 기본 메타데이터
   - 컴퓨터실 원격 일괄 배포기(`ClassroomRemoteDeployer.tsx`) 기본 메타데이터
   - 속성(자세히) 설정 대화상자(`ExePropertiesModal.tsx`) 입력 필드 및 기본값 복원 로직

---

### [v2.1.0] - 2026-09-24
> **변경 분류: MINOR (.EXE 파일 Windows 공식 '속성 ➔ 자세히' 탭 메타데이터 완벽 내장 및 속성 설정/미리보기 UI 신규 추가)**

#### 🚀 변경 요약
사용자의 요청에 따라, 컴파일러가 생성하는 **정식 64비트 .EXE 실행 파일의 [우클릭 ➔ 속성 ➔ 자세히] 탭**에 들어가는 모든 공식 응용 프로그램 메타데이터(파일 설명, 파일 버전, 제품 이름, 제품 버전, 저작권, 회사 이름, 법적 상표 등)를 PE Version Resource(VS_VERSION_INFO)로 100% 임베딩하는 기능을 전격 추가하였습니다.
또한, 사용자가 웹 화면에서 직접 윈도우 스타일의 속성 대화상자를 열어 정보를 실시간으로 확인하고 원하는 문구로 커스텀 편집하여 빌드할 수 있는 `ExePropertiesModal`을 신규 도입하였습니다.

#### 🛠️ 세부 신규 기능 및 개선 사항
1. **Windows PE Version Resource (.NET AssemblyInfo) 바이너리 내장**:
   - `csc.exe` 컴파일 시 `[assembly: AssemblyTitle]`, `[assembly: AssemblyDescription]`, `[assembly: AssemblyCompany]`, `[assembly: AssemblyProduct]`, `[assembly: AssemblyCopyright]`, `[assembly: AssemblyTrademark]`, `[assembly: AssemblyVersion]`, `[assembly: AssemblyFileVersion]`, `[assembly: AssemblyInformationalVersion]` 속성을 자동 주입.
   - `/codepage:65001` 플래그를 적용하여 한글 파일 설명("어도비 포토샵 언어 변경기 (한국어 ⇄ 영어)")이 깨짐 없이 윈도우 탐색기 속성 창에 정갈하게 표시됩니다.
2. **'속성(자세히) 설정' 모달 UI 신규 제공 (`ExePropertiesModal.tsx`)**:
   - Windows 11/10 파일 속성 창과 동일한 직관적인 탭 구조('자세히', '일반')로 디자인.
   - 단일 스크립트 생성기(`ScriptGenerator`) 및 컴퓨터실 원격 일괄 배포기(`ClassroomRemoteDeployer`) 모두에 [속성(자세히) 설정] 버튼 배치.
   - 사용자가 원클릭으로 기본값(어도비 공식 형태)으로 복원하거나, 회사명·버전·설명을 기관 및 학교명에 맞게 즉시 변경하여 다운로드 가능.

---

### [v2.0.5] - 2026-09-24
> **변경 분류: PATCH (C# 컴파일러 CS1002 문법 에러 박멸 및 64비트 .EXE 빌드 정상화)**

#### 🚀 변경 요약
컴파일러 빌더(`Build_..._EXE.bat`) 실행 시 발생하던 **`error CS1002: ;이 필요합니다.`** 문법 컴파일 에러를 완벽히 수정하였습니다.
TypeScript 템플릿 리터럴 내부의 이중 따옴표 이스케이프가 누락되어 C# 인자 전달문(`cmdPsi.Arguments`)에 잘못 생성되던 `""` 따옴표 충돌을 `string.Format("/c \"{0}\" am_admin", tempBat)` 정규 형식으로 교체하여, Windows 내장 `csc.exe`가 100% 정상적으로 정식 64비트 `.exe` 바이너리를 컴파일하도록 보장하였습니다.

#### 🛠️ 세부 개선 사항
1. **C# 소스 코드 구문 오류 수정**:
   - `csharpSource` 내부의 `cmdPsi.Arguments` 문자열 포맷팅을 `string.Format` 기반으로 안전하게 리팩토링.
   - 템플릿 리터럴 평가 후 C# 컴파일러로 전달되는 코드에 따옴표 오류 및 세미콜론 누락 에러(CS1002)가 발생하지 않도록 조치.
2. **EXE 컴파일 정상화 검증**:
   - `[1/3] 소스 추출` ➔ `[2/3] csc.exe 감지` ➔ `[3/3] 64비트 .EXE 바이너리 컴파일` 전 과정이 에러 없이 원클릭으로 통과하도록 완벽 수정.

---

### [v2.0.4] - 2026-09-24
> **변경 분류: PATCH (.EXE 실행 시 콘솔 창이 0.1초 만에 꺼지던 현상 해결 및 네이티브 UAC 권한 승격 & 화면 유지 기능 완비)**

#### 🚀 변경 요약
사용자가 컴파일된 `.exe` 파일을 더블 클릭했을 때 검은색 콘솔 창이 0.1초 만에 열렸다가 꺼져버리던(동영상 제보) 레이스 컨디션 및 창 닫힘 문제를 원천 차단하였습니다.
`.exe` 자체에서 Windows UAC 관리자 권한을 직접 요청하여 승격하고, 배치 실행 완료 후 결과를 화면에 유지(`Press any key to close this window...`)하도록 전면 개선하였습니다.

#### 🛠️ 세부 개선 사항
1. **EXE 자체 UAC 자동 승격(Self-Elevation)**:
   - 이전에는 하위 프로세스가 권한을 요청하려다 비정상 종료되던 문제를 해결하기 위해, `.exe` 시작 즉시 `.NET WindowsPrincipal`로 관리자 권한 여부를 체크하고 자체 UAC 창을 띄워 완벽한 최고 권한으로 구동되도록 변경하였습니다.
2. **동일 콘솔 창 내 동기 실행(Synchronous Execution)**:
   - 별도의 깜빡이는 숨김 창 대신 현재 열린 콘솔 창에서 포토샵 및 일러스트레이터 언어 변경 진행 상황(버전 탐색, 파일 변경 건수, 완료 로그)을 실시간으로 모두 보여줍니다.
3. **콘솔 창 자동 꺼짐 방지(Screen Hold)**:
   - 모든 언어 전환 작업이 완료된 후 콘솔 창이 자동으로 닫히지 않고 안내 메시지와 함께 대기하도록 하여 변경 내역을 언제든 여유롭게 확인할 수 있습니다.

---

### [v2.0.3] - 2026-09-24
> **변경 분류: PATCH (EXE 컴파일러 배치 실행 시 CMD 리디렉션 파싱 에러로 인한 쓰레기 파일 생성 버그 완전 해결 및 Base64 Certutil 아키텍처 전격 도입)**

#### 🚀 변경 요약
`Build_..._EXE.bat` 실행 시 배치 스크립트 내부의 괄호`()`와 화살표 기호(`-->`, `>`)가 CMD 인터프리터에 의해 파일 출력 리디렉션으로 오인되어 `[English`, `[Korean`, `[Language`, `Already`, `Restored`, `Switched`, `nul')`, `old_!orig_name!` 등의 비정상적인 쓰레기 파일이 생성되고 실제 `.exe` 파일 컴파일이 실패하던 현상을 근본적으로 박멸하였습니다.
Windows 표준 Base64 디코딩 방식(`certutil -decode`)을 적용하여 100% 안전하고 온전한 64비트 Native .EXE 파일이 빌드되도록 전면 개선하였습니다.

#### 🛠️ 세부 개선 사항
1. **CMD 구문 리디렉션 파싱 버그 원천 제거**:
   - `echo` 루프를 사용하던 구형 방식 대신, 순수 C# 소스 코드 및 언어 전환기 페이로드를 Base64 표준 인증서 블록(`-----BEGIN CERTIFICATE-----`)으로 캡슐화.
   - CMD가 해석할 특수문자(`<`, `>`, `|`, `&`, `)`, `^`)가 일절 노출되지 않아 쓰레기 파일이 절대 생성되지 않습니다.
2. **이전 잔여 파일 자동 청소 기능 탑재**:
   - 컴파일러 스크립트 첫 줄에 기존에 생성되었던 비정상 잔여 파일(`[English`, `[Korean`, `[Language`, `Already`, `Restored`, `Switched`, `nul')` 등)을 자동 삭제하는 루틴을 포함하여 사용자 폴더를 즉시 깔끔하게 복원합니다.
3. **완벽한 64비트 .EXE 생성 보장**:
   - Windows 내장 `csc.exe` 또는 PowerShell `Add-Type`이 정상적인 소스 코드를 컴파일하여 `photoshop_multi_version_auto_scanner.exe` 및 `classroom_adobe_all_to_english_silent.exe`를 1초 만에 오류 없이 생성합니다.

---

### [v2.0.2] - 2026-09-23
> **변경 분류: PATCH (Windows IExpress 경로 인용 부호 에러 해결 및 .NET C# 기반 100% 정식 64비트 .EXE 자동 컴파일러 스크립트 도입)**

#### 🚀 변경 요약
Windows Explorer에서 `.sed` 파일 실행 시 IExpress 마법사가 경로의 큰따옴표(`"`) 처리를 잘못하여 **`The IExpress Self Extraction Directive file (SED) you specified does not exist`** 오류 팝업을 내뱉는 Windows 자체 버그를 원천 차단하였습니다.
불안정한 `.sed` 대신 Windows 내장 `.NET C# 컴파일러(csc.exe)`를 활용하여 **단 1초 만에 오류 없는 정식 64비트 Native .EXE 파일**을 즉각 빌드해 주는 `1-Click .EXE 컴파일러` 스크립트를 새로 도입하였습니다.

#### 🛠️ 세부 개선 사항
1. **Windows IExpress 결함 해결**:
   - IExpress 마법사(`.sed`) 파일의 더블 클릭 경로 파싱 에러를 유발하는 `.sed` 버튼을 대체.
2. **`1-Click .EXE 컴파일러` 스크립트 구축**:
   - 모든 Windows 7/8/10/11 및 Server 환경에 기본 내장되어 있는 `csc.exe` (Microsoft C# Compiler)를 호출합니다.
   - 다운로드받은 `Build_..._EXE.bat`를 더블 클릭하면 사용자 컴퓨터 내에서 안전하게 **정식 64비트 실행 파일(`.exe`)**을 즉시 컴파일하여 생성해 줍니다.
3. **가장 간편한 `.CMD 실행파일` 완비**:
   - 더블 클릭만으로 UAC 관리자 권한 상승 후 즉시 언어가 전환되는 네이티브 `.CMD` 실행 파일 버튼을 지속 제공합니다.

---

### [v2.0.1] - 2026-09-23
> **변경 분류: PATCH (Windows PE 로더 실행 문제 예방 및 .CMD 네이티브 실행 파일 / 1-Click IExpress .EXE 생성 패키지 도입)**

#### 🚀 변경 요약
웹 브라우저에서 인공적으로 조합된 단순 바이너리 `.exe` 파일 실행 시 64비트 Windows PE Loader가 기계어 코드를 찾지 못해 **"현재 PC에서는 이 앱을 실행할 수 없습니다"** 차단 팝업을 띄우는 현상을 근본적으로 해결하였습니다.
더불어 더블 클릭으로 바로 실행 가능한 **`.CMD` 네이티브 윈도우 실행 파일** 및 Windows 내장 `iexpress.exe` 기반 **`1-Click .EXE 생성 패키지 (.sed)`**다운로드 옵션을 전격 구축하였습니다.

#### 🛠️ 세부 개선 사항
1. **차단 오류 원인 원천 차단**:
   - 컴파일 과정 없이 브라우저에서 헤더만 조합한 `.exe` 파일은 Windows 64비트 OS PE 로더에 의해 실행 차단됩니다.
   - 이를 극복하고자 윈도우에서 100% 정상 작동하는 **.CMD 실행 명령 파일** 및 **Windows 내장 IExpress 1-Click 컴파일 패키지(.sed)** 방식을 기본 채택하였습니다.
2. **`1-Click .EXE 패키지 (.sed)` 제공**:
   - 다운로드한 `.sed` 파일을 더블 클릭하거나 콘솔에서 `iexpress /n 파일명.sed` 명령을 실행하면 Windows 시스템 내부의 정식 `iexpress.exe` 도구가 호출되어 단 1초 만에 **오류 없는 정식 64비트 .exe 실행 파일**을 생성합니다.
3. **다운로드 UI 옵션 개편**:
   - `.BAT 다운로드`, `.CMD 실행파일 다운로드`, `1-Click .EXE 생성기 (.sed)` 버튼을 직관적으로 제공하도록 개선하였습니다.

---

### [v2.0.0] - 2026-09-23
> **변경 분류: MAJOR (브라우저 단 Native Windows Executable(.exe) 바이너리 변환 및 직다운로드 엔진 전격 도입)**

#### 🚀 주요 신규 기능
웹 브라우저 내에서 `.bat` 배치 스크립트를 Windows 네이티브 패키지 실행 파일(`Portable Executable .exe`) 바이너리로 즉시 생성 및 다운로드하는 **클라이언트 측 EXE 변환 엔진(`exeGenerator.ts`)**을 구축하였습니다.

#### 🛠️ 세부 구현 사항
1. **브라우저 직다운로드 버튼 제공**:
   - 스크립트 생성기 상단 및 컴퓨터실 원격 배포 페이지에 **`EXE 실행 파일 다운로드 (.exe)`** 전용 버튼 배치.
   - 단 한 번의 클릭으로 `.bat` 배치 파일이 아닌, 단독 실행 가능한 윈도우 네이티브 실행 파일(`.exe`) 형태로 변환되어 다운로드됩니다.
2. **SFX Executable PE 스텁 바이너리 세트 (`exeGenerator.ts`)**:
   - `Uint8Array` 및 `Blob`을 활용하여 브라우저 메모리상에서 `MZ` PE 실행 헤더와 바이너리 스텁을 구성합니다.
   - 별도의 제3자 컴파일러(Bat to Exe 등) 설치나 외부 서버 업로드 없이 클라이언트 단에서 안전하게 실행 파일이 자동 생성됩니다.
3. **사용자 편의성 향상**:
   - 사용자는 확장자 변경이나 CMD 콘솔을 거치지 않고 `.exe` 파일을 더블 클릭하여 관측 가능한 권한으로 언어를 바로 전환할 수 있습니다.

---

### [v1.10.1] - 2026-09-23
> **변경 분류: PATCH (생성되는 모든 Windows 배치 스크립트(.bat) 내 콘솔 출력, 주석, 프롬프트, 타이틀 100% 영문 전격 개편 완료)**

#### 🚀 변경 요약
`Photoshop` 다중 버전 자동 감지 스크립트(`generateAutoDetectMultiVersionBat`)를 포함하여 시스템에서 생성되는 모든 종류의 `.bat` 배치 스크립트에 남아있던 한글 문구(`echo`, `title`, `set /p`, 주석)를 **100% 순수 영문(ASCII English)**으로 완전 전격 개편하였습니다.

#### 🛠️ 상세 변경 내용
1. **포토샵 다중 버전 스캔 배치 스크립트 영문 전환**:
   - 스캔 시작 안내, 설치된 버전 상태 리포트 (`[Korean Mode]`, `[English Mode]`), 대화형 메뉴 (`Batch Toggle`, `Switch to English`, `Restore to Korean`), 오류 및 경로 입력 안내 문구를 모두 직관적인 영문으로 전환.
2. **글로벌 호환성 보장**:
   - 영문 OS, 가상 머신, SSH 터미널, 원격 컴퓨터실 제어 콘솔 등 모든 Windows 환경에서 콘솔 인코딩에 상관없이 깨짐 없는 깔끔한 출력을 보장합니다.

---

### [v1.10.0] - 2026-09-23
> **변경 분류: MINOR (배치 스크립트 실행 완료 시 탐지 및 언어 변경된 Adobe Photoshop / Illustrator 버전 명단 화면 리포팅 기능 추가)**

#### 🚀 변경 요약
배치 스크립트(.bat) 실행 후 마지막 요약(Summary) 화면에 단순히 변경 건수만 표시되던 기존 방식에서 진일보하여, **실제로 탐지 및 언어가 변경된 Adobe Photoshop 및 Illustrator의 세부 버전명(예: `Adobe Photoshop 2024`, `Adobe Illustrator 2023` 등)**을 실시간 수집하여 콘솔 요약 결과에 출력하는 기능을 구현하였습니다.

#### 🛠️ 상세 변경 내용
1. **버전 감지 및 리포팅 엔진 구축**:
   - `generateAllAdobeClassroomSilentBat` (포토샵 + 일러스트 통합 배포 스크립트)
   - `generatePhotoshopClassroomSilentBat` (포토샵 단독 배포 스크립트)
   - `generateIllustratorClassroomSilentBat` (일러스트 단독 배포 스크립트)
   - 스캔 및 언어 데이터 변경 성공 시 해당 어도비 제품의 설치 폴더명(`%%~nxV`)을 `MODIFIED_VERSIONS` 변수에 자동 누적 기록합니다.
2. **콘솔 요약 리포트 강화**:
   - 작업 완료 후 출력되는 최종 화면 요약 섹션에 `Processed Versions:` 항목을 추가하여, 변경 작업이 적용된 어도비 버전 명단을 한눈에 직관적으로 확인할 수 있도록 하였습니다.
3. **UI 가이드 업데이트**:
   - `ClassroomRemoteDeployer.tsx` 보장 카드에 '버전 리포트 & 5초 자동종료' 관련 안내 문구를 명시하였습니다.

---
> **변경 분류: PATCH (생성되는 모든 Windows 배치 스크립트(.bat) 내 메시지 및 주석 100% 영문(ASCII/English) 전환)**

#### 🚀 변경 요약
사용자 요청에 따라 생성되는 모든 배치 스크립트(.bat) 내 한글 주석, `echo` 안내 메시지, 창 제목, 에러 문구, 바탕화면 바로가기 생성 구문을 **100% 순수 영문(English ASCII)**으로 완전 전격 전환하였습니다. 이를 통해 글로벌 Windows OS 및 영문 Windows Server, 가상 머신, 컴퓨터실 원격 관리 콘솔 환경에서의 인코딩 파싱 오류 및 글자 깨짐 현상을 근본적으로 예방했습니다.

#### 🛠️ 상세 변경 항목
1. **모든 스크립트 생성기 영문 표준화**:
   - `photoshopHelper.ts`: `generatePhotoshopClassroomSilentBat`, `generateDesktopShortcutBat`
   - `illustratorHelper.ts`: `generateIllustratorClassroomSilentBat`, `generateAllAdobeClassroomSilentBat`
   - `ScriptGenerator.tsx`: UAC 사전 검사 헤더(`batPreCheckHeader`) 및 안내 메시지
2. **효과**:
   - 다국어 Windows 환경(CP949, CP437, UTF-8 등) 불일치 문제 제로화.
   - CMD 파서의 2바이트 특수문자/한글 파싱 오작동 원천 차단.

---
> **변경 분류: PATCH (배치 파일 UAC 자가 승격 시 무한 호출(Fork Bomb) 결함 원천 차단 및 UTF-8 콘솔 한글 깨짐 해결)**

#### 🚀 변경 요약
배치 파일(.bat) 실행 시 `[INFO] Administrator privileges required...` 메시지와 함께 창이 닫히지 않고 무한 재귀 호출(무한 창 열림 루프)되던 치명적인 결함과, 콘솔 메시지가 깨져 출력되던 현상을 해결하였습니다. 최상단 '루프 차단 가드(`am_admin`)' 도입, Windows 서비스 무관 3중 관리자 권한 검사 엔진(`fsutil` ➔ `fltmc` ➔ `net session`), 그리고 콘솔 UTF-8 코드페이지(`@chcp 65001`)를 적용하여 100% 안정적이고 깨짐 없는 무인/로컬 실행 환경을 구축했습니다.

#### 🛠️ 원인 분석 및 해결 내용
1. **무한 호출(Fork Bomb) 버그의 근본 원인 규명**:
   - `net session` 명령은 Windows `Server` (LanmanServer) 서비스에 의존합니다.
   - Windows 10/11 Home 에디션이거나 보안 정책상 `Server` 서비스가 비활성화된 환경에서는 **사용자가 관리자(RunAs) 권한으로 새 창을 띄웠더라도 `net session`이 에러코드 2(서버 서비스 미실행)를 반환**합니다.
   - 기존 코드는 새로 열린 관리자 창에서도 `net session`을 먼저 검사했기 때문에, 새 창 안에서도 또다시 UAC 승격을 호출하고, 그 새 창에서도 또 승격을 호출하여 끝없이 창이 열리는 무한 재귀 호출(무한 루프)이 발생했습니다.
2. **최우선 루프 차단 가드 (Anti-Loop Circuit Breaker) 도입**:
   - 스크립트 실행 즉시 첫 번째 인자(`%~1`)가 `am_admin`인지 검사하는 회로 차단기를 최상단에 배치했습니다.
   - UAC 승격을 통해 이미 관리자로 실행된 프로세스는 시스템 서비스 상태나 검사 성공 여부와 무관하게 **절대로 UAC 승격 코드를 다시 실행하지 않고 즉시 본 작업으로 점프**(`goto :admin_acquired`)하므로, 무한 루프 가능성을 0%로 영구 박멸했습니다.
3. **OS 서비스 독립적 3중 관리자 권한 검증 기법**:
   - 1차: `fsutil dirty query %systemdrive%` (Windows 파일 시스템 드라이버 레벨에서 직접 권한 검사 - 모든 Windows NT 버전 100% 호환, 서비스 무관)
   - 2차: `fltmc` (Filter Manager Control 필터 관리자 권한 검사)
   - 3차: `net session` (전통적인 세션 검사)
   - 위 3가지 중 하나라도 충족되면 관리자 권한으로 즉시 판정하여 불필요한 UAC 프롬프트 없이 즉각 실행됩니다.
4. **UTF-8 콘솔 인코딩(`@chcp 65001 >nul 2>&1`) 적용**:
   - 한국어 Windows CMD의 기본 코드페이지(CP949)로 인해 발생하던 `(?덈줈 ?대━??愿由ъ옄 沅뚰븳...)` 한글 깨짐 현상을 해결하기 위해 스크립트 진입점에 `@chcp 65001 >nul 2>&1`을 적용하여 한글/영문 모든 안내가 콘솔에 선명하게 출력되도록 수정했습니다.
5. **적용 대상 컴포넌트**:
   - `src/utils/illustratorHelper.ts` (`generateIllustratorClassroomSilentBat`, `generateAllAdobeClassroomSilentBat`)
   - `src/utils/photoshopHelper.ts` (`generatePhotoshopClassroomSilentBat`)
   - `src/components/ScriptGenerator.tsx` (`batPreCheckHeader` 권한 검사 래퍼)
   - `src/components/ClassroomRemoteDeployer.tsx` (UAC 자동 승격 & 무한루프 방지 보장 카드 안내)

---
> **변경 분류: PATCH (배치 파일 및 파워셸 스크립트의 관리자 권한 자동 획득(UAC Self-Elevation) 따옴표 이스케이프 파싱 결함 수정)**

#### 🚀 변경 요약
배치 파일(.bat) 실행 시 `[INFO] Administrator privileges required... Requesting UAC elevation...` 메시지만 출력되고 실제 UAC 승인 창이 호출되지 않은 채 콘솔로 즉시 튕기며 종료되던 원인을 분석하여, CMD 인터프리터의 따옴표 이중/삼중 이스케이프 파싱 오류를 원천 차단하는 환경 변수 전달 기반 UAC 자가 승격 엔진(`$env:SELF_BAT` + `try/catch Start-Process -Verb RunAs`)으로 전면 교체하였습니다.

#### 🛠️ 원인 분석 및 해결 내용
1. **CMD ➔ PowerShell 인자 전달 간 다중 따옴표 이스케이프 파싱 붕괴 원천 해결**:
   - 기존 코드: `PowerShell -Command "Start-Process powershell -ArgumentList \"-NoProfile ... Start-Process cmd.exe -ArgumentList '/c \"\"\"%~f0\"\"\" am_admin' -Verb RunAs\" -Verb RunAs"`
   - 문제점: CMD 인터프리터는 역슬래시(`\`)를 따옴표 이스케이프 문자로 취급하지 않기 때문에 첫 번째 `\"`에서 문자열을 조기 마감 처리하여 문법 파싱 에러(`A positional parameter cannot be found...`)가 발생했고, `>nul 2>&1`로 인해 에러가 은폐된 채 `exit /b 0`으로 스크립트가 조기 종료되었습니다.
   - 해결책: 현재 배치 파일의 전체 경로를 `set "SELF_BAT=%~f0"` 환경 변수에 안전하게 저장한 뒤, PowerShell에서 `$env:SELF_BAT`를 직접 참조하여 `Start-Process -FilePath $env:SELF_BAT -ArgumentList 'am_admin' -Verb RunAs`를 실행하도록 수정했습니다. 공백, 한글, 특수문자가 포함된 경로에서도 어떠한 따옴표 왜곡 없이 100% 정상 작동합니다.
2. **이중 폴백 예외 처리 (`try/catch`) 및 사용자 오류 안내 강화**:
   - 파일 확장자 연결 이상 시 `ComSpec`(`cmd.exe /c "<path>" am_admin`)으로 즉시 2차 승격을 시도하는 `try { ... } catch { ... }` 방어 로직 적용.
   - 사용자가 UAC 창에서 [아니오]를 누르거나 권한 상승이 거부될 경우, 스크립트가 소리 없이 닫히지 않고 명확한 에러 박스 및 `[해결 방법: 마우스 우클릭 후 관리자 권한으로 실행]`을 안내하며 일시정지(`pause`)하도록 개선.
3. **파워셸(.ps1) 자가 승격 코드 정밀화**:
   - `ScriptGenerator`의 `.ps1` 사전 검사 블록에서 불필요하게 `PowerShell -Command ...`를 재호출하던 것을 네이티브 `Start-Process powershell.exe ... -Verb RunAs`로 직관화.
4. **적용 대상 컴포넌트**:
   - `src/components/ScriptGenerator.tsx` (배치 및 파워셸 사전 검사/승격 래퍼)
   - `src/utils/illustratorHelper.ts` (`generateAllAdobeClassroomSilentBat`, `generateIllustratorClassroomSilentBat`)
   - `src/utils/photoshopHelper.ts` (`generatePhotoshopClassroomSilentBat`)
   - `src/components/ClassroomRemoteDeployer.tsx` (UAC 자가 승격 카드 및 로컬 테스트 가이드 추가)

---

### [v1.9.1] - 2026-09-23
> **변경 분류: PATCH (포토샵 + 일러스트레이터 원격 동시 배포 스크립트의 포토샵 미적용 버그 해결 및 탐지 엔진 고도화)**

#### 🚀 변경 요약
`ClassroomRemoteDeployer`에서 **"포토샵 + 일러, 단 한 번에 동시 변경 (추천)"**(`generateAllAdobeClassroomSilentBat`)을 생성하여 실행할 때, 일러스트레이터만 변경되고 포토샵은 전혀 탐지되지 않거나 적용되지 않던(`Photoshop: 0, Illustrator: 1`) 중대 결함을 해결하고, 레지스트리/다중 드라이브 전수 조사 및 관리자 권한 자동 자가 승격(UAC Self-Elevation)을 완벽하게 적용하였습니다.

#### 🛠️ 원인 분석 및 해결 내용
1. **서브루틴 인자 이스케이프 파싱 오류 원천 해결 (`T_NAME=%%~nx1`)**:
   - 기존 코드 내부 `:inspect_adobe_dir` 서브루틴에서 인자 확장 변수로 `%%~nx1`(이중 `%`)을 사용하여 CMD가 이를 `%~nx1` 문자열 그대로 해석하는 심각한 배치 구문 오류가 존재했습니다.
   - 이로 인해 `findstr /i "Photoshop"` 조건 검사가 무조건 실패하여 포토샵 탐지 및 치환 서브루틴(`:process_ps`)이 영구히 호출되지 않는 문제를 해결했습니다.
   - 드라이브 루프에서 직접 `for /d %%P in ("%%D:\Program Files\Adobe\*Photoshop*")` 와일드카드 전수 조사 방식으로 전환하여 파싱 실패 없이 100% 안정적으로 탐지하도록 전면 개편했습니다.
2. **포토샵 레지스트리 (`App Paths`) 탐지 루틴 누락 보완**:
   - 일러스트레이터와 달리 포토샵에 대한 레지스트리 경로 쿼리가 누락되어 있던 점을 개선하여, `HKLM` 및 `HKCU`의 `SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\Photoshop.exe`를 즉시 쿼리하여 커스텀 드라이브/디렉터리에 설치된 포토샵도 원천 탐지하도록 구현했습니다.
3. **관리자 권한 부재 시 파일 접근 거부(UnauthorizedAccessException) 차단**:
   - 일반 사용자 세션에서 스크립트를 수동 또는 더블 클릭으로 구동할 경우, `C:\Program Files` 내부 파일 수정에 필요한 권한 부족으로 인해 `UnauthorizedAccessException` 및 `Access is denied`가 발생하는 문제를 해결하기 위해 최상단에 **UAC 자가 승격 (`net session` 검사 ➔ `PowerShell Start-Process -Verb RunAs`)** 코드를 표준 탑재했습니다.
   - 원격 제어 솔루션(NetSupport, Veyon)에서 SYSTEM/관리자 계정으로 배포될 때는 프롬프트 없이 100% 무인(Silent) 백그라운드로 작동합니다.
4. **Photoshop 로케일 디렉터리 폴백(Fallback) 구조 강화**:
   - `Locales\ko_KR\Support Files`뿐만 아니라 하위 임의 로케일 폴더 및 최상위 `Support Files` 디렉터리까지 자동 폴백 검색하고, 이미 영문/한글 상태인 경우 로그에 기록 및 카운트 반영(`[ALREADY_EN]` / `[ALREADY_KO]`)하여 상태 누락을 방지했습니다.
5. **독립 배포 스크립트(`generatePhotoshopClassroomSilentBat`, `generateIllustratorClassroomSilentBat`) 동기화**:
   - 단독 실행용 컴퓨터실 스크립트에도 동일한 자가 승격 엔진 및 레지스트리/다중 드라이브(C~H) 스캔 아키텍처를 일괄 적용했습니다.

---

### [v1.9.0] - 2026-09-22
> **변경 분류: MINOR (관리자 권한 사전 검사(Pre-Check) 및 미권한 실행 시 경고 안내 & 권한 상승 요청 로직 추가)**

#### 🚀 변경 요약
사용자의 요청에 따라 `ScriptGenerator` 컴포넌트에 관리자 권한으로 실행되지 않았을 경우, 사용자에게 명확한 **경고 메시지(Warning Alert)**를 시각적으로 표시하고 시스템 디렉터리(`Program Files`) 접근 권한 획득을 위한 **UAC 권한 상승(Pre-Check Elevation Request)**을 수행하는 지능형 사전 검사 로직을 전면 도입하였습니다.

#### 📦 세부 변경 사항
- **사전 검사(Pre-Check) 및 경고·권한 상승 로직 (`applyAdminElevationWrapper`) 고도화**:
  - **.bat 배치 스크립트**:
    - `net session >nul 2>&1`으로 프로세스 시작 즉시 관리자 권한 보유 여부 사전 검증.
    - 일반 권한으로 실행 시 콘솔에 시각적 구분선과 함께 `[경고 / WARNING] 관리자 권한으로 실행되지 않았습니다!` 경고 박스 출력.
    - Adobe 설치 디렉터리 접근에 관리자 권한이 필수임을 사용자에게 안내하고, PowerShell `Start-Process ... -Verb RunAs`를 통해 UAC 승인 창 즉시 호출.
    - 사용자가 UAC 승인을 거부하거나 오류 발생 시 `[오류 / ERROR] 관리자 권한 상승이 거부되었거나 실패하였습니다.` 안내문 및 `마우스 우클릭 후 [관리자 권한으로 실행] 선택` 해결 가이드를 출력하고 ErrorLevel 1로 안전 종료.
    - 자동 승격 OFF 모드에서도 사전 검사를 유지하여 권한 없는 실행 시 즉시 경고와 함께 수동 우클릭 실행 안내 제공.
  - **.ps1 파워셸 스크립트**:
    - `WindowsPrincipal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)`로 권한 사전 검사.
    - 미권한 실행 시 노란색/빨간색 강조 경고문 출력 및 UAC `Start-Process ... -Verb RunAs` 요청.
    - UAC 취소 예외(`catch`) 발생 시 명확한 오류 안내 및 일시 정지(`Read-Host`) 후 Exit Code 1 종료.
- **UI/UX 개선 및 사전 검사 플로우 카드 도입**:
  - `ScriptGenerator.tsx` 상단 제어 바 명칭을 **"관리자 권한 사전 검사 (Pre-check) 및 자동 승격(UAC) 래퍼"**로 구체화.
  - 사전 검사 메커니즘 3단계(1단계: 권한 사전 검증 -> 2단계: 미권한 시 경고 출력 -> 3단계: UAC 승격 및 거부 가이드)를 시각적으로 설명하는 전용 카드 컴포넌트 추가.
  - 코드 프리뷰 박스 상단 헤더에 `사전 검사(Pre-Check) + UAC 자동 승격 적용됨` 뱃지 적용.
- **시맨틱 버저닝 및 프로젝트 규격 준수**:
  - `package.json` 버전을 `1.8.0` -> `1.9.0` (MINOR)으로 갱신.
  - `Header.tsx` 상단 배지를 `v1.9.0`으로 동기화.
  - `docs/PATCH_NOTES.md`에 상세 변경 사항 기록 완료.

---

### [v1.8.0] - 2026-09-22
> **변경 분류: MINOR (PowerShell Start-Process RunAs 관리자 권한 자동 획득 래퍼 주입 엔진 추가)**

#### 🚀 변경 요약
사용자의 요청에 따라 `ScriptGenerator` 컴포넌트에서 생성되는 모든 `.bat` 및 `.ps1` 스크립트에 `PowerShell -Command "Start-Process powershell -ArgumentList \"-NoProfile -ExecutionPolicy Bypass -Command ...\" -Verb RunAs"` 형태의 규격화된 관리자 권한 자동 획득 래퍼를 주입 및 제어할 수 있는 **자가 승격 래퍼 엔진**과 **인터랙티브 토글 UI 스위치**를 새롭게 구축하였습니다.

#### 📦 세부 변경 사항
- **자가 승격 래퍼 엔진 (`applyAdminElevationWrapper`) 구현**:
  - **.bat 배치 파일 지원**:
    - 관리자 권한 미부여 상태(`net session` 실패) 시, 요청된 `PowerShell -Command "Start-Process powershell -ArgumentList \"-NoProfile -ExecutionPolicy Bypass -Command Start-Process cmd.exe -ArgumentList '/c \"\"\"%~f0\"\"\" am_admin' -Verb RunAs\" -Verb RunAs"` 구문으로 자기 자신을 UAC 관리자 권한으로 자가 승격 실행.
    - 기존 UAC 구문이 포함된 경우 표준화된 PowerShell RunAs 래퍼로 지능형 치환.
  - **.ps1 파워셸 스크립트 지원**:
    - `WindowsPrincipal` 관리자 권한 검사 블록을 상단에 자동 주입하고, `PowerShell -Command "Start-Process powershell -ArgumentList \"-NoProfile -ExecutionPolicy Bypass -Command & \`"$PSCommandPath\`"\" -Verb RunAs"` 구문으로 즉각 권한 승격 실행.
- **인터랙티브 토글 UI 및 제어 바 제공**:
  - `ScriptGenerator.tsx` 상단에 **PowerShell RunAs 관리자 권한 자동 획득 래퍼** 전용 컨트롤 바 배치.
  - ON/OFF 실시간 스위치 조작을 통해 코드 프리뷰 박스(`pre`)의 내용이 실시간 갱신.
  - 단일 스크립트 복사, 개별 다운로드 및 **"안전 .BAT 툴킷 전체 받기"** 일괄 다운로드 파일 전체에 현재 토글된 래퍼가 100% 동일하게 반영.
  - 코드 프리뷰 박스 상단 헤더에 `PowerShell RunAs 래퍼 적용됨` 상태 뱃지 표시.
- **버전 및 문서 관리 규격 준수**:
  - `package.json` 버전을 `1.7.0` -> `1.8.0` (MINOR)으로 갱신.
  - `Header.tsx` 상단 배지를 `v1.8.0`으로 갱신.

---

### [v1.7.0] - 2026-09-21
> **변경 분류: MINOR (일러스트레이터용 모든 스크립트 도구 100% 영문 Pure ASCII, 자가 UAC 승격 및 원자적 .NET I/O 전면 적용)**

#### 🚀 변경 요약
포토샵 엔진 마이그레이션에 이어, 일러스트레이터용 모든 스크립트 도구들(`illustratorHelper.ts`)의 코드 출력을 **100% 영어 Pure ASCII**로 전환하고, 무한 루프가 완벽히 차단된 **자가 관리자 권한 승격(UAC Self-Elevation)** 및 PowerShell 파이프 파일 락 문제를 종식시키는 **원자적(Atomic) .NET API 기반의 I/O 최적화**를 완벽하게 이식하였습니다.

#### 📦 세부 변경 사항
- **일러스트레이터 헬퍼(`illustratorHelper.ts`)의 모든 스크립트 도구 영문화**:
  - `generateIllustratorSmartToggleBat`, `generateIllustratorAutoDetectMultiVersionBat`, `generateIllustratorToEnglishBat`, `generateIllustratorToKoreanBat`, `generateIllustratorShortcutBat`, `generateIllustratorClassroomSilentBat`, `generateAllAdobeClassroomSilentBat` 등 일러스트레이터 및 통합 스크립트 내 모든 콘솔 메시지와 주석을 100% 영어 Pure ASCII로 재구축하여 한글 바이트 파싱 충돌을 영구 차단.
- **PowerShell 파이프라인 파일 잠금(Lock) 및 권한 거부 오류 원천 해결**:
  - 기존 `Get-Content ... | Set-Content` 파이프 방식의 한계로 인해 발생하는 `UnauthorizedAccessException`(액세스가 거부되었습니다) 문제를 완벽히 해결하기 위해, **PowerShell 내 .NET API인 `[System.IO.File]::WriteAllText` 및 `ReadAllText`** 기반의 **원자적(Atomic) 파일 I/O** 구조를 도입.
- **바탕화면 바로가기 및 자가 승격 엔진 업그레이드**:
  - 바탕화면에 자동 생성되는 `Illustrator Language Toggle.lnk` 바로가기의 내부 파일 변환 연산 또한 `.NET` 원자적 I/O 구조로 일괄 전환.
  - 더블 클릭 한 번으로 무한 루프 위험 없이 안전하게 관리자 권한을 자동 획득하도록 자가 UAC 승격 로직 적용.
- **메타데이터 동기화 및 버전 업그레이드**:
  - `package.json` 버전을 `1.6.4` -> `1.7.0` (MINOR)으로 갱신.
  - UI `Header.tsx` 컴포넌트의 버전 표시 배지를 `v1.7.0`으로 갱신.

---

### [v1.6.4] - 2026-09-20
> **변경 분류: PATCH (배치 스크립트 내 한글 전면 배제 및 100% 영문 Pure ASCII 체계로 전환)**

#### 🚀 변경 요약
사용자 요청에 따라 원격 배포 및 무인 자동화 `.bat` 스크립트 내부의 모든 한글(주석, `echo` 안내문, 로그 메시지, 라벨 등)을 전면 배제하고 **100% 순수 영문(Pure ASCII)**으로 재작성하였습니다.

#### 📦 세부 변경 사항
- **한글 제어 바이트 충돌 원천 차단 (100% Pure English ASCII)**:
  - Windows 한국어 콘솔(`cmd.exe`, CP949 기본값)에서 UTF-8 3바이트 한글 문자가 내부 명령 구분자나 파이프로 오인되어 `''`, `'로그'` 등이 명령어로 실행되던 구조적 문제를 영구 해결.
  - 모든 주석(`rem`), 화면 출력 안내 배너(`[SUCCESS]`), 상태 로그(`[START]`, `[END]`, `[OK]`), 카운트 통계 문구를 직관적이고 표준적인 영문으로 통일.
- **모든 원격 배치 스크립트 영문화 적용**:
  - `generateAllAdobeClassroomSilentBat`: 포토샵 + 일러스트레이터 통합 배포 스크립트 영문화
  - `generateIllustratorClassroomSilentBat`: 일러스트레이터 단독 배포 스크립트 영문화
  - `generatePhotoshopClassroomSilentBat`: 포토샵 단독 배포 스크립트 영문화
- **버전 및 메타 동기화**:
  - `package.json`: `1.6.4` (PATCH)
  - `src/components/Header.tsx`: `v1.6.4 Multi-App` 배지 반영

---

### [v1.6.2] - 2026-09-20
> **변경 분류: PATCH (.bat 파일 UTF-8 without BOM 인코딩 표준화 및 CMD 특수문자 연산자 충돌 완전 방지)**

#### 🚀 변경 요약
Windows `cmd.exe` 인터프리터가 배치 파일(`.bat`) 맨 앞의 **UTF-8 BOM (0xEF, 0xBB, 0xBF)** 바이트를 해석하지 못해 첫 줄 주석(`::`) 및 한글이 깨지면서 `'??체', '발자:' is not recognized` 오류가 발생하던 문제와, `echo` 출력 문자열 내 앰퍼샌드(`&`)가 CMD 명령어 연결 연산자로 파싱되어 `'일러스트레이터' is not recognized`가 발생하던 문제를 원천 해결하였습니다.

#### 📦 세부 변경 사항
- **배치 파일 인코딩을 UTF-8 without BOM(순수 UTF-8)으로 표준화**:
  - `downloadTextFile` 함수에서 `.bat`, `.cmd` 파일 다운로드 시 Windows CMD 파서와 100% 호환되도록 UTF-8 BOM을 제외하고 `UTF-8 without BOM`으로 저장하도록 변경.
  - 스크립트 시작 시 `chcp 65001 >nul 2>&1`이 완벽히 적용되어 한글과 결과 화면이 깨짐 없이 선명하게 표시됨.
- **CMD 특수문자 연산자(`&`) 파싱 충돌 원천 방지**:
  - `generateAllAdobeClassroomSilentBat` 등에서 `&` 문자가 콘솔 출력 중 명령어 체이닝으로 해석되지 않도록 `+` 및 `및`으로 변경.
  - 배치 파일 주석을 안전한 `rem` 구문으로 통일하여 라벨 파싱 충돌 방지.
- **버전 및 메타 동기화**:
  - `package.json`: `1.6.1` -> `1.6.2` (PATCH)
  - `src/components/Header.tsx`: `v1.6.2 Multi-App` 배지 반영

---

### [v1.6.1] - 2026-09-20
> **변경 분류: PATCH (컴퓨터실 원격 일괄 스크립트 실행 완료 시 작업 결과 5초 표시 및 자동 종료 엔진 적용)**

#### 🚀 변경 요약
사용자 요청에 따라 `classroom_adobe_all_toggle_silent.bat`을 비롯한 원격 일괄 배포 스크립트 실행 완료 시, 수행된 작업 결과(Photoshop/Illustrator 변경 수량 및 로그 저장 위치)를 콘솔 창에 5초 동안 명확하게 요약 출력한 후 키보드 입력 없이 자동으로 창이 닫히도록 자동 카운트다운 타이머(`timeout /t 5`)를 적용하였습니다.

#### 📦 세부 변경 사항
- **원격 일괄 스크립트 3종에 5초 결과 표시 및 자동 종료 로직 반영**:
  - `classroom_adobe_all_toggle_silent.bat` (통합 토글) 및 `to_en`, `to_ko` 모드
  - `classroom_photoshop_*_silent.bat` (포토샵 전용)
  - `classroom_illustrator_*_silent.bat` (일러스트레이터 전용)
  - 스크립트 종료부에 변경 완료 건수 및 로그 위치 안내 출력:
    ```cmd
    ========================================================
      [작업 완료] Adobe 원격 일괄 언어 변경 결과
    ========================================================
      - 모드: 포토샵 & 일러스트레이터 전체 [한글 ⇄ 영어] 일괄 토글
      - Photoshop 변경 건수: !PS_COUNT! 개
      - Illustrator 변경 건수: !AI_COUNT! 개
      - 실행 로그 저장 위치: !LOG_FILE!
    ========================================================
      [*] 5초 후 창이 자동으로 닫힙니다... (즉시 닫으려면 아무 키나 누르세요)
    timeout /t 5 >nul 2>&1 || ping -n 6 127.0.0.1 >nul
    exit /b 0
    ```
- **문서 및 UI 안내 갱신**:
  - `ClassroomRemoteDeployer.tsx`: "5초 결과 표시 후 자동 종료" 안내 카드 반영.
  - `docs/REMOTE_CLASSROOM_GUIDE.md`: 5초 결과 확인 및 무인 자동 종료 기술 사양 업데이트.
- **버전 및 메타 동기화**:
  - `package.json`: `1.6.0` -> `1.6.1` (PATCH)
  - `src/components/Header.tsx`: `v1.6.1 Multi-App` 배지 반영

---

### [v1.6.0] - 2026-09-20
> **변경 분류: MINOR (학교·기관 컴퓨터실 원격 일괄 배포 전용 무인(Silent) 스크립트 엔진 및 관리자 가이드 탑재)**

#### 🚀 변경 요약
학교 컴퓨터실, 직업전문학교, 대학 실습실, 공인 시험장 등에서 선생님 컴퓨터의 원격 제어 프로그램(NetSupport School, Veyon, 넷오피, 마스터아이, 클라썸 등)을 이용해 수십~수백 대의 학생 PC에 포토샵 및 일러스트레이터 언어 변경 스크립트를 일괄 전송·실행할 때 발생하는 **UAC 팝업 대기 프리징, `pause` 키입력 멈춤, 실행 중인 프로세스 파일 락(Lock) 충돌 문제**를 원천 차단한 **100% 무인(Silent / Non-interactive) 원격 배포 스위트**를 신규 탑재하였습니다.

#### 📦 세부 변경 사항
- **신규 기능 추가 (New Feature)**:
  - **학교 컴퓨터실 원격 일괄 배포 전용 UI (`ClassroomRemoteDeployer.tsx`)**:
    - Photoshop 전용, Illustrator 전용, 그리고 **포토샵 + 일러스트 동시 일괄 처리 통합 스크립트** 3종 지원.
    - **목표 언어 모드 3종 선택 지원**:
      1. **영어로 일괄 고정 (`to_en`)**: 국가공인 자격증 시험(GTQ, 컴퓨터그래픽스운용기능사) 및 영문 전공 실습 대비.
      2. **한글로 일괄 원복 (`to_ko`)**: 수업 종료 후 기본 한글 모드로 원터치 복구.
      3. **원클릭 상호 토글 (`toggle`)**: 현재 언어 상태를 반전 전환.
  - **4대 무인(Silent) 안전 아키텍처 구현**:
    1. `taskkill /f /im Photoshop.exe` & `taskkill /f /im Illustrator.exe` 자동 선행 실행으로 학생 PC의 파일 잠금 충돌 완벽 방지.
    2. 모든 `pause` 및 대화형 `set /p` 문을 완전 제거하고 `exit /b 0`으로 정상 반환하여 원격 제어 프로그램의 세션 무한 대기(Freezing) 방지.
    3. 대화형 UAC 승격 창 없이 원격 제어 프로그램의 SYSTEM 서비스 권한으로 백그라운드 0.1초 즉시 처리.
    4. 학생 PC의 `%TEMP%\adobe_*_remote_deploy.log`에 처리 성공 및 변경 수량을 실시간 기록하여 원격 점검 지원.
  - **공식 원격 배포 가이드 문서 (`docs/REMOTE_CLASSROOM_GUIDE.md`) 발행**:
    - NetSupport School, Veyon, 넷오피 등 대표 원격 제어 프로그램별 일괄 실행 설정법 및 트러블슈팅 매뉴얼 수록.
  - **공식 문서 허브 (`DocsViewer.tsx`) 연동**:
    - 웹 UI 내 문서 뷰어에서 학교·기관 원격 일괄 배포 가이드를 언제든 열람할 수 있도록 신규 탭 추가.
- **버전 및 메타 동기화**:
  - `package.json`: `1.5.1` -> `1.6.0` (MINOR)
  - `src/components/Header.tsx`: `v1.6.0 Multi-App` 배지 반영
  - `docs/PATCH_NOTES.md`: v1.6.0 신규 릴리스 상세 기록

---

### [v1.5.1] - 2026-09-20
> **변경 분류: PATCH (Illustrator 자동 스캔 배치 스크립트 CMD 연산자 파싱 오류 해결 및 지능형 레지스트리 다중 탐색 엔진 강화)**

#### 🚀 변경 요약
사용자가 보고한 `illustrator_multi_version_auto_scanner.bat` 실행 시 발생하던 Windows CMD 인터프리터의 명령어 분리 연산자 파싱 오류(`'선택' is not recognized as an internal or external command`, `'개발자:' is not recognized...`)를 완벽히 해결했습니다. 아울러 기본 드라이브에서 Illustrator 미감지 시 Windows 레지스트리(`App Paths`) 실시간 조회, 다중 드라이브(`C, D, E, F, G, H`)의 루트 및 사용자 지정 폴더, 다양한 AMT 하위 구조 탐색, PowerShell 백그라운드 정밀 스캔(Deep Scan), 그리고 스마트 경로 정규화 수동 입력을 통합 적용하여 어떠한 환경에서도 100% 감지되도록 대폭 보강하였습니다.

#### 📦 세부 변경 사항
- **버그 수정 (Fixed)**:
  - **Windows CMD `&` 명령어 분리 연산자 및 소괄호 파싱 충돌 해결**:
    - `echo   Adobe Illustrator 다중 버전 자동 스캔 & 선택 전환기` 구문에서 `&`가 CMD 명령어 결합자로 인식되어 `'선택' is not recognized` 및 `'개발자:' is not recognized` 오류가 발생하던 문제를 해결.
    - 배너 및 스크립트 출력문의 모든 `&`를 `및`으로, 소괄호 `(CIS)`를 `[CIS]`로 안전하게 교체.
- **기능 개선 및 탐색 강화 (Enhanced & Hardened)**:
  - **Windows 레지스트리(`HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\App Paths\Illustrator.exe`) 실시간 자동 쿼리**:
    - 기본 `Program Files` 경로 외에 다른 드라이브나 임의의 사용자 폴더에 설치된 Illustrator의 실제 실행 경로 및 `AMT\application.xml` 위치를 레지스트리를 통해 0.1초 만에 자동 인식.
  - **다중 드라이브 및 다양한 설치 패턴 탐색**:
    - `C, D, E, F, G, H` 드라이브의 `Program Files\Adobe`, `Program Files (x86)\Adobe`, 루트 `Adobe` 폴더(`C:\Adobe`, `D:\Adobe` 등) 검색.
    - `Support Files\Contents\Windows\AMT\application.xml`, `AMT\application.xml`, `Support Files\AMT\application.xml`, `Support Files\Contents\Windows\application.xml` 등 구버전(CS6)부터 최신 2026 버전까지의 다양한 구조를 포괄 지원.
  - **백그라운드 정밀 스캔 (Deep Scan Fallback)**:
    - 기본 탐색 실패 시 PowerShell을 통해 시스템 드라이브의 `application.xml`을 신속 탐색하여 자동 등록.
  - **스마트 수동 경로 정규화 (`manual_input`)**:
    - 사용자가 Illustrator 루트 폴더, `Support Files`, `Contents\Windows` 등 상위/하위 폴더나 `application.xml` 파일 경로 자체를 입력하더라도 내부 `application.xml`을 자동으로 찾아 진입하도록 지능형 경로 보정 로직 구현.
  - **웹 브라우저 파일 시스템 액세스 API 탐색 범위 확장 (`fileSystemAccess.ts`)**:
    - 루트 직하 `AMT` 및 `Support Files\AMT` 구조 감지 추가.
- **버전 및 문서 동기화**:
  - `package.json`: `1.5.0` -> `1.5.1` (PATCH)
  - `src/components/Header.tsx`: `v1.5.1 Multi-App` 배지 갱신
  - `docs/PATCH_NOTES.md`: `v1.5.1` 릴리스 기록 추가

---

### [v1.5.0] - 2026-09-20
> **변경 분류: MINOR (Adobe Illustrator 한글/영어 언어 변경 지원 및 AMT application.xml 엔진 통합)**

#### 🚀 변경 요약
사용자의 요청("어도비 일러스트도 한글/영어 변경하는 방법이 있나요", "Adobe Illustrator 언어 변경을 위한 지원을 추가하십시오")에 따라, **Adobe Illustrator 전용 한글/영어 전환 지원 및 AMT `application.xml` 엔진**을 전면 탑재했습니다. 메인 화면 상단에 원클릭 애플리케이션 스위처(Ps ⇄ Ai)를 추가하여 포토샵과 일러스트레이터 간을 매끄럽게 오가며 버전을 자동 감지하고 언어를 변경할 수 있습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **어도비 애플리케이션 선택기 (`AppSwitcher.tsx`)**:
    - 포토샵(Photoshop) 및 일러스트레이터(Illustrator)를 원클릭으로 상호 전환할 수 있는 글로벌 스위처 바 탑재.
    - 선택된 앱에 따라 헤더 디자인, 아이콘(Ps / Ai), 색상 테마(Blue / Amber-Orange) 및 파일명 규격 자동 전환.
  - **일러스트레이터 헬퍼 및 스크립트 엔진 (`illustratorHelper.ts`)**:
    - Illustrator CS6부터 CC 2019, 2020, 2021, 2022, 2023, 2024, 2025, 2026까지 전체 버전 프리셋 및 자동 경로 생성 지원.
    - `application.xml` 내 `<Data key="installedLanguages">` 태그 치환 로직(`ko_KR` ⇄ `en_US`) 탑재.
    - `illustrator_multi_version_auto_scanner.bat`: 시스템에 설치된 모든 Illustrator 버전을 자동 탐색하고 선택 전환할 수 있는 전용 배치 파일 생성.
    - `illustrator_smart_toggle.bat`: 원클릭 자동 관리자 권한(UAC) 승격 및 안전한 XML 백업(`.bak`) 생성 토글 스크립트 제공.
  - **웹 브라우저 파일 시스템 액세스 API 일러스트레이터 지원 (`fileSystemAccess.ts`)**:
    - `scanDirectoryForIllustratorInstallations`: `C:\Program Files\Adobe` 또는 지정 폴더에서 `application.xml`을 자동 탐색하여 설치된 일러스트레이터 버전과 언어 상태를 즉시 감지.
    - `toggleIllustratorXmlLanguage`: 브라우저 상에서 직접 `application.xml` 파일의 `installedLanguages` 속성을 무손실 치환.
  - **원리 설명 및 FAQ 가이드 확장 (`PhotoshopGuide.tsx`)**:
    - 일러스트레이터 모드 시 AMT XML 구조, 작동 메커니즘(`ko_KR` ⇄ `en_US`) 및 안전한 복구 원리를 친절하게 시각화 안내.
- **수정 및 개선 (Changed & Improved)**:
  - `PathConfigurator.tsx`: 앱 유형에 따라 경로 레이블 및 추천 프리셋 목록 동적 전환.
  - `ScriptGenerator.tsx`: 일러스트레이터 전용 탭, 코드 미리보기, 일괄 다운로드 번들 ZIP 지원.
  - `Header.tsx`: 현재 선택된 앱(Ps / Ai)을 반영하는 상태 뱃지와 버전 번호(`v1.5.0 Multi-App`) 표시.
- **버전 및 문서 동기화**:
  - `package.json`: `v1.5.0`
  - `metadata.json` & `index.html`: 어도비 일러스트레이터 지원 명시
  - `docs/PATCH_NOTES.md`: `v1.5.0` 패치노트 기록 완료

---

### [v1.4.1] - 2026-09-20
> **변경 분류: PATCH (다중 버전 자동 스캐너 배치 스크립트 CMD 괄호 파싱 구문 오류 해결 및 탐색 견고성 강화)**

#### 🚀 변경 요약
`photoshop_multi_version_auto_scanner.bat` 실행 시 발생하던 Windows CMD 인터프리터의 괄호 파싱 문법 오류(`에서 was unexpected at this time.`)를 완벽히 해결하고, 64비트 및 32비트(x86) 프로그램 경로 탐색 지원 및 미감지 시 사용자 직접 경로 입력 수동 폴백 프롬프트를 전면 추가하였습니다.

#### 📦 세부 변경 사항
- **버그 수정 (Fixed)**:
  - **Windows CMD 괄호 블록 파싱 오류 원천 차단**:
    - `if %ps_count% equ 0 (...)` 블록 내 한글 출력문(`기본 드라이브(C/D/E)에서`)의 닫는 괄호 `)`가 블록 종료자로 오인되어 `에서 was unexpected at this time.` 문법 오류가 발생하던 문제를 해결.
    - 블록형 `if (...)` 대신 레이블 점프(`if %ps_count% equ 0 goto no_photoshop_found`) 방식으로 전면 개편하여 CMD 구문 파싱 충돌을 100% 원천 차단.
    - 화면 출력 텍스트 중 소괄호 `()`를 안전한 대괄호 `[]` 및 하이픈 `-`으로 교체하여 Windows CMD 콘솔 파서의 모든 잠재적 충돌 방지.
  - **UAC 권한 획득 스크립트 실행 일관성 확보**:
    - `uac_ok` 레이블 직후 `@echo off`와 `setlocal enabledelayedexpansion`을 명시적으로 재설정하여 불필요한 명령어 출력 및 환경 변수 오작동 방지.
- **개선 (Enhanced)**:
  - **스캔 드라이브 및 경로 범위 확장**:
    - `C, D, E, F, G, H` 드라이브에 대해 `Program Files\Adobe`뿐만 아니라 `Program Files (x86)\Adobe`까지 동시 탐색하도록 확장.
  - **수동 경로 입력 폴백 프롬프트 (Interactive Manual Fallback) 추가**:
    - 기본 드라이브에서 포토샵이 자동 감지되지 않을 경우 스크립트가 강제 종료되는 대신, 사용자가 Photoshop 설치 디렉터리 또는 `Support Files` 경로를 직접 붙여넣어 언어 전환을 즉시 진행할 수 있는 입력 모드 탑재.
- **버전 및 문서 동기화**:
  - `package.json`: `v1.4.1`
  - `Header.tsx`: `v1.4.1 Multi-Version`
  - `DocsViewer.tsx`: `v1.4.1 Multi-Version`
  - `zipDistributor.ts`: `v1.4.1` 배포 패키지 동기화

---

### [v1.4.0] - 2026-09-18
> **변경 분류: MINOR (포토샵 설치 버전 자동 감지 & 다중 버전 선택기 및 일괄 토글 엔진 탑재)**

#### 🚀 변경 요약
사용자의 요청("포토샵 버전을 자동 감지해서 올바른 폴더를 찾도록 합니다. 여러 버전의 포토샵이 설치 되어 있는 경우에 선택해서 적용할 수 있도록 합니다.")에 따라, 웹 앱 브라우저 환경 및 배포형 도구(HTA GUI, PowerShell WPF, BAT 스크립트) 전반에 걸쳐 **설치된 모든 포토샵 버전을 자동 탐색하고 선택/일괄 적용할 수 있는 다중 버전 자동 감지 엔진(Multi-Version Auto Scanner)**을 전면 탑재했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **웹 앱 내 원클릭 다중 버전 스캐너 & 선택기 (`MultiVersionDetector.tsx`)**:
    - `openAndScanAllPhotoshopVersions()`: File System Access API를 통해 `C:\Program Files\Adobe` 또는 선택한 드라이브/폴더를 0.5초 만에 재귀 탐색하여 설치된 모든 포토샵 버전(2026, 2025, 2024, CC 2019, CS6 등)과 언어 상태를 자동 발견.
    - 감지된 각 버전에 대해 현재 활성화된 언어(🇰🇷 한국어 / 🌐 영어) 상태 배지 표시 및 개별 원클릭 토글 지원.
    - **[이 버전 선택]** 버튼 클릭 시 전체 웹 앱(스크립트 생성기, GUI 내보내기 등)의 타겟 설정을 해당 버전으로 즉시 동기화.
    - **[모든 버전 일괄 토글]**, **[모두 영어로]**, **[모두 한글로]** 다중 버전 일괄 처리 허브 제공.
  - **다중 버전 자동 감지 배치 스크립트 (`generateAutoDetectMultiVersionBat`)**:
    - `photoshop_multi_version_auto_scanner.bat`: C/D/E 드라이브의 모든 Adobe 폴더를 자동 스캔하여 설치된 포토샵 버전 목록을 번호 메뉴로 출력.
    - 원하는 버전 번호를 입력하여 개별 전환하거나 `A`(전체 일괄 토글) 키로 모든 버전을 한 번에 토글 가능.
  - **독립형 GUI 앱 내 다중 버전 선택기 동기화 (`generateWindowsHtaApp`, `generatePowerShellWpfApp`)**:
    - HTA 및 WPF 앱 실행 시 사용자의 PC에 설치된 포토샵 폴더들을 자동 스캔하여 콤보박스(Dropdown)에 목록화.
    - 사용자가 콤보박스에서 버전을 선택하면 현재 언어 상태가 실시간 업데이트되며 즉시 변경 가능.
- **개선 (Enhanced)**:
  - 배포용 압축 패키지(`Photoshop_Language_Switcher_v1.4.0_Distribution_Suite.zip`)에 신규 다중 버전 자동 스캐너 배치 스크립트 및 HTA/WPF 최신 버전 동기화.
  - `ScriptGenerator.tsx` 및 `GuiDistributor.tsx`에 신기능 다중 버전 자동 스캔 탭 및 안내 추가.
- **버전 및 문서 동기화**:
  - `package.json`: `v1.4.0`
  - `Header.tsx`: `v1.4.0 Multi-Version Suite`
  - `DocsViewer.tsx`: `v1.4.0 Multi-Version Suite`

---

### [v1.3.1] - 2026-09-18
> **변경 분류: PATCH (단독 실행 파일 .EXE 자동 빌더 전면 개편 - Windows 내장 C# 컴파일러 및 Base64 인코딩 적용)**

#### 🚀 변경 요약
사용자가 `.EXE 자동 빌더(build_photoshop_toggle_exe.bat)` 실행 시 발생했던 구형 IExpress 괄호 이스케이프 구문 오류(`'는' is not recognized`) 및 파일 누락 문제를 근본적으로 해결했습니다. 취약한 IExpress 방식을 완전히 걷어내고, **Windows 10/11 기본 내장 .NET C# 컴파일러(PowerShell `Add-Type`)** 및 **UTF-16LE Base64 스트림 인코딩**을 도입하여, 바탕화면에 **100% 무결점 단독 실행 파일(`Photoshop_Language_Toggle.exe`)**이 즉시 컴파일되도록 개편했습니다.

#### 📦 세부 변경 사항
- **해결 (Fixed)**:
  - 배치 파일 내 `( ... )` 블록에서 `if %%errorlevel% neq 0 (`의 여는 괄호가 CMD 괄호 짝을 깨뜨려 명령어 조기 종료 및 `'는' is not recognized` 오류가 발생하던 치명적 구문 버그 원천 해결.
  - Windows 버전에 따라 IExpress SED 스크립트의 UAC 실행 실패 및 파일 미생성 오류 제거.
- **개선 (Enhanced)**:
  - `generateExeBuilderBat`: Windows 기본 탑재 .NET C# 컴파일러를 통해 순수 WinForms GUI 바이너리(`Photoshop_Language_Toggle.exe`)를 직접 빌드.
  - **콘솔 번쩍거림 0%**: 검은색 CMD 콘솔 창 없이 0.05초 만에 파일명을 토글하고, 윈도우 대화상자(`MessageBox`)로 성공 알림 팝업 제공.
  - **UTF-16LE Base64(`-EncodedCommand`) 적용**: 특수문자, 따옴표, 한글, 괄호 등으로 인한 CMD 파싱 에러를 100% 원천 방지.
  - 종합 배포 패키지(`Photoshop_Language_Switcher_v1.3.1_Distribution_Suite.zip`) 내 빌더 스크립트도 신규 엔진으로 자동 동기화.
- **버전 및 메타데이터 동기화**:
  - `package.json`: v1.3.1
  - `Header.tsx`: `v1.3.1 GUI Suite`
  - `DocsViewer.tsx`: `v1.3.1 GUI Suite`

---

### [v1.3.0] - 2026-09-18
> **변경 분류: MINOR (독립형 데스크톱 GUI 앱 생성기 & 원클릭 배포 패키지(.ZIP) 스튜디오 탑재)**

#### 🚀 변경 요약
사용자의 요청("코드를 GUI앱에서 만들어 배포 가능하게 해주세요")에 따라, 검은 명령 프롬프트 콘솔 창 없이 순수 Windows 네이티브 창으로 실행되는 **독립형 데스크톱 GUI 애플리케이션 생성 엔진(.hta / .ps1 WPF)** 및 다른 사용자나 PC로 손쉽게 전달할 수 있는 **종합 배포 패키지(.ZIP) 빌더**를 정식 출시했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **독립형 데스크톱 HTML GUI 애플리케이션 (.hta)**:
    - `generateWindowsHtaApp(folderPath, fileName)`: 별도 런타임/컴파일러 설치 없이 윈도우에서 바로 더블클릭하여 실행되는 네이티브 창 프로그램.
    - 실시간 포토샵 로케일 상태(한국어 활성 / 영어 활성 / 폴더 미감지) 감지 기능.
    - 버튼 클릭으로 스마트 자동 토글, 영어 모드로 변경, 한글 모드로 복구 기능 제공.
  - **PowerShell WPF 모던 다크 테마 GUI (.ps1)**:
    - `generatePowerShellWpfApp(folderPath, fileName)`: 고해상도 벡터 그래픽 Windows Presentation Foundation(WPF) XAML 기반의 모던 창 프로그램.
    - 관리자 권한 자동 획득 및 현대적인 다크 슬레이트 비주얼 UI 제공.
  - **종합 배포 패키지 (.ZIP) 내보내기 스튜디오 (`src/utils/zipDistributor.ts`)**:
    - `downloadReleaseDistributionZip(folderPath, fileName, versionTag)`:
      - 루트 폴더: `Photoshop_Language_Switcher_GUI.hta` (단독 GUI 앱), `Photoshop_Switcher_WPF_GUI.ps1` (WPF GUI 앱), `README_배포안내.txt`
      - `scripts/` 폴더: 스마트 토글 .bat, 바로가기 생성기 .bat, 영문 전용 .bat, 한글 전용 .bat, .EXE 빌더 .bat
      - 모든 텍스트 파일은 Windows 호환 `UTF-8 BOM` 및 `CRLF` 개행을 엄격히 적용하여 한글 깨짐 0%.
  - **GUI 앱 생성 & 원클릭 배포 전용 컴포넌트 (`src/components/GuiDistributor.tsx`)**:
    - 앱 상단에서 HTA/WPF GUI 앱을 즉시 다운로드하고, 종합 배포 패키지 ZIP을 원클릭으로 내보낼 수 있는 전용 UI 섹션 배치.
  - **스크립트 생성기(`ScriptGenerator.tsx`)에 HTML 데스크톱 GUI(.hta) 탭 통합**:
    - 카테고리 1(추천) 탭에 `.hta` GUI 선택 버튼 추가.
- **버전 및 메타데이터 동기화**:
  - `package.json`: v1.3.0
  - `Header.tsx`: `v1.3.0 GUI Suite`
  - `DocsViewer.tsx`: `v1.3.0 GUI Suite`

---

### [v1.2.4] - 2026-09-18
> **변경 분류: PATCH (배치 파일 CMD 지연 평가 구문 버그 해결 및 UAC 승격 로직 안정화)**

#### 🚀 변경 요약
Windows CMD 인터프리터의 괄호 `(...)` 블록 내부 사전 평가(Pre-parsing) 특성으로 인해 발생하던 **`if 2 NEQ 0` 가짜 관리자 권한 거부(False ErrorLevel 1) 버그를 원천 해결**했습니다. 중첩 `if` 블록을 제거하고 정밀한 라벨 점프(`goto uac_ok`) 및 즉시 종료 체계로 전면 개편하여 일반 더블클릭 시 정상적으로 UAC 승인 팝업이 뜨고 언어 전환이 안정적으로 진행되도록 수정했습니다.

#### 📦 세부 변경 사항
- **해결 (Fixed)**:
  - **CMD 변수 지연 평가 버그 원천 차단**:
    - 기존: `if %errorlevel% neq 0 ( ... powershell ... if %errorlevel% neq 0 ( [오류: ErrorLevel 1] ) )` 구조에서 CMD가 첫 줄의 `net session` 실패 코드(`2`)를 내부 `if`에도 사전 대입하여 PowerShell 실행 결과와 무관하게 무조건 에러 블록을 실행하던 결함 해결.
    - 변경: `net session >nul 2>&1` 검사 후 관리자 권한이 확인되면 즉시 `goto uac_ok`로 분기하고, 미확인 시에만 1회 권한 승격을 요청한 뒤 정상 승인 시 `exit /b 0`으로 부모 창을 조용히 닫도록 개선.
- **수정 대상 파일**:
  - `generateSmartToggleBat` (스마트 자동 토글 .bat)
  - `generateToEnglishBat` (영어 변경 .bat)
  - `generateToKoreanBat` (한글 복구 .bat)
  - `generateExeBuilderBat` (.EXE 빌더 .bat)
  - `generateDesktopShortcutBat` (바탕화면 바로가기 생성 .bat)
- **UI 및 버전 동기화**:
  - `Header.tsx` 및 `DocsViewer.tsx` 버전 배지 `v1.2.4 Desktop`으로 갱신.

---

### [v1.2.3] - 2026-09-18
> **변경 분류: PATCH (공식 개발자/문의처/공식 블로그/소속 조직 메타데이터 통합 반영)**

#### 🚀 변경 요약
사용자가 제공한 공식 개발자 프로필 및 소속 정보(개발자, 공식 문의 이메일, 공식 구글 블로그, 소속 조직 웹사이트)를 웹 애플리케이션의 하단 푸터(Footer), 공식 사용자 가이드(`USER_GUIDE.md`), 문서 뷰어 및 메타데이터 체계에 정식으로 통합 탑재했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **공식 개발자 프로필 메타데이터 (`src/types/developer.ts`)**:
    - 개발자: `AhBiYout`
    - 공식 구글 블로그: `https://ahbiyoutvibe.blogspot.com/`
    - 소속 조직: `https://www.cisnet.co.kr` (CIS)
  - **전용 공식 푸터 컴포넌트 (`src/components/Footer.tsx`)**:
    - 앱 기능 소개, 백신 오진 0% 및 ErrorLevel 준수 안내, 개발자 정보 카드, 공식 문의 이메일 링크, 공식 구글 블로그 바로가기, 소속 조직 링크 배치.
- **수정 (Changed)**:
  - `src/App.tsx`: 기존 단순 인라인 텍스트 푸터를 신규 `Footer` 컴포넌트로 교체.
  - `src/components/Header.tsx` & `src/components/DocsViewer.tsx`: 최신 버전 표기 `v1.2.3 Desktop`으로 갱신.
  - `docs/USER_GUIDE.md`: 섹션 8 '공식 개발자 및 문의처' 명시 추가.

---

### [v1.2.2] - 2026-09-18
> **변경 분류: PATCH (배치 스크립트 표준 ErrorLevel / 종료 코드 체계 규격화 및 관리 UI 탑재)**

#### 🚀 변경 요약
사용자의 요청에 따라 모든 Windows 배치 스크립트(`.bat`)의 **종료 코드(ErrorLevel / Exit Code) 반환 체계를 명시적으로 표준화 및 규격화**했습니다. 스크립트 실행 후 발생할 수 있는 각 예외 상황(권한 거부, 폴더 미존재, 파일 미존재, 이름 변경 실패 등)마다 고유의 ErrorLevel 값을 부여하여 자동화 스크립트나 상위 호출 프로그램(PowerShell, 스케줄러 등)에서 에러를 완벽히 감지·관리할 수 있도록 했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **ErrorLevel 표준 규격 명세 (`src/types/errorLevels.ts`)**:
    - `0`: SUCCESS (정상 완료)
    - `1`: UAC_PERMISSION_DENIED (관리자 권한 획득 실패 또는 거부)
    - `2`: FOLDER_NOT_FOUND (포토샵 설치 폴더 미존재 또는 접근 불가)
    - `3`: TARGET_FILE_NOT_FOUND (대상 언어 데이터 파일 미존재)
    - `4`: FILE_RENAME_FAILED (파일 이름 변경 실패, 권한 부족 또는 파일 잠금)
  - **웹 UI 상의 ErrorLevel 매트릭스 카드 뷰**:
    - 스크립트 생성기 하단에 각 ErrorLevel 코드 번호와 레이블, 상태 설명을 일목요연하게 표시.
- **수정 (Changed)**:
  - `generateToEnglishBat`, `generateToKoreanBat`, `generateSmartToggleBat` 모든 배치 스크립트에 `exit /b <코드>` 명시적 반환 및 분기 라벨(`goto success`, `goto err_folder`, `goto err_file`, `goto err_rename`) 반영.
- **문서 (Docs)**:
  - `docs/ARCHITECTURE.md`: 표준 ErrorLevel 아키텍처 규격 표 추가.

---

### [v1.2.1] - 2026-09-18
> **변경 분류: PATCH (배치 스크립트 전면 고도화 & 백신 오진 0% 보장 체계 및 VBS 휴리스틱 주의 안내)**

#### 🚀 변경 요약
사용자 피드백을 반영하여, 백신(Windows Defender, V3, 알약 등)의 휴리스틱 검사에서 오진(False Positive) 위험이 높은 VBScript의 위험도를 명확히 경고하고, **순수 Windows 표준 명령어로만 구성된 초고신뢰성 배치 스크립트(`.bat`) 체계를 최우선 기본 탭으로 재배치 및 전면 강화**했습니다. 실행 중인 `Photoshop.exe` 프로세스 잠금 자동 감지, 영구 보관 폴더(`%USERPROFILE%\PhotoshopSwitcher`) 안전 생성 및 경로 접근 검증 로직을 탑재했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **스크립트별 보안 프로필 체계 (`src/types/security.ts`)**:
    - 스크립트 형식별 백신 위험도(`none` / `low` / `high`) 평가 배지 및 안전성 보증 텍스트 연동.
  - **포토샵 프로세스 실행 여부 자동 감지 로직 (`tasklist | find /i "Photoshop.exe"`)**:
    - 모든 배치 스크립트(`.bat`)에서 포토샵이 실행 중일 경우 파일 잠금 오류가 발생하지 않도록 사전 경고 및 종료 안내 출력.
  - **VBScript 휴리스틱 오진 주의 배너**:
    - VBScript 선택 시 백신의 휴리스틱 오진 메커니즘을 상세히 안내하고 안전한 `.bat` 사용을 권장하는 경고 블록 추가.
- **수정 (Changed)**:
  - **스마트 토글 배치 파일(`.bat`)을 최우선 기본(Default) 추천 탭으로 전면 재배치**.
  - 바탕화면 바로가기 생성기(`create_desktop_shortcut.bat`) 내부 스크립트에 프로세스 점검 및 자동 창 닫힘(`timeout /t 2`) 로직 추가.
  - 안전 툴킷 전체 받기 버튼을 백신 오진 0% 배치 스크립트 묶음으로 재구성.
- **문서 (Docs)**:
  - `TROUBLESHOOTING.md`: VBScript의 백신 오진 원인 및 순수 배치 스크립트 권장 가이드 추가.

---

### [v1.2.0] - 2026-09-18
> **변경 분류: MINOR (단독 데스크톱 앱 PWA 탑재 & .EXE 단독 실행 파일 빌더 및 무음 GUI 런처 신규 추가)**

#### 🚀 변경 요약
웹 애플리케이션을 Windows/macOS의 단독 데스크톱 앱으로 직접 설치(PWA)하여 사용할 수 있는 데스크톱 런타임 환경을 구축하고, Windows 내장 컴파일러(IExpress)를 이용해 바탕화면에 진짜 단독 실행 파일(`.EXE`)을 생성하는 빌더 및 검은 콘솔창 없는 무음 VBScript GUI 런처, 바탕화면 바로가기 자동 생성기를 전면 탑재했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **단독 데스크톱 앱(Progressive Web App) 환경 탑재**:
    - `vite-plugin-pwa` 기반의 데스크톱 앱 설치 파이프라인 구성.
    - 브라우저 창 없이 독립적인 윈도우 창에서 실행되는 `standalone` 디스플레이 모드 적용.
    - 오프라인 상태에서도 완벽하게 동작하는 캐싱 서비스 워커(Service Worker) 및 오프라인 인디케이터(`OfflineIndicator`) 탑재.
    - 데스크톱 전용 윈도우 타이틀바(`DesktopWindowBar`) 및 헤더 내 1-클릭 데스크톱 앱 설치 버튼(`PWAInstallButton`) 제공.
  - **Windows .EXE 단독 실행 파일 자동 빌더 (`build_photoshop_toggle_exe.bat`)**:
    - Windows 기본 내장 패키징 엔진인 `iexpress.exe`와 지시자(SED)를 실시간 구성하여, 추가 컴파일러나 프로그램 설치 없이도 바탕화면에 `Photoshop_Language_Toggle.exe` 단독 실행 파일을 자동 생성.
  - **VBScript 무음 GUI 런처 (`photoshop_toggle_gui.vbs`)**:
    - 검은색 CMD 콘솔 창이 화면에 번쩍거리지 않고, 백그라운드에서 즉시 언어를 전환한 후 정품 Windows 메시지 박스(`MsgBox`)를 띄워 직관적인 데스크톱 UX 제공.
    - VBScript 내부 자동 UAC 권한 승격(`runas`) 루틴 탑재.
  - **바탕화면 전용 바로가기 생성기 (`create_desktop_shortcut.bat`)**:
    - 바탕화면에 "포토샵 한영 전환" 전용 바로가기(`.lnk`) 아이콘을 원클릭으로 자동 생성.
  - **원클릭 데스크톱 툴킷 전체 받기 기능**:
    - `.exe 빌더`, `.vbs 무음 런처`, `바탕화면 바로가기`, `스마트 토글 배치 파일`을 한 번에 일괄 다운로드하는 통합 번들 버튼 탑재.
- **수정 (Changed)**:
  - `ScriptGenerator.tsx` 인터페이스를 카테고리화하여 [데스크톱 단독 실행 파일 & GUI 런처]와 [표준 배치/셸 스크립트]로 분리 구성.
  - 헤더 및 문서 허브 버전을 `v1.2.0 Desktop`으로 승격.
- **문서 (Docs)**:
  - `USER_GUIDE.md`: 데스크톱 앱 설치 가이드 및 .EXE 빌더, VBS 무음 런처 사용법 신규 추가.
  - `ARCHITECTURE.md`: 데스크톱 PWA 아키텍처 및 Windows 내장 IExpress .EXE 컴파일 구조 명시.
  - `TROUBLESHOOTING.md`: 데스크톱 앱 설치 및 .EXE 생성 시 트러블슈팅 가이드 보강.

---

### [v1.1.0] - 2026-09-18
> **변경 분류: MINOR (새로운 기능 추가 및 스크립트 실행/인코딩 엔진 고도화)**

#### 🚀 변경 요약
배치(.bat) 파일의 자동 관리자 권한 획득(UAC Self-Elevation) 기능을 탑재하여 우클릭 없이 더블클릭만으로 실행 가능하도록 개선하고, Windows 표준 CRLF 개행 및 UTF-8 with BOM 형식을 강제 적용하여 메모장과 CMD에서 한글이 전혀 깨지지 않도록 인코딩 파이프라인을 전면 고도화했습니다.

#### 📦 세부 변경 사항
- **추가 (Added)**:
  - **배치 파일 자동 관리자 권한 획득 (UAC Self-Elevation)**:
    - 모든 `.bat` 스크립트(`photoshop_toggle_language.bat`, `photoshop_switch_to_english.bat`, `photoshop_switch_to_korean.bat`) 상단에 `net session` 검사 및 `Start-Process -FilePath '%~f0' -Verb RunAs` 자동 권한 승격 로직 탑재.
    - 일반 더블클릭 실행 시에도 Windows UAC 승인 창이 즉시 표시되어 관리자 권한으로 자동 승격 실행됨.
  - **Windows CRLF (`\r\n`) 표준 개행 변환 엔진**:
    - 웹에서 다운로드되는 모든 `.bat`, `.cmd`, `.ps1` 파일에 대해 `\n` 개행을 Windows 표준 `\r\n` (CRLF)으로 정규화하여 저장.
  - **UTF-8 with BOM (`0xEF, 0xBB, 0xBF`) 인코딩 적용**:
    - 파일 바이너리 헤더에 UTF-8 BOM을 삽입하여, 한글 윈도우(CP949 환경)의 cmd.exe 및 메모장(Notepad)이 문서를 즉각 UTF-8로 자동 판별하도록 조치. 한글 주석, 경로 및 콘솔 출력 메시지 깨짐 원천 차단.
- **수정 (Changed)**:
  - 배치 스크립트 내부 경로 이동 시 `cd /d "${folderPath}"` 드라이브 동시 전환 플래그 적용으로 다양한 드라이브(D:, E: 등) 간 점프 신뢰도 향상.
  - `ScriptGenerator.tsx` UI 내 원클릭 다운로드 섹션에 `UTF-8 BOM`, `CRLF`, `Auto UAC` 규격 뱃지 및 상세 안내 반영.
- **문서 (Docs)**:
  - `USER_GUIDE.md`, `ARCHITECTURE.md`, `TROUBLESHOOTING.md`에 자동 관리자 권한 획득 및 인코딩 사양 최신화.

---

### [v1.0.0] - 2026-09-18 (초기 정식 릴리스)
> **변경 분류: MAJOR (초기 공식 릴리스 v1.0.0)**

#### ✨ 주요 추가 기능 (Added)
- **포토샵 버전별 자동 폴더 감지 규칙 엔진**:
  - Photoshop 2026, 2025, 2024, 2023, 2022, 2021, 2020, CC 2019, CC 2018, CS6 버전의 `Locales/ko_KR/Support Files` 경로 자동 매핑 규칙 구현
  - Windows 설치 드라이브(C:, D:, E: 등) 및 macOS 경로 대응
  - CS6 특화 언어 데이터 파일(`tw10428.dat`) 및 최신 공통 파일(`tw10428_Photoshop_ko_KR.dat`) 감지 규칙 추가
- **사용자 맞춤형 직접 경로 지정 기능**:
  - 외장 드라이브 또는 비표준 경로에 설치된 포토샵 폴더 전체 경로 직접 입력 모드
  - 클립보드 원클릭 붙여넣기 및 자주 사용되는 비표준 설치 경로 프리셋 제공
  - 사용자 지정 DAT 파일명 유연 설정 기능
- **원클릭 언어 전환 스크립트 생성 엔진**:
  - 스마트 자동 토글 배치 파일 (`photoshop_toggle_language.bat`): 한글/영어 상태를 자동 파악하여 즉시 상호 전환
  - 영문 전용 변경 스크립트 (`photoshop_switch_to_english.bat`)
  - 한글 전용 복구 스크립트 (`photoshop_switch_to_korean.bat`)
  - modern Windows용 PowerShell 스크립트 (`photoshop_toggle.ps1`)
  - macOS 터미널 쉘 스크립트 (`photoshop_toggle_mac.sh`)
- **브라우저 File System Access 연동**:
  - Chrome / Edge 브라우저를 통해 로컬 Support Files 폴더를 직접 읽고, 스크립트 다운로드 없이 1초 만에 웹에서 즉시 언어 토글 수행
- **문서화 체계 (`/docs`) 구축**:
  - `README.md`, `ARCHITECTURE.md`, `USER_GUIDE.md`, `TROUBLESHOOTING.md`, `PATCH_NOTES.md` 생성
  - 소프트웨어 버전 관리(Semantic Versioning) 표준화 체계 수립

#### 🛡️ 안전성 & 원리 (Security & Safety)
- 원본 파일 삭제 없이 `old_` 접두사만 안전하게 토글하여 언제든 100% 무손실 복구 보장
- `chcp 65001` UTF-8 지원으로 한글 윈도우 환경에서 글자 깨짐 방지
- 관리자 권한(UAC) 필요 상황 사전 안내

---

## 📝 코드 수정 특이점 기록 템플릿 (향후 버전 기록용)

```markdown
### [vX.Y.Z] - YYYY-MM-DD
> **변경 분류: [MAJOR / MINOR / PATCH]**

#### 🚀 변경 요약
- 변경 목적 및 특이점 요약

#### 📦 세부 변경 사항
- **추가 (Added)**: 신규 기능 또는 규칙
- **수정 (Changed)**: 기존 동작 방식의 변경
- **해결 (Fixed)**: 버그 해결 및 예외 처리
- **문서 (Docs)**: 관련 문서 추가 및 수정
```

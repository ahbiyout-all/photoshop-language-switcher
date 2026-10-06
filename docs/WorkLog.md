# 프로젝트 종합 작업 로그 (Project Work Log)

- **소프트웨어 명칭:** Adobe Photoshop & Illustrator Language Switcher Suite
- **담당 수석 엔지니어:** AI 코딩 도우미 & AhBiYout
- **공식 채널:** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS) | [공식 블로그](https://ahbiyoutvibe.blogspot.com/)
- **공식 GitHub:** [https://github.com/ahbiyout-all/photoshop-language-switcher](https://github.com/ahbiyout-all/photoshop-language-switcher)

---

## 작업 이력 및 마일스톤 (Milestone History)

### [2026-10-06] 마일스톤 35: v2.13.0 - 생성되는 모든 원클릭 .EXE/.bat 파일명에 버전별 해당 연도(Year) 숫자 자동 부여 체계 구축
- **분류:** MINOR
- **작업 내용:**
  1. 원클릭 실행기 및 배치 파일명에 연도(Year) 숫자 자동 결합:
     - `resolveVersionYear` 헬퍼 함수를 신설하여 사용자가 선택한 버전의 연도(2026, 2025, 2024, 2023 등)를 정확히 추출.
     - 간편 모드(Easy Mode):
       - .EXE: `Photoshop_2026_Language_Switcher_Toggle.exe`, `Build_Photoshop_2026_Language_Switcher_Toggle_EXE.bat`
       - .bat: `Photoshop_2026_Language_Switcher_Toggle.bat`, `Photoshop_2026_Language_Switcher_English.bat` 등
       - Illustrator: `Illustrator_2026_Language_Switcher_Toggle.exe` 및 `.bat`
     - 스크립트 생성기(Script Generator):
       - `photoshop_2026_toggle_language.bat`, `create_photoshop_2026_desktop_shortcut.bat`, `build_photoshop_2026_toggle_exe.bat`, `Photoshop_2026_Language_Switcher_GUI.hta`, `photoshop_2026_toggle.ps1` 등
       - 전체 툴킷 일괄 다운로드 파일명 세트에도 연도 숫자 동기화.
     - 확장 앱 제품군 및 배포 ZIP 번들(`zipDistributor.ts`):
       - `Photoshop_2026_Language_Switcher_v2.13.0_Distribution_Suite.zip` 및 압축 파일 내부 스크립트 전반에 연도 식별자 반영.
  2. UI 실시간 미리보기 팁 연동:
     - 간편 모드 실행기 다운로드 안내 패널에서 선택된 버전 연도가 반영된 실제 파일명을 실시간 안내 코드로 표기.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `docs/PATCH_NOTES.md`, `docs/WorkLog.md` 버전을 `v2.13.0`으로 갱신.

### [2026-10-06] 마일스톤 34: v2.12.3 - github_setup.bat 최초 실행 시 ".은(는) 예상되지 않았습니다" 구문 오류 수정 및 선형 파싱 구조화
- **분류:** PATCH
- **작업 내용:**
  1. `github_setup.bat` 및 `scripts/github_setup.bat` 첫 실행 시 파싱 오류 수정:
     - 원인: `:remote_origin_setup` 라벨 내 대형 중첩 괄호 `if (...)` 블록 내에서 `%APP_TAG%`의 `(%APP_TAG%)` 닫는 괄호 조기 인식 및 `echo.`가 중첩 문맥에서 충돌하여 `.은(는) 예상되지 않았습니다.` 에러 발생. 첫 실행 시 `origin` 추가 후 비정상 중단되고, 두 번째 실행 시에는 이미 `origin`이 존재하여 `:remote_origin_found`로 점프해 우회되었던 현상 원천 해결.
     - 해결: 중첩 `if (...)`를 제거하고 `:remote_origin_found`와 동일한 안전한 선형(Linear) 분기 구조(`if /i "!PUSH_FIRST!"=="N" goto :success_exit`)로 전면 개편.
     - 괄호 표기 충돌 방지를 위해 `(%APP_TAG%)`를 `[!APP_TAG!]`로 안전하게 교체.
  2. 원격 저장소 선택 UI 동기화:
     - `scripts/github_setup.bat`에도 `ahbiyout-all` / `ahbiyout` / 사용자 지정 URL 선택 메뉴(1~3번)를 동일하게 반영.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `docs/PATCH_NOTES.md`, `docs/WorkLog.md` 버전을 `v2.12.3`으로 갱신.

### [2026-10-06] 마일스톤 33: v2.12.2 - 모든 스크립트 실행 종료 시 콘솔 창 자동 꺼짐 방지용 pause 표준화 탑재
- **분류:** PATCH
- **작업 내용:**
  1. 모든 스크립트의 종료 지점에 표준 `pause` 명령어 탑재:
     - Photoshop (`photoshopHelper.ts`): `generateToEnglishBat`, `generateToKoreanBat`, `generateSmartToggleBat`에서 `pause >nul` 대신 `pause`로 전면 교체하여 완료 메시지 후 대기하도록 변경. 바탕화면 바로가기 영구 배치 스크립트 및 무인 배포기 대화형 모드에 `pause` 적용.
     - Illustrator (`illustratorHelper.ts`): `generateIllustratorSmartToggleBat`, `generateIllustratorAutoDetectMultiVersionBat`, `generateIllustratorToEnglishBat`, `generateIllustratorToKoreanBat`, `generateIllustratorShortcutBat` 등에서 3초 타임아웃 자동 종료(`timeout /t 3`)를 제거하고 명시적 `pause`로 대체하여 콘솔 창 유지.
     - 확장 제품군 및 빌드 스크립트 종료 지점의 `pause` 동작 전수 점검 및 일관성 확보.
  2. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.12.2`로 동기화 완료.

### [2026-10-06] 마일스톤 32: v2.12.1 - 추가 어도비 제품군(InDesign, InCopy, After Effects, Premiere Pro, Audition) 1.5초 안전 멈춤 엔진 전면 탑재
- **분류:** PATCH
- **작업 내용:**
  1. 추가 어도비 확장 제품군 전체 1.5초 안전 완충 엔진(Safe Step Pacing Engine) 탑재:
     - `generateInDesignScript` (InDesign / InCopy): 권한 점검(1.5초) -> 프로세스 락 해제(1.5초) -> 레지스트리 키 탐색/변경(1.5초) -> 레지스트리 버퍼 플러시(1.5초) 적용.
     - `generateAfterEffectsScript` (After Effects): 프로세스 점검(1.5초) -> Documents 폴더 접근(1.5초) -> `ae_force_english.txt` 플래그 원자적 갱신(1.5초) -> 디스크 플러시/검증(1.5초) 적용.
     - `generatePremiereScript` (Premiere Pro): 프로세스 점검(1.5초) -> 프로필 환경설정 탐색(1.5초) -> `ADOBE_FORCE_LOCALE` 및 콘솔 언어 갱신(1.5초) -> 환경 변수 플러시(1.5초) 적용.
     - `generateAuditionScript` (Audition): 프로세스 점검(1.5초) -> 환경 변수 동기화(1.5초) -> 버퍼 플러시(1.5초) 적용.
     - `generateMasterExtendedAdobeScript` (All-in-One): 5개 제품군 일괄 처리 과정 전체에 1.5초 단계별 안전 지연 적용.
  2. UI 배지 추가:
     - `ExtendedAppsSuite.tsx` 상단 배너에 `1.5s Safe Engine` 보안 배지 추가.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.12.1`로 동기화 완료.

### [2026-10-06] 마일스톤 31: v2.12.0 - 전산 관리자 / 강사 / 개발자 전용 도구 및 모든 실행 스크립트에 1.5초 안전 멈춤 엔진(Safe Step Pacing Engine) 전면 탑재
- **분류:** MINOR
- **작업 내용:**
  1. 일반 모드 및 전산 관리자 / 강사 / 개발자 전용 도구군 전체에 1.5초 단계별 안전 완충 엔진(Safe Step Pacing Engine) 탑재:
     - **단일/일반 스크립트**: 4단계별 1.5초 안전 딜레이(프로세스/파일 락 점검 -> 폴더 접근/권한 점검 -> 언어 파일 교체 -> 디스크 플러시/검증).
     - **컴퓨터실 무인 일괄 배포기 (`generate*ClassroomSilentBat`)**: `taskkill /f` 직후 Windows 커널 파일 핸들 반환 대기를 위한 1.5초 지연 및 파일 변경 I/O 플러시 적용.
     - **다중 버전 자동 감지 & 일괄 전환기 (`generate*AutoDetectMultiVersionBat`)**: 다중 설치본 일괄 토글 및 개별 버전 전환 단계마다 1.5초 지연 적용으로 디스크 경합 차단.
     - **24개국 글로벌 언어 매트릭스 전환기 (`generateUniversalMultiLangBat`)**: 국가별 언어팩 교체 시 1.5초 안전 지연 적용.
     - **바탕화면 원클릭 바로가기 (`generate*ShortcutBat`)**: 백그라운드 토글 배치 파일에 1.5초 안전 지연 내장.
  2. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.12.0`으로 동기화 완료.

### [2026-10-06] 마일스톤 30: v2.11.19 - 설치된 연도 버전 선택 시 실제 경로 생성/동기화 결함 해결 및 확장 버전 프리셋 동기화
- **분류:** PATCH
- **작업 내용:**
  1. 간편 모드(Easy Mode) 연도 버전 선택 시 실제 대상 경로 생성 및 동기화 결함 수정:
     - `EasyModeView.tsx`에서 '설치된 연도 버전 선택' 클릭 시 `isCustomPath` 플래그 해제 및 실제 OS/드라이브/연도별 폴더 경로 및 DAT 파일명(`tw10428_Photoshop_ko_KR.dat` vs `tw10428.dat` vs `application.xml`) 즉각 연동.
     - `MultiVersionDetector.tsx` 탐지 항목 선택 시 `customPath`와 `isCustomPath` 상태 정합성 보완.
  2. 포토샵 및 일러스트레이터 구버전 프리셋 대폭 확장 (CC 2014 ~ 2026, CS6 32/64비트).
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.11.19`로 동기화 완료.

### [2026-10-05] 마일스톤 29: v2.11.18 - 배치 스크립트(.bat) echo 내 특수문자(&) 이스케이프 가드 보완 및 푸시 성공 검증 완료
- **분류:** PATCH
- **작업 내용:**
  1. 배치 파일 내 `echo` 출력 문자열의 `&` 특수문자를 `^&`로 이스케이프:
     - `Auto-Rebase & Push` 등에서 발생하던 `'Push'은(는) 내부 또는 외부 명령이 아닙니다` CMD 파싱 오류 완전 해결.
  2. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.11.18`로 동기화 완료.

### [2026-10-05] 마일스톤 28: v2.11.17 - GitHub 공식 Privacy Noreply 이메일 ahbiyout-all@users.noreply.github.com 전면 교정 및 정합성 보장
- **분류:** PATCH
- **작업 내용:**
  1. Git Author Email을 GitHub 사용자명 기반 공식 노리플라이 주소(`ahbiyout-all@users.noreply.github.com`)로 전면 교정:
     - `deploy_gh_pages.bat` 및 `github_setup.bat` 내 자동 감지 및 Sanitization 대상을 `ahbiyout-all@users.noreply.github.com`으로 교정.
     - `docs/GIT_SECURITY_GUIDE.md` 내 가이드 갱신.
  2. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.11.17`로 동기화 완료.

### [2026-10-05] 마일스톤 27: v2.11.16 - GitHub 사용자명 'ahbiyout-all' 및 계정명 'ahbiyout' 구조적 명확화 & 전역 URL 동기화
- **분류:** PATCH
- **작업 내용:**
  1. GitHub 사용자명(ahbiyout-all) 및 계정명(ahbiyout) 역할 정립:
     - 사용자명(GitHub Username): `ahbiyout-all`
     - 계정/조직명(Account/Author): `ahbiyout` / `AhBiYout`
  2. 원격 저장소 및 배포 URL 일괄 동기화:
     - 리포지토리: `https://github.com/ahbiyout-all/photoshop-language-switcher`
     - Pages 라이브 URL: `https://ahbiyout-all.github.io/photoshop-language-switcher/`
  3. 배치 파일 및 리드미 동기화:
     - `deploy_gh_pages.bat` 및 `github_setup.bat` 1번 추천 메뉴를 `ahbiyout-all`로 확정.
     - `README.md` 상단 뱃지 및 본문 링크 동기화.
  4. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.11.16`으로 동기화 완료.

### [2026-10-05] 마일스톤 26: v2.11.15 - 배치 파일(.bat) 내 GitHub 원격 저장소 URL(ahbiyout) 전면 교정 및 GitHub Pages 링크/보안 동기화
- **분류:** PATCH
- **작업 내용:**
  1. 배치 파일(`deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`) 내 기본 원격 저장소 URL 교정:
     - 기존 `ahbiyout-all`이 기본 추천(1번)으로 되어 있던 오류를 실제 소유자 계정인 **`https://github.com/ahbiyout/photoshop-language-switcher.git`**으로 전면 교정.
     - 403 권한 트러블슈터 및 수동 가이드 내 URL도 소유자 `ahbiyout`으로 일괄 동기화.
  2. GitHub Pages 라이브 데모 URL 정합성 확보:
     - `src/version.ts`, `README.md` 내 배포 사이트 링크를 `https://ahbiyout.github.io/photoshop-language-switcher/`로 100% 일치.
  3. 개인정보 비노출 및 bat 스크립트 업로드 보안 가이드 유지:
     - 개인 이메일(`redmunlight@gmail.com`)은 코드베이스 전역에서 완전히 격리 및 비노출 처리 확인.
     - Git 커밋 시 GitHub 공식 노리플라이 이메일(`ahbiyout@users.noreply.github.com`) 자동 바인딩.
  4. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `build.bat`, `scripts/build.bat`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 버전을 `v2.11.15`로 동기화 완료.

### [2026-10-05] 마일스톤 25: v2.11.13 - 공식 GitHub Pages 배포 사이트 라이브 URL 리드미(README.md) 전면 배치 및 다국어 문서 연동
- **분류:** PATCH
- **작업 내용:**
  1. 루트 리드미(`README.md`) 상단에 GitHub Pages 공식 주소 및 뱃지 추가:
     - `https://ahbiyout.github.io/photoshop-language-switcher/` 라이브 데모 바로가기 및 뱃지 전면 배치.
  2. 스크립트 및 문서 색인 링크 동기화:
     - `scripts/README.md` 내 배포 후 접속 라이브 URL 표기.
     - `docs/README.md` 내 신규 보안 가이드(`GIT_SECURITY_GUIDE.md`) 문서 색인 등록.
     - `src/version.ts` 내 `APP_GITHUB_PAGES_URL` 상수 정의 추가.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.13`으로 동기화 완료.

### [2026-10-05] 마일스톤 24: v2.11.12 - 개인 이메일 전면 비노출 보안 처리 및 GitHub 공식 Privacy No-Reply 주소(ahbiyout@users.noreply.github.com) 전환
- **분류:** PATCH
- **작업 내용:**
  1. 사용자 개인 이메일 전면 비노출 보안 조치:
     - 소스 코드, 배치 스크립트, 문서 등 저장소 전역에서 개인 이메일 주소를 100% 제거.
  2. Git Author Email을 GitHub 공식 개인정보 보호용 노리플라이 주소(`ahbiyout@users.noreply.github.com`)로 전면 교체:
     - `deploy_gh_pages.bat` 및 `github_setup.bat`에 과거 설정된 개인 이메일 자동 정화(Sanitization) 루틴 탑재.
     - Git 작성자 이메일 미설정 시에도 GitHub No-Reply 주소가 기본 등록되도록 수정.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `docs/GIT_SECURITY_GUIDE.md` 전역 버전을 `v2.11.12`로 동기화 완료.

### [2026-10-05] 마일스톤 23: v2.11.11 - GitHub 푸시 보안 강화, 개인정보/시크릿 파일 차단망 고도화, 배치 스크립트(.bat) 배포 안전성 검증 및 전용 가이드 수립
- **분류:** PATCH
- **작업 내용:**
  1. GitHub 푸시 시 개인정보 및 시크릿 데이터 차단망 고도화 (`.gitignore`):
     - `*.secret`, `*.token`, `*.pat`, `*.key`, `*.pem`, `*.pfx`, `*.p12`, `credentials.json`, `personal/`, `private/` 등 비공개 자격 증명 파일 차단 규칙 추가.
  2. 배치 스크립트(`.bat`) 배포 안전성 검증 및 보안 가이드 작성 (`docs/GIT_SECURITY_GUIDE.md`):
     - `build.bat`, `deploy_gh_pages.bat`, `github_setup.bat` 등 자동화 스크립트 내 시크릿 하드코딩 부재 검증.
     - 사용자 더블 클릭 편의성을 위한 오픈소스 배포 권장 사항 및 푸시 전 체크리스트 수립.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.11`로 동기화 완료.

### [2026-10-02] 마일스톤 22: v2.11.10 - GitHub 계정 사용자명(ahbiyout) 및 프로필 표시 이름(ahbiyout-all) 최종 정합성 확정 및 작업 경로 안내 강화
- **분류:** PATCH
- **작업 내용:**
  1. 사용자 최종 확인 사항 반영:
     - 사용자 계정 아이디(Username): `ahbiyout`
     - 계정 프로필 표시 이름(Display Name): `ahbiyout-all`
     - 작성자(Author): `AhBiYout`
     - 이에 따라 GitHub URL 체계(https://github.com/{username}/{repo})에 맞추어 공식 저장소 URL을 `https://github.com/ahbiyout/photoshop-language-switcher.git`, 프로필 URL을 `https://github.com/ahbiyout`로 완전 통일.
  2. Windows CMD 실행 경로 오류(`fatal: not a git repository`) 예방 가이드 및 원클릭 배치 실행 체계 완비:
     - 사용자가 `C:\Users\user` 등 프로젝트 외부 경로에서 명령어를 실행할 때 발생하는 Git 저장소 미인식 문제를 예방하기 위해, 프로젝트 폴더 내 `deploy_gh_pages.bat` 및 `github_setup.bat` 더블 클릭 실행 시 자동 경로 인식 및 원터치 푸시 지원.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md`, `docs/SECURITY_REPORT.md`, `docs/DLL_SPECIFICATION.md`, `docs/TEST_PLAN.md` 전역 버전을 `v2.11.10`으로 통일 완료.

### [2026-10-02] 마일스톤 21: v2.11.9 - 사용자 실제 GitHub 프로필 ahbiyout-all 검증 반영 및 Windows Credential Manager 캐시 불일치 복구 엔진 고도화
- **분류:** PATCH
- **작업 내용:**
  1. 사용자 실제 브라우저 GitHub 프로필 스크린샷 검증 및 공식 리포지토리 확정:
     - 실제 브라우저 URL `https://github.com/ahbiyout-all` 및 리포지토리 `ahbiyout-all/photoshop-language-switcher` 재확인.
     - 전역 공식 원격 저장소 및 프로필 URL을 `https://github.com/ahbiyout-all/photoshop-language-switcher.git`로 일괄 복원.
  2. 403 오류의 진짜 원인과 1클릭 자격 증명 스위칭 엔진 (`permission_403_resolver`):
     - `Permission to ahbiyout-all/... denied to AhBiYout. (403)` 오류는 윈도우 PC의 자격 증명 관리자에 과거 계정 `AhBiYout`이 캐시되어 발생했음을 규명.
     - 복구 마법사 1번 메뉴에서 `cmdkey /delete:git:https://github.com`를 실행하여 캐시된 `AhBiYout` 자격 증명을 삭제하고 브라우저 인증 창을 통해 `ahbiyout-all`로 원클릭 승인 푸시하도록 지원.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `scripts/installer.iss`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md` 전역 버전을 `v2.11.9`로 통일 완료.

### [2026-10-02] 마일스톤 20: v2.11.8 - GitHub 계정 ID 'ahbiyout' 및 프로필 표시 이름 'ahbiyout-all' URL 분리 정합성 교정
- **분류:** PATCH
- **작업 내용:**
  1. GitHub 계정 사용자명(`ahbiyout`)과 프로필 표시 이름(`ahbiyout-all`) 분리 반영:
     - 사용자의 실제 GitHub 계정(아이디 / 사용자명)은 `ahbiyout`이고, 계정 내 프로필 표시 이름(Display Name)이 `ahbiyout-all`임에 따라 전역 원격 저장소 및 프로필 URL을 완벽하게 교정.
     - 원격 저장소 URL: `https://github.com/ahbiyout/photoshop-language-switcher.git`
     - 프로필 URL: `https://github.com/ahbiyout`
     - UI 표시 명칭: `ahbiyout-all` (또는 `AhBiYout`)
     - 이전 `ahbiyout-all`로 잘못 지정되어 발생하던 HTTP 403 (Permission denied to AhBiYout) 권한 오류 원천 차단.
  2. 배포 및 셋업 스크립트 기본 원격 프리셋 교정 (`deploy_gh_pages.bat`, `github_setup.bat`):
     - `deploy_gh_pages.bat` 및 `github_setup.bat`의 기본 리포지토리 연결 주소를 `https://github.com/ahbiyout/photoshop-language-switcher.git`로 일괄 정정.
  3. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat`, `scripts/installer.iss`, `docs/LICENSE_KR.md`, `docs/LICENSE_EN.md` 전역 버전을 `v2.11.8`로 통일 완료.

### [2026-10-02] 마일스톤 19: v2.11.7 - GitHub HTTP 403 권한 거부 자동 진단 및 복구 도구, Windows 자격 증명 캐시 초기화, 미병합 충돌 자동 정리 파이프라인 신설
- **분류:** PATCH
- **작업 내용:**
  1. GitHub 푸시 403 권한 거부 (`Permission to ... denied to ...`) 자가 진단 및 7단계 복구 엔진 (`deploy_gh_pages.bat`, `github_setup.bat`):
     - 로컬 윈도우 Git 인증 계정(예: `AhBiYout`)과 원격 저장소 소유자(예: `ahbiyout-all`)가 불일치하거나, 리포지토리 쓰기 권한이 없어 `git push`가 HTTP 403으로 거절될 때 단순 에러 종료 대신 대화형 복구 마법사(`permission_403_resolver`) 즉시 작동.
     - 사용자 개인 계정 URL 자동 전환, Personal Access Token (PAT) 토큰 인증, Windows 자격 증명 관리자 캐시 삭제(`cmdkey /delete:git:https://github.com`), 협업자 권한 설정 브라우저 열기 등 7가지 복구 경로 제공.
  2. 미병합 파일 충돌 (`Pulling is not possible because you have unmerged files`) 선제적 자동 청소:
     - `git pull`, `git pull --rebase`, `git push` 실행 전 중단된 병합/리베이스 상태를 감지하여 `git merge --abort`, `git rebase --abort`, `git reset --merge`를 선제적으로 일괄 수행하여 충돌 블로킹 원천 차단.
  3. Step 2 원격 저장소 선택 시 본인 계정 우선 감지:
     - PC의 `git config user.name`을 읽어와 본인 계정 리포지토리(`https://github.com/<user.name>/photoshop-language-switcher.git`)를 [1]번 추천 옵션으로 제공.
  4. 전역 빌드 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.7`로 통일 완료.

### [2026-10-02] 마일스톤 18: v2.11.6 - 신규 PC ZIP 다운로드 환경 Git 저장소 자동 초기화 및 원클릭 원격 연결 파이프라인 신설
- **분류:** PATCH
- **작업 내용:**
  1. 새 PC ZIP 압축 해제 환경 Git 자동 감지 및 원클릭 셋업 연동:
     - `deploy_gh_pages.bat` 및 `scripts/deploy_gh_pages.bat` 실행 시 `.git` 부재 상태(`fatal: not a git repository`) 또는 `origin` 미등록을 사전 포착.
     - 사용자에게 4가지 선택지(공식 리포지토리 자동 연결, 사용자 정의 URL 입력, github_setup.bat 호출, 취소)를 직관적으로 제공.
     - 엔터(기본값 1) 입력 시 자동으로 `git init -b main`, `git remote add origin`, 작성자 설정, `git add .` 및 커밋을 일괄 처리하고 곧바로 GitHub Pages 배포 단계로 직결.
  2. 전역 스크립트 및 버전 동기화:
     - `package.json`, `src/version.ts`, `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat`, `build.bat`, `scripts/build.bat` 전역 버전을 `v2.11.6`으로 통일 완료.

### [2026-10-02] 마일스톤 17: v2.11.5 - Windows 배치 파서 괄호 문법 오류('detected은(는) 예상되지 않았습니다') 해결 및 라벨 플랫 구조 리팩토링
- **분류:** PATCH
- **작업 내용:**
  1. Windows CMD 괄호 파싱 충돌 원천 차단:
     - `if (...)` 블록 내 `(winget)` 문자열 출력 시 CMD 인터프리터가 괄호를 조기 종료로 오인해 `detected` 명령 오류를 내던 현상 수정.
     - 중첩 괄호 `if (...)`를 제거하고 라벨 기반 점프(`goto :git_check_done`, `goto :manual_git_install`, `goto :manual_setup_git`) 플랫 아키텍처로 개편.
  2. `deploy_gh_pages.bat`, `scripts/deploy_gh_pages.bat`, `github_setup.bat`, `scripts/github_setup.bat` 전역 동기화.
  3. 시맨틱 버전 2.11.5 판올림 및 전역 스크립트·문서 동기화.

### [2026-10-02] 마일스톤 16: v2.11.4 - 신규 PC 환경 Git/Node 감지, 표준 경로 자동 스캔 및 winget 1클릭 자동 설치 파이프라인 신설
- **분류:** PATCH
- **작업 내용:**
  1. 배포 및 셋업 스크립트 Git 감지 자가 복구 엔진 탑재:
     - `deploy_gh_pages.bat` 및 `github_setup.bat` 실행 시 `where git` 부재 시 Windows 표준 설치 경로(`Program Files`, `AppData/Local/Programs` 등) 자동 탐색 및 세션 PATH 주입.
  2. Windows Package Manager (`winget`) 기반 1클릭 Git 자동 설치 대화형 흐름 구축:
     - Git이 완전히 부재한 새 PC에서 엔터 한 번으로 `winget install --id Git.Git -e --source winget` 자동 실행.
     - winget 미지원 시 공식 브라우저 다운로드 링크 원클릭 연결.
  3. GitHub Actions CI/CD 배포 시 로컬 Node.js 의존성 분리 (디커플링):
     - Method 1 배포는 클라우드 빌드이므로 로컬 Node.js 없이도 Git만으로 배포 성공하도록 최적화.
  4. 시맨틱 버전 2.11.4 판올림 및 전역 배치 스크립트·문서 동기화.

### [2026-10-01] 마일스톤 15: v2.11.3 - 푸터 중복 개발자 메타데이터 전면 제거 및 GitHub Pages 배포 자동화 충돌 복구/리베이스 파이프라인 신설
- **분류:** PATCH
- **작업 내용:**
  1. 하단 푸터(Footer) 중복 내용 전면 제거:
     - 상단 헤더 및 작업표시줄에 이미 상시 노출되어 있는 `개발자: AhBiYout (CIS - cisnet.co.kr)` 정보가 하단 푸터 2열에 중복 표기되던 영역을 완전히 삭제.
     - 좌측(소프트웨어 정보 및 무손실 안전 뱃지)과 우측(공식 채널/블로그/GitHub 링크) 2열 구성으로 군더더기 없는 미니멀 레이아웃 완성.
  2. GitHub Pages 원클릭 배포 자동화 스크립트 충돌 자동 복구 파이프라인 구현:
     - `deploy_gh_pages.bat` 및 `scripts/deploy_gh_pages.bat`의 GitHub Actions 푸시 실패(`[rejected] main -> main (fetch first)`) 시 지능형 복구 메뉴 제공.
     - [1] Auto-Rebase & Push (`git pull --rebase origin main`), [2] Force Push (`git push -f origin main --tags`), [3] Auto-Merge & Push 지원.
     - `github_setup.bat` 및 `scripts/github_setup.bat`에 원격 커밋 충돌 시 리베이스 우선 옵션 탑재.
  3. 시맨틱 버전 2.11.3 판올림 및 전역 배치 스크립트·문서 동기화.

### [2026-10-01] 마일스톤 14: v2.11.2 - 푸터 레이아웃 최적화 및 중복 표기 정리
- **분류:** PATCH
- **작업 내용:**
  1. 하단 푸터 2열 헤더의 중복 텍스트(`개발자: AhBiYout (CIS - cisnet.co.kr)`)를 직관적인 섹션 제목인 `개발자 및 소속 정보`로 변경.
  2. 최하단 저작권 줄에서 중복되던 `CIS (cisnet.co.kr)` 항목을 정리하여 깔끔하고 모던한 푸터 UI 완성.
  3. 시맨틱 버전 2.11.2 판올림 및 전사적 스크립트 동기화.

### [2026-10-01] 마일스톤 13: v2.11.1 - AI Studio 미리보기 iframe 브라우저 보안 규정 대응 및 1클릭 폴백 시스템 구축
- **분류:** PATCH
- **작업 내용:**
  1. W3C Chromium Cross-Origin iframe 내 `showDirectoryPicker` 보안 차단 이슈 해결:
     - `isRunningInIframe()` 유틸리티 함수 구현 및 사전 감지 로직 탑재.
     - `openPhotoshopDirectory` 및 `openAndScanAllPhotoshopVersions`에서 `CROSS_ORIGIN_IFRAME_RESTRICTED` 정밀 예외 처리.
  2. 간편 모드(Easy Mode) UI 지능형 대응:
     - 미리보기 iframe 환경 감지 시 `방법 B (원클릭 .exe 실행 파일)`를 기본 실행 방식으로 자동 지정.
     - `방법 A (웹 직접 변경)` 탭에 사전 안내 배너 및 `새 창(단독 탭)에서 열기`, `원클릭 .exe 다운로드`, `배치 파일(.bat) 다운로드` 바로가기 버튼 제공.
     - 폴더 선택 실패 시 raw 영문 에러 대신 친절한 한국어 해결 가이드 표시.
  3. 상단 윈도우 바(`DesktopWindowBar.tsx`)에 iframe 감지 시 `단독 새 탭 열기` 버튼 상시 노출.
  4. 시맨틱 버전 2.11.1 판올림 및 자동화 스크립트 전량 동기화.

### [2026-10-01] 마일스톤 12: v2.11.0 - 간편 모드 다국어 퀵 셀렉트 칩 버튼 신설 및 글로벌 언어 제어 체계 완성
- **분류:** MINOR
- **작업 내용:**
  1. 간편 모드(Easy Mode) 퀵 셀렉트 칩(Quick-Select Chips) 버튼 시스템 (`src/components/EasyModeView.tsx`) 제작:
     - 한국어, 영어를 비롯하여 일본어, 중국어(간체/번체), 독일어, 프랑스어, 스페인어, 이탈리아어, 러시아어, 포르투갈어, 폴란드어, 튀르키예어 등 글로벌 인기 언어 1클릭 칩 바 구현.
     - 24개국 전 세계 언어 아코디언 드로어 및 실시간 검색 필터(`Search`) 신설.
  2. 다국어 맞춤형 동적 UI 액션 카드 및 백엔드 스크립트 연동:
     - 선택 언어에 따라 2단계 액션 카드(스마트 토글 / 영문 변경 / 복구) 및 3대 실행기(웹 직접 제어 / .exe / .bat)가 대상 국가 언어팩으로 100% 자동 동기화.
  3. 일러스트레이터 파일 시스템 접근 엔진 다국어 확장 (`toggleIllustratorXmlLanguage`에 `targetLocale` 파라미터 적용).
  4. 시맨틱 버전 2.11.0 판올림 및 전사적 문서·배치 파일 동기화.

### [2026-10-01] 마일스톤 11: v2.10.0 - 일반 사용자 전용 3단계 간편 모드 신설 및 듀얼 뷰 모드 스위처 구축
- **분류:** MINOR
- **작업 내용:**
  1. 일반 사용자 전용 3단계 직관적 뷰 컴포넌트(`src/components/EasyModeView.tsx`) 제작.
     - 1단계: 대형 카드 기반 포토샵/일러스트레이터 및 연도별 버전 선택.
     - 2단계: 스마트 자동 토글 / 영문 변경 / 한국어 복구 3대 직관적 언어 선택.
     - 3단계: 브라우저 무설치 직접 변경 / 원클릭 .exe 생성기 / 배치 파일 3대 실행 옵션 완비.
     - 초보자 3문 3답 FAQ 아코디언 및 피드백 알림 시스템 탑재.
  2. 듀얼 뷰 모드 스위처(Dual-View Mode Switcher) 아키텍처(`src/App.tsx`) 구축:
     - `💡 간편 모드(기본)` ⇄ `⚙️ 전문가 & 관리자 모드` 원클릭 즉각 전환.
     - `?mode=easy` / `?mode=pro` URL 쿼리 파라미터 및 `localStorage` 영속화.
     - 기존 전산실 원격 배포, 스탠드얼론 빌더, 다국어 매트릭스 100% 보존.
  3. 버전 2.10.0 판올림 및 자동화 스크립트 전량 동기화.

### [2026-10-01] 마일스톤 10: v2.9.1 - github_setup.bat 윈도우 배치 구문 에러 해결 및 Git 작성자 자동 설정 패치
- **분류:** PATCH
- **작업 내용:**
  1. `github_setup.bat` 및 `scripts/github_setup.bat` 괄호 파싱 결함 수리:
     - `if (...) else (...)` 블록 내 중첩 괄호 `(PAT) is configured`로 인해 발생하던 `is은(는) 예상되지 않았습니다.` CMD 문법 충돌 완벽 해결.
     - 안정적인 `:remote_origin_found`, `:remote_origin_setup`, `:success_exit` 레이블 점프(goto) 구조로 전환.
  2. Git Author Identity 자동 감지 및 로컬 폴백 루틴 탑재:
     - `Author identity unknown` 오류로 초기 커밋이 실패하던 문제 방지.
     - `git config user.name`, `user.email` 누락 시 기본 작성자 정보(`AhBiYout` / `ahbiyout@users.noreply.github.com`) 자동 설정.
  3. 커밋 HEAD 유효성 검사(`git rev-parse HEAD`) 후 안전한 태깅(`v2.9.1`) 적용.
  4. 시맨틱 버전 2.9.1 판올림 및 전사적 문서·스크립트 동기화.

### [2026-09-29] 마일스톤 9: v2.9.0 - 보안 패키징 파이프라인(Inno Setup) 및 엔지니어링 표준 문서 체계 완성
- **분류:** MINOR
- **작업 내용:**
  1. Inno Setup 6 기반 보안 인스톨러 스크립트(`scripts/installer.iss`) 신규 제작.
     - 기존 버전 자동 감지 및 사용자 덮어쓰기/업그레이드 확인 로직 탑재.
     - 무인 설치(`/VERYSILENT /SUPPRESSMSGBOXES /NORESTART`) 지원.
     - Windows 방화벽 인바운드 규칙 자동 등록(`RegisterFirewallRules`) 및 제거(`UnregisterFirewallRules`) 구현.
  2. 개발 행동 강령 준수 5대 표준 문서 신규 수립:
     - `docs/SECURITY_REPORT.md`: 정적 보안 감사, XSS, 무결성 PIN 시스템 보고서.
     - `docs/DLL_SPECIFICATION.md`: 순수 창작 PE 래퍼 바이너리 및 모듈 명세서.
     - `docs/LICENSE_KR.md` & `docs/LICENSE_EN.md`: 한국어/영어 분리 라이선스.
     - `docs/TEST_PLAN.md` & `docs/TEST_REPORT.md`: 전 영역 QA 테스트 계획 및 검증 결과서.
     - `docs/WorkLog.md`: 누적 작업 이력 통합 로그.
  3. 저장소 폴더 구조 표준화: `build/.gitkeep` 배치하여 컴파일 결과물 폴더 형상 관리 보장.
  4. GitHub 계정/조직 연동(`ahbiyout-all`) 기술 분석 및 사용자 가이드 성찰 보고서 작성.

### [2026-09-29] 마일스톤 8: v2.8.1 - 공식 GitHub 계정 ahbiyout-all 프리셋 및 원클릭 연동 지원
- **분류:** PATCH
- **작업 내용:**
  1. `github_setup.bat` 및 `scripts/github_setup.bat`에 대상 저장소 기본 URL(`https://github.com/ahbiyout-all/photoshop-language-switcher.git`)을 프리셋으로 내장.
  2. 하단 푸터 및 메타데이터에 `ahbiyout-all` 공식 GitHub 프로필 링크 바인딩.
  3. 버전 동기화 및 산출물 파일명 동기화.

### [2026-09-29] 마일스톤 7: v2.8.0 - 깃허브 업로드 및 GitHub Pages 배포 자동화 파이프라인 구축
- **분류:** MINOR
- **작업 내용:**
  1. Windows CRLF 영문 깃허브 업로드 자동화 스크립트(`github_setup.bat`) 구축.
  2. GitHub Pages 원클릭 배포 스크립트(`deploy_gh_pages.bat`) 구축.
  3. `.github/workflows/deploy.yml` 및 `ci.yml` 액션 구축.
  4. `public/.nojekyll` 및 SPA 라우팅용 `public/404.html` 주입.
  5. `docs/GITHUB_PUBLISHING_GUIDE.md` 전면 개정.

### [2026-09-29] 마일스톤 6: v2.7.4 - 공식 문의 채널 정비 및 블로그/조직 채널 단일화
- **분류:** PATCH
- **작업 내용:**
  1. 직접 이메일 문의 영역 제거, 공식 구글 블로그 및 소속사 CIS 채널로 일원화.
  2. 모든 문서 및 소스코드 메타데이터 갱신.

### [2026-09-28] 마일스톤 5: v2.7.0 ~ v2.7.2 - 웹 UI 24개국 글로벌 다국어 엔진 탑재
- **분류:** MINOR / PATCH
- **작업 내용:**
  1. 웹 애플리케이션 자체 UI 24개국 실시간 다국어 지원 엔진(`src/i18n/`) 탑재.
  2. 상단 글로벌 언어 드롭다운 선택기 및 퀵 칩 구현.
  3. 전 UI 컴포넌트 하드코딩 완전 제거 및 `useI18n()` 100% 바인딩.

### [2026-09-28] 마일스톤 4: v2.6.0 ~ v2.6.1 - 속성(자세히) 공개 배포 위변조 방지 이중 무결성 보안 체계
- **분류:** MINOR / PATCH
- **작업 내용:**
  1. 대처 방안 1: 공식 속성 읽기 전용 보호 잠금 & 관리자 PIN(`1375`) 인증 해제 시스템.
  2. 대처 방안 2: C# 컴파일 레벨 영구 불변 상표 워터마크 주입.
  3. `docs/METADATA_PROTECTION_GUIDE.md` 신설.

### [2026-09-26] 마일스톤 3: v2.5.0 ~ v2.5.2 - 확장 어도비 5종 앱 지원 및 자동 빌드 build.bat 파이프라인
- **분류:** MINOR / PATCH
- **작업 내용:**
  1. Adobe InDesign, After Effects, Premiere Pro, InCopy, Audition 전용 언어 변경기 추가.
  2. Windows CRLF 영문 자동 빌드 스크립트 `build.bat` 구축 및 버전 접미사 자동 결합.
  3. GitHub Pages CI/CD 워크플로우 최초 탑재.

### [2026-09-24] 마일스톤 2: v2.1.0 ~ v2.2.9 - Windows PE 속성 임베딩 및 C# 컴파일러 버그 박멸
- **분류:** MINOR / PATCH
- **작업 내용:**
  1. C# AssemblyInfo를 활용한 Windows PE 메타데이터(VS_VERSION_INFO) 임베딩.
  2. 32-bit ARGB 지구본 아이콘 64자 청크 분할 안전 추출 기법.
  3. 배치 파싱 괄호 충돌 및 CMD 앰퍼샌드 이스케이프 버그 완전 해결.

### [2026-09-20] 마일스톤 1: v1.0.0 ~ v2.0.0 - 웹 기반 포토샵/일러스트레이터 언어 변경기 코어 개발
- **분류:** MAJOR
- **작업 내용:**
  1. File System Access API 기반 브라우저 직접 변경 기능.
  2. 오프라인 배치 및 파워셸 스크립트 생성기 구현.
  3. 컴퓨터실 다중 PC 원격 무인 배포기 구축.

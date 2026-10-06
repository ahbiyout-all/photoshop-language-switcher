# 정밀 QA 테스트 계획서 (QA Master Test Plan)

- **문서 버전:** v1.0.0 (앱 버전 v2.9.0 기준)
- **적용 대상:** 코드 무결성, 빌드 파이프라인, UI/UX 디자인, 보안 규격, 배포 자동화
- **작성 주체:** 수석 엔지니어링 QA 팀

---

## 1. 테스트 목적 및 범위
본 테스트 계획서는 Adobe Photoshop & Illustrator Language Switcher Suite의 5대 핵심 영역(코드, 빌드, UI/UX, 보안, 배포)에 대한 체계적인 검증 기준과 테스트 케이스를 정의하여, 잠재적 결함을 사전에 탐지하고 프로덕션 수준의 안정성을 담보하는 것을 목적으로 합니다.

---

## 2. 영역별 테스트 항목 (Test Matrix)

### 2.1. 코드 무결성 영역 (Code Integrity)
- **TC-CODE-01 (Type Safety):** `tsc --noEmit` 실행 시 0 Error 통과 여부.
- **TC-CODE-02 (Bundle Build):** Vite 빌드 시 번들 크기 경고 및 파싱 에러 부재.
- **TC-CODE-03 (i18n Fallback):** 24개국 언어 전환 시 미등록 키에 대한 영어/한국어 자동 폴백 동작.
- **TC-CODE-04 (Safe Escape):** 스크립트 생성기 내 특수문자(`&`, `^`, `|`) CMD 이스케이프 정상 처리.

### 2.2. 빌드 및 배포 파이프라인 영역 (Build & Deployment)
- **TC-BUILD-01 (Bat Encoding):** `build.bat`, `scripts/build.bat`의 Windows CRLF 인코딩 및 100% 영문 콘솔 확인.
- **TC-BUILD-02 (SemVer Suffix):** 생성되는 산출물 파일명 끝에 `package.json`의 현재 버전 태그 자동 결합 검증.
- **TC-BUILD-03 (Inno Setup):** `scripts/installer.iss` 컴파일 시 이전 버전 감지, 무인 설치 스위치, 방화벽 규칙 스크립트 유효성.
- **TC-BUILD-04 (CI/CD Action):** GitHub Actions 워크플로(`.github/workflows/deploy.yml`, `ci.yml`) 구문 유효성.

### 2.3. UI/UX 디자인 및 접근성 영역 (UI/UX Standards)
- **TC-UI-01 (One Screen Layout):** 단일 화면 레이아웃 유지 및 불필요한 중복 메뉴 배제.
- **TC-UI-02 (Theme Contrast):** 라이트/다크/그레이/베이지 테마 적용 시 텍스트 및 카드 간 명도 대비(WCAG AA 기준).
- **TC-UI-03 (Tooltip & Microcopy):** 복잡한 기술 용어에 대한 명확한 툴팁 및 가이드 제공.
- **TC-UI-04 (Responsive Design):** 모바일, 태블릿, 와이드스크린 반응형 렌더링 무결성.

### 2.4. 보안 및 무결성 영역 (Security & Integrity)
- **TC-SEC-01 (Metadata Lock):** 공개 웹에서 속성(자세히) 창 진입 시 기본 `readOnly` 잠금 여부.
- **TC-SEC-02 (PIN Authentication):** 개발자 잠금 해제 PIN `1375` 입력 시 커스텀 편집 모드 전환 확인.
- **TC-SEC-03 (No Telemetry):** 외부 서드파티 스파이웨어, 분석 스크립트, 무단 통신 전무 확인.
- **TC-SEC-04 (Secrets Exclusion):** `.gitignore`가 민감 파일(`.env`, 빌드 산출물, 캐시)을 완전 차단하는지 확인.

### 2.5. 원격 저장소 및 GitHub 연동 영역 (GitHub Integration)
- **TC-GIT-01 (Preset Origin):** `github_setup.bat` 실행 시 기본 URL(`https://github.com/ahbiyout/photoshop-language-switcher.git`) 제시 확인.
- **TC-GIT-02 (Tag Generation):** 릴리스 태그(`v2.9.0`) 생성 및 충돌 방지 검증.

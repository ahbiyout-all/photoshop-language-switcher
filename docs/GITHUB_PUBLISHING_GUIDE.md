# 깃허브(GitHub) 공개 및 배포 시 고려사항 가이드

본 문서는 **포토샵 & 일러스트레이터 언어 변경기** 프로젝트를 GitHub에 퍼블릭(공개) 저장소로 배포하고, 전 세계 사용자 및 기여자와 협업할 때 사전에 반드시 검토해야 할 기술적, 법적, 운영적 고려사항을 정리한 체크리스트입니다.

---

## 1. ⚖️ 법적 고지 및 상표권/면책 조항 (Legal & Trademark Disclaimers)

오픈소스로 Adobe 관련 툴을 공개할 때 **가장 중요한 영역**입니다.

### ① 상표권(Trademark) 고지
- **"Adobe", "Photoshop", "Illustrator"**는 Adobe Inc.의 등록 상표입니다.
- 리포지토리의 `README.md` 및 프로그램 UI에 본 프로젝트가 Adobe의 공식 제품이 아니며, 공식적인 제휴/후원/승인 관계가 없음을 명확히 표기해야 합니다.
```markdown
> **면책 조항 (Disclaimer):**
> 본 프로젝트는 Adobe Inc.와 관련이 없는 독립적인 오픈소스 유틸리티입니다.
> 'Adobe', 'Photoshop', 'Illustrator'는 미국 및 기타 국가에서 등록된 Adobe Inc.의 상표입니다.
```

### ② 어도비 EULA(최종사용자 라이선스 계약) 및 저작권 파일 비포함 원칙
- **Adobe 저작권 보호 파일(`tw10428.dat`, DLL, 설치 바이너리 등)을 GitHub 저장소에 절대 직접 커밋하거나 배포용 압축 파일로 호스팅하지 마십시오.**
- 본 도구는 사용자가 합법적으로 구매하여 로컬 PC에 이미 설치된 프로그램 파일의 확장자(`tw10428.dat` ↔ `tw10428.dat.bak`)를 토글하거나, 로컬의 설정 파일(`application.xml`)만 수정하는 **순수 로직/스크립트 생성기**입니다.
- 이 원칙을 `README.md`에 명시하면 Adobe의 DMCA 저작권 침해 요청(Takedown) 위험을 원천 차단할 수 있습니다.

### ③ 사용자 데이터 및 파일 손상에 대한 면책 (Warranty Disclaimer)
- 시스템 폴더(`C:\Program Files\Adobe\...`) 내 파일을 조작하므로, 프로그램 오작동, 백업 누락, 파일 손상 등에 대한 법적 책임을 지지 않는다는 "AS-IS(있는 그대로 제공)" 조항을 라이선스와 리드미에 명시합니다.

---

## 2. 📂 깃허브에 올리는 파일 vs 올리지 않는 파일 (File Inclusion Map)

깃허브에는 **"소스 코드와 프로젝트 빌드 설정"**만 올리며, **"외부 라이브러리(node_modules), 빌드 결과물(dist), 민감한 정보(.env)"**는 절대 올리지 않습니다.

### ✅ 깃허브에 꼭 올려야 하는 파일 (Tracked by Git)
| 파일/폴더 | 설명 및 용도 |
| :--- | :--- |
| `src/` | 리액트 컴포넌트, 유틸리티 함수, 훅, 타입 정의 등 핵심 소스 코드 전량 |
| `public/` | 웹 파비콘(favicon), 매니페스트, 정적 아이콘 등 브라우저 정적 에셋 |
| `docs/` | 사용자 가이드, 아키텍처 명세, 패치노트, 릴리스 가이드 등 모든 기술 문서 |
| `package.json` | 프로젝트 메타데이터, 사용 라이브러리 목록 및 버전, 빌드 스크립트 정의 |
| `bun.lock` / `package-lock.json` | 의존성 패키지들의 정확한 버전 고정 락 파일 |
| `index.html` | SPA 웹 애플리케이션의 HTML 엔트리포인트 파일 |
| `vite.config.ts` | Vite 번들러 빌드 및 개발 서버 설정 파일 |
| `tsconfig.json` | TypeScript 컴파일러 옵션 설정 파일 |
| `README.md` | 저장소 대문 페이지 (소개, 빠른 시작, 법적 고지, 라이선스 배지) |
| `LICENSE` | 오픈소스 라이선스 전문 (MIT License) |
| `.gitignore` | Git이 무시해야 할 파일/폴더 목록 정의 파일 |
| `.env.example` | 실제 비밀 키가 없는 환경변수 템플릿 예시 파일 |

### ❌ 깃허브에 절대 올리면 안 되는 파일 (Git Ignored)
| 제외 대상 | 제외해야 하는 이유 |
| :--- | :--- |
| `node_modules/` | 수만 개의 외부 라이브러리 파일로 용량이 수백 MB에 달함. `npm install` 명령어로 언제든 재생성 가능. |
| `dist/` 또는 `build/` | `npm run build` 시 자동 생성되는 컴파일 산출물. 호스팅 서버나 CI/CD가 알아서 빌드함. |
| `.env`, `.env.local` | 실제 Gemini API Key나 비공개 시크릿 토큰이 담겨 있으므로 보안상 절대 커밋 금지. |
| `*.log` | `npm-debug.log` 등 로컬 개발 중 발생하는 디버그 로그 파일. |
| `.DS_Store`, `Thumbs.db` | macOS나 Windows 운영체제가 폴더 뷰를 위해 생성하는 로컬 캐시 파일. |

> 💡 **안심하세요!**
> 프로젝트 루트의 `.gitignore` 파일에 위 제외 항목들이 이미 등록되어 있으므로, 일반적인 `git add .` 명령을 실행하더라도 Git이 알아서 불필요한 파일은 건너뛰고 필요한 소스 파일만 선택하여 안전하게 업로드합니다.

---

## 3. 🔐 보안 점검 및 민감 정보 제거 (Security & Secrets)

### ① API 키 및 시크릿(Secret) 유출 차단
- `.env`, `.env.local` 등 민감한 인증 정보나 API Key가 커밋되지 않도록 `.gitignore`를 점검합니다.
- Gemini API 또는 프록시 서버 연동 시 클라이언트 번들에 하드코딩된 API Key가 노출되지 않도록 주의합니다.

### ② 불필요한 OS 메타파일 제외
- `.DS_Store`, `Thumbs.db`, 로컬 로그 파일(`*.log`) 등이 `.gitignore`에 등록되어 있는지 확인합니다.

---

## 4. 📄 오픈소스 라이선스 선정 (License)

다른 사람들이 코드를 자유롭게 사용, 수정, 배포할 수 있도록 루트 경로에 `LICENSE` 파일을 포함해야 합니다.

- **MIT License (권장)**: 매우 간결하며, 누구나 자유롭게 사용/수정/재배포할 수 있고, 개발자의 법적 책임을 면제합니다.
- **Apache-2.0**: 특허권 관련 조항과 기여자의 권리/의무가 더 정밀하게 규정된 기업 친화적 라이선스.
- **GPL-3.0**: 2차 수정본도 반드시 오픈소스로 공개하도록 강제하는 카피레프트(Copyleft) 라이선스.

---

## 5. 🛡️ 스크립트 실행 보안 및 사용자 환경 대응 (Script Security & UX)

사용자가 브라우저에서 다운로드한 `.bat`, `.ps1` 스크립트를 로컬에서 실행할 때 발생할 수 있는 보안 차단 요소를 미리 안내해야 불필요한 오류 제보(Issue)를 줄일 수 있습니다.

### ① Windows SmartScreen "PC 보호" 경고
- 웹에서 다운로드된 스크립트는 Windows의 'Zone.Identifier(Mark-of-the-Web)' 플래그가 붙어 SmartScreen 팝업이 발생합니다.
- **해결 안내**: `추가 정보` 클릭 → `실행` 버튼 클릭 안내를 README에 스크린샷과 함께 기재합니다.

### ② PowerShell ExecutionPolicy (실행 정책) 제한
- 기본 Windows 환경에서는 서명되지 않은 `.ps1` 스크립트 실행이 차단(`Restricted`)되어 있습니다.
- 원클릭 배포 시 `-ExecutionPolicy Bypass` 옵션이 포함된 배치 래퍼(`.bat`)를 함께 제공하거나, `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser` 명령어를 안내합니다.

### ③ 관리자 권한(UAC) 필수 안내
- `C:\Program Files` 폴더는 일반 사용자 계정의 쓰기 권한이 제한되어 있습니다.
- 스크립트에 관리자 권한 자동 승격(Self-Elevation) 루틴이 내장되어 있더라도, "우클릭 → 관리자 권한으로 실행"을 공식 가이드로 강조합니다.

---

## 6. 🌐 브라우저 호환성 및 웹 보안 규격 (Browser Context)

- **Chromium 브라우저 전용 기능 고지**:
  - 브라우저 원클릭 직접 제어 기능(`showDirectoryPicker`)은 **Chrome, Edge, Whale, Brave** 등 Chromium 엔진 계열에서만 동작합니다.
  - Firefox, Safari(macOS/iOS)는 보안 정책상 File System Access API를 지원하지 않으므로, 이들 브라우저에서는 '배치 파일/스크립트 다운로드' 모드를 사용하도록 유도합니다.
- **HTTPS 보안 컨텍스트 필수**:
  - File System Access API는 `https://` 또는 `http://localhost` 환경에서만 동작합니다. HTTP 환경에서는 브라우저 보안 정책상 기능이 비활성화됩니다.

---

## 7. 🛡️ 공개 배포 시 메타데이터 위변조 방지 (Metadata Anti-Tamper & Security Lock)

GitHub Pages 등 공개 웹 호스팅 시 일반 사용자가 `.EXE 속성(자세히)` 창에서 회사명(`cisnet.co.kr`), 저작권, 설명 등을 임의로 수정하여 사칭하거나 변조된 컴파일러를 배포하는 행위를 방지하기 위해 2단계 방어 체계가 적용되어 있습니다:

1. **대처 방안 1: 공식 속성 읽기 전용 보호 잠금 (Official Read-Only Lock)**
   - 일반 방문자에게는 모든 메타데이터 입력 필드가 읽기 전용으로 잠겨 공식 속성만 유지됩니다.
   - 개발자 본인은 관리자 PIN(`1375`) 입력 또는 `?admin=true` URL 파라미터를 통해 잠금을 해제하고 편집할 수 있습니다.
2. **대처 방안 2: 불변 공식 디지털 서명 및 변조 방지 워터마크 영구 주입**
   - C# Assembly 속성(`AssemblyTrademark`, `AssemblyConfiguration`) 및 런타임 콘솔 창 상단에 `Official Core Engine: cisnet.co.kr | Author: AhBiYout`이 하드코딩 영구 각인되어 소프트웨어 도용을 원천 무력화합니다.
- 상세 구현 및 설정 방법은 [`docs/METADATA_PROTECTION_GUIDE.md`](./METADATA_PROTECTION_GUIDE.md)를 참조하세요.

---

## 8. 🚀 깃허브 업로드 및 GitHub Pages 배포 자동화 파이프라인 (Automated Pipelines)

본 프로젝트는 Windows 배치 스크립트(`.bat`)와 GitHub Actions 워크플로를 통해 **저장소 초기화, 파일 업로드, 버전 태깅, GitHub Pages 배포** 전 과정을 원클릭으로 자동화하여 제공합니다.

### ① 깃허브 업로드 원클릭 준비 (`github_setup.bat`)
Windows 환경에서 실행 시 Git 환경 점검부터 첫 커밋 및 원격 저장소 연결까지 순차적으로 자동 처리합니다:
```cmd
# 프로젝트 루트 또는 scripts 디렉터리에서 실행
github_setup.bat
```
- **주요 자동화 동작**:
  1. Git 설치 여부 확인 (`where git`).
  2. Git 저장소 미존재 시 `main` 브랜치 기본값으로 자동 초기화 (`git init -b main`).
  3. `.gitignore` 유효성 검사 및 누락 시 자동 생성.
  4. 소스 코드, 문서, 에셋 전량 스테이징 (`git add .`).
  5. 패치노트에 맞는 버전 태그 자동 생성 (`git tag -a v2.8.0 -m "Release v2.8.0"`).
  6. 사용자의 GitHub 저장소 URL(`origin`) 자동 연결 및 푸시 지원.

---

### ② GitHub Pages 자동 배포 스크립트 (`deploy_gh_pages.bat`)
GitHub Pages 웹 호스팅에 필요한 배포 과정을 2가지 전략 중 선택하여 자동 실행합니다:
```cmd
# 프로젝트 루트 또는 scripts 디렉터리에서 실행
deploy_gh_pages.bat
```

#### 🔹 [전략 1] GitHub Actions CI/CD 자동 배포 (가장 권장)
- 변경 사항을 `main` 브랜치로 푸시하면, `.github/workflows/deploy.yml`이 GitHub 클라우드 러너에서 자동으로 의존성을 설치하고 Vite 프로덕션 빌드를 수행한 뒤 GitHub Pages로 무중단 배포합니다.
- **GitHub 저장소 설정 방법 (최초 1회)**:
  1. GitHub 리포지토리 페이지 접속 → 상단 **[Settings]** 클릭.
  2. 좌측 메뉴에서 **[Pages]** 선택.
  3. **Build and deployment > Source** 드롭다운에서 **[GitHub Actions]** 선택 후 저장.
  4. 이후 `git push`가 발생할 때마다 몇 초 만에 자동으로 새 버전이 웹에 반영됩니다.

#### 🔹 [전략 2] 로컬 빌드 후 `gh-pages` 브랜치 직접 배포
- 로컬 컴퓨터에서 `npm run build`를 실행하여 컴파일을 완료한 뒤, `public/.nojekyll`과 SPA 라우팅용 `public/404.html`을 `dist/`에 주입하고 원격 저장소의 `gh-pages` 브랜치로 즉시 강제 푸시합니다.
- **GitHub 저장소 설정 방법 (최초 1회)**:
  1. GitHub 리포지토리 페이지 접속 → **[Settings]** → **[Pages]**.
  2. **Build and deployment > Source**에서 **[Deploy from a branch]** 선택.
  3. **Branch** 드롭다운에서 `gh-pages` 브랜치 및 `/ (root)` 폴더를 선택하고 **[Save]** 클릭.

---

### ③ 깃허브 배포 URL 규칙
배포 완료 시 전 세계 사용자가 브라우저에서 즉시 접속할 수 있는 공개 URL:
```text
https://<깃허브_사용자명>.github.io/<리포지토리_이름>/
```
> 💡 `vite.config.ts`에 `base: './'` 설정이 적용되어 있고 `public/404.html` 및 `public/.nojekyll`이 포함되어 있으므로, 사용자 계정 루트 페이지뿐만 아니라 서브 경로 저장소에서도 CSS, JS, 파비콘 등 정적 에셋이 깨짐 없이 완벽하게 로드됩니다.

---

### ④ 깃허브 릴리즈(Releases)에 네이티브 실행 파일(`.exe`) 업로드하기
웹 SPA 배포와 별개로, Windows 사용자용 단독 실행 파일(`.exe`)을 배포할 때는 GitHub Releases 기능을 활용합니다:
1. `build.bat`을 실행하여 `build/` 디렉터리에 생성된 파일 확인:
   - `build\Photoshop_Language_Switcher_v2.8.0.exe`
   - `build\Adobe_Language_Switcher_Suite_v2.8.0.exe`
   - `build\Photoshop_Language_Switcher_v2.8.0.bat`
2. GitHub 리포지토리 우측 **[Releases]** → **[Draft a new release]** 클릭.
3. 태그 선택: `v2.8.0` (자동 생성된 태그 선택).
4. Release title: `Adobe Language Switcher Suite v2.8.0`.
5. `docs/PATCH_NOTES.md`의 최신 패치노트 본문을 복사하여 설명란에 붙여넣기.
6. **Attach binaries by dropping them here** 영역에 `build\` 폴더의 `.exe` 및 `.bat` 파일들을 드래그 앤 드롭으로 업로드.
7. **[Publish release]**를 클릭하면 사용자들이 단독 실행 파일을 무료로 안전하게 다운로드할 수 있습니다.

---

## 9. 🤝 커뮤니티 관리 및 협업 준비 (Community & Governance)

공개 저장소로서 다른 개발자와 사용자들의 기여를 원활히 받기 위한 장치들입니다:

- **README.md (표준 대문 페이지)**:
  - 프로젝트 소개, 데모 URL, 지원 앱 버전(2020~2026), 스크린샷, 설치/실행 가이드.
- **이슈(Issue) & PR 템플릿**:
  - `.github/ISSUE_TEMPLATE/`에 버그 리포트, 신규 버전 지원 요청 템플릿 추가.
- **기여 가이드 (CONTRIBUTING.md)**:
  - 언어 팩 추가 방법, 테스트 절차, PR 제출 규칙 명시.
- **패치노트 (`docs/PATCH_NOTES.md`)**:
  - Semantic Versioning(vX.Y.Z)에 맞춘 투명한 릴리스 히스토리 공개.

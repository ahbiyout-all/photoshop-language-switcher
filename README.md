# 🎨 포토샵 & 일러스트레이터 언어 변경기 (Adobe Language Switcher)

> 웹 브라우저에서 바로 또는 다운로드 가능한 안전한 스크립트로 포토샵 및 일러스트레이터의 UI 언어(한국어 ↔ 영어)를 원클릭으로 전환하는 오픈소스 유틸리티입니다.

[![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Live%20Demo-success?style=for-the-badge&logo=github)](https://ahbiyout-all.github.io/photoshop-language-switcher/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)
[![React](https://img.shields.io/badge/React-19-61dafb.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.x-646cff.svg)](https://vitejs.dev/)

---

### 🌐 공식 배포 웹사이트 (GitHub Pages Live Service)
> **설치 없이 웹 브라우저에서 바로 사용하기:**  
> 👉 **[https://ahbiyout-all.github.io/photoshop-language-switcher/](https://ahbiyout-all.github.io/photoshop-language-switcher/)**

---

## ✨ 주요 기능 (Key Features)

1. **포토샵 (Photoshop 2020~2026+) 언어 전환**
   - 로컬에 설치된 `tw10428.dat` 파일 이름을 토글(`tw10428.dat` ↔ `tw10428.dat.bak`)하여 한국어/영어를 즉시 변경합니다.
2. **일러스트레이터 (Illustrator 2020~2026+) 언어 전환**
   - `AMT/application.xml` 내 `InstalledLanguages` 노드 값을 `ko_KR` ↔ `en_US`로 안전하게 치환합니다.
3. **브라우저 직접 제어 (Web File System Access API)**
   - Chromium 기반 브라우저(Chrome, Edge, Whale)에서 어도비 설치 폴더를 직접 선택하여 추가 다운로드 없이 웹에서 즉시 변경.
4. **오프라인 배치(.bat) / PowerShell(.ps1) 스크립트 생성**
   - 브라우저 권한 제한 환경 또는 사내/연구실/원격 다중 PC 배포를 위한 독립 실행형 자동화 스크립트 원클릭 다운로드.
5. **다중 설치 버전 자동 감지 및 백업/복원 안전장치**
   - 원본 설정 자동 백업(`*.bak`, `*.original.bak`) 생성 및 비정상 상태 원클릭 복구 기능 제공.

---

## ⚖️ 법적 고지 및 면책 조항 (Legal Disclaimer)

> **중요 (Notice):**
> 1. 본 프로젝트는 **Adobe Inc.와 제휴, 후원 또는 공식 승인된 프로그램이 아닌 독립적인 오픈소스 프로젝트**입니다.
> 2. `Adobe`, `Photoshop`, `Illustrator`는 미국 및 기타 국가에서 등록된 Adobe Inc.의 등록상표입니다.
> 3. 본 도구는 **Adobe의 저작권 보호 파일(바이너리, DLL, 원본 dat 파일 등)을 일절 포함하거나 배포하지 않으며**, 사용자가 정당하게 라이선스를 취득하여 로컬에 설치한 파일의 설정 및 확장자만 토글합니다.
> 4. 본 소프트웨어는 MIT 라이선스에 따라 **"있는 그대로(AS-IS)"** 제공되며, 사용 중 발생할 수 있는 시스템 오작동이나 데이터 손실에 대해 개발자는 법적 책임을 지지 않습니다.

---

## 🚀 빠른 시작 (Getting Started)

### 1. 개발 환경 실행 (Local Development)
```bash
# 의존성 설치
npm install

# 로컬 개발 서버 실행 (포트 3000)
npm run dev

# 프로덕션 빌드
npm run build
```

### 2. Windows 자동 빌드 파이프라인 (Automated Build .BAT)
- Windows 환경에서 원클릭으로 웹 SPA 프론트엔드 컴파일 및 버전 번호 접미사가 붙은 네이티브 Windows 실행 파일(`.exe`)을 자동 생성합니다:
```cmd
# 프로젝트 루트에서 실행
build.bat

# 또는 scripts 폴더에서 실행
cd scripts && build.bat
```
- **결과물 생성 경로**: `build\` 및 `release\`
- **생성 파일**:
  - `build\Photoshop_Language_Switcher_v2.8.0.exe` (PE 세부정보 및 UAC 관리자 권한 내장)
  - `build\Adobe_Language_Switcher_Suite_v2.8.0.exe` (마스터 스위트 실행기)
  - `build\Photoshop_Language_Switcher_v2.8.0.bat` (스탠드얼론 배치 런처)
  - `dist\` (웹 SPA 정적 프로덕션 번들)

### 3. 깃허브 업로드 & GitHub Pages 배포 자동화 (GitHub Automation)
- **저장소 초기화 & 깃허브 업로드 준비**:
  ```cmd
  # Git 저장소 초기화, 소스 코드 스테이징, 커밋 및 버전 태그(v2.8.0) 자동화
  github_setup.bat
  ```
- **GitHub Pages 원클릭 배포**:
  ```cmd
  # GitHub Actions CI/CD 또는 로컬 빌드 후 gh-pages 브랜치 배포 자동화
  deploy_gh_pages.bat
  ```
- **배포 후 공식 사이트 접속**: [https://ahbiyout-all.github.io/photoshop-language-switcher/](https://ahbiyout-all.github.io/photoshop-language-switcher/)

### 4. 정적 웹 배포 (GitHub Pages / Vercel / Netlify)
- 본 애플리케이션은 순수 SPA(Single Page Application) 정적 빌드로, GitHub Pages, Vercel, Cloudflare Pages 등 정적 호스팅 서비스에 즉시 무료 배포가 가능합니다.
- `public/.nojekyll` 및 SPA 라우팅용 `public/404.html`이 기본 탑재되어 있어 서브 디렉터리 경로에서도 100% 정상 작동합니다.

---

## 👤 제작자 및 공식 채널 안내 (Developer & Official Channels)

- **개발자 (Developer):** AhBiYout
- **공식 구글 블로그 (Official Blog):** [https://ahbiyoutvibe.blogspot.com/](https://ahbiyoutvibe.blogspot.com/)
- **소속 (Organization):** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS)
- **저작권 (Copyright):** Copyright © 2026 AhBiYout. All rights reserved.

---

## 🛡️ 스크립트 실행 시 사용자 주의사항

배치 스크립트(`.bat`)나 PowerShell(`.ps1`)을 다운로드하여 실행할 때 다음 사항을 확인해야 합니다:

1. **관리자 권한 필수**: `C:\Program Files\Adobe` 폴더는 시스템 폴더이므로 반드시 **마우스 우클릭 → [관리자 권한으로 실행]**해야 정상 작동합니다.
2. **Windows SmartScreen 알림**: 인터넷에서 다운로드한 스크립트의 경우 "Windows의 PC 보호" 창이 뜰 수 있습니다. `[추가 정보]` 클릭 후 `[실행]`을 선택하면 정상 실행됩니다.
3. **PowerShell 실행 정책**: `.ps1` 파일 실행이 제한된 경우 관리자 PowerShell에서 `Set-ExecutionPolicy RemoteSigned -Scope CurrentUser`를 입력하거나 배치(`.bat`) 래퍼를 사용하십시오.

---

## 📚 상세 기술 문서 (Documentation)

자세한 내부 동작 원리 및 가이드는 `/docs` 디렉터리에서 확인하실 수 있습니다:

- [📄 전체 문서 색인 (Index)](./docs/README.md)
- [📝 버전별 패치 노트 (Patch Notes)](./docs/PATCH_NOTES.md)
- [🏗️ 시스템 아키텍처 및 폴더 감지 규칙](./docs/ARCHITECTURE.md)
- [📖 사용자 상세 가이드](./docs/USER_GUIDE.md)
- [🔧 문제 해결 가이드 (Troubleshooting)](./docs/TROUBLESHOOTING.md)
- [🏫 컴퓨터실/학원 다중 PC 배포 가이드](./docs/REMOTE_CLASSROOM_GUIDE.md)
- [🌐 깃허브 공개 및 배포 체크리스트](./docs/GITHUB_PUBLISHING_GUIDE.md)

---

## 📄 라이선스 (License)

본 프로젝트는 [MIT License](./LICENSE) 하에 배포됩니다.

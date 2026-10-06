# 웹 배포 가이드 (Deployment Guide)

본 문서는 **포토샵 & 일러스트레이터 다국어 언어 변경기** 웹 애플리케이션을 인터넷에 무료로 호스팅하고 다른 사람들이 웹 브라우저에서 바로 접속하여 사용할 수 있도록 배포하는 가장 효과적인 방법들을 설명합니다.

---

## 🌟 추천 배포 방식 3가지 비교

| 플랫폼 | 추천 대상 | 장점 | 배포 난이도 | 비용 |
| :--- | :--- | :--- | :--- | :--- |
| **1. GitHub Pages (가장 추천)** | 깃허브 저장소와 함께 관리하고 싶은 경우 | • 별도 회원가입 불필요<br>• `git push` 시 자동 빌드/배포<br>• 무료 HTTPS 및 깃허브 통합 URL | ⭐ (매우 쉬움) | 100% 무료 |
| **2. Vercel** | 가장 빠른 접속 속도와 쉬운 연동을 원하는 경우 | • 깃허브 계정 연동 30초 완료<br>• 글로벌 엣지 CDN 초고속 로딩<br>• 무료 커스텀 도메인 지원 | ⭐ (가장 직관적) | 100% 무료 |
| **3. Cloudflare Pages** | 대규모 트래픽/대역폭 제한 없는 호스팅을 원하는 경우 | • 대역폭 무제한 무료<br>• 전 세계 최고의 DDoS 방어 및 속도 | ⭐⭐ (쉬움) | 100% 무료 |

---

## 🚀 방법 1: GitHub Pages로 1분 만에 자동 배포하기 (가장 추천)

이 프로젝트에는 이미 **GitHub Actions 자동 배포 워크플로우(`.github/workflows/deploy.yml`)**가 내장되어 있습니다.

### 1단계: GitHub 저장소 생성 및 푸시
```bash
# 로컬 저장소 초기화 및 원격 저장소 연결 (아직 안 한 경우)
git init
git add .
git commit -m "feat: release v2.5.0"
git branch -M main
git remote add origin https://github.com/[내-깃허브-아이디]/[저장소-이름].git
git push -u origin main
```

### 2단계: GitHub Pages 설정 활성화
1. GitHub 웹사이트의 내 저장소 페이지로 이동합니다.
2. 상단 메뉴에서 **[Settings]** ➔ 좌측 사이드바에서 **[Pages]** 메뉴를 클릭합니다.
3. **Build and deployment** 항목의 **Source**를 `Deploy from a branch`에서 **`GitHub Actions`**로 변경합니다.
4. 이제 `main` 브랜치에 코드를 푸시할 때마다 자동으로 빌드되어 `https://[내-아이디].github.io/[저장소-이름]/` 주소로 1분 안에 배포됩니다!

---

## ⚡ 방법 2: Vercel로 원클릭 배포하기

Vercel은 프론트엔드 배포에 가장 널리 사용되는 플랫폼으로, 설정이 가장 간편합니다.

1. **[Vercel 공식 웹사이트](https://vercel.com)**에 접속하여 **[Continue with GitHub]**로 로그인합니다.
2. **[Add New...]** ➔ **[Project]**를 클릭합니다.
3. 방금 올린 `포토샵 언어 변경기` 깃허브 저장소를 찾은 후 **[Import]** 버튼을 누릅니다.
4. Framework Preset이 `Vite`로 자동 감지됩니다. (추가 설정 필요 없음)
5. **[Deploy]** 버튼을 클릭하면 약 30초 후 나만의 무료 배포 URL(`https://[프로젝트명].vercel.app`)이 생성됩니다.

---

## 🛡️ 방법 3: Cloudflare Pages로 배포하기

1. **[Cloudflare 대시보드](https://dash.cloudflare.com)**에 로그인합니다.
2. **[Workers & Pages]** ➔ **[Create application]** ➔ **[Pages]** 탭 ➔ **[Connect to Git]**을 선택합니다.
3. 깃허브 저장소를 선택하고 아래 빌드 설정을 확인합니다:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. **[Save and Deploy]**를 누르면 글로벌 CDN에 배포가 완료됩니다.

---

## 📱 PWA (Progressive Web App) 앱 설치 지원

본 웹 애플리케이션에는 **PWA(오프라인 지원 및 데스크톱 앱 설치)** 기능이 내장되어 있습니다.
- 웹사이트 배포 후 사용자가 크롬/엣지 브라우저 주소창 우측의 **[설치]** 아이콘을 클릭하면, PC나 맥에 별도의 설치 파일 없이 **독립 실행형 데스크톱 앱**처럼 등록하여 사용할 수 있습니다.

---

## 📌 배포 후 체크리스트

- [ ] **HTTPS 동작 확인**: File System Access API(원클릭 브라우저 제어)는 HTTPS 환경에서만 작동하므로 배포 후 `https://` 주소로 접속되는지 확인.
- [ ] **배치/스크립트 다운로드 테스트**: 배포된 웹사이트에서 `.bat` 및 1-Click `.exe` 컴파일러 다운로드가 정상 동작하는지 테스트.
- [ ] **저장소 `README.md` 링크 갱신**: 깃허브 메인 리드미에 실제 배포된 웹사이트 링크(Demo URL) 기재.

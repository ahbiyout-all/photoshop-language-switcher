# 문서 디렉터리 색인 (Documentation Index)

이 디렉터리는 포토샵 언어 변경기(Photoshop Language Switcher) 프로젝트의 공식 기술 문서, 사용자 가이드, 아키텍처 사양 및 패치 노트를 관리하는 공간입니다.

## 📚 문서 목록

| 문서명 | 파일 경로 | 설명 |
| :--- | :--- | :--- |
| **패치 노트 (Patch Notes)** | [`PATCH_NOTES.md`](./PATCH_NOTES.md) | 버전별 변경 이력 및 릴리스 로그 (Semantic Versioning 준수) |
| **시스템 아키텍처** | [`ARCHITECTURE.md`](./ARCHITECTURE.md) | 폴더 감지 규칙, 파일 시스템 연동 및 스크립트 생성 엔진 구조 |
| **사용자 가이드** | [`USER_GUIDE.md`](./USER_GUIDE.md) | 브라우저 직접 연동 및 배치(.bat) 스크립트 상세 사용 방법 |
| **문제 해결 가이드** | [`TROUBLESHOOTING.md`](./TROUBLESHOOTING.md) | 권한 오류, 파일 미감지 등 발생 가능한 문제 해결 방안 |
| **원격 컴퓨터실 무인 배포 가이드** | [`REMOTE_CLASSROOM_GUIDE.md`](./REMOTE_CLASSROOM_GUIDE.md) | 학원/학교/연구실 컴퓨터실 다중 PC 일괄 배포 가이드 |
| **어도비 제품군 확장 분석** | [`EXTENDED_ADOBE_APPS_GUIDE.md`](./EXTENDED_ADOBE_APPS_GUIDE.md) | 일러스트레이터/프리미어/인디자인 등 앱별 언어 엔진 분석 |
| **깃허브 오픈소스 공개 가이드** | [`GITHUB_PUBLISHING_GUIDE.md`](./GITHUB_PUBLISHING_GUIDE.md) | 깃허브 공개 시 라이선스, 상표권, 보안, 배포 체크리스트 |
| **깃허브 푸시 보안 & 개인정보 가이드** | [`GIT_SECURITY_GUIDE.md`](./GIT_SECURITY_GUIDE.md) | 깃허브 푸시 시 개인정보 및 시크릿 차단, bat 스크립트 배포 안전성 가이드 |
| **웹 배포 및 호스팅 가이드** | [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | GitHub Pages, Vercel, Cloudflare를 통한 무료 배포 방법 |
| **자동 빌드 스크립트 가이드** | [`BUILD_GUIDE.md`](./BUILD_GUIDE.md) | Windows CRLF 영문 자동 빌드 파이프라인 및 .EXE 버전 결합 명세 |
| **속성 위변조 방지 가이드** | [`METADATA_PROTECTION_GUIDE.md`](./METADATA_PROTECTION_GUIDE.md) | GitHub Pages 공개 시 속성 임의 변경 대처 방안 1 & 2 및 PIN 보안 명세 |
| **웹페이지 24개국 다국어 가이드** | [`I18N_WEB_GUIDE.md`](./I18N_WEB_GUIDE.md) | 웹페이지 UI 자체의 24개국 글로벌 언어 지원 아키텍처 및 선택기 가이드 |
| **소프트웨어 보안 점검 보고서** | [`SECURITY_REPORT.md`](./SECURITY_REPORT.md) | 정적 보안 감사, XSS, 무결성 PIN 시스템 및 취약점 분석 보고서 |
| **모듈 & 스탠드얼론 명세서** | [`DLL_SPECIFICATION.md`](./DLL_SPECIFICATION.md) | 순수 창작 PE 래퍼 바이너리 및 모듈 아키텍처 명세 |
| **다국어 라이선스 (KR / EN)** | [`LICENSE_KR.md`](./LICENSE_KR.md) / [`LICENSE_EN.md`](./LICENSE_EN.md) | 한국어 및 영어 표준 라이선스 및 어도비 상표권 비제휴 고지문 |
| **프로젝트 종합 작업 로그** | [`WorkLog.md`](./WorkLog.md) | 마일스톤별 누적 엔지니어링 작업 로그 |
| **정밀 QA 테스트 계획 & 보고서** | [`TEST_PLAN.md`](./TEST_PLAN.md) / [`TEST_REPORT.md`](./TEST_REPORT.md) | 5대 핵심 영역 정밀 QA 테스트 계획 및 검증 결과 보고서 |

---

## 📌 문서 작성 및 관리 원칙
1. **신규 문서 생성 기준**:
   - 포토샵 신규 버전의 특이 사양 추가 시 해당 내용을 별도 기술 명세로 작성.
   - 새로운 운영체제 지원 또는 외부 연동 기능 추가 시 관련 가이드 문서 신규 작성.
2. **패치노트 자동 기록**:
   - 코드 수정에 특이점이 발생할 때마다 `PATCH_NOTES.md`에 Semantic Versioning 원칙(MAJOR.MINOR.PATCH)에 따라 즉시 기록 및 버전 태깅을 수행합니다.

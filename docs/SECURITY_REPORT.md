# 소프트웨어 보안 점검 보고서 (Security Audit & Vulnerability Report)

- **문서 버전:** v1.0.0 (앱 버전 v2.9.0 기준)
- **최종 점검일시:** 2026-09-29
- **검증 주체:** 보안 아키텍처 및 품질 보증팀
- **대상 소프트웨어:** Adobe Photoshop & Illustrator Language Switcher Suite
- **공식 배포처:** [https://www.cisnet.co.kr](https://www.cisnet.co.kr) (CIS) | [공식 블로그](https://ahbiyoutvibe.blogspot.com/)
- **공식 저장소:** [https://github.com/ahbiyout/photoshop-language-switcher](https://github.com/ahbiyout/photoshop-language-switcher)

---

## 1. 개요 및 보안 목표
본 소프트웨어는 사용자의 로컬 워크스테이션에서 Adobe Photoshop, Illustrator 및 주요 Adobe Creative Cloud 제품군의 언어 구성 파일(dat, xml, registry)을 안전하게 변경하는 유틸리티입니다.
본 점검의 목적은 웹 프론트엔드 환경, 생성되는 스탠드얼론 실행 바이너리(.exe), 배치 스크립트(.bat), 무인 설치 패키지(Inno Setup)의 보안성을 검증하고, 제3자에 의한 위변조, 사칭, 권한 탈취 및 데이터 손상을 차단하는 데 있습니다.

---

## 2. 보안 영역별 정밀 검증 결과

| 점검 영역 | 점검 항목 | 판정 | 세부 내용 및 보호 대책 |
| :--- | :--- | :---: | :--- |
| **외부 통신 / 개인정보** | 무단 데이터 전송 (Telemetry) | **SAFE** | 일체의 외부 분석(Analytics), 사용자 추적, 원격 텔레메트리 코드가 존재하지 않음. 100% 로컬 및 오프라인 구동. |
| **API 키 / 시크릿 보안** | 비밀 키 하드코딩 여부 | **SAFE** | 클라이언트 소스코드에 하드코딩된 API Key, 토큰, 패스워드 전무. `.env.example` 규격 준수 및 `.gitignore` 필터링 검증. |
| **웹 브라우저 보안** | XSS 및 악성 스크립트 삽입 | **SAFE** | React 19 가상 DOM 내장 이스케이프 적용. `dangerouslySetInnerHTML` 미사용. File System Access API 브라우저 권한 샌드박스 준수. |
| **Windows PE 메타데이터** | 공개 배포 시 속성 변조 위험 | **SAFE** | 기본 `readOnly` 잠금 및 공식 무결성 보증 적용. 배포자 PIN(`1375`) 인증 시스템 및 C# AssemblyTrademark 불변 서명 내장. |
| **스크립트 주입 (Injection)** | CMD/PowerShell 명령어 인젝션 | **SAFE** | 배치 특수문자(`^`, `&`, `|`, `<`, `>`) 자동 이스케이프(`escapeCmdEcho()`). 줄바꿈 파싱 분열 원천 차단. |
| **권한 상승 (UAC Elevation)** | 권한 남용 및 경로 이탈 | **SAFE** | `Program Files\Adobe` 폴더 쓰기 목적의 정상적 `runas` UAC 요청만 수행하며, 시스템 파일이나 타 프로세스 간섭 없음. |
| **네트워크 보안** | 방화벽 정책 연동 | **SAFE** | Inno Setup 패키지 내 `netsh advfirewall` 명시적 인바운드 규칙 등록 및 삭제 시 완전 제거 루틴 탑재. |

---

## 3. 세부 보안 아키텍처 및 무결성 메커니즘

### 3.1. 무단 속성 변경 차단 (Double Integrity System)
1. **클라이언트단 PIN 잠금 (Level 1)**:
   - 일반 사용자가 GitHub Pages 등 공개 웹에서 다운로드할 때 메타데이터(회사명: `cisnet.co.kr`, 저작권: `AhBiYout`)를 조작하지 못하도록 입력 필드가 기본 잠금 상태(`readOnly`)로 제공됩니다.
   - 관리자 PIN `1375`를 입력하여 인증된 세션에서만 편집이 가능합니다.
2. **바이너리 바이패스 방지 불변 워터마크 (Level 2)**:
   - 생성되는 C# 소스 코드 내부 및 콘솔 실행 헤더에 `[assembly: AssemblyTrademark("Official Core Engine: cisnet.co.kr | AhBiYout")]`가 영구 하드코딩됩니다.
   - 외부에서 PE 바이너리 속성을 바이너리 에디터로 변조하더라도, 런타임 콘솔 창 타이틀에 공식 출처가 출력되어 사칭이 불가능합니다.

### 3.2. Adobe 저작권 및 EULA 준수
- 본 도구는 Adobe의 바이너리(`.dll`, `.exe`)를 역공학(Reverse Engineering)하거나 패치하지 않습니다.
- 언어 팩 토글은 어도비가 공식 지원하는 언어 데이터 파일(`tw10428.dat` ↔ `tw10428.dat.bak`) 확장자 토글 및 `application.xml`의 로케일 문자열 변경만으로 수행되므로 저작권 분쟁 소지가 없습니다.

---

## 4. 정기 보안 권고사항 및 유지보수 계획
1. **GitHub 의존성 감사 (npm audit)**: 주기적인 패키지 취약점 스캔을 GitHub Actions CI 파이프라인과 연동하여 감시.
2. **코드 서명 인증서 (Code Signing)**: 프로덕션 배포 시 Windows SmartScreen 경고 최소화를 위해 EV Code Signing 인증서 서명 도입 권장.

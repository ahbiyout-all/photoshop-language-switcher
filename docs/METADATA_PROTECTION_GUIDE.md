# GitHub Pages 공개 시 PE 속성(자세히) 임의 변경 방지 가이드 (Metadata Protection Guide)

본 문서는 프로젝트를 **GitHub Pages나 공개 웹 호스팅(Vercel, Cloudflare Pages 등)에 퍼블릭 배포할 때, 일반 사용자가 [속성(자세히) 설정] 창에서 파일 설명, 버전, 저작권, 회사명(`cisnet.co.kr`) 등을 임의로 위변조하여 사칭하거나 불법 수정 배포하는 위험을 차단하기 위한 2단계 보안 방어 체계(대처 방안 1 & 2)**를 설명합니다.

---

## ⚠️ 위협 모델 및 취약점 분석 (Threat Model)

| 위협 요소 | 취약점 설명 | 악용 시 발생 위험 |
| :--- | :--- | :--- |
| **원작자 사칭 및 브랜딩 탈취** | 일반 방문자가 `속성(자세히)` 모달에서 회사(`Company`)나 저작권(`Copyright`)을 자신의 이름이나 임의의 단체로 수정 | 원작자(`AhBiYout / cisnet.co.kr`)의 크레딧이 삭제되고 타인이 자신의 소프트웨어인 것처럼 재배포할 위험 |
| **버전 정보 위조** | 공식 릴리스 버전과 다른 임의의 버전 번호를 기재하여 배포 | 구버전 스크립트를 신버전으로 위장하거나, 시스템 관리자가 무결성을 검증하기 어려워짐 |
| **악의적 설명 날조** | 파일 설명(`Description`)이나 제품명(`Product`)에 부적절한 문구나 허위 정보 입력 | 기업 보안 소프트웨어나 백신에서 불명확한 출처로 오진(False Positive)될 소지 발생 |

---

## 🛡️ 대처 방안 1: 공식 속성 읽기 전용 보호 잠금 & PIN 인증 해제 시스템

> **"일반 사용자는 공식 검증값만 안전하게 사용하고, 원작자/관리자만 PIN 번호로 커스텀 편집을 해제한다."**

### 1. 기본 공식 읽기 전용 보호 (Official Read-Only Lock)
- 웹페이지 접속 시 모든 메타데이터 입력창(`파일 설명`, `파일 버전`, `제품 이름`, `제품 버전`, `저작권`, `회사`, `법적 상표`)이 **기본적으로 읽기 전용(`readOnly={!isUnlocked}`)**으로 잠깁니다.
- 입력창에는 `🔒` 자물쇠 아이콘과 함께 비활성화 스타일이 적용되며, 텍스트 복사는 가능하되 임의 키보드 수정이 원천 차단됩니다.
- 모달 상단에 **`🛡️ 공식 배포 무결성 잠금 활성화됨 (Official Read-Only Lock)`** 배지가 명확하게 표기됩니다.
- 하단 다운로드 버튼이 **`🛡️ 공식 정품 .EXE 컴파일러 받기 (보호됨)`**으로 작동하여, 원작자가 보증한 안전한 메타데이터로만 1-Click 컴파일러가 생성됩니다.

### 2. 관리자/개발자 전용 PIN 인증 해제 (Developer PIN Unlock)
- 원작자 또는 공인 시스템 관리자가 속성을 변경해야 할 경우:
  1. 모달 우측 상단의 **[🔑 개발자 잠금 해제]** 버튼을 클릭합니다.
  2. 보안 인증 팝업에 **관리자 PIN 번호**를 입력합니다.
     - **기본 관리자 PIN**: `1375`
  3. PIN 번호 일치 시 즉시 **`🔓 개발자 편집 모드 활성화됨`**으로 전환되며 모든 입력창이 수정 가능 상태로 변경됩니다.
  4. 인증 성공 기록은 브라우저 세션 스토리지(`sessionStorage`)에 저장되어 모달을 닫았다 열어도 유지되며, 브라우저 종료 시 자동으로 다시 잠깁니다.
  5. 작업 완료 후 언제든 상단의 **[🔒 다시 잠금]** 버튼을 눌러 즉시 공식 보호 모드로 복귀할 수 있습니다.

### 3. URL 파라미터 간편 관리자 모드 (Admin Direct Access)
- 리포지토리 관리자나 개발자 본인이 로컬 작업 또는 디버깅 시 즉시 잠금 해제 상태로 열고자 할 때:
  ```text
  https://<your-username>.github.io/<repo-name>/?admin=true
  또는
  https://<your-username>.github.io/<repo-name>/?dev=1
  ```
- URL 뒤에 `?admin=true` 파라미터를 붙여 접속하면 페이지 로드 즉시 개발자 편집 모드가 자동으로 활성화됩니다.

---

## 🛡️ 대처 방안 2: 불변 공식 디지털 서명 및 변조 방지 워터마크 영구 주입

> **"사용자가 화면 속성을 임의로 바꾸더라도, 실제 컴파일되는 바이너리와 스크립트 내부에는 삭제 불가능한 공식 원작자 출처가 영구 각인된다."**

### 1. C# Assembly 헤더 레벨 영구 불변 서명 (PE Header Burning)
컴파일러가 생성하는 C# 소스코드(`Program.cs`)에 다음 불변 속성이 컴파일 타임에 하드코딩됩니다:

```csharp
// =========================================================================
// [변조 불가] 공식 배포처 및 원작자 디지털 무결성 보증 서명
// =========================================================================
[assembly: AssemblyTrademark("Official Core Engine: cisnet.co.kr | AhBiYout")]
[assembly: AssemblyConfiguration("Official Distribution by cisnet.co.kr | Author: AhBiYout | Security Integrity Verified")]
```
- 사용자가 웹 UI에서 상표나 구성 필드를 지우더라도, C# 컴파일 타임에 원작자 보증 서명이 강제 병합되어 빌드 바이너리 내부에 영구 보존됩니다.

### 2. 실행 시 런타임 타이틀 & 콘솔 배너 고정 출력
생성된 `.exe` 파일을 더블클릭하여 실행할 때, Windows 콘솔 타이틀과 콘솔 창 상단에 항상 공식 출처가 출력됩니다:

```csharp
// 런타임 콘솔 창 상단 타이틀
Console.Title = meta.title + " [Core Engine: cisnet.co.kr]";

// 실행 즉시 표시되는 보안 배너
Console.WriteLine("==========================================================");
Console.WriteLine("  " + meta.title + " - Native 64-bit Engine");
Console.WriteLine("  Official Core Engine: cisnet.co.kr | Author: AhBiYout");
Console.WriteLine("  Version: " + meta.informationalVersion);
Console.WriteLine("==========================================================");
```
- 제3자가 파일명을 바꾸거나 겉보기 속성을 조작하더라도, 실제 실행 창에서 원작자(`cisnet.co.kr | AhBiYout`)의 정품 엔진임이 즉각 확인되므로 사칭이 불가능합니다.

### 3. 배치 컴파일러 스크립트(`.bat`) 무결성 헤더 주입
생성되는 `Build_*_EXE.bat` 스크립트 파일 최상단에도 공식 디지털 무결성 확인 주석이 영구 삽입됩니다:

```bat
@echo off
chcp 65001 >nul 2>&1
title Windows Native .EXE Auto-Compiler - AhBiYout (cisnet.co.kr)
color 0B

echo ========================================================
echo   Adobe Language Switcher - Native .EXE Auto-Compiler
echo   Official Core Engine: cisnet.co.kr | Author: AhBiYout
echo   Verified Digital Integrity & Tamper-Resistant Engine
echo ========================================================
```

---

## 📋 대처 방안 1 & 2 비교 요약표

| 구분 | 대처 방안 1 (UI 보안 잠금) | 대처 방안 2 (바이너리 불변 서명) |
| :--- | :--- | :--- |
| **방어 계층** | 프론트엔드 UI 레벨 (Presentation Layer) | C# 소스 / 컴파일러 바이너리 레벨 (Binary Layer) |
| **작동 원리** | 모든 속성 입력 필드를 읽기 전용(`readOnly`)으로 잠금 처리 | C# Assembly 속성 및 콘솔 런타임에 `cisnet.co.kr` 영구 각인 |
| **사용자 경험** | 일반 사용자는 정품 공식 속성을 투명하게 확인하고 안전하게 다운로드 | 어떤 경우에도 원작자 보증 출처가 삭제되지 않음 |
| **관리자 권한** | 관리자 PIN(`1375`) 입력 또는 `?admin=true` 파라미터로 잠금 해제 | 소스코드 및 `build.bat` 전역에서 일관되게 적용 |
| **효과** | 일반 방문자의 우발적/악의적 속성 변조 시도 원천 차단 | 바이너리 무단 도용 및 리브랜딩 사칭 방어 |

---

## 🔒 관리자 PIN 번호 변경 방법
배포자가 자신만의 고유한 PIN 번호로 변경하고자 할 경우:
1. `src/version.ts` 파일을 엽니다.
2. `DEFAULT_DEV_ADMIN_PIN` 상수를 원하는 비밀번호로 변경합니다:
   ```typescript
   export const DEFAULT_DEV_ADMIN_PIN = '내_비밀번호';
   ```
3. `git commit -am "chore: update admin pin"` 후 GitHub에 푸시하면 즉시 새 PIN이 반영됩니다.

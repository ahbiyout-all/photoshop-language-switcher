# 🏫 학교·기관 컴퓨터실 원격 일괄 배포 가이드 (Remote Classroom Deployment)

이 문서는 학교 컴퓨터실, 디자인 학원, 자격증 시험장 등에서 **선생님(관리자) 컴퓨터의 원격 제어 프로그램**(NetSupport School, Veyon, 넷오피, 마스터아이, 클라썸 등)을 사용하여 학생 PC들의 **포토샵(Photoshop) 및 일러스트레이터(Illustrator) 언어를 일괄 변경**할 때 고려해야 하는 기술적 요구사항과 실무 가이드를 정리한 문서입니다.

---

## 1. 원격 일괄 배포 시 4대 핵심 주의사항 및 해결 원리

일반 사용자가 로컬에서 더블 클릭하여 실행하는 일반 배치 파일(`.bat`)을 원격 제어 프로그램으로 전송하여 실행하면 실패하거나 학생 PC가 멈추는(Freezing) 현상이 발생할 수 있습니다. 본 스위트의 **무인(Silent) 원격 스크립트**는 이러한 문제를 원천 차단하도록 설계되었습니다.

### ① UAC(사용자 계정 컨트롤) 대기 문제
* **문제점**:
  - 일반 스크립트에 들어있는 `PowerShell Start-Process -Verb RunAs` 또는 VBS 관리자 권한 승격 코드는 학생 화면에 "이 앱이 디바이스를 변경하도록 허용하시겠습니까?"라는 윈도우 UAC 창을 띄웁니다.
  - 학생 계정이 일반 사용자(표준 계정)로 잠겨 있거나, 학생이 예를 누르지 않으면 스크립트가 무한정 대기(Hang) 상태에 빠집니다.
* **해결 원리**:
  - 원격 배포 전용 스크립트는 내부에서 대화형 UAC 승격을 시도하지 않습니다.
  - 원격 제어 프로그램(NetSupport, Veyon 등)의 자체 기능인 **"시스템(SYSTEM) 서비스 권한으로 실행"** 옵션을 사용하여 실행하므로 팝업 창 없이 0.1초 만에 조용히 실행됩니다.

### ② `pause` (키 입력 대기)로 인한 프로세스 정체 및 작업 결과 표시
* **문제점**:
  - 스크립트 끝에 무한정 키 입력을 기다리는 `pause`가 있으면 학생 PC에서 키보드를 누를 때까지 원격 제어 프로그램에서 "작업 완료" 신호를 받지 못하고 프로세스가 계속 실행 중으로 남습니다. 반대로 화면을 바로 닫아버리면 어떤 작업이 수행되었는지 즉시 육안 확인하기 어렵습니다.
* **해결 원리**:
  - 스크립트 실행 종료 시점에 **Photoshop 및 Illustrator의 변경 건수와 로그 위치를 화면에 명확하게 5초 동안 출력**하고, `timeout /t 5`를 통해 5초 후 자동으로 창이 닫히며 `exit /b 0`을 반환하도록 설계되었습니다.
  - 키보드를 누르면 즉시 닫을 수도 있고, 아무 조작을 하지 않아도 5초 뒤 자동 종료되므로 원격 제어 프로그램의 세션 정체가 전혀 발생하지 않습니다.

### ③ 실행 중인 포토샵/일러스트 프로세스 충돌 (File Lock)
* **문제점**:
  - 학생이 이미 포토샵이나 일러스트를 켜 둔 상태에서 언어 파일(`tw10428.dat` 또는 `application.xml`)을 수정하려 하면 "다른 프로세스에서 사용 중"이라며 거부됩니다.
* **해결 원리**:
  - 스크립트 실행 첫 줄에서 `taskkill /f /im Photoshop.exe >nul 2>&1` 및 `taskkill /f /im Illustrator.exe >nul 2>&1`을 실행하여 열려 있는 프로그램을 안전하게 사전 종료한 뒤 작업을 수행합니다.

### ④ 작업 디렉터리 왜곡 (%~dp0 vs System32)
* **문제점**:
  - 원격 프로그램이 스크립트를 `C:\Windows\Temp`나 에이전트 설치 폴더로 다운로드한 뒤 실행할 때, 현재 작업 위치가 `C:\Windows\System32` 등으로 잡혀 상대 경로가 작동하지 않습니다.
* **해결 원리**:
  - 본 스크립트는 실행 위치와 상관없이 `C, D, E, F` 모든 드라이브의 `Program Files\Adobe` 절대 경로와 Windows 레지스트리(`App Paths`)를 직접 조회하므로 파일 위치 왜곡의 영향을 받지 않습니다.

---

## 2. 원격 프로그램별 설정 방법

### 📡 NetSupport School (넷서포트 스쿨)
1. 교사용 관리 콘솔에서 전체 학생 PC를 선택합니다.
2. 상단 메뉴의 **[관리]** > **[원격 명령 실행 (Execute Remote Command)]** 또는 **[파일 배포/실행]**을 클릭합니다.
3. 배포할 파일로 다운로드한 `classroom_adobe_all_to_english_silent.bat` (또는 해당 bat)을 지정합니다.
4. 실행 계정 옵션에서 **"시스템 계정(SYSTEM)으로 실행"** 또는 **"관리자 권한으로 실행"**에 체크합니다.
5. [실행]을 누르면 몇 초 내에 전 좌석 배포 및 언어 변경이 완료됩니다.

### 📡 Veyon (베이온 - 오픈소스)
1. Veyon Master 콘솔에서 컴퓨터실 전체 컴퓨터를 드래그 선택합니다.
2. 기능 패널에서 **[명령 실행 (Execute command)]** 기능을 선택합니다.
3. 파일 전송 기능으로 `C:\Windows\Temp`에 bat 파일을 전송하거나, 공유 네트워크 경로(`\\Teacher-PC\Share\classroom_*.bat`)를 지정하여 실행합니다.
4. 명령 옵션에서 백그라운드 무인 모드로 실행합니다.

### 📡 넷오피 (NetOp School) / 마스터아이 / 클라썸
1. 전체 학생 PC를 선택 후 **[파일 일괄 배포 및 즉시 실행]** 기능을 엽니다.
2. 실행 파라미터에 추가 옵션 없이 다운로드한 `.bat`을 그대로 지정합니다.
3. `silent` 또는 `배경 실행` 옵션을 선택하여 전송합니다.

---

## 3. 수업 상황별 권장 스크립트

| 수업 및 평가 시나리오 | 권장 배포 스크립트 | 설명 |
| :--- | :--- | :--- |
| **국가공인 자격증 시험 (GTQ, 컴퓨터그래픽스운용기능사)** | `classroom_adobe_all_to_english_silent.bat` | 포토샵과 일러스트레이터를 동시에 단 한 번에 **영문 모드로 고정** |
| **일반 정규 수업 복구** | `classroom_adobe_all_to_korean_silent.bat` | 시험이나 영문 실습 종료 후 전 좌석을 즉시 **한글 모드로 일괄 환원** |
| **수업 중 빠른 실습** | `classroom_adobe_all_toggle_silent.bat` | 현재 언어 상태를 반전시켜 전환 |
| **포토샵 단독 실습** | `classroom_photoshop_to_english_silent.bat` | 포토샵 전용 무인 일괄 영문 전환 |
| **일러스트 단독 실습** | `classroom_illustrator_to_english_silent.bat` | 일러스트 전용 무인 일괄 영문 전환 |

---

## 4. 실행 결과 확인 및 트러블슈팅

스크립트는 모든 학생 PC의 윈도우 임시 디렉터리에 실행 로그를 자동으로 남깁니다.

### 로그 파일 확인 경로
* 통합 스크립트: `%TEMP%\adobe_all_remote_deploy.log` (예: `C:\Users\학생계정\AppData\Local\Temp\adobe_all_remote_deploy.log`)
* 포토샵 전용: `%TEMP%\photoshop_remote_deploy.log`
* 일러스트 전용: `%TEMP%\illustrator_remote_deploy.log`

### 정상 로그 예시
```text
[2026-09-20 19:00:00] [START] Adobe Photoshop 및 Illustrator 일괄 배포 시작 (모드: to_en)
[OK] tw10428_Photoshop_ko_KR.dat -> old_tw10428_Photoshop_ko_KR.dat
[OK: to_en] Modified: C:\Program Files\Adobe\Adobe Illustrator 2024\Support Files\Contents\Windows\AMT\application.xml
[2026-09-20 19:00:02] [END] Photoshop 변경: 1, Illustrator 변경: 1
```

만약 특정 좌석에서 변경되지 않았다면, 해당 PC의 로그 파일을 열어 `Access is denied` (권한 부족) 또는 `The system cannot find the path specified` (어도비 미설치 또는 경로 상이) 여부를 즉시 점검할 수 있습니다.

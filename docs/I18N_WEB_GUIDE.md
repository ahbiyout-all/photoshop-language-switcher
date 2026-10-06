# 🌐 웹페이지 24개국 글로벌 다국어 지원 가이드 (Web UI 24-Locale Internationalization Guide)

본 문서는 **포토샵 & 일러스트레이터 언어 변경기 웹 애플리케이션의 24개국 글로벌 웹 인터페이스 다국어 지원 체계(Web UI i18n Engine)**에 관한 기술 명세 및 사용자 가이드입니다.

---

## 1. 📌 개요 및 도입 배경
기존에는 어도비 앱 내부의 데이터 파일(`.dat` / `.xml`) 변경 스크립트만 24개국 로케일을 지원하였으나, **v2.7.0 업데이트를 통해 웹사이트 자체의 모든 UI 요소(헤더, 내비게이션, 안내문, 버튼, 툴킷 탭 등)가 전 세계 24개국 언어로 실시간 전환**되도록 전면 확장되었습니다.

전 세계 디자이너, 강사, 글로벌 지사 실무자가 모국어로 편리하게 툴을 이용할 수 있습니다.

---

## 2. 🌍 지원 언어 목록 (24개국 공식 언어 팩)

| 순번 | 국기 | 언어 코드 | 언어명 (한국어) | 원어 표기 (Native Name) | 영어 표기 (English) |
| :---: | :---: | :---: | :--- | :--- | :--- |
| 1 | 🇰🇷 | `ko_KR` | 한국어 (기본값) | 한국어 | Korean |
| 2 | 🇺🇸 | `en_US` | 영어 (미국) | English (US) | English (US) |
| 3 | 🇬🇧 | `en_GB` | 영어 (영국/국제) | English (UK) | English (UK) |
| 4 | 🇯🇵 | `ja_JP` | 일본어 | 日本語 | Japanese |
| 5 | 🇨🇳 | `zh_CN` | 중국어 (간체) | 简体中文 | Chinese (Simplified) |
| 6 | 🇹🇼 | `zh_TW` | 중국어 (번체) | 繁體中文 | Chinese (Traditional) |
| 7 | 🇩🇪 | `de_DE` | 독일어 | Deutsch | German |
| 8 | 🇫🇷 | `fr_FR` | 프랑스어 | Français | French |
| 9 | 🇪🇸 | `es_ES` | 스페인어 | Español | Spanish |
| 10 | 🇮🇹 | `it_IT` | 이탈리아어 | Italiano | Italian |
| 11 | 🇷🇺 | `ru_RU` | 러시아어 | Русский | Russian |
| 12 | 🇧🇷 | `pt_BR` | 포르투갈어 (브라질) | Português (Brasil) | Portuguese (Brazil) |
| 13 | 🇵🇱 | `pl_PL` | 폴란드어 | Polski | Polish |
| 14 | 🇹🇷 | `tr_TR` | 튀르키예어 | Türkçe | Turkish |
| 15 | 🇨🇿 | `cs_CZ` | 체코어 | Čeština | Czech |
| 16 | 🇭🇺 | `hu_HU` | 헝가리어 | Magyar | Hungarian |
| 17 | 🇺🇦 | `uk_UA` | 우크라이나어 | Українська | Ukrainian |
| 18 | 🇸🇪 | `sv_SE` | 스웨덴어 | Svenska | Swedish |
| 19 | 🇩🇰 | `da_DK` | 덴마크어 | Dansk | Danish |
| 20 | 🇳🇱 | `nl_NL` | 네덜란드어 | Nederlands | Dutch |
| 21 | 🇫🇮 | `fi_FI` | 핀란드어 | Suomi | Finnish |
| 22 | 🇳🇴 | `nb_NO` | 노르웨이어 | Norsk (Bokmål) | Norwegian |
| 23 | 🇦🇪 | `ar_AE` | 아랍어 | العربية | Arabic |
| 24 | 🇮🇱 | `he_IL` | 히브리어 | עברית | Hebrew |

---

## 3. ⚙️ 시스템 아키텍처 및 동작 원리

### 1. `I18nProvider` 및 `useI18n()` 컨텍스트 구조 (`src/i18n/`)
- **`src/i18n/types.ts`**: 단일화된 번역 사전 인터페이스 규격(`TranslationDict`) 정의.
- **`src/i18n/translations.ts`**: 기본 영문(`baseEn`) 및 24개국 번역 딕셔너리 수록.
- **`src/i18n/I18nContext.tsx`**:
  - `localStorage.getItem('adobe_web_ui_lang')`를 통한 사용자 언어 선택 영구 보관.
  - 번역 함수 `t(key, fallback)` 제공: 특정 언어에 번역 키가 누락되더라도 기본 영문(`baseEn`)으로 안전하게 무결점 폴백.

### 2. 글로벌 웹페이지 언어 선택기 (`WebLanguageSelector.tsx`)
- 상단 헤더(`Header.tsx`) 우측에 위치하는 직관적인 글로벌 드롭다운 컴포넌트:
  - 현재 선택된 국가 국기와 원어 표기 실시간 표시.
  - 인기 5개국(한국어, 영어, 일본어, 중국어 간/번체) 퀵 칩 제공.
  - 24개국 검색(Search) 입력창 탑재로 빠른 언어 탐색 지원.

---

## 4. 🚀 사용 방법
1. 웹페이지 상단 헤더의 **국기 아이콘 및 언어 버튼**을 클릭합니다.
2. 원하는 국가 언어를 검색하거나 목록에서 선택합니다.
3. 클릭 즉시 웹페이지의 타이틀, 설명, 버튼 텍스트가 해당 언어로 0.01초 만에 실시간 전환됩니다.
4. 브라우저를 닫았다가 다시 열어도 `localStorage`를 통해 사용자가 선택한 언어가 그대로 기억됩니다.

# AI Coding Assistant Project Rules & Guidelines

이 프로젝트는 포토샵 언어 변경기 웹 애플리케이션입니다.
사용자의 요청에 따라 지속적으로 준수해야 하는 문서화 및 버전 관리 규칙은 다음과 같습니다.

## 1. 문서화 규칙 (`/docs` 디렉터리)
- 모든 프로젝트 관련 공식 문서는 `/docs` 폴더 내에 생성하고 관리합니다.
- 새로운 사양, 아키텍처 변경, 사용자 가이드, 트러블슈팅 내용이 발생할 때마다 필요에 따라 신규 문서를 생성하여 기록합니다.
  - 예: `docs/ARCHITECTURE.md`, `docs/USER_GUIDE.md`, `docs/TROUBLESHOOTING.md`, `docs/PATCH_NOTES.md` 등

## 2. 시맨틱 버저닝 (Semantic Versioning 2.0.0: MAJOR.MINOR.PATCH)
소프트웨어 버전 관리는 변경 규모에 맞춰 3단계로 명확히 분리하여 관리합니다:

1. **MAJOR (X.0.0)**:
   - 이전 버전과 호환되지 않는 중대한 아키텍처 변경, 파괴적 변경(Breaking Changes), 기존 스크립트/동작 체계의 전면 개편.
2. **MINOR (0.X.0)**:
   - 기존 호환성을 유지하면서 새로운 기능(포토샵 버전 추가, 신규 플랫폼 지원, 새로운 내보내기/도구 기능 등) 추가.
3. **PATCH (0.0.X)**:
   - 기존 호환성을 유지하는 버그 수정, 경로 오타 수정, UI 디테일 개선, 성능 최적화, 정적 문서 보완.

## 3. 자동 패치노트 기록 의무 (`docs/PATCH_NOTES.md`)
- 코드 수정에 특이점(신규 기능 추가, 버그 픽스, 인터페이스 수정 등)이 생길 때마다:
  1. `package.json`의 `"version"` 필드를 Semantic Versioning 기준에 맞춰 갱신합니다.
  2. `docs/PATCH_NOTES.md`에 새로운 버전 번호, 배포일시, 변경 유형(MAJOR/MINOR/PATCH), 상세 변경 항목(추가/수정/해결)을 누락 없이 기록합니다.

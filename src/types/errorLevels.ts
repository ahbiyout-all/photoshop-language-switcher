// ErrorLevel standard specification for Photoshop Switcher batch scripts
export interface BatchErrorLevelSpec {
  code: number;
  label: string;
  description: string;
  severity: 'success' | 'warning' | 'error';
}

export const BATCH_ERROR_LEVELS: BatchErrorLevelSpec[] = [
  {
    code: 0,
    label: 'SUCCESS',
    description: '언어 전환 또는 복구가 정상적으로 완료됨',
    severity: 'success',
  },
  {
    code: 1,
    label: 'UAC_PERMISSION_DENIED',
    description: '관리자 권한(UAC) 획득 실패 또는 사용자가 승인을 거부함',
    severity: 'error',
  },
  {
    code: 2,
    label: 'FOLDER_NOT_FOUND',
    description: '포토샵 설치 지원 폴더(Support Files)를 찾을 수 없거나 접근 불가',
    severity: 'error',
  },
  {
    code: 3,
    label: 'TARGET_FILE_NOT_FOUND',
    description: '대상 언어 데이터 파일(tw10428 또는 old_*)이 폴더 내에 존재하지 않음',
    severity: 'warning',
  },
  {
    code: 4,
    label: 'FILE_RENAME_FAILED',
    description: '파일 이름 변경(ren) 실패 (파일 잠금 또는 권한 부족)',
    severity: 'error',
  },
];

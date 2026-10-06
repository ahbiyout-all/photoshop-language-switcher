// Security note on script types and antivirus friendliness
export interface ScriptSecurityProfile {
  antivirusRisk: 'none' | 'low' | 'high';
  riskLabel: string;
  badgeColor: string;
  recommendationNote: string;
}

export const SCRIPT_SECURITY_PROFILES: Record<string, ScriptSecurityProfile> = {
  multi_version_bat: {
    antivirusRisk: 'none',
    riskLabel: '백신 오진 0% (다중 버전 자동 감지)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    recommendationNote: '설치된 모든 드라이브의 Photoshop 버전들을 자동 탐색하여 선택 또는 일괄 전환할 수 있는 스마트 배치 스크립트입니다.',
  },
  toggle_bat: {
    antivirusRisk: 'none',
    riskLabel: '백신 오진 0% (최고 안전)',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    recommendationNote: '순수 Windows 내장 CMD 명령어로만 동작하여 Windows Defender, V3, 알약 등에서 차단되거나 오진될 염려가 전혀 없습니다.',
  },
  desktop_shortcut: {
    antivirusRisk: 'none',
    riskLabel: '백신 안전 (바로가기 생성)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    recommendationNote: '바탕화면에 안전한 .bat 파일의 전용 바로가기 아이콘을 생성합니다.',
  },
  english_bat: {
    antivirusRisk: 'none',
    riskLabel: '백신 오진 0%',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    recommendationNote: '영어로 고정 변경하는 순수 배치 스크립트입니다.',
  },
  korean_bat: {
    antivirusRisk: 'none',
    riskLabel: '백신 오진 0%',
    badgeColor: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    recommendationNote: '한글로 복구하는 순수 배치 스크립트입니다.',
  },
  powershell: {
    antivirusRisk: 'low',
    riskLabel: 'PowerShell 표준 (안전)',
    badgeColor: 'text-indigo-700 bg-indigo-50 border-indigo-200',
    recommendationNote: 'Windows 공식 관리 셸 스크립트입니다.',
  },
  exe_builder: {
    antivirusRisk: 'low',
    riskLabel: 'Windows 내장 C# 네이티브 빌더',
    badgeColor: 'text-amber-800 bg-amber-50 border-amber-200',
    recommendationNote: 'Windows 기본 탑재 .NET 컴파일러를 통해 바탕화면에 순수 단독 .EXE 파일을 직접 컴파일합니다. (서명 없는 개인 빌드 파일 특성상 최초 1회 SmartScreen 안내가 뜰 수 있습니다)',
  },
  hta_gui: {
    antivirusRisk: 'none',
    riskLabel: 'HTML GUI 애플리케이션 (.hta)',
    badgeColor: 'text-blue-700 bg-blue-50 border-blue-200',
    recommendationNote: '설치 필요 없는 순수 Windows 기본 내장 네이티브 창 프로그램입니다. 버튼 클릭으로 한/영 전환 및 상태 확인이 가능하여 배포에 가장 이상적입니다.',
  },
  wpf_gui: {
    antivirusRisk: 'none',
    riskLabel: 'PowerShell WPF 모던 GUI (.ps1)',
    badgeColor: 'text-violet-700 bg-violet-50 border-violet-200',
    recommendationNote: '고해상도 WPF 벡터 그래픽 창으로 실행되는 모던 데스크톱 앱 스크립트입니다.',
  },
  vbs_gui: {
    antivirusRisk: 'high',
    riskLabel: '⚠️ VBScript (백신 오진 주의)',
    badgeColor: 'text-rose-700 bg-rose-50 border-rose-200',
    recommendationNote: 'VBS 파일은 최근 랜섬웨어 및 구형 웜바이러스 악용 전력으로 인해 무해한 코드임에도 백신에서 Heuristic 위험으로 오진할 확률이 매우 높습니다. 배포 및 일상 사용 시 .hta 앱 또는 .bat 파일을 강력 권장합니다.',
  },
};

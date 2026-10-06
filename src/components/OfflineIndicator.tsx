import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      id="offline-banner"
      className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-xl bg-slate-900/95 text-white px-3.5 py-2 text-xs font-medium shadow-xl border border-slate-700 backdrop-blur-xs"
    >
      <WifiOff className="w-4 h-4 text-amber-400 animate-pulse" />
      <span>오프라인 데스크톱 모드 — 캐시된 리소스로 안정적으로 실행 중입니다.</span>
    </div>
  );
};

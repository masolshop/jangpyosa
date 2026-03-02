// 간소화된 매니저 대시보드 추가 기능
// 기존 ManagerDashboard 컴포넌트 앞에 추가할 코드

// 1. 자동 새로고침 훅
export function useAutoRefresh(callback: () => void, enabled: boolean, interval: number = 30000) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  useEffect(() => {
    if (enabled) {
      intervalRef.current = setInterval(callback, interval);
      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    }
  }, [enabled, callback, interval]);
}

// 2. 월별 리포트 로더
export async function loadMonthlyReport(token: string | null, period: 'monthly' | 'quarterly' = 'monthly') {
  if (!token) return [];
  
  try {
    const API_BASE = typeof window !== 'undefined' && window.location.hostname === 'jangpyosa.com'
      ? 'https://jangpyosa.com/api'
      : 'http://localhost:4000';
      
    const endpoint = period === 'monthly' 
      ? `${API_BASE}/api/agent/reports/monthly`
      : `${API_BASE}/api/agent/reports/quarterly`;
    
    const response = await fetch(endpoint, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.months || data.quarters || [];
    }
  } catch (error) {
    console.error('리포트 로드 실패:', error);
  }
  
  return [];
}

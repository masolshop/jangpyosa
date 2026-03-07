// ==================== Dashboard Custom Hooks ====================

import { useState, useEffect, useCallback, useRef } from 'react';
import type { ReportData, ReportPeriod } from './types';

// ==================== 자동 새로고침 훅 ====================

interface UseAutoRefreshOptions {
  enabled: boolean;
  interval?: number;
  onRefresh: () => void;
}

export const useAutoRefresh = ({
  enabled,
  interval = 30000,
  onRefresh,
}: UseAutoRefreshOptions) => {
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const handleManualRefresh = useCallback(() => {
    setLastUpdated(new Date());
    onRefresh();
  }, [onRefresh]);

  useEffect(() => {
    if (enabled) {
      refreshIntervalRef.current = setInterval(() => {
        handleManualRefresh();
      }, interval);
    } else {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
        refreshIntervalRef.current = null;
      }
    }

    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [enabled, interval, handleManualRefresh]);

  return {
    lastUpdated,
    handleManualRefresh,
  };
};

// ==================== 리포트 데이터 훅 ====================

interface UseReportOptions {
  period: ReportPeriod;
  fetchReports: (period: ReportPeriod) => Promise<ReportData[]>;
}

export const useReport = ({ period, fetchReports }: UseReportOptions) => {
  const [data, setData] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const reports = await fetchReports(period);
      setData(reports);
    } catch (err) {
      console.error('리포트 로드 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
    } finally {
      setLoading(false);
    }
  }, [period, fetchReports]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  return {
    data,
    loading,
    error,
    reload: loadReport,
  };
};

// ==================== 대시보드 데이터 훅 ====================

interface UseDashboardDataOptions<T> {
  fetchData: () => Promise<T>;
  defaultValue: T;
}

export const useDashboardData = <T,>({
  fetchData,
  defaultValue,
}: UseDashboardDataOptions<T>) => {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      setData(result);
    } catch (err) {
      console.error('데이터 로드 실패:', err);
      setError(err instanceof Error ? err.message : '알 수 없는 오류');
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [fetchData, defaultValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    reload: loadData,
  };
};

// ==================== 메시지 관리 훅 ====================

interface Message {
  type: 'success' | 'error' | '';
  text: string;
}

export const useMessage = (autoHideDuration = 5000) => {
  const [message, setMessage] = useState<Message>({ type: '', text: '' });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showMessage = useCallback((type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    
    // 기존 타이머 제거
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    // 자동 숨김
    if (autoHideDuration > 0) {
      timeoutRef.current = setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, autoHideDuration);
    }
  }, [autoHideDuration]);

  const hideMessage = useCallback(() => {
    setMessage({ type: '', text: '' });
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    message,
    showMessage,
    hideMessage,
  };
};

// ==================== 모달 관리 훅 ====================

export const useModal = (initialState = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};

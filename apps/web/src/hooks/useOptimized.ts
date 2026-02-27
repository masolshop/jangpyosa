import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * 컴포넌트 마운트 상태 추적 Hook
 */
export function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

/**
 * 디바운스 Hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

/**
 * 안전한 비동기 작업 Hook
 */
export function useSafeAsync() {
  const isMounted = useIsMounted();

  return useCallback(
    <T,>(promise: Promise<T>): Promise<T> => {
      return promise.then((value) => {
        if (isMounted()) {
          return value;
        }
        return Promise.reject(new Error('Component unmounted'));
      });
    },
    [isMounted]
  );
}

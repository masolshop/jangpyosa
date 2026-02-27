import { API_BASE } from './api';
import { getToken } from './auth';

/**
 * API 에러 타입
 */
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'APIError';
  }
}

/**
 * 최적화된 fetch 래퍼
 */
async function apiRequest<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  
  const config: RequestInit = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    cache: 'no-store',
  };

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new APIError(
        response.status,
        errorData.error || `HTTP ${response.status}: ${response.statusText}`,
        errorData
      );
    }

    // 204 No Content 처리
    if (response.status === 204) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    
    // 네트워크 에러 등
    throw new APIError(
      0,
      error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다'
    );
  }
}

/**
 * GET 요청
 */
export async function get<T = any>(endpoint: string, params?: Record<string, any>): Promise<T> {
  const queryString = params 
    ? '?' + new URLSearchParams(
        Object.entries(params).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString()
    : '';

  return apiRequest<T>(`${endpoint}${queryString}`, { method: 'GET' });
}

/**
 * POST 요청
 */
export async function post<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * PUT 요청
 */
export async function put<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * DELETE 요청
 */
export async function del<T = any>(endpoint: string): Promise<T> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}

/**
 * PATCH 요청
 */
export async function patch<T = any>(endpoint: string, data?: any): Promise<T> {
  return apiRequest<T>(endpoint, {
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  });
}

/**
 * 여러 요청 동시 처리 (Promise.all 래퍼)
 */
export async function parallel<T extends readonly unknown[]>(
  ...promises: { [K in keyof T]: Promise<T[K]> }
): Promise<T> {
  return Promise.all(promises) as Promise<T>;
}

/**
 * 순차적 요청 처리
 */
export async function sequential<T>(
  requests: (() => Promise<T>)[]
): Promise<T[]> {
  const results: T[] = [];
  
  for (const request of requests) {
    results.push(await request());
  }
  
  return results;
}

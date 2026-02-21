// API 기본 URL - Nginx proxy를 사용
export const API_BASE = "/api";

export async function apiFetch(path: string, opts: RequestInit = {}) {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const res = await fetch(`${API_BASE}${path}`, {
    ...opts,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(opts.headers || {}),
    },
    cache: "no-store",
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const error: any = new Error(data?.error || data?.message || "API_ERROR");
    error.data = data; // 백엔드에서 보낸 전체 응답 데이터 저장
    throw error;
  }
  return data;
}

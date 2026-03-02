"use client"

import { useEffect } from "react"

export default function PriorityPurchasePage() {
  useEffect(() => {
    // 외부 사이트로 리다이렉트
    window.location.href = "https://www.gachiilteo.or.kr/user/page/mn010203.do"
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ marginLeft: '350px' }}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">공공기관 우선구매제도 페이지로 이동 중...</p>
        <p className="text-sm text-gray-500 mt-2">
          자동으로 이동하지 않으면{" "}
          <a
            href="https://www.gachiilteo.or.kr/user/page/mn010203.do"
            className="text-blue-600 underline"
          >
            여기를 클릭
          </a>
          하세요.
        </p>
      </div>
    </div>
  )
}

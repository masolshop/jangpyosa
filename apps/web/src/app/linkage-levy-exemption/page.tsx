"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LinkageLevyExemptionRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/linkage-levy-exemption-system")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-600">페이지를 이동 중입니다...</p>
      </div>
    </div>
  )
}

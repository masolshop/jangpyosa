"use client"

import { useState, useEffect } from 'react'
import VideoCall from '@/components/VideoCall'

export default function EmployeeVideoMeetingPage() {
  const [mounted, setMounted] = useState(false)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // localStorage에서 사용자 정보 가져오기
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('employeeName') || '직원'
      const storedCompanyName = localStorage.getItem('companyName') || '회사'
      setUserName(storedUserName)
      
      // 기본 회의실 이름 생성
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
      setRoomName(`${storedCompanyName}-meeting-${dateStr}`)
    }
  }, [])

  const handleJoinMeeting = () => {
    if (roomName.trim()) {
      setIsInMeeting(true)
    }
  }

  const handleLeaveMeeting = () => {
    setIsInMeeting(false)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="p-4 max-w-4xl mx-auto">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">
            🎥 화상회의
          </h1>
          <p className="text-sm text-gray-600">
            관리자와 화상으로 연결하세요
          </p>
        </div>

        {!isInMeeting ? (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="space-y-4">
              {/* 내 이름 표시 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">👤</span>
                  <div>
                    <p className="text-xs text-gray-600">내 이름</p>
                    <p className="text-base font-semibold text-gray-900">{userName}</p>
                  </div>
                </div>
              </div>

              {/* 회의실 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  회의실 이름
                </label>
                <input
                  type="text"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base"
                  placeholder="관리자가 알려준 회의실 이름을 입력하세요"
                />
              </div>

              {/* 참가 버튼 */}
              <button
                onClick={handleJoinMeeting}
                disabled={!roomName.trim()}
                className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                🎥 회의 참가하기
              </button>

              {/* 안내 메시지 */}
              <div className="bg-yellow-50 p-4 rounded-lg">
                <div className="flex space-x-2">
                  <span className="text-xl">💡</span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 mb-2">
                      사용 방법
                    </p>
                    <ul className="space-y-1 text-xs text-gray-600">
                      <li>1️⃣ 관리자가 알려준 회의실 이름을 입력하세요</li>
                      <li>2️⃣ "회의 참가하기" 버튼을 누르세요</li>
                      <li>3️⃣ 카메라와 마이크 사용을 허용하세요</li>
                      <li>4️⃣ 화면에서 관리자를 만날 수 있어요</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 도움말 */}
              <div className="border-t pt-4">
                <p className="text-xs text-gray-500 text-center">
                  ❓ 문제가 있으면 관리자에게 연락하세요
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* 회의 정보 */}
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-600">현재 회의실</p>
                  <p className="text-base font-semibold text-gray-900">{roomName}</p>
                </div>
                <button
                  onClick={handleLeaveMeeting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors text-sm"
                >
                  나가기
                </button>
              </div>
            </div>

            {/* 화상회의 영역 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <VideoCall
                roomName={roomName}
                userName={userName}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

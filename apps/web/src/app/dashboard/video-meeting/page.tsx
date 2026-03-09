"use client"

import { useState, useEffect } from 'react'
import VideoCall from '@/components/VideoCall'

export default function DashboardVideoMeetingPage() {
  const [mounted, setMounted] = useState(false)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [companyName, setCompanyName] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // localStorage에서 사용자 정보 가져오기
    if (typeof window !== 'undefined') {
      const storedUserName = localStorage.getItem('userName') || '관리자'
      const storedCompanyName = localStorage.getItem('companyName') || '장표사닷컴'
      setUserName(storedUserName)
      setCompanyName(storedCompanyName)
      
      // 기본 회의실 이름 생성 (회사명-날짜-시간)
      const now = new Date()
      const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
      const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4)
      setRoomName(`${storedCompanyName}-meeting-${dateStr}-${timeStr}`)
    }
  }, [])

  const handleStartMeeting = () => {
    if (roomName.trim()) {
      setIsInMeeting(true)
    }
  }

  const handleEndMeeting = () => {
    setIsInMeeting(false)
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🎥 장애인직원 화상회의
        </h1>
        <p className="text-gray-600">
          자체 Jitsi Meet 서버를 활용한 무제한 화상회의 시스템
        </p>
      </div>

      {!isInMeeting ? (
        <div className="bg-white rounded-lg shadow-md p-8 max-w-2xl mx-auto">
          <div className="space-y-6">
            {/* 회사 정보 */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center space-x-2">
                <span className="text-2xl">🏢</span>
                <div>
                  <p className="text-sm text-gray-600">회사명</p>
                  <p className="text-lg font-semibold text-gray-900">{companyName}</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 아침-출근-확인-20260310"
              />
              <p className="mt-2 text-sm text-gray-500">
                💡 회의실 이름은 영문, 숫자, 하이픈(-)만 사용 가능합니다.
              </p>
            </div>

            {/* 사용자 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                참가자 이름
              </label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="예: 홍길동 관리자"
              />
            </div>

            {/* 회의 시작 버튼 */}
            <button
              onClick={handleStartMeeting}
              disabled={!roomName.trim()}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              <span>🎥</span>
              <span>화상회의 시작</span>
            </button>

            {/* 사용 안내 */}
            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center space-x-2">
                <span>📌</span>
                <span>사용 안내</span>
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>회의실 이름을 장애인 직원과 공유하여 초대하세요.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>시간 제한 없이 무제한으로 사용 가능합니다.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>화면 공유, 채팅, 녹화 기능을 모두 사용할 수 있습니다.</span>
                </li>
                <li className="flex items-start space-x-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span>자체 서버로 안전하게 운영됩니다 (meet.jangpyosa.com).</span>
                </li>
              </ul>
            </div>

            {/* 서버 정보 */}
            <div className="border-t pt-4">
              <p className="text-xs text-gray-500 text-center">
                🔒 자체 Jitsi Meet 서버 • 무제한 사용 • 워터마크 없음
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {/* 회의 정보 헤더 */}
          <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">현재 회의실</p>
              <p className="text-lg font-semibold text-gray-900">{roomName}</p>
            </div>
            <button
              onClick={handleEndMeeting}
              className="bg-red-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              회의 종료
            </button>
          </div>

          {/* 화상회의 영역 */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <VideoCall
              roomName={roomName}
              userName={userName}
            />
          </div>
        </div>
      )}
    </div>
  )
}

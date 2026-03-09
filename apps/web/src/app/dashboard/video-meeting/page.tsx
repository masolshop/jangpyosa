"use client"

import { useState, useEffect } from 'react'
import VideoCall from '@/components/VideoCall'

interface Employee {
  id: string
  name: string
  phone: string
  department?: string
  position?: string
}

interface Company {
  id: string
  name: string
}

export default function DashboardVideoMeetingPage() {
  const [mounted, setMounted] = useState(false)
  const [isInMeeting, setIsInMeeting] = useState(false)
  const [roomName, setRoomName] = useState('')
  const [userName, setUserName] = useState('')
  const [company, setCompany] = useState<Company | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setMounted(true)
    
    if (typeof window !== 'undefined') {
      // 사용자 정보 및 회사 정보 가져오기
      fetchUserAndCompany()
      // 직원 목록 가져오기
      fetchEmployees()
    }
  }, [])

  const fetchUserAndCompany = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('토큰이 없습니다')
        useFallback()
        return
      }

      // /auth/me 엔드포인트로 사용자 정보 가져오기
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        console.log('사용자 정보:', data)
        
        const userData = data.user
        setUserName(userData.name || '관리자')
        
        if (userData.company) {
          setCompany(userData.company)
          localStorage.setItem('companyName', userData.company.name)
          generateRoomName(userData.company.name)
        } else {
          console.log('회사 정보 없음, fallback 사용')
          useFallback()
        }
      } else {
        console.error('API 응답 실패:', response.status)
        useFallback()
      }
    } catch (error) {
      console.error('사용자/회사 정보 조회 실패:', error)
      useFallback()
    }
  }

  const useFallback = () => {
    const storedUserName = localStorage.getItem('userName') || '관리자'
    const storedCompanyName = localStorage.getItem('companyName') || '장표사닷컴'
    setUserName(storedUserName)
    setCompany({ id: '', name: storedCompanyName })
    generateRoomName(storedCompanyName)
  }

  const generateRoomName = (companyName: string) => {
    const now = new Date()
    const dateStr = now.toISOString().split('T')[0].replace(/-/g, '')
    const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '').substring(0, 4)
    setRoomName(`${companyName}-meeting-${dateStr}-${timeStr}`)
  }

  const fetchEmployees = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        console.log('토큰이 없습니다')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE}/employees`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('직원 목록:', data)
        setEmployees(data)
      } else {
        console.error('직원 목록 조회 실패:', response.status)
      }
    } catch (error) {
      console.error('직원 목록 조회 실패:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStartMeeting = () => {
    if (roomName.trim()) {
      setIsInMeeting(true)
      
      if (selectedEmployees.size > 0) {
        console.log('선택된 직원:', Array.from(selectedEmployees))
      }
    }
  }

  const handleEndMeeting = () => {
    setIsInMeeting(false)
  }

  const toggleEmployeeSelection = (employeeId: string) => {
    const newSelected = new Set(selectedEmployees)
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId)
    } else {
      newSelected.add(employeeId)
    }
    setSelectedEmployees(newSelected)
  }

  const copyRoomLink = () => {
    const link = `https://jangpyosa.com/employee/video-meeting?room=${encodeURIComponent(roomName)}`
    navigator.clipboard.writeText(link)
    alert('회의실 링크가 복사되었습니다!')
  }

  const copyRoomName = () => {
    navigator.clipboard.writeText(roomName)
    alert('회의실 이름이 복사되었습니다!')
  }

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.phone.includes(searchQuery) ||
    emp.department?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.position?.toLowerCase().includes(searchQuery.toLowerCase())
  )

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
          자체 Jitsi Meet 서버를 활용한 화상회의 시스템
        </p>
      </div>

      {!isInMeeting ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 회의실 설정 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="space-y-6">
                {/* 회사 정보 */}
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🏢</span>
                    <div>
                      <p className="text-sm text-gray-600">회사명</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {company?.name || '로딩 중...'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 회의실 이름 입력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회의실 이름
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={roomName}
                      onChange={(e) => setRoomName(e.target.value)}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="예: 아침-출근-확인-20260310"
                    />
                    <button
                      onClick={copyRoomName}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      복사
                    </button>
                  </div>
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

                {/* 회의실 링크 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회의실 링크
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={`https://jangpyosa.com/employee/video-meeting?room=${encodeURIComponent(roomName)}`}
                      readOnly
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-sm"
                    />
                    <button
                      onClick={copyRoomLink}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors whitespace-nowrap"
                    >
                      복사
                    </button>
                  </div>
                  <p className="mt-2 text-sm text-gray-500">
                    🔗 이 링크를 공유하면 회의실 이름이 자동으로 입력됩니다.
                  </p>
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
                      <span>회의실 이름 또는 링크를 장애인 직원과 공유하세요.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>오른쪽 직원 목록에서 초대할 직원을 선택할 수 있습니다.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>화면 공유, 채팅, 녹화 기능을 사용할 수 있습니다.</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className="text-green-500 mt-1">✓</span>
                      <span>자체 서버로 안전하게 운영됩니다 (meet.jangpyosa.com).</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽: 직원 리스트 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center justify-between">
                <span>👥 직원 초대</span>
                <span className="text-sm font-normal text-gray-500">
                  {selectedEmployees.size}명 선택
                </span>
              </h3>

              {/* 검색 */}
              <div className="mb-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="이름, 전화번호, 부서 검색..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* 직원 리스트 */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {loading ? (
                  <div className="text-center py-8 text-gray-500">
                    로딩 중...
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    {searchQuery ? '검색 결과가 없습니다.' : '등록된 직원이 없습니다.'}
                  </div>
                ) : (
                  filteredEmployees.map((employee) => (
                    <label
                      key={employee.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedEmployees.has(employee.id)
                          ? 'bg-blue-50 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEmployees.has(employee.id)}
                        onChange={() => toggleEmployeeSelection(employee.id)}
                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {employee.name}
                          {employee.position && (
                            <span className="ml-2 text-xs text-gray-500">
                              ({employee.position})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {employee.phone}
                        </p>
                        {employee.department && (
                          <p className="text-xs text-gray-400">
                            {employee.department}
                          </p>
                        )}
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* 선택 초기화 */}
              {selectedEmployees.size > 0 && (
                <button
                  onClick={() => setSelectedEmployees(new Set())}
                  className="w-full mt-4 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  선택 초기화
                </button>
              )}
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
              {selectedEmployees.size > 0 && (
                <p className="text-sm text-blue-600">
                  {selectedEmployees.size}명의 직원 초대됨
                </p>
              )}
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

'use client';

import { useState, useEffect } from 'react';

interface Employee {
  id: string;
  name: string;
  phone: string;
  department: string;
  position?: string;
}

export default function AdminVideoMeetingPage() {
  const [companyName, setCompanyName] = useState('');
  const [roomName, setRoomName] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isManager, setIsManager] = useState(false);

  useEffect(() => {
    fetchUserAndCompany();
  }, []);

  useEffect(() => {
    if (isManager) {
      console.log('✅ 관리자이므로 직원 목록 조회 시작');
      fetchEmployees();
    } else {
      console.log('⚠️ 관리자가 아니므로 직원 목록 조회 생략');
    }
  }, [isManager]);

  const fetchUserAndCompany = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ 토큰이 없습니다');
        setError('로그인이 필요합니다.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        console.error('❌ API 응답 실패:', response.status, response.statusText);
        throw new Error(`API 요청 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 사용자 정보:', data);

      if (data.user) {
        const userName = data.user.name || '관리자';
        const company = data.user.company?.name || '회사명';
        const userRole = data.user.role || '';
        const companyType = data.user.company?.type || '';

        console.log('📋 사용자 역할:', userRole);
        console.log('🏢 회사 타입:', companyType);
        console.log('🏢 회사명:', company);

        const isManagerUser = 
          userRole === 'BUYER' || 
          userRole === 'SUPPLIER' || 
          userRole === 'SUPER_ADMIN' ||
          companyType === 'BUYER' || 
          companyType === 'SUPPLIER';

        console.log('👤 관리자 여부:', isManagerUser);

        setParticipantName(userName);
        setCompanyName(company);
        setIsManager(isManagerUser);
        generateRoomName(company);
      }

    } catch (error: any) {
      console.error('❌ 사용자 정보 가져오기 실패:', error);
      setError('사용자 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
      if (!token) {
        console.log('❌ 토큰이 없습니다');
        return;
      }

      console.log('📡 /api/employees 호출 중...');
      const response = await fetch('/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('📡 /api/employees 응답:', response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 403) {
          console.log('⚠️ 직원 목록 조회 권한 없음 (403)');
          return;
        }
        throw new Error(`직원 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 직원 목록 응답:', data);

      const employeeList = data.employees || data;
      console.log('📋 직원 목록 배열:', employeeList);
      
      if (Array.isArray(employeeList)) {
        const employees: Employee[] = employeeList.map((emp: any) => ({
          id: emp.id,
          name: emp.name || '이름 없음',
          phone: emp.phone || '전화번호 없음',
          department: '부서', // 임시
          position: '직위', // 임시
        }));
        console.log('✅ 최종 직원 목록:', employees);
        setEmployees(employees);
      } else {
        console.error('❌ 직원 목록이 배열이 아닙니다:', employeeList);
      }

    } catch (error: any) {
      console.error('❌ 직원 목록 가져오기 실패:', error);
    }
  };

  const generateRoomName = (company: string) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 5).replace(':', '');
    const generated = `${company}-meeting-${date}-${time}`;
    setRoomName(generated);
  };

  const handleStartMeeting = () => {
    if (!roomName.trim()) {
      alert('회의실 이름을 입력해주세요.');
      return;
    }

    if (!participantName.trim()) {
      alert('참가자 이름을 입력해주세요.');
      return;
    }

    if (selectedEmployees.length > 0) {
      console.log('선택된 직원:', selectedEmployees);
    }

    const sanitizedRoomName = roomName.trim().replace(/\s+/g, '-');
    const sanitizedParticipantName = encodeURIComponent(participantName.trim());
    const jitsiUrl = `https://meet.jangpyosa.com/${sanitizedRoomName}#userInfo.displayName="${sanitizedParticipantName}"`;
    window.open(jitsiUrl, '_blank');
  };

  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  const copyRoomLink = () => {
    const sanitizedRoomName = roomName.trim().replace(/\s+/g, '-');
    const link = `https://jangpyosa.com/employee/video-meeting?room=${encodeURIComponent(sanitizedRoomName)}`;
    navigator.clipboard.writeText(link);
    alert('회의 링크가 복사되었습니다!');
  };

  const copyRoomName = () => {
    navigator.clipboard.writeText(roomName);
    alert('회의실 이름이 복사되었습니다!');
  };

  console.log('🎨 렌더링 - isManager:', isManager, ', employees:', employees.length, '명');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🎥 장애인직원 화상회의
          </h1>
          <p className="text-gray-600">
            화상회의를 시작하고 직원들을 초대하세요.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            관리자: {isManager ? '예' : '아니오'} | 직원: {employees.length}명
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className={!isManager ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                회의 설정
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회사명
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    disabled
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회의실 이름 *
                  </label>
                  <input
                    type="text"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    placeholder="예: 회사명-meeting-20260310-0800"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={copyRoomName}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                  >
                    📋 회의실 이름 복사
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    내 이름 *
                  </label>
                  <input
                    type="text"
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    placeholder="예: 홍길동"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    회의 링크 (직원 초대용)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={`https://jangpyosa.com/employee/video-meeting?room=${encodeURIComponent(roomName)}`}
                      disabled
                      className="flex-1 px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-sm"
                    />
                    <button
                      onClick={copyRoomLink}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      📋 복사
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleStartMeeting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg"
                >
                  화상회의 시작하기
                </button>
              </div>
            </div>
          </div>

          {isManager && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  직원 초대 ({selectedEmployees.length}명 선택)
                </h2>

                {/* 직원 목록 (검색창 제거) */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {employees.length > 0 ? (
                    employees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer border border-gray-200"
                      >
                        <input
                          type="checkbox"
                          checked={selectedEmployees.includes(emp.id)}
                          onChange={() => toggleEmployeeSelection(emp.id)}
                          className="mt-1 mr-3"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900">{emp.name}</p>
                          <p className="text-sm text-gray-600">{emp.phone}</p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm mb-2">등록된 직원이 없습니다.</p>
                      <p className="text-xs text-gray-400">
                        직원 관리 메뉴에서 직원을 먼저 등록해주세요.
                      </p>
                    </div>
                  )}
                </div>

                {selectedEmployees.length > 0 && (
                  <button
                    onClick={() => setSelectedEmployees([])}
                    className="w-full mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    선택 초기화
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📌 사용 방법</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 회의실 이름이 자동 생성됩니다 (수정 가능)</li>
            {isManager && <li>2. 오른쪽에서 초대할 직원을 선택하세요 (선택사항)</li>}
            <li>3. "화상회의 시작하기" 버튼을 클릭하세요</li>
            <li>4. 회의실 이름이나 링크를 복사하여 직원들에게 공유하세요</li>
            <li>5. 직원들은 공유받은 이름/링크로 회의에 참가할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

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
  const [filteredEmployees, setFilteredEmployees] = useState<Employee[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string>('');

  useEffect(() => {
    fetchUserAndCompany();
  }, []);

  useEffect(() => {
    console.log('🔍 [useEffect] userRole 변경됨:', userRole);
    // EMPLOYEE 역할이 아닌 경우에만 직원 목록 조회
    if (userRole && userRole !== 'EMPLOYEE') {
      console.log('✅ 직원 목록 조회 시작 (역할:', userRole, ')');
      fetchEmployees();
    } else if (userRole === 'EMPLOYEE') {
      console.log('⚠️ EMPLOYEE 역할이므로 직원 목록 조회 생략');
    }
  }, [userRole]);

  useEffect(() => {
    // 검색 필터링
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(
      (emp) =>
        emp.name.toLowerCase().includes(query) ||
        emp.phone.toLowerCase().includes(query) ||
        emp.department.toLowerCase().includes(query) ||
        emp.position?.toLowerCase().includes(query)
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  // 회사 정보 및 사용자 이름 가져오기
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
        const role = data.user.role || '';

        console.log('📋 사용자 역할:', role);
        console.log('🏢 회사명:', company);

        setParticipantName(userName);
        setCompanyName(company);
        setUserRole(role);

        // 회의실 이름 자동 생성
        generateRoomName(company);
      }

    } catch (error: any) {
      console.error('❌ 사용자 정보 가져오기 실패:', error);
      setError('사용자 정보를 가져오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 직원 목록 가져오기 (관리자만)
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
        // 403 오류는 조용히 처리 (권한 없음)
        if (response.status === 403) {
          console.log('⚠️ 직원 목록 조회 권한 없음 (403)');
          return;
        }
        throw new Error(`직원 목록 조회 실패: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ 직원 목록 응답:', data);

      // API 응답 구조에 맞게 수정
      const employeeList = data.employees || data;
      console.log('📋 직원 목록 배열:', employeeList);
      
      if (Array.isArray(employeeList)) {
        const employees: Employee[] = employeeList.map((emp: any) => ({
          id: emp.id,
          name: emp.name || '이름 없음',
          phone: emp.phone || '전화번호 없음',
          department: emp.department || '부서 미정',
          position: emp.position || '직위 미정',
        }));
        console.log('✅ 최종 직원 목록:', employees);
        setEmployees(employees);
        setFilteredEmployees(employees);
      } else {
        console.error('❌ 직원 목록이 배열이 아닙니다:', employeeList);
      }

    } catch (error: any) {
      console.error('❌ 직원 목록 가져오기 실패:', error);
    }
  };

  // 회의실 이름 자동 생성
  const generateRoomName = (company: string) => {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const time = now.toTimeString().slice(0, 5).replace(':', '');
    const generated = `${company}-meeting-${date}-${time}`;
    setRoomName(generated);
  };

  // 회의 시작
  const handleStartMeeting = () => {
    if (!roomName.trim()) {
      alert('회의실 이름을 입력해주세요.');
      return;
    }

    if (!participantName.trim()) {
      alert('참가자 이름을 입력해주세요.');
      return;
    }

    // 선택된 직원들에게 초대 링크 전송 (향후 구현)
    if (selectedEmployees.length > 0) {
      console.log('선택된 직원:', selectedEmployees);
      // TODO: SMS/알림톡 발송 API 호출
    }

    // Jitsi Meet 열기
    const sanitizedRoomName = roomName.trim().replace(/\s+/g, '-');
    const sanitizedParticipantName = encodeURIComponent(participantName.trim());
    const jitsiUrl = `https://meet.jangpyosa.com/${sanitizedRoomName}#userInfo.displayName="${sanitizedParticipantName}"`;
    window.open(jitsiUrl, '_blank');
  };

  // 직원 선택/해제
  const toggleEmployeeSelection = (id: string) => {
    setSelectedEmployees((prev) =>
      prev.includes(id) ? prev.filter((empId) => empId !== id) : [...prev, id]
    );
  };

  // 링크 복사
  const copyRoomLink = () => {
    const sanitizedRoomName = roomName.trim().replace(/\s+/g, '-');
    const link = `https://jangpyosa.com/employee/video-meeting?room=${encodeURIComponent(sanitizedRoomName)}`;
    navigator.clipboard.writeText(link);
    alert('회의 링크가 복사되었습니다!');
  };

  // 회의실 이름 복사
  const copyRoomName = () => {
    navigator.clipboard.writeText(roomName);
    alert('회의실 이름이 복사되었습니다!');
  };

  console.log('🎨 렌더링 - userRole:', userRole, ', employees:', employees.length, '명');

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
          {/* 디버그 정보 */}
          <p className="text-xs text-gray-400 mt-2">
            역할: {userRole || '로딩 중...'} | 직원: {employees.length}명
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽: 회의 설정 */}
          <div className={userRole === 'EMPLOYEE' ? 'lg:col-span-3' : 'lg:col-span-2'}>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                회의 설정
              </h2>
              <div className="space-y-4">
                {/* 회사명 */}
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

                {/* 회의실 이름 */}
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

                {/* 참가자 이름 */}
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

                {/* 회의 링크 */}
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

                {/* 회의 시작 버튼 */}
                <button
                  onClick={handleStartMeeting}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg"
                >
                  화상회의 시작하기
                </button>
              </div>
            </div>
          </div>

          {/* 오른쪽: 직원 초대 (관리자만 표시) */}
          {userRole !== 'EMPLOYEE' && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  직원 초대 ({selectedEmployees.length}명 선택)
                </h2>

                {/* 검색 */}
                <input
                  type="text"
                  placeholder="이름, 전화번호, 부서 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 mb-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />

                {/* 직원 목록 */}
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredEmployees.length > 0 ? (
                    filteredEmployees.map((emp) => (
                      <label
                        key={emp.id}
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg cursor-pointer"
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
                          <p className="text-sm text-gray-500">
                            {emp.department} · {emp.position}
                          </p>
                        </div>
                      </label>
                    ))
                  ) : (
                    <p className="text-gray-500 text-sm text-center py-4">
                      {searchQuery ? '검색 결과가 없습니다.' : '등록된 직원이 없습니다.'}
                    </p>
                  )}
                </div>

                {/* 초기화 버튼 */}
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

        {/* 안내 사항 */}
        <div className="mt-6 bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">📌 사용 방법</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. 회의실 이름이 자동 생성됩니다 (수정 가능)</li>
            {userRole !== 'EMPLOYEE' && <li>2. 초대할 직원을 선택하세요 (선택사항)</li>}
            <li>3. "화상회의 시작하기" 버튼을 클릭하세요</li>
            <li>4. 회의실 이름이나 링크를 복사하여 직원들에게 공유하세요</li>
            <li>5. 직원들은 공유받은 이름/링크로 회의에 참가할 수 있습니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

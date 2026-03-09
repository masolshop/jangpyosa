'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function VideoMeetingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roomParam = searchParams?.get('room');

  const [roomName, setRoomName] = useState(roomParam || '');
  const [participantName, setParticipantName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // localStorage에서 사용자 이름 불러오기
    const userName = localStorage.getItem('userName');
    if (userName) {
      setParticipantName(userName);
    }
    setLoading(false);
  }, []);

  const handleJoinMeeting = () => {
    if (!roomName.trim()) {
      alert('회의실 이름을 입력해주세요.');
      return;
    }

    if (!participantName.trim()) {
      alert('참가자 이름을 입력해주세요.');
      return;
    }

    // 회의실 이름에서 공백 제거 및 URL 안전 문자로 변환
    const sanitizedRoomName = roomName.trim().replace(/\s+/g, '-');
    const sanitizedParticipantName = encodeURIComponent(participantName.trim());

    // Jitsi Meet URL로 이동
    const jitsiUrl = `https://meet.jangpyosa.com/${sanitizedRoomName}#userInfo.displayName="${sanitizedParticipantName}"`;
    window.open(jitsiUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🎥 화상회의</h1>
          <p className="text-gray-600">
            관리자가 공유한 회의실 이름을 입력하고 참가하세요.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="space-y-6">
            {/* 회의실 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                회의실 이름 *
              </label>
              <input
                type="text"
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="예: 장표사닷컴-meeting-20260310-0800"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-sm text-gray-500">
                관리자가 알려준 회의실 이름을 정확히 입력해주세요.
              </p>
            </div>

            {/* 참가자 이름 입력 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                내 이름 *
              </label>
              <input
                type="text"
                value={participantName}
                onChange={(e) => setParticipantName(e.target.value)}
                placeholder="예: 홍길동"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* 참가 버튼 */}
            <button
              onClick={handleJoinMeeting}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors text-lg shadow-lg"
            >
              회의 참가하기
            </button>
          </div>

          {/* 안내 사항 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">📌 참가 방법</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>1. 관리자가 공유한 회의실 이름을 입력하세요</li>
              <li>2. 내 이름을 입력하세요</li>
              <li>3. "회의 참가하기" 버튼을 클릭하세요</li>
              <li>4. 카메라와 마이크 권한을 허용하세요</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function TestCachePage() {
  const timestamp = Date.now();

  return (
    <html lang="ko">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>캐시 우회 테스트</title>
      </head>
      <body style={{ fontFamily: 'Arial, sans-serif', maxWidth: '800px', margin: '50px auto', padding: '20px', background: '#f5f5f5' }}>
        <div style={{ background: 'white', padding: '30px', borderRadius: '10px', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}>
          <h1 style={{ color: '#333', marginBottom: '20px' }}>🔄 캐시 우회 테스트 페이지</h1>
          
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '5px', margin: '20px 0', borderLeft: '4px solid #0070f3' }}>
            <strong>⚠️ 주의:</strong> 브라우저가 이전 버전을 캐시하고 있습니다.<br />
            아래 버튼을 클릭하면 완전히 새로운 URL로 이동하여 캐시를 우회합니다.
          </div>

          <h2>📋 테스트 링크</h2>
          <p>
            <a 
              style={{ display: 'inline-block', background: '#0070f3', color: 'white', padding: '15px 30px', borderRadius: '5px', textDecoration: 'none', margin: '10px 5px', fontWeight: 'bold' }}
              href={`/employee/signup?nocache=${timestamp}`}
              target="_blank"
            >
              🚀 회원가입 페이지 열기 (캐시 우회)
            </a>
          </p>
          
          <p>
            <a 
              style={{ display: 'inline-block', background: '#ff6b6b', color: 'white', padding: '15px 30px', borderRadius: '5px', textDecoration: 'none', margin: '10px 5px', fontWeight: 'bold' }}
              href={`/employee/signup?v=${timestamp}&force=1`}
              target="_blank"
            >
              🔥 회원가입 페이지 열기 (강제)
            </a>
          </p>

          <h2>🎯 확인 사항</h2>
          <div style={{ background: '#e7f3ff', padding: '15px', borderRadius: '5px', margin: '20px 0', borderLeft: '4px solid #0070f3' }}>
            <p><strong>박스 형태 UI가 보여야 합니다:</strong></p>
            <ul>
              <li>3개의 박스가 가로로 나란히</li>
              <li>첫 번째 박스: 파란색 배경 + &quot;기업확인&quot;</li>
              <li>두 번째 박스: 회색 배경 + &quot;직원확인&quot;</li>
              <li>세 번째 박스: 회색 배경 + &quot;가입완료&quot;</li>
            </ul>
          </div>

          <h2>💡 여전히 이전 버전이 보인다면?</h2>
          <ol>
            <li>개발자 도구 열기 (F12)</li>
            <li>Network 탭 클릭</li>
            <li>&quot;Disable cache&quot; 체크</li>
            <li>페이지 새로고침 (Ctrl + Shift + R)</li>
          </ol>

          <h2>🔍 서버 확인</h2>
          <div style={{ background: '#f0f0f0', padding: '15px', borderRadius: '5px', margin: '20px 0', fontFamily: 'monospace', fontSize: '14px' }}>
            <p><strong>서버에서 직접 확인:</strong></p>
            <pre>curl localhost:3000/employee/signup | grep &quot;grid grid-cols-3&quot;</pre>
            <p style={{ color: '#28a745', marginTop: '10px' }}>✅ 결과: 서버는 새 코드를 제공하고 있습니다!</p>
          </div>

          <p style={{ marginTop: '30px', color: '#666', fontSize: '14px' }}>
            생성 시각: <span style={{ fontFamily: 'monospace', background: '#f0f0f0', padding: '5px 10px', borderRadius: '3px' }}>{new Date().toISOString()}</span>
          </p>
        </div>
      </body>
    </html>
  );
}

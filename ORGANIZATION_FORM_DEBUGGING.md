# 본부/지사 생성 폼 디버깅 가이드

## 📊 현재 상황
사용자가 `https://jangpyosa.com/admin/organizations` 페이지에서 본부를 생성하려고 할 때:
- 매니저 검색은 작동함 (검색 결과가 나타남)
- 하지만 검색 결과를 클릭해도 **선택이 안 됨**

## 🔍 폼 구조 (정상)
현재 폼은 다음 필드를 포함하고 있습니다:

1. ✅ **조직 유형 선택**: 본부 / 지사
2. ✅ **본부 선택** (지사 생성 시만 표시)
3. ✅ **조직명 입력**: 본부명 또는 지사명
4. ✅ **본부장/지사장 검색 및 선택**
   - 이름 또는 전화번호로 검색
   - 검색 결과 클릭으로 선택
5. ✅ **추천 매니저 검색** (선택사항)
6. ✅ **이메일 입력**
7. ✅ **메모 입력**

## 🐛 문제 원인 분석

### 코드 흐름
```typescript
// 1. 매니저 검색 (line 166-204)
const searchManagers = async () => {
  // API 호출: /sales/available-managers?search=검색어
  // 결과를 managerResults 배열에 저장
}

// 2. 매니저 선택 핸들러 (line 207-214)
const handleSelectManager = (manager: Manager) => {
  console.log('🔵 매니저 선택:', manager);
  setSelectedManager(manager);           // ← selectedManager 상태 업데이트
  setFormData({ ...formData, managerId: manager.id }); // ← formData.managerId 업데이트
  setManagerResults([]);                 // 검색 결과 숨김
  setManagerSearch('');                  // 검색어 초기화
  console.log('✅ 매니저 선택 완료:', { managerId: manager.id, name: manager.name });
};

// 3. UI 렌더링 (line 976-1011)
{selectedManager ? (
  // 선택된 매니저 표시 (초록색 박스)
  <div>✓ {selectedManager.name} 📞 {selectedManager.phone}</div>
) : (
  // 검색 UI 표시
  <input ... />
  <button onClick={searchManagers}>검색</button>
  {managerResults.map((manager) => (
    <div onClick={() => handleSelectManager(manager)}>
      {manager.name}
    </div>
  ))}
)}
```

### 가능한 원인

#### 1. **이벤트 버블링/캡처 문제**
- 클릭 이벤트가 상위 요소에 의해 차단될 수 있음
- 해결: `e.stopPropagation()` 추가

#### 2. **상태 업데이트 지연**
- React의 비동기 상태 업데이트로 인한 타이밍 이슈
- 해결: 콘솔 로그 확인 필요

#### 3. **CSS z-index 문제**
- 다른 요소가 클릭 영역을 가리고 있을 수 있음
- 해결: 개발자 도구로 요소 검사

#### 4. **브라우저 캐시**
- 오래된 JavaScript 코드가 실행 중일 수 있음
- 해결: 하드 리프레시 (Ctrl+Shift+R)

## 🔧 디버깅 단계

### Step 1: 브라우저 콘솔 확인
1. F12를 눌러 개발자 도구 열기
2. Console 탭 선택
3. 매니저 검색 후 검색 결과 클릭
4. 다음 로그가 나타나는지 확인:
   ```
   🔵 매니저 선택: {id: "...", name: "...", phone: "..."}
   ✅ 매니저 선택 완료: {managerId: "...", name: "..."}
   ```

### Step 2: 네트워크 요청 확인
1. 개발자 도구의 Network 탭 선택
2. 매니저 검색 시 다음 요청 확인:
   ```
   GET /sales/available-managers?search=김철수
   Status: 200 OK
   Response: { success: true, managers: [...] }
   ```

### Step 3: 요소 검사
1. 검색 결과 항목에 마우스 오른쪽 클릭
2. "검사" 또는 "Inspect" 선택
3. 다음 속성 확인:
   ```html
   <div 
     style="padding: 12px; cursor: pointer; ..."
     onClick={[Function]}
   >
   ```

## 📝 배포된 디버깅 코드

현재 서버에 다음 디버깅 로그가 추가되어 있습니다:

```typescript
// line 172
console.log('🔍 매니저 검색 시작:', managerSearch);

// line 188
console.log('✅ 검색 결과:', managers.length, '명', managers);

// line 195
console.error('❌ 검색 실패:', response.status);

// line 199
console.error('❌ 매니저 검색 에러:', error);

// line 208
console.log('🔵 매니저 선택:', manager);

// line 213
console.log('✅ 매니저 선택 완료:', { managerId: manager.id, name: manager.name });
```

## 🚀 다음 액션

### 사용자가 해야 할 일:
1. **캐시 클리어**: Ctrl+Shift+Delete → 전체 기간 → 캐시된 이미지 및 파일 삭제
2. **하드 리프레시**: Ctrl+Shift+R
3. **시크릿 모드 테스트**: Ctrl+Shift+N으로 시크릿 창 열기 → 로그인 → 테스트
4. **콘솔 로그 확인**: F12 → Console 탭 → 검색 및 선택 시 로그 복사 후 공유

### 개발자가 확인할 사항:
- API 응답 데이터 구조 검증
- 이벤트 핸들러 바인딩 확인
- CSS 스타일 충돌 검사
- React DevTools로 상태 변화 추적

## 💡 임시 해결책

만약 선택이 계속 안 된다면:
1. 매니저의 **전화번호를 직접 입력**하는 폼으로 변경
2. 또는 드롭다운 `<select>` 방식으로 변경


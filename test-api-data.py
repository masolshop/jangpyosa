import requests
import json

print("🔔 알림 시스템 및 데이터 테스트 시작...\n")

BASE_URL = "http://localhost:4000"

# 1. 페마연구소 관리자 로그인
print("1️⃣ 페마연구소 관리자 (김관리자)")
response = requests.post(f"{BASE_URL}/auth/login", json={
    "identifier": "01010000001",
    "password": "test1234"
})

if response.status_code != 200:
    print(f"❌ 로그인 실패: {response.status_code}")
    print(response.text[:200])
    exit(1)

data = response.json()
token = data.get("accessToken")
print(f"✅ 로그인 성공\n")

headers = {"Authorization": f"Bearer {token}"}

# 2. 알림 카운트 조회
print("📊 알림 카운트 조회...")
response = requests.get(f"{BASE_URL}/notifications/unread-count", headers=headers)
if response.status_code == 200:
    counts = response.json()
    print(f"   - 전체 알림: {counts.get('total', 0)}개")
    print(f"   - 공지사항: {counts.get('announcement', 0)}개")
    print(f"   - 업무지시: {counts.get('workOrder', 0)}개")
    print(f"   - 휴가: {counts.get('leave', 0)}개\n")
else:
    print(f"❌ 알림 조회 실패: {response.status_code}\n")

# 3. 공지사항 리스트
print("📢 공지사항 목록...")
response = requests.get(f"{BASE_URL}/announcements/list", headers=headers)
if response.status_code == 200:
    announcements_data = response.json()
    if isinstance(announcements_data, dict):
        announcements = announcements_data.get('announcements', [])
    else:
        announcements = announcements_data
    print(f"   총 {len(announcements)}개 발견")
    for ann in announcements[:3]:
        print(f"   - {ann.get('title')} (읽음: {ann.get('readCount', 0)}/{ann.get('totalCount', 0)}명)")
else:
    print(f"❌ 공지사항 조회 실패: {response.status_code}")
print()

# 4. 업무지시 리스트
print("📝 업무지시 목록...")
response = requests.get(f"{BASE_URL}/work-orders/list", headers=headers)
if response.status_code == 200:
    workOrders_data = response.json()
    if isinstance(workOrders_data, dict):
        workOrders = workOrders_data.get('workOrders', [])
    else:
        workOrders = workOrders_data
    print(f"   총 {len(workOrders)}개 발견")
    for wo in workOrders[:3]:
        print(f"   - {wo.get('title')} (확인: {wo.get('confirmedCount', 0)}/{wo.get('targetCount', 0)}명)")
else:
    print(f"❌ 업무지시 조회 실패: {response.status_code}")
print()

# 5. 휴가 신청 리스트
print("🏖️  휴가 신청 목록...")
response = requests.get(f"{BASE_URL}/leave/requests", headers=headers)
if response.status_code == 200:
    leaveRequests = response.json()
    if isinstance(leaveRequests, dict):
        leaves = leaveRequests.get('leaveRequests', [])
    else:
        leaves = leaveRequests
    
    print(f"   총 {len(leaves)}개 발견")
    for lr in leaves[:3]:
        print(f"   - {lr.get('employeeName', '알 수 없음')} {lr.get('reason', '')} ({lr.get('status', '')})")
else:
    print(f"❌ 휴가 조회 실패: {response.status_code}")
print()

# 6. 출퇴근 기록
print("🕐 출퇴근 기록 확인...")
response = requests.get(f"{BASE_URL}/attendance/company", headers=headers)
if response.status_code == 200:
    attendance = response.json()
    print(f"   회사명: {attendance.get('companyName', '알 수 없음')}")
    print(f"   직원 수: {attendance.get('employeeStats', {}).get('count', 0)}명")
else:
    print(f"❌ 출퇴근 조회 실패: {response.status_code}")
print()

print("✅ 모든 테스트 완료!\n")

# 직원 계정 테스트
print("="*50)
print("\n2️⃣ 직원 계정 테스트 (김철수 - 01010010001)\n")

response = requests.post(f"{BASE_URL}/auth/login", json={
    "identifier": "01010010001",
    "password": "test1234"
})

if response.status_code == 200:
    emp_data = response.json()
    emp_token = emp_data.get("accessToken")
    emp_headers = {"Authorization": f"Bearer {emp_token}"}
    print("✅ 로그인 성공\n")
    
    # 내 공지사항
    print("📢 내 공지사항...")
    response = requests.get(f"{BASE_URL}/announcements/my-announcements", headers=emp_headers)
    if response.status_code == 200:
        my_announcements = response.json()
        print(f"   총 {len(my_announcements)}개")
    else:
        print(f"❌ 조회 실패: {response.status_code}")
    
    # 내 업무지시
    print("\n📝 내 업무지시...")
    response = requests.get(f"{BASE_URL}/work-orders/my-work-orders", headers=emp_headers)
    if response.status_code == 200:
        my_workorders = response.json()
        print(f"   총 {len(my_workorders)}개")
    else:
        print(f"❌ 조회 실패: {response.status_code}")
    
    # 내 휴가 신청
    print("\n🏖️  내 휴가 신청...")
    response = requests.get(f"{BASE_URL}/leave/requests/my", headers=emp_headers)
    if response.status_code == 200:
        my_leaves = response.json()
        if isinstance(my_leaves, dict):
            leaves_list = my_leaves.get('leaveRequests', [])
        else:
            leaves_list = my_leaves
        print(f"   총 {len(leaves_list)}개")
    else:
        print(f"❌ 조회 실패: {response.status_code}")
    
    print("\n✅ 직원 테스트 완료!")
else:
    print(f"❌ 직원 로그인 실패: {response.status_code}")

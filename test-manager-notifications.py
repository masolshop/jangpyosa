#!/usr/bin/env python3
import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:4000"

def login(identifier, password):
    response = requests.post(f"{BASE_URL}/auth/login", json={
        "identifier": identifier,
        "password": password
    })
    if response.status_code == 200:
        return response.json().get("token")
    print(f"❌ 로그인 실패: {response.status_code} {response.text}")
    return None

print("=== 기업관리자 로그인 (김관리자) ===")
manager_token = login("01010000001", "test1234")
if not manager_token:
    exit(1)
print("✅ 관리자 로그인 성공")

# 관리자 알림 확인
print("\n=== 관리자 알림 현황 (Before) ===")
response = requests.get(f"{BASE_URL}/notifications/unread-count?byType=true",
                       headers={"Authorization": f"Bearer {manager_token}"})
print(json.dumps(response.json(), indent=2, ensure_ascii=False))

print("\n=== 관리자 최근 알림 5개 (Before) ===")
response = requests.get(f"{BASE_URL}/notifications?limit=5",
                       headers={"Authorization": f"Bearer {manager_token}"})
for notif in response.json().get("notifications", [])[:5]:
    print(f"- [{notif['type']}] {notif['title']}: {notif['message']}")

# 직원 로그인
print("\n=== 직원 로그인 (김철수) ===")
employee_token = login("01010010001", "test1234")
if not employee_token:
    exit(1)
print("✅ 직원 로그인 성공")

# 공지사항 조회 및 확인
print("\n=== 미확인 공지사항 조회 ===")
response = requests.get(f"{BASE_URL}/company-announcements?limit=5",
                       headers={"Authorization": f"Bearer {employee_token}"})
announcements = response.json().get("announcements", [])
for ann in announcements[:3]:
    print(f"- {ann['id']}: {ann['title']} (읽음: {ann.get('isRead', False)})")

if announcements and not announcements[0].get('isRead'):
    ann_id = announcements[0]['id']
    print(f"\n=== 공지 {ann_id} 확인 처리 ===")
    response = requests.post(f"{BASE_URL}/company-announcements/{ann_id}/read",
                           headers={"Authorization": f"Bearer {employee_token}"})
    print(response.json().get("message", "완료"))

# 업무지시 조회 및 완료
print("\n=== 미완료 업무지시 조회 ===")
response = requests.get(f"{BASE_URL}/work-orders?limit=5",
                       headers={"Authorization": f"Bearer {employee_token}"})
work_orders = response.json().get("workOrders", [])
for wo in work_orders[:3]:
    print(f"- {wo['id']}: {wo['title']} (완료: {wo.get('isConfirmed', False)})")

if work_orders and not work_orders[0].get('isConfirmed'):
    wo_id = work_orders[0]['id']
    print(f"\n=== 업무 {wo_id} 완료 처리 ===")
    response = requests.post(f"{BASE_URL}/work-orders/{wo_id}/confirm",
                           headers={"Authorization": f"Bearer {employee_token}"},
                           json={"note": "테스트 완료"})
    print(response.json().get("message", "완료"))

# 관리자 알림 재확인
print("\n=== 관리자 알림 현황 (After) ===")
response = requests.get(f"{BASE_URL}/notifications/unread-count?byType=true",
                       headers={"Authorization": f"Bearer {manager_token}"})
print(json.dumps(response.json(), indent=2, ensure_ascii=False))

print("\n=== 관리자 최근 알림 10개 (After) ===")
response = requests.get(f"{BASE_URL}/notifications?limit=10",
                       headers={"Authorization": f"Bearer {manager_token}"})
for notif in response.json().get("notifications", [])[:10]:
    print(f"- [{notif['type']}] {notif['title']}: {notif['message']} ({notif['createdAt']})")

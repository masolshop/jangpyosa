-- buyer01 회사 업데이트 (이미 존재)
UPDATE Company SET name = '삼성전자' WHERE id = 'cmpny_test_001';

-- buyer03 - 서울시청
INSERT OR REPLACE INTO Company (id, name, bizNo, type, representative, isVerified, createdAt, updatedAt)
VALUES ('company_buyer03', '서울시청', '2345678901', 'BUYER', '박정희', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO BuyerProfile (id, companyId, employeeCount, disabledCount, createdAt, updatedAt)
VALUES ('buyer_profile_03', 'company_buyer03', 100, 5, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO User (id, username, phone, passwordHash, name, role, companyId, isCompanyOwner, privacyAgreed, createdAt, updatedAt)
VALUES ('user_buyer03', 'buyer03', '01033333333', '$2a$10$rLzGXqvZ5KxME/iO7WJKy.VGXz6tVXqN7jKBXqRJKzVQXqZ5KxMEi', '박정희', 'BUYER', 'company_buyer03', 1, 1, datetime('now'), datetime('now'));

-- buyer05 - 교육부
INSERT OR REPLACE INTO Company (id, name, bizNo, type, representative, isVerified, createdAt, updatedAt)
VALUES ('company_buyer05', '교육부', '3456789012', 'BUYER', '최수영', 1, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO BuyerProfile (id, companyId, employeeCount, disabledCount, createdAt, updatedAt)
VALUES ('buyer_profile_05', 'company_buyer05', 150, 8, datetime('now'), datetime('now'));

INSERT OR REPLACE INTO User (id, username, phone, passwordHash, name, role, companyId, isCompanyOwner, privacyAgreed, createdAt, updatedAt)
VALUES ('user_buyer05', 'buyer05', '01055555555', '$2a$10$rLzGXqvZ5KxME/iO7WJKy.VGXz6tVXqN7jKBXqRJKzVQXqZ5KxMEi', '최수영', 'BUYER', 'company_buyer05', 1, 1, datetime('now'), datetime('now'));

-- 장애인 직원 생성 (각 회사에 5명씩)
-- buyer01 직원
INSERT OR IGNORE INTO DisabledEmployee (id, buyerId, name, residentNumber, phone, address, disabilityGrade, disabilityType, startDate, isActive, createdAt, updatedAt) VALUES
('emp_buyer01_1', 'buyer_prof_001', '김직원1', '9001011000001', '01020001111', '서울시 강남구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer01_2', 'buyer_prof_001', '김직원2', '9001011000002', '01020001112', '서울시 강남구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer01_3', 'buyer_prof_001', '김직원3', '9001011000003', '01020001113', '서울시 강남구', 'SEVERE', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer01_4', 'buyer_prof_001', '김직원4', '9001011000004', '01020001114', '서울시 강남구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer01_5', 'buyer_prof_001', '김직원5', '9001011000005', '01020001115', '서울시 강남구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now'));

-- buyer03 직원
INSERT OR IGNORE INTO DisabledEmployee (id, buyerId, name, residentNumber, phone, address, disabilityGrade, disabilityType, startDate, isActive, createdAt, updatedAt) VALUES
('emp_buyer03_1', 'buyer_profile_03', '박직원1', '9001011000006', '01020003331', '서울시 중구', 'MILD', '청각장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer03_2', 'buyer_profile_03', '박직원2', '9001011000007', '01020003332', '서울시 중구', 'MILD', '청각장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer03_3', 'buyer_profile_03', '박직원3', '9001011000008', '01020003333', '서울시 중구', 'SEVERE', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer03_4', 'buyer_profile_03', '박직원4', '9001011000009', '01020003334', '서울시 중구', 'MILD', '시각장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer03_5', 'buyer_profile_03', '박직원5', '9001011000010', '01020003335', '서울시 중구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now'));

-- buyer05 직원
INSERT OR IGNORE INTO DisabledEmployee (id, buyerId, name, residentNumber, phone, address, disabilityGrade, disabilityType, startDate, isActive, createdAt, updatedAt) VALUES
('emp_buyer05_1', 'buyer_profile_05', '최직원1', '9001011000011', '01020005551', '서울시 종로구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer05_2', 'buyer_profile_05', '최직원2', '9001011000012', '01020005552', '서울시 종로구', 'MILD', '청각장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer05_3', 'buyer_profile_05', '최직원3', '9001011000013', '01020005553', '서울시 종로구', 'SEVERE', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer05_4', 'buyer_profile_05', '최직원4', '9001011000014', '01020005554', '서울시 종로구', 'MILD', '시각장애', '2024-01-01', 1, datetime('now'), datetime('now')),
('emp_buyer05_5', 'buyer_profile_05', '최직원5', '9001011000015', '01020005555', '서울시 종로구', 'MILD', '지체장애', '2024-01-01', 1, datetime('now'), datetime('now'));

-- 공지사항 생성 (각 회사 3개씩)
-- buyer01 공지
INSERT OR IGNORE INTO CompanyAnnouncement (id, companyId, buyerId, title, content, priority, isActive, createdById, createdAt, updatedAt) VALUES
('ann_buyer01_1', 'cmpny_test_001', 'buyer_prof_001', '📢 2024년 장애인 고용 계획 공지', '올해 장애인 고용 목표 및 계획을 안내드립니다. 적극적인 참여 부탁드립니다.', 'URGENT', 1, 'user_test_001', datetime('now', '-2 days'), datetime('now')),
('ann_buyer01_2', 'cmpny_test_001', 'buyer_prof_001', '📋 월간 근무 현황 제출 안내', '매월 말일까지 근무 현황을 제출해주시기 바랍니다.', 'NORMAL', 1, 'user_test_001', datetime('now', '-1 days'), datetime('now')),
('ann_buyer01_3', 'cmpny_test_001', 'buyer_prof_001', '🎉 우수 직원 표창 안내', '이번 달 우수 직원 선정 결과를 안내드립니다. 축하드립니다!', 'LOW', 1, 'user_test_001', datetime('now'), datetime('now'));

-- buyer03 공지
INSERT OR IGNORE INTO CompanyAnnouncement (id, companyId, buyerId, title, content, priority, isActive, createdById, createdAt, updatedAt) VALUES
('ann_buyer03_1', 'company_buyer03', 'buyer_profile_03', '📢 2024년 장애인 고용 계획 공지', '올해 장애인 고용 목표 및 계획을 안내드립니다. 적극적인 참여 부탁드립니다.', 'URGENT', 1, 'user_buyer03', datetime('now', '-2 days'), datetime('now')),
('ann_buyer03_2', 'company_buyer03', 'buyer_profile_03', '📋 월간 근무 현황 제출 안내', '매월 말일까지 근무 현황을 제출해주시기 바랍니다.', 'NORMAL', 1, 'user_buyer03', datetime('now', '-1 days'), datetime('now')),
('ann_buyer03_3', 'company_buyer03', 'buyer_profile_03', '🎉 우수 직원 표창 안내', '이번 달 우수 직원 선정 결과를 안내드립니다. 축하드립니다!', 'LOW', 1, 'user_buyer03', datetime('now'), datetime('now'));

-- buyer05 공지
INSERT OR IGNORE INTO CompanyAnnouncement (id, companyId, buyerId, title, content, priority, isActive, createdById, createdAt, updatedAt) VALUES
('ann_buyer05_1', 'company_buyer05', 'buyer_profile_05', '📢 2024년 장애인 고용 계획 공지', '올해 장애인 고용 목표 및 계획을 안내드립니다. 적극적인 참여 부탁드립니다.', 'URGENT', 1, 'user_buyer05', datetime('now', '-2 days'), datetime('now')),
('ann_buyer05_2', 'company_buyer05', 'buyer_profile_05', '📋 월간 근무 현황 제출 안내', '매월 말일까지 근무 현황을 제출해주시기 바랍니다.', 'NORMAL', 1, 'user_buyer05', datetime('now', '-1 days'), datetime('now')),
('ann_buyer05_3', 'company_buyer05', 'buyer_profile_05', '🎉 우수 직원 표창 안내', '이번 달 우수 직원 선정 결과를 안내드립니다. 축하드립니다!', 'LOW', 1, 'user_buyer05', datetime('now'), datetime('now'));

-- 업무지시 생성 (각 회사 3개씩)
-- buyer01 업무지시
INSERT OR IGNORE INTO WorkOrder (id, companyId, buyerId, title, content, targetType, priority, status, dueDate, isActive, createdById, createdByName, createdAt, updatedAt) VALUES
('wo_buyer01_1', 'cmpny_test_001', 'buyer_prof_001', '🔧 안전교육 이수 필수', '모든 직원은 이번 주 금요일까지 안전교육을 이수해주시기 바랍니다.', 'ALL', 'URGENT', 'PENDING', datetime('now', '+3 days'), 1, 'user_test_001', '테스트 바이어', datetime('now', '-2 days'), datetime('now')),
('wo_buyer01_2', 'cmpny_test_001', 'buyer_prof_001', '📝 월간 근무일지 작성', '지난 달 근무일지를 작성하여 제출해주세요.', 'ALL', 'NORMAL', 'PENDING', datetime('now', '+7 days'), 1, 'user_test_001', '테스트 바이어', datetime('now', '-1 days'), datetime('now')),
('wo_buyer01_3', 'cmpny_test_001', 'buyer_prof_001', '🎓 직무교육 신청 안내', '다음 달 직무교육 신청을 받습니다. 희망자는 신청해주세요.', 'ALL', 'LOW', 'PENDING', datetime('now', '+14 days'), 1, 'user_test_001', '테스트 바이어', datetime('now'), datetime('now'));

-- buyer03 업무지시
INSERT OR IGNORE INTO WorkOrder (id, companyId, buyerId, title, content, targetType, priority, status, dueDate, isActive, createdById, createdByName, createdAt, updatedAt) VALUES
('wo_buyer03_1', 'company_buyer03', 'buyer_profile_03', '🔧 안전교육 이수 필수', '모든 직원은 이번 주 금요일까지 안전교육을 이수해주시기 바랍니다.', 'ALL', 'URGENT', 'PENDING', datetime('now', '+3 days'), 1, 'user_buyer03', '박정희', datetime('now', '-2 days'), datetime('now')),
('wo_buyer03_2', 'company_buyer03', 'buyer_profile_03', '📝 월간 근무일지 작성', '지난 달 근무일지를 작성하여 제출해주세요.', 'ALL', 'NORMAL', 'PENDING', datetime('now', '+7 days'), 1, 'user_buyer03', '박정희', datetime('now', '-1 days'), datetime('now')),
('wo_buyer03_3', 'company_buyer03', 'buyer_profile_03', '🎓 직무교육 신청 안내', '다음 달 직무교육 신청을 받습니다. 희망자는 신청해주세요.', 'ALL', 'LOW', 'PENDING', datetime('now', '+14 days'), 1, 'user_buyer03', '박정희', datetime('now'), datetime('now'));

-- buyer05 업무지시
INSERT OR IGNORE INTO WorkOrder (id, companyId, buyerId, title, content, targetType, priority, status, dueDate, isActive, createdById, createdByName, createdAt, updatedAt) VALUES
('wo_buyer05_1', 'company_buyer05', 'buyer_profile_05', '🔧 안전교육 이수 필수', '모든 직원은 이번 주 금요일까지 안전교육을 이수해주시기 바랍니다.', 'ALL', 'URGENT', 'PENDING', datetime('now', '+3 days'), 1, 'user_buyer05', '최수영', datetime('now', '-2 days'), datetime('now')),
('wo_buyer05_2', 'company_buyer05', 'buyer_profile_05', '📝 월간 근무일지 작성', '지난 달 근무일지를 작성하여 제출해주세요.', 'ALL', 'NORMAL', 'PENDING', datetime('now', '+7 days'), 1, 'user_buyer05', '최수영', datetime('now', '-1 days'), datetime('now')),
('wo_buyer05_3', 'company_buyer05', 'buyer_profile_05', '🎓 직무교육 신청 안내', '다음 달 직무교육 신청을 받습니다. 희망자는 신청해주세요.', 'ALL', 'LOW', 'PENDING', datetime('now', '+14 days'), 1, 'user_buyer05', '최수영', datetime('now'), datetime('now'));

-- 표준사업장 회사 중 buyerProfile이 없는 경우 추가
-- SQLite 문법 사용

-- 1. 표준사업장 회사 확인
SELECT 
  c.id as company_id,
  c.name as company_name,
  c.bizNo,
  c.type,
  s.id as supplier_profile_id,
  b.id as buyer_profile_id
FROM Company c
LEFT JOIN SupplierProfile s ON s.companyId = c.id
LEFT JOIN BuyerProfile b ON b.companyId = c.id
WHERE c.type = 'SUPPLIER';

-- 2. buyerProfile이 없는 표준사업장에 추가
INSERT INTO BuyerProfile (id, companyId, createdAt, updatedAt)
SELECT 
  lower(hex(randomblob(12))),  -- 랜덤 ID 생성
  c.id,
  datetime('now'),
  datetime('now')
FROM Company c
WHERE c.type = 'SUPPLIER'
  AND NOT EXISTS (
    SELECT 1 FROM BuyerProfile WHERE companyId = c.id
  );

-- 3. 결과 확인
SELECT 
  c.id,
  c.name,
  c.bizNo,
  (SELECT COUNT(*) FROM SupplierProfile WHERE companyId = c.id) as has_supplier_profile,
  (SELECT COUNT(*) FROM BuyerProfile WHERE companyId = c.id) as has_buyer_profile
FROM Company c
WHERE c.type = 'SUPPLIER';

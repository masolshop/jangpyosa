-- 중증장애인 근로시간을 60시간 이상으로 업데이트
-- 법적 기준: 중증장애인이 주 60시간 이상 근무해야 2배 인정

UPDATE DisabledEmployee
SET workHoursPerWeek = 60
WHERE severity = 'SEVERE' 
  AND resignDate IS NULL
  AND workHoursPerWeek < 60;

-- 업데이트 결과 확인
SELECT 
  severity,
  COUNT(*) as count,
  AVG(workHoursPerWeek) as avg_hours,
  MIN(workHoursPerWeek) as min_hours,
  MAX(workHoursPerWeek) as max_hours
FROM DisabledEmployee
WHERE resignDate IS NULL
GROUP BY severity;

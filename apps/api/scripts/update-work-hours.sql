-- 모든 장애인 직원의 월간 근로시간을 60-90시간으로 업데이트하고 급여 재계산
-- 최저시급: 10,320원

-- 강현우: 75시간
UPDATE DisabledEmployee SET monthlyWorkHours = 75, workHoursPerWeek = ROUND(75 / 4.33), monthlySalary = 75 * 10320 WHERE name = '강현우';

-- 김공무원01: 68시간
UPDATE DisabledEmployee SET monthlyWorkHours = 68, workHoursPerWeek = ROUND(68 / 4.33), monthlySalary = 68 * 10320 WHERE name = '김공무원01';

-- 김교사01: 72시간
UPDATE DisabledEmployee SET monthlyWorkHours = 72, workHoursPerWeek = ROUND(72 / 4.33), monthlySalary = 72 * 10320 WHERE name = '김교사01';

-- 박교육03: 85시간
UPDATE DisabledEmployee SET monthlyWorkHours = 85, workHoursPerWeek = ROUND(85 / 4.33), monthlySalary = 85 * 10320 WHERE name = '박교육03';

-- 박민수: 79시간
UPDATE DisabledEmployee SET monthlyWorkHours = 79, workHoursPerWeek = ROUND(79 / 4.33), monthlySalary = 79 * 10320 WHERE name = '박민수' AND phone = '01088880005';

-- 박민수03: 81시간
UPDATE DisabledEmployee SET monthlyWorkHours = 81, workHoursPerWeek = ROUND(81 / 4.33), monthlySalary = 81 * 10320 WHERE name = '박민수03';

-- 박영희: 63시간
UPDATE DisabledEmployee SET monthlyWorkHours = 63, workHoursPerWeek = ROUND(63 / 4.33), monthlySalary = 63 * 10320 WHERE name = '박영희';

-- 박태양: 82시간
UPDATE DisabledEmployee SET monthlyWorkHours = 82, workHoursPerWeek = ROUND(82 / 4.33), monthlySalary = 82 * 10320 WHERE name = '박태양';

-- 이서연02: 87시간
UPDATE DisabledEmployee SET monthlyWorkHours = 87, workHoursPerWeek = ROUND(87 / 4.33), monthlySalary = 87 * 10320 WHERE name = '이서연02';

-- 이선생02: 89시간
UPDATE DisabledEmployee SET monthlyWorkHours = 89, workHoursPerWeek = ROUND(89 / 4.33), monthlySalary = 89 * 10320 WHERE name = '이선생02';

-- 이철수: 68시간
UPDATE DisabledEmployee SET monthlyWorkHours = 68, workHoursPerWeek = ROUND(68 / 4.33), monthlySalary = 68 * 10320 WHERE name = '이철수';

-- 임유진: 88시간
UPDATE DisabledEmployee SET monthlyWorkHours = 88, workHoursPerWeek = ROUND(88 / 4.33), monthlySalary = 88 * 10320 WHERE name = '임유진';

-- 장지은: 80시간
UPDATE DisabledEmployee SET monthlyWorkHours = 80, workHoursPerWeek = ROUND(80 / 4.33), monthlySalary = 80 * 10320 WHERE name = '장지은';

-- 정미라: 86시간
UPDATE DisabledEmployee SET monthlyWorkHours = 86, workHoursPerWeek = ROUND(86 / 4.33), monthlySalary = 86 * 10320 WHERE name = '정미라';

-- 최동욱: 67시간
UPDATE DisabledEmployee SET monthlyWorkHours = 67, workHoursPerWeek = ROUND(67 / 4.33), monthlySalary = 67 * 10320 WHERE name = '최동욱';

-- 한수진: 84시간
UPDATE DisabledEmployee SET monthlyWorkHours = 84, workHoursPerWeek = ROUND(84 / 4.33), monthlySalary = 84 * 10320 WHERE name = '한수진';

-- 결과 확인
SELECT '=== 업데이트 완료 ===' as result;
SELECT name, monthlyWorkHours, monthlySalary, ROUND(monthlySalary / CAST(monthlyWorkHours AS REAL), 0) as hourly_wage 
FROM DisabledEmployee 
ORDER BY name;

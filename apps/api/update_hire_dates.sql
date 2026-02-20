-- Update hire dates for better incentive distribution

-- Update initial 10 employees
UPDATE Employee SET hireDate = '2024-06-01' WHERE name = '이철수';
UPDATE Employee SET hireDate = '2024-10-01' WHERE name = '정미라';

-- Update added employees to have recent hire dates
UPDATE Employee SET hireDate = '2024-12-01' WHERE name LIKE '%11%' OR name LIKE '%12%' OR name LIKE '%13%';
UPDATE Employee SET hireDate = '2025-01-01' WHERE name LIKE '%14%' OR name LIKE '%15%' OR name LIKE '%16%';
UPDATE Employee SET hireDate = '2025-02-01' WHERE name LIKE '%17%' OR name LIKE '%18%' OR name LIKE '%19%';
UPDATE Employee SET hireDate = '2025-03-01' WHERE name LIKE '%20%' OR name LIKE '%21%' OR name LIKE '%22%';
UPDATE Employee SET hireDate = '2025-04-01' WHERE name LIKE '%23%' OR name LIKE '%24%' OR name LIKE '%25%';
UPDATE Employee SET hireDate = '2025-05-01' WHERE name LIKE '%26%' OR name LIKE '%27%' OR name LIKE '%28%';
UPDATE Employee SET hireDate = '2025-06-01' WHERE name LIKE '%29%' OR name LIKE '%30%' OR name LIKE '%31%';
UPDATE Employee SET hireDate = '2025-07-01' WHERE name LIKE '%32%' OR name LIKE '%33%' OR name LIKE '%34%';
UPDATE Employee SET hireDate = '2025-08-01' WHERE name LIKE '%35%' OR name LIKE '%36%' OR name LIKE '%37%';
UPDATE Employee SET hireDate = '2025-09-01' WHERE name LIKE '%38%' OR name LIKE '%39%' OR name LIKE '%40%';
